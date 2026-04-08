import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsOptional, Length, Matches, Min } from 'class-validator';

export class TransferCvuDto {
  @ApiProperty({ description: 'CVU destino (22 dígitos)', example: '0000003100025419479867' })
  @IsString()
  @Length(22, 22, { message: 'El CVU debe tener exactamente 22 dígitos' })
  @Matches(/^\d{22}$/, { message: 'El CVU debe contener solo dígitos numéricos' })
  destinationCvu: string;

  @ApiProperty({ description: 'Monto a transferir en ARS', minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Descripción de la transferencia' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Clave de idempotencia única' })
  @IsString()
  idempotencyKey: string;
}
