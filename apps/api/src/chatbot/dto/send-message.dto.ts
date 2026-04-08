import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'Mensaje del usuario' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'ID de sesión existente (omitir para crear nueva)' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
