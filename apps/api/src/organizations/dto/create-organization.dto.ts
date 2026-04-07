import { IsString, IsEmail, IsOptional, IsUrl, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'ATE Catamarca' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'ate-catamarca' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, { message: 'Solo letras minúsculas, números y guiones' })
  slug: string;

  @ApiProperty({ example: '30-12345678-9' })
  @IsString()
  @Matches(/^\d{2}-?\d{7,8}-?\d$/, { message: 'CUIT inválido' })
  cuit: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  website?: string;
}
