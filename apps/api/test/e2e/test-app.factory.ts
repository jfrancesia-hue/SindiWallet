import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';
import { TestAuthGuard } from './test-auth.guard';
import { SupabaseService } from '../../src/auth/supabase.service';
import { randomUUID } from 'crypto';

export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(APP_GUARD)
    .useClass(TestAuthGuard)
    .overrideProvider(SupabaseService)
    .useValue({
      createUser: async (email: string, _password: string) => ({
        id: randomUUID(),
        email,
      }),
      signInWithPassword: async () => ({
        session: {
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          expires_at: Math.floor(Date.now() / 1000) + 86400,
        },
        user: { id: randomUUID() },
      }),
      getUser: async () => ({ id: randomUUID() }),
      refreshSession: async () => ({
        session: {
          access_token: 'test-token-new',
          refresh_token: 'test-refresh-new',
          expires_at: Math.floor(Date.now() / 1000) + 86400,
        },
      }),
      resetPasswordForEmail: async () => {},
      updateUserPassword: async () => {},
      deleteUser: async () => {},
      getClient: () => ({}),
    } as any)
    .compile();

  const app = moduleFixture.createNestApplication();

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.init();

  const prisma = app.get(PrismaService);

  return { app, prisma };
}
