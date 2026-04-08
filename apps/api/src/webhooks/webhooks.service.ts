import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../websocket/events.gateway';
import { BaasWebhookDto } from './dto/baas-webhook.dto';
import { TransactionStatus, TransactionType, Prisma } from '@sindiwallet/db';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) {}

  async handleBaasWebhook(dto: BaasWebhookDto, rawBody: string) {
    // 1. Verificar firma HMAC si está configurado
    const webhookSecret = process.env.BAAS_WEBHOOK_SECRET;
    if (webhookSecret) {
      if (!dto.signature) {
        throw new UnauthorizedException('Firma de webhook requerida');
      }
      const expected = createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');
      const expectedBuf = Buffer.from(expected, 'hex');
      const signatureBuf = Buffer.from(dto.signature, 'hex');
      if (expectedBuf.length !== signatureBuf.length || !timingSafeEqual(expectedBuf, signatureBuf)) {
        throw new UnauthorizedException('Firma de webhook inválida');
      }
    }

    this.logger.log(`BaaS webhook: ${dto.event} — txId: ${dto.transactionId}`);

    switch (dto.event) {
      case 'TRANSFER_IN':
        return this.handleTransferIn(dto);
      case 'TRANSFER_OUT':
        return this.handleTransferOut(dto);
      case 'DEBIN_REQUEST':
        return this.handleDebinRequest(dto);
      case 'DEBIN_RESPONSE':
        return this.handleDebinResponse(dto);
      default:
        this.logger.warn(`Evento BaaS desconocido: ${dto.event}`);
        return { status: 'ignored' };
    }
  }

  private async handleTransferIn(dto: BaasWebhookDto) {
    // Buscar wallet por CVU destino
    const wallet = await this.prisma.wallet.findFirst({
      where: { cvu: dto.toCvu },
      include: { user: { select: { id: true, orgId: true } } },
    });

    if (!wallet) {
      this.logger.warn(`CVU no encontrado: ${dto.toCvu}`);
      return { status: 'cvu_not_found' };
    }

    const amount = new Prisma.Decimal(dto.amount);

    // Acreditar en wallet + registrar transacción
    const [, transaction] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      }),
      this.prisma.transaction.create({
        data: {
          orgId: wallet.user.orgId,
          idempotencyKey: `BAAS_IN_${dto.transactionId}`,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          amount,
          fee: 0,
          currency: dto.currency,
          description: `Transferencia recibida desde CVU ${dto.fromCvu}`,
          receiverId: wallet.user.id,
          walletToId: wallet.id,
          baasTransactionId: dto.transactionId,
          reference: dto.reference,
          processedAt: new Date(),
        },
      }),
    ]);

    // Emitir evento WebSocket
    this.events.emitTransactionUpdate(wallet.user.orgId, {
      id: transaction.id,
      type: 'DEPOSIT',
      status: 'COMPLETED',
      amount: dto.amount.toString(),
      receiverId: wallet.user.id,
    });

    this.events.emitNotification(wallet.user.id, {
      id: transaction.id,
      title: 'Transferencia recibida',
      body: `Recibiste $${dto.amount} desde CVU ${dto.fromCvu}`,
      channel: 'IN_APP',
    });

    return { status: 'processed', transactionId: transaction.id };
  }

  private async handleTransferOut(dto: BaasWebhookDto) {
    // Actualizar transacción existente con el estado del BaaS
    const existing = await this.prisma.transaction.findFirst({
      where: { baasTransactionId: dto.transactionId },
    });

    if (!existing) {
      this.logger.warn(`Transacción BaaS no encontrada: ${dto.transactionId}`);
      return { status: 'tx_not_found' };
    }

    const newStatus = dto.status === 'APPROVED'
      ? TransactionStatus.COMPLETED
      : TransactionStatus.FAILED;

    await this.prisma.transaction.update({
      where: { id: existing.id },
      data: {
        status: newStatus,
        processedAt: new Date(),
        metadata: { baasStatus: dto.status },
      },
    });

    if (existing.senderId) {
      this.events.emitToUser(existing.senderId, 'transaction:status', {
        id: existing.id,
        status: newStatus,
      });
    }

    return { status: 'updated' };
  }

  private async handleDebinRequest(dto: BaasWebhookDto) {
    // DEBIN entrante: alguien quiere cobrar de nuestra wallet
    const wallet = await this.prisma.wallet.findFirst({
      where: { cvu: dto.fromCvu },
      include: { user: { select: { id: true, orgId: true } } },
    });

    if (!wallet) return { status: 'cvu_not_found' };

    // Notificar al usuario para que acepte o rechace
    this.events.emitNotification(wallet.user.id, {
      id: dto.transactionId,
      title: 'Solicitud de cobro (DEBIN)',
      body: `${dto.toCvu} solicita cobrar $${dto.amount}. Revisá en la app.`,
      channel: 'PUSH',
    });

    return { status: 'notified' };
  }

  private async handleDebinResponse(dto: BaasWebhookDto) {
    this.logger.log(`DEBIN response: ${dto.transactionId} — ${dto.status}`);
    return { status: 'acknowledged' };
  }
}
