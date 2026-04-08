import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class CreateMerchantDto {
  @ApiProperty({ description: 'ID del usuario que será el merchant' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Razón social', example: 'Farmacia del Pueblo SRL' })
  @IsString()
  businessName: string;

  @ApiProperty({ description: 'CUIT del comercio', example: '30-71234567-9' })
  @IsString()
  @Matches(/^\d{2}-\d{8}-\d{1}$/, { message: 'Formato de CUIT inválido (XX-XXXXXXXX-X)' })
  cuit: string;

  @ApiProperty({ description: 'Categoría del comercio', example: 'Farmacia' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: 'Dirección' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Teléfono' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Porcentaje de descuento para afiliados', minimum: 0, maximum: 50 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(50)
  discountPercent?: number;

  @ApiPropertyOptional({
    description: 'Frecuencia de liquidación',
    enum: ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'],
    default: 'WEEKLY',
  })
  @IsOptional()
  @IsIn(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'])
  settlementFrequency?: string;
}
