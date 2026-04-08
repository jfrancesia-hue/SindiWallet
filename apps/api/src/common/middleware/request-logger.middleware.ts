import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import pino from 'pino';

const logger = pino({
  level: process.env.APP_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.APP_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
    : undefined,
});

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();
    const start = Date.now();

    // Attach request ID to response header
    res.setHeader('x-request-id', requestId);

    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        userAgent: req.headers['user-agent']?.substring(0, 100),
      };

      if (res.statusCode >= 500) {
        logger.error(logData, 'Request failed');
      } else if (res.statusCode >= 400) {
        logger.warn(logData, 'Request error');
      } else {
        logger.info(logData, 'Request completed');
      }
    });

    next();
  }
}

export { logger };
