import { z } from 'zod';
import { addressSchema } from './customer.schema';

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

export const companyCreateSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  address: addressSchema,
  taxId: z.string().min(1, 'Tax ID is required'),
  logo: z.string().optional(),
  currency: z.string().min(1, 'Currency is required').default('USD'),
  settings: companySettingsSchema.optional(),
});

export const companyUpdateSchema = z.object({
  name: z.string().min(1, 'Company name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(1, 'Phone is required').optional(),
  address: addressSchema.optional(),
  taxId: z.string().min(1, 'Tax ID is required').optional(),
  logo: z.string().optional(),
  currency: z.string().min(1, 'Currency is required').optional(),
});

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

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;
export type CompanySettingsUpdateInput = z.infer<typeof companySettingsUpdateSchema>;
