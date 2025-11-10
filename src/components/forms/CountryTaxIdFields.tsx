'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  COUNTRY_TAX_CONFIGS,
  type TaxIdFieldConfig,
} from '@/lib/constants/countryTaxConfigs';
import {
  getRequiredTaxIdFields,
  getOptionalTaxIdFields,
} from '@/lib/utils/taxIdHelpers';

interface CountryTaxIdFieldsProps {
  country: string;
  value: Record<string, string>;
  onChange: (taxIds: Record<string, string>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function CountryTaxIdFields({
  country,
  value,
  onChange,
  errors = {},
  disabled = false,
}: CountryTaxIdFieldsProps) {
  const [showOptional, setShowOptional] = useState(false);

  const config = COUNTRY_TAX_CONFIGS[country];

  if (!config) {
    return (
      <div className="text-sm text-gray-500">
        Please select a country to configure tax identification numbers.
      </div>
    );
  }

  const requiredFields = getRequiredTaxIdFields(country);
  const optionalFields = getOptionalTaxIdFields(country);

  const handleFieldChange = (fieldName: string, fieldValue: string) => {
    const updatedTaxIds = { ...value };

    if (fieldValue.trim() === '') {
      // Remove field if empty
      delete updatedTaxIds[fieldName];
    } else {
      // Store normalized value
      updatedTaxIds[fieldName] = fieldValue;
    }

    onChange(updatedTaxIds);
  };

  const renderField = (field: TaxIdFieldConfig) => {
    const fieldValue = value[field.fieldName] || '';
    const error = errors[field.fieldName];

    return (
      <div key={field.fieldName} className="space-y-2">
        <Label htmlFor={field.fieldName} className="flex items-center gap-2">
          {field.displayNameLocal || field.displayName}
          {field.required && <span className="text-red-500">*</span>}
        </Label>

        <Input
          id={field.fieldName}
          name={field.fieldName}
          value={fieldValue}
          onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
          placeholder={field.placeholder || field.formatExample}
          disabled={disabled}
          className={error ? 'border-red-500' : ''}
        />

        <div className="flex items-start gap-1 text-xs text-gray-500">
          <span>ℹ️ {field.formatDescription}. Example: {field.formatExample}</span>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Country Info */}
      <div className="text-sm text-gray-600">
        <span className="font-medium">{config.countryName}</span> - {config.taxSystem} system
      </div>

      {/* Required Tax IDs */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Tax Identification Numbers
        </h3>
        <div className="space-y-4">
          {requiredFields.map((field) => renderField(field))}
        </div>
      </div>

      {/* Optional Tax IDs */}
      {optionalFields.length > 0 && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span>{showOptional ? '▼' : '▶'}</span>
            Additional Tax IDs (Optional)
          </button>
          {showOptional && (
            <div className="mt-4 space-y-4 pl-4">
              {optionalFields.map((field) => renderField(field))}
            </div>
          )}
        </div>
      )}

      {/* Invoice Requirements Info */}
      {config.invoiceRequirements.additionalRequirements &&
        config.invoiceRequirements.additionalRequirements.length > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Invoice Requirements for {config.countryName}
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              {config.invoiceRequirements.additionalRequirements.map(
                (req, index) => (
                  <li key={index}>{req}</li>
                )
              )}
            </ul>
          </Card>
        )}
    </div>
  );
}
