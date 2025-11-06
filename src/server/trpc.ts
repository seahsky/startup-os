import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import superjson from 'superjson';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
// The middleware ensures userId and companyId are non-null
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  if (!ctx.companyId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be assigned to a company to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      // TypeScript now knows these are non-null strings
      userId: ctx.userId as string,
      companyId: ctx.companyId as string,
    },
  });
});
