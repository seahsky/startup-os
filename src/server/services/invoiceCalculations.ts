/**
 * Invoice Calculation Service
 *
 * Dedicated service for invoice-specific calculations including:
 * - Payment tracking and allocation
 * - Payment status determination
 * - Amount due calculations
 * - Payment history management
 *
 * Uses dinero.js for all monetary calculations to ensure precision.
 */

import {
  fromDecimal,
  toDecimal,
  add,
  subtract,
  multiply,
  sum,
  zero,
  isZero,
  compare,
  type Money,
} from '@/lib/types/money';
import type { CurrencyCode } from '@/lib/types/currency';
import { calculateLineItem, calculateDocumentTotals } from '@/lib/utils/calculations';
import type { DocumentItem } from '@/lib/types/document';

export interface InvoicePayment {
  amount: number;
  paymentDate: Date;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}

export interface PaymentStatus {
  status: 'unpaid' | 'partial' | 'paid' | 'overpaid';
  amountPaid: number;
  amountDue: number;
  percentPaid: number;
}

export interface InvoiceCalculationResult {
  subtotal: number;
  totalTax: number;
  total: number;
  paymentStatus: PaymentStatus;
  taxBreakdown: { rate: number; amount: number }[];
}

/**
 * Calculates complete invoice totals including payment status
 *
 * @param items - Invoice line items
 * @param payments - Payment records
 * @param currency - ISO 4217 currency code
 * @returns Complete invoice calculation with payment status
 *
 * @example
 * calculateInvoiceTotals([
 *   { quantity: 2, unitPrice: 100, taxRate: 10 }
 * ], [
 *   { amount: 150, paymentDate: new Date() }
 * ], 'USD')
 */
export function calculateInvoiceTotals(
  items: DocumentItem[],
  payments: InvoicePayment[],
  currency: CurrencyCode = 'USD'
): InvoiceCalculationResult {
  // Calculate line item totals
  const docTotals = calculateDocumentTotals(items, currency);

  // Calculate payment totals
  const paymentStatus = calculatePaymentStatus(
    docTotals.total,
    payments,
    currency
  );

  return {
    ...docTotals,
    paymentStatus,
  };
}

/**
 * Calculates payment status for an invoice
 *
 * Determines if invoice is unpaid, partially paid, fully paid, or overpaid.
 * Uses dinero.js for precise payment tracking.
 *
 * @param totalAmount - Invoice total amount
 * @param payments - Array of payments made
 * @param currency - ISO 4217 currency code
 * @returns Payment status with amounts and percentage
 *
 * @example
 * calculatePaymentStatus(1000, [
 *   { amount: 400, paymentDate: new Date() },
 *   { amount: 300, paymentDate: new Date() }
 * ], 'USD')
 * // { status: 'partial', amountPaid: 700, amountDue: 300, percentPaid: 70 }
 */
export function calculatePaymentStatus(
  totalAmount: number,
  payments: InvoicePayment[],
  currency: CurrencyCode = 'USD'
): PaymentStatus {
  const totalMoney = fromDecimal(totalAmount, currency);

  // Sum all payments using Money objects
  const paymentAmounts = payments.map((p) => fromDecimal(p.amount, currency));
  const totalPaidMoney =
    paymentAmounts.length > 0 ? sum(paymentAmounts, currency) : zero(currency);

  // Calculate amount due
  const amountDueMoney = subtract(totalMoney, totalPaidMoney);

  const amountPaid = toDecimal(totalPaidMoney);
  const amountDue = toDecimal(amountDueMoney);

  // Calculate percentage paid
  const percentPaid = totalAmount > 0 ? (amountPaid / totalAmount) * 100 : 0;

  // Determine status
  let status: PaymentStatus['status'];
  if (isZero(totalPaidMoney)) {
    status = 'unpaid';
  } else if (compare(totalPaidMoney, totalMoney) < 0) {
    status = 'partial';
  } else if (compare(totalPaidMoney, totalMoney) === 0) {
    status = 'paid';
  } else {
    status = 'overpaid';
  }

  return {
    status,
    amountPaid: Math.max(0, amountPaid), // Ensure non-negative
    amountDue: Math.max(0, amountDue), // Ensure non-negative
    percentPaid: Math.min(100, Math.max(0, percentPaid)), // Clamp between 0-100
  };
}

/**
 * Calculates the amount due for an invoice
 *
 * Simple helper that subtracts payments from total.
 *
 * @param totalAmount - Invoice total
 * @param amountPaid - Total amount already paid
 * @param currency - ISO 4217 currency code
 * @returns Amount remaining to be paid
 *
 * @example
 * calculateAmountDue(1000, 400, 'USD') // 600
 */
export function calculateAmountDue(
  totalAmount: number,
  amountPaid: number,
  currency: CurrencyCode = 'USD'
): number {
  const totalMoney = fromDecimal(totalAmount, currency);
  const paidMoney = fromDecimal(amountPaid, currency);

  const dueMoney = subtract(totalMoney, paidMoney);

  return Math.max(0, toDecimal(dueMoney));
}

