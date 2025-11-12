import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getInvoicesCollection, getCustomersCollection, getCompaniesCollection } from '../db/collections';
import {
  invoiceCreateSchema,
  invoiceUpdateSchema,
  invoiceListSchema,
  paymentRecordSchema,
} from '@/lib/validations/invoice.schema';
import { documentNumberingService } from '../services/documentNumbering';
import { taxCalculationService } from '../services/taxCalculation';
import { paymentService } from '../services/paymentService';
import { CustomerSnapshot } from '@/lib/types/document';

export const invoiceRouter = router({
  list: protectedProcedure
    .input(invoiceListSchema)
    .query(async ({ input, ctx }) => {
      const invoices = await getInvoicesCollection();

      const filter: any = {
        companyId: new ObjectId(ctx.companyId),
      };

      if (input.status) {
        filter.status = input.status;
      }

      if (input.customerId) {
        filter.customerId = new ObjectId(input.customerId);
      }

      if (input.dateFrom || input.dateTo) {
        filter.date = {};
        if (input.dateFrom) filter.date.$gte = input.dateFrom;
        if (input.dateTo) filter.date.$lte = input.dateTo;
      }

      const skip = (input.page - 1) * input.limit;

      const [items, total] = await Promise.all([
        invoices
          .find(filter)
          .sort({ date: -1 })
          .skip(skip)
          .limit(input.limit)
          .toArray(),
        invoices.countDocuments(filter),
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
      const invoices = await getInvoicesCollection();

      const invoice = await invoices.findOne({
        _id: new ObjectId(input.id),
        companyId: new ObjectId(ctx.companyId),
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    }),

  create: protectedProcedure
    .input(invoiceCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const invoices = await getInvoicesCollection();
      const customers = await getCustomersCollection();

      // Get customer for snapshot
      const customer = await customers.findOne({
        _id: new ObjectId(input.customerId),
        companyId: new ObjectId(ctx.companyId),
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Generate document number
      const documentNumber = await documentNumberingService.getNextNumber(
        ctx.companyId,
        'invoice'
      );

      // Enrich items with calculations
      const enrichedItems = taxCalculationService.enrichItemsWithCalculations(input.items);

      // Calculate document totals
      const totals = taxCalculationService.calculateDocument(enrichedItems);

      // Create customer snapshot
      const customerSnapshot: CustomerSnapshot = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        country: customer.country,
        taxIds: customer.taxIds,
      };

      const invoice = {
        _id: new ObjectId(),
        companyId: new ObjectId(ctx.companyId),
        documentNumber,
        customerId: new ObjectId(input.customerId),
        customerSnapshot,
        quotationId: input.quotationId ? new ObjectId(input.quotationId) : undefined,
        date: input.date,
        dueDate: input.dueDate,
        items: enrichedItems,
        subtotal: totals.subtotal,
        totalTax: totals.totalTax,
        total: totals.total,
        currency: input.currency,
        notes: input.notes,
        termsAndConditions: input.termsAndConditions,
        status: input.status,
        paymentStatus: {
          amountPaid: 0,
          amountDue: totals.total,
          payments: [],
        },
        createdBy: ctx.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await invoices.insertOne(invoice);

      return invoice;
    }),

  update: protectedProcedure
    .input(invoiceUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const invoices = await getInvoicesCollection();
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
          'paymentStatus.amountDue': totals.total,
        };
      }

      const result = await invoices.findOneAndUpdate(
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
        throw new Error('Invoice not found');
      }

      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const invoices = await getInvoicesCollection();

      const result = await invoices.deleteOne({
        _id: new ObjectId(input.id),
        companyId: new ObjectId(ctx.companyId),
      });

      if (result.deletedCount === 0) {
        throw new Error('Invoice not found');
      }

      return { success: true };
    }),

  recordPayment: protectedProcedure
    .input(paymentRecordSchema)
    .mutation(async ({ input, ctx }) => {
      const { invoiceId, ...paymentData } = input;

      const invoice = await paymentService.recordPayment(invoiceId, paymentData);

      return invoice;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const invoices = await getInvoicesCollection();

      const result = await invoices.findOneAndUpdate(
        {
          _id: new ObjectId(input.id),
          companyId: new ObjectId(ctx.companyId),
        },
        {
          $set: {
            status: input.status,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Invoice not found');
      }

      return result;
    }),
});
