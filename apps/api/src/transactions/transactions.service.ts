import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionEngineService } from './transaction-engine.service';
import { TransferDto } from './dto/transfer.dto';
import { TransferCvuDto } from './dto/transfer-cvu.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { TransactionType, TransactionStatus, Prisma } from '@sindiwallet/db';
import { ComplianceService } from '../common/compliance/compliance.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private engine: TransactionEngineService,
    private compliance: ComplianceService,
  ) {}

  async transfer(orgId: string, senderId: string, dto: TransferDto) {
    // Obtener wallet del sender
    const senderWallet = await this.prisma.wallet.findFirst({
      where: { userId: senderId, orgId },
    });

    if (!senderWallet) {
      throw new NotFoundException('No tenés una wallet activa');
    }

    // Obtener wallet destino
    const receiverWallet = await this.prisma.wallet.findFirst({
      where: { id: dto.walletToId, orgId },
      include: { user: { select: { id: true } } },
    });

    if (!receiverWallet) {
      throw new NotFoundException('Wallet destino no encontrada en esta organización');
    }

    if (senderWallet.id === receiverWallet.id) {
      throw new BadRequestException('No podés transferirte a vos mismo');
    }

    await this.compliance.validateTransaction({
      userId: senderId,
      orgId,
      amount: dto.amount,
      type: 'TRANSFER_INTERNAL',
    });

    return this.engine.executeTransfer({
      orgId,
      senderId,
      receiverId: receiverWallet.user.id,
      walletFromId: senderWallet.id,
      walletToId: receiverWallet.id,
      amount: dto.amount,
      type: TransactionType.TRANSFER_INTERNAL,
      description: dto.description,
      idempotencyKey: dto.idempotencyKey,
    });
  }

  async transferCvu(orgId: string, senderId: string, dto: TransferCvuDto) {
    // Compliance check
    await this.compliance.validateTransaction({
      userId: senderId,
      orgId,
      amount: dto.amount,
      type: 'TRANSFER_CVU',
    });

    return this.prisma.$transaction(
      async (tx) => {
        // Lock wallet with SELECT FOR UPDATE
        const wallets = await tx.$queryRaw<
          Array<{ id: string; balance: any; cvu: string | null; status: string }>
        >`SELECT id, balance, cvu, status FROM wallets WHERE user_id = ${senderId} AND org_id = ${orgId} FOR UPDATE`;

        if (!wallets || wallets.length === 0) {
          throw new NotFoundException('No tenés una wallet activa');
        }

        const senderWallet = wallets[0]!;

        if (!senderWallet.cvu) {
          throw new BadRequestException('Tu wallet no tiene CVU asignado');
        }

        if (senderWallet.status !== 'ACTIVE') {
          throw new BadRequestException('Tu wallet no está activa');
        }

        if (senderWallet.cvu === dto.destinationCvu) {
          throw new BadRequestException('No podés transferirte a tu propio CVU');
        }

        const amount = new Prisma.Decimal(dto.amount);
        const balance = new Prisma.Decimal(senderWallet.balance);
        if (balance.lessThan(amount)) {
          throw new BadRequestException(
            `Saldo insuficiente. Disponible: ${balance.toFixed(2)} ARS`,
          );
        }

        // Decrement balance
        await tx.wallet.update({
          where: { id: senderWallet.id },
          data: { balance: { decrement: amount } },
        });

        // Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            orgId,
            idempotencyKey: dto.idempotencyKey,
            type: TransactionType.TRANSFER_CVU,
            status: TransactionStatus.COMPLETED,
            amount,
            fee: new Prisma.Decimal(0),
            currency: 'ARS',
            description: dto.description,
            senderId,
            walletFromId: senderWallet.id,
            reference: dto.destinationCvu,
            baasTransactionId: `MOCK_${Date.now()}`,
            processedAt: new Date(),
            metadata: { destinationCvu: dto.destinationCvu },
          },
        });

        return transaction;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10000,
      },
    );
  }

  async findAll(orgId: string, filters: TransactionFilterDto) {
    const { type, status, dateFrom, dateTo, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      orgId,
      ...(type ? { type: type as TransactionType } : {}),
      ...(status ? { status: status as TransactionStatus } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo + 'T23:59:59.999Z') } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true } },
          receiver: { select: { id: true, firstName: true, lastName: true } },
          walletFrom: { select: { id: true, cvu: true } },
          walletTo: { select: { id: true, cvu: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(orgId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, orgId },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, email: true } },
        walletFrom: { select: { id: true, cvu: true, balance: true } },
        walletTo: { select: { id: true, cvu: true, balance: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return transaction;
  }

  async getReceipt(orgId: string, id: string) {
    const transaction = await this.findOne(orgId, id);

    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new BadRequestException(
        'Solo se puede generar comprobante de transacciones completadas',
      );
    }

    return {
      receipt: {
        id: transaction.id,
        type: transaction.type,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        reference: transaction.reference,
        processedAt: transaction.processedAt,
        createdAt: transaction.createdAt,
        sender: transaction.sender
          ? {
              name: `${transaction.sender.firstName} ${transaction.sender.lastName}`,
              email: transaction.sender.email,
            }
          : null,
        receiver: transaction.receiver
          ? {
              name: `${transaction.receiver.firstName} ${transaction.receiver.lastName}`,
              email: transaction.receiver.email,
            }
          : null,
        walletFrom: transaction.walletFrom
          ? { id: transaction.walletFrom.id, cvu: transaction.walletFrom.cvu }
          : null,
        walletTo: transaction.walletTo
          ? { id: transaction.walletTo.id, cvu: transaction.walletTo.cvu }
          : null,
      },
    };
  }
}
