'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { FileCheck } from 'lucide-react';

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <FileCheck className="w-6 h-6 text-blue-600" />
          <span className="text-lg font-bold text-gray-900">Invoicing</span>
        </Link>

        {/* User Button */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8'
            }
          }}
        />
      </div>
    </header>
  );
}
