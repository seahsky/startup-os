'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InputField, TextareaField, SelectField } from '@/components/shared/FormField';
import { CurrencySelect } from '@/components/shared/CurrencySelect';
import { ItemsTable, DocumentItem } from '@/components/documents/ItemsTable';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default function EditDebitNotePage(props: PageProps) {
  const params = props.params;
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    reason: '',
    items: [] as DocumentItem[],
    currency: '',
    notes: '',
    status: 'draft' as 'draft' | 'sent' | 'applied',
  });

  // Fetch the existing debit note
  const { data: debitNote, isLoading: isLoadingDebitNote } = trpc.debitNote.getById.useQuery({
    id: params.id,
  });

  // Pre-populate form with debit note data when loaded
  useEffect(() => {
    if (debitNote && !isInitialized) {
      const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      // Map debit note items to form items (exclude calculated fields)
      const formItems: DocumentItem[] = debitNote.items.map(item => ({
        productId: item.productId?.toString(),
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
      }));

      setFormData({
        date: formatDate(debitNote.date),
        reason: debitNote.reason,
        items: formItems,
        currency: debitNote.currency,
        notes: debitNote.notes || '',
        status: debitNote.status,
      });
      setIsInitialized(true);
    }
  }, [debitNote, isInitialized]);

  const updateMutation = trpc.debitNote.update.useMutation({
    onSuccess: () => {
      router.push(`/dashboard/debit-notes/${params.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason) {
      alert('Please provide a reason for the debit note');
      return;
    }

    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    if (!formData.currency) {
      alert('Please select a currency');
      return;
    }

    updateMutation.mutate({
      id: params.id,
      date: new Date(formData.date),
      reason: formData.reason,
      items: formData.items,
      currency: formData.currency,
      notes: formData.notes,
      status: formData.status,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoadingDebitNote) return <LoadingPage />;
  if (!debitNote) return <div>Debit note not found</div>;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center gap-3 lg:gap-4">
        <Link href={`/dashboard/debit-notes/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Edit Debit Note</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">Update debit note {debitNote.documentNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <SelectField
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'sent', label: 'Sent' },
                  { value: 'applied', label: 'Applied' },
                ]}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <p className="text-gray-900 font-medium py-2">
                  {debitNote.customerSnapshot.name}
                </p>
              </div>
            </div>

            <InputField
              label="Reason"
              name="reason"
              type="text"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Reason for issuing this debit note..."
              required
            />

            <CurrencySelect
              value={formData.currency}
              onChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              required
            />
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
              <ItemsTable
                items={formData.items}
                onChange={(items) => setFormData(prev => ({ ...prev, items }))}
                currency={formData.currency}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextareaField
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Internal notes about this debit note..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Link href={`/dashboard/debit-notes/${params.id}`} className="w-full sm:w-auto">
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto"
          >
            {updateMutation.isPending ? 'Updating...' : 'Update Debit Note'}
          </Button>
        </div>
      </form>
    </div>
  );
}
