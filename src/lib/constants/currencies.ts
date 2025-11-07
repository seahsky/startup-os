/**
 * Currency Constants and Metadata
 *
 * This module provides comprehensive currency metadata following ISO 4217 standards.
 * It includes information about decimal places, symbols, and display names for
 * all supported currencies in the application.
 *
 * Standards followed:
 * - ISO 4217 currency codes
 * - Unicode CLDR currency symbols
 * - Proper decimal place handling
 */

/**
 * Currency information interface
 */
export interface CurrencyInfo {
  /** ISO 4217 three-letter currency code */
  code: string;
  /** Unicode currency symbol (e.g., $, €, £) */
  symbol: string;
  /** Full currency name */
  name: string;
  /** Number of decimal places (0 for JPY, 3 for BHD, 2 for most) */
  decimals: number;
  /** Symbol placement: 'before' or 'after' the amount */
  symbolPosition: 'before' | 'after';
  /** Whether to include space between symbol and amount */
  spaceAfterSymbol: boolean;
}

/**
 * Currency metadata mapping
 *
 * Includes all currencies supported by the application with their
 * proper formatting rules according to international standards.
 */
export const CURRENCY_INFO: Record<string, CurrencyInfo> = {
  // North American Currencies
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  CAD: {
    code: 'CAD',
    symbol: '$',
    name: 'Canadian Dollar',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican Peso',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },

  // European Currencies
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
    symbolPosition: 'after',
    spaceAfterSymbol: true,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: true,
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    decimals: 2,
    symbolPosition: 'after',
    spaceAfterSymbol: true,
  },
  NOK: {
    code: 'NOK',
    symbol: 'kr',
    name: 'Norwegian Krone',
    decimals: 2,
    symbolPosition: 'after',
    spaceAfterSymbol: true,
  },
  DKK: {
    code: 'DKK',
    symbol: 'kr',
    name: 'Danish Krone',
    decimals: 2,
    symbolPosition: 'after',
    spaceAfterSymbol: true,
  },
  PLN: {
    code: 'PLN',
    symbol: 'zł',
    name: 'Polish Złoty',
    decimals: 2,
    symbolPosition: 'after',
    spaceAfterSymbol: true,
  },

  // Asia-Pacific Currencies
  AUD: {
    code: 'AUD',
    symbol: '$',
    name: 'Australian Dollar',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  NZD: {
    code: 'NZD',
    symbol: '$',
    name: 'New Zealand Dollar',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimals: 0, // Zero-decimal currency
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: 'South Korean Won',
    decimals: 0, // Zero-decimal currency
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  SGD: {
    code: 'SGD',
    symbol: '$',
    name: 'Singapore Dollar',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  HKD: {
    code: 'HKD',
    symbol: '$',
    name: 'Hong Kong Dollar',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    decimals: 0, // Zero-decimal currency
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  PHP: {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  VND: {
    code: 'VND',
    symbol: '₫',
    name: 'Vietnamese Dong',
    decimals: 0, // Zero-decimal currency
    symbolPosition: 'after',
    spaceAfterSymbol: true,
  },

  // Middle Eastern Currencies
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: true,
  },
  SAR: {
    code: 'SAR',
    symbol: '﷼',
    name: 'Saudi Riyal',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: true,
  },
  ILS: {
    code: 'ILS',
    symbol: '₪',
    name: 'Israeli Shekel',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: true,
  },
  // Three-decimal currencies
  BHD: {
    code: 'BHD',
    symbol: 'BD',
    name: 'Bahraini Dinar',
    decimals: 3, // Three-decimal currency
    symbolPosition: 'after',
    spaceAfterSymbol: true,
  },
  KWD: {
    code: 'KWD',
    symbol: 'KD',
    name: 'Kuwaiti Dinar',
    decimals: 3, // Three-decimal currency
    symbolPosition: 'before',
    spaceAfterSymbol: true,
  },
  OMR: {
    code: 'OMR',
    symbol: '﷼',
    name: 'Omani Rial',
    decimals: 3, // Three-decimal currency
    symbolPosition: 'before',
    spaceAfterSymbol: true,
  },
  JOD: {
    code: 'JOD',
    symbol: 'JD',
    name: 'Jordanian Dinar',
    decimals: 3, // Three-decimal currency
    symbolPosition: 'before',
    spaceAfterSymbol: true,
  },
  TND: {
    code: 'TND',
    symbol: 'DT',
    name: 'Tunisian Dinar',
    decimals: 3, // Three-decimal currency
    symbolPosition: 'before',
    spaceAfterSymbol: true,
  },

  // South American Currencies
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: true,
  },
  ARS: {
    code: 'ARS',
    symbol: '$',
    name: 'Argentine Peso',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: true,
  },
  CLP: {
    code: 'CLP',
    symbol: '$',
    name: 'Chilean Peso',
    decimals: 0, // Zero-decimal currency
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  COP: {
    code: 'COP',
    symbol: '$',
    name: 'Colombian Peso',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: true,
  },

  // African Currencies
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
  EGP: {
    code: 'EGP',
    symbol: '£',
    name: 'Egyptian Pound',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },

  // Other Major Currencies
  RUB: {
    code: 'RUB',
    symbol: '₽',
    name: 'Russian Ruble',
    decimals: 2,
    symbolPosition: 'after',
    spaceAfterSymbol: true,
  },
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    decimals: 2,
    symbolPosition: 'before',
    spaceAfterSymbol: false,
  },
};

/**
 * List of zero-decimal currencies (no fractional units)
 *
 * These currencies are tracked or have such low value units
 * that fractional amounts are not used.
 */
export const ZERO_DECIMAL_CURRENCIES = ['JPY', 'KRW', 'VND', 'IDR', 'CLP'] as const;

/**
 * List of three-decimal currencies
 *
 * Middle Eastern currencies that use three decimal places
 * for their fractional units.
 */
export const THREE_DECIMAL_CURRENCIES = ['BHD', 'KWD', 'OMR', 'JOD', 'TND'] as const;

/**
 * Default currency code for the application
 */
export const DEFAULT_CURRENCY = 'USD';

/**
 * List of all supported currency codes
 */
export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_INFO);

/**
 * Gets currency information for a given currency code
 *
 * @param currencyCode - ISO 4217 currency code
 * @returns Currency information or undefined if not found
 *
 * @example
 * getCurrencyInfo('USD') // { code: 'USD', symbol: '$', name: 'US Dollar', ... }
 */
export function getCurrencyInfo(currencyCode: string): CurrencyInfo | undefined {
  return CURRENCY_INFO[currencyCode];
}

/**
 * Gets the number of decimal places for a currency
 *
 * @param currencyCode - ISO 4217 currency code
 * @returns Number of decimal places (0, 2, or 3)
 *
 * @example
 * getCurrencyDecimals('USD') // 2
 * getCurrencyDecimals('JPY') // 0
 * getCurrencyDecimals('BHD') // 3
 */
export function getCurrencyDecimals(currencyCode: string): number {
  const info = getCurrencyInfo(currencyCode);
  return info?.decimals ?? 2; // Default to 2 if currency not found
}

/**
 * Gets the symbol for a currency
 *
 * @param currencyCode - ISO 4217 currency code
 * @returns Currency symbol or the code itself if not found
 *
 * @example
 * getCurrencySymbol('USD') // '$'
 * getCurrencySymbol('EUR') // '€'
 */
export function getCurrencySymbol(currencyCode: string): string {
  const info = getCurrencyInfo(currencyCode);
  return info?.symbol ?? currencyCode;
}

/**
 * Gets the full name for a currency
 *
 * @param currencyCode - ISO 4217 currency code
 * @returns Currency name or the code itself if not found
 *
 * @example
 * getCurrencyName('USD') // 'US Dollar'
 * getCurrencyName('EUR') // 'Euro'
 */
export function getCurrencyName(currencyCode: string): string {
  const info = getCurrencyInfo(currencyCode);
  return info?.name ?? currencyCode;
}

/**
 * Checks if a currency is zero-decimal
 *
 * @param currencyCode - ISO 4217 currency code
 * @returns true if zero-decimal currency, false otherwise
 *
 * @example
 * isZeroDecimalCurrency('JPY') // true
 * isZeroDecimalCurrency('USD') // false
 */
export function isZeroDecimalCurrency(currencyCode: string): boolean {
  return ZERO_DECIMAL_CURRENCIES.includes(currencyCode as any);
}

/**
 * Checks if a currency is three-decimal
 *
 * @param currencyCode - ISO 4217 currency code
 * @returns true if three-decimal currency, false otherwise
 *
 * @example
 * isThreeDecimalCurrency('BHD') // true
 * isThreeDecimalCurrency('USD') // false
 */
export function isThreeDecimalCurrency(currencyCode: string): boolean {
  return THREE_DECIMAL_CURRENCIES.includes(currencyCode as any);
}

/**
 * Checks if a currency code is supported
 *
 * @param currencyCode - ISO 4217 currency code
 * @returns true if supported, false otherwise
 *
 * @example
 * isSupportedCurrency('USD') // true
 * isSupportedCurrency('XYZ') // false
 */
export function isSupportedCurrency(currencyCode: string): boolean {
  return currencyCode in CURRENCY_INFO;
}
