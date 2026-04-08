import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional } from 'class-validator';

export class ReviewBenefitDto {
  @ApiProperty({ description: 'Decisión', enum: ['APPROVED', 'REJECTED'] })
  @IsIn(['APPROVED', 'REJECTED'])
  decision: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ description: 'Notas del revisor' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
