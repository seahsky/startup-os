'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CustomerSelectorProps {
  value: string;
  onChange: (customerId: string) => void;
  error?: string;
}

export function CustomerSelector({ value, onChange, error }: CustomerSelectorProps) {
  const [search, setSearch] = useState('');

  const { data: customers, isLoading } = trpc.customer.list.useQuery({
    page: 1,
    limit: 100,
    search: search || undefined,
    status: 'active',
  });

  return (
    <div className="space-y-2">
      <Label>
        Customer <span className="text-red-600">*</span>
      </Label>
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select a customer</option>
          {customers?.items.map((customer) => (
            <option key={customer._id.toString()} value={customer._id.toString()}>
              {customer.name} - {customer.email}
            </option>
          ))}
        </Select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
