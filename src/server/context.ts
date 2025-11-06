import { inferAsyncReturnType } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function createContext(opts?: FetchCreateContextFnOptions) {
  // Get authenticated user from Clerk
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;

  // Get companyId from user's public metadata
  const companyId = user?.publicMetadata?.companyId as string | undefined;

  return {
    userId: userId || null,
    companyId: companyId || null,
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
