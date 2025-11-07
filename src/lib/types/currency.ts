/**
 * Currency Type Definitions
 *
 * Type-safe currency handling throughout the application.
 * Provides union types and interfaces for currency operations.
 */

import { SUPPORTED_CURRENCIES } from '../constants/currencies';

/**
 * Supported currency codes
 *
 * Type-safe union of all supported ISO 4217 currency codes
 */
export type CurrencyCode =
  | 'USD' // US Dollar
  | 'CAD' // Canadian Dollar
  | 'EUR' // Euro
  | 'GBP' // British Pound
  | 'AUD' // Australian Dollar
  | 'NZD' // New Zealand Dollar
  | 'JPY' // Japanese Yen
  | 'CNY' // Chinese Yuan
  | 'KRW' // South Korean Won
  | 'SGD' // Singapore Dollar
  | 'HKD' // Hong Kong Dollar
  | 'INR' // Indian Rupee
  | 'MYR' // Malaysian Ringgit
  | 'THB' // Thai Baht
  | 'IDR' // Indonesian Rupiah
  | 'PHP' // Philippine Peso
  | 'VND' // Vietnamese Dong
  | 'AED' // UAE Dirham
  | 'SAR' // Saudi Riyal
  | 'ILS' // Israeli Shekel
  | 'BHD' // Bahraini Dinar
  | 'KWD' // Kuwaiti Dinar
  | 'OMR' // Omani Rial
  | 'JOD' // Jordanian Dinar
  | 'TND' // Tunisian Dinar
  | 'BRL' // Brazilian Real
  | 'ARS' // Argentine Peso
  | 'CLP' // Chilean Peso
  | 'COP' // Colombian Peso
  | 'MXN' // Mexican Peso
  | 'ZAR' // South African Rand
  | 'NGN' // Nigerian Naira
  | 'EGP' // Egyptian Pound
  | 'RUB' // Russian Ruble
  | 'TRY' // Turkish Lira
  | 'CHF' // Swiss Franc
  | 'SEK' // Swedish Krona
  | 'NOK' // Norwegian Krone
  | 'DKK' // Danish Krone
  | 'PLN'; // Polish Złoty

/**
 * Currency display mode
 *
 * - 'symbol': Show currency symbol ($, €, £)
 * - 'code': Show ISO 4217 currency code (USD, EUR, GBP)
 */
export type CurrencyDisplayMode = 'symbol' | 'code';

/**
 * Currency formatting options
 */
export interface CurrencyFormatOptions {
  /** Display mode: symbol or code */
  mode?: CurrencyDisplayMode;
  /** Whether to show sign for positive numbers */
  showPlusSign?: boolean;
  /** Use accounting format for negatives (parentheses) */
  accountingFormat?: boolean;
  /** Include accessibility label */
  includeAccessibility?: boolean;
  /** Locale for formatting (defaults to en-US) */
  locale?: string;
}

/**
 * Formatted currency result
 */
export interface FormattedCurrency {
  /** The formatted string (e.g., "$1,234.56" or "USD 1,234.56") */
  display: string;
  /** Aria-label for accessibility (e.g., "1,234 dollars and 56 cents") */
  ariaLabel?: string;
  /** Currency code */
  currency: CurrencyCode;
  /** Original amount */
  amount: number;
}

/**
 * Money value in storage format
 */
export interface MoneyStorage {
  /** Amount in cents (minor units) */
  amountInCents: number;
  /** ISO 4217 currency code */
  currency: CurrencyCode;
}

/**
 * Currency selection option (for dropdowns)
 */
export interface CurrencyOption {
  /** Currency code */
  value: CurrencyCode;
  /** Display label (e.g., "USD - US Dollar") */
  label: string;
  /** Currency symbol */
  symbol: string;
}

/**
 * Type guard to check if a string is a valid currency code
 *
 * @param code - String to check
 * @returns true if valid currency code, false otherwise
 */
export function isCurrencyCode(code: string): code is CurrencyCode {
  return SUPPORTED_CURRENCIES.includes(code);
}

/**
 * Asserts that a string is a valid currency code
 *
 * @param code - String to check
 * @throws Error if not a valid currency code
 */
export function assertCurrencyCode(code: string): asserts code is CurrencyCode {
  if (!isCurrencyCode(code)) {
    throw new Error(`Invalid currency code: ${code}`);
  }
}

/**
 * Zero-decimal currency type
 */
export type ZeroDecimalCurrency = 'JPY' | 'KRW' | 'VND' | 'IDR' | 'CLP';

/**
 * Three-decimal currency type
 */
export type ThreeDecimalCurrency = 'BHD' | 'KWD' | 'OMR' | 'JOD' | 'TND';

/**
 * Standard two-decimal currency type
 */
export type TwoDecimalCurrency = Exclude<
  CurrencyCode,
  ZeroDecimalCurrency | ThreeDecimalCurrency
>;
