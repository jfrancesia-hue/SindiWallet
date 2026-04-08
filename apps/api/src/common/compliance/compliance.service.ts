import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TRANSACTION_LIMITS } from './transaction-limits';
import { TransactionStatus } from '@sindiwallet/db';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Valida que una transacción cumple con los límites BCRA
   */
  async validateTransaction(params: {
    userId: string;
    orgId: string;
    amount: number;
    type: string;
  }): Promise<void> {
    const { userId, orgId, amount, type } = params;

    // 1. Verificar límite por transacción individual
    const limits = TRANSACTION_LIMITS[type as keyof typeof TRANSACTION_LIMITS];
    if (limits && typeof limits === 'object' && 'max' in limits) {
      if (amount < limits.min) {
        throw new BadRequestException(
          `Monto mínimo para esta operación: $${limits.min} ARS`,
        );
      }
      if (amount > limits.max) {
        throw new BadRequestException(
          `Monto máximo por operación: $${limits.max.toLocaleString('es-AR')} ARS`,
        );
      }
    }

    // 2. Verificar límite diario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });

    const kycLimits =
      user?.kycStatus === 'APPROVED'
        ? TRANSACTION_LIMITS.KYC_APPROVED
        : TRANSACTION_LIMITS.KYC_PENDING;

    const now = new Date();
    const argDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
    const todayStart = new Date(argDate.getFullYear(), argDate.getMonth(), argDate.getDate());

    const dailyTotal = await this.prisma.transaction.aggregate({
      where: {
        senderId: userId,
        orgId,
        status: TransactionStatus.COMPLETED,
        createdAt: { gte: todayStart },
      },
      _sum: { amount: true },
    });

    const currentDaily = Number(dailyTotal._sum.amount || 0);
    if (currentDaily + amount > kycLimits.dailyMax) {
      throw new BadRequestException(
        `Límite diario excedido. Disponible: $${(kycLimits.dailyMax - currentDaily).toLocaleString('es-AR')} ARS`,
      );
    }

    // 3. Verificar límite mensual
    const monthStart = new Date(argDate.getFullYear(), argDate.getMonth(), 1);

    const monthlyTotal = await this.prisma.transaction.aggregate({
      where: {
        senderId: userId,
        orgId,
        status: TransactionStatus.COMPLETED,
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    });

    const currentMonthly = Number(monthlyTotal._sum.amount || 0);
    if (currentMonthly + amount > kycLimits.monthlyMax) {
      throw new BadRequestException(
        `Límite mensual excedido. Disponible: $${(kycLimits.monthlyMax - currentMonthly).toLocaleString('es-AR')} ARS`,
      );
    }
  }

  /**
   * Valida que el balance de la wallet no exceda el máximo permitido
   */
  async validateWalletBalance(
    walletId: string,
    incomingAmount: number,
  ): Promise<void> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      include: { user: { select: { kycStatus: true } } },
    });

    if (!wallet) return;

    const maxBalance =
      wallet.user.kycStatus === 'APPROVED'
        ? TRANSACTION_LIMITS.KYC_APPROVED.maxBalance
        : TRANSACTION_LIMITS.KYC_PENDING.maxBalance;

    const newBalance = Number(wallet.balance) + incomingAmount;
    if (newBalance > maxBalance) {
      throw new BadRequestException(
        `El balance resultante ($${newBalance.toLocaleString('es-AR')}) excede el máximo permitido para tu nivel de verificación ($${maxBalance.toLocaleString('es-AR')} ARS)`,
      );
    }
  }

  /**
   * Genera reporte de operaciones sospechosas (UIF)
   * Operaciones que superan ciertos umbrales deben ser reportadas
   */
  async checkSuspiciousActivity(
    userId: string,
    orgId: string,
  ): Promise<{
    flagged: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Muchas transacciones en poco tiempo
    const recentCount = await this.prisma.transaction.count({
      where: {
        senderId: userId,
        orgId,
        createdAt: { gte: last24h },
        status: TransactionStatus.COMPLETED,
      },
    });

    if (recentCount > 50) {
      reasons.push(`Alta frecuencia: ${recentCount} operaciones en 24h`);
    }

    // Monto total alto en 24h
    const recentTotal = await this.prisma.transaction.aggregate({
      where: {
        senderId: userId,
        orgId,
        createdAt: { gte: last24h },
        status: TransactionStatus.COMPLETED,
      },
      _sum: { amount: true },
    });

    const total24h = Number(recentTotal._sum.amount || 0);
    if (total24h > 5000000) {
      reasons.push(
        `Monto elevado en 24h: $${total24h.toLocaleString('es-AR')}`,
      );
    }

    return { flagged: reasons.length > 0, reasons };
  }
}
