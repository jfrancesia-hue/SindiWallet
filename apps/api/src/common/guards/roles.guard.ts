import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ROLE_HIERARCHY } from '@sindiwallet/shared';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Acceso denegado');

    const userLevel = ROLE_HIERARCHY[user.role as keyof typeof ROLE_HIERARCHY] || 0;
    const hasRole = requiredRoles.some((role) => {
      const requiredLevel = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] || 0;
      return userLevel >= requiredLevel;
    });

    if (!hasRole) {
      throw new ForbiddenException('No tenés permisos para esta acción');
    }

    return true;
  }
}
