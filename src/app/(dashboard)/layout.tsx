'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  FileX,
  FilePlus,
  Users,
  Package,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Quotations', href: '/dashboard/quotations', icon: FileText },
  { name: 'Invoices', href: '/dashboard/invoices', icon: FileCheck },
  { name: 'Credit Notes', href: '/dashboard/credit-notes', icon: FileX },
  { name: 'Debit Notes', href: '/dashboard/debit-notes', icon: FilePlus },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <Link href="/" className="flex items-center space-x-2">
              <FileCheck className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Invoicing</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="px-3 py-2 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-600">Current Company</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">Demo Company</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        <main className="py-8 px-8">{children}</main>
      </div>
    </div>
  );
}
