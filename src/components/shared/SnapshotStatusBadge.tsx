import React from 'react';

interface SnapshotStatusBadgeProps {
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled' | 'accepted' | 'rejected' | 'expired' | 'converted' | 'applied';
  hasAuditHistory: boolean;
}

export function SnapshotStatusBadge({ status, hasAuditHistory }: SnapshotStatusBadgeProps) {
  // Draft documents can be updated
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-600"></span>
        Draft
      </span>
    );
  }

  // If document has audit history, it means snapshot was updated
  if (hasAuditHistory) {
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-green-600"></span>
        Current
      </span>
    );
  }

  // Sent/paid documents are frozen (no updates)
  return (
    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-gray-600"></span>
      Frozen
    </span>
  );
}
