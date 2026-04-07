export const TransactionType = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  TRANSFER_INTERNAL: 'TRANSFER_INTERNAL',
  TRANSFER_CVU: 'TRANSFER_CVU',
  PAYMENT_QR: 'PAYMENT_QR',
  PAYMENT_DEBIN: 'PAYMENT_DEBIN',
  PAYMENT_MERCHANT: 'PAYMENT_MERCHANT',
  DUE_PAYMENT: 'DUE_PAYMENT',
  DUE_RETENTION: 'DUE_RETENTION',
  LOAN_DISBURSEMENT: 'LOAN_DISBURSEMENT',
  LOAN_REPAYMENT: 'LOAN_REPAYMENT',
  BENEFIT_CREDIT: 'BENEFIT_CREDIT',
  FEE: 'FEE',
  REFUND: 'REFUND',
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REVERSED: 'REVERSED',
  CANCELLED: 'CANCELLED',
} as const;

export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const CREDIT_TYPES: TransactionType[] = [
  'DEPOSIT',
  'TRANSFER_INTERNAL',
  'TRANSFER_CVU',
  'LOAN_DISBURSEMENT',
  'BENEFIT_CREDIT',
  'REFUND',
];

export const DEBIT_TYPES: TransactionType[] = [
  'WITHDRAWAL',
  'PAYMENT_QR',
  'PAYMENT_DEBIN',
  'PAYMENT_MERCHANT',
  'DUE_PAYMENT',
  'LOAN_REPAYMENT',
  'FEE',
];
