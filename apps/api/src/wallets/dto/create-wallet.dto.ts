import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateWalletDto {
  @ApiPropertyOptional({ description: 'Alias personalizado para la wallet' })
  @IsOptional()
  @IsString()
  alias?: string;
}
