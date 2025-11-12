import { ObjectId } from 'mongodb';
import {
  getInvoicesCollection,
  getQuotationsCollection,
  getCreditNotesCollection,
  getDebitNotesCollection,
} from '../db/collections';
import { snapshotAuditService } from './snapshotAuditService';
import type { CustomerSnapshot } from '@/lib/types/document';

export class SnapshotUpdateService {
  /**
   * Updates customer snapshots in all draft documents for a customer
   * Returns the total count of documents updated
   */
  async updateDraftDocumentsForCustomer(
    customerId: string,
    newSnapshot: CustomerSnapshot,
    userId: string
  ): Promise<number> {
    let totalUpdated = 0;

    try {
      // Update draft invoices
      const invoicesUpdated = await this.updateDraftInvoices(
        customerId,
        newSnapshot,
        userId
      );
      totalUpdated += invoicesUpdated;

      // Update draft quotations
      const quotationsUpdated = await this.updateDraftQuotations(
        customerId,
        newSnapshot,
        userId
      );
      totalUpdated += quotationsUpdated;

      // Cascade updates to linked credit notes and debit notes
      // This happens automatically after invoice updates
      // (credit/debit notes are linked to invoices, not customers directly)

      return totalUpdated;
    } catch (error) {
      console.error('Error updating draft document snapshots:', error);
      throw error;
    }
  }

  /**
   * Updates customer snapshots in draft invoices and cascades to linked notes
   */
  private async updateDraftInvoices(
    customerId: string,
    newSnapshot: CustomerSnapshot,
    userId: string
  ): Promise<number> {
    const invoicesCollection = await getInvoicesCollection();

    // Find all draft invoices for this customer
    const draftInvoices = await invoicesCollection
      .find({
        customerId: new ObjectId(customerId),
        status: 'draft',
      })
      .toArray();

    let updatedCount = 0;

    for (const invoice of draftInvoices) {
      // Compare snapshots to detect changes
      const changes = snapshotAuditService.compareSnapshots(
        invoice.customerSnapshot,
        newSnapshot
      );

      // Only update if there are actual changes
      if (changes.length > 0) {
        // Update the invoice snapshot
        await invoicesCollection.updateOne(
          { _id: invoice._id },
          { $set: { customerSnapshot: newSnapshot, updatedAt: new Date() } }
        );

        // Log the audit trail
        await snapshotAuditService.logSnapshotUpdate({
          documentId: invoice._id,
          documentType: 'invoice',
          documentNumber: invoice.documentNumber,
          customerId: new ObjectId(customerId),
          oldSnapshot: invoice.customerSnapshot,
          newSnapshot,
          updatedBy: userId,
          reason: 'customer_update',
          changes,
        });

        updatedCount++;

        // Cascade to linked credit notes and debit notes
        await this.cascadeToLinkedNotes(invoice._id, newSnapshot, userId);
      }
    }

    return updatedCount;
  }

  /**
   * Updates customer snapshots in draft quotations
   */
  private async updateDraftQuotations(
    customerId: string,
    newSnapshot: CustomerSnapshot,
    userId: string
  ): Promise<number> {
    const quotationsCollection = await getQuotationsCollection();

    // Find all draft quotations for this customer
    const draftQuotations = await quotationsCollection
      .find({
        customerId: new ObjectId(customerId),
        status: 'draft',
      })
      .toArray();

    let updatedCount = 0;

    for (const quotation of draftQuotations) {
      // Compare snapshots to detect changes
      const changes = snapshotAuditService.compareSnapshots(
        quotation.customerSnapshot,
        newSnapshot
      );

      // Only update if there are actual changes
      if (changes.length > 0) {
        // Update the quotation snapshot
        await quotationsCollection.updateOne(
          { _id: quotation._id },
          { $set: { customerSnapshot: newSnapshot, updatedAt: new Date() } }
        );

        // Log the audit trail
        await snapshotAuditService.logSnapshotUpdate({
          documentId: quotation._id,
          documentType: 'quotation',
          documentNumber: quotation.documentNumber,
          customerId: new ObjectId(customerId),
          oldSnapshot: quotation.customerSnapshot,
          newSnapshot,
          updatedBy: userId,
          reason: 'customer_update',
          changes,
        });

        updatedCount++;
      }
    }

    return updatedCount;
  }

  /**
   * Cascades snapshot updates to linked credit notes and debit notes
   */
  private async cascadeToLinkedNotes(
    invoiceId: ObjectId,
    newSnapshot: CustomerSnapshot,
    userId: string
  ): Promise<void> {
    // Update linked credit notes (only drafts)
    await this.updateLinkedCreditNotes(invoiceId, newSnapshot, userId);

    // Update linked debit notes (only drafts)
    await this.updateLinkedDebitNotes(invoiceId, newSnapshot, userId);
  }

  /**
   * Updates customer snapshots in draft credit notes linked to an invoice
   */
  private async updateLinkedCreditNotes(
    invoiceId: ObjectId,
    newSnapshot: CustomerSnapshot,
    userId: string
  ): Promise<void> {
    const creditNotesCollection = await getCreditNotesCollection();

    // Find all draft credit notes for this invoice
    const draftCreditNotes = await creditNotesCollection
      .find({
        invoiceId,
        status: 'draft',
      })
      .toArray();

    for (const creditNote of draftCreditNotes) {
      // Compare snapshots to detect changes
      const changes = snapshotAuditService.compareSnapshots(
        creditNote.customerSnapshot,
        newSnapshot
      );

      // Only update if there are actual changes
      if (changes.length > 0) {
        // Update the credit note snapshot
        await creditNotesCollection.updateOne(
          { _id: creditNote._id },
          { $set: { customerSnapshot: newSnapshot, updatedAt: new Date() } }
        );

        // Log the audit trail
        await snapshotAuditService.logSnapshotUpdate({
          documentId: creditNote._id,
          documentType: 'credit_note',
          documentNumber: creditNote.documentNumber,
          customerId: creditNote.customerId,
          oldSnapshot: creditNote.customerSnapshot,
          newSnapshot,
          updatedBy: userId,
          reason: 'cascade_update',
          changes,
        });
      }
    }
  }

  /**
   * Updates customer snapshots in draft debit notes linked to an invoice
   */
  private async updateLinkedDebitNotes(
    invoiceId: ObjectId,
    newSnapshot: CustomerSnapshot,
    userId: string
  ): Promise<void> {
    const debitNotesCollection = await getDebitNotesCollection();

    // Find all draft debit notes for this invoice
    const draftDebitNotes = await debitNotesCollection
      .find({
        invoiceId,
        status: 'draft',
      })
      .toArray();

    for (const debitNote of draftDebitNotes) {
      // Compare snapshots to detect changes
      const changes = snapshotAuditService.compareSnapshots(
        debitNote.customerSnapshot,
        newSnapshot
      );

      // Only update if there are actual changes
      if (changes.length > 0) {
        // Update the debit note snapshot
        await debitNotesCollection.updateOne(
          { _id: debitNote._id },
          { $set: { customerSnapshot: newSnapshot, updatedAt: new Date() } }
        );

        // Log the audit trail
        await snapshotAuditService.logSnapshotUpdate({
          documentId: debitNote._id,
          documentType: 'debit_note',
          documentNumber: debitNote.documentNumber,
          customerId: debitNote.customerId,
          oldSnapshot: debitNote.customerSnapshot,
          newSnapshot,
          updatedBy: userId,
          reason: 'cascade_update',
          changes,
        });
      }
    }
  }
}

export const snapshotUpdateService = new SnapshotUpdateService();
