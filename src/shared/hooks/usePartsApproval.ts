/**
 * Hook for managing parts approval requests
 */

import { useState, useEffect, useCallback } from "react";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import type { JobCardPartsRequest } from "@/shared/types/jobcard-inventory.types";
import { partsMasterService } from "@/services/inventory/partsMaster.service";
import { stockUpdateHistoryService } from "@/services/inventory/stockUpdateHistory.service";

const STORAGE_KEY = "jobCardPartsRequests";

export function usePartsApproval() {
  const [pendingRequests, setPendingRequests] = useState<JobCardPartsRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
    // Refresh every 30 seconds to catch new requests
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRequests = useCallback(() => {
    try {
      const allRequests = safeStorage.getItem<JobCardPartsRequest[]>(STORAGE_KEY, []);
      const pending = allRequests.filter((r) => r.status === "pending");
      setPendingRequests(pending);
    } catch (error) {
      console.error("Failed to load parts approval requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approve = useCallback(async (id: string, approvedBy: string, notes?: string) => {
    try {
      const allRequests = safeStorage.getItem<JobCardPartsRequest[]>(STORAGE_KEY, []);
      const index = allRequests.findIndex((r) => r.id === id);
      if (index === -1) {
        throw new Error("Request not found");
      }

      const request = allRequests[index];

      // Decrease stock for each part in the approved request
      for (const part of request.parts) {
        try {
          // Get all parts to find the matching part
          const parts = await partsMasterService.getAll();
          
          // Try to find part by id first (most common case)
          let partData = parts.find((p) => p.id === part.partId);
          
          // If not found by id, try by partId field
          if (!partData) {
            partData = parts.find((p) => p.partId === part.partId);
          }
          
          // If still not found, try by partName as fallback
          if (!partData) {
            partData = parts.find((p) => p.partName.toLowerCase() === part.partName.toLowerCase());
          }

          if (partData) {
            // Check if stock is sufficient before decreasing
            if (partData.stockQuantity < part.quantity) {
              throw new Error(
                `Insufficient stock for ${part.partName}. Available: ${partData.stockQuantity}, Required: ${part.quantity}`
              );
            }
            
            const previousStock = partData.stockQuantity;
            
            // Decrease stock by subtracting the requested quantity
            const updatedPart = await partsMasterService.updateStock(partData.id, part.quantity, "subtract");
            
            // Record the stock update in history
            await stockUpdateHistoryService.recordUpdate(
              partData.id,
              part.partName,
              partData.partNumber,
              part.quantity,
              "decrease",
              previousStock,
              updatedPart.stockQuantity,
              request.jobCardId,
              request.jobCardId, // Using jobCardId as jobCardNumber
              request.customerName,
              request.assignedEngineer || request.requestedBy,
              approvedBy,
              `Parts approved from job card ${request.jobCardId}${notes ? ` - ${notes}` : ""}`
            );
          } else {
            // Skip parts that don't exist in inventory (e.g., "unknown" parts)
            console.warn(`Part not found in inventory: ${part.partId} - ${part.partName}. Skipping stock update.`);
          }
        } catch (error) {
          console.error(`Failed to update stock for part ${part.partId} (${part.partName}):`, error);
          throw error; // Re-throw to prevent approval if stock update fails
        }
      }

      // Update request status after successful stock update
      allRequests[index] = {
        ...request,
        status: "approved",
        approvedBy,
        approvedAt: new Date().toISOString(),
        notes: notes || request.notes,
      };
      safeStorage.setItem(STORAGE_KEY, allRequests);
      loadRequests();
    } catch (error) {
      console.error("Failed to approve request:", error);
      throw error;
    }
  }, [loadRequests]);

  const reject = useCallback(async (id: string, rejectedBy: string, notes?: string) => {
    try {
      const allRequests = safeStorage.getItem<JobCardPartsRequest[]>(STORAGE_KEY, []);
      const index = allRequests.findIndex((r) => r.id === id);
      if (index === -1) {
        throw new Error("Request not found");
      }
      allRequests[index] = {
        ...allRequests[index],
        status: "rejected",
        rejectedBy,
        rejectedAt: new Date().toISOString(),
        notes: notes || allRequests[index].notes,
      };
      safeStorage.setItem(STORAGE_KEY, allRequests);
      loadRequests();
    } catch (error) {
      console.error("Failed to reject request:", error);
      throw error;
    }
  }, [loadRequests]);

  return {
    pendingRequests,
    isLoading,
    approve,
    reject,
    refresh: loadRequests,
  };
}

