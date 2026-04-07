import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'maria@gmail.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'maria@gmail.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: 'Debe contener al menos una mayúscula' })
  @Matches(/[0-9]/, { message: 'Debe contener al menos un número' })
  password: string;
}
