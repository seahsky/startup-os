import { inferAsyncReturnType } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import type { User } from '@clerk/nextjs/server';

// Extended options type that includes pre-fetched auth data
type CreateContextOptions = FetchCreateContextFnOptions & {
  userId?: string | null;
  user?: User | null;
};

export async function createContext(opts?: CreateContextOptions) {
  // Use pre-fetched auth data if provided (from route handler)
  // This avoids calling auth() outside of the route handler context
  const userId = opts?.userId ?? null;
  const user = opts?.user ?? null;

  // Get companyId from user's public metadata
  const companyId = user?.publicMetadata?.companyId as string | undefined;

  return {
    userId: userId || null,
    companyId: companyId || null,
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
