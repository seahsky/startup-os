import { z } from 'zod';
import { documentItemSchema } from './quotation.schema';

export const creditNoteCreateSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  date: z.date(),
  reason: z.string().min(1, 'Reason is required'),
  items: z.array(documentItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  status: z.enum(['draft', 'sent', 'applied']).default('draft'),
});

export const creditNoteUpdateSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  date: z.date().optional(),
  reason: z.string().min(1, 'Reason is required').optional(),
  items: z.array(documentItemSchema).min(1).optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'sent', 'applied']).optional(),
});

export const creditNoteListSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z.enum(['draft', 'sent', 'applied']).optional(),
  invoiceId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type CreditNoteCreateInput = z.infer<typeof creditNoteCreateSchema>;
export type CreditNoteUpdateInput = z.infer<typeof creditNoteUpdateSchema>;
export type CreditNoteListInput = z.infer<typeof creditNoteListSchema>;
