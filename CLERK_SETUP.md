# Clerk Authentication Setup Guide

## Implementation Complete! ✅

Clerk authentication has been successfully integrated into your invoicing application. All code changes are complete - you just need to configure your Clerk account and add the API keys.

## What Was Implemented

### 1. Authentication Infrastructure
- ✅ Installed `@clerk/nextjs` package
- ✅ Created middleware for route protection
- ✅ Wrapped app with `ClerkProvider`
- ✅ Created sign-in and sign-up pages with Clerk's prebuilt components

### 2. tRPC Integration
- ✅ Updated context to use Clerk authentication
- ✅ Added auth middleware to `protectedProcedure`
- ✅ All API routes now require authentication
- ✅ User and company data accessed from Clerk session

### 3. User Interface
- ✅ Added `UserButton` to dashboard sidebar
- ✅ Updated home page with auth-aware routing
- ✅ Sign in/Sign up buttons for unauthenticated users
- ✅ Dashboard link for authenticated users

### 4. Database Changes
- ✅ Removed MongoDB users collection (Clerk handles user storage)
- ✅ Created utility functions for metadata management
- ✅ User roles and companyId stored in Clerk's publicMetadata

## Setup Instructions

### Step 1: Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### Step 2: Configure Authentication Methods

In your Clerk dashboard, enable these authentication methods:
- ✅ Email/Password
- ✅ Google OAuth (optional but recommended)
- ✅ GitHub OAuth (optional but recommended)
- ✅ Magic Links (passwordless)

To enable OAuth:
1. Go to "User & Authentication" → "Social Connections"
2. Enable Google and/or GitHub
3. Follow Clerk's instructions for OAuth setup

### Step 3: Get Your API Keys

1. In Clerk dashboard, go to "API Keys"
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Step 4: Update Environment Variables

Open `.env.local` and replace the placeholder values:

```bash
# Replace these with your actual Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here

# These URLs are already configured correctly
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (existing)
MONGODB_URI=mongodb://localhost:27017/invoicing_db
```

### Step 5: Configure Custom User Fields in Clerk

Since the app needs to know which company a user belongs to, you'll need to set up user metadata:

**Option A: Set during onboarding (Recommended)**
Create an onboarding flow where users select/create their company after signing up. Use the utility functions in `src/lib/clerk-utils.ts`:

```typescript
import { assignUserToCompany } from '@/lib/clerk-utils';

// After user signs up and selects/creates a company:
await assignUserToCompany(userId, companyId, 'admin');
```

**Option B: Set via Clerk Dashboard**
For testing, you can manually set metadata in Clerk dashboard:
1. Go to "Users" in Clerk dashboard
2. Click on a user
3. Scroll to "Public metadata"
4. Add this JSON:
```json
{
  "companyId": "507f1f77bcf86cd799439011",
  "role": "admin",
  "onboardingCompleted": true
}
```

### Step 6: Test the Application

1. Start your development server:
```bash
npm run dev
```

2. Visit `http://localhost:3000`

3. Test the authentication flow:
   - Click "Get Started" or "Sign In"
   - Create a new account or sign in
   - You should be redirected to `/dashboard`

### Step 7: First-Time Setup

After signing in for the first time, you'll need to assign a companyId:

**Quick Fix for Testing:**
Temporarily modify `src/server/context.ts` to assign a default company:

```typescript
export async function createContext(opts?: FetchCreateContextFnOptions) {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;

  let companyId = user?.publicMetadata?.companyId as string | undefined;

  // TEMPORARY: Auto-assign default company for testing
  if (userId && !companyId) {
    // Use a company ID from your database
    companyId = '507f1f77bcf86cd799439011';
  }

  return {
    userId: userId || null,
    companyId: companyId || null,
    user,
  };
}
```

**Production Solution:**
Create an onboarding page at `src/app/onboarding/page.tsx` where users:
1. Select existing company or create a new one
2. Get assigned a role
3. Have their metadata updated using `assignUserToCompany()`

## Authentication Flow

### For Unauthenticated Users:
1. Visit home page → See "Sign In" and "Get Started" buttons
2. Click button → Clerk's authentication modal appears
3. Sign up/Sign in → Redirected to `/dashboard`

### For Authenticated Users:
1. Visit home page → See "Go to Dashboard" button
2. Access any `/dashboard/*` route → Allowed if authenticated
3. Click user avatar in sidebar → Access to profile and sign out

### Protected Routes:
All routes under `/dashboard/*` require authentication. Unauthenticated users are automatically redirected to `/sign-in`.

## Key Files

### Authentication Setup
- `src/middleware.ts` - Route protection
- `src/app/layout.tsx` - ClerkProvider wrapper
- `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` - Sign-in page
- `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` - Sign-up page

### tRPC Integration
- `src/server/context.ts` - Clerk authentication context
- `src/server/trpc.ts` - Protected procedure with auth checks

### Utilities
- `src/lib/clerk-utils.ts` - Helper functions for user metadata

### UI Components
- `src/app/(dashboard)/layout.tsx` - UserButton in sidebar
- `src/app/page.tsx` - Auth-aware home page

## User Roles

Three role types are supported (stored in Clerk metadata):
- **admin**: Full access to all features
- **user**: Standard access
- **viewer**: Read-only access

Set roles using:
```typescript
import { updateUserRole } from '@/lib/clerk-utils';
await updateUserRole(userId, 'admin');
```

## Common Issues

### Issue: "Invalid publishable key"
**Solution:** Make sure you've added real Clerk API keys to `.env.local`

### Issue: "You must be assigned to a company"
**Solution:** Set the `companyId` in user's public metadata (see Step 6 above)

### Issue: OAuth not working
**Solution:** Configure OAuth apps in both Clerk dashboard and provider (Google/GitHub)

### Issue: Build fails
**Solution:** Clerk needs valid keys even for builds. Either add real keys or set dummy ones that match the expected format

## Next Steps

1. **Create Onboarding Flow**: Build a page where new users select/create their company
2. **Add Role-Based Permissions**: Use the role from metadata to restrict access
3. **Team Features**: Enable Clerk Organizations for multi-tenant support
4. **Webhook Integration**: Set up Clerk webhooks to sync user events

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration Guide](https://clerk.com/docs/quickstarts/nextjs)
- [User Metadata Guide](https://clerk.com/docs/users/metadata)
- [Clerk Dashboard](https://dashboard.clerk.com)

---

**Implementation Status:** ✅ Complete - Ready for Clerk configuration!
