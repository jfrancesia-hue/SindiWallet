import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class CreateImportDto {
  @ApiProperty({ description: 'Tipo de importación', enum: ['USERS', 'DUES', 'MERCHANTS'] })
  @IsIn(['USERS', 'DUES', 'MERCHANTS'])
  type: string;

  @ApiProperty({ description: 'Nombre del archivo subido' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'Contenido CSV en base64' })
  @IsString()
  csvBase64: string;
}
