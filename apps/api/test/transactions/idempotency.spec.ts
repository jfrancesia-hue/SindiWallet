import { Test } from '@nestjs/testing';
import { IdempotencyService } from '../../src/transactions/idempotency.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('IdempotencyService', () => {
  let service: IdempotencyService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = {
      transaction: {
        findUnique: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        IdempotencyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(IdempotencyService);
    prisma = module.get(PrismaService);
  });

  it('should return null for new key (no existing transaction)', async () => {
    prisma.transaction.findUnique.mockResolvedValue(null);
    const result = await service.check('new-key');
    expect(result).toBeNull();
  });

  it('should return transaction for COMPLETED key', async () => {
    const tx = { id: 'tx-1', status: 'COMPLETED', idempotencyKey: 'key-1' };
    prisma.transaction.findUnique.mockResolvedValue(tx);
    const result = await service.check('key-1');
    expect(result).toEqual(tx);
  });

  it('should return null for FAILED key (allow retry)', async () => {
    prisma.transaction.findUnique.mockResolvedValue({
      id: 'tx-2', status: 'FAILED', idempotencyKey: 'key-2',
    });
    const result = await service.check('key-2');
    expect(result).toBeNull();
  });

  it('should return null for CANCELLED key (allow retry)', async () => {
    prisma.transaction.findUnique.mockResolvedValue({
      id: 'tx-3', status: 'CANCELLED', idempotencyKey: 'key-3',
    });
    const result = await service.check('key-3');
    expect(result).toBeNull();
  });

  it('should return transaction for PENDING key (prevent duplicate)', async () => {
    const tx = { id: 'tx-4', status: 'PENDING', idempotencyKey: 'key-4' };
    prisma.transaction.findUnique.mockResolvedValue(tx);
    const result = await service.check('key-4');
    expect(result).toEqual(tx);
  });

  it('should return transaction for PROCESSING key (prevent duplicate)', async () => {
    const tx = { id: 'tx-5', status: 'PROCESSING', idempotencyKey: 'key-5' };
    prisma.transaction.findUnique.mockResolvedValue(tx);
    const result = await service.check('key-5');
    expect(result).toEqual(tx);
  });
});
