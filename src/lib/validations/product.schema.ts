import { z } from 'zod';

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  sku: z.string().optional(),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100'),
  unit: z.string().min(1, 'Unit is required'),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const productUpdateSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  sku: z.string().optional(),
  unitPrice: z.number().min(0, 'Unit price must be positive').optional(),
  taxRate: z.number().min(0).max(100).optional(),
  unit: z.string().min(1, 'Unit is required').optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const productListSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductListInput = z.infer<typeof productListSchema>;
