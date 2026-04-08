import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from './common/decorators/public.decorator';
import { PrismaService } from './prisma/prisma.service';

@SkipThrottle()
@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'sindiwallet-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('health/ready')
  async readiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        service: 'sindiwallet-api',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        service: 'sindiwallet-api',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Public()
  @Get('health/detailed')
  async detailed() {
    const dbStart = Date.now();
    let dbStatus = 'connected';
    let dbLatencyMs = 0;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStart;
    } catch {
      dbStatus = 'disconnected';
      dbLatencyMs = -1;
    }

    const memUsage = process.memoryUsage();

    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      service: 'sindiwallet-api',
      version: '0.1.0',
      environment: process.env.APP_ENV || 'development',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      },
    };
  }
}
