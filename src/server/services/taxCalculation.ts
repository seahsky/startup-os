import { DocumentItem } from '@/lib/types/document';
import { ObjectId } from 'mongodb';
import { roundCurrency } from '@/lib/utils/currency';

export interface LineItemCalculation {
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface DocumentCalculation {
  subtotal: number;
  totalTax: number;
  total: number;
  taxBreakdown: { rate: number; amount: number }[];
}

export class TaxCalculationService {
  calculateLineItem(
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

  calculateDocument(items: DocumentItem[]): DocumentCalculation {
    let subtotal = 0;
    let totalTax = 0;
    const taxBreakdown = new Map<number, number>();

    for (const item of items) {
      const itemCalc = this.calculateLineItem(
        item.quantity,
        item.unitPrice,
        item.taxRate
      );

      subtotal += itemCalc.subtotal;
      totalTax += itemCalc.taxAmount;

      // Group by tax rate
      const currentAmount = taxBreakdown.get(item.taxRate) || 0;
      taxBreakdown.set(item.taxRate, currentAmount + itemCalc.taxAmount);
    }

    return {
      subtotal: roundCurrency(subtotal),
      totalTax: roundCurrency(totalTax),
      total: roundCurrency(subtotal + totalTax),
      taxBreakdown: Array.from(taxBreakdown.entries()).map(
        ([rate, amount]) => ({ rate, amount: roundCurrency(amount) })
      ),
    };
  }

  enrichItemsWithCalculations(items: any[]): DocumentItem[] {
    return items.map(item => {
      const calc = this.calculateLineItem(
        item.quantity || 0,
        item.unitPrice || 0,
        item.taxRate || 0
      );

      return {
        productId: item.productId && item.productId.trim() !== '' ? new ObjectId(item.productId) : undefined,
        name: item.name || '',
        description: item.description || '',
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        taxRate: item.taxRate || 0,
        taxAmount: calc.taxAmount,
        total: calc.total,
      };
    });
  }
}

export const taxCalculationService = new TaxCalculationService();
