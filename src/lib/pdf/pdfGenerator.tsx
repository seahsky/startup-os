import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from './templates/InvoicePDF';
import { QuotationPDF } from './templates/QuotationPDF';
import { CreditNotePDF } from './templates/CreditNotePDF';
import { DebitNotePDF } from './templates/DebitNotePDF';
import { generatePDFFilename } from './utils/pdfHelpers';
import type { Invoice, Quotation, CreditNote, DebitNote, Company } from '@/lib/types/document';

/**
 * Document type for PDF generation
 */
export type DocumentType = 'invoice' | 'quotation' | 'creditNote' | 'debitNote';

/**
 * Generate Invoice PDF
 */
export async function generateInvoicePDF(
  invoice: Invoice,
  company: Company
): Promise<Blob> {
  const blob = await pdf(<InvoicePDF invoice={invoice} company={company} />).toBlob();
  return blob;
}

/**
 * Generate Quotation PDF
 */
export async function generateQuotationPDF(
  quotation: Quotation,
  company: Company
): Promise<Blob> {
  const blob = await pdf(<QuotationPDF quotation={quotation} company={company} />).toBlob();
  return blob;
}

/**
 * Generate Credit Note PDF
 */
export async function generateCreditNotePDF(
  creditNote: CreditNote,
  company: Company
): Promise<Blob> {
  const blob = await pdf(<CreditNotePDF creditNote={creditNote} company={company} />).toBlob();
  return blob;
}

/**
 * Generate Debit Note PDF
 */
export async function generateDebitNotePDF(
  debitNote: DebitNote,
  company: Company
): Promise<Blob> {
  const blob = await pdf(<DebitNotePDF debitNote={debitNote} company={company} />).toBlob();
  return blob;
}

/**
 * Generic PDF generator that routes to the correct template
 */
export async function generatePDF(
  documentType: DocumentType,
  document: Invoice | Quotation | CreditNote | DebitNote,
  company: Company
): Promise<Blob> {
  switch (documentType) {
    case 'invoice':
      return generateInvoicePDF(document as Invoice, company);
    case 'quotation':
      return generateQuotationPDF(document as Quotation, company);
    case 'creditNote':
      return generateCreditNotePDF(document as CreditNote, company);
    case 'debitNote':
      return generateDebitNotePDF(document as DebitNote, company);
    default:
      throw new Error(`Unknown document type: ${documentType}`);
  }
}

/**
 * Download PDF file
 * Creates a temporary download link and triggers download
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object after a short delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Open PDF in new tab
 * Creates a temporary URL and opens it in a new window
 */
export function viewPDF(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');

  // Clean up after a delay to allow the window to open
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Get filename for document PDF
 */
export function getDocumentPDFFilename(
  documentType: DocumentType,
  documentNumber: string
): string {
  const typeMap: Record<DocumentType, string> = {
    invoice: 'Invoice',
    quotation: 'Quotation',
    creditNote: 'CreditNote',
    debitNote: 'DebitNote',
  };

  return generatePDFFilename(typeMap[documentType], documentNumber);
}

/**
 * Complete flow: Generate and download PDF
 */
export async function generateAndDownloadPDF(
  documentType: DocumentType,
  document: Invoice | Quotation | CreditNote | DebitNote,
  company: Company
): Promise<void> {
  const blob = await generatePDF(documentType, document, company);
  const filename = getDocumentPDFFilename(documentType, document.documentNumber);
  downloadPDF(blob, filename);
}

/**
 * Complete flow: Generate and view PDF
 */
export async function generateAndViewPDF(
  documentType: DocumentType,
  document: Invoice | Quotation | CreditNote | DebitNote,
  company: Company
): Promise<void> {
  const blob = await generatePDF(documentType, document, company);
  viewPDF(blob);
}
