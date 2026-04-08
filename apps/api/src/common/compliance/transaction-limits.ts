/**
 * Límites transaccionales BCRA para PSP (Proveedores de Servicios de Pago)
 * Comunicación "A" 7153 y modificatorias
 */

export const TRANSACTION_LIMITS = {
  // Límites por transacción individual (ARS)
  TRANSFER_INTERNAL: {
    min: 1,
    max: 500000,
    dailyMax: 2000000,
    monthlyMax: 10000000,
  },
  TRANSFER_CVU: {
    min: 1,
    max: 500000,
    dailyMax: 2000000,
    monthlyMax: 10000000,
  },
  PAYMENT_QR: {
    min: 1,
    max: 200000,
    dailyMax: 1000000,
    monthlyMax: 5000000,
  },
  DUE_PAYMENT: {
    min: 1,
    max: 500000,
    dailyMax: 2000000,
    monthlyMax: 10000000,
  },

  // Límites de wallet
  WALLET_MAX_BALANCE: 10000000, // $10M ARS

  // KYC tiers (Resolución UIF)
  KYC_PENDING: {
    dailyMax: 50000,
    monthlyMax: 200000,
    maxBalance: 200000,
  },
  KYC_APPROVED: {
    dailyMax: 2000000,
    monthlyMax: 10000000,
    maxBalance: 10000000,
  },
} as const;

// Horarios de operación para transferencias CVU (días hábiles BCRA)
export const OPERATION_HOURS = {
  CVU_TRANSFER_START: 6, // 06:00 AM
  CVU_TRANSFER_END: 23, // 11:00 PM
} as const;
