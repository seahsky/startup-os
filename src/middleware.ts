import { clerkMiddleware, createRouteMatcher, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Note: Middleware automatically runs on Edge Runtime in Next.js 14+
// No need to explicitly set runtime = 'edge' for middleware

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/api/trpc(.*)',
]);

// Onboarding route - requires authentication but not company assignment
const isOnboardingRoute = createRouteMatcher([
  '/onboarding',
]);

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.clone();

  // Explicitly protect routes that require authentication
  if (isProtectedRoute(req)) {
    // auth.protect() returns the auth object - no need to call auth() again
    const { userId } = await auth.protect();

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
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/api/:path*',
  ],
};
