import { Test } from '@nestjs/testing';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: any;

  const ORG_ID = 'org-1';
  const USER_ID = 'user-1';

  beforeEach(async () => {
    const mockPrisma = {
      notification: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        createMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
      user: { findMany: jest.fn() },
    };

    const module = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(NotificationsService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create a notification', async () => {
      prisma.notification.create.mockResolvedValue({
        id: 'n-1', title: 'Test', body: 'Msg', channel: 'IN_APP',
      });

      const result = await service.create(ORG_ID, {
        userId: USER_ID, channel: 'IN_APP', title: 'Test', body: 'Msg',
      });

      expect(result.title).toBe('Test');
    });
  });

  describe('sendBulk', () => {
    it('should send to all users if no userIds provided', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'u1' }, { id: 'u2' }, { id: 'u3' },
      ]);
      prisma.notification.createMany.mockResolvedValue({ count: 3 });

      const result = await service.sendBulk(ORG_ID, {
        channel: 'PUSH', title: 'Aviso', body: 'Mensaje masivo',
      });

      expect(result.sent).toBe(3);
    });

    it('should send only to specified userIds', async () => {
      prisma.notification.createMany.mockResolvedValue({ count: 2 });

      const result = await service.sendBulk(ORG_ID, {
        userIds: ['u1', 'u2'],
        channel: 'EMAIL', title: 'Aviso', body: 'Mensaje',
      });

      expect(result.sent).toBe(2);
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });
  });

  describe('markRead', () => {
    it('should mark notification as read', async () => {
      prisma.notification.findFirst.mockResolvedValue({ id: 'n-1', isRead: false });
      prisma.notification.update.mockResolvedValue({ id: 'n-1', isRead: true });

      const result = await service.markRead(ORG_ID, USER_ID, 'n-1');
      expect(result.isRead).toBe(true);
    });

    it('should throw if notification not found', async () => {
      prisma.notification.findFirst.mockResolvedValue(null);

      await expect(
        service.markRead(ORG_ID, USER_ID, 'n-999'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllRead', () => {
    it('should update all unread notifications', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllRead(ORG_ID, USER_ID);
      expect(result.updated).toBe(5);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      prisma.notification.count.mockResolvedValue(3);

      const result = await service.getUnreadCount(ORG_ID, USER_ID);
      expect(result.unread).toBe(3);
    });
  });
});
