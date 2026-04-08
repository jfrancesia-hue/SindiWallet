import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsOptional, Min } from 'class-validator';

export class RequestBenefitDto {
  @ApiProperty({ description: 'ID del beneficio a solicitar' })
  @IsString()
  benefitId: string;

  @ApiProperty({ description: 'Monto solicitado en ARS', minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Notas o comentarios del solicitante' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'URLs de archivos adjuntos' })
  @IsOptional()
  attachments?: string[];
}
