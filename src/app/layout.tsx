import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc/Provider';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

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
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
