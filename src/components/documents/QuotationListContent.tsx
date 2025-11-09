'use client';

import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import type { CurrencyCode } from '@/lib/types/currency';
import { QuotationCard } from './QuotationCard';

interface QuotationListContentProps {
  showHeader?: boolean;
  limit?: number;
}

export function QuotationListContent({ showHeader = true, limit = 20 }: QuotationListContentProps) {
  const { data, isLoading } = trpc.quotation.list.useQuery({
    page: 1,
    limit,
  });

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header - Optional (hidden in tabs) */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quotations</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">Manage your quotations</p>
          </div>
          {/* Desktop only - mobile uses bottom nav Add button */}
          <Link
            href="/dashboard/quotations/new"
            className="hidden lg:inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Quotation
          </Link>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8 text-gray-500">Loading quotations...</div>
      )}

      {/* Empty State */}
      {!isLoading && data?.items.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No quotations yet</p>
          <Link
            href="/dashboard/quotations/new"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first quotation
          </Link>
        </div>
      )}

      {/* Content */}
      {!isLoading && data && data.items.length > 0 && (
        <>
          {/* Desktop: Table View */}
          <div className="hidden lg:block bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valid Until
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.items.map((quotation) => (
                    <tr key={quotation._id.toString()} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/dashboard/quotations/${quotation._id.toString()}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {quotation.documentNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quotation.customerSnapshot.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(quotation.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(quotation.validUntil)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        <CurrencyDisplay
                          amount={quotation.total}
                          currency={quotation.currency as CurrencyCode}
                          mode="code"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={quotation.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: Card List View */}
          <div className="lg:hidden space-y-3">
            {data.items.map((quotation) => (
              <QuotationCard key={quotation._id.toString()} quotation={quotation} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    expired: 'bg-orange-100 text-orange-700',
    converted: 'bg-purple-100 text-purple-700',
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded ${
        statusStyles[status] || statusStyles.draft
      }`}
    >
      {status}
    </span>
  );
}
