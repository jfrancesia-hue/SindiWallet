import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (!MUTATION_METHODS.includes(method)) {
      return next.handle();
    }

    const user = request.user;
    const path = request.route?.path || request.url;
    const entity = this.extractEntity(path);

    return next.handle().pipe(
      tap((responseData) => {
        if (!user?.orgId) return;

        this.prisma.auditLog
          .create({
            data: {
              orgId: user.orgId,
              userId: user.id,
              action: `${method} ${path}`,
              entity,
              entityId: request.params?.id || responseData?.id || null,
              newData: method === 'DELETE' ? null : (request.body || null),
              ipAddress: request.ip || request.headers['x-forwarded-for'] || null,
              userAgent: request.headers['user-agent'] || null,
            },
          })
          .catch((err: Error) => {
            console.error('AuditLog error:', err.message);
          });
      }),
    );
  }

  private extractEntity(path: string): string {
    const segments = path.split('/').filter(Boolean);
    const apiIndex = segments.indexOf('v1');
    return segments[apiIndex + 1] || segments[segments.length - 1] || 'unknown';
  }
}
