import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getCustomersCollection } from '../db/collections';
import {
  customerCreateSchema,
  customerUpdateSchema,
  customerListSchema,
} from '@/lib/validations/customer.schema';

export const customerRouter = router({
  list: protectedProcedure
    .input(customerListSchema)
    .query(async ({ input, ctx }) => {
      const customers = await getCustomersCollection();

      const filter: any = {
        companyId: new ObjectId(ctx.companyId),
      };

      if (input.search) {
        filter.$or = [
          { name: { $regex: input.search, $options: 'i' } },
          { email: { $regex: input.search, $options: 'i' } },
        ];
      }

      if (input.status) {
        filter.status = input.status;
      }

      const skip = (input.page - 1) * input.limit;

      const [items, total] = await Promise.all([
        customers
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(input.limit)
          .toArray(),
        customers.countDocuments(filter),
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
      const customers = await getCustomersCollection();

      const customer = await customers.findOne({
        _id: new ObjectId(input.id),
        companyId: new ObjectId(ctx.companyId),
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }),

  create: protectedProcedure
    .input(customerCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const customers = await getCustomersCollection();

      const customer = {
        _id: new ObjectId(),
        companyId: new ObjectId(ctx.companyId),
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await customers.insertOne(customer);

      return customer;
    }),

  update: protectedProcedure
    .input(customerUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const customers = await getCustomersCollection();
      const { id, ...updateData } = input;

      const result = await customers.findOneAndUpdate(
        {
          _id: new ObjectId(id),
          companyId: new ObjectId(ctx.companyId),
        },
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Customer not found');
      }

      // Update snapshots in draft documents (non-blocking - don't fail customer update if this fails)
      let documentsUpdated = 0;
      try {
        const { snapshotUpdateService } = await import('../services/snapshotUpdateService');
        const { snapshotAuditService } = await import('../services/snapshotAuditService');

        // Create snapshot from updated customer
        const newSnapshot = snapshotAuditService.createSnapshot(result);

        // Update all draft documents with the new snapshot
        documentsUpdated = await snapshotUpdateService.updateDraftDocumentsForCustomer(
          id,
          newSnapshot,
          ctx.userId
        );
      } catch (error) {
        console.error('Failed to update document snapshots:', error);
        // Don't throw - customer update should succeed even if snapshot update fails
      }

      return {
        ...result,
        documentsUpdated, // Include count of updated documents in response
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const customers = await getCustomersCollection();

      const result = await customers.deleteOne({
        _id: new ObjectId(input.id),
        companyId: new ObjectId(ctx.companyId),
      });

      if (result.deletedCount === 0) {
        throw new Error('Customer not found');
      }

      return { success: true };
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input, ctx }) => {
      const customers = await getCustomersCollection();

      const results = await customers
        .find({
          companyId: new ObjectId(ctx.companyId),
          status: 'active',
          $or: [
            { name: { $regex: input.query, $options: 'i' } },
            { email: { $regex: input.query, $options: 'i' } },
          ],
        })
        .limit(10)
        .toArray();

      return results;
    }),
});
