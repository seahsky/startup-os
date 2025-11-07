/**
 * Money Type System using dinero.js
 *
 * This module provides type-safe wrappers around dinero.js for handling
 * monetary values throughout the application. All monetary calculations
 * should use these utilities to ensure precision and currency safety.
 *
 * Key Principles:
 * - Store amounts in cents (minor units) to avoid floating-point errors
 * - Always include currency information
 * - Use immutable operations
 * - Validate currency matching in calculations
 *
 * @example
 * ```typescript
 * import { fromDecimal, toDecimal, add } from '@/lib/types/money';
 *
 * const price = fromDecimal(19.99, 'USD');
 * const tax = fromDecimal(1.60, 'USD');
 * const total = add(price, tax); // $21.59
 *
 * console.log(toDecimal(total)); // 21.59
 * ```
 */

import Dinero from 'dinero.js';

/**
 * Money type - represents a monetary value with currency
 */
export type Money = Dinero.Dinero;

/**
 * Currency code type - ISO 4217 three-letter codes
 */
export type CurrencyCode = string;

/**
 * Creates a Money object from an amount in cents (minor units)
 *
 * @param amountInCents - Amount in cents (e.g., 1999 for $19.99)
 * @param currency - ISO 4217 currency code (e.g., 'USD')
 * @returns Money object
 *
 * @example
 * createMoney(1999, 'USD') // $19.99
 * createMoney(100000, 'JPY') // ¥100,000 (JPY has no decimals)
 */
export const createMoney = (
  amountInCents: number,
  currency: CurrencyCode = 'USD'
): Money => {
  return Dinero({ amount: Math.round(amountInCents), currency });
};

/**
 * Creates a Money object from a decimal amount (dollars, euros, etc.)
 *
 * IMPORTANT: This converts dollars to cents for internal storage.
 * Use this when accepting user input or reading from APIs.
 *
 * @param decimal - Amount in dollars (e.g., 19.99)
 * @param currency - ISO 4217 currency code
 * @returns Money object
 *
 * @example
 * fromDecimal(19.99, 'USD') // Creates money object with 1999 cents
 * fromDecimal(100, 'JPY') // Creates money object with 100 yen (no decimals)
 */
export const fromDecimal = (
  decimal: number,
  currency: CurrencyCode = 'USD'
): Money => {
  // For zero-decimal currencies like JPY, don't multiply by 100
  const currencyData = Dinero({ amount: 0, currency }).toUnit();
  const precision = Dinero({ amount: 0, currency }).getPrecision();
  const multiplier = Math.pow(10, precision);

  const amountInCents = Math.round(decimal * multiplier);
  return Dinero({ amount: amountInCents, currency });
};

/**
 * Converts a Money object to a decimal number for display
 *
 * Use this when displaying amounts to users or formatting for output.
 *
 * @param money - Money object
 * @returns Decimal amount (e.g., 19.99)
 *
 * @example
 * const money = fromDecimal(19.99, 'USD');
 * toDecimal(money) // 19.99
 */
export const toDecimal = (money: Money): number => {
  return money.toUnit();
};

/**
 * Gets the amount in cents (minor units) from a Money object
 *
 * Use this for database storage or APIs that expect integer cents.
 *
 * @param money - Money object
 * @returns Amount in cents
 *
 * @example
 * const money = fromDecimal(19.99, 'USD');
 * getCents(money) // 1999
 */
export const getCents = (money: Money): number => {
  return money.getAmount();
};

/**
 * Gets the currency code from a Money object
 *
 * @param money - Money object
 * @returns ISO 4217 currency code
 *
 * @example
 * const money = fromDecimal(19.99, 'USD');
 * getCurrency(money) // 'USD'
 */
export const getCurrency = (money: Money): CurrencyCode => {
  return money.getCurrency();
};

/**
 * Adds two Money objects
 *
 * Currencies must match or an error will be thrown.
 *
 * @param a - First money amount
 * @param b - Second money amount
 * @returns Sum of both amounts
 * @throws Error if currencies don't match
 *
 * @example
 * const price = fromDecimal(19.99, 'USD');
 * const tax = fromDecimal(1.60, 'USD');
 * const total = add(price, tax); // $21.59
 */
export const add = (a: Money, b: Money): Money => {
  return a.add(b);
};

/**
 * Subtracts one Money object from another
 *
 * Currencies must match or an error will be thrown.
 *
 * @param a - Amount to subtract from
 * @param b - Amount to subtract
 * @returns Difference
 * @throws Error if currencies don't match
 *
 * @example
 * const total = fromDecimal(100, 'USD');
 * const discount = fromDecimal(10, 'USD');
 * const final = subtract(total, discount); // $90
 */
export const subtract = (a: Money, b: Money): Money => {
  return a.subtract(b);
};

/**
 * Multiplies a Money object by a number
 *
 * @param money - Money amount
 * @param multiplier - Number to multiply by
 * @returns Product
 *
 * @example
 * const unitPrice = fromDecimal(9.99, 'USD');
 * const total = multiply(unitPrice, 3); // $29.97
 */
export const multiply = (money: Money, multiplier: number): Money => {
  return money.multiply(multiplier);
};

/**
 * Divides a Money object by a number
 *
 * @param money - Money amount
 * @param divisor - Number to divide by
 * @returns Quotient
 *
 * @example
 * const total = fromDecimal(100, 'USD');
 * const perPerson = divide(total, 4); // $25
 */
