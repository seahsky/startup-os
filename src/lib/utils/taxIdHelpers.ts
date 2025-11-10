/**
 * Tax ID Helper Utilities
 *
 * Helper functions for working with country-specific tax IDs
 */

import {
  COUNTRY_TAX_CONFIGS,
  type CountryTaxConfig,
  type TaxIdFieldConfig,
  getFieldConfig,
  getDisplayLabel,
} from '../constants/countryTaxConfigs';

// Re-export from countryTaxConfigs for convenience
export { getFieldConfig, getDisplayLabel };

/**
 * Normalize tax ID for storage (remove spaces, hyphens, convert to uppercase)
 */
export function normalizeTaxId(value: string): string {
  return value.replace(/[\s-]/g, '').toUpperCase();
}

/**
 * Format tax ID for display based on country format
 */
export function formatTaxId(
  countryCode: string,
  fieldName: string,
  value: string
): string {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  if (!config) return value;

  const field = getFieldConfig(config, fieldName);
  if (!field) return value;

  // Remove existing formatting
  const normalized = normalizeTaxId(value);

  // Apply country-specific formatting
  switch (countryCode) {
    case 'US': // EIN: XX-XXXXXXX
      if (fieldName === 'ein' && normalized.length === 9) {
        return `${normalized.slice(0, 2)}-${normalized.slice(2)}`;
      }
      break;

    case 'AU': // ABN: XX XXX XXX XXX
      if (fieldName === 'abn' && normalized.length === 11) {
        return `${normalized.slice(0, 2)} ${normalized.slice(2, 5)} ${normalized.slice(5, 8)} ${normalized.slice(8)}`;
      }
      // ACN: XXX XXX XXX
      if (fieldName === 'acn' && normalized.length === 9) {
        return `${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6)}`;
      }
      break;

    case 'BR': // CNPJ: XX.XXX.XXX/XXXX-XX
      if (fieldName === 'cnpj' && normalized.length === 14) {
        return `${normalized.slice(0, 2)}.${normalized.slice(2, 5)}.${normalized.slice(5, 8)}/${normalized.slice(8, 12)}-${normalized.slice(12)}`;
      }
      break;

    case 'KR': // BRN: XXX-XX-XXXXX
      if (fieldName === 'brn' && normalized.length === 10) {
        return `${normalized.slice(0, 3)}-${normalized.slice(3, 5)}-${normalized.slice(5)}`;
      }
      break;

    case 'CH': // UID: CHE-XXX.XXX.XXX
      if (fieldName === 'uid' && normalized.match(/^CHE\d{9}/)) {
        const digits = normalized.slice(3);
        return `CHE-${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}`;
      }
      break;

    case 'FI': // Business ID: XXXXXXX-X
      if (fieldName === 'businessId' && normalized.length === 8) {
        return `${normalized.slice(0, 7)}-${normalized.slice(7)}`;
      }
      break;

    case 'CA': // GST: XXXXXXXXX RT XXXX
      if (fieldName === 'gstNumber' && normalized.length === 15) {
        return `${normalized.slice(0, 9)} ${normalized.slice(9, 11)} ${normalized.slice(11)}`;
      }
      break;

    default:
      // For most countries, just return the normalized value
      return normalized;
  }

  return value; // Return original if no specific formatting
}

/**
 * Get all tax ID fields (primary + secondary) for a country
 */
export function getAllTaxIdFields(countryCode: string): TaxIdFieldConfig[] {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  if (!config) return [];

  return [config.primaryId, ...(config.secondaryIds || [])];
}

/**
 * Get required tax ID fields for a country
 */
export function getRequiredTaxIdFields(countryCode: string): TaxIdFieldConfig[] {
  const allFields = getAllTaxIdFields(countryCode);
  return allFields.filter((field) => field.required);
}

/**
 * Get optional tax ID fields for a country
 */
export function getOptionalTaxIdFields(countryCode: string): TaxIdFieldConfig[] {
  const allFields = getAllTaxIdFields(countryCode);
  return allFields.filter((field) => !field.required);
}

/**
 * Check if a tax ID field is required for a country
 */
export function isTaxIdFieldRequired(countryCode: string, fieldName: string): boolean {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  if (!config) return false;

  const field = getFieldConfig(config, fieldName);
  return field?.required || false;
}

/**
 * Get display label for a tax ID field (prefers local name)
 */
export function getTaxIdDisplayLabel(
  countryCode: string,
  fieldName: string
): string {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  if (!config) return fieldName;

  return getDisplayLabel(config, fieldName);
}

