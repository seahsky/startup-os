import { cache } from 'react';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';
import { auth, currentUser } from '@clerk/nextjs/server';

// Cache auth calls per request to avoid redundant lookups
const getAuthData = cache(async () => {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  return { userId, user };
});

const handler = async (req: Request) => {
  // Get cached auth data for this request
  const { userId, user } = await getAuthData();

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: (opts) => createContext({ ...opts, userId, user }),
  });
};

export { handler as GET, handler as POST };
