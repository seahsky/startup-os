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
    invoice: 'nextInvoiceNumber' as const,
    credit_note: 'nextCreditNoteNumber' as const,
    debit_note: 'nextDebitNoteNumber' as const,
  };

  async getNextNumber(companyId: string, type: DocumentType): Promise<string> {
    const companies = await getCompaniesCollection();

    // Get company settings
    const company = await companies.findOne({ _id: new ObjectId(companyId) });

    if (!company) {
      throw new Error('Company not found');
    }

    const prefix = company.settings[this.prefixMap[type]];
    const nextNumber = company.settings[this.nextNumberMap[type]];

    // Generate document number (e.g., "INV-0001")
    const documentNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`;

    // Increment counter (atomic update)
    await companies.updateOne(
      { _id: new ObjectId(companyId) },
      { $inc: { [`settings.${this.nextNumberMap[type]}`]: 1 } }
    );

    return documentNumber;
  }
}

export const documentNumberingService = new DocumentNumberingService();
