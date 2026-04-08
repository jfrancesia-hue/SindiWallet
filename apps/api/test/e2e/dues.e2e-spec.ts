import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp } from './test-app.factory';
import {
  cleanDatabase,
  seedTestOrg,
  createTestAffiliate,
  createTestAdmin,
  authHeader,
} from './db-helpers';
import { randomUUID } from 'crypto';

describe('Dues (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let org: any;
  let affiliate: Awaited<ReturnType<typeof createTestAffiliate>>;
  let admin: Awaited<ReturnType<typeof createTestAdmin>>;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    await cleanDatabase(prisma);
    org = await seedTestOrg(prisma);
    affiliate = await createTestAffiliate(prisma, org.id, { balance: 50000 });
    admin = await createTestAdmin(prisma, org.id);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  let dueId: string;
  const dueAmount = 1500;

  describe('POST /api/v1/dues (admin)', () => {
    it('should create a due type', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/dues')
        .set(authHeader(admin.user.id))
        .send({
          name: 'Aporte Sindical Ordinario',
          description: 'Cuota mensual obligatoria',
          amount: dueAmount,
          frequency: 'MONTHLY',
          isRetention: false,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Aporte Sindical Ordinario');
      expect(Number(res.body.data.amount)).toBe(dueAmount);
      expect(res.body.data.frequency).toBe('MONTHLY');
      expect(res.body.data.id).toBeDefined();

      dueId = res.body.data.id;
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/dues')
        .set(authHeader(admin.user.id))
        .send({ description: 'No name or amount' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/dues', () => {
    it('should list all due types for the organization', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dues')
        .set(authHeader(affiliate.user.id))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const found = res.body.data.find((d: any) => d.id === dueId);
      expect(found).toBeDefined();
      expect(found.name).toBe('Aporte Sindical Ordinario');
    });
  });

  describe('GET /api/v1/dues/:id', () => {
    it('should return due detail', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/dues/${dueId}`)
        .set(authHeader(affiliate.user.id))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(dueId);
      expect(res.body.data.name).toBe('Aporte Sindical Ordinario');
    });

    it('should return 404 for non-existent due', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/dues/${randomUUID()}`)
        .set(authHeader(affiliate.user.id))
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/dues/pay', () => {
    it('should pay due from wallet', async () => {
      const walletBefore = await prisma.wallet.findUnique({
        where: { id: affiliate.wallet.id },
      });
      const balanceBefore = Number(walletBefore!.balance);

      const res = await request(app.getHttpServer())
        .post('/api/v1/dues/pay')
        .set(authHeader(affiliate.user.id))
        .send({
          dueId,
          period: '2026-04',
          idempotencyKey: randomUUID(),
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.transaction).toBeDefined();
      expect(res.body.data.due).toBe('Aporte Sindical Ordinario');
      expect(res.body.data.period).toBe('2026-04');
      expect(res.body.data.amount).toBe(dueAmount);

      // Verify wallet balance decreased
      const walletAfter = await prisma.wallet.findUnique({
        where: { id: affiliate.wallet.id },
      });
      expect(Number(walletAfter!.balance)).toBe(balanceBefore - dueAmount);

      // Verify DuePayment record created in DB
      const duePayment = await prisma.duePayment.findUnique({
        where: {
          dueId_userId_period: {
            dueId,
            userId: affiliate.user.id,
            period: '2026-04',
          },
        },
      });
      expect(duePayment).not.toBeNull();
      expect(duePayment!.status).toBe('PAID');
      expect(duePayment!.paidAt).not.toBeNull();
    });

    it('should return 409 for duplicate period payment', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/dues/pay')
        .set(authHeader(affiliate.user.id))
        .send({
          dueId,
          period: '2026-04',
          idempotencyKey: randomUUID(),
        })
        .expect(409);

      expect(res.body.success).toBe(false);
    });

    it('should allow paying a different period', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/dues/pay')
        .set(authHeader(affiliate.user.id))
        .send({
          dueId,
          period: '2026-05',
          idempotencyKey: randomUUID(),
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.period).toBe('2026-05');
    });

    it('should fail with insufficient funds', async () => {
      const poorAffiliate = await createTestAffiliate(prisma, org.id, { balance: 1 });

      const res = await request(app.getHttpServer())
        .post('/api/v1/dues/pay')
        .set(authHeader(poorAffiliate.user.id))
        .send({
          dueId,
          period: '2026-04',
          idempotencyKey: randomUUID(),
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/dues/my/history', () => {
    it('should return payment history for current year', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dues/my/history')
        .set(authHeader(affiliate.user.id))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.year).toBe(new Date().getFullYear());
      expect(res.body.data.history).toBeDefined();
      expect(Array.isArray(res.body.data.history)).toBe(true);
      expect(res.body.data.totalPaid).toBeGreaterThan(0);
      expect(res.body.data.paidCount).toBeGreaterThanOrEqual(1);
    });

    it('should return history filtered by year', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dues/my/history?year=2026')
        .set(authHeader(affiliate.user.id))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.year).toBe(2026);
      expect(res.body.data.history).toBeDefined();

      // Should have the due we created with 12 month grid
      if (res.body.data.history.length > 0) {
        const dueHistory = res.body.data.history.find(
          (h: any) => h.dueId === dueId,
        );
        expect(dueHistory).toBeDefined();
        expect(dueHistory.months).toHaveLength(12);

        // April 2026 should be PAID
        const april = dueHistory.months.find(
          (m: any) => m.period === '2026-04',
        );
        expect(april.status).toBe('PAID');

        // May 2026 should be PAID
        const may = dueHistory.months.find(
          (m: any) => m.period === '2026-05',
        );
        expect(may.status).toBe('PAID');

        // January 2026 should be PENDING
        const january = dueHistory.months.find(
          (m: any) => m.period === '2026-01',
        );
        expect(january.status).toBe('PENDING');
      }
    });
  });
});
