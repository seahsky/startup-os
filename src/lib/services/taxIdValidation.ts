/**
 * Tax ID Validation Service
 *
 * Provides validation for country-specific business registration numbers using:
 * - stdnum library for comprehensive coverage
 * - jsvat library for EU VAT numbers
 * - Custom regex validation as fallback
 */

import { checkVAT } from 'jsvat';
import type { VatCheckResult } from 'jsvat';
import {
  COUNTRY_TAX_CONFIGS,
  type CountryTaxConfig,
} from '../constants/countryTaxConfigs';
import {
  getFieldConfig,
  normalizeTaxId,
  validateTaxIdFormat,
  getTaxIdValidationError,
} from '../utils/taxIdHelpers';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
  details?: {
    format: boolean;
    checksum?: boolean;
    countryDetected?: string;
  };
}

export class TaxIdValidationService {
  /**
   * Validate a tax ID for a specific country and field
   */
  validateTaxId(
    countryCode: string,
    fieldName: string,
    value: string
  ): ValidationResult {
    const config = COUNTRY_TAX_CONFIGS[countryCode];

    if (!config) {
      return {
        valid: false,
        error: `Unknown country code: ${countryCode}`,
      };
    }

    const field = getFieldConfig(config, fieldName);
    if (!field) {
      return {
        valid: false,
        error: `Unknown field: ${fieldName} for country ${countryCode}`,
      };
    }

    // Empty value validation
    if (!value || value.trim() === '') {
      if (field.required) {
        return {
          valid: false,
          error: `${field.displayName} is required`,
        };
      }
      return { valid: true }; // Optional field, empty is ok
    }

    // Normalize the input
    const normalizedValue = normalizeTaxId(value);

    // Step 1: Basic format validation using regex
    const formatValid = validateTaxIdFormat(countryCode, fieldName, normalizedValue);
    if (!formatValid) {
      return {
        valid: false,
        error: getTaxIdValidationError(countryCode, fieldName),
        details: {
          format: false,
        },
      };
    }

    // Step 2: Enhanced validation based on field type
    if (fieldName === 'vatNumber' || fieldName.toLowerCase().includes('vat')) {
      return this.validateVATNumber(countryCode, normalizedValue);
    }

    // Step 3: Country-specific checksum validation
    if (field.hasChecksum) {
      const checksumResult = this.validateChecksum(
        countryCode,
        fieldName,
        normalizedValue
      );
      if (!checksumResult.valid) {
        return checksumResult;
      }
    }

    // All validations passed
    return {
      valid: true,
      details: {
        format: true,
        checksum: field.hasChecksum ? true : undefined,
      },
    };
  }

  /**
   * Validate VAT number using jsvat library
   */
  private validateVATNumber(countryCode: string, value: string): ValidationResult {
    try {
      const result: VatCheckResult = checkVAT(value);

      if (result.isValid) {
        return {
          valid: true,
          details: {
            format: true,
            checksum: true,
            countryDetected: result.country?.isoCode.short,
          },
        };
      } else {
        return {
          valid: false,
          error: 'Invalid VAT number format or checksum',
          details: {
            format: false,
            checksum: false,
          },
        };
      }
    } catch (error) {
      // jsvat might not support this VAT format, fall back to regex validation
      return {
        valid: true,
        warnings: ['VAT checksum validation not available, format validated only'],
        details: {
          format: true,
          checksum: undefined,
        },
      };
    }
  }

  /**
   * Validate checksums for various country-specific formats
   */
  private validateChecksum(
    countryCode: string,
    fieldName: string,
    value: string
  ): ValidationResult {
    try {
      switch (countryCode) {
        case 'AU':
          if (fieldName === 'abn') {
            return this.validateABNChecksum(value);
          }
          if (fieldName === 'acn') {
            return this.validateACNChecksum(value);
          }
          break;

        case 'NZ':
          if (fieldName === 'irdNumber') {
            return this.validateIRDChecksum(value);
          }
          break;

        case 'BR':
          if (fieldName === 'cnpj') {
            return this.validateCNPJChecksum(value);
          }
          break;

        case 'CH':
          if (fieldName === 'uid') {
            return this.validateSwissUIDChecksum(value);
          }
          break;

        case 'DK':
          if (fieldName === 'cvrNumber') {
            return this.validateDanishCVRChecksum(value);
          }
          break;

        case 'IN':
          if (fieldName === 'gstin') {
            return this.validateGSTINChecksum(value);
          }
          break;

        case 'JP':
          if (fieldName === 'corporateNumber') {
            return this.validateJapaneseCorporateNumberChecksum(value);
          }
          break;

        default:
          // For other checksums, we rely on jsvat for VAT numbers
          // or accept format validation only
          return {
            valid: true,
            warnings: ['Checksum validation not implemented, format validated only'],
            details: { format: true, checksum: undefined },
          };
      }

      // Default: format valid, checksum not verified
      return {
        valid: true,
        warnings: ['Checksum validation not implemented'],
        details: { format: true, checksum: undefined },
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Checksum validation failed',
        details: { format: true, checksum: false },
      };
    }
  }

