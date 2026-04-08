import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsOptional, IsUUID, Min } from 'class-validator';

export class TransferDto {
  @ApiProperty({ description: 'ID de la wallet destino' })
  @IsString()
  walletToId: string;

  @ApiProperty({ description: 'Monto a transferir en ARS', minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Descripción u observaciones de la transferencia' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Clave de idempotencia única para evitar duplicados' })
  @IsString()
  idempotencyKey: string;
}
