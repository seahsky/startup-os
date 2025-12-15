import { ObjectId } from 'mongodb';
import { getCompaniesCollection } from '../db/collections';
import { DocumentType } from '@/lib/types/document';

export class DocumentNumberingService {
  private readonly prefixMap = {
    quotation: 'quotationPrefix' as const,
    invoice: 'invoicePrefix' as const,
    credit_note: 'creditNotePrefix' as const,
    debit_note: 'debitNotePrefix' as const,
  };

  private readonly nextNumberMap = {
    quotation: 'nextQuotationNumber' as const,
  };

  /**
   * Get next quotation number (the only independent counter remaining)
   * Invoices derive their number from quotations, CN/DN derive from invoices
   */
  async getNextQuotationNumber(companyId: string): Promise<string> {
    const companies = await getCompaniesCollection();

    const company = await companies.findOne({ _id: new ObjectId(companyId) });

    if (!company) {
      throw new Error('Company not found');
    }

    const prefix = company.settings.quotationPrefix;
    const nextNumber = company.settings.nextQuotationNumber;

    // Generate document number (e.g., "QUO-0001")
    const documentNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`;

    // Increment counter (atomic update)
    await companies.updateOne(
      { _id: new ObjectId(companyId) },
      { $inc: { 'settings.nextQuotationNumber': 1 } }
    );

    return documentNumber;
  }

  /**
   * Extract the base number from a document number
   * e.g., "QUO-0005" -> "0005", "INV-1234" -> "1234"
   */
  extractBaseNumber(documentNumber: string): string {
    // Match digits at the end of the string (after prefix)
    const match = documentNumber.match(/(\d+)$/);
    if (!match) {
      throw new Error(`Invalid document number format: ${documentNumber}`);
    }
    return match[1];
  }

  /**
   * Generate invoice number from quotation number
   * e.g., "QUO-0005" -> "INV-0005" (same base number)
   */
  async generateInvoiceNumberFromQuotation(
    companyId: string,
    quotationNumber: string
  ): Promise<string> {
    const companies = await getCompaniesCollection();
    const company = await companies.findOne({ _id: new ObjectId(companyId) });

    if (!company) {
      throw new Error('Company not found');
    }

    const baseNumber = this.extractBaseNumber(quotationNumber);
    const invoicePrefix = company.settings.invoicePrefix;

    return `${invoicePrefix}${baseNumber}`;
  }

  /**
   * Generate linked document number for credit notes and debit notes
   * e.g., for invoice "INV-0005" with sequence 1 -> "CN-0005-1"
   */
  async getLinkedDocumentNumber(
    companyId: string,
    invoiceNumber: string,
    type: 'credit_note' | 'debit_note',
    sequence: number
  ): Promise<string> {
    const companies = await getCompaniesCollection();
    const company = await companies.findOne({ _id: new ObjectId(companyId) });

    if (!company) {
      throw new Error('Company not found');
    }

    const baseNumber = this.extractBaseNumber(invoiceNumber);
    const prefix = type === 'credit_note'
      ? company.settings.creditNotePrefix
      : company.settings.debitNotePrefix;

    // Format: PREFIX + baseNumber + "-" + sequence
    // e.g., "CN-0005-1", "DN-0005-2"
    return `${prefix}${baseNumber}-${sequence}`;
  }

  /**
   * @deprecated Use getNextQuotationNumber() for quotations,
   * generateInvoiceNumberFromQuotation() for invoices,
   * or getLinkedDocumentNumber() for CN/DN
   */
  async getNextNumber(companyId: string, type: DocumentType): Promise<string> {
    if (type === 'quotation') {
      return this.getNextQuotationNumber(companyId);
    }

    // For backward compatibility during migration
    // Invoice, credit_note, and debit_note should use the new methods
    throw new Error(
      `Direct numbering for ${type} is no longer supported. ` +
      'Invoices must be created from quotations, CN/DN must be linked to invoices.'
    );
  }
}

export const documentNumberingService = new DocumentNumberingService();
