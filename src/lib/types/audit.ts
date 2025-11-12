import { ObjectId } from 'mongodb';
import type { CustomerSnapshot, DocumentType } from './document';

export interface SnapshotAuditLog {
  _id: ObjectId;
  documentId: ObjectId;
  documentType: DocumentType;
  documentNumber: string;
  customerId: ObjectId;
  oldSnapshot: CustomerSnapshot;
  newSnapshot: CustomerSnapshot;
  updatedBy: string;
  updatedAt: Date;
  reason: 'customer_update' | 'manual_refresh' | 'cascade_update';
  changes: SnapshotChange[];
}

export interface SnapshotChange {
  field: string;
  oldValue: string | undefined;
  newValue: string | undefined;
}

export type SnapshotAuditCreateInput = Omit<SnapshotAuditLog, '_id' | 'updatedAt'>;
