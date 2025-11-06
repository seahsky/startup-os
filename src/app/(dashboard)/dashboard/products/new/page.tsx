'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InputField, TextareaField, SelectField } from '@/components/shared/FormField';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    unitPrice: 0,
    taxRate: 10,
    unit: 'hours',
    category: '',
    status: 'active' as 'active' | 'inactive',
  });

  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      router.push('/dashboard/products');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Product</h1>
          <p className="text-gray-600 mt-1">Add a new product or service</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Web Development Services"
              />
              <InputField
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="WEB-DEV-001"
              />
            </div>

            <TextareaField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe the product or service..."
              rows={3}
            />

            <div className="grid grid-cols-3 gap-4">
              <InputField
                label="Unit Price"
                name="unitPrice"
                type="number"
                step="0.01"
                value={formData.unitPrice.toString()}
                onChange={handleChange}
                required
                placeholder="150.00"
              />
              <InputField
                label="Tax Rate (%)"
                name="taxRate"
                type="number"
                step="0.1"
                value={formData.taxRate.toString()}
                onChange={handleChange}
                required
                placeholder="10"
              />
              <SelectField
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                options={[
                  { value: 'hours', label: 'Hours' },
                  { value: 'days', label: 'Days' },
                  { value: 'pieces', label: 'Pieces' },
                  { value: 'items', label: 'Items' },
                  { value: 'units', label: 'Units' },
                  { value: 'kg', label: 'Kilograms' },
                  { value: 'lbs', label: 'Pounds' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Services, Products, etc."
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

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/dashboard/products">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
