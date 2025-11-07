'use client';

import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import { ArrowLeft, Trash2, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import {
  CurrencyDisplay,
  CurrencyTableCell,
  CurrencyTotal,
  CurrencyFormValue,
} from '@/components/shared/CurrencyDisplay';
import type { CurrencyCode } from '@/lib/types/currency';

interface PageProps {
  params: { id: string };
}

export default function InvoiceDetailPage(props: PageProps) {
  const params = props.params;
  const router = useRouter();

  const { data: invoice, isLoading } = trpc.invoice.getById.useQuery({
    id: params.id,
  });

  const deleteMutation = trpc.invoice.delete.useMutation({
    onSuccess: () => {
      router.push('/dashboard/invoices');
    },
  });

  if (isLoading) return <LoadingPage />;
  if (!invoice) return <div>Invoice not found</div>;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteMutation.mutate({ id: params.id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{invoice.documentNumber}</h1>
            <p className="text-gray-600 mt-1">{invoice.customerSnapshot.name}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/invoices/${params.id}/edit`)}>
            Edit
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Header Info */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{formatDate(invoice.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium">{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <StatusBadge status={invoice.status} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount Due</p>
                <div className="font-semibold text-lg">
                  <CurrencyDisplay
                    amount={invoice.paymentStatus.amountDue}
                    currency={invoice.currency as CurrencyCode}
                    mode="code"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{invoice.customerSnapshot.name}</p>
              <p className="text-sm text-gray-600">{invoice.customerSnapshot.email}</p>
              <p className="text-sm text-gray-600">{invoice.customerSnapshot.phone}</p>
              <p className="text-sm text-gray-600 mt-2">
                {invoice.customerSnapshot.address.street}<br />
                {invoice.customerSnapshot.address.city}, {invoice.customerSnapshot.address.state} {invoice.customerSnapshot.address.zipCode}<br />
                {invoice.customerSnapshot.address.country}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Unit Price</th>
                  <th className="text-right py-2">Tax</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">
                      <CurrencyTableCell
                        amount={item.unitPrice}
                        currency={invoice.currency as CurrencyCode}
                      />
                    </td>
                    <td className="text-right">
                      <CurrencyTableCell
                        amount={item.taxAmount}
                        currency={invoice.currency as CurrencyCode}
                      />
                    </td>
                    <td className="text-right">
                      <CurrencyTableCell
                        amount={item.total}
                        currency={invoice.currency as CurrencyCode}
                        className="font-medium"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="font-semibold">
                <tr>
                  <td colSpan={4} className="text-right py-2">Subtotal:</td>
                  <td className="text-right py-2">
                    <CurrencyFormValue
                      amount={invoice.subtotal}
                      currency={invoice.currency as CurrencyCode}
                      className="font-semibold"
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-right py-2">Tax:</td>
                  <td className="text-right py-2">
                    <CurrencyFormValue
                      amount={invoice.totalTax}
                      currency={invoice.currency as CurrencyCode}
                      className="font-semibold"
                    />
                  </td>
                </tr>
                <tr className="text-lg">
                  <td colSpan={4} className="text-right py-2">Total:</td>
                  <td className="text-right py-2">
                    <CurrencyTotal
                      amount={invoice.total}
                      currency={invoice.currency as CurrencyCode}
                    />
                  </td>
                </tr>
                <tr className="text-green-600">
                  <td colSpan={4} className="text-right py-2">Amount Paid:</td>
                  <td className="text-right py-2">
                    <CurrencyFormValue
                      amount={invoice.paymentStatus.amountPaid}
                      currency={invoice.currency as CurrencyCode}
                      className="font-semibold text-green-600"
                    />
                  </td>
                </tr>
                <tr className="text-red-600">
                  <td colSpan={4} className="text-right py-2">Amount Due:</td>
                  <td className="text-right py-2">
                    <CurrencyFormValue
                      amount={invoice.paymentStatus.amountDue}
                      currency={invoice.currency as CurrencyCode}
                      className="font-semibold text-red-600"
                    />
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Payment History */}
        {invoice.paymentStatus.payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoice.paymentStatus.payments.map((payment, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{formatDate(payment.date)}</p>
                      <p className="text-sm text-gray-600">{payment.method}</p>
                      {payment.reference && (
                        <p className="text-xs text-gray-500">Ref: {payment.reference}</p>
                      )}
                    </div>
                    <div className="font-semibold">
                      <CurrencyDisplay
                        amount={payment.amount}
                        currency={invoice.currency as CurrencyCode}
                        mode="code"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
