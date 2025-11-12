'use client';

import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import { ArrowLeft, FileText, Trash2, Clock } from 'lucide-react';
import { SnapshotStatusBadge } from '@/components/shared/SnapshotStatusBadge';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import {
  CurrencyTableCell,
  CurrencyTotal,
  CurrencyFormValue,
} from '@/components/shared/CurrencyDisplay';
import type { CurrencyCode } from '@/lib/types/currency';
import { PDFActions } from '@/components/documents/PDFActions';

interface PageProps {
  params: { id: string };
}

export default function QuotationDetailPage(props: PageProps) {
  const params = props.params;
  const router = useRouter();

  const { data: quotation, isLoading } = trpc.quotation.getById.useQuery({
    id: params.id,
  });

  const { data: company, isLoading: isLoadingCompany } = trpc.company.get.useQuery();

  const { data: auditHistory } = trpc.snapshotAudit.getHistory.useQuery({
    documentId: params.id,
  });

  const convertMutation = trpc.quotation.convertToInvoice.useMutation({
    onSuccess: (invoice) => {
      router.push(`/dashboard/invoices/${invoice._id.toString()}`);
    },
  });

  const deleteMutation = trpc.quotation.delete.useMutation({
    onSuccess: () => {
      router.push('/dashboard/quotations');
    },
  });

  if (isLoading || isLoadingCompany) return <LoadingPage />;
  if (!quotation) return <div>Quotation not found</div>;
  if (!company) return <div>Company not found</div>;

  const handleConvert = () => {
    if (confirm('Convert this quotation to an invoice?')) {
      convertMutation.mutate({ id: params.id });
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      deleteMutation.mutate({ id: params.id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/quotations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quotation.documentNumber}</h1>
            <p className="text-gray-600 mt-1">{quotation.customerSnapshot.name}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <PDFActions
            documentType="quotation"
            document={quotation}
            company={company}
            variant="outline"
          />
          {quotation.status === 'accepted' && !quotation.convertedToInvoiceId && (
            <Button onClick={handleConvert} disabled={convertMutation.isPending}>
              Convert to Invoice
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/dashboard/quotations/${params.id}/edit`)}>
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
            <CardTitle>Quotation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{formatDate(quotation.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valid Until</p>
                <p className="font-medium">{formatDate(quotation.validUntil)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <StatusBadge status={quotation.status} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Customer Information</span>
              <SnapshotStatusBadge
                status={quotation.status}
                hasAuditHistory={(auditHistory?.length || 0) > 0}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{quotation.customerSnapshot.name}</p>
              <p className="text-sm text-gray-600">{quotation.customerSnapshot.email}</p>
              <p className="text-sm text-gray-600">{quotation.customerSnapshot.phone}</p>
              {quotation.customerSnapshot.address && (
                <p className="text-sm text-gray-600 mt-2">
                  {quotation.customerSnapshot.address.street && <>{quotation.customerSnapshot.address.street}<br /></>}
                  {(quotation.customerSnapshot.address.city || quotation.customerSnapshot.address.state || quotation.customerSnapshot.address.zipCode) && (
                    <>{[quotation.customerSnapshot.address.city, quotation.customerSnapshot.address.state, quotation.customerSnapshot.address.zipCode].filter(Boolean).join(', ')}<br /></>
                  )}
                  {quotation.customerSnapshot.address.country}
                </p>
              )}
            </div>

            {/* Audit History */}
            {auditHistory && auditHistory.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-semibold text-gray-700">Snapshot Update History</h4>
                </div>
                <div className="space-y-3">
                  {auditHistory.map((log) => (
                    <div key={log._id} className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">
                          {log.reason === 'customer_update' ? 'Customer Updated' :
                           log.reason === 'cascade_update' ? 'Cascaded from Invoice' :
                           'Manual Refresh'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      {log.changes.length > 0 && (
                        <div className="space-y-1">
                          {log.changes.map((change, idx) => (
                            <div key={idx} className="text-xs text-gray-600">
                              <span className="font-medium">{change.field}:</span>{' '}
                              <span className="line-through text-red-600">{change.oldValue || '(empty)'}</span>
                              {' → '}
                              <span className="text-green-600">{change.newValue || '(empty)'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                {quotation.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">
                      <CurrencyTableCell
                        amount={item.unitPrice}
                        currency={quotation.currency as CurrencyCode}
                      />
                    </td>
                    <td className="text-right">
                      <CurrencyTableCell
                        amount={item.taxAmount}
                        currency={quotation.currency as CurrencyCode}
                      />
                    </td>
                    <td className="text-right">
                      <CurrencyTableCell
                        amount={item.total}
                        currency={quotation.currency as CurrencyCode}
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
                      amount={quotation.subtotal}
                      currency={quotation.currency as CurrencyCode}
                      className="font-semibold"
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-right py-2">Tax:</td>
                  <td className="text-right py-2">
                    <CurrencyFormValue
                      amount={quotation.totalTax}
                      currency={quotation.currency as CurrencyCode}
                      className="font-semibold"
                    />
                  </td>
                </tr>
                <tr className="text-lg">
                  <td colSpan={4} className="text-right py-2">Total:</td>
                  <td className="text-right py-2">
                    <CurrencyTotal
                      amount={quotation.total}
                      currency={quotation.currency as CurrencyCode}
                    />
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Notes */}
        {quotation.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{quotation.notes}</p>
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
