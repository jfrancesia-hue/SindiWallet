import { IsString, IsOptional, IsUrl, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBrandingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({ example: '#1F2B6C', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color hexadecimal inválido' })
  primaryColor?: string;

  @ApiProperty({ example: '#00A89D', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color hexadecimal inválido' })
  secondaryColor?: string;

  @ApiProperty({ example: '#F58220', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color hexadecimal inválido' })
  accentColor?: string;
}
