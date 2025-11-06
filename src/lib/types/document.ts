import { ObjectId } from 'mongodb';

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Company {
  _id: ObjectId;
  name: string;
  email: string;
  phone: string;
  address: Address;
  taxId: string;
  logo?: string;
  currency: string;
  settings: CompanySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanySettings {
  invoicePrefix: string;
  quotationPrefix: string;
  creditNotePrefix: string;
  debitNotePrefix: string;
  nextInvoiceNumber: number;
  nextQuotationNumber: number;
  nextCreditNoteNumber: number;
  nextDebitNoteNumber: number;
  defaultTaxRate: number;
  paymentTerms: string;
  defaultDueDays: number;
}

export interface Customer {
  _id: ObjectId;
  companyId: ObjectId;
  name: string;
  email: string;
  phone: string;
  address: Address;
  taxId?: string;
  contactPerson?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: ObjectId;
  companyId: ObjectId;
  name: string;
  description: string;
  sku?: string;
  unitPrice: number;
  taxRate: number;
  unit: string;
  category?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentItem {
  productId?: ObjectId;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface CustomerSnapshot {
  name: string;
  email: string;
  phone: string;
  address: Address;
  taxId?: string;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface Quotation {
  _id: ObjectId;
  companyId: ObjectId;
  documentNumber: string;
  customerId: ObjectId;
  customerSnapshot: CustomerSnapshot;
  date: Date;
  validUntil: Date;
  items: DocumentItem[];
  subtotal: number;
  totalTax: number;
  total: number;
  notes?: string;
  termsAndConditions?: string;
  status: QuotationStatus;
  convertedToInvoiceId?: ObjectId;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

export interface Payment {
  amount: number;
  date: Date;
  method: string;
  reference?: string;
  notes?: string;
}

export interface PaymentStatus {
  amountPaid: number;
  amountDue: number;
  payments: Payment[];
}

export interface Invoice {
  _id: ObjectId;
  companyId: ObjectId;
  documentNumber: string;
  customerId: ObjectId;
  customerSnapshot: CustomerSnapshot;
  quotationId?: ObjectId;
  date: Date;
  dueDate: Date;
  items: DocumentItem[];
  subtotal: number;
  totalTax: number;
  total: number;
  notes?: string;
  termsAndConditions?: string;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type CreditNoteStatus = 'draft' | 'sent' | 'applied';

export interface CreditNote {
  _id: ObjectId;
  companyId: ObjectId;
  documentNumber: string;
  invoiceId: ObjectId;
  customerId: ObjectId;
  customerSnapshot: CustomerSnapshot;
  date: Date;
  reason: string;
  items: DocumentItem[];
  subtotal: number;
  totalTax: number;
  total: number;
  notes?: string;
  status: CreditNoteStatus;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type DebitNoteStatus = 'draft' | 'sent' | 'applied';

export interface DebitNote {
  _id: ObjectId;
  companyId: ObjectId;
  documentNumber: string;
  invoiceId: ObjectId;
  customerId: ObjectId;
  customerSnapshot: CustomerSnapshot;
  date: Date;
  reason: string;
  items: DocumentItem[];
  subtotal: number;
  totalTax: number;
  total: number;
  notes?: string;
  status: DebitNoteStatus;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface PDFTemplateConfig {
  layout: 'standard' | 'modern' | 'minimal';
  primaryColor: string;
  secondaryColor: string;
  font: string;
  showLogo: boolean;
  showCompanyAddress: boolean;
  showCustomerAddress: boolean;
  showTaxBreakdown: boolean;
  headerText?: string;
  footerText?: string;
  fields: {
    itemDescription: boolean;
    itemSKU: boolean;
    unitPrice: boolean;
    quantity: boolean;
    taxRate: boolean;
    lineTotal: boolean;
  };
}

export interface PDFTemplate {
  _id: ObjectId;
  companyId: ObjectId;
  name: string;
  type: 'quotation' | 'invoice' | 'credit_note' | 'debit_note';
  isDefault: boolean;
  config: PDFTemplateConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: ObjectId;
  companyId: ObjectId;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentType = 'quotation' | 'invoice' | 'credit_note' | 'debit_note';
export type Document = Quotation | Invoice | CreditNote | DebitNote;
