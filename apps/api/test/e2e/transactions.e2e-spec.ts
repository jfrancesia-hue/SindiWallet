import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp } from './test-app.factory';
import {
  cleanDatabase,
  seedTestOrg,
  createTestAffiliate,
  authHeader,
} from './db-helpers';

describe('Transactions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let org: any;
  let sender: Awaited<ReturnType<typeof createTestAffiliate>>;
  let receiver: Awaited<ReturnType<typeof createTestAffiliate>>;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    await cleanDatabase(prisma);
    org = await seedTestOrg(prisma);
    sender = await createTestAffiliate(prisma, org.id, { balance: 10000 });
    receiver = await createTestAffiliate(prisma, org.id, { balance: 10000 });
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  describe('POST /api/v1/transactions/transfer', () => {
    it('should transfer between two affiliates and update balances', async () => {
      const idempotencyKey = randomUUID();

      const res = await request(app.getHttpServer())
        .post('/api/v1/transactions/transfer')
        .set(authHeader(sender.user.id))
        .send({
          walletToId: receiver.wallet.id,
          amount: 5000,
          description: 'Test transfer',
          idempotencyKey,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        type: 'TRANSFER_INTERNAL',
        status: 'COMPLETED',
        currency: 'ARS',
      });

      // Verify balances in DB
      const senderWallet = await prisma.wallet.findUnique({
        where: { id: sender.wallet.id },
      });
      const receiverWallet = await prisma.wallet.findUnique({
        where: { id: receiver.wallet.id },
      });

      expect(Number(senderWallet!.balance)).toBe(5000);
      expect(Number(receiverWallet!.balance)).toBe(15000);
    });

    it('should return 422 for insufficient balance', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/transactions/transfer')
        .set(authHeader(sender.user.id))
        .send({
          walletToId: receiver.wallet.id,
          amount: 999999,
          description: 'Too much',
          idempotencyKey: randomUUID(),
        })
        .expect(422);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Saldo insuficiente');
    });

    it('should return 400 for self-transfer', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/transactions/transfer')
        .set(authHeader(sender.user.id))
        .send({
          walletToId: sender.wallet.id,
          amount: 100,
          description: 'Self transfer',
          idempotencyKey: randomUUID(),
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should enforce idempotency - same key returns same transaction without double charge', async () => {
      const idempotencyKey = randomUUID();
      const transferDto = {
        walletToId: receiver.wallet.id,
        amount: 100,
        description: 'Idempotent transfer',
        idempotencyKey,
      };

      // Get sender balance before
      const balanceBefore = await prisma.wallet.findUnique({
        where: { id: sender.wallet.id },
      });

      // First call
      const res1 = await request(app.getHttpServer())
        .post('/api/v1/transactions/transfer')
        .set(authHeader(sender.user.id))
        .send(transferDto)
        .expect(201);

      // Second call with same idempotencyKey
      const res2 = await request(app.getHttpServer())
        .post('/api/v1/transactions/transfer')
        .set(authHeader(sender.user.id))
        .send(transferDto)
        .expect(201);

      // Same transaction ID returned
      expect(res1.body.data.id).toBe(res2.body.data.id);

      // Verify balance only decremented once
      const balanceAfter = await prisma.wallet.findUnique({
        where: { id: sender.wallet.id },
      });

      expect(
        Number(balanceBefore!.balance) - Number(balanceAfter!.balance),
      ).toBe(100);
    });
  });

  describe('GET /api/v1/transactions', () => {
    it('should return paginated list of transactions', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/transactions')
        .set(authHeader(sender.user.id))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.meta).toMatchObject({
        page: expect.any(Number),
        limit: expect.any(Number),
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
    });
  });

  describe('GET /api/v1/transactions/:id', () => {
    it('should return transaction detail', async () => {
      // Create a transaction first
      const idempotencyKey = randomUUID();
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/transactions/transfer')
        .set(authHeader(sender.user.id))
        .send({
          walletToId: receiver.wallet.id,
          amount: 50,
          description: 'Detail test',
          idempotencyKey,
        })
        .expect(201);

      const transactionId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .get(`/api/v1/transactions/${transactionId}`)
        .set(authHeader(sender.user.id))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(transactionId);
      expect(res.body.data.type).toBe('TRANSFER_INTERNAL');
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.sender).toBeDefined();
      expect(res.body.data.receiver).toBeDefined();
    });
  });

  describe('GET /api/v1/transactions/:id/receipt', () => {
    it('should return receipt for completed transaction', async () => {
      // Create a transaction first
      const idempotencyKey = randomUUID();
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/transactions/transfer')
        .set(authHeader(sender.user.id))
        .send({
          walletToId: receiver.wallet.id,
          amount: 25,
          description: 'Receipt test',
          idempotencyKey,
        })
        .expect(201);

      const transactionId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .get(`/api/v1/transactions/${transactionId}/receipt`)
        .set(authHeader(sender.user.id))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.receipt).toMatchObject({
        id: transactionId,
        type: 'TRANSFER_INTERNAL',
        status: 'COMPLETED',
        currency: 'ARS',
      });
      expect(res.body.data.receipt.sender).toBeDefined();
      expect(res.body.data.receipt.receiver).toBeDefined();
      expect(res.body.data.receipt.processedAt).toBeDefined();
    });
  });
});
