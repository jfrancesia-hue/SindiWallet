import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, BulkNotificationDto } from './dto/create-notification.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrgId } from '../common/decorators/org-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(RolesGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // ── User ──

  @Get('my')
  @ApiOperation({ summary: 'Mis notificaciones' })
  myNotifications(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Query('channel') channel?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.findByUser(
      orgId,
      userId,
      channel,
      unreadOnly === 'true',
    );
  }

  @Get('my/unread-count')
  @ApiOperation({ summary: 'Cantidad de notificaciones sin leer' })
  unreadCount(@OrgId() orgId: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(orgId, userId);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  markRead(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markRead(orgId, userId, id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Marcar todas como leídas' })
  markAllRead(@OrgId() orgId: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.markAllRead(orgId, userId);
  }

  // ── Devices ──

  @Post('devices/register')
  @ApiOperation({ summary: 'Registrar dispositivo para push notifications' })
  registerDevice(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.notificationsService.registerDevice(userId, dto.fcmToken, dto.platform, dto.deviceId);
  }

  @Post('devices/unregister')
  @ApiOperation({ summary: 'Desregistrar dispositivo' })
  unregisterDevice(
    @CurrentUser('id') userId: string,
    @Body('fcmToken') fcmToken: string,
  ) {
    return this.notificationsService.unregisterDevice(userId, fcmToken);
  }

  // ── Admin ──

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Enviar notificación individual (admin)' })
  create(@OrgId() orgId: string, @Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(orgId, dto);
  }

  @Post('bulk')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Envío masivo de notificaciones (admin)' })
  sendBulk(@OrgId() orgId: string, @Body() dto: BulkNotificationDto) {
    return this.notificationsService.sendBulk(orgId, dto);
  }
}
