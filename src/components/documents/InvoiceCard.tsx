'use client';

import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import type { CurrencyCode } from '@/lib/types/currency';

interface InvoiceCardProps {
  invoice: {
    _id: any;
    documentNumber: string;
    customerSnapshot: { name: string };
    date: Date;
    dueDate: Date;
    total: number;
    currency: string;
    status: string;
    paymentStatus?: {
      amountDue: number;
      amountPaid: number;
    };
  };
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const isOverdue = invoice.status === 'overdue';
  const hasAmountDue = invoice.paymentStatus && invoice.paymentStatus.amountDue > 0;

  return (
    <Link href={`/dashboard/invoices/${invoice._id.toString()}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 active:bg-gray-50 transition-colors shadow-sm">
        {/* Header: Number + Status */}
        <div className="flex items-start justify-between mb-2">
          <span className="font-semibold text-gray-900 text-base">
            {invoice.documentNumber}
          </span>
          <StatusBadge status={invoice.status} />
        </div>

        {/* Customer */}
        <p className="text-sm text-gray-600 mb-3 truncate">
          {invoice.customerSnapshot.name}
        </p>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-3" />

        {/* Bottom: Due Date + Total */}
        <div className="flex items-center justify-between text-sm">
          <span className={`${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
            Due: {formatDate(invoice.dueDate)}
          </span>
          <span className="font-semibold text-gray-900">
            <CurrencyDisplay
              amount={invoice.total}
              currency={invoice.currency as CurrencyCode}
              mode="code"
            />
          </span>
        </div>

        {/* Amount Due (if not fully paid) */}
        {hasAmountDue && (
          <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-100">
            <span className="text-gray-600">Amount Due:</span>
            <span className="text-red-600 font-semibold">
              <CurrencyDisplay
                amount={invoice.paymentStatus!.amountDue}
                currency={invoice.currency as CurrencyCode}
                mode="code"
              />
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    partially_paid: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${styles[status] || styles.draft}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
