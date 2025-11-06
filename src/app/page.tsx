import Link from 'next/link';
import { FileText, FileCheck, FileX, FilePlus } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Invoicing App
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional invoice management system with quotations, invoices, credit notes, and debit notes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          <FeatureCard
            icon={<FileText className="w-12 h-12 text-blue-600" />}
            title="Quotations"
            description="Create and manage professional quotations"
            href="/dashboard/quotations"
          />
          <FeatureCard
            icon={<FileCheck className="w-12 h-12 text-green-600" />}
            title="Invoices"
            description="Generate invoices and track payments"
            href="/dashboard/invoices"
          />
          <FeatureCard
            icon={<FileX className="w-12 h-12 text-red-600" />}
            title="Credit Notes"
            description="Issue credit notes for refunds"
            href="/dashboard/credit-notes"
          />
          <FeatureCard
            icon={<FilePlus className="w-12 h-12 text-purple-600" />}
            title="Debit Notes"
            description="Create debit notes for additional charges"
            href="/dashboard/debit-notes"
          />
        </div>

        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Feature
              title="Customizable PDFs"
              description="Export documents as PDFs with customizable templates"
            />
            <Feature
              title="Payment Tracking"
              description="Record and track payments with detailed history"
            />
            <Feature
              title="Customer Management"
              description="Manage customers and products in one place"
            />
            <Feature
              title="Auto Calculations"
              description="Automatic tax and total calculations"
            />
            <Feature
              title="Document Conversion"
              description="Convert quotations to invoices instantly"
            />
            <Feature
              title="Type-Safe API"
              description="Built with tRPC for end-to-end type safety"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
