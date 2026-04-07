import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';

@Module({
  imports: [PrismaModule, AuthModule, OrganizationsModule, UsersModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
  ],
})
export class AppModule {}
