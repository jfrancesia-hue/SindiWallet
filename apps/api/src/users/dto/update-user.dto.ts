import { IsString, IsOptional, IsUrl, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

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
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}

export class KycUpdateDto {
  @ApiProperty({ enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'] })
  @IsString()
  status: string;

  @ApiProperty({ required: false })
  @IsOptional()
  kycData?: Record<string, unknown>;
}
