import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { MerchantFilterDto } from './dto/merchant-filter.dto';
import { Prisma } from '@sindiwallet/db';

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateMerchantDto) {
    const existing = await this.prisma.merchant.findUnique({
      where: { userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException('Este usuario ya tiene un perfil de comercio');
    }

    // Actualizar rol del usuario a MERCHANT
    await this.prisma.user.update({
      where: { id: dto.userId },
      data: { role: 'MERCHANT' },
    });

    return this.prisma.merchant.create({
      data: {
        orgId,
        userId: dto.userId,
        businessName: dto.businessName,
        cuit: dto.cuit,
        category: dto.category,
        address: dto.address,
        phone: dto.phone,
        discountPercent: dto.discountPercent ?? 0,
        settlementFrequency: dto.settlementFrequency ?? 'WEEKLY',
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async findAll(orgId: string, filters: MerchantFilterDto) {
    const { category, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.MerchantWhereInput = {
      orgId,
      isActive: true,
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { businessName: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.merchant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { businessName: 'asc' },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.merchant.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(orgId: string, id: string) {
    const merchant = await this.prisma.merchant.findFirst({
      where: { id, orgId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          include: { wallet: { select: { id: true, cvu: true, balance: true } } },
        },
      },
    });
    if (!merchant) throw new NotFoundException('Comercio no encontrado');
    return merchant;
  }

  async getCategories(orgId: string) {
    const merchants = await this.prisma.merchant.findMany({
      where: { orgId, isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return merchants.map((m) => m.category);
  }

  async toggleActive(orgId: string, id: string) {
    const merchant = await this.findOne(orgId, id);
    return this.prisma.merchant.update({
      where: { id },
      data: { isActive: !merchant.isActive },
    });
  }

  async updateDiscount(orgId: string, id: string, discountPercent: number) {
    await this.findOne(orgId, id);
    return this.prisma.merchant.update({
      where: { id },
      data: { discountPercent },
    });
  }
}
