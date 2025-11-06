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
 */
export async function updateUserMetadata(
  userId: string,
  metadata: Partial<UserMetadata>
) {
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: metadata,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to update user metadata:', error);
    return { success: false, error };
  }
}

/**
 * Get user's metadata from Clerk
 */
export async function getUserMetadata(userId: string): Promise<UserMetadata | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return (user.publicMetadata as UserMetadata) || null;
  } catch (error) {
    console.error('Failed to get user metadata:', error);
    return null;
  }
}

/**
 * Assign user to a company and set their role
 * This should be called during onboarding or by an admin
 */
export async function assignUserToCompany(
  userId: string,
  companyId: string,
  role: UserRole = 'user'
) {
  return updateUserMetadata(userId, {
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
 */
export async function updateUserRole(userId: string, role: UserRole) {
  const metadata = await getUserMetadata(userId);

  if (!metadata?.companyId) {
    throw new Error('User must be assigned to a company first');
  }

  return updateUserMetadata(userId, { role });
}
