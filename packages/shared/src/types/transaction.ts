import type { TransactionType, TransactionStatus } from '../constants/transaction-types';

export interface Transaction {
  id: string;
  orgId: string;
  idempotencyKey: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee: number;
  currency: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  reference: string | null;
  senderId: string | null;
  receiverId: string | null;
  walletFromId: string | null;
  walletToId: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface TransferPayload {
  receiverId: string;
  amount: number;
  description?: string;
  idempotencyKey: string;
}

export interface TransferCvuPayload {
  cvu: string;
  amount: number;
  description?: string;
  idempotencyKey: string;
}

export interface TransactionFilter {
  type?: TransactionType;
  status?: TransactionStatus;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}
