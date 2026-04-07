import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsEnum,
  MinLength,
  Matches,
  IsPositive,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'maria@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'María' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ example: 'López' })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ example: '34567890' })
  @IsString()
  @Matches(/^\d{7,8}$/)
  dni: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-?\d{7,8}-?\d$/)
  cuit?: string;

  @ApiProperty({ enum: ['ADMIN', 'AFFILIATE', 'MERCHANT'], required: false })
  @IsOptional()
  @IsEnum(['ADMIN', 'AFFILIATE', 'MERCHANT'])
  role?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employerName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employerCuit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  salary?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  memberSince?: string;
}
