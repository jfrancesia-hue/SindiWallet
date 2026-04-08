import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class BaasWebhookDto {
  @ApiProperty({ description: 'Tipo de evento', enum: ['TRANSFER_IN', 'TRANSFER_OUT', 'DEBIN_REQUEST', 'DEBIN_RESPONSE'] })
  @IsIn(['TRANSFER_IN', 'TRANSFER_OUT', 'DEBIN_REQUEST', 'DEBIN_RESPONSE'])
  event: string;

  @ApiProperty({ description: 'ID de la transacción en BaaS' })
  @IsString()
  transactionId: string;

  @ApiProperty({ description: 'CVU de origen' })
  @IsString()
  fromCvu: string;

  @ApiProperty({ description: 'CVU de destino' })
  @IsString()
  toCvu: string;

  @ApiProperty({ description: 'Monto' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Moneda', default: 'ARS' })
  @IsString()
  currency: string;

  @ApiPropertyOptional({ description: 'Estado del evento' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Referencia' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ description: 'Firma HMAC del payload' })
  @IsOptional()
  @IsString()
  signature?: string;
}
