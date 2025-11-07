import { clerkMiddleware, createRouteMatcher, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// Onboarding route - requires authentication but not company assignment
const isOnboardingRoute = createRouteMatcher([
  '/onboarding',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl.clone();

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect all other routes - require authentication
  await auth.protect();

  // After authentication, check if user needs onboarding
  if (userId) {
    // Get user to check metadata
    const user = await currentUser();
    const companyId = user?.publicMetadata?.companyId as string | undefined;

    // If user doesn't have a company and is not already on onboarding, redirect to onboarding
    if (!companyId && !isOnboardingRoute(req)) {
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }

    // If user has a company and is on onboarding, redirect to dashboard
    if (companyId && isOnboardingRoute(req)) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes (including tRPC)
    '/(api|trpc)(.*)',
  ],
};
