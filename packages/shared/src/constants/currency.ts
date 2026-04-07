export const DEFAULT_CURRENCY = 'ARS';

export const CURRENCY_CONFIG = {
  ARS: {
    code: 'ARS',
    symbol: '$',
    name: 'Peso Argentino',
    decimalPlaces: 2,
    locale: 'es-AR',
  },
} as const;

export type CurrencyCode = keyof typeof CURRENCY_CONFIG;
