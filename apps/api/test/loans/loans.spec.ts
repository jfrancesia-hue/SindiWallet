import { Test } from '@nestjs/testing';
import { LoansService } from '../../src/loans/loans.service';
import { ScoringService } from '../../src/loans/scoring.service';
import { TransactionEngineService } from '../../src/transactions/transaction-engine.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('LoansService', () => {
  let service: LoansService;
  let scoring: any;
  let prisma: any;

  const ORG_ID = 'org-1';
  const USER_ID = 'user-1';

  beforeEach(async () => {
    const mockPrisma = {
      loan: { create: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn() },
      wallet: { update: jest.fn() },
      transaction: { create: jest.fn() },
      loanInstallment: { update: jest.fn(), count: jest.fn() },
      $transaction: jest.fn((arr) => Promise.resolve(arr)),
    };

    const mockScoring = {
      evaluate: jest.fn(),
    };

    const mockEngine = {
      executeTransfer: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        LoansService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ScoringService, useValue: mockScoring },
        { provide: TransactionEngineService, useValue: mockEngine },
      ],
    }).compile();

    service = module.get(LoansService);
    scoring = module.get(ScoringService);
    prisma = module.get(PrismaService);
  });

  describe('simulate', () => {
    it('should return simulation with scoring', async () => {
      scoring.evaluate.mockResolvedValue({
        score: 82, grade: 'A', approved: true, maxAmount: 500000, factors: [],
      });

      const result = await service.simulate(ORG_ID, USER_ID, {
        amount: 100000,
        termMonths: 12,
      });

      expect(result.amount).toBe(100000);
      expect(result.termMonths).toBe(12);
      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalAmount).toBeGreaterThan(100000);
      expect(result.scoring.grade).toBe('A');
      expect(result.scoring.approved).toBe(true);
    });

    it('should show not approved if amount exceeds maxAmount', async () => {
      scoring.evaluate.mockResolvedValue({
        score: 55, grade: 'C', approved: true, maxAmount: 50000, factors: [],
      });

      const result = await service.simulate(ORG_ID, USER_ID, {
        amount: 200000,
        termMonths: 12,
      });

      expect(result.scoring.approved).toBe(false);
    });
  });

  describe('request', () => {
    it('should reject if scoring not approved', async () => {
      scoring.evaluate.mockResolvedValue({
        score: 20, grade: 'F', approved: false, maxAmount: 0, factors: [],
      });

      await expect(
        service.request(ORG_ID, USER_ID, {
          amount: 100000, termMonths: 12, idempotencyKey: 'key-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if amount exceeds maxAmount', async () => {
      scoring.evaluate.mockResolvedValue({
        score: 65, grade: 'B', approved: true, maxAmount: 100000, factors: [],
      });

      await expect(
        service.request(ORG_ID, USER_ID, {
          amount: 200000, termMonths: 12, idempotencyKey: 'key-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create loan with installments', async () => {
      scoring.evaluate.mockResolvedValue({
        score: 82, grade: 'A', approved: true, maxAmount: 500000, factors: [],
      });

      prisma.loan.create.mockResolvedValue({
        id: 'loan-1',
        amount: 100000,
        termMonths: 6,
        status: 'APPROVED',
        installments: Array.from({ length: 6 }, (_, i) => ({
          number: i + 1, amount: 18265, status: 'PENDING',
        })),
      });

      const result = await service.request(ORG_ID, USER_ID, {
        amount: 100000, termMonths: 6, idempotencyKey: 'key-1',
      });

      expect(result.status).toBe('APPROVED');
      expect(result.installments).toHaveLength(6);
      expect(prisma.loan.create).toHaveBeenCalled();
    });
  });
});
