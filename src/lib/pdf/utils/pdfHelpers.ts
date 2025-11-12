import { format } from 'date-fns';
import { formatCurrencyWithCode, formatCurrencyWithSymbol } from '@/lib/utils/currency';
import type { CurrencyCode } from '@/lib/types/currency';
import type { DocumentItem } from '@/lib/types/document';

/**
 * Format currency for PDF display in CODE mode
 * Uses "code" mode for clarity in totals and summaries (e.g., "USD 1,234.56")
 */
export function formatCurrencyForPDF(amount: number, currency: string): string {
  return formatCurrencyWithCode(amount, currency as CurrencyCode);
}

/**
 * Format currency for PDF display in SYMBOL mode
 * Uses "symbol" mode for compact display in tables (e.g., "$1,234.56")
 */
export function formatCurrencySymbolForPDF(amount: number, currency: string): string {
  return formatCurrencyWithSymbol(amount, currency as CurrencyCode);
}

/**
 * Format date for PDF display
 */
export function formatDateForPDF(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

/**
 * Format date and time for PDF display
 */
export function formatDateTimeForPDF(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
}

/**
 * Tax breakdown type
 */
export interface TaxBreakdownItem {
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

/**
 * Get tax breakdown grouped by rate
 * Returns array of { rate, taxableAmount, taxAmount }
 */
export function getTaxBreakdown(items: DocumentItem[]): TaxBreakdownItem[] {
  const breakdownMap = new Map<number, TaxBreakdownItem>();

  items.forEach((item) => {
    const rate = item.taxRate;
    const taxableAmount = item.quantity * item.unitPrice;
    const taxAmount = item.taxAmount;

    if (breakdownMap.has(rate)) {
      const existing = breakdownMap.get(rate)!;
      existing.taxableAmount += taxableAmount;
      existing.taxAmount += taxAmount;
    } else {
      breakdownMap.set(rate, {
        rate,
        taxableAmount,
        taxAmount,
      });
    }
  });

  // Convert to array and sort by rate
  return Array.from(breakdownMap.values()).sort((a, b) => a.rate - b.rate);
}

/**
 * Format tax rate as percentage
 */
export function formatTaxRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/**
 * Format address for PDF display
 */
export interface PDFAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export function formatAddressForPDF(address: PDFAddress): string[] {
  return [
    address.street,
    `${address.city}, ${address.state} ${address.zipCode}`,
    address.country,
  ];
}

/**
 * Get status display text
 */
export function getStatusDisplayText(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Estimate number of pages needed for items
 * Approximate: ~15 items per page
 */
export function estimatePageCount(itemCount: number): number {
  const itemsPerPage = 15;
  return Math.ceil(itemCount / itemsPerPage) || 1;
}

/**
 * Truncate text to maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate PDF filename
 */
export function generatePDFFilename(
  documentType: string,
  documentNumber: string
): string {
  const date = format(new Date(), 'yyyy-MM-dd');
  const sanitizedNumber = documentNumber.replace(/[^a-zA-Z0-9-]/g, '_');
  return `${documentType}-${sanitizedNumber}-${date}.pdf`;
}

/**
 * Parse ObjectId to string safely
 */
export function objectIdToString(id: any): string {
  if (typeof id === 'string') return id;
  if (id && typeof id.toString === 'function') return id.toString();
  return '';
}

/**
 * Formatted tax ID type
 */
export interface FormattedTaxId {
  label: string;
  value: string;
}

/**
 * Format tax IDs for PDF display based on country
 *
 * Takes a country code and taxIds object and returns an array of formatted
 * tax IDs with proper labels and formatting for PDF display.
 *
 * @param country - ISO 3166-1 alpha-2 country code (e.g., 'US', 'AU', 'GB')
 * @param taxIds - Object containing tax ID key-value pairs
 * @returns Array of formatted tax IDs with labels and values
 *
 * @example
 * formatTaxIdsForPDF('AU', { abn: '12345678901' })
 * // Returns: [{ label: 'ABN', value: '12 345 678 901' }]
 *
 * @example
 * formatTaxIdsForPDF('AU', { abn: '12345678901', acn: '123456789' })
 * // Returns: [
 * //   { label: 'ABN', value: '12 345 678 901' },
 * //   { label: 'ACN', value: '123 456 789' }
 * // ]
 */
export function formatTaxIdsForPDF(
  country: string,
  taxIds?: Record<string, string>
): FormattedTaxId[] {
  // Dynamic import to avoid circular dependencies
  const { getCountryConfig, formatTaxId, getTaxIdDisplayLabel } = require('@/lib/utils/taxIdHelpers');

  if (!taxIds || !country) return [];

  const config = getCountryConfig(country);
  if (!config) return [];

  const formatted: FormattedTaxId[] = [];

  // Add primary tax ID
  const primaryFieldName = config.primaryId.fieldName;
  const primaryValue = taxIds[primaryFieldName];
  if (primaryValue) {
    formatted.push({
      label: getTaxIdDisplayLabel(country, primaryFieldName),
      value: formatTaxId(country, primaryFieldName, primaryValue),
    });
  }

  // Add secondary tax IDs if they exist
  if (config.secondaryIds) {
    for (const secondaryId of config.secondaryIds) {
      const value = taxIds[secondaryId.fieldName];
      if (value) {
        formatted.push({
          label: getTaxIdDisplayLabel(country, secondaryId.fieldName),
          value: formatTaxId(country, secondaryId.fieldName, value),
        });
      }
    }
  }

  return formatted;
}
