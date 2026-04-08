import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DuePaymentStatus } from '@sindiwallet/db';

export interface ScoringResult {
  score: number;        // 0-100
  grade: string;        // A, B, C, D, F
  maxAmount: number;    // monto máximo pre-aprobado
  approved: boolean;
  factors: string[];
}

@Injectable()
export class ScoringService {
  constructor(private prisma: PrismaService) {}

  async evaluate(orgId: string, userId: string): Promise<ScoringResult> {
    const factors: string[] = [];
    let score = 50; // base

    // 1. Antigüedad como afiliado
    const user = await this.prisma.user.findFirst({
      where: { id: userId, orgId },
      select: { memberSince: true, salary: true, kycStatus: true, createdAt: true },
    });

    if (!user) {
      return { score: 0, grade: 'F', maxAmount: 0, approved: false, factors: ['Usuario no encontrado'] };
    }

    const memberSince = user.memberSince ?? user.createdAt;
    const monthsActive = Math.floor(
      (Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24 * 30),
    );

    if (monthsActive >= 24) {
      score += 15;
      factors.push(`+15: Antigüedad ${monthsActive} meses (>= 24)`);
    } else if (monthsActive >= 12) {
      score += 10;
      factors.push(`+10: Antigüedad ${monthsActive} meses (>= 12)`);
    } else if (monthsActive >= 6) {
      score += 5;
      factors.push(`+5: Antigüedad ${monthsActive} meses (>= 6)`);
    } else {
      score -= 10;
      factors.push(`-10: Antigüedad insuficiente (${monthsActive} meses)`);
    }

    // 2. KYC aprobado
    if (user.kycStatus === 'APPROVED') {
      score += 10;
      factors.push('+10: KYC aprobado');
    } else {
      score -= 15;
      factors.push('-15: KYC no aprobado');
    }

    // 3. Historial de cuotas (últimos 12 meses)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const yearStr = `${oneYearAgo.getFullYear()}-`;

    const duePayments = await this.prisma.duePayment.findMany({
      where: {
        userId,
        due: { orgId },
        period: { gte: yearStr },
      },
    });

    const paidCount = duePayments.filter((p) => p.status === DuePaymentStatus.PAID).length;
    const totalDues = duePayments.length || 1;
    const paymentRate = paidCount / totalDues;

    if (paymentRate >= 0.9) {
      score += 15;
      factors.push(`+15: ${Math.round(paymentRate * 100)}% cuotas al día`);
    } else if (paymentRate >= 0.7) {
      score += 5;
      factors.push(`+5: ${Math.round(paymentRate * 100)}% cuotas al día`);
    } else {
      score -= 10;
      factors.push(`-10: Solo ${Math.round(paymentRate * 100)}% cuotas al día`);
    }

    // 4. Préstamos previos
    const activeLoans = await this.prisma.loan.count({
      where: { userId, orgId, status: { in: ['ACTIVE', 'PENDING', 'APPROVED'] } },
    });

    if (activeLoans > 0) {
      score -= 20;
      factors.push(`-20: ${activeLoans} préstamo(s) activo(s)`);
    } else {
      const paidLoans = await this.prisma.loan.count({
        where: { userId, orgId, status: 'PAID_OFF' },
      });
      if (paidLoans > 0) {
        score += 10;
        factors.push(`+10: ${paidLoans} préstamo(s) pagado(s) exitosamente`);
      }
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Grade + maxAmount
    let grade: string;
    let maxAmount: number;
    const baseSalary = user.salary ? Number(user.salary) : 100000;

    if (score >= 80) {
      grade = 'A';
      maxAmount = baseSalary * 5;
    } else if (score >= 65) {
      grade = 'B';
      maxAmount = baseSalary * 3;
    } else if (score >= 50) {
      grade = 'C';
      maxAmount = baseSalary * 2;
    } else if (score >= 35) {
      grade = 'D';
      maxAmount = baseSalary;
    } else {
      grade = 'F';
      maxAmount = 0;
    }

    maxAmount = Math.min(maxAmount, 500000); // cap

    return {
      score,
      grade,
      maxAmount,
      approved: score >= 35,
      factors,
    };
  }
}
