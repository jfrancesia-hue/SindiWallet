import { IsEmail, IsString, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'maria@gmail.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'Debe contener al menos una mayúscula' })
  @Matches(/[0-9]/, { message: 'Debe contener al menos un número' })
  password: string;

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
  @Matches(/^\d{7,8}$/, { message: 'DNI debe tener 7 u 8 dígitos' })
  dni: string;

  @ApiProperty({ example: '+5493834123456', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
  @IsString()
  orgId: string;
}
