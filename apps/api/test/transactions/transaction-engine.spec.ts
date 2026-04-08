import { Test } from '@nestjs/testing';
import { TransactionEngineService } from '../../src/transactions/transaction-engine.service';
import { IdempotencyService } from '../../src/transactions/idempotency.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UnprocessableEntityException, BadRequestException } from '@nestjs/common';

describe('TransactionEngineService', () => {
  let engine: TransactionEngineService;
  let prisma: any;
  let idempotency: any;

  const ORG_ID = 'org-1';
  const WALLET_FROM_ID = 'wallet-from';
  const WALLET_TO_ID = 'wallet-to';

  const baseParams = {
    orgId: ORG_ID,
    senderId: 'user-1',
    receiverId: 'user-2',
    walletFromId: WALLET_FROM_ID,
    walletToId: WALLET_TO_ID,
    amount: 1000,
    type: 'TRANSFER_INTERNAL' as const,
    description: 'Test transfer',
    idempotencyKey: 'key-001',
  };

  beforeEach(async () => {
    const mockPrisma = {
      $transaction: jest.fn(),
      wallet: { update: jest.fn() },
      transaction: { create: jest.fn() },
    };

    const mockIdempotency = {
      check: jest.fn().mockResolvedValue(null),
    };

    const module = await Test.createTestingModule({
      providers: [
        TransactionEngineService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: IdempotencyService, useValue: mockIdempotency },
      ],
    }).compile();

    engine = module.get(TransactionEngineService);
    prisma = module.get(PrismaService);
    idempotency = module.get(IdempotencyService);
  });

  it('should execute a successful transfer', async () => {
    const mockTransaction = { id: 'tx-1', amount: 1000, status: 'COMPLETED' };

    prisma.$transaction.mockImplementation(async (fn: Function) => {
      const tx = {
        $queryRaw: jest.fn()
          .mockResolvedValueOnce([{ id: WALLET_FROM_ID, balance: 5000, status: 'ACTIVE', org_id: ORG_ID }])
          .mockResolvedValueOnce([{ id: WALLET_TO_ID, balance: 2000, status: 'ACTIVE', org_id: ORG_ID }]),
        wallet: { update: jest.fn() },
        transaction: { create: jest.fn().mockResolvedValue(mockTransaction) },
      };
      return fn(tx);
    });

    const result = await engine.executeTransfer(baseParams);
    expect(result).toEqual(mockTransaction);
    expect(idempotency.check).toHaveBeenCalledWith('key-001');
  });

  it('should return existing transaction if idempotent duplicate', async () => {
    const existingTx = { id: 'tx-existing', status: 'COMPLETED' };
    idempotency.check.mockResolvedValue(existingTx);

    const result = await engine.executeTransfer(baseParams);
    expect(result).toEqual(existingTx);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('should throw on zero amount', async () => {
    await expect(
      engine.executeTransfer({ ...baseParams, amount: 0 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw on negative amount', async () => {
    await expect(
      engine.executeTransfer({ ...baseParams, amount: -100 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw if sender wallet not found', async () => {
    prisma.$transaction.mockImplementation(async (fn: Function) => {
      const tx = {
        $queryRaw: jest.fn().mockResolvedValueOnce([]),
      };
      return fn(tx);
    });

    await expect(engine.executeTransfer(baseParams)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw if sender wallet is frozen', async () => {
    prisma.$transaction.mockImplementation(async (fn: Function) => {
      const tx = {
        $queryRaw: jest.fn()
          .mockResolvedValueOnce([{ id: WALLET_FROM_ID, balance: 5000, status: 'FROZEN', org_id: ORG_ID }])
          .mockResolvedValueOnce([{ id: WALLET_TO_ID, balance: 2000, status: 'ACTIVE', org_id: ORG_ID }]),
      };
      return fn(tx);
    });

    await expect(engine.executeTransfer(baseParams)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw if receiver wallet is frozen', async () => {
    prisma.$transaction.mockImplementation(async (fn: Function) => {
      const tx = {
        $queryRaw: jest.fn()
          .mockResolvedValueOnce([{ id: WALLET_FROM_ID, balance: 5000, status: 'ACTIVE', org_id: ORG_ID }])
          .mockResolvedValueOnce([{ id: WALLET_TO_ID, balance: 2000, status: 'FROZEN', org_id: ORG_ID }]),
      };
      return fn(tx);
    });

    await expect(engine.executeTransfer(baseParams)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw if insufficient balance', async () => {
    prisma.$transaction.mockImplementation(async (fn: Function) => {
      const tx = {
        $queryRaw: jest.fn()
          .mockResolvedValueOnce([{ id: WALLET_FROM_ID, balance: 500, status: 'ACTIVE', org_id: ORG_ID }])
          .mockResolvedValueOnce([{ id: WALLET_TO_ID, balance: 2000, status: 'ACTIVE', org_id: ORG_ID }]),
        wallet: { update: jest.fn() },
        transaction: { create: jest.fn() },
      };
      return fn(tx);
    });

    await expect(
      engine.executeTransfer({ ...baseParams, amount: 1000 }),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('should throw if wallets belong to different orgs', async () => {
    prisma.$transaction.mockImplementation(async (fn: Function) => {
      const tx = {
        $queryRaw: jest.fn()
          .mockResolvedValueOnce([{ id: WALLET_FROM_ID, balance: 5000, status: 'ACTIVE', org_id: ORG_ID }])
          .mockResolvedValueOnce([{ id: WALLET_TO_ID, balance: 2000, status: 'ACTIVE', org_id: 'other-org' }]),
      };
      return fn(tx);
    });

    await expect(engine.executeTransfer(baseParams)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });
});
