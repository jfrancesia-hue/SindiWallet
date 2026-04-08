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

describe('Wallets (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let org: any;
  let affiliate: Awaited<ReturnType<typeof createTestAffiliate>>;
  let admin: Awaited<ReturnType<typeof createTestAdmin>>;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    await cleanDatabase(prisma);
    org = await seedTestOrg(prisma);
    affiliate = await createTestAffiliate(prisma, org.id);
    admin = await createTestAdmin(prisma, org.id);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  describe('GET /api/v1/wallets/me', () => {
    it('should return the affiliate wallet', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/wallets/me')
        .set(authHeader(affiliate.user.id))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        id: affiliate.wallet.id,
        userId: affiliate.user.id,
        orgId: org.id,
        status: 'ACTIVE',
        currency: 'ARS',
      });
    });
  });

  describe('GET /api/v1/wallets', () => {
    it('should allow admin to list wallets with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/wallets')
        .set(authHeader(admin.user.id))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2); // affiliate + admin wallets
      expect(res.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
    });

    it('should return 403 when affiliate tries to list wallets', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/wallets')
        .set(authHeader(affiliate.user.id))
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/wallets/:id/freeze', () => {
    it('should allow admin to freeze a wallet', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/wallets/${affiliate.wallet.id}/freeze`)
        .set(authHeader(admin.user.id))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('FROZEN');
    });
  });

  describe('POST /api/v1/wallets/:id/unfreeze', () => {
    it('should allow admin to unfreeze a frozen wallet', async () => {
      // Wallet was frozen in the previous test
      const res = await request(app.getHttpServer())
        .post(`/api/v1/wallets/${affiliate.wallet.id}/unfreeze`)
        .set(authHeader(admin.user.id))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACTIVE');
    });
  });

  describe('GET /api/v1/wallets/:id/balance', () => {
    it('should allow admin to get wallet balance', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/wallets/${affiliate.wallet.id}/balance`)
        .set(authHeader(admin.user.id))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        id: affiliate.wallet.id,
        status: 'ACTIVE',
        currency: 'ARS',
      });
      expect(res.body.data.balance).toBeDefined();
    });
  });
});
