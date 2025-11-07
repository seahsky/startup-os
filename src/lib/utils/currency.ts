/**
 * Currency Formatting Utilities
 *
 * Enhanced currency formatting with support for multiple display modes,
 * proper decimal handling for all currencies, and accessibility features.
 *
 * Standards followed:
 * - ISO 4217 currency codes
 * - Unicode CLDR formatting
 * - WCAG accessibility guidelines
 * - ECMAScript Intl.NumberFormat specification
 */

import {
  getCurrencyInfo,
  getCurrencyDecimals as getDecimals,
  getCurrencySymbol as getSymbol,
  getCurrencyName,
  isZeroDecimalCurrency,
  isThreeDecimalCurrency,
} from '../constants/currencies';
import type {
  CurrencyCode,
  CurrencyDisplayMode,
  CurrencyFormatOptions,
  FormattedCurrency,
} from '../types/currency';

/**
 * Default locale for standardized formatting
 */
const DEFAULT_LOCALE = 'en-US';

/**
 * Formats currency using Intl.NumberFormat (legacy function - kept for backward compatibility)
 *
 * @param amount - The monetary value
 * @param currency - ISO 4217 currency code
 * @param locale - Locale for formatting (defaults to en-US)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56, 'USD') // "$1,234.56"
 * formatCurrency(1234.56, 'EUR') // "€1,234.56"
 * formatCurrency(1234, 'JPY') // "¥1,234"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = DEFAULT_LOCALE
): string {
  const decimals = getDecimals(currency);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Formats currency with symbol display (compact mode for tables)
 *
 * Uses currency symbols ($ € £) with proper placement and spacing
 * according to currency conventions. Always uses en-US locale for
 * standardized formatting.
 *
 * @param amount - The monetary value
 * @param currency - ISO 4217 currency code
 * @returns Formatted currency string with symbol
 *
 * @example
 * formatCurrencyWithSymbol(1234.56, 'USD') // "$1,234.56"
 * formatCurrencyWithSymbol(1234.56, 'EUR') // "€1,234.56"
 * formatCurrencyWithSymbol(1234, 'JPY') // "¥1,234"
 */
