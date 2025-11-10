'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InputField, TextareaField, SelectField } from '@/components/shared/FormField';
import { CustomerSelector } from '@/components/customers/CustomerSelector';
import { CurrencySelect } from '@/components/shared/CurrencySelect';
import { ItemsTable, DocumentItem } from '@/components/documents/ItemsTable';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default function EditQuotationPage(props: PageProps) {
  const params = props.params;
  const router = useRouter();
  const utils = trpc.useUtils();
  const [isInitialized, setIsInitialized] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    date: '',
    validUntil: '',
    items: [] as DocumentItem[],
    currency: '',
    notes: '',
    termsAndConditions: '',
    status: 'draft' as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted',
  });

  // Fetch the existing quotation
  const { data: quotation, isLoading: isLoadingQuotation } = trpc.quotation.getById.useQuery({
    id: params.id,
  });

  // Fetch company for default currency
  const { data: company } = trpc.company.get.useQuery();

  // Fetch customer when selected to get their preferred currency
  const { data: selectedCustomer } = trpc.customer.getById.useQuery(
    { id: formData.customerId },
    { enabled: !!formData.customerId }
  );

  // Pre-populate form with quotation data when loaded
  useEffect(() => {
    if (quotation && !isInitialized) {
      const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      // Map quotation items to form items (exclude calculated fields)
      const formItems: DocumentItem[] = quotation.items.map(item => ({
        productId: item.productId?.toString(),
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
      }));

      setFormData({
        customerId: quotation.customerId.toString(),
        date: formatDate(quotation.date),
        validUntil: formatDate(quotation.validUntil),
        items: formItems,
        currency: quotation.currency,
        notes: quotation.notes || '',
        termsAndConditions: quotation.termsAndConditions || '',
        status: quotation.status,
      });
      setIsInitialized(true);
    }
  }, [quotation, isInitialized]);

  // Update currency based on hierarchy: customer > company > default (only for new selections)
  useEffect(() => {
    if (!isInitialized) return; // Don't override during initial load

    if (selectedCustomer?.currency) {
      setFormData(prev => ({ ...prev, currency: selectedCustomer.currency! }));
    } else if (company?.currency && !formData.currency) {
      setFormData(prev => ({ ...prev, currency: company.currency }));
    }
  }, [selectedCustomer, company, isInitialized, formData.currency]);

  const updateMutation = trpc.quotation.update.useMutation({
    onSuccess: async () => {
      // Invalidate cache to ensure fresh data is fetched
      await utils.quotation.getById.invalidate({ id: params.id });
      await utils.quotation.list.invalidate();
      router.push(`/dashboard/quotations/${params.id}`);
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

    if (!formData.currency) {
      alert('Please select a currency');
      return;
    }

    updateMutation.mutate({
      id: params.id,
      customerId: formData.customerId,
      date: new Date(formData.date),
      validUntil: new Date(formData.validUntil),
      items: formData.items,
      currency: formData.currency,
      notes: formData.notes,
      termsAndConditions: formData.termsAndConditions,
      status: formData.status,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoadingQuotation) return <LoadingPage />;
  if (!quotation) return <div>Quotation not found</div>;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center gap-3 lg:gap-4">
        <Link href={`/dashboard/quotations/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Edit Quotation</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">Update quotation {quotation.documentNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {/* Customer & Date Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CustomerSelector
              value={formData.customerId}
              onChange={(customerId) => setFormData(prev => ({ ...prev, customerId }))}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <InputField
                label="Valid Until"
                name="validUntil"
                type="date"
                value={formData.validUntil}
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
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'expired', label: 'Expired' },
                  { value: 'converted', label: 'Converted' },
                ]}
              />
            </div>

            <CurrencySelect
              value={formData.currency}
              onChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              required
            />
            <p className="text-sm text-gray-500 -mt-2">
              {selectedCustomer?.currency
                ? 'Using customer preferred currency'
                : company?.currency
                ? 'Using company default currency'
                : 'Please select a currency'}
            </p>
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

        {/* Notes & Terms */}
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
              placeholder="Internal notes about this quotation..."
              rows={3}
            />
            <TextareaField
              label="Terms & Conditions"
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleChange}
              placeholder="Terms and conditions for this quotation..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Link href={`/dashboard/quotations/${params.id}`} className="w-full sm:w-auto">
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto"
          >
            {updateMutation.isPending ? 'Updating...' : 'Update Quotation'}
          </Button>
        </div>
      </form>
    </div>
  );
}
