import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

const AUDITABLE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (!AUDITABLE_METHODS.includes(method)) {
      return next.handle();
    }

    const orgId = request.headers['x-org-id'] ?? request.user?.orgId;
    const userId = request.user?.id;
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const entity = controller.replace('Controller', '');
    const action = `${method} ${handler}`;

    return next.handle().pipe(
      tap((responseData) => {
        if (orgId) {
          this.auditService
            .log({
              orgId,
              userId,
              action,
              entity,
              entityId: (responseData as Record<string, unknown>)?.id as string ?? request.params?.id,
              newData: method === 'DELETE' ? undefined : request.body,
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
            })
            .catch(() => {});
        }
      }),
    );
  }
}
