import { ObjectId } from 'mongodb';
import { TRPCError } from '@trpc/server';
import { router, authenticatedProcedure, protectedProcedure } from '../trpc';
import { getCompaniesCollection } from '../db/collections';
import {
  companyCreateSchema,
  companyUpdateSchema,
  companySettingsUpdateSchema
} from '@/lib/validations/company.schema';
import { assignUserToCompany } from '@/lib/clerk-utils';
import type { Company } from '@/lib/types/document';

export const companyRouter = router({
  create: authenticatedProcedure
    .input(companyCreateSchema)
    .mutation(async ({ input, ctx }) => {
      // User should not already have a company
      if (ctx.companyId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are already assigned to a company',
        });
      }

      const companies = await getCompaniesCollection();

      // Create default settings if not provided
      const defaultSettings = {
        invoicePrefix: 'INV-',
        quotationPrefix: 'QUO-',
        creditNotePrefix: 'CN-',
        debitNotePrefix: 'DN-',
        nextInvoiceNumber: 1001,
        nextQuotationNumber: 1001,
        nextCreditNoteNumber: 1001,
        nextDebitNoteNumber: 1001,
        defaultTaxRate: input.settings?.defaultTaxRate ?? 10,
        paymentTerms: input.settings?.paymentTerms ?? 'Net 30',
        defaultDueDays: input.settings?.defaultDueDays ?? 30,
      };

      // Build the company document
      const newCompany: Company = {
        _id: new ObjectId(),
        name: input.name,
        email: input.email,
        phone: input.phone,
        address: input.address,
        country: input.country,
        taxIds: input.taxIds,
        logo: input.logo,
        currency: input.currency || 'USD',
        settings: input.settings ? { ...defaultSettings, ...input.settings } : defaultSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Insert the company into the database
      const result = await companies.insertOne(newCompany);

      if (!result.acknowledged) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create company',
        });
      }

      // Assign the user to the new company as admin
      await assignUserToCompany(
        ctx.userId,
        newCompany._id.toString(),
        'admin'
      );

      return newCompany;
    }),

  get: protectedProcedure.query(async ({ ctx }) => {
    const companies = await getCompaniesCollection();

    const company = await companies.findOne({
      _id: new ObjectId(ctx.companyId),
    });

    if (!company) {
      throw new Error('Company not found');
    }

    return company;
  }),

  update: protectedProcedure
    .input(companyUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const companies = await getCompaniesCollection();

      const result = await companies.findOneAndUpdate(
        { _id: new ObjectId(ctx.companyId) },
        {
          $set: {
            ...input,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Company not found');
      }

      return result;
    }),

  updateSettings: protectedProcedure
    .input(companySettingsUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const companies = await getCompaniesCollection();

      const updateFields: any = {};
      Object.keys(input).forEach((key) => {
        updateFields[`settings.${key}`] = (input as any)[key];
      });

      const result = await companies.findOneAndUpdate(
        { _id: new ObjectId(ctx.companyId) },
        {
          $set: {
            ...updateFields,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Company not found');
      }

      return result;
    }),
});
