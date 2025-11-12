import { z } from 'zod';
import { COUNTRY_TAX_CONFIGS } from '../constants/countryTaxConfigs';
import {
  getAllTaxIdFields,
  validateTaxIdFormat,
  getTaxIdValidationError,
} from '../utils/taxIdHelpers';

export const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
});

export const customerCreateSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone is required'),
    address: addressSchema.optional(),
    country: z.string().length(2, 'Must be 2-letter ISO country code'),
    taxIds: z.record(z.string()).optional(),
    contactPerson: z.string().optional(),
    notes: z.string().optional(),
    currency: z.string().optional(),
    status: z.enum(['active', 'inactive']).default('active'),
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
      // If taxIds are provided, validate their format
      if (data.taxIds && Object.keys(data.taxIds).length > 0) {
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
      if (data.taxIds) {
        const allFields = getAllTaxIdFields(data.country);
        const invalid = allFields.find((field) => {
          const value = data.taxIds?.[field.fieldName];
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
      }

      return {
        message: 'Invalid tax ID format',
        path: ['taxIds'],
      };
    }
  );

export const customerUpdateSchema = z
  .object({
    id: z.string().min(1, 'ID is required'),
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().min(1, 'Phone is required').optional(),
    address: addressSchema.optional(),
    country: z.string().length(2, 'Must be 2-letter ISO country code').optional(),
    taxIds: z.record(z.string()).optional(),
    contactPerson: z.string().optional(),
    notes: z.string().optional(),
    currency: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
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
      if (data.country && data.taxIds && Object.keys(data.taxIds).length > 0) {
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

export const customerListSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
export type CustomerListInput = z.infer<typeof customerListSchema>;
