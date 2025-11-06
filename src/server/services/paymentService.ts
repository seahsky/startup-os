import { ObjectId } from 'mongodb';
import { getInvoicesCollection } from '../db/collections';
import { Invoice, InvoiceStatus, Payment } from '@/lib/types/document';

export class PaymentService {
  async recordPayment(
    invoiceId: string,
    payment: Payment
  ): Promise<Invoice> {
    const invoices = await getInvoicesCollection();

    // Fetch invoice
    const invoice = await invoices.findOne({ _id: new ObjectId(invoiceId) });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Calculate new payment status
    const newAmountPaid = invoice.paymentStatus.amountPaid + payment.amount;
    const newAmountDue = invoice.total - newAmountPaid;

    // Determine new status
    let newStatus: InvoiceStatus;
    if (newAmountDue <= 0) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partially_paid';
    } else {
      newStatus = invoice.status;
    }

    // Update invoice
    await invoices.updateOne(
      { _id: new ObjectId(invoiceId) },
      {
        $push: { 'paymentStatus.payments': payment },
        $set: {
          'paymentStatus.amountPaid': newAmountPaid,
          'paymentStatus.amountDue': newAmountDue,
          status: newStatus,
          updatedAt: new Date(),
        },
      }
    );

    // Fetch and return updated invoice
    const updatedInvoice = await invoices.findOne({ _id: new ObjectId(invoiceId) });

    if (!updatedInvoice) {
      throw new Error('Failed to fetch updated invoice');
    }

    return updatedInvoice;
  }

  async voidPayment(invoiceId: string, paymentIndex: number): Promise<Invoice> {
    const invoices = await getInvoicesCollection();

    // Fetch invoice
    const invoice = await invoices.findOne({ _id: new ObjectId(invoiceId) });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (paymentIndex < 0 || paymentIndex >= invoice.paymentStatus.payments.length) {
      throw new Error('Invalid payment index');
    }

    // Get payment amount to void
    const voidedAmount = invoice.paymentStatus.payments[paymentIndex].amount;

    // Remove payment and recalculate
    const newPayments = invoice.paymentStatus.payments.filter((_, idx) => idx !== paymentIndex);
    const newAmountPaid = invoice.paymentStatus.amountPaid - voidedAmount;
    const newAmountDue = invoice.total - newAmountPaid;

    // Determine new status
    let newStatus: InvoiceStatus;
    if (newAmountDue <= 0) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partially_paid';
    } else {
      newStatus = 'sent';
    }

    // Update invoice
    await invoices.updateOne(
      { _id: new ObjectId(invoiceId) },
      {
        $set: {
          'paymentStatus.payments': newPayments,
          'paymentStatus.amountPaid': newAmountPaid,
          'paymentStatus.amountDue': newAmountDue,
          status: newStatus,
          updatedAt: new Date(),
        },
      }
    );

    const updatedInvoice = await invoices.findOne({ _id: new ObjectId(invoiceId) });

    if (!updatedInvoice) {
      throw new Error('Failed to fetch updated invoice');
    }

    return updatedInvoice;
  }
}

export const paymentService = new PaymentService();
