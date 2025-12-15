'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ArrowRight } from 'lucide-react';

/**
 * Invoice creation is disabled - invoices must be created by converting quotations.
 * This ensures unified document numbering: QUO-0005 -> INV-0005
 */
export default function NewInvoicePage() {
  const router = useRouter();

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard/quotations');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Create Invoice</h1>
        <p className="text-gray-600 mt-1">Invoices are created from quotations</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="w-16 h-16 text-purple-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Invoices Come From Quotations
          </h3>
          <p className="text-gray-600 text-center max-w-md mb-6">
            To ensure unified document numbering, invoices must be created by converting a quotation.
            <br />
            <span className="text-sm text-gray-500">
              (QUO-0005 converts to INV-0005)
            </span>
          </p>
          <div className="flex gap-3">
            <Link href="/dashboard/quotations/new">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Create Quotation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard/quotations">
              <Button variant="outline">
                View Quotations
              </Button>
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Redirecting to quotations in 5 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
