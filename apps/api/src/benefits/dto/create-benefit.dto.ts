import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateBenefitDto {
  @ApiProperty({ description: 'Nombre del beneficio', example: 'Ayuda Escolar' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción detallada' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Categoría', example: 'Educación' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: 'Monto fijo del beneficio en ARS' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({ description: 'Monto máximo permitido en ARS' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  maxAmount?: number;

  @ApiPropertyOptional({ description: 'Requiere aprobación de admin', default: true })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ description: 'Requisitos en formato JSON' })
  @IsOptional()
  requirements?: Record<string, unknown>;
}
