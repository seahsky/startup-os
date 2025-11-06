'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface Product {
  _id: any;
  name: string;
  description: string;
  unitPrice: number;
  taxRate: number;
  unit: string;
}

interface ProductSelectorProps {
  onSelect: (product: Product) => void;
}

export function ProductSelector({ onSelect }: ProductSelectorProps) {
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: products } = trpc.product.search.useQuery({ query: search || 'a' });

  const handleSelect = (product: Product) => {
    onSelect(product);
    setSearch('');
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />
        </div>
        <Button type="button" variant="outline" size="icon">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {showResults && products && products.length > 0 && (
        <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
          {products.map((product) => (
            <button
              key={product._id.toString()}
              type="button"
              onClick={() => handleSelect(product)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
            >
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-gray-600">{product.description}</div>
              <div className="text-sm text-gray-500 mt-1">
                {formatCurrency(product.unitPrice)} / {product.unit} • Tax: {product.taxRate}%
              </div>
            </button>
          ))}
        </Card>
      )}

      {showResults && search && products?.length === 0 && (
        <Card className="absolute z-10 w-full mt-1 p-4 text-center text-gray-500">
          No products found
        </Card>
      )}
    </div>
  );
}
