import { z } from 'zod';

export const documentItemSchema = z.object({
  productId: z.preprocess(
    (val) => (val === null || val === undefined || val === '' ? undefined : val),
    z.string().min(1).optional()
  ),
  name: z.string().min(1, 'Item name is required'),
  description: z.string(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100'),
});

export const quotationCreateSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  date: z.date(),
  validUntil: z.date(),
  items: z.array(documentItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted']).default('draft'),
});

export const quotationUpdateSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  customerId: z.string().min(1, 'Customer is required').optional(),
  date: z.date().optional(),
  validUntil: z.date().optional(),
  items: z.array(documentItemSchema).min(1).optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted']).optional(),
});

export const quotationListSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted']).optional(),
  customerId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type QuotationCreateInput = z.infer<typeof quotationCreateSchema>;
export type QuotationUpdateInput = z.infer<typeof quotationUpdateSchema>;
export type QuotationListInput = z.infer<typeof quotationListSchema>;