export const divide = (money: Money, divisor: number): Money => {
  return money.divide(divisor);
};

/**
 * Calculates percentage of a Money amount
 *
 * @param money - Money amount
 * @param percentage - Percentage as decimal (e.g., 0.0825 for 8.25%)
 * @returns Percentage amount
 *
 * @example
 * const subtotal = fromDecimal(100, 'USD');
 * const tax = percentage(subtotal, 0.0825); // $8.25 (8.25% tax)
 */
export const percentage = (money: Money, percentage: number): Money => {
  return money.percentage(percentage * 100);
};

/**
 * Allocates a Money amount into shares
 *
 * Useful for splitting bills or distributing discounts.
 * Uses banker's rounding to ensure the sum equals the original amount.
 *
 * @param money - Money amount to allocate
 * @param ratios - Array of ratios (e.g., [1, 1, 1] for three equal parts)
 * @returns Array of Money objects
 *
 * @example
 * const total = fromDecimal(10, 'USD');
 * const shares = allocate(total, [1, 1, 1]); // [$3.34, $3.33, $3.33]
 */
export const allocate = (money: Money, ratios: number[]): Money[] => {
  return money.allocate(ratios);
};

/**
 * Compares two Money objects
 *
 * @param a - First money amount
 * @param b - Second money amount
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 * @throws Error if currencies don't match
 *
 * @example
 * const a = fromDecimal(10, 'USD');
 * const b = fromDecimal(20, 'USD');
 * compare(a, b) // -1
 */
export const compare = (a: Money, b: Money): number => {
  if (a.lessThan(b)) return -1;
  if (a.greaterThan(b)) return 1;
  return 0;
};

/**
 * Checks if two Money objects are equal
 *
 * @param a - First money amount
 * @param b - Second money amount
 * @returns true if equal, false otherwise
 *
 * @example
 * const a = fromDecimal(10, 'USD');
 * const b = fromDecimal(10, 'USD');
 * equals(a, b) // true
 */
export const equals = (a: Money, b: Money): boolean => {
  return a.equalsTo(b);
};

/**
 * Checks if a Money amount is zero
 *
 * @param money - Money object
 * @returns true if zero, false otherwise
 *
 * @example
 * const money = fromDecimal(0, 'USD');
 * isZero(money) // true
 */
export const isZero = (money: Money): boolean => {
  return money.isZero();
};

/**
 * Checks if a Money amount is positive
 *
 * @param money - Money object
 * @returns true if positive, false otherwise
 *
 * @example
 * const money = fromDecimal(10, 'USD');
 * isPositive(money) // true
 */
export const isPositive = (money: Money): boolean => {
  return money.isPositive();
};

/**
 * Checks if a Money amount is negative
 *
 * @param money - Money object
 * @returns true if negative, false otherwise
 *
 * @example
 * const money = fromDecimal(-10, 'USD');
 * isNegative(money) // true
 */
export const isNegative = (money: Money): boolean => {
  return money.isNegative();
};

/**
 * Checks if currencies match between two Money objects
 *
 * @param a - First money amount
 * @param b - Second money amount
 * @returns true if currencies match, false otherwise
 *
 * @example
 * const usd = fromDecimal(10, 'USD');
 * const eur = fromDecimal(10, 'EUR');
 * hasSameCurrency(usd, eur) // false
 */
export const hasSameCurrency = (a: Money, b: Money): boolean => {
  return a.hasSameCurrency(b);
};

/**
 * Converts Money to a plain object for database storage
 *
 * @param money - Money object
 * @returns Object with amountInCents and currency
 *
 * @example
 * const money = fromDecimal(19.99, 'USD');
 * toStorageObject(money) // { amountInCents: 1999, currency: 'USD' }
 */
export const toStorageObject = (money: Money): { amountInCents: number; currency: CurrencyCode } => {
  return {
    amountInCents: getCents(money),
    currency: getCurrency(money),
  };
};

/**
 * Creates Money from a storage object
 *
 * @param obj - Object with amountInCents and currency
 * @returns Money object
 *
 * @example
 * fromStorageObject({ amountInCents: 1999, currency: 'USD' }) // $19.99
 */
export const fromStorageObject = (obj: { amountInCents: number; currency: CurrencyCode }): Money => {
  return createMoney(obj.amountInCents, obj.currency);
};

/**
 * Creates a zero Money amount for a given currency
 *
 * @param currency - ISO 4217 currency code
 * @returns Money object with zero amount
 *
 * @example
 * zero('USD') // $0.00
 */
export const zero = (currency: CurrencyCode = 'USD'): Money => {
  return Dinero({ amount: 0, currency });
};

/**
 * Sums an array of Money objects
 *
 * All currencies must match or an error will be thrown.
 *
 * @param amounts - Array of Money objects
 * @param currency - Currency for the sum (defaults to first amount's currency)
 * @returns Sum of all amounts
 * @throws Error if currencies don't match
 *
 * @example
 * const amounts = [
 *   fromDecimal(10, 'USD'),
 *   fromDecimal(20, 'USD'),
 *   fromDecimal(30, 'USD'),
 * ];
 * sum(amounts) // $60.00
 */
export const sum = (amounts: Money[], currency?: CurrencyCode): Money => {
  if (amounts.length === 0) {
    return zero(currency || 'USD');
  }

  return amounts.reduce((acc, amount) => add(acc, amount), zero(currency || getCurrency(amounts[0])));
};
