import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp } from './test-app.factory';
import {
  cleanDatabase,
  seedTestOrg,
  createTestAffiliate,
  createTestAdmin,
  createTestMerchant,
  authHeader,
} from './db-helpers';
import { randomUUID } from 'crypto';

describe('Full Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let org: any;

  // Actors
  let admin: Awaited<ReturnType<typeof createTestAdmin>>;
  let secondAffiliate: Awaited<ReturnType<typeof createTestAffiliate>>;
  let merchant: Awaited<ReturnType<typeof createTestMerchant>>;

  // State tracked across tests
  let newUserId: string;
  let newUserWalletId: string;
  let dueId: string;
  let loanId: string;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    await cleanDatabase(prisma);
    org = await seedTestOrg(prisma);
    admin = await createTestAdmin(prisma, org.id);
    secondAffiliate = await createTestAffiliate(prisma, org.id, { balance: 50000 });
    merchant = await createTestMerchant(prisma, org.id, { discount: 10, balance: 0 });
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  // ── Step 1: Register new user ──

  it('1. should register a new affiliate', async () => {
    const dto = {
      email: `fullflow-${Date.now()}@test.com`,
      password: 'Password123',
      firstName: 'Carlos',
      lastName: 'Gonzalez',
      dni: `${20000000 + Math.floor(Math.random() * 9999999)}`,
      orgId: org.id,
    };

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(dto)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.email).toBe(dto.email);
    expect(res.body.data.role).toBe('AFFILIATE');

    newUserId = res.body.data.id;
  });

  // ── Step 2: Get wallet (auto-created on register) ──

  it('2. should get the new user wallet', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/wallets/me')
      .set(authHeader(newUserId))
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBe(newUserId);
    expect(Number(res.body.data.balance)).toBe(0);
    expect(res.body.data.status).toBe('ACTIVE');

    newUserWalletId = res.body.data.id;
  });

  // ── Step 3: Second affiliate transfers 20000 to new user ──

  it('3. should receive transfer of 20000 from second affiliate', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/transactions/transfer')
      .set(authHeader(secondAffiliate.user.id))
      .send({
        walletToId: newUserWalletId,
        amount: 20000,
        description: 'Bienvenida al sindicato',
        idempotencyKey: randomUUID(),
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  // ── Step 4: Verify new user balance is 20000 ──

  it('4. should verify new user now has 20000', async () => {
    const wallet = await prisma.wallet.findUnique({
      where: { id: newUserWalletId },
    });

    expect(Number(wallet!.balance)).toBe(20000);
  });

  // ── Step 5: Admin creates a due type ──

  it('5. should create a due type (admin)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/dues')
      .set(authHeader(admin.user.id))
      .send({
        name: 'Cuota Solidaria',
        description: 'Cuota solidaria mensual',
        amount: 1500,
        frequency: 'MONTHLY',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    dueId = res.body.data.id;
  });

  // ── Step 6: New user pays due ──

  it('6. should pay due and verify balance decreased', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/dues/pay')
      .set(authHeader(newUserId))
      .send({
        dueId,
        period: '2026-04',
        idempotencyKey: randomUUID(),
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(1500);

    // Balance should be 20000 - 1500 = 18500
    const wallet = await prisma.wallet.findUnique({
      where: { id: newUserWalletId },
    });
    expect(Number(wallet!.balance)).toBe(18500);
  });

  // ── Step 7: Simulate loan ──

  it('7. should simulate a loan', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/loans/simulate')
      .set(authHeader(newUserId))
      .send({ amount: 10000, termMonths: 6 })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.scoring).toBeDefined();
    expect(res.body.data.monthlyPayment).toBeGreaterThan(0);
  });

  // ── Step 8: Request loan ──

  it('8. should request a loan of 10000 at 6 months', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/loans/request')
      .set(authHeader(newUserId))
      .send({
        amount: 10000,
        termMonths: 6,
        idempotencyKey: randomUUID(),
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPROVED');
    expect(res.body.data.installments).toHaveLength(6);

    loanId = res.body.data.id;
  });

  // ── Step 9: Admin disburses loan ──

  it('9. should disburse loan and increase wallet balance', async () => {
    const walletBefore = await prisma.wallet.findUnique({
      where: { id: newUserWalletId },
    });
    const balanceBefore = Number(walletBefore!.balance);

    const res = await request(app.getHttpServer())
      .post(`/api/v1/loans/${loanId}/disburse`)
      .set(authHeader(admin.user.id))
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ACTIVE');

    const walletAfter = await prisma.wallet.findUnique({
      where: { id: newUserWalletId },
    });
    // 18500 + 10000 = 28500
    expect(Number(walletAfter!.balance)).toBe(balanceBefore + 10000);
  });

  // ── Step 10: Pay first installment ──

  it('10. should pay first loan installment', async () => {
    const walletBefore = await prisma.wallet.findUnique({
      where: { id: newUserWalletId },
    });
    const balanceBefore = Number(walletBefore!.balance);

    const res = await request(app.getHttpServer())
      .post(`/api/v1/loans/${loanId}/pay-installment`)
      .set(authHeader(newUserId))
      .send({ idempotencyKey: randomUUID() })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.installmentNumber).toBe(1);
    expect(res.body.data.remainingInstallments).toBe(5);

    const walletAfter = await prisma.wallet.findUnique({
      where: { id: newUserWalletId },
    });
    const installmentAmount = Number(res.body.data.amount);
    expect(Number(walletAfter!.balance)).toBeCloseTo(
      balanceBefore - installmentAmount,
      0,
    );
  });

  // ── Step 11: Merchant generates QR ──

  let qrData: string;

  it('11. should generate QR from merchant', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments/qr/generate')
      .set(authHeader(merchant.user.id))
      .send({ amount: 3000, description: 'Compra full flow' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.qrData).toBeDefined();

    qrData = res.body.data.qrData;
  });

  // ── Step 12: New user pays QR ──

  it('12. should pay QR and verify balances', async () => {
    // Build QR with merchantId for discount
    const qrPayload = {
      version: '01',
      initiationMethod: '11',
      merchant: {
        cvu: merchant.wallet.cvu,
        name: 'SindiWallet',
        merchantId: merchant.merchant.id,
      },
      currency: '032',
      amount: '3000.00',
      description: 'Compra full flow',
      timestamp: new Date().toISOString(),
    };
    const qrWithMerchant = Buffer.from(JSON.stringify(qrPayload)).toString('base64');

    const userWalletBefore = await prisma.wallet.findUnique({
      where: { id: newUserWalletId },
    });
    const merchantWalletBefore = await prisma.wallet.findUnique({
      where: { id: merchant.wallet.id },
    });

    const userBalanceBefore = Number(userWalletBefore!.balance);
    const merchantBalanceBefore = Number(merchantWalletBefore!.balance);

    const res = await request(app.getHttpServer())
      .post('/api/v1/payments/qr/pay')
      .set(authHeader(newUserId))
      .send({
        qrData: qrWithMerchant,
        amount: 3000,
        idempotencyKey: randomUUID(),
        description: 'Pago full flow',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    // 3000 with 10% discount = 2700
    expect(res.body.data.finalAmount).toBe(2700);

    const userWalletAfter = await prisma.wallet.findUnique({
      where: { id: newUserWalletId },
    });
    const merchantWalletAfter = await prisma.wallet.findUnique({
      where: { id: merchant.wallet.id },
    });

    expect(Number(userWalletAfter!.balance)).toBe(userBalanceBefore - 2700);
    expect(Number(merchantWalletAfter!.balance)).toBe(merchantBalanceBefore + 2700);
  });

  // ── Step 13: List transactions ──

  it('13. should list transactions for the new user', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/transactions')
      .set(authHeader(newUserId))
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Should have at least: transfer-in, due-payment, loan-disbursement,
    // loan-repayment, qr-payment
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);
  });

  // ── Step 14: Verify final wallet state ──

  it('14. should have consistent final wallet state', async () => {
    const wallet = await prisma.wallet.findUnique({
      where: { id: newUserWalletId },
    });

    // Final balance must be positive (started at 0, got 20000, paid dues/installments/qr, got loan)
    expect(Number(wallet!.balance)).toBeGreaterThan(0);

    // Verify loan state
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { installments: { orderBy: { number: 'asc' } } },
    });
    expect(loan!.status).toBe('ACTIVE');
    expect(loan!.installments[0].status).toBe('PAID');
    expect(loan!.installments[1].status).toBe('PENDING');

    // Verify due payment exists
    const duePayment = await prisma.duePayment.findUnique({
      where: {
        dueId_userId_period: {
          dueId,
          userId: newUserId,
          period: '2026-04',
        },
      },
    });
    expect(duePayment).not.toBeNull();
    expect(duePayment!.status).toBe('PAID');
  });
});
