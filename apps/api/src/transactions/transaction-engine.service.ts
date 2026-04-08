import {
  Injectable,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdempotencyService } from './idempotency.service';
import { Transaction, TransactionStatus, TransactionType, WalletStatus } from '@sindiwallet/db';
import { Prisma } from '@sindiwallet/db';

export interface ExecuteTransferParams {
  orgId: string;
  senderId: string;
  receiverId: string;
  walletFromId: string;
  walletToId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  idempotencyKey: string;
}

@Injectable()
export class TransactionEngineService {
  constructor(
    private prisma: PrismaService,
    private idempotency: IdempotencyService,
  ) {}

  async executeTransfer(params: ExecuteTransferParams): Promise<Transaction> {
    const {
      orgId,
      senderId,
      receiverId,
      walletFromId,
      walletToId,
      amount,
      type,
      description,
      idempotencyKey,
    } = params;

    // 1. Verificar idempotencia
    const existing = await this.idempotency.check(idempotencyKey);
    if (existing) return existing;

    if (amount <= 0) {
      throw new BadRequestException('El monto debe ser mayor a cero');
    }

    // 2. Ejecutar dentro de transacción Prisma con aislamiento Serializable
    const result = await this.prisma.$transaction(
      async (tx) => {
        // 3a. SELECT FOR UPDATE en walletFrom (lock pesimista)
        const walletsFrom = await tx.$queryRaw<
          Array<{
            id: string;
            balance: Prisma.Decimal;
            status: string;
            org_id: string;
          }>
        >`SELECT id, balance, status, org_id FROM wallets WHERE id = ${walletFromId} FOR UPDATE`;

        if (!walletsFrom || walletsFrom.length === 0) {
          throw new UnprocessableEntityException('Wallet origen no encontrada');
        }

        // 3a. SELECT FOR UPDATE en walletTo (lock pesimista)
        const walletsTo = await tx.$queryRaw<
          Array<{
            id: string;
            balance: Prisma.Decimal;
            status: string;
            org_id: string;
          }>
        >`SELECT id, balance, status, org_id FROM wallets WHERE id = ${walletToId} FOR UPDATE`;

        if (!walletsTo || walletsTo.length === 0) {
          throw new UnprocessableEntityException('Wallet destino no encontrada');
        }

        const walletFrom = walletsFrom[0]!;
        const walletTo = walletsTo[0]!;

        // 3b. Verificar que ambas wallets pertenecen a la org
        if (walletFrom.org_id !== orgId || walletTo.org_id !== orgId) {
          throw new UnprocessableEntityException(
            'Las wallets deben pertenecer a la misma organización',
          );
        }

        // 3b. Verificar que ambas wallets están ACTIVE
        if (walletFrom.status !== WalletStatus.ACTIVE) {
          throw new UnprocessableEntityException(
            'La wallet origen no está activa',
          );
        }

        if (walletTo.status !== WalletStatus.ACTIVE) {
          throw new UnprocessableEntityException(
            'La wallet destino no está activa',
          );
        }

        // 3b. Verificar saldo suficiente
        const fromBalance = new Prisma.Decimal(walletFrom.balance);
        const transferAmount = new Prisma.Decimal(amount);

        if (fromBalance.lessThan(transferAmount)) {
          throw new UnprocessableEntityException(
            `Saldo insuficiente. Disponible: ${fromBalance.toFixed(2)} ARS`,
          );
        }

        // 3d. Decrementar balance de walletFrom
        await tx.wallet.update({
          where: { id: walletFromId },
          data: {
            balance: { decrement: transferAmount },
          },
        });

        // 3e. Incrementar balance de walletTo
        await tx.wallet.update({
          where: { id: walletToId },
          data: {
            balance: { increment: transferAmount },
          },
        });

        // 3f. Crear registro de la transacción
        const transaction = await tx.transaction.create({
          data: {
            orgId,
            idempotencyKey,
            type,
            status: TransactionStatus.COMPLETED,
            amount: transferAmount,
            fee: new Prisma.Decimal(0),
            currency: 'ARS',
            description,
            senderId,
            receiverId,
            walletFromId,
            walletToId,
            processedAt: new Date(),
          },
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            receiver: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            walletFrom: { select: { id: true, cvu: true } },
            walletTo: { select: { id: true, cvu: true } },
          },
        });

        return transaction;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10000,
      },
    );

    return result;
  }
}
