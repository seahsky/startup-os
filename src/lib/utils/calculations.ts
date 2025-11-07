/**
 * Document Calculation Utilities
 *
 * Provides precise monetary calculations using dinero.js to avoid
 * floating-point precision errors. All calculations are performed
 * with Money objects internally and converted to numbers for API compatibility.
 *
 * Key features:
 * - Floating-point error prevention
 * - Currency-aware calculations
 * - Tax calculation and aggregation
 * - Line item totals
 * - Document-level totals
 */

import { DocumentItem } from '../types/document';
import { roundCurrency } from './currency';
import {
  fromDecimal,
  toDecimal,
  multiply,
  add,
  percentage,
  zero,
  type Money,
} from '../types/money';
import type { CurrencyCode } from '../types/currency';

export interface LineItemCalculation {
  subtotal: number;
  taxAmount: number;
  total: number;
}

/**
 * Calculates line item totals with precision
 *
 * Uses dinero.js internally to prevent floating-point errors.
 * Tax rate is expected as a percentage (e.g., 8.25 for 8.25%)
 *
 * @param quantity - Item quantity
 * @param unitPrice - Price per unit
 * @param taxRate - Tax rate as percentage (8.25 for 8.25%)
 * @param currency - ISO 4217 currency code (defaults to USD)
 * @returns Calculated subtotal, tax amount, and total
 *
 * @example
 * calculateLineItem(3, 19.99, 8.25, 'USD')
 * // { subtotal: 59.97, taxAmount: 4.95, total: 64.92 }
 */
export function calculateLineItem(
  quantity: number,
  unitPrice: number,
  taxRate: number,
  currency: CurrencyCode = 'USD'
): LineItemCalculation {
  // Convert to Money objects for precise calculation
  const unitPriceMoney = fromDecimal(unitPrice, currency);

  // Calculate subtotal: quantity × unitPrice
  const subtotalMoney = multiply(unitPriceMoney, quantity);

  // Calculate tax: subtotal × (taxRate / 100)
  const taxAmountMoney = percentage(subtotalMoney, taxRate / 100);

  // Calculate total: subtotal + tax
  const totalMoney = add(subtotalMoney, taxAmountMoney);

  // Convert back to decimal for API/database
  return {
    subtotal: toDecimal(subtotalMoney),
    taxAmount: toDecimal(taxAmountMoney),
    total: toDecimal(totalMoney),
  };
}

export interface DocumentCalculation {
  subtotal: number;
  totalTax: number;
  total: number;
  taxBreakdown: { rate: number; amount: number }[];
}

/**
 * Calculates document-level totals from line items
 *
 * Aggregates all line items and provides tax breakdown by rate.
 * Uses dinero.js to prevent accumulation of floating-point errors.
 *
 * @param items - Array of document items
 * @param currency - ISO 4217 currency code (defaults to USD)
 * @returns Document totals and tax breakdown
 *
 * @example
 * calculateDocumentTotals([
 *   { quantity: 2, unitPrice: 10, taxRate: 10 },
 *   { quantity: 1, unitPrice: 20, taxRate: 10 }
 * ], 'USD')
 * // { subtotal: 40, totalTax: 4, total: 44, taxBreakdown: [...] }
 */
