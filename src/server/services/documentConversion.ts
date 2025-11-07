import { ObjectId } from 'mongodb';
import { getQuotationsCollection, getInvoicesCollection, getCompaniesCollection } from '../db/collections';
import { Invoice } from '@/lib/types/document';
import { documentNumberingService } from './documentNumbering';

export class DocumentConversionService {
  async convertQuotationToInvoice(
    quotationId: string,
    userId: string
  ): Promise<Invoice> {
    const quotations = await getQuotationsCollection();
    const invoices = await getInvoicesCollection();
    const companies = await getCompaniesCollection();

    // Fetch quotation
    const quotation = await quotations.findOne({ _id: new ObjectId(quotationId) });

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    if (quotation.status === 'converted') {
      throw new Error('Quotation already converted to invoice');
    }

    // Generate new invoice number
    const documentNumber = await documentNumberingService.getNextNumber(
      quotation.companyId.toString(),
      'invoice'
    );

    // Get company settings for due date
    const company = await companies.findOne({ _id: quotation.companyId });

    if (!company) {
      throw new Error('Company not found');
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + company.settings.defaultDueDays);

    // Create invoice
    const invoice: Invoice = {
      _id: new ObjectId(),
      companyId: quotation.companyId,
      documentNumber,
      customerId: quotation.customerId,
      customerSnapshot: quotation.customerSnapshot,
      quotationId: quotation._id,
      date: new Date(),
      dueDate,
      items: quotation.items,
      subtotal: quotation.subtotal,
      totalTax: quotation.totalTax,
      total: quotation.total,
      notes: quotation.notes,
      termsAndConditions: quotation.termsAndConditions,
      status: 'draft',
      paymentStatus: {
        amountPaid: 0,
        amountDue: quotation.total,
        payments: [],
      },
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save invoice
    await invoices.insertOne(invoice);

    // Update quotation status
    await quotations.updateOne(
      { _id: new ObjectId(quotationId) },
      {
        $set: {
          status: 'converted',
          convertedToInvoiceId: invoice._id,
          updatedAt: new Date(),
        },
      }
    );

    return invoice;
  }
}

export const documentConversionService = new DocumentConversionService();
