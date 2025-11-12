'use client';

import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function CustomersPage() {
  const { data, isLoading } = trpc.customer.list.useQuery({
    page: 1,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <Link
          href="/dashboard/customers/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Customer
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading customers...</div>
        ) : data?.items.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No customers yet</p>
            <Link
              href="/dashboard/customers/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Add your first customer
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.items.map((customer) => (
                  <tr key={customer._id.toString()} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/customers/${customer._id.toString()}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.address?.city || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          customer.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
