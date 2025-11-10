'use client';

import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import { ArrowLeft, Trash2, Mail, Phone, MapPin, User } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default function CustomerDetailPage(props: PageProps) {
  const params = props.params;
  const router = useRouter();

  const { data: customer, isLoading } = trpc.customer.getById.useQuery({
    id: params.id,
  });

  const deleteMutation = trpc.customer.delete.useMutation({
    onSuccess: () => {
      router.push('/dashboard/customers');
    },
  });

  if (isLoading) return <LoadingPage />;
  if (!customer) return <div>Customer not found</div>;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      deleteMutation.mutate({ id: params.id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600 mt-1">{customer.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/customers/${params.id}/edit`)}>
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
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="font-medium">{customer.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{customer.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{customer.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5"></div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <StatusBadge status={customer.status} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.taxId && (
              <div>
                <p className="text-sm text-gray-600">Tax ID</p>
                <p className="font-medium">{customer.taxId}</p>
              </div>
            )}

            {customer.contactPerson && (
              <div>
                <p className="text-sm text-gray-600">Contact Person</p>
                <p className="font-medium">{customer.contactPerson}</p>
              </div>
            )}

            {customer.currency && (
              <div>
                <p className="text-sm text-gray-600">Preferred Currency</p>
                <p className="font-medium">{customer.currency}</p>
              </div>
            )}

            {!customer.taxId && !customer.contactPerson && !customer.currency && (
              <p className="text-sm text-gray-500 italic">No additional details</p>
            )}
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{customer.address.street}</p>
              <p className="text-gray-700">
                {customer.address.city}, {customer.address.state} {customer.address.zipCode}
              </p>
              <p className="text-gray-700">{customer.address.country}</p>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {customer.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
            </CardContent>
          </Card>
        )}
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
