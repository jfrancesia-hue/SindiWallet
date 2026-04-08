import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RetentionItem {
  @ApiProperty({ description: 'ID del usuario' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'ID de la cuota' })
  @IsString()
  dueId: string;
}

export class BulkRetentionDto {
  @ApiProperty({ description: 'Período de la retención (YYYY-MM)', example: '2026-04' })
  @IsString()
  period: string;

  @ApiProperty({ description: 'Lista de retenciones', type: [RetentionItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RetentionItem)
  items: RetentionItem[];
}
