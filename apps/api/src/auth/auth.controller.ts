import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './dto/login.dto';
import { MfaVerifyDto } from './dto/mfa.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo afiliado' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Login con email y password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refrescar access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Public()
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar reset de contraseña' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Resetear contraseña con token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.userId, dto.password);
  }

  @ApiBearerAuth()
  @Post('mfa/enroll')
  @ApiOperation({ summary: 'Enrollar MFA (TOTP)' })
  enrollMfa(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    return this.authService.enrollMfa(token);
  }

  @ApiBearerAuth()
  @Post('mfa/verify')
  @ApiOperation({ summary: 'Verificar código MFA' })
  verifyMfa(@Headers('authorization') auth: string, @Body() dto: MfaVerifyDto) {
    const token = auth?.replace('Bearer ', '');
    return this.authService.verifyMfa(token, dto.factorId, dto.code);
  }
}
