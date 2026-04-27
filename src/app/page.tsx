import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Invoicing</h1>
        <p className="mt-1 text-sm text-gray-600">
          Quotations, invoices, credit and debit notes.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <SignInButton mode="modal">
            <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors">
              Create account
            </button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
