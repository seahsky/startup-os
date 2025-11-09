'use client';

import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import { ArrowLeft, Trash2 } from 'lucide-react';
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

export default function CreditNoteDetailPage(props: PageProps) {
  const params = props.params;
  const router = useRouter();

  const { data: creditNote, isLoading } = trpc.creditNote.getById.useQuery({
    id: params.id,
  });

  const { data: company, isLoading: isLoadingCompany } = trpc.company.get.useQuery();

  const deleteMutation = trpc.creditNote.delete.useMutation({
    onSuccess: () => {
      router.push('/dashboard/credit-notes');
    },
  });

  if (isLoading || isLoadingCompany) return <LoadingPage />;
  if (!creditNote) return <div>Credit Note not found</div>;
  if (!company) return <div>Company not found</div>;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this credit note?')) {
      deleteMutation.mutate({ id: params.id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/credit-notes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{creditNote.documentNumber}</h1>
            <p className="text-gray-600 mt-1">{creditNote.customerSnapshot.name}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <PDFActions
            documentType="creditNote"
            document={creditNote}
            company={company}
            variant="outline"
          />
          <Button variant="outline" onClick={() => router.push(`/dashboard/credit-notes/${params.id}/edit`)}>
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
            <CardTitle>Credit Note Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{formatDate(creditNote.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <StatusBadge status={creditNote.status} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reason</p>
                <p className="font-medium">{creditNote.reason}</p>
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
              <p className="font-medium">{creditNote.customerSnapshot.name}</p>
              <p className="text-sm text-gray-600">{creditNote.customerSnapshot.email}</p>
              <p className="text-sm text-gray-600">{creditNote.customerSnapshot.phone}</p>
              <p className="text-sm text-gray-600 mt-2">
                {creditNote.customerSnapshot.address.street}<br />
                {creditNote.customerSnapshot.address.city}, {creditNote.customerSnapshot.address.state} {creditNote.customerSnapshot.address.zipCode}<br />
                {creditNote.customerSnapshot.address.country}
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
                {creditNote.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">
                      <CurrencyTableCell
                        amount={item.unitPrice}
                        currency={creditNote.currency as CurrencyCode}
                      />
                    </td>
                    <td className="text-right">
                      <CurrencyTableCell
                        amount={item.taxAmount}
                        currency={creditNote.currency as CurrencyCode}
                      />
                    </td>
                    <td className="text-right">
                      <CurrencyTableCell
                        amount={item.total}
                        currency={creditNote.currency as CurrencyCode}
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
                      amount={creditNote.subtotal}
                      currency={creditNote.currency as CurrencyCode}
                      className="font-semibold"
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-right py-2">Tax:</td>
                  <td className="text-right py-2">
                    <CurrencyFormValue
                      amount={creditNote.totalTax}
                      currency={creditNote.currency as CurrencyCode}
                      className="font-semibold"
                    />
                  </td>
                </tr>
                <tr className="text-lg">
                  <td colSpan={4} className="text-right py-2">Total:</td>
                  <td className="text-right py-2">
                    <CurrencyTotal
                      amount={creditNote.total}
                      currency={creditNote.currency as CurrencyCode}
                    />
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Notes */}
        {creditNote.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{creditNote.notes}</p>
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
    applied: 'bg-green-100 text-green-700',
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