export function formatCurrencyWithSymbol(
  amount: number,
  currency: CurrencyCode
): string {
  const decimals = getDecimals(currency);

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Formats currency with ISO code display (clear mode for forms/documents)
 *
 * Shows ISO 4217 currency code (USD, EUR, GBP) for clarity,
 * especially useful in international contexts and for accessibility.
 * Always uses en-US locale for standardized formatting.
 *
 * @param amount - The monetary value
 * @param currency - ISO 4217 currency code
 * @returns Formatted currency string with code
 *
 * @example
 * formatCurrencyWithCode(1234.56, 'USD') // "USD 1,234.56"
 * formatCurrencyWithCode(1234.56, 'EUR') // "EUR 1,234.56"
 * formatCurrencyWithCode(1234, 'JPY') // "JPY 1,234"
 */
export function formatCurrencyWithCode(
  amount: number,
  currency: CurrencyCode
): string {
  const decimals = getDecimals(currency);

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Formats currency with accessibility features
 *
 * Returns both display format and aria-label for screen readers.
 * Follows WCAG guidelines for accessible currency presentation.
 *
 * @param amount - The monetary value
 * @param currency - ISO 4217 currency code
 * @param mode - Display mode ('symbol' or 'code')
 * @returns Object with display string and aria-label
 *
 * @example
 * formatCurrencyAccessible(1234.56, 'USD', 'symbol')
 * // {
 * //   display: "$1,234.56",
 * //   ariaLabel: "1,234 US dollars and 56 cents",
 * //   currency: "USD",
 * //   amount: 1234.56
 * // }
 */
export function formatCurrencyAccessible(
  amount: number,
  currency: CurrencyCode,
  mode: CurrencyDisplayMode = 'symbol'
): FormattedCurrency {
  const display =
    mode === 'code'
      ? formatCurrencyWithCode(amount, currency)
      : formatCurrencyWithSymbol(amount, currency);

  const ariaLabel = generateAriaLabel(amount, currency);

  return {
    display,
    ariaLabel,
    currency,
    amount,
  };
}

/**
 * Generates accessible aria-label for currency amounts
 *
 * @param amount - The monetary value
 * @param currency - ISO 4217 currency code
 * @returns Aria-label string
 *
 * @example
 * generateAriaLabel(1234.56, 'USD') // "1,234 US dollars and 56 cents"
 * generateAriaLabel(1234, 'JPY') // "1,234 Japanese yen"
 */
function generateAriaLabel(amount: number, currency: CurrencyCode): string {
  const currencyName = getCurrencyName(currency);
  const decimals = getDecimals(currency);

  if (decimals === 0) {
    // Zero-decimal currencies (JPY, KRW, etc.)
    const formatted = new Intl.NumberFormat(DEFAULT_LOCALE).format(amount);
    return `${formatted} ${currencyName}`;
  }

  // Split into whole and fractional parts
  const wholePart = Math.floor(Math.abs(amount));
  const fractionalPart = Math.round((Math.abs(amount) - wholePart) * Math.pow(10, decimals));

  const wholeFormatted = new Intl.NumberFormat(DEFAULT_LOCALE).format(wholePart);
  const sign = amount < 0 ? 'negative ' : '';

  if (fractionalPart === 0) {
    return `${sign}${wholeFormatted} ${currencyName}`;
  }

  const fractionalUnit = decimals === 2 ? 'cents' : 'fractional units';
  return `${sign}${wholeFormatted} ${currencyName} and ${fractionalPart} ${fractionalUnit}`;
}

/**
 * Formats currency with custom options
 *
 * @param amount - The monetary value
 * @param currency - ISO 4217 currency code
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * formatCurrencyWithOptions(1234.56, 'USD', { mode: 'code', accountingFormat: false })
 * // "USD 1,234.56"
 *
 * formatCurrencyWithOptions(-1234.56, 'USD', { mode: 'symbol', accountingFormat: true })
 * // "($1,234.56)"
 */
export function formatCurrencyWithOptions(
  amount: number,
  currency: CurrencyCode,
  options: CurrencyFormatOptions = {}
): string {
  const {
    mode = 'symbol',
    accountingFormat = false,
    locale = DEFAULT_LOCALE,
  } = options;

  const decimals = getDecimals(currency);

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: mode === 'code' ? 'code' : 'symbol',
    currencySign: accountingFormat ? 'accounting' : 'standard',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return formatted;
}

/**
 * Gets the number of decimal places for a currency
 *
 * @param currency - ISO 4217 currency code
 * @returns Number of decimal places (0, 2, or 3)
 *
 * @example
 * getCurrencyDecimals('USD') // 2
 * getCurrencyDecimals('JPY') // 0
 * getCurrencyDecimals('BHD') // 3
 */
export function getCurrencyDecimals(currency: CurrencyCode): number {
  return getDecimals(currency);
}

/**
 * Gets the currency symbol
 *
 * @param currency - ISO 4217 currency code
 * @returns Currency symbol
 *
 * @example
 * getCurrencySymbol('USD') // '$'
 * getCurrencySymbol('EUR') // '€'
 * getCurrencySymbol('GBP') // '£'
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return getSymbol(currency);
}

/**
 * Parses a currency string to a number
 *
 * Removes currency symbols, spaces, and formatting to extract the numeric value.
 *
 * @param value - Currency string to parse
 * @returns Numeric value
 *
 * @example
 * parseCurrency('$1,234.56') // 1234.56
 * parseCurrency('EUR 1.234,56') // 1234.56
 * parseCurrency('¥1,234') // 1234
 */
export function parseCurrency(value: string): number {
  // Remove all non-numeric characters except decimal point, comma, and minus
  let cleaned = value.replace(/[^\d.,-]/g, '');

  // Handle European format (comma as decimal separator)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // If both exist, determine which is decimal separator
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    if (lastComma > lastDot) {
      // Comma is decimal separator (European format)
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Dot is decimal separator (US format)
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    // Only comma - check if it's thousand separator or decimal
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Likely decimal separator
      cleaned = cleaned.replace(',', '.');
    } else {
      // Thousand separator
      cleaned = cleaned.replace(/,/g, '');
    }
  }

  return parseFloat(cleaned) || 0;
}

/**
 * Rounds a currency amount to the appropriate number of decimal places
 *
 * Automatically determines the correct number of decimals based on currency.
 *
 * @param amount - Amount to round
 * @param currency - ISO 4217 currency code
 * @returns Rounded amount
 *
 * @example
 * roundCurrency(1234.567, 'USD') // 1234.57
 * roundCurrency(1234.567, 'JPY') // 1235
 * roundCurrency(1234.5678, 'BHD') // 1234.568
 */
export function roundCurrency(amount: number, currency: CurrencyCode = 'USD'): number {
  const decimals = getDecimals(currency);
  return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Formats a currency amount for compact display
 *
 * Abbreviates large numbers (K, M, B) while maintaining currency format.
 *
 * @param amount - The monetary value
 * @param currency - ISO 4217 currency code
 * @returns Compact formatted string
 *
 * @example
 * formatCurrencyCompact(1234, 'USD') // "$1.23K"
 * formatCurrencyCompact(1234567, 'USD') // "$1.23M"
 * formatCurrencyCompact(1234567890, 'USD') // "$1.23B"
 */
export function formatCurrencyCompact(
  amount: number,
  currency: CurrencyCode
): string {
  const decimals = getDecimals(currency);

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency,
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(amount);
}
