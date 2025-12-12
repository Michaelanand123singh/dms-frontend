/**
 * Hook for customer quotation confirmation/rejection
 */

import { useState, useCallback } from "react";
import { quotationsService } from "@/features/quotations/services/quotations.service";
import type { Quotation, QuotationStatus } from "@/shared/types/quotation.types";

export function useCustomerQuotationConfirmation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmQuotation = useCallback(
    async (quotationId: string): Promise<Quotation | null> => {
      setLoading(true);
      setError(null);

      try {
        const quotation = await quotationsService.updateStatus(quotationId, "customer_approved");
        
        // Automatically create inventory approval request
        if (quotation.items && quotation.items.length > 0) {
          try {
            const { inventoryApprovalService } = await import("@/features/inventory/services/inventory-approval.service");
            await inventoryApprovalService.createRequest({
              quotationId: quotation.id,
              items: quotation.items.map((item) => ({
                partName: item.partName,
                partNumber: item.partNumber || "",
                quantity: item.quantity,
              })),
              notes: `Auto-generated from customer confirmed quotation ${quotation.quotationNumber}`,
            });
          } catch (err) {
            console.error("Error creating inventory approval request:", err);
            // Don't fail confirmation if approval request fails
          }
        }
        
        return quotation;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to confirm quotation";
        setError(errorMessage);
        console.error("Error confirming quotation:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const rejectQuotation = useCallback(
    async (quotationId: string, reason?: string): Promise<Quotation | null> => {
      setLoading(true);
      setError(null);

      try {
        const quotation = await quotationsService.updateStatus(quotationId, "customer_rejected" as QuotationStatus, reason);
        return quotation;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to reject quotation";
        setError(errorMessage);
        console.error("Error rejecting quotation:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    confirmQuotation,
    rejectQuotation,
    loading,
    error,
  };
}

