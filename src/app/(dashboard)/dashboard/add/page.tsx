'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { documentTypes } from '@/components/layout/NavigationConfig';

export default function AddDocumentPage() {
  const router = useRouter();

  // On desktop, redirect to dashboard (since we have sidebar access to all documents)
  // On mobile, show the document selection page
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) {
        // Desktop - redirect to dashboard
        router.push('/dashboard');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, [router]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Document</h1>
        <p className="text-gray-600 mt-1">Choose a document type to create</p>
      </div>

      <div className="grid gap-4">
        {documentTypes.map((docType) => {
          const Icon = docType.icon;
          return (
            <Link
              key={docType.id}
              href={docType.href}
              className="flex items-center gap-4 p-5 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md active:bg-gray-50 transition-all"
            >
              <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gray-50 ${docType.color}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {docType.name}
                </h3>
                <p className="text-sm text-gray-600">{docType.description}</p>
              </div>
              <div className="text-gray-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
