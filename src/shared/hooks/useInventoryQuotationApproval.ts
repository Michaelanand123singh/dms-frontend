/**
 * Hook for inventory quotation approval
 */

import { useState, useCallback } from "react";
import { inventoryApprovalService } from "@/services/inventory/inventory-approval.service";
import type { InventoryApproval, InventoryApprovalRequest, InventoryApprovalStatus } from "@/shared/types/inventory-approval.types";

export function useInventoryQuotationApproval() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createApprovalRequest = useCallback(
    async (data: InventoryApprovalRequest): Promise<InventoryApproval | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await inventoryApprovalService.createRequest(data);
        // Get the created approval
        const approvals = await inventoryApprovalService.getAll();
        const approval = approvals.find((a) => a.id === response.approvalId);
        return approval || null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create approval request";
        setError(errorMessage);
        console.error("Error creating approval request:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const approve = useCallback(
    async (approvalId: string): Promise<InventoryApproval | null> => {
      setLoading(true);
      setError(null);

      try {
        const approval = await inventoryApprovalService.approve(approvalId);
        return approval;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to approve";
        setError(errorMessage);
        console.error("Error approving:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reject = useCallback(
    async (approvalId: string, reason?: string): Promise<InventoryApproval | null> => {
      setLoading(true);
      setError(null);

      try {
        const approval = await inventoryApprovalService.reject(approvalId, reason);
        return approval;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to reject";
        setError(errorMessage);
        console.error("Error rejecting:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getPendingApprovals = useCallback(async (): Promise<InventoryApproval[]> => {
    try {
      return await inventoryApprovalService.getPending();
    } catch (err) {
      console.error("Error fetching pending approvals:", err);
      return [];
    }
  }, []);

  return {
    createApprovalRequest,
    approve,
    reject,
    getPendingApprovals,
    loading,
    error,
  };
}

