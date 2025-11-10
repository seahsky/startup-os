'use client';

import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import { ArrowLeft, Trash2, Package, DollarSign, Tag } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default function ProductDetailPage(props: PageProps) {
  const params = props.params;
  const router = useRouter();

  const { data: product, isLoading } = trpc.product.getById.useQuery({
    id: params.id,
  });

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      router.push('/dashboard/products');
    },
  });

  if (isLoading) return <LoadingPage />;
  if (!product) return <div>Product not found</div>;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteMutation.mutate({ id: params.id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.sku && <p className="text-gray-600 mt-1">SKU: {product.sku}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/products/${params.id}/edit`)}>
            Edit
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Product Name</p>
              <p className="font-medium">{product.name}</p>
            </div>

            {product.sku && (
              <div>
                <p className="text-sm text-gray-600">SKU</p>
                <p className="font-medium">{product.sku}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium text-gray-700">{product.description}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>
              <StatusBadge status={product.status} />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Tax */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing & Tax
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Unit Price</p>
              <p className="font-semibold text-lg">${product.unitPrice.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Tax Rate</p>
              <p className="font-medium">{product.taxRate}%</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Unit</p>
              <p className="font-medium capitalize">{product.unit}</p>
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.category ? (
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium">{product.category}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No category assigned</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded ${
        statusStyles[status] || statusStyles.active
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
