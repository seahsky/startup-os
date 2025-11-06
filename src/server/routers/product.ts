import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getProductsCollection } from '../db/collections';
import {
  productCreateSchema,
  productUpdateSchema,
  productListSchema,
} from '@/lib/validations/product.schema';

export const productRouter = router({
  list: publicProcedure
    .input(productListSchema)
    .query(async ({ input, ctx }) => {
      const products = await getProductsCollection();

      const filter: any = {
        companyId: new ObjectId(ctx.companyId),
      };

      if (input.search) {
        filter.$or = [
          { name: { $regex: input.search, $options: 'i' } },
          { description: { $regex: input.search, $options: 'i' } },
          { sku: { $regex: input.search, $options: 'i' } },
        ];
      }

      if (input.category) {
        filter.category = input.category;
      }

      if (input.status) {
        filter.status = input.status;
      }

      const skip = (input.page - 1) * input.limit;

      const [items, total] = await Promise.all([
        products
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(input.limit)
          .toArray(),
        products.countDocuments(filter),
      ]);

      return {
        items,
        total,
        page: input.page,
        limit: input.limit,
        pages: Math.ceil(total / input.limit),
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const products = await getProductsCollection();

      const product = await products.findOne({
        _id: new ObjectId(input.id),
        companyId: new ObjectId(ctx.companyId),
      });

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    }),

  create: protectedProcedure
    .input(productCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const products = await getProductsCollection();

      const product = {
        _id: new ObjectId(),
        companyId: new ObjectId(ctx.companyId),
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await products.insertOne(product);

      return product;
    }),

  update: protectedProcedure
    .input(productUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const products = await getProductsCollection();
      const { id, ...updateData } = input;

      const result = await products.findOneAndUpdate(
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
        throw new Error('Product not found');
      }

      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const products = await getProductsCollection();

      const result = await products.deleteOne({
        _id: new ObjectId(input.id),
        companyId: new ObjectId(ctx.companyId),
      });

      if (result.deletedCount === 0) {
        throw new Error('Product not found');
      }

      return { success: true };
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input, ctx }) => {
      const products = await getProductsCollection();

      const results = await products
        .find({
          companyId: new ObjectId(ctx.companyId),
          status: 'active',
          $or: [
            { name: { $regex: input.query, $options: 'i' } },
            { description: { $regex: input.query, $options: 'i' } },
            { sku: { $regex: input.query, $options: 'i' } },
          ],
        })
        .limit(10)
        .toArray();

      return results;
    }),
});
