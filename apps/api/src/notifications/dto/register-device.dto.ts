import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum DevicePlatform {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  @IsEnum(DevicePlatform)
  platform: DevicePlatform;

  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
