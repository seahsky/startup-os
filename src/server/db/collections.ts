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
  User,
} from '@/lib/types/document';

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

export async function getUsersCollection(): Promise<Collection<User>> {
  const db = await getDatabase();
  return db.collection<User>('users');
}
