import { z } from 'zod';
import { documentItemSchema } from './quotation.schema';

export const invoiceCreateSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  quotationId: z.string().optional(),
  date: z.date(),
  dueDate: z.date(),
  items: z.array(documentItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled']).default('draft'),
});

export const invoiceUpdateSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  customerId: z.string().min(1, 'Customer is required').optional(),
  date: z.date().optional(),
  dueDate: z.date().optional(),
  items: z.array(documentItemSchema).min(1).optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled']).optional(),
});

export const paymentRecordSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.date(),
  method: z.string().min(1, 'Payment method is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const invoiceListSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z.enum(['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled']).optional(),
  customerId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>;
export type PaymentRecordInput = z.infer<typeof paymentRecordSchema>;
export type InvoiceListInput = z.infer<typeof invoiceListSchema>;
