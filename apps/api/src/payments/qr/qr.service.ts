import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionEngineService } from '../../transactions/transaction-engine.service';
import { BaasFactory } from '../baas/baas.factory';
import { GenerateQrDto } from './dto/generate-qr.dto';
import { PayQrDto } from './dto/pay-qr.dto';
import { TransactionType, WalletStatus, Prisma } from '@sindiwallet/db';

interface QrPayload {
  version: string;
  initiationMethod: string;
  merchant: { cvu: string; name: string; merchantId?: string };
  currency: string;
  amount: string;
  description: string;
  timestamp: string;
}

@Injectable()
export class QrService {
  constructor(
    private prisma: PrismaService,
    private engine: TransactionEngineService,
    private baasFactory: BaasFactory,
  ) {}

  async generateQr(orgId: string, userId: string, dto: GenerateQrDto) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { userId, orgId, status: WalletStatus.ACTIVE },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    if (!wallet) {
      throw new NotFoundException('No tenés una wallet activa');
    }

    if (!wallet.cvu) {
      throw new BadRequestException('Tu wallet no tiene CVU asignado');
    }

    const baas = this.baasFactory.create();
    const qrResult = await baas.generateQr({
      cvu: wallet.cvu,
      amount: dto.amount,
      description: dto.description ?? 'Cobro QR SindiWallet',
    });

    return {
      qrData: qrResult.qrData,
      qrImage: qrResult.qrImage,
      amount: dto.amount,
      cvu: wallet.cvu,
      recipientName: `${wallet.user.firstName} ${wallet.user.lastName}`,
    };
  }

  async decodeQr(qrData: string): Promise<QrPayload> {
    try {
      const decoded = Buffer.from(qrData, 'base64').toString('utf-8');
      return JSON.parse(decoded) as QrPayload;
    } catch {
      throw new BadRequestException('QR inválido o no reconocido');
    }
  }

  async payQr(orgId: string, payerId: string, dto: PayQrDto) {
    // 1. Decodificar QR
    const qrPayload = await this.decodeQr(dto.qrData);

    // 2. Obtener wallet del pagador
    const payerWallet = await this.prisma.wallet.findFirst({
      where: { userId: payerId, orgId, status: WalletStatus.ACTIVE },
    });

    if (!payerWallet) {
      throw new NotFoundException('No tenés una wallet activa');
    }

    // 3. Buscar wallet del receptor por CVU
    const receiverWallet = await this.prisma.wallet.findFirst({
      where: { cvu: qrPayload.merchant.cvu, orgId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });

    if (!receiverWallet) {
      throw new NotFoundException('Wallet del comercio no encontrada en esta organización');
    }

    if (payerWallet.id === receiverWallet.id) {
      throw new BadRequestException('No podés pagarte a vos mismo');
    }

    // 4. Calcular descuento afiliado si aplica
    let finalAmount = dto.amount;
    let discountPercent = new Prisma.Decimal(0);

    if (qrPayload.merchant.merchantId) {
      const merchant = await this.prisma.merchant.findFirst({
        where: {
          userId: receiverWallet.userId,
          orgId,
          isActive: true,
        },
      });

      if (merchant && merchant.discountPercent.greaterThan(0)) {
        discountPercent = merchant.discountPercent;
        const discount = (dto.amount * Number(discountPercent)) / 100;
        finalAmount = Math.round((dto.amount - discount) * 100) / 100;
      }
    }

    // 5. Ejecutar transferencia via engine
    const transaction = await this.engine.executeTransfer({
      orgId,
      senderId: payerId,
      receiverId: receiverWallet.user.id,
      walletFromId: payerWallet.id,
      walletToId: receiverWallet.id,
      amount: finalAmount,
      type: TransactionType.PAYMENT_QR,
      description: dto.description ?? qrPayload.description ?? 'Pago QR',
      idempotencyKey: dto.idempotencyKey,
    });

    return {
      transaction,
      originalAmount: dto.amount,
      discountPercent: Number(discountPercent),
      finalAmount,
      merchant: {
        name: `${receiverWallet.user.firstName} ${receiverWallet.user.lastName}`,
        cvu: receiverWallet.cvu,
      },
    };
  }

  async previewQr(orgId: string, payerId: string, qrData: string) {
    const qrPayload = await this.decodeQr(qrData);

    const receiverWallet = await this.prisma.wallet.findFirst({
      where: { cvu: qrPayload.merchant.cvu, orgId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    if (!receiverWallet) {
      throw new NotFoundException('Comercio no encontrado');
    }

    let discountPercent = 0;
    if (qrPayload.merchant.merchantId) {
      const merchant = await this.prisma.merchant.findFirst({
        where: { userId: receiverWallet.userId, orgId, isActive: true },
      });
      if (merchant) {
        discountPercent = Number(merchant.discountPercent);
      }
    }

    const amount = parseFloat(qrPayload.amount);
    const discount = (amount * discountPercent) / 100;
    const finalAmount = Math.round((amount - discount) * 100) / 100;

    return {
      merchant: {
        name: `${receiverWallet.user.firstName} ${receiverWallet.user.lastName}`,
        cvu: receiverWallet.cvu,
      },
      originalAmount: amount,
      discountPercent,
      discountAmount: discount,
      finalAmount,
      description: qrPayload.description,
    };
  }
}
