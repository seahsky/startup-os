'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { companyCreateSchema, type CompanyCreateInput } from '@/lib/validations/company.schema';
import { trpc } from '@/lib/trpc/client';

export function CompanyCreationForm() {
  const router = useRouter();
  const createCompany = trpc.company.create.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyCreateInput>({
    resolver: zodResolver(companyCreateSchema),
    defaultValues: {
      currency: 'USD',
    },
  });

  const onSubmit = async (data: CompanyCreateInput) => {
    try {
      await createCompany.mutateAsync(data);
      // After successful creation, redirect to dashboard
      router.push('/dashboard');
      router.refresh(); // Refresh to update the context with new companyId
    } catch (error) {
      console.error('Failed to create company:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome! Let's set up your company</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tell us about your business to get started with your invoicing system.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Name */}
        <div>
          <Label htmlFor="name">Company Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Acme Corporation"
            className="mt-1"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Company Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="contact@acme.com"
            className="mt-1"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+1 (555) 123-4567"
            className="mt-1"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Tax ID */}
        <div>
          <Label htmlFor="taxId">Tax ID / Business Number</Label>
          <Input
            id="taxId"
            {...register('taxId')}
            placeholder="12-3456789"
            className="mt-1"
          />
          {errors.taxId && (
            <p className="mt-1 text-sm text-red-600">{errors.taxId.message}</p>
          )}
        </div>

        {/* Currency */}
        <div>
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            {...register('currency')}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="SGD">SGD - Singapore Dollar</option>
            <option value="MYR">MYR - Malaysian Ringgit</option>
          </select>
          {errors.currency && (
            <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
          )}
        </div>

        {/* Address Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Address</h3>

          {/* Street */}
          <div className="mb-4">
            <Label htmlFor="address.street">Street Address</Label>
            <Input
              id="address.street"
              {...register('address.street')}
              placeholder="123 Main Street"
              className="mt-1"
            />
            {errors.address?.street && (
              <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
            )}
          </div>

          {/* City and State in a row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="address.city">City</Label>
              <Input
                id="address.city"
                {...register('address.city')}
                placeholder="San Francisco"
                className="mt-1"
              />
              {errors.address?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address.state">State / Province</Label>
              <Input
                id="address.state"
                {...register('address.state')}
                placeholder="California"
                className="mt-1"
              />
              {errors.address?.state && (
                <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
              )}
            </div>
          </div>

          {/* Country and Zip Code in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address.country">Country</Label>
              <Input
                id="address.country"
                {...register('address.country')}
                placeholder="United States"
                className="mt-1"
              />
              {errors.address?.country && (
                <p className="mt-1 text-sm text-red-600">{errors.address.country.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address.zipCode">Zip / Postal Code</Label>
              <Input
                id="address.zipCode"
                {...register('address.zipCode')}
                placeholder="94105"
                className="mt-1"
              />
              {errors.address?.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.address.zipCode.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {createCompany.error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">
              {createCompany.error.message || 'Failed to create company. Please try again.'}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || createCompany.isPending}
            className="w-full sm:w-auto"
          >
            {isSubmitting || createCompany.isPending ? 'Creating...' : 'Create Company & Continue'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
