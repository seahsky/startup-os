import { ObjectId } from 'mongodb';
import {
  getCreditNotesCollection,
  getDebitNotesCollection,
  getInvoicesCollection,
} from '../db/collections';
import { paymentService } from './paymentService';

export class CreditDebitService {
  async applyCreditNote(creditNoteId: string): Promise<void> {
    const creditNotes = await getCreditNotesCollection();
    const invoices = await getInvoicesCollection();

    // Get credit note
    const creditNote = await creditNotes.findOne({ _id: new ObjectId(creditNoteId) });

    if (!creditNote) {
      throw new Error('Credit note not found');
    }

    if (creditNote.status === 'applied') {
      throw new Error('Credit note already applied');
    }

    // Get related invoice
    const invoice = await invoices.findOne({ _id: creditNote.invoiceId });

    if (!invoice) {
      throw new Error('Related invoice not found');
    }

    // Record as payment (credit note reduces balance)
    await paymentService.recordPayment(invoice._id.toString(), {
      amount: creditNote.total,
      date: new Date(),
      method: 'credit_note',
      reference: creditNote.documentNumber,
      notes: `Applied credit note: ${creditNote.documentNumber}`,
    });

    // Update credit note status
    await creditNotes.updateOne(
      { _id: new ObjectId(creditNoteId) },
      { $set: { status: 'applied', updatedAt: new Date() } }
    );
  }

  async applyDebitNote(debitNoteId: string): Promise<void> {
    const debitNotes = await getDebitNotesCollection();
    const invoices = await getInvoicesCollection();

    // Get debit note
    const debitNote = await debitNotes.findOne({ _id: new ObjectId(debitNoteId) });

    if (!debitNote) {
      throw new Error('Debit note not found');
    }

    if (debitNote.status === 'applied') {
      throw new Error('Debit note already applied');
    }

    // Update invoice amount due (increase)
    await invoices.updateOne(
      { _id: debitNote.invoiceId },
      {
        $inc: {
          'paymentStatus.amountDue': debitNote.total,
          total: debitNote.total,
        },
        $set: { updatedAt: new Date() },
      }
    );

    // Update debit note status
    await debitNotes.updateOne(
      { _id: new ObjectId(debitNoteId) },
      { $set: { status: 'applied', updatedAt: new Date() } }
    );
  }
}

export const creditDebitService = new CreditDebitService();
