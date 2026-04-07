import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findFirst({
      where: { OR: [{ slug: dto.slug }, { cuit: dto.cuit }] },
    });

    if (existing) {
      throw new ConflictException(
        existing.slug === dto.slug
          ? 'Ya existe una organización con ese slug'
          : 'Ya existe una organización con ese CUIT',
      );
    }

    return this.prisma.organization.create({
      data: {
        ...dto,
        settings: {
          maxLoanMultiplier: 3,
          loanInterestRate: 0.035,
          loanMaxTermMonths: 24,
          scoringMinScore: 60,
          baasProvider: 'bind',
          whitelabelEnabled: false,
        },
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.organization.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.organization.count(),
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

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organización no encontrada');
    return org;
  }

  async findBySlug(slug: string) {
    const org = await this.prisma.organization.findUnique({ where: { slug } });
    if (!org) throw new NotFoundException('Organización no encontrada');
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id);
    const { settings, ...rest } = dto;
    return this.prisma.organization.update({
      where: { id },
      data: {
        ...rest,
        ...(settings ? { settings: settings as any } : {}),
      },
    });
  }

  async updateBranding(id: string, dto: UpdateBrandingDto) {
    await this.findOne(id);
    return this.prisma.organization.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.organization.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getStats(orgId: string) {
    const [totalUsers, activeUsers, totalWallets, totalTransactions] = await Promise.all([
      this.prisma.user.count({ where: { orgId } }),
      this.prisma.user.count({ where: { orgId, isActive: true } }),
      this.prisma.wallet.count({ where: { orgId } }),
      this.prisma.transaction.count({ where: { orgId } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalWallets,
      totalTransactions,
    };
  }
}
