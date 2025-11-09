'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileX, Plus } from 'lucide-react';

export default function CreditNotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Credit Notes</h1>
          <p className="text-gray-600 mt-1">Manage credit notes for your customers</p>
        </div>
        <Link href="/dashboard/credit-notes/new">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Credit Note
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileX className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600 text-center max-w-md">
            Credit notes functionality is under development. This feature will allow you to issue
            credits to your customers for returns or adjustments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
