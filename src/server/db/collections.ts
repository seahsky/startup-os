import { Collection } from 'mongodb';
import { getDatabase } from './client';
import {
  Company,
  Customer,
  Product,
  Quotation,
  Invoice,
  CreditNote,
  DebitNote,
  PDFTemplate,
} from '@/lib/types/document';
import type { SnapshotAuditLog } from '@/lib/types/audit';

export async function getCompaniesCollection(): Promise<Collection<Company>> {
  const db = await getDatabase();
  return db.collection<Company>('companies');
}

export async function getCustomersCollection(): Promise<Collection<Customer>> {
  const db = await getDatabase();
  return db.collection<Customer>('customers');
}

export async function getProductsCollection(): Promise<Collection<Product>> {
  const db = await getDatabase();
  return db.collection<Product>('products');
}

export async function getQuotationsCollection(): Promise<Collection<Quotation>> {
  const db = await getDatabase();
  return db.collection<Quotation>('quotations');
}

export async function getInvoicesCollection(): Promise<Collection<Invoice>> {
  const db = await getDatabase();
  return db.collection<Invoice>('invoices');
}

export async function getCreditNotesCollection(): Promise<Collection<CreditNote>> {
  const db = await getDatabase();
  return db.collection<CreditNote>('credit_notes');
}

export async function getDebitNotesCollection(): Promise<Collection<DebitNote>> {
  const db = await getDatabase();
  return db.collection<DebitNote>('debit_notes');
}

export async function getPDFTemplatesCollection(): Promise<Collection<PDFTemplate>> {
  const db = await getDatabase();
  return db.collection<PDFTemplate>('pdf_templates');
}

export async function getSnapshotAuditCollection(): Promise<Collection<SnapshotAuditLog>> {
  const db = await getDatabase();
  const collection = db.collection<SnapshotAuditLog>('snapshot_audit');

  // Create indexes for efficient querying
  await collection.createIndex({ documentId: 1, updatedAt: -1 });
  await collection.createIndex({ customerId: 1, updatedAt: -1 });
  await collection.createIndex({ updatedAt: -1 });

  return collection;
}

// Users collection removed - using Clerk for authentication
// User data is now managed by Clerk, with app-specific data stored in publicMetadata
