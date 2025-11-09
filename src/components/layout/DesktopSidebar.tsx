'use client';

import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import { FileCheck } from 'lucide-react';
import { desktopNavItems } from './NavigationConfig';

interface DesktopSidebarProps {
  pathname: string;
}

export function DesktopSidebar({ pathname }: DesktopSidebarProps) {
  const { user } = useUser();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Brand/Logo */}
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <FileCheck className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Invoicing</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.id}
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

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-3 py-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10'
                }
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress}
              </p>
              <p className="text-xs text-gray-500">
                {user?.publicMetadata?.role as string || 'User'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
