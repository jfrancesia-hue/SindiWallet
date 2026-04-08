import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp } from './test-app.factory';
import {
  cleanDatabase,
  seedTestOrg,
  createTestAffiliate,
  createTestMerchant,
  authHeader,
} from './db-helpers';
import { randomUUID } from 'crypto';

describe('QR Payments (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let org: any;
  let affiliate: Awaited<ReturnType<typeof createTestAffiliate>>;
  let merchant: Awaited<ReturnType<typeof createTestMerchant>>;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    await cleanDatabase(prisma);
    org = await seedTestOrg(prisma);
    affiliate = await createTestAffiliate(prisma, org.id, { balance: 50000 });
    merchant = await createTestMerchant(prisma, org.id, { discount: 10, balance: 0 });
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  let qrData: string;

  describe('POST /api/v1/payments/qr/generate', () => {
    it('should generate a QR code for merchant', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/payments/qr/generate')
        .set(authHeader(merchant.user.id))
        .send({ amount: 5000, description: 'Cobro test' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.qrData).toBeDefined();
      expect(typeof res.body.data.qrData).toBe('string');
      expect(res.body.data.amount).toBe(5000);
      expect(res.body.data.cvu).toBe(merchant.wallet.cvu);

      qrData = res.body.data.qrData;
    });

    it('should return 400 for invalid amount', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/payments/qr/generate')
        .set(authHeader(merchant.user.id))
        .send({ amount: -100 })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/payments/qr/preview', () => {
    it('should preview QR with discount info', async () => {
      // Generate a QR with merchantId in payload for discount
      const qrPayload = {
        version: '01',
        initiationMethod: '11',
        merchant: {
          cvu: merchant.wallet.cvu,
          name: 'SindiWallet',
          merchantId: merchant.merchant.id,
        },
        currency: '032',
        amount: '5000.00',
        description: 'Cobro test',
        timestamp: new Date().toISOString(),
      };
      const qrWithMerchant = Buffer.from(JSON.stringify(qrPayload)).toString('base64');

      const res = await request(app.getHttpServer())
        .post('/api/v1/payments/qr/preview')
        .set(authHeader(affiliate.user.id))
        .send({ qrData: qrWithMerchant })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.originalAmount).toBe(5000);
      expect(res.body.data.discountPercent).toBe(10);
      expect(res.body.data.discountAmount).toBe(500);
      expect(res.body.data.finalAmount).toBe(4500);
      expect(res.body.data.merchant).toBeDefined();
      expect(res.body.data.merchant.cvu).toBe(merchant.wallet.cvu);
    });

    it('should return 400 for invalid QR data', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/payments/qr/preview')
        .set(authHeader(affiliate.user.id))
        .send({ qrData: 'not-valid-base64-json' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/payments/qr/pay', () => {
    it('should pay QR successfully with discount applied', async () => {
      // Build a QR payload with merchantId for discount
      const qrPayload = {
        version: '01',
        initiationMethod: '11',
        merchant: {
          cvu: merchant.wallet.cvu,
          name: 'SindiWallet',
          merchantId: merchant.merchant.id,
        },
        currency: '032',
        amount: '5000.00',
        description: 'Cobro QR con descuento',
        timestamp: new Date().toISOString(),
      };
      const qrWithMerchant = Buffer.from(JSON.stringify(qrPayload)).toString('base64');

      const affiliateBalanceBefore = Number(
        (await prisma.wallet.findUnique({ where: { id: affiliate.wallet.id } }))!.balance,
      );
      const merchantBalanceBefore = Number(
        (await prisma.wallet.findUnique({ where: { id: merchant.wallet.id } }))!.balance,
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/payments/qr/pay')
        .set(authHeader(affiliate.user.id))
        .send({
          qrData: qrWithMerchant,
          amount: 5000,
          idempotencyKey: randomUUID(),
          description: 'Pago QR test',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.originalAmount).toBe(5000);
      expect(res.body.data.discountPercent).toBe(10);
      expect(res.body.data.finalAmount).toBe(4500);
      expect(res.body.data.transaction).toBeDefined();

      // Verify balances in DB
      const affiliateWalletAfter = await prisma.wallet.findUnique({
        where: { id: affiliate.wallet.id },
      });
      const merchantWalletAfter = await prisma.wallet.findUnique({
        where: { id: merchant.wallet.id },
      });

      // Affiliate pays discounted amount (5000 - 10% = 4500)
      expect(Number(affiliateWalletAfter!.balance)).toBe(affiliateBalanceBefore - 4500);
      // Merchant receives discounted amount
      expect(Number(merchantWalletAfter!.balance)).toBe(merchantBalanceBefore + 4500);
    });

    it('should fail with insufficient funds', async () => {
      // Create an affiliate with very low balance
      const poorAffiliate = await createTestAffiliate(prisma, org.id, { balance: 10 });

      const qrPayload = {
        version: '01',
        initiationMethod: '11',
        merchant: {
          cvu: merchant.wallet.cvu,
          name: 'SindiWallet',
          merchantId: merchant.merchant.id,
        },
        currency: '032',
        amount: '5000.00',
        description: 'Cobro grande',
        timestamp: new Date().toISOString(),
      };
      const qrWithMerchant = Buffer.from(JSON.stringify(qrPayload)).toString('base64');

      const res = await request(app.getHttpServer())
        .post('/api/v1/payments/qr/pay')
        .set(authHeader(poorAffiliate.user.id))
        .send({
          qrData: qrWithMerchant,
          amount: 5000,
          idempotencyKey: randomUUID(),
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should fail when paying to self', async () => {
      // Merchant tries to pay their own QR
      const qrPayload = {
        version: '01',
        initiationMethod: '11',
        merchant: {
          cvu: merchant.wallet.cvu,
          name: 'SindiWallet',
        },
        currency: '032',
        amount: '100.00',
        description: 'Self pay',
        timestamp: new Date().toISOString(),
      };
      const selfQr = Buffer.from(JSON.stringify(qrPayload)).toString('base64');

      const res = await request(app.getHttpServer())
        .post('/api/v1/payments/qr/pay')
        .set(authHeader(merchant.user.id))
        .send({
          qrData: selfQr,
          amount: 100,
          idempotencyKey: randomUUID(),
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});
