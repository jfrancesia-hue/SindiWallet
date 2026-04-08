import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PaymentsModule } from './payments/payments.module';
import { DuesModule } from './dues/dues.module';
import { LoansModule } from './loans/loans.module';
import { BenefitsModule } from './benefits/benefits.module';
import { MerchantsModule } from './merchants/merchants.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';
import { ImportsModule } from './imports/imports.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { WebsocketModule } from './websocket/websocket.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { AuditInterceptor } from './audit/audit.interceptor';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    WalletsModule,
    TransactionsModule,
    PaymentsModule,
    DuesModule,
    LoansModule,
    BenefitsModule,
    MerchantsModule,
    NotificationsModule,
    ReportsModule,
    AuditModule,
    ImportsModule,
    ChatbotModule,
    WebsocketModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