export function calculateDocumentTotals(
  items: DocumentItem[],
  currency: CurrencyCode = 'USD'
): DocumentCalculation {
  // Initialize accumulators with Money objects
  let subtotalMoney = zero(currency);
  let totalTaxMoney = zero(currency);
  const taxBreakdownMoney = new Map<number, Money>();

  for (const item of items) {
    const itemCalc = calculateLineItem(
      item.quantity,
      item.unitPrice,
      item.taxRate,
      currency
    );

    // Convert calculations back to Money for precise aggregation
    const itemSubtotal = fromDecimal(itemCalc.subtotal, currency);
    const itemTax = fromDecimal(itemCalc.taxAmount, currency);

    // Accumulate subtotal and tax
    subtotalMoney = add(subtotalMoney, itemSubtotal);
    totalTaxMoney = add(totalTaxMoney, itemTax);

    // Track tax by rate
    const currentAmount = taxBreakdownMoney.get(item.taxRate) || zero(currency);
    taxBreakdownMoney.set(item.taxRate, add(currentAmount, itemTax));
  }

  // Calculate total
  const totalMoney = add(subtotalMoney, totalTaxMoney);

  return {
    subtotal: toDecimal(subtotalMoney),
    totalTax: toDecimal(totalTaxMoney),
    total: toDecimal(totalMoney),
    taxBreakdown: Array.from(taxBreakdownMoney.entries())
      .map(([rate, amountMoney]) => ({
        rate,
        amount: toDecimal(amountMoney),
      }))
      .sort((a, b) => a.rate - b.rate),
  };
}

/**
 * Calculate totals for a single document item
 *
 * Enriches a partial document item with calculated totals.
 * Note: productId should be a valid ObjectId or undefined.
 * Validation/conversion should be done before calling this function.
 *
 * @param item - Partial document item
 * @param currency - ISO 4217 currency code (defaults to USD)
 * @returns Complete document item with calculated values
 *
 * @example
 * calculateItemTotals({
 *   name: 'Product',
 *   quantity: 2,
 *   unitPrice: 10,
 *   taxRate: 10
 * }, 'USD')
 * // Returns complete DocumentItem with taxAmount and total calculated
 */
export function calculateItemTotals(
  item: Partial<DocumentItem>,
  currency: CurrencyCode = 'USD'
): DocumentItem {
  const quantity = item.quantity || 0;
  const unitPrice = item.unitPrice || 0;
  const taxRate = item.taxRate || 0;

  const calc = calculateLineItem(quantity, unitPrice, taxRate, currency);

  return {
    productId: item.productId,
    name: item.name || '',
    description: item.description || '',
    quantity,
    unitPrice,
    taxRate,
    taxAmount: calc.taxAmount,
    total: calc.total,
  };
}

/**
 * Calculate payment due amount
 *
 * Subtracts paid amount from total to determine remaining balance.
 * Uses dinero.js for precision.
 *
 * @param total - Total invoice amount
 * @param amountPaid - Amount already paid
 * @param currency - ISO 4217 currency code (defaults to USD)
 * @returns Amount due
 *
 * @example
 * calculateAmountDue(100, 30, 'USD') // 70
 */
export function calculateAmountDue(
  total: number,
  amountPaid: number,
  currency: CurrencyCode = 'USD'
): number {
  const totalMoney = fromDecimal(total, currency);
  const paidMoney = fromDecimal(amountPaid, currency);

  const dueMoney = add(totalMoney, multiply(paidMoney, -1)); // Subtract by multiplying by -1

  return toDecimal(dueMoney);
}

/**
 * Allocate discount across line items proportionally
 *
 * Distributes a discount amount across items based on their subtotals.
 * Ensures the sum of discounts equals the total discount (banker's rounding).
 *
 * @param items - Array of document items
 * @param discountAmount - Total discount to allocate
 * @param currency - ISO 4217 currency code (defaults to USD)
 * @returns Array of discount amounts per item
 *
 * @example
 * allocateDiscount([
 *   { subtotal: 100 },
 *   { subtotal: 200 }
 * ], 30, 'USD')
 * // [10, 20] - Proportionally distributed
 */
export function allocateDiscount(
  items: Array<{ subtotal: number }>,
  discountAmount: number,
  currency: CurrencyCode = 'USD'
): number[] {
  if (items.length === 0 || discountAmount === 0) {
    return items.map(() => 0);
  }

  const discountMoney = fromDecimal(discountAmount, currency);

  // Calculate ratios based on subtotals
  const ratios = items.map((item) => item.subtotal);

  // Use dinero.js allocate for precise distribution
  const allocatedDiscounts = discountMoney.allocate(ratios);

  return allocatedDiscounts.map((discount) => toDecimal(discount));
}
