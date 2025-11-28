import { z } from 'zod';
import { addressSchema } from './customer.schema';
import { COUNTRY_TAX_CONFIGS } from '../constants/countryTaxConfigs';
import {
  getAllTaxIdFields,
  getRequiredTaxIdFields,
  validateTaxIdFormat,
  getTaxIdValidationError,
} from '../utils/taxIdHelpers';

export const companySettingsSchema = z.object({
  invoicePrefix: z.string().min(1, 'Invoice prefix is required').default('INV-'),
  quotationPrefix: z.string().min(1, 'Quotation prefix is required').default('QUO-'),
  creditNotePrefix: z.string().min(1, 'Credit note prefix is required').default('CN-'),
  debitNotePrefix: z.string().min(1, 'Debit note prefix is required').default('DN-'),
  nextInvoiceNumber: z.number().min(1).default(1001),
  nextQuotationNumber: z.number().min(1).default(1001),
  nextCreditNoteNumber: z.number().min(1).default(1001),
  nextDebitNoteNumber: z.number().min(1).default(1001),
  defaultTaxRate: z.number().min(0).max(100).default(10),
  paymentTerms: z.string().min(1).default('Net 30'),
  defaultDueDays: z.number().min(1).default(30),
});

export const companyCreateSchema = z
  .object({
    name: z.string().min(1, 'Company name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone is required'),
    address: addressSchema,
    country: z.string().length(2, 'Must be 2-letter ISO country code'),
    taxIds: z.record(z.string()),
    logo: z.string().optional(),
    currency: z.string().min(1, 'Currency is required').default('USD'),
    settings: companySettingsSchema.optional(),
  })
  .refine(
    (data) => {
      // Validate country code exists in our configurations
      return data.country in COUNTRY_TAX_CONFIGS;
    },
    {
      message: 'Invalid or unsupported country code',
      path: ['country'],
    }
  )
  .refine(
    (data) => {
      // Validate all required tax IDs are provided
      const requiredFields = getRequiredTaxIdFields(data.country);

      for (const field of requiredFields) {
        if (!data.taxIds[field.fieldName] || data.taxIds[field.fieldName].trim() === '') {
          return false;
        }
      }

      return true;
    },
    (data) => {
      const requiredFields = getRequiredTaxIdFields(data.country);
      const missing = requiredFields.filter(
        (field) => !data.taxIds[field.fieldName] || data.taxIds[field.fieldName].trim() === ''
      );

      return {
        message: `Missing required tax IDs: ${missing.map((f) => f.displayName).join(', ')}`,
        path: ['taxIds'],
      };
    }
  )
  .refine(
    (data) => {
      // Validate format of all provided tax IDs
      const allFields = getAllTaxIdFields(data.country);

      for (const field of allFields) {
        const value = data.taxIds[field.fieldName];
        if (value && value.trim() !== '') {
          const isValid = validateTaxIdFormat(data.country, field.fieldName, value);
          if (!isValid) {
            return false;
          }
        }
      }

      return true;
    },
    (data) => {
      const allFields = getAllTaxIdFields(data.country);
      const invalid = allFields.find((field) => {
        const value = data.taxIds[field.fieldName];
        if (value && value.trim() !== '') {
          return !validateTaxIdFormat(data.country, field.fieldName, value);
        }
        return false;
      });

      if (invalid) {
        return {
          message: getTaxIdValidationError(data.country, invalid.fieldName),
          path: ['taxIds', invalid.fieldName],
        };
      }

      return {
        message: 'Invalid tax ID format',
        path: ['taxIds'],
      };
    }
  );

export const companyUpdateSchema = z
  .object({
    name: z.string().min(1, 'Company name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().min(1, 'Phone is required').optional(),
    address: addressSchema.optional(),
    country: z.string().length(2, 'Must be 2-letter ISO country code').optional(),
    taxIds: z.record(z.string()).optional(),
    logo: z.string().optional(),
    currency: z.string().min(1, 'Currency is required').optional(),
  })
  .refine(
    (data) => {
      // If country is provided, validate it exists
      if (data.country) {
        return data.country in COUNTRY_TAX_CONFIGS;
      }
      return true;
    },
    {
      message: 'Invalid or unsupported country code',
      path: ['country'],
    }
  )
  .refine(
    (data) => {
      // If both country and taxIds are provided, validate format
      if (data.country && data.taxIds) {
        const allFields = getAllTaxIdFields(data.country);

        for (const field of allFields) {
          const value = data.taxIds[field.fieldName];
          if (value && value.trim() !== '') {
            const isValid = validateTaxIdFormat(data.country, field.fieldName, value);
            if (!isValid) {
              return false;
            }
          }
        }
      }
      return true;
    },
    (data) => {
      if (data.country && data.taxIds) {
        const allFields = getAllTaxIdFields(data.country);
        const invalid = allFields.find((field) => {
          const value = data.taxIds?.[field.fieldName];
          if (value && value.trim() !== '') {
            return !validateTaxIdFormat(data.country!, field.fieldName, value);
          }
          return false;
        });

        if (invalid) {
          return {
            message: getTaxIdValidationError(data.country, invalid.fieldName),
            path: ['taxIds', invalid.fieldName],
          };
        }
      }

      return {
        message: 'Invalid tax ID format',
        path: ['taxIds'],
      };
    }
  );

export const companySettingsUpdateSchema = z.object({
  invoicePrefix: z.string().min(1, 'Invoice prefix is required').optional(),
  quotationPrefix: z.string().min(1, 'Quotation prefix is required').optional(),
  creditNotePrefix: z.string().min(1, 'Credit note prefix is required').optional(),
  debitNotePrefix: z.string().min(1, 'Debit note prefix is required').optional(),
  nextInvoiceNumber: z.number().min(1).optional(),
  nextQuotationNumber: z.number().min(1).optional(),
  nextCreditNoteNumber: z.number().min(1).optional(),
  nextDebitNoteNumber: z.number().min(1).optional(),
  defaultTaxRate: z.number().min(0).max(100).optional(),
  paymentTerms: z.string().min(1).optional(),
  defaultDueDays: z.number().min(1).optional(),
});

// Australian bank payment information schema
// BSB: 6 digits, can be entered as XXX-XXX or XXXXXX, stored as XXXXXX
export const paymentInfoSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required').max(100, 'Bank name too long'),
  bsb: z
    .string()
    .min(1, 'BSB is required')
    .transform((val) => val.replace(/-/g, '')) // Remove hyphens for storage
    .refine((val) => /^\d{6}$/.test(val), {
      message: 'BSB must be exactly 6 digits',
    }),
  accountNumber: z
    .string()
    .min(1, 'Account number is required')
    .max(20, 'Account number too long')
    .refine((val) => /^\d+$/.test(val), {
      message: 'Account number must contain only digits',
    }),
  accountName: z.string().min(1, 'Account name is required').max(100, 'Account name too long'),
});

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;
export type CompanySettingsUpdateInput = z.infer<typeof companySettingsUpdateSchema>;
export type PaymentInfoInput = z.infer<typeof paymentInfoSchema>;
