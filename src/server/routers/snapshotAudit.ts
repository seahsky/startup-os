import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { snapshotAuditService } from '../services/snapshotAuditService';

export const snapshotAuditRouter = router({
  /**
   * Get audit history for a specific document
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const history = await snapshotAuditService.getAuditHistory(input.documentId);

      // Convert ObjectIds to strings for client consumption
      return history.map((log) => ({
        ...log,
        _id: log._id.toString(),
        documentId: log.documentId.toString(),
        customerId: log.customerId.toString(),
        updatedAt: log.updatedAt.toISOString(),
      }));
    }),
});
