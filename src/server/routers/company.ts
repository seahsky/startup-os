import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getCompaniesCollection } from '../db/collections';
import { addressSchema } from '@/lib/validations/customer.schema';

const companySettingsSchema = z.object({
  invoicePrefix: z.string().min(1),
  quotationPrefix: z.string().min(1),
  creditNotePrefix: z.string().min(1),
  debitNotePrefix: z.string().min(1),
  defaultTaxRate: z.number().min(0).max(100),
  paymentTerms: z.string(),
  defaultDueDays: z.number().min(0),
});

const companyUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: addressSchema.optional(),
  taxId: z.string().optional(),
  logo: z.string().optional(),
  currency: z.string().optional(),
});

export const companyRouter = router({
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
    .input(companySettingsSchema.partial())
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
