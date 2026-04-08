import { Test } from '@nestjs/testing';
import { WalletsService } from '../../src/wallets/wallets.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('WalletsService', () => {
  let service: WalletsService;
  let prisma: any;

  const ORG_ID = 'org-1';
  const USER_ID = 'user-1';

  beforeEach(async () => {
    const mockPrisma = {
      wallet: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        WalletsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(WalletsService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create a wallet for a user', async () => {
      prisma.wallet.findUnique.mockResolvedValue(null);
      prisma.wallet.create.mockResolvedValue({
        id: 'wallet-1', userId: USER_ID, balance: 0, status: 'ACTIVE',
      });

      const result = await service.create(ORG_ID, USER_ID);
      expect(result.id).toBe('wallet-1');
      expect(prisma.wallet.create).toHaveBeenCalled();
    });

    it('should throw if user already has a wallet', async () => {
      prisma.wallet.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create(ORG_ID, USER_ID)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByUser', () => {
    it('should return wallet for user', async () => {
      prisma.wallet.findFirst.mockResolvedValue({ id: 'wallet-1', userId: USER_ID });

      const result = await service.findByUser(ORG_ID, USER_ID);
      expect(result.id).toBe('wallet-1');
    });

    it('should throw if wallet not found', async () => {
      prisma.wallet.findFirst.mockResolvedValue(null);

      await expect(service.findByUser(ORG_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('freeze', () => {
    it('should freeze an active wallet', async () => {
      prisma.wallet.findFirst.mockResolvedValue({
        id: 'wallet-1', status: 'ACTIVE', orgId: ORG_ID,
        user: { id: USER_ID, firstName: 'Test', lastName: 'User', email: 'test@test.com' },
      });
      prisma.wallet.update.mockResolvedValue({ id: 'wallet-1', status: 'FROZEN' });

      const result = await service.freeze(ORG_ID, 'wallet-1');
      expect(result.status).toBe('FROZEN');
    });

    it('should throw if wallet already frozen', async () => {
      prisma.wallet.findFirst.mockResolvedValue({
        id: 'wallet-1', status: 'FROZEN', orgId: ORG_ID,
        user: { id: USER_ID, firstName: 'Test', lastName: 'User', email: 'test@test.com' },
      });

      await expect(service.freeze(ORG_ID, 'wallet-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw if wallet is closed', async () => {
      prisma.wallet.findFirst.mockResolvedValue({
        id: 'wallet-1', status: 'CLOSED', orgId: ORG_ID,
        user: { id: USER_ID, firstName: 'Test', lastName: 'User', email: 'test@test.com' },
      });

      await expect(service.freeze(ORG_ID, 'wallet-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('unfreeze', () => {
    it('should unfreeze a frozen wallet', async () => {
      prisma.wallet.findFirst.mockResolvedValue({
        id: 'wallet-1', status: 'FROZEN', orgId: ORG_ID,
        user: { id: USER_ID, firstName: 'Test', lastName: 'User', email: 'test@test.com' },
      });
      prisma.wallet.update.mockResolvedValue({ id: 'wallet-1', status: 'ACTIVE' });

      const result = await service.unfreeze(ORG_ID, 'wallet-1');
      expect(result.status).toBe('ACTIVE');
    });

    it('should throw if wallet is not frozen', async () => {
      prisma.wallet.findFirst.mockResolvedValue({
        id: 'wallet-1', status: 'ACTIVE', orgId: ORG_ID,
        user: { id: USER_ID, firstName: 'Test', lastName: 'User', email: 'test@test.com' },
      });

      await expect(service.unfreeze(ORG_ID, 'wallet-1')).rejects.toThrow(BadRequestException);
    });
  });
});
