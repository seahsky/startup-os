'use client';

import { useState } from 'react';
import { DocumentTabs } from '@/components/documents/DocumentTabs';
import { InvoiceListContent } from '@/components/documents/InvoiceListContent';
import { QuotationListContent } from '@/components/documents/QuotationListContent';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('invoices');

  return (
    <div className="min-h-screen">
      {/* Page Header - Mobile Only */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Documents</h1>
          <Link
            href="/dashboard/add"
            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <DocumentTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="p-4 lg:p-8">
        {activeTab === 'invoices' && <InvoiceListContent showHeader={false} />}
        {activeTab === 'quotations' && <QuotationListContent showHeader={false} />}
        {activeTab === 'credit-notes' && (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">Credit Notes coming soon</p>
            <Link
              href="/dashboard/credit-notes"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View Credit Notes page
            </Link>
          </div>
        )}
        {activeTab === 'debit-notes' && (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">Debit Notes coming soon</p>
            <Link
              href="/dashboard/debit-notes"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View Debit Notes page
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
