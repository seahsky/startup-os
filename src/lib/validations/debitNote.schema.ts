import { z } from 'zod';
import { documentItemSchema } from './quotation.schema';

export const debitNoteCreateSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  date: z.date(),
  reason: z.string().min(1, 'Reason is required'),
  items: z.array(documentItemSchema).min(1, 'At least one item is required'),
  currency: z.string().min(1, 'Currency is required'),
  notes: z.string().optional(),
  status: z.enum(['draft', 'sent', 'applied']).default('draft'),
});

export const debitNoteUpdateSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  date: z.date().optional(),
  reason: z.string().min(1, 'Reason is required').optional(),
  items: z.array(documentItemSchema).min(1).optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'sent', 'applied']).optional(),
});

export const debitNoteListSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z.enum(['draft', 'sent', 'applied']).optional(),
  invoiceId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type DebitNoteCreateInput = z.infer<typeof debitNoteCreateSchema>;
export type DebitNoteUpdateInput = z.infer<typeof debitNoteUpdateSchema>;
export type DebitNoteListInput = z.infer<typeof debitNoteListSchema>;
