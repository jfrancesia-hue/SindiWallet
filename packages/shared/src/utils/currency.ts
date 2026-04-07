import { CURRENCY_CONFIG, type CurrencyCode } from '../constants/currency';

/**
 * Formatea un monto en pesos argentinos: $1.234,56
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'ARS'): string {
  const config = CURRENCY_CONFIG[currency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  }).format(amount);
}

/**
 * Convierte string de monto a centavos (integer) para evitar floating point
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convierte centavos a monto decimal
 */
export function fromCents(cents: number): number {
  return cents / 100;
}
