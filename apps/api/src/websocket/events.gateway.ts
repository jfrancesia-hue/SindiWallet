import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    const orgId = client.handshake.auth?.orgId;

    if (userId) {
      client.join(`user:${userId}`);
    }
    if (orgId) {
      client.join(`org:${orgId}`);
    }

    this.logger.debug(`Client connected: ${client.id} (user: ${userId}, org: ${orgId})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:user')
  handleJoinUser(client: Socket, userId: string) {
    client.join(`user:${userId}`);
  }

  @SubscribeMessage('join:org')
  handleJoinOrg(client: Socket, orgId: string) {
    client.join(`org:${orgId}`);
  }

  // ── Métodos para emitir eventos desde servicios ──

  emitToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToOrg(orgId: string, event: string, data: unknown) {
    this.server.to(`org:${orgId}`).emit(event, data);
  }

  emitNotification(userId: string, notification: {
    id: string;
    title: string;
    body: string;
    channel: string;
  }) {
    this.emitToUser(userId, 'notification:new', notification);
  }

  emitTransactionUpdate(orgId: string, transaction: {
    id: string;
    type: string;
    status: string;
    amount: string;
    senderId?: string;
    receiverId?: string;
  }) {
    this.emitToOrg(orgId, 'transaction:update', transaction);

    // Notificar a sender y receiver individualmente
    if (transaction.senderId) {
      this.emitToUser(transaction.senderId, 'wallet:update', {
        event: 'debit',
        transactionId: transaction.id,
      });
    }
    if (transaction.receiverId) {
      this.emitToUser(transaction.receiverId, 'wallet:update', {
        event: 'credit',
        transactionId: transaction.id,
      });
    }
  }

  emitLoanUpdate(userId: string, loan: {
    id: string;
    status: string;
    event: string;
  }) {
    this.emitToUser(userId, 'loan:update', loan);
  }

  emitBenefitUpdate(userId: string, benefit: {
    id: string;
    status: string;
    benefitName: string;
  }) {
    this.emitToUser(userId, 'benefit:update', benefit);
  }
}
