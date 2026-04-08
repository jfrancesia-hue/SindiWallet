import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PayDueDto {
  @ApiProperty({ description: 'ID del tipo de cuota a pagar' })
  @IsString()
  dueId: string;

  @ApiProperty({ description: 'Período a pagar (YYYY-MM)', example: '2026-04' })
  @IsString()
  period: string;

  @ApiProperty({ description: 'Clave de idempotencia única' })
  @IsString()
  idempotencyKey: string;
}
