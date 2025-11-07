import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';
import { auth, currentUser } from '@clerk/nextjs/server';

const handler = async (req: Request) => {
  // Call auth() in the route handler context where Clerk can detect middleware
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: (opts) => createContext({ ...opts, userId, user }),
  });
};

export { handler as GET, handler as POST };
