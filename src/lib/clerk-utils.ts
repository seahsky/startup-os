import { clerkClient } from '@clerk/nextjs/server';

/**
 * User role type - matches the role stored in user metadata
 */
export type UserRole = 'admin' | 'user' | 'viewer';

/**
 * User metadata structure for app-specific data
 */
export interface UserMetadata {
  companyId?: string;
  role?: UserRole;
  onboardingCompleted?: boolean;
}

/**
 * Update user's public metadata (accessible on frontend)
 * Use this for non-sensitive app data like companyId and role
 * @throws Error if update fails
 */
export async function updateUserMetadata(
  userId: string,
  metadata: Partial<UserMetadata>
): Promise<void> {
  const client = await clerkClient();

  try {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: metadata,
    });
  } catch (error) {
    // Log error details for debugging but don't expose sensitive info
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to update user metadata:', { userId, errorMessage });

    // Re-throw with safe message
    throw new Error('Failed to update user metadata');
  }
}

/**
 * Get user's metadata from Clerk
 * @throws Error if retrieval fails
 */
export async function getUserMetadata(userId: string): Promise<UserMetadata | null> {
  const client = await clerkClient();

  try {
    const user = await client.users.getUser(userId);
    return (user.publicMetadata as UserMetadata) || null;
  } catch (error) {
    // Log error details for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to get user metadata:', { userId, errorMessage });

    // Re-throw with safe message
    throw new Error('Failed to get user metadata');
  }
}

/**
 * Assign user to a company and set their role
 * This should be called during onboarding or by an admin
 * @throws Error if assignment fails
 */
export async function assignUserToCompany(
  userId: string,
  companyId: string,
  role: UserRole = 'user'
): Promise<void> {
  await updateUserMetadata(userId, {
    companyId,
    role,
    onboardingCompleted: true,
  });
}

/**
 * Check if user has completed onboarding (has companyId assigned)
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const metadata = await getUserMetadata(userId);
  return !!(metadata?.companyId && metadata?.onboardingCompleted);
}

/**
 * Update user's role within their company
 * @throws Error if user is not assigned to a company or update fails
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  const metadata = await getUserMetadata(userId);

  if (!metadata?.companyId) {
    throw new Error('User must be assigned to a company first');
  }

  await updateUserMetadata(userId, { role });
}
