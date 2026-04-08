import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../websocket/events.gateway';
import { CreateNotificationDto, BulkNotificationDto } from './dto/create-notification.dto';
import { NotificationChannel, Prisma } from '@sindiwallet/db';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @Optional() private events?: EventsGateway,
  ) {}

  async create(orgId: string, dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        orgId,
        userId: dto.userId,
        channel: dto.channel as NotificationChannel,
        title: dto.title,
        body: dto.body,
        data: dto.data as Prisma.JsonObject ?? undefined,
        sentAt: new Date(),
      },
    });

    // Emit real-time via WebSocket
    this.events?.emitNotification(dto.userId, {
      id: notification.id,
      title: dto.title,
      body: dto.body,
      channel: dto.channel,
    });

    return notification;
  }

  async sendBulk(orgId: string, dto: BulkNotificationDto) {
    let userIds = dto.userIds;

    if (!userIds || userIds.length === 0) {
      const users = await this.prisma.user.findMany({
        where: { orgId, isActive: true },
        select: { id: true },
      });
      userIds = users.map((u) => u.id);
    }

    const notifications = userIds.map((userId) => ({
      orgId,
      userId,
      channel: dto.channel as NotificationChannel,
      title: dto.title,
      body: dto.body,
      data: dto.data as Prisma.JsonObject ?? Prisma.JsonNull,
      sentAt: new Date(),
    }));

    const result = await this.prisma.notification.createMany({
      data: notifications,
    });

    return { sent: result.count, channel: dto.channel };
  }

  async findByUser(
    orgId: string,
    userId: string,
    channel?: string,
    unreadOnly?: boolean,
  ) {
    return this.prisma.notification.findMany({
      where: {
        orgId,
        userId,
        ...(channel ? { channel: channel as NotificationChannel } : {}),
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(orgId: string, userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, orgId, userId },
    });
    if (!notification) throw new NotFoundException('Notificación no encontrada');

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(orgId: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { orgId, userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: result.count };
  }

  async getUnreadCount(orgId: string, userId: string) {
    const count = await this.prisma.notification.count({
      where: { orgId, userId, isRead: false },
    });
    return { unread: count };
  }
}
