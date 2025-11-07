'use client';

import React from 'react';
import { Label } from '@/components/ui/label';

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
];

export function CurrencySelect({
  value,
  onChange,
  label = 'Currency',
  error,
  required = false,
  disabled = false,
}: CurrencySelectProps) {
  return (
    <div>
      <Label htmlFor="currency">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <select
        id="currency"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Select currency...</option>
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
