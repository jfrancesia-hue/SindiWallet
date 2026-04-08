import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditFilterDto } from './dto/audit-filter.dto';
import { Prisma } from '@sindiwallet/db';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    orgId: string;
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    oldData?: unknown;
    newData?: unknown;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        orgId: params.orgId,
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldData: params.oldData as Prisma.JsonObject ?? undefined,
        newData: params.newData as Prisma.JsonObject ?? undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  }

  async findAll(orgId: string, filters: AuditFilterDto) {
    const { userId, action, entity, dateFrom, dateTo, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {
      orgId,
      ...(userId ? { userId } : {}),
      ...(action ? { action } : {}),
      ...(entity ? { entity } : {}),
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
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
