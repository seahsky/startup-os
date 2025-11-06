import { DocumentItem } from '../types/document';
import { roundCurrency } from './currency';

export interface LineItemCalculation {
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function calculateLineItem(
  quantity: number,
  unitPrice: number,
  taxRate: number
): LineItemCalculation {
  const subtotal = quantity * unitPrice;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return {
    subtotal: roundCurrency(subtotal),
    taxAmount: roundCurrency(taxAmount),
    total: roundCurrency(total),
  };
}

export interface DocumentCalculation {
  subtotal: number;
  totalTax: number;
  total: number;
  taxBreakdown: { rate: number; amount: number }[];
}

export function calculateDocumentTotals(items: DocumentItem[]): DocumentCalculation {
  let subtotal = 0;
  let totalTax = 0;
  const taxBreakdown = new Map<number, number>();

  for (const item of items) {
    const itemCalc = calculateLineItem(item.quantity, item.unitPrice, item.taxRate);

    subtotal += itemCalc.subtotal;
    totalTax += itemCalc.taxAmount;

    const currentAmount = taxBreakdown.get(item.taxRate) || 0;
    taxBreakdown.set(item.taxRate, currentAmount + itemCalc.taxAmount);
  }

  return {
    subtotal: roundCurrency(subtotal),
    totalTax: roundCurrency(totalTax),
    total: roundCurrency(subtotal + totalTax),
    taxBreakdown: Array.from(taxBreakdown.entries())
      .map(([rate, amount]) => ({ rate, amount: roundCurrency(amount) }))
      .sort((a, b) => a.rate - b.rate),
  };
}

export function calculateItemTotals(item: Partial<DocumentItem>): DocumentItem {
  const quantity = item.quantity || 0;
  const unitPrice = item.unitPrice || 0;
  const taxRate = item.taxRate || 0;

  const calc = calculateLineItem(quantity, unitPrice, taxRate);

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
