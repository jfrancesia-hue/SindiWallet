import { Test } from '@nestjs/testing';
import { QrService } from '../../src/payments/qr/qr.service';
import { TransactionEngineService } from '../../src/transactions/transaction-engine.service';
import { BaasFactory } from '../../src/payments/baas/baas.factory';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('QrService', () => {
  let service: QrService;
  let prisma: any;
  let engine: any;
  let baasFactory: any;

  const ORG_ID = 'org-1';
  const USER_ID = 'user-1';

  beforeEach(async () => {
    const mockPrisma = {
      wallet: { findFirst: jest.fn() },
      merchant: { findFirst: jest.fn() },
    };

    const mockEngine = {
      executeTransfer: jest.fn(),
    };

    const mockBaasAdapter = {
      generateQr: jest.fn().mockResolvedValue({
        qrData: 'mock-qr-data',
        qrImage: 'mock-qr-image',
      }),
    };

    const mockFactory = {
      create: jest.fn().mockReturnValue(mockBaasAdapter),
    };

    const module = await Test.createTestingModule({
      providers: [
        QrService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TransactionEngineService, useValue: mockEngine },
        { provide: BaasFactory, useValue: mockFactory },
      ],
    }).compile();

    service = module.get(QrService);
    prisma = module.get(PrismaService);
    engine = module.get(TransactionEngineService);
    baasFactory = module.get(BaasFactory);
  });

  describe('generateQr', () => {
    it('should generate QR for active wallet', async () => {
      prisma.wallet.findFirst.mockResolvedValue({
        id: 'wallet-1', cvu: '0000003100000000000001', status: 'ACTIVE',
        user: { firstName: 'María', lastName: 'López' },
      });

      const result = await service.generateQr(ORG_ID, USER_ID, {
        amount: 5000, description: 'Test',
      });

      expect(result.qrData).toBeDefined();
      expect(result.amount).toBe(5000);
      expect(result.recipientName).toBe('María López');
    });

    it('should throw if no active wallet', async () => {
      prisma.wallet.findFirst.mockResolvedValue(null);

      await expect(
        service.generateQr(ORG_ID, USER_ID, { amount: 5000 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('decodeQr', () => {
    it('should decode valid QR data', async () => {
      const payload = {
        version: '01',
        merchant: { cvu: '0000003100000000000001', name: 'Test' },
        amount: '1500.00',
        description: 'Test payment',
      };
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');

      const result = await service.decodeQr(encoded);
      expect(result.merchant.cvu).toBe('0000003100000000000001');
      expect(result.amount).toBe('1500.00');
    });

    it('should throw on invalid QR data', async () => {
      await expect(service.decodeQr('not-valid-base64!!!')).rejects.toThrow(BadRequestException);
    });
  });

  describe('payQr', () => {
    it('should throw if payer has no wallet', async () => {
      prisma.wallet.findFirst.mockResolvedValue(null);

      const qrData = Buffer.from(JSON.stringify({
        version: '01',
        merchant: { cvu: '0000003100000000000001' },
        amount: '1500.00',
        description: 'Test',
      })).toString('base64');

      await expect(
        service.payQr(ORG_ID, USER_ID, {
          qrData, amount: 1500, idempotencyKey: 'key-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
