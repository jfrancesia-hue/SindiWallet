import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction, TransactionStatus } from '@sindiwallet/db';

@Injectable()
export class IdempotencyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verifica si ya existe una transacción con la clave dada.
   * - Si existe y está COMPLETED, retorna la transacción (no reintentar).
   * - Si existe y está FAILED, retorna null (se permite reintentar).
   * - Si no existe, retorna null (es nueva).
   */
  async check(key: string): Promise<Transaction | null> {
    const existing = await this.prisma.transaction.findUnique({
      where: { idempotencyKey: key },
    });

    if (!existing) return null;

    if (existing.status === TransactionStatus.COMPLETED) {
      return existing;
    }

    // FAILED, CANCELLED, REVERSED → permitir reintento (retornar null)
    if (
      existing.status === TransactionStatus.FAILED ||
      existing.status === TransactionStatus.CANCELLED ||
      existing.status === TransactionStatus.REVERSED
    ) {
      return null;
    }

    // PENDING o PROCESSING → retornar la existente para no duplicar
    return existing;
  }
}
