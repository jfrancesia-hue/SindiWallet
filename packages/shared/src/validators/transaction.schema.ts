import { z } from 'zod';

export const transferSchema = z.object({
  receiverId: z.string().cuid(),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  description: z.string().max(200).optional(),
  idempotencyKey: z.string().uuid(),
});

export const transferCvuSchema = z.object({
  cvu: z.string().length(22, 'El CVU debe tener 22 dígitos'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  description: z.string().max(200).optional(),
  idempotencyKey: z.string().uuid(),
});

export const transactionFilterSchema = z.object({
  type: z
    .enum([
      'DEPOSIT', 'WITHDRAWAL', 'TRANSFER_INTERNAL', 'TRANSFER_CVU',
      'PAYMENT_QR', 'PAYMENT_DEBIN', 'PAYMENT_MERCHANT',
      'DUE_PAYMENT', 'DUE_RETENTION', 'LOAN_DISBURSEMENT',
      'LOAN_REPAYMENT', 'BENEFIT_CREDIT', 'FEE', 'REFUND',
    ])
    .optional(),
  status: z
    .enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED', 'CANCELLED'])
    .optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type TransferInput = z.infer<typeof transferSchema>;
export type TransferCvuInput = z.infer<typeof transferCvuSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
