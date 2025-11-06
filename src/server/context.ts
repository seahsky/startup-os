import { inferAsyncReturnType } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export async function createContext(opts?: FetchCreateContextFnOptions) {
  // TODO: Add authentication context here
  // For now, we'll use a default company ID
  // In production, this would come from the authenticated user
  return {
    companyId: '507f1f77bcf86cd799439011', // Default company ID (will be from auth later)
    userId: '507f1f77bcf86cd799439012', // Default user ID (will be from auth later)
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
