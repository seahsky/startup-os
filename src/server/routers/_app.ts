import { router } from '../trpc';
import { customerRouter } from './customer';
import { productRouter } from './product';
import { companyRouter } from './company';
import { quotationRouter } from './quotation';
import { invoiceRouter } from './invoice';
import { creditNoteRouter } from './creditNote';
import { debitNoteRouter } from './debitNote';

export const appRouter = router({
  customer: customerRouter,
  product: productRouter,
  company: companyRouter,
  quotation: quotationRouter,
  invoice: invoiceRouter,
  creditNote: creditNoteRouter,
  debitNote: debitNoteRouter,
});

export type AppRouter = typeof appRouter;
