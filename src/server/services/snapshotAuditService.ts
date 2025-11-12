import { ObjectId } from 'mongodb';
import { getSnapshotAuditCollection } from '../db/collections';
import type {
  SnapshotAuditLog,
  SnapshotAuditCreateInput,
  SnapshotChange,
} from '@/lib/types/audit';
import type { CustomerSnapshot, DocumentType } from '@/lib/types/document';

export class SnapshotAuditService {
  /**
   * Logs a customer snapshot update to the audit trail
   */
  async logSnapshotUpdate(input: SnapshotAuditCreateInput): Promise<void> {
    const auditCollection = await getSnapshotAuditCollection();

    const auditLog: SnapshotAuditLog = {
      _id: new ObjectId(),
      ...input,
      updatedAt: new Date(),
    };

    await auditCollection.insertOne(auditLog);
  }

  /**
   * Retrieves audit history for a specific document
   */
  async getAuditHistory(documentId: string): Promise<SnapshotAuditLog[]> {
    const auditCollection = await getSnapshotAuditCollection();

    const logs = await auditCollection
      .find({ documentId: new ObjectId(documentId) })
      .sort({ updatedAt: -1 })
      .toArray();

    return logs;
  }

  /**
   * Compares two customer snapshots and returns the list of changes
   */
  compareSnapshots(
    oldSnapshot: CustomerSnapshot,
    newSnapshot: CustomerSnapshot
  ): SnapshotChange[] {
    const changes: SnapshotChange[] = [];

    // Compare basic fields
    if (oldSnapshot.name !== newSnapshot.name) {
      changes.push({
        field: 'name',
        oldValue: oldSnapshot.name,
        newValue: newSnapshot.name,
      });
    }

    if (oldSnapshot.email !== newSnapshot.email) {
      changes.push({
        field: 'email',
        oldValue: oldSnapshot.email,
        newValue: newSnapshot.email,
      });
    }

    if (oldSnapshot.phone !== newSnapshot.phone) {
      changes.push({
        field: 'phone',
        oldValue: oldSnapshot.phone,
        newValue: newSnapshot.phone,
      });
    }

    if (oldSnapshot.country !== newSnapshot.country) {
      changes.push({
        field: 'country',
        oldValue: oldSnapshot.country,
        newValue: newSnapshot.country,
      });
    }

    // Compare address fields
    const oldAddress = oldSnapshot.address;
    const newAddress = newSnapshot.address;

    if (oldAddress?.street !== newAddress?.street) {
      changes.push({
        field: 'address.street',
        oldValue: oldAddress?.street,
        newValue: newAddress?.street,
      });
    }

    if (oldAddress?.city !== newAddress?.city) {
      changes.push({
        field: 'address.city',
        oldValue: oldAddress?.city,
        newValue: newAddress?.city,
      });
    }

    if (oldAddress?.state !== newAddress?.state) {
      changes.push({
        field: 'address.state',
        oldValue: oldAddress?.state,
        newValue: newAddress?.state,
      });
    }

    if (oldAddress?.country !== newAddress?.country) {
      changes.push({
        field: 'address.country',
        oldValue: oldAddress?.country,
        newValue: newAddress?.country,
      });
    }

    if (oldAddress?.zipCode !== newAddress?.zipCode) {
      changes.push({
        field: 'address.zipCode',
        oldValue: oldAddress?.zipCode,
        newValue: newAddress?.zipCode,
      });
    }

    // Compare tax IDs
    const oldTaxIds = oldSnapshot.taxIds || {};
    const newTaxIds = newSnapshot.taxIds || {};

    // Get all unique tax ID keys
    const allTaxIdKeys = new Set([
      ...Object.keys(oldTaxIds),
      ...Object.keys(newTaxIds),
    ]);

    for (const key of allTaxIdKeys) {
      if (oldTaxIds[key] !== newTaxIds[key]) {
        changes.push({
          field: `taxIds.${key}`,
          oldValue: oldTaxIds[key],
          newValue: newTaxIds[key],
        });
      }
    }

    return changes;
  }

  /**
   * Creates a customer snapshot from customer data
   */
  createSnapshot(customer: {
    name: string;
    email: string;
    phone: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    country: string;
    taxIds?: Record<string, string>;
  }): CustomerSnapshot {
    return {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      country: customer.country,
      taxIds: customer.taxIds,
    };
  }
}

export const snapshotAuditService = new SnapshotAuditService();
