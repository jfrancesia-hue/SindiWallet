import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionEngineService } from '../transactions/transaction-engine.service';
import { CreateDueDto } from './dto/create-due.dto';
import { PayDueDto } from './dto/pay-due.dto';
import { BulkRetentionDto } from './dto/bulk-retention.dto';
import {
  DueFrequency,
  DuePaymentStatus,
  DuePaymentSource,
  TransactionType,
  WalletStatus,
  Prisma,
} from '@sindiwallet/db';
import { randomUUID } from 'crypto';

@Injectable()
export class DuesService {
  constructor(
    private prisma: PrismaService,
    private engine: TransactionEngineService,
  ) {}

  // ── Admin: CRUD de tipos de cuota ──

  async create(orgId: string, dto: CreateDueDto) {
    return this.prisma.due.create({
      data: {
        orgId,
        name: dto.name,
        description: dto.description,
        amount: dto.amount,
        percentOfSalary: dto.percentOfSalary,
        frequency: (dto.frequency as DueFrequency) ?? DueFrequency.MONTHLY,
        isRetention: dto.isRetention ?? false,
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.due.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const due = await this.prisma.due.findFirst({ where: { id, orgId } });
    if (!due) throw new NotFoundException('Cuota no encontrada');
    return due;
  }

  // ── Afiliado: pagar cuota desde wallet ──

  async payFromWallet(orgId: string, userId: string, dto: PayDueDto) {
    const due = await this.findOne(orgId, dto.dueId);

    // Verificar que no esté ya pagada
    const existing = await this.prisma.duePayment.findUnique({
      where: {
        dueId_userId_period: {
          dueId: dto.dueId,
          userId,
          period: dto.period,
        },
      },
    });

    if (existing && existing.status === DuePaymentStatus.PAID) {
      throw new ConflictException('Esta cuota ya fue pagada para este período');
    }

    // Calcular monto (fijo o por porcentaje de salario)
    let amount = Number(due.amount);
    if (due.percentOfSalary) {
      const user = await this.prisma.user.findFirst({
        where: { id: userId, orgId },
        select: { salary: true },
      });
      if (user?.salary) {
        amount = Math.round(Number(user.salary) * Number(due.percentOfSalary) * 100) / 100;
      }
    }

    // Obtener wallet del afiliado
    const wallet = await this.prisma.wallet.findFirst({
      where: { userId, orgId, status: WalletStatus.ACTIVE },
    });
    if (!wallet) throw new NotFoundException('No tenés una wallet activa');

    // Verificar saldo
    if (new Prisma.Decimal(wallet.balance).lessThan(new Prisma.Decimal(amount))) {
      throw new BadRequestException(
        `Saldo insuficiente. Disponible: ${wallet.balance.toFixed(2)} ARS`,
      );
    }

    // Obtener wallet de la organización (ADMIN con role ADMIN, primero)
    const orgAdmin = await this.prisma.user.findFirst({
      where: { orgId, role: 'ADMIN' },
      include: { wallet: true },
    });

    if (!orgAdmin?.wallet) {
      throw new BadRequestException('La organización no tiene wallet receptora configurada');
    }

    // Ejecutar transferencia
    const transaction = await this.engine.executeTransfer({
      orgId,
      senderId: userId,
      receiverId: orgAdmin.id,
      walletFromId: wallet.id,
      walletToId: orgAdmin.wallet.id,
      amount,
      type: TransactionType.DUE_PAYMENT,
      description: `Cuota: ${due.name} — Período ${dto.period}`,
      idempotencyKey: dto.idempotencyKey,
    });

    // Registrar el pago de cuota
    await this.prisma.duePayment.upsert({
      where: {
        dueId_userId_period: {
          dueId: dto.dueId,
          userId,
          period: dto.period,
        },
      },
      update: {
        status: DuePaymentStatus.PAID,
        amount,
        paidAt: new Date(),
        transactionId: transaction.id,
        source: DuePaymentSource.WALLET,
      },
      create: {
        dueId: dto.dueId,
        userId,
        period: dto.period,
        amount,
        status: DuePaymentStatus.PAID,
        paidAt: new Date(),
        transactionId: transaction.id,
        source: DuePaymentSource.WALLET,
      },
    });

    return { transaction, due: due.name, period: dto.period, amount };
  }

  // ── Admin: retención masiva por nómina ──

  async bulkRetention(orgId: string, dto: BulkRetentionDto) {
    const results: Array<{ userId: string; dueId: string; status: string; error?: string }> = [];

    for (const item of dto.items) {
      try {
        const due = await this.findOne(orgId, item.dueId);

        let amount = Number(due.amount);
        if (due.percentOfSalary) {
          const user = await this.prisma.user.findFirst({
            where: { id: item.userId, orgId },
            select: { salary: true },
          });
          if (user?.salary) {
            amount = Math.round(Number(user.salary) * Number(due.percentOfSalary) * 100) / 100;
          }
        }

        await this.prisma.duePayment.upsert({
          where: {
            dueId_userId_period: {
              dueId: item.dueId,
              userId: item.userId,
              period: dto.period,
            },
          },
          update: {
            status: DuePaymentStatus.PAID,
            amount,
            paidAt: new Date(),
            source: DuePaymentSource.RETENTION,
            retentionRef: `RET_${dto.period}_${randomUUID().slice(0, 8)}`,
          },
          create: {
            dueId: item.dueId,
            userId: item.userId,
            period: dto.period,
            amount,
            status: DuePaymentStatus.PAID,
            paidAt: new Date(),
            source: DuePaymentSource.RETENTION,
            retentionRef: `RET_${dto.period}_${randomUUID().slice(0, 8)}`,
          },
        });

        results.push({ userId: item.userId, dueId: item.dueId, status: 'OK' });
      } catch (error) {
        results.push({
          userId: item.userId,
          dueId: item.dueId,
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    const ok = results.filter((r) => r.status === 'OK').length;
    const errors = results.filter((r) => r.status === 'ERROR').length;

    return { period: dto.period, total: dto.items.length, ok, errors, details: results };
  }

  // ── Afiliado: historial de cuotas ──

  async getMyHistory(orgId: string, userId: string, year?: number) {
    const targetYear = year ?? new Date().getFullYear();
    const periodPrefix = `${targetYear}-`;

    const dues = await this.prisma.due.findMany({
      where: { orgId, isActive: true },
    });

    const payments = await this.prisma.duePayment.findMany({
      where: {
        userId,
        period: { startsWith: periodPrefix },
        due: { orgId },
      },
      include: { due: { select: { id: true, name: true } } },
      orderBy: { period: 'asc' },
    });

    // Generar grid de 12 meses
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      return `${targetYear}-${month}`;
    });

    const history = dues.map((due) => ({
      dueId: due.id,
      dueName: due.name,
      amount: due.amount,
      months: months.map((period) => {
        const payment = payments.find(
          (p) => p.dueId === due.id && p.period === period,
        );
        return {
          period,
          status: payment?.status ?? DuePaymentStatus.PENDING,
          paidAt: payment?.paidAt ?? null,
          source: payment?.source ?? null,
        };
      }),
    }));

    const totalPaid = payments
      .filter((p) => p.status === DuePaymentStatus.PAID)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const paidCount = payments.filter((p) => p.status === DuePaymentStatus.PAID).length;

    return {
      year: targetYear,
      totalPaid,
      paidCount,
      totalMonths: 12 * dues.length,
      history,
    };
  }
}
