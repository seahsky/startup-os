'use client';

import { trpc } from '@/lib/trpc/client';
import { formatCurrency } from '@/lib/utils/currency';
import { FileText, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  // Example: Fetch recent invoices
  const { data: invoices, isLoading } = trpc.invoice.list.useQuery({
    page: 1,
    limit: 5,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your invoicing activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="$0.00"
          icon={<DollarSign className="w-5 h-5" />}
          trend="+0%"
          trendUp={true}
        />
        <StatCard
          title="Outstanding"
          value="$0.00"
          icon={<FileText className="w-5 h-5" />}
          trend="0 invoices"
        />
        <StatCard
          title="Overdue"
          value="$0.00"
          icon={<AlertCircle className="w-5 h-5" />}
          trend="0 invoices"
          variant="danger"
        />
        <StatCard
          title="Paid This Month"
          value="$0.00"
          icon={<CheckCircle className="w-5 h-5" />}
          trend="+0%"
          trendUp={true}
          variant="success"
        />
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
                    {formatCurrency(invoice.total)}
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

function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  variant = 'default',
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  variant?: 'default' | 'success' | 'danger';
}) {
  const variantStyles = {
    default: 'bg-blue-50 text-blue-600',
    success: 'bg-green-50 text-green-600',
    danger: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-600 text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${variantStyles[variant]}`}>{icon}</div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className={`text-sm ${trendUp ? 'text-green-600' : 'text-gray-600'}`}>
            {trend}
          </p>
        )}
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
