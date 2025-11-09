'use client';

import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import type { CurrencyCode } from '@/lib/types/currency';

interface QuotationCardProps {
  quotation: {
    _id: any;
    documentNumber: string;
    customerSnapshot: { name: string };
    date: Date;
    validUntil: Date;
    total: number;
    currency: string;
    status: string;
  };
}

export function QuotationCard({ quotation }: QuotationCardProps) {
  const isExpired = quotation.status === 'expired';

  return (
    <Link href={`/dashboard/quotations/${quotation._id.toString()}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 active:bg-gray-50 transition-colors shadow-sm">
        {/* Header: Number + Status */}
        <div className="flex items-start justify-between mb-2">
          <span className="font-semibold text-gray-900 text-base">
            {quotation.documentNumber}
          </span>
          <StatusBadge status={quotation.status} />
        </div>

        {/* Customer */}
        <p className="text-sm text-gray-600 mb-3 truncate">
          {quotation.customerSnapshot.name}
        </p>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-3" />

        {/* Bottom: Valid Until + Total */}
        <div className="flex items-center justify-between text-sm">
          <span className={`${isExpired ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
            Valid: {formatDate(quotation.validUntil)}
          </span>
          <span className="font-semibold text-gray-900">
            <CurrencyDisplay
              amount={quotation.total}
              currency={quotation.currency as CurrencyCode}
              mode="code"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    expired: 'bg-orange-100 text-orange-700',
    converted: 'bg-purple-100 text-purple-700',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}
