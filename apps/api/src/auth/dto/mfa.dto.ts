import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MfaVerifyDto {
  @ApiProperty({ example: 'totp-factor-id' })
  @IsString()
  factorId: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
  code: string;
}
