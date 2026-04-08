import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    description: 'Tipo de reporte',
    enum: ['TRANSACTIONS', 'DUES', 'LOANS', 'BENEFITS', 'MERCHANTS', 'USERS', 'WALLETS'],
  })
  @IsIn(['TRANSACTIONS', 'DUES', 'LOANS', 'BENEFITS', 'MERCHANTS', 'USERS', 'WALLETS'])
  type: string;

  @ApiPropertyOptional({ description: 'Formato de salida', enum: ['PDF', 'CSV', 'XLSX'], default: 'PDF' })
  @IsOptional()
  @IsIn(['PDF', 'CSV', 'XLSX'])
  format?: string;

  @ApiPropertyOptional({ description: 'Parámetros del reporte (fechas, filtros, etc)' })
  @IsOptional()
  parameters?: Record<string, unknown>;
}
