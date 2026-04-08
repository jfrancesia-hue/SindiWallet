import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionEngineService } from '../transactions/transaction-engine.service';
import { ScoringService } from './scoring.service';
import { SimulateLoanDto } from './dto/simulate-loan.dto';
import { RequestLoanDto } from './dto/request-loan.dto';
import {
  LoanStatus,
  InstallmentStatus,
  TransactionType,
  WalletStatus,
  Prisma,
} from '@sindiwallet/db';

// TNA base según plazo (simplificado)
const TNA_TABLE: Record<number, number> = {
  3: 0.45,
  6: 0.50,
  9: 0.55,
  12: 0.60,
  18: 0.65,
  24: 0.70,
};

@Injectable()
export class LoansService {
  constructor(
    private prisma: PrismaService,
    private engine: TransactionEngineService,
    private scoring: ScoringService,
  ) {}

  private calculateLoan(amount: number, termMonths: number) {
    const tna = TNA_TABLE[termMonths] ?? 0.60;
    const monthlyRate = tna / 12;
    // Sistema francés
    const monthlyPayment =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    const totalAmount = monthlyPayment * termMonths;

    return {
      tna,
      monthlyRate,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalInterest: Math.round((totalAmount - amount) * 100) / 100,
    };
  }

  async simulate(orgId: string, userId: string, dto: SimulateLoanDto) {
    const scoringResult = await this.scoring.evaluate(orgId, userId);
    const calc = this.calculateLoan(dto.amount, dto.termMonths);

    return {
      amount: dto.amount,
      termMonths: dto.termMonths,
      tna: calc.tna,
      monthlyPayment: calc.monthlyPayment,
      totalAmount: calc.totalAmount,
      totalInterest: calc.totalInterest,
      scoring: {
        score: scoringResult.score,
        grade: scoringResult.grade,
        approved: scoringResult.approved && dto.amount <= scoringResult.maxAmount,
        maxAmount: scoringResult.maxAmount,
      },
    };
  }

  async request(orgId: string, userId: string, dto: RequestLoanDto) {
    // Verificar scoring
    const scoringResult = await this.scoring.evaluate(orgId, userId);
    if (!scoringResult.approved) {
      throw new BadRequestException(
        `Solicitud rechazada. Score: ${scoringResult.score} (mínimo 35)`,
      );
    }
    if (dto.amount > scoringResult.maxAmount) {
      throw new BadRequestException(
        `Monto excede el máximo pre-aprobado: $${scoringResult.maxAmount.toLocaleString('es-AR')}`,
      );
    }

    const calc = this.calculateLoan(dto.amount, dto.termMonths);

    // Crear préstamo + cuotas
    const loan = await this.prisma.loan.create({
      data: {
        orgId,
        userId,
        amount: dto.amount,
        interestRate: calc.tna,
        termMonths: dto.termMonths,
        monthlyPayment: calc.monthlyPayment,
        totalAmount: calc.totalAmount,
        outstandingBalance: calc.totalAmount,
        status: LoanStatus.APPROVED,
        scoringResult: scoringResult as unknown as Prisma.JsonObject,
        installments: {
          create: this.generateInstallments(dto.amount, dto.termMonths, calc),
        },
      },
      include: { installments: { orderBy: { number: 'asc' } } },
    });

    return loan;
  }

  private generateInstallments(
    amount: number,
    termMonths: number,
    calc: ReturnType<typeof this.calculateLoan>,
  ) {
    const installments = [];
    let outstanding = amount;
    const now = new Date();

    for (let i = 1; i <= termMonths; i++) {
      const interest = Math.round(outstanding * calc.monthlyRate * 100) / 100;
      const principal = Math.round((calc.monthlyPayment - interest) * 100) / 100;
      outstanding -= principal;

      const dueDate = new Date(now);
      dueDate.setMonth(dueDate.getMonth() + i);

      installments.push({
        number: i,
        amount: calc.monthlyPayment,
        principal,
        interest,
        dueDate,
        status: InstallmentStatus.PENDING,
      });
    }

    return installments;
  }

