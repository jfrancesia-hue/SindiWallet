import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from './supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async register(dto: RegisterDto) {
    // Verificar que la organización existe
    const org = await this.prisma.organization.findUnique({
      where: { id: dto.orgId },
    });

    if (!org || !org.isActive) {
      throw new BadRequestException('Organización no encontrada o inactiva');
    }

    // Verificar email y DNI únicos dentro de la org
    const existing = await this.prisma.user.findFirst({
      where: {
        orgId: dto.orgId,
        OR: [{ email: dto.email }, { dni: dto.dni }],
      },
    });

    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? 'Ya existe un usuario con ese email en esta organización'
          : 'Ya existe un usuario con ese DNI en esta organización',
      );
    }

    // Crear usuario en Supabase Auth
    const supabaseUser = await this.supabase.createUser(dto.email, dto.password);

    // Crear usuario en DB local
    const user = await this.prisma.user.create({
      data: {
        orgId: dto.orgId,
        supabaseUserId: supabaseUser.id,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dni: dto.dni,
        phone: dto.phone || null,
        role: 'AFFILIATE',
        kycStatus: 'PENDING',
      },
    });

    // Crear wallet para el afiliado
    await this.prisma.wallet.create({
      data: {
        orgId: dto.orgId,
        userId: user.id,
        balance: 0,
        currency: 'ARS',
        status: 'ACTIVE',
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      orgId: user.orgId,
    };
  }

  async login(dto: LoginDto) {
    try {
      const { session, user: supabaseUser } = await this.supabase.signInWithPassword(
        dto.email,
        dto.password,
      );

      const user = await this.prisma.user.findUnique({
        where: { supabaseUserId: supabaseUser.id },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario no encontrado o inactivo');
      }

      // Actualizar último login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          orgId: user.orgId,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const { session } = await this.supabase.refreshSession(refreshToken);

      if (!session) {
        throw new UnauthorizedException('No se pudo refrescar la sesión');
      }

      return {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at,
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async forgotPassword(email: string) {
    // Verificar que el usuario existe localmente
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    // No revelar si el usuario existe o no (seguridad)
    if (user) {
      await this.supabase.resetPasswordForEmail(email);
    }

    return { message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' };
  }

  async resetPassword(userId: string, newPassword: string) {
    await this.supabase.updateUserPassword(userId, newPassword);
    return { message: 'Contraseña actualizada correctamente' };
  }

  async enrollMfa(accessToken: string) {
    const data = await this.supabase.enrollMfa(accessToken);
    return {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    };
  }

  async verifyMfa(accessToken: string, factorId: string, code: string) {
    await this.supabase.verifyMfa(accessToken, factorId, code);
    return { message: 'MFA verificado correctamente' };
  }
}
