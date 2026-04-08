import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionFilterDto {
  @ApiPropertyOptional({
    description: 'Tipo de transacción',
    enum: [
      'DEPOSIT', 'WITHDRAWAL', 'TRANSFER_INTERNAL', 'TRANSFER_CVU',
      'PAYMENT_QR', 'PAYMENT_DEBIN', 'PAYMENT_MERCHANT', 'DUE_PAYMENT',
      'DUE_RETENTION', 'LOAN_DISBURSEMENT', 'LOAN_REPAYMENT',
      'BENEFIT_CREDIT', 'FEE', 'REFUND',
    ],
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Estado de la transacción',
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED', 'CANCELLED'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Fecha de inicio (ISO 8601)', example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin (ISO 8601)', example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Número de página', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Elementos por página', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
