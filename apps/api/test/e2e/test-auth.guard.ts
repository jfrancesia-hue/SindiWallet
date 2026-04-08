import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../src/prisma/prisma.service';

@Injectable()
export class TestAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const testUserId = request.headers['x-test-user-id'];

    if (!testUserId) {
      throw new UnauthorizedException('x-test-user-id header required for E2E tests');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: testUserId },
      include: { organization: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Test user not found or inactive');
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
  }
}
