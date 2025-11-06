'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InputField, TextareaField, SelectField } from '@/components/shared/FormField';
import { CustomerSelector } from '@/components/customers/CustomerSelector';
import { ItemsTable, DocumentItem } from '@/components/documents/ItemsTable';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewInvoicePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [] as DocumentItem[],
    notes: '',
    termsAndConditions: 'Payment is due within 30 days. Late payments may incur additional charges.',
    status: 'draft' as 'draft' | 'sent',
  });

  const createMutation = trpc.invoice.create.useMutation({
    onSuccess: (data) => {
      router.push('/dashboard/invoices');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      alert('Please select a customer');
      return;
    }

    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    createMutation.mutate({
      customerId: formData.customerId,
      date: new Date(formData.date),
      dueDate: new Date(formData.dueDate),
      items: formData.items,
      notes: formData.notes,
      termsAndConditions: formData.termsAndConditions,
      status: formData.status,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Invoice</h1>
          <p className="text-gray-600 mt-1">Create a new invoice for your customer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Date Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CustomerSelector
              value={formData.customerId}
              onChange={(customerId) => setFormData(prev => ({ ...prev, customerId }))}
            />

            <div className="grid grid-cols-3 gap-4">
              <InputField
                label="Invoice Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <InputField
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
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
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemsTable
              items={formData.items}
              onChange={(items) => setFormData(prev => ({ ...prev, items }))}
            />
          </CardContent>
        </Card>

        {/* Notes & Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextareaField
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Internal notes about this invoice..."
              rows={3}
            />
            <TextareaField
              label="Terms & Conditions"
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleChange}
              placeholder="Payment terms and conditions..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/invoices">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
}
