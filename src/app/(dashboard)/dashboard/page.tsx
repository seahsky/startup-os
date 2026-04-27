'use client';

import { trpc } from '@/lib/trpc/client';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import type { CurrencyCode } from '@/lib/types/currency';

export default function DashboardPage() {
  const { data: invoices, isLoading } = trpc.invoice.list.useQuery({
    page: 1,
    limit: 5,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Invoices</h2>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : invoices?.items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No invoices yet. Create your first invoice to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {invoices?.items.map((invoice) => (
              <div
                key={invoice._id.toString()}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{invoice.documentNumber}</p>
                  <p className="text-sm text-gray-600">{invoice.customerSnapshot.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    <CurrencyDisplay
                      amount={invoice.total}
                      currency={invoice.currency as CurrencyCode}
                      mode="code"
                    />
                  </p>
                  <StatusBadge status={invoice.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton href="/dashboard/quotations/new" label="New Quotation" />
          <QuickActionButton href="/dashboard/invoices/new" label="New Invoice" />
          <QuickActionButton href="/dashboard/customers/new" label="New Customer" />
          <QuickActionButton href="/dashboard/products/new" label="New Product" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    partially_paid: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded ${
        statusStyles[status] || statusStyles.draft
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

function QuickActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-center px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-sm font-medium"
    >
      {label}
    </a>
  );
}
