/**
 * CurrencyDisplay Component
 *
 * Accessible currency display component that handles formatting,
 * proper decimal places, and screen reader support.
 *
 * Features:
 * - Symbol or code display modes
 * - Automatic decimal handling (0, 2, or 3 based on currency)
 * - Accessibility labels for screen readers
 * - Negative number handling
 * - Zero and null handling
 * - Customizable styling
 *
 * @example
 * ```tsx
 * <CurrencyDisplay amount={1234.56} currency="USD" mode="symbol" />
 * // Renders: $1,234.56
 *
 * <CurrencyDisplay amount={1234} currency="JPY" mode="code" />
 * // Renders: JPY 1,234
 *
 * <CurrencyDisplay
 *   amount={1234.567}
 *   currency="BHD"
 *   mode="symbol"
 *   showAccessibility={true}
 * />
 * // Renders: BD 1,234.567 with aria-label
 * ```
 */

'use client';

import React from 'react';
import { formatCurrencyAccessible } from '@/lib/utils/currency';
import type { CurrencyCode, CurrencyDisplayMode } from '@/lib/types/currency';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  /**
   * The monetary amount to display
   */
  amount: number | null | undefined;

  /**
   * ISO 4217 currency code
   */
  currency: CurrencyCode;

  /**
   * Display mode
   * - 'symbol': Show currency symbol ($, €, £) - compact for tables
   * - 'code': Show ISO code (USD, EUR, GBP) - clear for forms/documents
   * @default 'symbol'
   */
  mode?: CurrencyDisplayMode;

  /**
   * Add aria-label for screen readers
   * @default true
   */
  showAccessibility?: boolean;

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Additional HTML attributes for the span element
   */
  'data-testid'?: string;
}

/**
 * Currency Display Component
 *
 * Displays monetary amounts with proper formatting, decimal handling,
 * and accessibility support.
 */
export function CurrencyDisplay({
  amount,
  currency,
  mode = 'symbol',
  showAccessibility = true,
  className,
  'data-testid': testId,
}: CurrencyDisplayProps) {
  // Handle null/undefined amounts
  if (amount === null || amount === undefined) {
    return (
      <span className={cn('text-muted-foreground', className)} data-testid={testId}>
        —
      </span>
    );
  }

  // Format currency with accessibility features
  const formatted = formatCurrencyAccessible(amount, currency, mode);

  // Determine if negative for styling
  const isNegative = amount < 0;
  const isZero = amount === 0;

  return (
    <span
      className={cn(
        'font-medium tabular-nums',
        {
          'text-destructive': isNegative,
          'text-muted-foreground': isZero,
        },
        className
      )}
      aria-label={showAccessibility ? formatted.ariaLabel : undefined}
      data-testid={testId}
      data-currency={currency}
      data-amount={amount}
    >
      {formatted.display}
    </span>
  );
}

/**
 * Currency Display with custom styling for tables
 *
 * Pre-configured for table display with right alignment and monospace font
 */
export function CurrencyTableCell({
  amount,
  currency,
  className,
  ...props
}: Omit<CurrencyDisplayProps, 'mode'>) {
  return (
    <CurrencyDisplay
      amount={amount}
      currency={currency}
      mode="symbol"
      className={cn('text-right', className)}
      {...props}
    />
  );
}

/**
 * Currency Display with custom styling for totals/summaries
 *
 * Pre-configured for totals with emphasis and code display
 */
export function CurrencyTotal({
  amount,
  currency,
  className,
  ...props
}: Omit<CurrencyDisplayProps, 'mode'>) {
  return (
    <CurrencyDisplay
      amount={amount}
      currency={currency}
      mode="code"
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  );
}

/**
 * Currency Display for form labels
 *
 * Pre-configured for form display with code for clarity
 */
export function CurrencyFormValue({
  amount,
  currency,
  className,
  ...props
}: Omit<CurrencyDisplayProps, 'mode'>) {
  return (
    <CurrencyDisplay
      amount={amount}
      currency={currency}
      mode="code"
      className={cn('font-normal', className)}
      {...props}
    />
  );
}

/**
 * Large Currency Display for headers/highlights
 *
 * Pre-configured for prominent display
 */
export function CurrencyLarge({
  amount,
  currency,
  mode = 'symbol',
  className,
  ...props
}: CurrencyDisplayProps) {
  return (
    <CurrencyDisplay
      amount={amount}
      currency={currency}
      mode={mode}
      className={cn('text-3xl font-bold', className)}
      {...props}
    />
  );
}

export default CurrencyDisplay;
