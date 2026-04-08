import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { RequestBenefitDto } from './dto/request-benefit.dto';
import { ReviewBenefitDto } from './dto/review-benefit.dto';
import {
  BenefitRequestStatus,
  TransactionType,
  TransactionStatus,
  WalletStatus,
  Prisma,
} from '@sindiwallet/db';

@Injectable()
export class BenefitsService {
  constructor(private prisma: PrismaService) {}

  // ── Admin: CRUD ──

  async create(orgId: string, dto: CreateBenefitDto) {
    return this.prisma.benefit.create({
      data: {
        orgId,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        amount: dto.amount,
        maxAmount: dto.maxAmount,
        requiresApproval: dto.requiresApproval ?? true,
        requirements: dto.requirements as Prisma.JsonObject ?? undefined,
      },
    });
  }

  async findAll(orgId: string, category?: string) {
    return this.prisma.benefit.findMany({
      where: {
        orgId,
        isActive: true,
        ...(category ? { category } : {}),
      },
      orderBy: { category: 'asc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const benefit = await this.prisma.benefit.findFirst({
      where: { id, orgId },
    });
    if (!benefit) throw new NotFoundException('Beneficio no encontrado');
    return benefit;
  }

  async getCategories(orgId: string) {
    const benefits = await this.prisma.benefit.findMany({
      where: { orgId, isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return benefits.map((b) => b.category);
  }

  // ── Afiliado: solicitar beneficio ──

  async requestBenefit(orgId: string, userId: string, dto: RequestBenefitDto) {
    const benefit = await this.findOne(orgId, dto.benefitId);

    if (benefit.maxAmount && dto.amount > Number(benefit.maxAmount)) {
      throw new BadRequestException(
        `El monto máximo para este beneficio es $${benefit.maxAmount}`,
      );
    }

    // Si no requiere aprobación, auto-aprobar
    const status = benefit.requiresApproval
      ? BenefitRequestStatus.PENDING
      : BenefitRequestStatus.APPROVED;

    const request = await this.prisma.benefitRequest.create({
      data: {
        orgId,
        benefitId: dto.benefitId,
        userId,
        amount: dto.amount,
        notes: dto.notes,
        attachments: dto.attachments as Prisma.JsonArray ?? undefined,
        status,
        ...(status === BenefitRequestStatus.APPROVED
          ? { reviewedAt: new Date() }
          : {}),
      },
      include: {
        benefit: { select: { name: true, category: true } },
      },
    });

    return request;
  }

  async getMyRequests(orgId: string, userId: string) {
    return this.prisma.benefitRequest.findMany({
      where: { userId, orgId },
      include: {
        benefit: { select: { name: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Admin: revisar solicitudes ──

  async getPendingRequests(orgId: string) {
    return this.prisma.benefitRequest.findMany({
      where: { orgId, status: BenefitRequestStatus.PENDING },
      include: {
        benefit: { select: { name: true, category: true } },
        user: { select: { id: true, firstName: true, lastName: true, dni: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async review(orgId: string, requestId: string, reviewerId: string, dto: ReviewBenefitDto) {
    const request = await this.prisma.benefitRequest.findFirst({
      where: { id: requestId, orgId, status: BenefitRequestStatus.PENDING },
    });

    if (!request) {
      throw new NotFoundException('Solicitud pendiente no encontrada');
    }

    return this.prisma.benefitRequest.update({
      where: { id: requestId },
      data: {
        status: dto.decision === 'APPROVED'
          ? BenefitRequestStatus.APPROVED
          : BenefitRequestStatus.REJECTED,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: dto.reviewNotes,
      },
      include: {
        benefit: { select: { name: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async disburse(orgId: string, requestId: string) {
    const request = await this.prisma.benefitRequest.findFirst({
      where: { id: requestId, orgId, status: BenefitRequestStatus.APPROVED },
      include: {
        user: { include: { wallet: true } },
        benefit: { select: { name: true } },
      },
    });

    if (!request) {
      throw new NotFoundException('Solicitud aprobada no encontrada');
    }

    if (!request.user.wallet || request.user.wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('El usuario no tiene wallet activa');
    }

    // Acreditar en wallet + registrar transacción + actualizar solicitud
    const [, , transaction] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: request.user.wallet.id },
        data: { balance: { increment: request.amount } },
      }),
      this.prisma.benefitRequest.update({
        where: { id: requestId },
        data: { status: BenefitRequestStatus.DISBURSED },
      }),
      this.prisma.transaction.create({
        data: {
          orgId,
          idempotencyKey: `BENEFIT_${requestId}`,
          type: TransactionType.BENEFIT_CREDIT,
          status: TransactionStatus.COMPLETED,
          amount: request.amount,
          fee: 0,
          currency: 'ARS',
          description: `Beneficio: ${request.benefit.name}`,
          receiverId: request.userId,
          walletToId: request.user.wallet.id,
          processedAt: new Date(),
        },
      }),
    ]);

    return { request: { id: requestId, status: 'DISBURSED' }, transaction };
  }
}
