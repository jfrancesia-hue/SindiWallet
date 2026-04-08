import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsOptional, Min } from 'class-validator';

export class PayQrDto {
  @ApiProperty({ description: 'Datos del QR escaneado (base64)' })
  @IsString()
  qrData: string;

  @ApiProperty({ description: 'Monto a pagar en ARS', minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Clave de idempotencia única' })
  @IsString()
  idempotencyKey: string;

  @ApiPropertyOptional({ description: 'Descripción adicional' })
  @IsOptional()
  @IsString()
  description?: string;
}
