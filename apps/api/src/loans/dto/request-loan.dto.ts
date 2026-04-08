import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsInt, IsIn, IsString, Min, Max } from 'class-validator';

export class RequestLoanDto {
  @ApiProperty({ description: 'Monto solicitado en ARS', minimum: 1000, maximum: 500000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(1000)
  @Max(500000)
  amount: number;

  @ApiProperty({ description: 'Plazo en meses', enum: [3, 6, 9, 12, 18, 24] })
  @IsInt()
  @IsIn([3, 6, 9, 12, 18, 24])
  termMonths: number;

  @ApiProperty({ description: 'Clave de idempotencia única' })
  @IsString()
  idempotencyKey: string;
}
