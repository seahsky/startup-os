'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { calculateLineItem } from '@/lib/utils/calculations';

export interface DocumentItem {
  productId?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount?: number;
  total?: number;
}

interface ItemsTableProps {
  items: DocumentItem[];
  onChange: (items: DocumentItem[]) => void;
  currency?: string;
}

export function ItemsTable({ items, onChange, currency = 'USD' }: ItemsTableProps) {
  // Ensure currency is never empty - fallback to USD
  const safeCurrency = currency || 'USD';

  const addItem = () => {
    onChange([
      ...items,
      {
        name: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 10,
      },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof DocumentItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate line total
    const { taxAmount, total } = calculateLineItem(
      newItems[index].quantity,
      newItems[index].unitPrice,
      newItems[index].taxRate
    );
    newItems[index].taxAmount = taxAmount;
    newItems[index].total = total;

    onChange(newItems);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;

    items.forEach(item => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemTax = (itemSubtotal * item.taxRate) / 100;
      subtotal += itemSubtotal;
      totalTax += itemTax;
    });

    return {
      subtotal,
      totalTax,
      total: subtotal + totalTax,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">
                Item
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">
                Description
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase py-3 px-2 w-24">
                Qty
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase py-3 px-2 w-32">
                Unit Price
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase py-3 px-2 w-24">
                Tax %
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase py-3 px-2 w-32">
                Total
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No items added. Click "Add Item" to get started.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-2">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="Item name"
                      className="min-w-[150px]"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="min-w-[200px]"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="text-right"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="text-right"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={item.taxRate}
                      onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                      className="text-right"
                    />
                  </td>
                  <td className="py-3 px-2 text-right font-medium">
                    {formatCurrency(item.total || 0, safeCurrency)}
                  </td>
                  <td className="py-3 px-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-start">
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>

        <div className="bg-gray-50 rounded-lg p-4 min-w-[300px]">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(totals.subtotal, safeCurrency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">{formatCurrency(totals.totalTax, safeCurrency)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>{formatCurrency(totals.total, safeCurrency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
