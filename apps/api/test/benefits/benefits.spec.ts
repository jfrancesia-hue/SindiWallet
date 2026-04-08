import { Test } from '@nestjs/testing';
import { BenefitsService } from '../../src/benefits/benefits.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BenefitsService', () => {
  let service: BenefitsService;
  let prisma: any;

  const ORG_ID = 'org-1';

  beforeEach(async () => {
    const mockPrisma = {
      benefit: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn() },
      benefitRequest: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
      wallet: { update: jest.fn() },
      transaction: { create: jest.fn() },
      $transaction: jest.fn((arr) => Promise.resolve(arr)),
    };

    const module = await Test.createTestingModule({
      providers: [
        BenefitsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(BenefitsService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create a benefit', async () => {
      prisma.benefit.create.mockResolvedValue({
        id: 'b-1', name: 'Ayuda Escolar', category: 'Educación',
      });

      const result = await service.create(ORG_ID, {
        name: 'Ayuda Escolar', category: 'Educación', amount: 45000,
      });

      expect(result.name).toBe('Ayuda Escolar');
    });
  });

  describe('requestBenefit', () => {
    it('should throw if benefit not found', async () => {
      prisma.benefit.findFirst.mockResolvedValue(null);

      await expect(
        service.requestBenefit(ORG_ID, 'user-1', {
          benefitId: 'b-999', amount: 50000,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if amount exceeds maxAmount', async () => {
      prisma.benefit.findFirst.mockResolvedValue({
        id: 'b-1', maxAmount: 45000, requiresApproval: true, orgId: ORG_ID,
      });

      await expect(
        service.requestBenefit(ORG_ID, 'user-1', {
          benefitId: 'b-1', amount: 60000,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should auto-approve if no approval required', async () => {
      prisma.benefit.findFirst.mockResolvedValue({
        id: 'b-1', maxAmount: 50000, requiresApproval: false, orgId: ORG_ID,
      });
      prisma.benefitRequest.create.mockResolvedValue({
        id: 'req-1', status: 'APPROVED',
        benefit: { name: 'Ayuda', category: 'Edu' },
      });

      const result = await service.requestBenefit(ORG_ID, 'user-1', {
        benefitId: 'b-1', amount: 45000,
      });

      expect(result.status).toBe('APPROVED');
    });
  });

  describe('review', () => {
    it('should throw if request not found', async () => {
      prisma.benefitRequest.findFirst.mockResolvedValue(null);

      await expect(
        service.review(ORG_ID, 'req-999', 'admin-1', {
          decision: 'APPROVED',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should approve a pending request', async () => {
      prisma.benefitRequest.findFirst.mockResolvedValue({
        id: 'req-1', status: 'PENDING', orgId: ORG_ID,
      });
      prisma.benefitRequest.update.mockResolvedValue({
        id: 'req-1', status: 'APPROVED',
        benefit: { name: 'Ayuda' },
        user: { firstName: 'María', lastName: 'López' },
      });

      const result = await service.review(ORG_ID, 'req-1', 'admin-1', {
        decision: 'APPROVED',
      });

      expect(result.status).toBe('APPROVED');
    });
  });
});
