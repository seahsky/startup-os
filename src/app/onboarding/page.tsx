'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CompanyCreationForm } from '@/components/onboarding/CompanyCreationForm';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user data is loaded and user already has a company, redirect to dashboard
    if (isLoaded && user) {
      const companyId = user.publicMetadata?.companyId as string | undefined;
      if (companyId) {
        router.push('/dashboard');
      }
    }
  }, [isLoaded, user, router]);

  // Show loading state while checking user data
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, they shouldn't be here
  // Clerk middleware should handle this, but just in case
  if (!user) {
    router.push('/sign-in');
    return null;
  }

  // If user already has a company, don't show the form
  // (They will be redirected by the useEffect above)
  const companyId = user.publicMetadata?.companyId as string | undefined;
  if (companyId) {
    return null;
  }

  // Show the company creation form
  return <CompanyCreationForm />;
}