/**
 * Validates a payment amount against invoice total
 *
 * Checks if payment amount is valid (positive, not exceeding remaining due).
 *
 * @param paymentAmount - Amount of new payment
 * @param amountDue - Current amount due
 * @param currency - ISO 4217 currency code
 * @param allowOverpayment - Whether to allow payments exceeding due amount
 * @returns Validation result with error message if invalid
 *
 * @example
 * validatePaymentAmount(500, 1000, 'USD')
 * // { valid: true }
 *
 * validatePaymentAmount(-100, 1000, 'USD')
 * // { valid: false, error: 'Payment amount must be positive' }
 */
export function validatePaymentAmount(
  paymentAmount: number,
  amountDue: number,
  currency: CurrencyCode = 'USD',
  allowOverpayment: boolean = false
): { valid: boolean; error?: string } {
  if (paymentAmount <= 0) {
    return {
      valid: false,
      error: 'Payment amount must be positive',
    };
  }

  if (!allowOverpayment) {
    const paymentMoney = fromDecimal(paymentAmount, currency);
    const dueMoney = fromDecimal(amountDue, currency);

    if (compare(paymentMoney, dueMoney) > 0) {
      return {
        valid: false,
        error: 'Payment amount cannot exceed amount due',
      };
    }
  }

  return { valid: true };
}

/**
 * Applies a payment to an invoice
 *
 * Creates a payment record and recalculates payment status.
 *
 * @param currentPayments - Existing payments
 * @param newPayment - New payment to apply
 * @param invoiceTotal - Invoice total amount
 * @param currency - ISO 4217 currency code
 * @returns Updated payments array and new payment status
 *
 * @example
 * applyPayment(
 *   [{ amount: 100, paymentDate: new Date() }],
 *   { amount: 50, paymentDate: new Date(), paymentMethod: 'credit_card' },
 *   200,
 *   'USD'
 * )
 */
export function applyPayment(
  currentPayments: InvoicePayment[],
  newPayment: InvoicePayment,
  invoiceTotal: number,
  currency: CurrencyCode = 'USD'
): {
  payments: InvoicePayment[];
  paymentStatus: PaymentStatus;
} {
  const updatedPayments = [...currentPayments, newPayment];
  const paymentStatus = calculatePaymentStatus(invoiceTotal, updatedPayments, currency);

  return {
    payments: updatedPayments,
    paymentStatus,
  };
}

/**
 * Calculates late fee based on days overdue
 *
 * Applies percentage-based late fee after grace period.
 *
 * @param originalAmount - Original invoice amount
 * @param daysOverdue - Number of days past due date
 * @param lateFeePercentage - Late fee as percentage (e.g., 1.5 for 1.5%)
 * @param gracePeriodDays - Days before late fee applies
 * @param currency - ISO 4217 currency code
 * @returns Late fee amount
 *
 * @example
 * calculateLateFee(1000, 30, 1.5, 7, 'USD')
 * // 15 (1.5% of 1000, since 30 days > 7 grace period)
 */
export function calculateLateFee(
  originalAmount: number,
  daysOverdue: number,
  lateFeePercentage: number = 1.5,
  gracePeriodDays: number = 0,
  currency: CurrencyCode = 'USD'
): number {
  if (daysOverdue <= gracePeriodDays) {
    return 0;
  }

  const amountMoney = fromDecimal(originalAmount, currency);
  const lateFeeMoney = multiply(amountMoney, lateFeePercentage / 100);

  return toDecimal(lateFeeMoney);
}

/**
 * Calculates days between invoice date and payment/current date
 *
 * @param invoiceDate - Date invoice was issued
 * @param comparisonDate - Date to compare against (defaults to now)
 * @returns Number of days difference
 *
 * @example
 * calculateDaysOutstanding(new Date('2024-01-01'), new Date('2024-01-15'))
 * // 14
 */
export function calculateDaysOutstanding(
  invoiceDate: Date,
  comparisonDate: Date = new Date()
): number {
  const diffTime = comparisonDate.getTime() - invoiceDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Determines if an invoice is overdue
 *
 * @param dueDate - Invoice due date
 * @param currentDate - Date to check against (defaults to now)
 * @returns True if overdue, false otherwise
 *
 * @example
 * isInvoiceOverdue(new Date('2024-01-01'))
 * // true (if current date is after 2024-01-01)
 */
export function isInvoiceOverdue(
  dueDate: Date,
  currentDate: Date = new Date()
): boolean {
  return currentDate > dueDate;
}

/**
 * Calculates partial payment allocation across line items
 *
 * Distributes a partial payment proportionally across invoice line items.
 * Useful for tracking which items have been paid for.
 *
 * @param items - Invoice line items
 * @param paymentAmount - Partial payment amount
 * @param currency - ISO 4217 currency code
 * @returns Array of allocated amounts per item
 *
 * @example
 * allocatePartialPayment([
 *   { total: 100 },
 *   { total: 200 }
 * ], 150, 'USD')
 * // [50, 100] - Proportionally allocated
 */
export function allocatePartialPayment(
  items: Array<{ total: number }>,
  paymentAmount: number,
  currency: CurrencyCode = 'USD'
): number[] {
  if (items.length === 0) {
    return [];
  }

  const paymentMoney = fromDecimal(paymentAmount, currency);
  const ratios = items.map((item) => item.total);

  const allocatedPayments = paymentMoney.allocate(ratios);

  return allocatedPayments.map((payment) => toDecimal(payment));
}
