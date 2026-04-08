import { PrismaService } from '../../src/prisma/prisma.service';
import { randomUUID } from 'crypto';

export async function cleanDatabase(prisma: PrismaService) {
  // Delete in correct FK order
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.importJob.deleteMany();
  await prisma.report.deleteMany();
  await prisma.benefitRequest.deleteMany();
  await prisma.benefit.deleteMany();
  await prisma.loanInstallment.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.duePayment.deleteMany();
  await prisma.due.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

export async function seedTestOrg(prisma: PrismaService) {
  return prisma.organization.create({
    data: {
      name: 'ATE Test',
      slug: 'ate-test',
      cuit: '30-12345678-9',
      type: 'SINDICATO',
      isActive: true,
    },
  });
}

export async function createTestAffiliate(
  prisma: PrismaService,
  orgId: string,
  options?: { balance?: number; email?: string; dni?: string },
) {
  const uniqueId = randomUUID().substring(0, 8);
  const user = await prisma.user.create({
    data: {
      orgId,
      supabaseUserId: randomUUID(),
      email: options?.email || `affiliate-${uniqueId}@test.com`,
      firstName: 'Test',
      lastName: `Affiliate-${uniqueId}`,
      dni: options?.dni || `${20000000 + Math.floor(Math.random() * 9999999)}`,
      role: 'AFFILIATE',
      kycStatus: 'APPROVED',
      isActive: true,
    },
  });

  const wallet = await prisma.wallet.create({
    data: {
      orgId,
      userId: user.id,
      balance: options?.balance ?? 10000,
      currency: 'ARS',
      status: 'ACTIVE',
      cvu: `0000003100${Date.now().toString().slice(-12)}`,
      alias: `test.affiliate.${uniqueId}`,
    },
  });

  return { user, wallet };
}

export async function createTestAdmin(prisma: PrismaService, orgId: string) {
  const uniqueId = randomUUID().substring(0, 8);
  const user = await prisma.user.create({
    data: {
      orgId,
      supabaseUserId: randomUUID(),
      email: `admin-${uniqueId}@test.com`,
      firstName: 'Test',
      lastName: `Admin-${uniqueId}`,
      dni: `${30000000 + Math.floor(Math.random() * 9999999)}`,
      role: 'ADMIN',
      kycStatus: 'APPROVED',
      isActive: true,
    },
  });

  const wallet = await prisma.wallet.create({
    data: {
      orgId,
      userId: user.id,
      balance: 0,
      currency: 'ARS',
      status: 'ACTIVE',
    },
  });

  return { user, wallet };
}

export async function createTestMerchant(
  prisma: PrismaService,
  orgId: string,
  options?: { balance?: number; discount?: number },
) {
  const uniqueId = randomUUID().substring(0, 8);
  const user = await prisma.user.create({
    data: {
      orgId,
      supabaseUserId: randomUUID(),
      email: `merchant-${uniqueId}@test.com`,
      firstName: 'Test',
      lastName: `Merchant-${uniqueId}`,
      dni: `${40000000 + Math.floor(Math.random() * 9999999)}`,
      role: 'MERCHANT',
      kycStatus: 'APPROVED',
      isActive: true,
    },
  });

  const wallet = await prisma.wallet.create({
    data: {
      orgId,
      userId: user.id,
      balance: options?.balance ?? 0,
      currency: 'ARS',
      status: 'ACTIVE',
    },
  });

  const merchant = await prisma.merchant.create({
    data: {
      orgId,
      userId: user.id,
      businessName: `Comercio Test ${uniqueId}`,
      cuit: `20-${30000000 + Math.floor(Math.random() * 9999999)}-5`,
      category: 'GASTRONOMIA',
      affiliateDiscount: options?.discount ?? 10,
      isActive: true,
    },
  });

  return { user, wallet, merchant };
}

export function authHeader(userId: string) {
  return { 'x-test-user-id': userId };
}