  async disburse(orgId: string, loanId: string) {
    return this.prisma.$transaction(async (tx) => {
      // SELECT FOR UPDATE to prevent double disbursement
      const [loan] = await tx.$queryRawUnsafe<any[]>(
        `SELECT l.*, row_to_json(u.*) as "_user", row_to_json(w.*) as "_wallet"
         FROM loans l
         JOIN users u ON u.id = l."userId"
         LEFT JOIN wallets w ON w."userId" = u.id
         WHERE l.id = $1 AND l."orgId" = $2
         FOR UPDATE OF l`,
        loanId,
        orgId,
      );

      if (!loan || loan.status !== LoanStatus.APPROVED) {
        throw new NotFoundException('Préstamo aprobado no encontrado');
      }

      const wallet = loan._wallet;
      if (!wallet || wallet.status !== WalletStatus.ACTIVE) {
        throw new BadRequestException('El usuario no tiene wallet activa');
      }

      // Idempotency guard: check if disbursement transaction already exists
      const existing = await tx.transaction.findUnique({
        where: { idempotencyKey: `LOAN_DISBURSE_${loanId}` },
      });
      if (existing) {
        throw new BadRequestException('Este préstamo ya fue desembolsado');
      }

      const firstInstallment = await tx.loanInstallment.findFirst({
        where: { loanId },
        orderBy: { number: 'asc' },
      });

      // All operations inside a single transaction
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: new Prisma.Decimal(Number(loan.amount)) } },
      });

      const updatedLoan = await tx.loan.update({
        where: { id: loanId },
        data: {
          status: LoanStatus.ACTIVE,
          disbursedAt: new Date(),
          nextPaymentDate: firstInstallment?.dueDate
            ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        include: { installments: { orderBy: { number: 'asc' }, take: 1 } },
      });

      await tx.transaction.create({
        data: {
          orgId,
          idempotencyKey: `LOAN_DISBURSE_${loanId}`,
          type: TransactionType.LOAN_DISBURSEMENT,
          status: 'COMPLETED',
          amount: loan.amount,
          fee: 0,
          currency: 'ARS',
          description: `Desembolso préstamo #${loanId.slice(-6)}`,
          receiverId: loan.userId,
          walletToId: wallet.id,
          processedAt: new Date(),
        },
      });

      return updatedLoan;
    });
  }

  async getMyLoans(orgId: string, userId: string) {
    return this.prisma.loan.findMany({
      where: { userId, orgId },
      include: {
        installments: { orderBy: { number: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLoanDetail(orgId: string, id: string) {
    const loan = await this.prisma.loan.findFirst({
      where: { id, orgId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        installments: { orderBy: { number: 'asc' } },
      },
    });

    if (!loan) throw new NotFoundException('Préstamo no encontrado');
    return loan;
  }

  async payInstallment(orgId: string, userId: string, loanId: string, idempotencyKey: string) {
    const loan = await this.prisma.loan.findFirst({
      where: { id: loanId, orgId, userId, status: LoanStatus.ACTIVE },
      include: {
        installments: {
          where: { status: InstallmentStatus.PENDING },
          orderBy: { number: 'asc' },
          take: 1,
        },
        user: { include: { wallet: true } },
      },
    });

    if (!loan) throw new NotFoundException('Préstamo activo no encontrado');
    if (loan.installments.length === 0) {
      throw new BadRequestException('No hay cuotas pendientes');
    }

    const installment = loan.installments[0];
    if (!installment) {
      throw new BadRequestException('No hay cuotas pendientes');
    }

    const wallet = loan.user.wallet;
    if (!wallet || wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('No tenés una wallet activa');
    }

    if (new Prisma.Decimal(wallet.balance).lessThan(new Prisma.Decimal(Number(installment.amount)))) {
      throw new BadRequestException(
        `Saldo insuficiente. Necesitás $${installment.amount} ARS`,
      );
    }

    // Descontar de wallet + marcar cuota pagada + verificar si se pagó todo
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: installment.amount } },
      });

      await tx.loanInstallment.update({
        where: { id: installment.id },
        data: { status: InstallmentStatus.PAID, paidAt: new Date() },
      });

      await tx.loan.update({
        where: { id: loanId },
        data: {
          outstandingBalance: { decrement: installment.amount },
        },
      });

      await tx.transaction.create({
        data: {
          orgId,
          idempotencyKey,
          type: TransactionType.LOAN_REPAYMENT,
          status: 'COMPLETED',
          amount: installment.amount,
          fee: 0,
          currency: 'ARS',
          description: `Cuota ${installment.number}/${loan.termMonths} — Préstamo #${loanId.slice(-6)}`,
          senderId: userId,
          walletFromId: wallet.id,
          processedAt: new Date(),
        },
      });

      // Verificar si se pagó todo — inside the transaction
      const pendingCount = await tx.loanInstallment.count({
        where: { loanId, status: InstallmentStatus.PENDING },
      });

      if (pendingCount === 0) {
        await tx.loan.update({
          where: { id: loanId },
          data: { status: LoanStatus.PAID_OFF, outstandingBalance: 0 },
        });
      }

      return pendingCount;
    });

    return {
      installmentNumber: installment.number,
      amount: installment.amount,
      remainingInstallments: result,
      loanStatus: result === 0 ? 'PAID_OFF' : 'ACTIVE',
    };
  }
}
