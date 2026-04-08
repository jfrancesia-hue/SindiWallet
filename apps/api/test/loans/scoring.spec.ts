import { Test } from '@nestjs/testing';
import { ScoringService } from '../../src/loans/scoring.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('ScoringService', () => {
  let service: ScoringService;
  let prisma: any;

  const ORG_ID = 'org-1';
  const USER_ID = 'user-1';

  beforeEach(async () => {
    const mockPrisma = {
      user: { findFirst: jest.fn() },
      duePayment: { findMany: jest.fn() },
      loan: { count: jest.fn() },
    };

    const module = await Test.createTestingModule({
      providers: [
        ScoringService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(ScoringService);
    prisma = module.get(PrismaService);
  });

  function mockUser(overrides: any = {}) {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    prisma.user.findFirst.mockResolvedValue({
      memberSince: twoYearsAgo,
      salary: 400000,
      kycStatus: 'APPROVED',
      createdAt: twoYearsAgo,
      ...overrides,
    });
  }

  function mockDuePayments(count: number, paidCount: number) {
    const payments = Array.from({ length: count }, (_, i) => ({
      status: i < paidCount ? 'PAID' : 'PENDING',
    }));
    prisma.duePayment.findMany.mockResolvedValue(payments);
  }

  function mockLoans(active = 0, paidOff = 0) {
    prisma.loan.count
      .mockResolvedValueOnce(active)   // active loans
      .mockResolvedValueOnce(paidOff); // paid off loans (only called if active === 0)
  }

  it('should return grade A for ideal affiliate', async () => {
    mockUser();
    mockDuePayments(12, 12); // 100% pagadas
    mockLoans(0, 1); // 1 préstamo pagado exitosamente

    const result = await service.evaluate(ORG_ID, USER_ID);

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.grade).toBe('A');
    expect(result.approved).toBe(true);
    expect(result.maxAmount).toBeGreaterThan(0);
  });

  it('should return grade F for user not found', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    const result = await service.evaluate(ORG_ID, USER_ID);

    expect(result.score).toBe(0);
    expect(result.grade).toBe('F');
    expect(result.approved).toBe(false);
    expect(result.maxAmount).toBe(0);
  });

  it('should penalize new affiliates (< 6 months)', async () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    mockUser({ memberSince: oneMonthAgo });
    mockDuePayments(1, 1);
    mockLoans(0, 0);

    const result = await service.evaluate(ORG_ID, USER_ID);

    expect(result.score).toBeLessThan(70);
    expect(result.factors.some((f: string) => f.includes('Antigüedad insuficiente'))).toBe(true);
  });

  it('should penalize unapproved KYC', async () => {
    mockUser({ kycStatus: 'PENDING' });
    mockDuePayments(12, 12);
    mockLoans(0, 0);

    const result = await service.evaluate(ORG_ID, USER_ID);

    expect(result.factors.some((f: string) => f.includes('KYC no aprobado'))).toBe(true);
  });

  it('should penalize active loans heavily', async () => {
    mockUser();
    mockDuePayments(12, 12);
    mockLoans(1); // 1 active loan

    const result = await service.evaluate(ORG_ID, USER_ID);

    expect(result.factors.some((f: string) => f.includes('préstamo(s) activo(s)'))).toBe(true);
    expect(result.score).toBeLessThan(80);
  });

  it('should reward good due payment history', async () => {
    mockUser();
    mockDuePayments(12, 11); // 91% paid
    mockLoans(0, 0);

    const result = await service.evaluate(ORG_ID, USER_ID);

    expect(result.factors.some((f: string) => f.includes('cuotas al día'))).toBe(true);
  });

  it('should penalize poor due payment history', async () => {
    mockUser();
    mockDuePayments(12, 5); // 41% paid
    mockLoans(0, 0);

    const result = await service.evaluate(ORG_ID, USER_ID);

    expect(result.factors.some((f: string) => f.includes('-10'))).toBe(true);
  });

  it('should cap maxAmount at 500000', async () => {
    mockUser({ salary: 1000000 }); // very high salary
    mockDuePayments(12, 12);
    mockLoans(0, 1);

    const result = await service.evaluate(ORG_ID, USER_ID);

    expect(result.maxAmount).toBeLessThanOrEqual(500000);
  });

  it('should clamp score between 0 and 100', async () => {
    // Worst case scenario
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    mockUser({ memberSince: oneWeekAgo, kycStatus: 'REJECTED' });
    mockDuePayments(12, 2); // very low payment rate
    mockLoans(2); // 2 active loans

    const result = await service.evaluate(ORG_ID, USER_ID);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
