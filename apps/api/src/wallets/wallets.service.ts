import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletStatus } from '@sindiwallet/db';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  private generateCvu(): string {
    // CVU argentino: 22 dígitos numéricos
    const prefix = '0000003'; // prefijo mock de entidad virtual
    const random = Array.from({ length: 15 }, () =>
      Math.floor(Math.random() * 10),
    ).join('');
    return prefix + random;
  }

  async create(orgId: string, userId: string) {
    const existing = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('El usuario ya tiene una wallet asociada');
    }

    const cvu = this.generateCvu();

    return this.prisma.wallet.create({
      data: {
        orgId,
        userId,
        cvu,
        balance: 0,
        currency: 'ARS',
        status: WalletStatus.ACTIVE,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findByUser(orgId: string, userId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { userId, orgId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet no encontrada');
    }

    return wallet;
  }

  async findOne(orgId: string, id: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, orgId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet no encontrada');
    }

    return wallet;
  }

  async getBalance(orgId: string, id: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, orgId },
      select: { id: true, balance: true, cvu: true, status: true, currency: true },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet no encontrada');
    }

    return wallet;
  }

  async findAll(orgId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.wallet.findMany({
        where: { orgId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, dni: true, role: true },
          },
        },
      }),
      this.prisma.wallet.count({ where: { orgId } }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async freeze(orgId: string, id: string) {
    const wallet = await this.findOne(orgId, id);

    if (wallet.status === WalletStatus.FROZEN) {
      throw new BadRequestException('La wallet ya está congelada');
    }

    if (wallet.status === WalletStatus.CLOSED) {
      throw new BadRequestException('No se puede congelar una wallet cerrada');
    }

    return this.prisma.wallet.update({
      where: { id },
      data: { status: WalletStatus.FROZEN },
    });
  }

  async unfreeze(orgId: string, id: string) {
    const wallet = await this.findOne(orgId, id);

    if (wallet.status !== WalletStatus.FROZEN) {
      throw new BadRequestException('La wallet no está congelada');
    }

    return this.prisma.wallet.update({
      where: { id },
      data: { status: WalletStatus.ACTIVE },
    });
  }
}