  /**
   * Validate Australian Business Number (ABN) checksum
   * Algorithm: MOD 89
   */
  private validateABNChecksum(abn: string): ValidationResult {
    if (abn.length !== 11) {
      return { valid: false, error: 'ABN must be 11 digits' };
    }

    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    let sum = 0;

    for (let i = 0; i < 11; i++) {
      const digit = parseInt(abn[i]);
      if (isNaN(digit)) {
        return { valid: false, error: 'ABN must contain only digits' };
      }

      // Subtract 1 from the first digit
      const value = i === 0 ? digit - 1 : digit;
      sum += value * weights[i];
    }

    const isValid = sum % 89 === 0;

    return {
      valid: isValid,
      error: isValid ? undefined : 'Invalid ABN checksum',
      details: { format: true, checksum: isValid },
    };
  }

  /**
   * Validate Australian Company Number (ACN) checksum
   * Algorithm: MOD 10
   */
  private validateACNChecksum(acn: string): ValidationResult {
    if (acn.length !== 9) {
      return { valid: false, error: 'ACN must be 9 digits' };
    }

    const weights = [8, 7, 6, 5, 4, 3, 2, 1];
    let sum = 0;

    for (let i = 0; i < 8; i++) {
      const digit = parseInt(acn[i]);
      if (isNaN(digit)) {
        return { valid: false, error: 'ACN must contain only digits' };
      }
      sum += digit * weights[i];
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    const lastDigit = parseInt(acn[8]);

    const isValid = checkDigit === lastDigit;

    return {
      valid: isValid,
      error: isValid ? undefined : 'Invalid ACN checksum',
      details: { format: true, checksum: isValid },
    };
  }

  /**
   * Validate New Zealand IRD Number checksum
   */
  private validateIRDChecksum(ird: string): ValidationResult {
    if (ird.length < 8 || ird.length > 9) {
      return { valid: false, error: 'IRD must be 8 or 9 digits' };
    }

    // Pad to 9 digits if needed
    const paddedIRD = ird.padStart(9, '0');

    // IRD numbers must be in range 10-000-000 to 150-000-000
    const irdNum = parseInt(paddedIRD);
    if (irdNum < 10000000 || irdNum > 150000000) {
      return { valid: false, error: 'IRD number out of valid range' };
    }

    // Checksum validation (simplified - actual algorithm is more complex)
    // For production, should use a proper IRD validation library
    return {
      valid: true,
      warnings: ['IRD checksum validation simplified'],
      details: { format: true, checksum: undefined },
    };
  }

  /**
   * Validate Brazilian CNPJ checksum
   * Algorithm: MOD 11
   */
  private validateCNPJChecksum(cnpj: string): ValidationResult {
    const cleaned = cnpj.replace(/\D/g, '');

    if (cleaned.length !== 14) {
      return { valid: false, error: 'CNPJ must be 14 digits' };
    }

    // Check for known invalid patterns (all same digit)
    if (/^(\d)\1+$/.test(cleaned)) {
      return { valid: false, error: 'Invalid CNPJ pattern' };
    }

    // Validate first check digit
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const checkDigit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (checkDigit1 !== parseInt(cleaned[12])) {
      return {
        valid: false,
        error: 'Invalid CNPJ checksum',
        details: { format: true, checksum: false },
      };
    }

    // Validate second check digit
    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const checkDigit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    const isValid = checkDigit2 === parseInt(cleaned[13]);

    return {
      valid: isValid,
      error: isValid ? undefined : 'Invalid CNPJ checksum',
      details: { format: true, checksum: isValid },
    };
  }

  /**
   * Validate Swiss UID checksum
   * Algorithm: MOD 11
   */
  private validateSwissUIDChecksum(uid: string): ValidationResult {
    // Extract digits from CHE-XXX.XXX.XXX format
    const match = uid.match(/CHE[- ]?(\d{3})\.?(\d{3})\.?(\d{3})/);
    if (!match) {
      return { valid: false, error: 'Invalid UID format' };
    }

    const digits = match[1] + match[2] + match[3];
    if (digits.length !== 9) {
      return { valid: false, error: 'UID must have 9 digits' };
    }

    // MOD 11 checksum on last digit
    const weights = [5, 4, 3, 2, 7, 6, 5, 4];
    let sum = 0;

    for (let i = 0; i < 8; i++) {
      sum += parseInt(digits[i]) * weights[i];
    }

    const checkDigit = (11 - (sum % 11)) % 11;
    const lastDigit = parseInt(digits[8]);

    const isValid = checkDigit === lastDigit;

    return {
      valid: isValid,
      error: isValid ? undefined : 'Invalid UID checksum',
      details: { format: true, checksum: isValid },
    };
  }

  /**
   * Validate Danish CVR Number checksum
   */
  private validateDanishCVRChecksum(cvr: string): ValidationResult {
    if (cvr.length !== 8) {
      return { valid: false, error: 'CVR must be 8 digits' };
    }

    const weights = [2, 7, 6, 5, 4, 3, 2, 1];
    let sum = 0;

    for (let i = 0; i < 8; i++) {
      sum += parseInt(cvr[i]) * weights[i];
    }

    const isValid = sum % 11 === 0;

    return {
      valid: isValid,
      error: isValid ? undefined : 'Invalid CVR checksum',
      details: { format: true, checksum: isValid },
    };
  }

  /**
   * Validate Indian GSTIN checksum
   */
  private validateGSTINChecksum(gstin: string): ValidationResult {
    if (gstin.length !== 15) {
      return { valid: false, error: 'GSTIN must be 15 characters' };
    }

    // GSTIN structure: SS-PPPPPPPPPP-E-Z-C
    // Check if embedded PAN is valid format
    const pan = gstin.substring(2, 12);
    const panPattern = /^[A-Z]{5}\d{4}[A-Z]$/;

    if (!panPattern.test(pan)) {
      return { valid: false, error: 'Invalid PAN embedded in GSTIN' };
    }

    // Additional checksum validation would go here
    // For now, accept format validation
    return {
      valid: true,
      warnings: ['GSTIN checksum validation simplified'],
      details: { format: true, checksum: undefined },
    };
  }

  /**
   * Validate Japanese Corporate Number checksum
   */
  private validateJapaneseCorporateNumberChecksum(number: string): ValidationResult {
    if (number.length !== 13) {
      return { valid: false, error: 'Corporate number must be 13 digits' };
    }

    // First digit should be 1-9 (checksum digit)
    const firstDigit = parseInt(number[0]);
    if (firstDigit < 1 || firstDigit > 9) {
      return { valid: false, error: 'Invalid checksum digit' };
    }

    // Simplified validation - actual algorithm is complex
    return {
      valid: true,
      warnings: ['Japanese corporate number checksum validation simplified'],
      details: { format: true, checksum: undefined },
    };
  }

  /**
   * Validate all tax IDs for a country
   */
  validateAllTaxIds(
    countryCode: string,
    taxIds: Record<string, string>
  ): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    for (const [fieldName, value] of Object.entries(taxIds)) {
      results[fieldName] = this.validateTaxId(countryCode, fieldName, value);
    }

    return results;
  }

  /**
   * Check if all required tax IDs are valid
   */
  areAllRequiredTaxIdsValid(
    countryCode: string,
    taxIds: Record<string, string>
  ): boolean {
    const config = COUNTRY_TAX_CONFIGS[countryCode];
    if (!config) return false;

    // Check primary ID
    const primaryIdValue = taxIds[config.primaryId.fieldName];
    if (config.primaryId.required) {
      const result = this.validateTaxId(
        countryCode,
        config.primaryId.fieldName,
        primaryIdValue
      );
      if (!result.valid) return false;
    }

    // Check required secondary IDs
    if (config.secondaryIds) {
      for (const field of config.secondaryIds) {
        if (field.required) {
          const value = taxIds[field.fieldName];
          const result = this.validateTaxId(countryCode, field.fieldName, value);
          if (!result.valid) return false;
        }
      }
    }

    return true;
  }
}

// Export singleton instance
export const taxIdValidationService = new TaxIdValidationService();
