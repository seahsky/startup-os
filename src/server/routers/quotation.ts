import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getQuotationsCollection, getCustomersCollection } from '../db/collections';
import {
  quotationCreateSchema,
  quotationUpdateSchema,
  quotationListSchema,
} from '@/lib/validations/quotation.schema';
import { documentNumberingService } from '../services/documentNumbering';
import { taxCalculationService } from '../services/taxCalculation';
import { documentConversionService } from '../services/documentConversion';
import { CustomerSnapshot } from '@/lib/types/document';

export const quotationRouter = router({
  list: protectedProcedure
    .input(quotationListSchema)
    .query(async ({ input, ctx }) => {
      const quotations = await getQuotationsCollection();

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
        quotations
          .find(filter)
          .sort({ date: -1 })
          .skip(skip)
          .limit(input.limit)
          .toArray(),
        quotations.countDocuments(filter),
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
      const quotations = await getQuotationsCollection();

      const quotation = await quotations.findOne({
        _id: new ObjectId(input.id),
        companyId: new ObjectId(ctx.companyId),
      });

      if (!quotation) {
        throw new Error('Quotation not found');
      }

      return quotation;
    }),

  create: protectedProcedure
    .input(quotationCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const quotations = await getQuotationsCollection();
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
        'quotation'
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
        taxId: customer.taxId,
      };

      const quotation = {
        _id: new ObjectId(),
        companyId: new ObjectId(ctx.companyId),
        documentNumber,
        customerId: new ObjectId(input.customerId),
        customerSnapshot,
        date: input.date,
        validUntil: input.validUntil,
        items: enrichedItems,
        subtotal: totals.subtotal,
        totalTax: totals.totalTax,
        total: totals.total,
        currency: input.currency,
        notes: input.notes,
        termsAndConditions: input.termsAndConditions,
        status: input.status,
        createdBy: ctx.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await quotations.insertOne(quotation);

      return quotation;
    }),

  update: protectedProcedure
    .input(quotationUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const quotations = await getQuotationsCollection();
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

      const result = await quotations.findOneAndUpdate(
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
        throw new Error('Quotation not found');
      }

      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const quotations = await getQuotationsCollection();

      const result = await quotations.deleteOne({
        _id: new ObjectId(input.id),
        companyId: new ObjectId(ctx.companyId),
      });

      if (result.deletedCount === 0) {
        throw new Error('Quotation not found');
      }

      return { success: true };
    }),

  convertToInvoice: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const invoice = await documentConversionService.convertQuotationToInvoice(
        input.id,
        ctx.userId
      );

      return invoice;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const quotations = await getQuotationsCollection();

      const result = await quotations.findOneAndUpdate(
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
        throw new Error('Quotation not found');
      }

      return result;
    }),
});
