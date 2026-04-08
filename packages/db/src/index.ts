export { prisma } from './client';
export { PrismaClient, Prisma } from '@prisma/client';
export type * from '@prisma/client';

// Re-export enums as values (export type * only exports type-level)
export {
  Role,
  KycStatus,
  WalletStatus,
  TransactionType,
  TransactionStatus,
  DueFrequency,
  DuePaymentStatus,
  DuePaymentSource,
  BenefitRequestStatus,
  LoanStatus,
  InstallmentStatus,
  NotificationChannel,
  ReportStatus,
  ImportStatus,
} from '@prisma/client';
