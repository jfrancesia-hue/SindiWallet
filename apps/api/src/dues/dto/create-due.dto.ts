import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsBoolean,
  IsIn,
  Min,
} from 'class-validator';

export class CreateDueDto {
  @ApiProperty({ description: 'Nombre de la cuota', example: 'Aporte Sindical Ordinario' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Monto fijo en ARS', minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Porcentaje del salario (alternativa a monto fijo)', example: 0.03 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  percentOfSalary?: number;

  @ApiPropertyOptional({ description: 'Frecuencia', enum: ['MONTHLY', 'QUARTERLY', 'ANNUAL'], default: 'MONTHLY' })
  @IsOptional()
  @IsIn(['MONTHLY', 'QUARTERLY', 'ANNUAL'])
  frequency?: string;

  @ApiPropertyOptional({ description: 'Si se cobra por retención de nómina', default: false })
  @IsOptional()
  @IsBoolean()
  isRetention?: boolean;
}
