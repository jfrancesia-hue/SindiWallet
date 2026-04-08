import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsOptional, IsString, Min } from 'class-validator';

export class GenerateQrDto {
  @ApiProperty({ description: 'Monto a cobrar en ARS', minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Descripción del cobro' })
  @IsOptional()
  @IsString()
  description?: string;
}
