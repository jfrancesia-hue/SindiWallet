import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase;

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const {
        data: { user: supabaseUser },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !supabaseUser) {
        throw new UnauthorizedException('Token inválido o expirado');
      }

      const user = await this.prisma.user.findUnique({
        where: { supabaseUserId: supabaseUser.id },
        include: { organization: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario no encontrado o inactivo');
      }

      request.user = {
        id: user.id,
        supabaseUserId: user.supabaseUserId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        orgId: user.orgId,
        organization: user.organization,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Error de autenticación');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
