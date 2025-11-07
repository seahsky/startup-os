import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getDebitNotesCollection, getInvoicesCollection } from '../db/collections';
import {
  debitNoteCreateSchema,
  debitNoteUpdateSchema,
  debitNoteListSchema,
} from '@/lib/validations/debitNote.schema';
import { documentNumberingService } from '../services/documentNumbering';
import { taxCalculationService } from '../services/taxCalculation';
import { creditDebitService } from '../services/creditDebitService';

export const debitNoteRouter = router({
  list: protectedProcedure
    .input(debitNoteListSchema)
    .query(async ({ input, ctx }) => {
      const debitNotes = await getDebitNotesCollection();

      const filter: any = {
        companyId: new ObjectId(ctx.companyId),
      };

      if (input.status) {
        filter.status = input.status;
      }

      if (input.invoiceId) {
        filter.invoiceId = new ObjectId(input.invoiceId);
      }

      if (input.dateFrom || input.dateTo) {
        filter.date = {};
        if (input.dateFrom) filter.date.$gte = input.dateFrom;
        if (input.dateTo) filter.date.$lte = input.dateTo;
      }

      const skip = (input.page - 1) * input.limit;

      const [items, total] = await Promise.all([
        debitNotes
          .find(filter)
          .sort({ date: -1 })
          .skip(skip)
          .limit(input.limit)
          .toArray(),
        debitNotes.countDocuments(filter),
      ]);

      return {
        items,
        total,
        page: input.page,
        limit: input.limit,
        pages: Math.ceil(total / input.limit),
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const debitNotes = await getDebitNotesCollection();

      const debitNote = await debitNotes.findOne({
        _id: new ObjectId(input.id),
        companyId: new ObjectId(ctx.companyId),
      });

      if (!debitNote) {
        throw new Error('Debit note not found');
      }

      return debitNote;
    }),

  create: protectedProcedure
    .input(debitNoteCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const debitNotes = await getDebitNotesCollection();
      const invoices = await getInvoicesCollection();

      // Get invoice for customer snapshot
      const invoice = await invoices.findOne({
        _id: new ObjectId(input.invoiceId),
        companyId: new ObjectId(ctx.companyId),
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Generate document number
      const documentNumber = await documentNumberingService.getNextNumber(
        ctx.companyId,
        'debit_note'
      );

      // Enrich items with calculations
      const enrichedItems = taxCalculationService.enrichItemsWithCalculations(input.items);

      // Calculate document totals
      const totals = taxCalculationService.calculateDocument(enrichedItems);

      const debitNote = {
        _id: new ObjectId(),
        companyId: new ObjectId(ctx.companyId),
        documentNumber,
        invoiceId: new ObjectId(input.invoiceId),
        customerId: invoice.customerId,
        customerSnapshot: invoice.customerSnapshot,
        date: input.date,
        reason: input.reason,
        items: enrichedItems,
        subtotal: totals.subtotal,
        totalTax: totals.totalTax,
        total: totals.total,
        notes: input.notes,
        status: input.status,
        createdBy: ctx.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await debitNotes.insertOne(debitNote);

      return debitNote;
    }),

  update: protectedProcedure
    .input(debitNoteUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const debitNotes = await getDebitNotesCollection();
      const { id, ...updateData } = input;

      // If items are updated, recalculate totals
      let calculatedData: any = {};
      if (updateData.items) {
        const enrichedItems = taxCalculationService.enrichItemsWithCalculations(updateData.items);
        const totals = taxCalculationService.calculateDocument(enrichedItems);

        calculatedData = {
          items: enrichedItems,
          subtotal: totals.subtotal,
          totalTax: totals.totalTax,
          total: totals.total,
        };
      }

      const result = await debitNotes.findOneAndUpdate(
        {
          _id: new ObjectId(id),
          companyId: new ObjectId(ctx.companyId),
        },
        {
          $set: {
            ...updateData,
            ...calculatedData,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Debit note not found');
      }

      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const debitNotes = await getDebitNotesCollection();

      const result = await debitNotes.deleteOne({
        _id: new ObjectId(input.id),
        companyId: new ObjectId(ctx.companyId),
      });

      if (result.deletedCount === 0) {
        throw new Error('Debit note not found');
      }

      return { success: true };
    }),

  applyNote: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await creditDebitService.applyDebitNote(input.id);

      return { success: true };
    }),
});
