import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, KycUpdateDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        orgId,
        OR: [{ email: dto.email }, { dni: dto.dni }],
      },
    });

    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? 'Ya existe un usuario con ese email'
          : 'Ya existe un usuario con ese DNI',
      );
    }

    const user = await this.prisma.user.create({
      data: {
        orgId,
        supabaseUserId: `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dni: dto.dni,
        phone: dto.phone || null,
        cuit: dto.cuit || null,
        role: (dto.role as any) || 'AFFILIATE',
        employerName: dto.employerName || null,
        employerCuit: dto.employerCuit || null,
        salary: dto.salary || null,
        memberSince: dto.memberSince ? new Date(dto.memberSince) : null,
        kycStatus: 'PENDING',
      },
    });

    // Crear wallet automáticamente
    if (user.role === 'AFFILIATE' || user.role === 'MERCHANT') {
      await this.prisma.wallet.create({
        data: {
          orgId,
          userId: user.id,
          balance: 0,
          currency: 'ARS',
          status: 'ACTIVE',
        },
      });
    }

    return user;
  }

  async findAll(
    orgId: string,
    options: {
      page?: number;
      limit?: number;
      role?: string;
      search?: string;
      isActive?: boolean;
    } = {},
  ) {
    const { page = 1, limit = 20, role, search, isActive } = options;
    const skip = (page - 1) * limit;

    const where: any = { orgId };
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { wallet: { select: { id: true, balance: true, status: true } } },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(orgId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, orgId },
      include: {
        wallet: true,
        organization: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            primaryColor: true,
            secondaryColor: true,
            accentColor: true,
            logo: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(orgId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(orgId, id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async updateKyc(orgId: string, id: string, dto: KycUpdateDto) {
    await this.findOne(orgId, id);
    return this.prisma.user.update({
      where: { id },
      data: {
        kycStatus: dto.status as any,
        kycData: dto.kycData ? (dto.kycData as any) : undefined,
      },
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
