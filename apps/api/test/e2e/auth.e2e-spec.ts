import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp } from './test-app.factory';
import { cleanDatabase, seedTestOrg } from './db-helpers';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let org: any;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    await cleanDatabase(prisma);
    org = await seedTestOrg(prisma);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  const validRegisterDto = () => ({
    email: `user-${Date.now()}@test.com`,
    password: 'Password123',
    firstName: 'Maria',
    lastName: 'Lopez',
    dni: `${20000000 + Math.floor(Math.random() * 9999999)}`,
    orgId: '', // set in tests
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new affiliate with valid data', async () => {
      const dto = { ...validRegisterDto(), orgId: org.id };

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(dto)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'AFFILIATE',
        orgId: org.id,
      });
      expect(res.body.data.id).toBeDefined();
    });

    it('should return 409 for duplicate email in same org', async () => {
      const dto = { ...validRegisterDto(), orgId: org.id };

      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(dto)
        .expect(201);

      // Second registration with same email
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...validRegisterDto(), email: dto.email, orgId: org.id })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('email');
    });

    it('should return 409 for duplicate DNI in same org', async () => {
      const dto = { ...validRegisterDto(), orgId: org.id };

      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(dto)
        .expect(201);

      // Second registration with same DNI
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...validRegisterDto(), dni: dto.dni, orgId: org.id })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('DNI');
    });

    it('should return 400 for invalid orgId', async () => {
      const dto = {
        ...validRegisterDto(),
        orgId: 'non-existent-org-id',
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(dto)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      const dto = {
        ...validRegisterDto(),
        orgId: org.id,
        email: 'not-an-email',
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(dto)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 for weak password (no uppercase)', async () => {
      const dto = {
        ...validRegisterDto(),
        orgId: org.id,
        password: 'password123',
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(dto)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 for short DNI', async () => {
      const dto = {
        ...validRegisterDto(),
        orgId: org.id,
        dni: '12345', // less than 7 digits
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(dto)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});