/**
 * Validate basic tax ID format using regex
 */
export function validateTaxIdFormat(
  countryCode: string,
  fieldName: string,
  value: string
): boolean {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  if (!config) return false;

  const field = getFieldConfig(config, fieldName);
  if (!field) return false;

  const regex = new RegExp(field.format);
  return regex.test(value);
}

/**
 * Get validation error message for a tax ID field
 */
export function getTaxIdValidationError(
  countryCode: string,
  fieldName: string
): string {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  if (!config) return 'Invalid country code';

  const field = getFieldConfig(config, fieldName);
  if (!field) return 'Invalid field name';

  return `Invalid ${field.displayName} format. Expected: ${field.formatExample}`;
}

/**
 * Check if all required tax IDs are provided
 */
export function hasAllRequiredTaxIds(
  countryCode: string,
  taxIds: Record<string, string>
): boolean {
  const requiredFields = getRequiredTaxIdFields(countryCode);

  for (const field of requiredFields) {
    if (!taxIds[field.fieldName] || taxIds[field.fieldName].trim() === '') {
      return false;
    }
  }

  return true;
}

/**
 * Get missing required tax ID field names
 */
export function getMissingRequiredTaxIds(
  countryCode: string,
  taxIds: Record<string, string>
): string[] {
  const requiredFields = getRequiredTaxIdFields(countryCode);
  const missing: string[] = [];

  for (const field of requiredFields) {
    if (!taxIds[field.fieldName] || taxIds[field.fieldName].trim() === '') {
      missing.push(field.fieldName);
    }
  }

  return missing;
}

/**
 * Convert legacy taxId string to new taxIds object
 * Used during migration
 */
export function migrateLegacyTaxId(
  countryCode: string,
  legacyTaxId: string
): Record<string, string> {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  if (!config) {
    // If country is unknown, store in primary field generically
    return { taxId: legacyTaxId };
  }

  // Map to primary field for the country
  return {
    [config.primaryId.fieldName]: legacyTaxId,
  };
}

/**
 * Get example tax ID for a field (for placeholder text)
 */
export function getTaxIdExample(countryCode: string, fieldName: string): string {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  if (!config) return '';

  const field = getFieldConfig(config, fieldName);
  return field?.formatExample || '';
}

/**
 * Get format description for a field (for help text)
 */
export function getTaxIdFormatDescription(
  countryCode: string,
  fieldName: string
): string {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  if (!config) return '';

  const field = getFieldConfig(config, fieldName);
  return field?.formatDescription || '';
}

/**
 * Check if a country has EU VIES verification available
 */
export function hasVIESVerification(countryCode: string): boolean {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  return config?.verificationApi?.name === 'EU VIES';
}

/**
 * Get the primary tax ID from a taxIds object
 */
export function getPrimaryTaxId(
  countryCode: string,
  taxIds?: Record<string, string>
): string | undefined {
  if (!taxIds) return undefined;

  const config = COUNTRY_TAX_CONFIGS[countryCode];
  if (!config) return undefined;

  return taxIds[config.primaryId.fieldName];
}

/**
 * Build a taxIds object from form input
 */
export function buildTaxIdsObject(
  countryCode: string,
  formData: Record<string, string>
): Record<string, string> {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  if (!config) return {};

  const taxIds: Record<string, string> = {};
  const allFields = getAllTaxIdFields(countryCode);

  for (const field of allFields) {
    const value = formData[field.fieldName];
    if (value && value.trim() !== '') {
      // Normalize the value before storing
      taxIds[field.fieldName] = normalizeTaxId(value);
    }
  }

  return taxIds;
}

/**
 * Check if tax IDs should be shown on invoice for a country
 */
export function shouldShowTaxIdsOnInvoice(countryCode: string): boolean {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  return config?.invoiceRequirements.mustShowOnInvoice || false;
}

/**
 * Check if customer tax IDs should be shown on invoice
 */
export function shouldShowCustomerTaxIdsOnInvoice(countryCode: string): boolean {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  return config?.invoiceRequirements.mustShowCustomerTaxId || false;
}

/**
 * Get country configuration
 */
export function getCountryConfig(countryCode: string): CountryTaxConfig | undefined {
  return COUNTRY_TAX_CONFIGS[countryCode];
}

/**
 * Check if a country code is valid
 */
export function isValidCountryCode(countryCode: string): boolean {
  return countryCode in COUNTRY_TAX_CONFIGS;
}

/**
 * Get country name from code
 */
export function getCountryName(countryCode: string): string {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  return config?.countryName || countryCode;
}
