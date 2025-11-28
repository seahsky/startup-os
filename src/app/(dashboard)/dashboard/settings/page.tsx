'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { PaymentSettingsForm } from '@/components/settings/PaymentSettingsForm';
import { trpc } from '@/lib/trpc/client';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { data: company, isLoading, error } = trpc.company.get.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and application settings</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-red-600 text-center">
              Failed to load company settings. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application settings</p>
      </div>

      {/* Payment Information Section */}
      <PaymentSettingsForm initialData={company?.paymentInfo} />

      {/* Placeholder for future settings sections */}
      <Card>
        <CardHeader>
          <CardTitle>More Settings Coming Soon</CardTitle>
          <CardDescription>
            Additional settings including company profile, invoice templates, notification
            preferences, and user management will be available here.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
