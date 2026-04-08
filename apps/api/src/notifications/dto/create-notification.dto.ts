import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional, IsArray } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID del usuario destinatario' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Canal', enum: ['PUSH', 'EMAIL', 'WHATSAPP', 'IN_APP'] })
  @IsIn(['PUSH', 'EMAIL', 'WHATSAPP', 'IN_APP'])
  channel: string;

  @ApiProperty({ description: 'Título' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Cuerpo del mensaje' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ description: 'Datos adicionales en JSON' })
  @IsOptional()
  data?: Record<string, unknown>;
}

export class BulkNotificationDto {
  @ApiPropertyOptional({ description: 'IDs de usuarios (vacío = todos los afiliados)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiProperty({ description: 'Canal', enum: ['PUSH', 'EMAIL', 'WHATSAPP', 'IN_APP'] })
  @IsIn(['PUSH', 'EMAIL', 'WHATSAPP', 'IN_APP'])
  channel: string;

  @ApiProperty({ description: 'Título' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Cuerpo del mensaje' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ description: 'Datos adicionales' })
  @IsOptional()
  data?: Record<string, unknown>;
}
