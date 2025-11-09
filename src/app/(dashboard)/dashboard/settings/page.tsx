'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application settings</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <SettingsIcon className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600 text-center max-w-md">
            Settings page is under development. This will include company settings, user
            preferences, notification settings, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
