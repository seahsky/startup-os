'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InputField, TextareaField, SelectField } from '@/components/shared/FormField';
import { CurrencySelect } from '@/components/shared/CurrencySelect';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default function EditCustomerPage(props: PageProps) {
  const params = props.params;
  const router = useRouter();
  const utils = trpc.useUtils();
  const [isInitialized, setIsInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    taxId: '',
    contactPerson: '',
    notes: '',
    currency: '',
    status: 'active' as 'active' | 'inactive',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    },
  });

  // Fetch the existing customer
  const { data: customer, isLoading } = trpc.customer.getById.useQuery({
    id: params.id,
  });

  // Pre-populate form with customer data when loaded
  useEffect(() => {
    if (customer && !isInitialized) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        taxId: customer.taxId || '',
        contactPerson: customer.contactPerson || '',
        notes: customer.notes || '',
        currency: customer.currency || '',
        status: customer.status,
        address: {
          street: customer.address?.street || '',
          city: customer.address?.city || '',
          state: customer.address?.state || '',
          country: customer.address?.country || '',
          zipCode: customer.address?.zipCode || '',
        },
      });
      setIsInitialized(true);
    }
  }, [customer, isInitialized]);

  const updateMutation = trpc.customer.update.useMutation({
    onSuccess: async () => {
      // Invalidate cache to ensure fresh data is fetched
      await utils.customer.getById.invalidate({ id: params.id });
      await utils.customer.list.invalidate();
      router.push(`/dashboard/customers/${params.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: params.id,
      ...formData,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (isLoading) return <LoadingPage />;
  if (!customer) return <div>Customer not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/customers/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
          <p className="text-gray-600 mt-1">Update customer information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Company Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Acme Corporation"
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="billing@acmecorp.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+1 (555) 123-4567"
              />
              <InputField
                label="Tax ID"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                placeholder="TAX-123456"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Contact Person"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="John Smith"
              />
              <SelectField
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CurrencySelect
                label="Preferred Currency (Optional)"
                value={formData.currency}
                onChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              />
              <div className="flex items-end">
                <p className="text-sm text-gray-500 pb-2">
                  Leave empty to use company default currency
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Address</h3>
              <div className="space-y-4">
                <InputField
                  label="Street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  placeholder="123 Business Street"
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="City"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="San Francisco"
                  />
                  <InputField
                    label="State/Province"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder="CA"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    placeholder="United States"
                  />
                  <InputField
                    label="Zip Code"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    placeholder="94102"
                  />
                </div>
              </div>
            </div>

            <TextareaField
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes about this customer..."
              rows={4}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Link href={`/dashboard/customers/${params.id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
