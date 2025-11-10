'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { getCountriesByRegion } from '@/lib/constants/countryTaxConfigs';

interface CountrySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function CountrySelector({
  value,
  onChange,
  disabled,
  error,
}: CountrySelectorProps) {
  const countriesByRegion = getCountriesByRegion();

  return (
    <div className="space-y-2">
      <Label htmlFor="country">Country *</Label>
      <select
        id="country"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`flex h-10 w-full rounded-md border ${
          error ? 'border-red-500' : 'border-gray-300'
        } bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <option value="">Select country</option>

        {/* Americas */}
        <optgroup label="Americas">
          {countriesByRegion.Americas.map((config) => (
            <option key={config.countryCode} value={config.countryCode}>
              {config.countryName}
            </option>
          ))}
        </optgroup>

        {/* Europe / EU */}
        <optgroup label="Europe">
          {countriesByRegion.EU.map((config) => (
            <option key={config.countryCode} value={config.countryCode}>
              {config.countryName}
            </option>
          ))}
        </optgroup>

        {/* Asia-Pacific */}
        <optgroup label="Asia-Pacific">
          {countriesByRegion.APAC.map((config) => (
            <option key={config.countryCode} value={config.countryCode}>
              {config.countryName}
            </option>
          ))}
        </optgroup>

        {/* Middle East & Africa */}
        {countriesByRegion.MEA.length > 0 && (
          <optgroup label="Middle East & Africa">
            {countriesByRegion.MEA.map((config) => (
              <option key={config.countryCode} value={config.countryCode}>
                {config.countryName}
              </option>
            ))}
          </optgroup>
        )}

        {/* Other */}
        {countriesByRegion.Other.length > 0 && (
          <optgroup label="Other">
            {countriesByRegion.Other.map((config) => (
              <option key={config.countryCode} value={config.countryCode}>
                {config.countryName}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
