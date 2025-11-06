import type { Metadata } from 'next';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc/Provider';

export const metadata: Metadata = {
  title: 'Invoicing App - Professional Invoice Management',
  description: 'Create and manage quotations, invoices, credit notes, and debit notes with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
