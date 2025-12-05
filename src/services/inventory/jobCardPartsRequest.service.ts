/**
 * Service for creating parts requests from job cards
 */

import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import type { JobCardPartsRequest } from "@/shared/types/jobcard-inventory.types";
import type { JobCard } from "@/shared/types/job-card.types";
import { partsMasterService } from "./partsMaster.service";
import { stockUpdateHistoryService } from "./stockUpdateHistory.service";

const STORAGE_KEY = "jobCardPartsRequests";

class JobCardPartsRequestService {
  /**
   * Create a parts request from a job card
   * This is called when SC Manager creates a job card with parts
   */
  async createRequestFromJobCard(
    jobCard: JobCard,
    parts: Array<{ partId: string; partName: string; quantity: number }>,
    requestedBy: string
  ): Promise<JobCardPartsRequest> {
    const request: JobCardPartsRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      jobCardId: jobCard.id || jobCard.jobCardNumber,
      vehicleId: jobCard.vehicleId,
      vehicleNumber: jobCard.registration || undefined,
      customerName: jobCard.customerName,
      requestedBy,
      requestedAt: new Date().toISOString(),
      status: "pending",
      parts,
    };

    const existingRequests = safeStorage.getItem<JobCardPartsRequest[]>(STORAGE_KEY, []);
    safeStorage.setItem(STORAGE_KEY, [request, ...existingRequests]);

    return request;
  }

  /**
   * Get all requests
   */
  async getAll(): Promise<JobCardPartsRequest[]> {
    return safeStorage.getItem<JobCardPartsRequest[]>(STORAGE_KEY, []);
  }

  /**
   * Get pending requests
   */
  async getPending(): Promise<JobCardPartsRequest[]> {
    const all = await this.getAll();
    return all.filter((r) => r.status === "pending");
  }

  /**
   * Get request by ID
   */
  async getById(id: string): Promise<JobCardPartsRequest | null> {
    const all = await this.getAll();
    return all.find((r) => r.id === id) || null;
  }

  /**
   * Get requests by job card ID
   */
  async getByJobCardId(jobCardId: string): Promise<JobCardPartsRequest[]> {
    const all = await this.getAll();
    return all.filter((r) => r.jobCardId === jobCardId);
  }

  /**
   * Approve request by SC Manager
   */
  async approveByScManager(requestId: string, approvedBy: string, notes?: string): Promise<JobCardPartsRequest> {
    const all = await this.getAll();
    const index = all.findIndex((r) => r.id === requestId);
    if (index === -1) {
      throw new Error("Request not found");
    }

    all[index] = {
      ...all[index],
      scManagerApproved: true,
      scManagerApprovedBy: approvedBy,
      scManagerApprovedAt: new Date().toISOString(),
      notes: notes || all[index].notes,
    };

    safeStorage.setItem(STORAGE_KEY, all);
    return all[index];
  }

  /**
   * Assign parts to engineer by Inventory Manager
   * Automatically decreases stock when parts are assigned
   */
  async assignPartsByInventoryManager(
    requestId: string,
    assignedBy: string,
    engineerName: string,
    notes?: string
  ): Promise<JobCardPartsRequest> {
    const all = await this.getAll();
    const index = all.findIndex((r) => r.id === requestId);
    if (index === -1) {
      throw new Error("Request not found");
    }

    if (!all[index].scManagerApproved) {
      throw new Error("Request must be approved by SC Manager first");
    }

    const request = all[index];

    // Check parts availability before assigning
    const availability = await this.checkPartsAvailability(
      request.parts.map((p) => ({ partId: p.partId, quantity: p.quantity }))
    );

    if (!availability.available) {
      const unavailableList = availability.unavailableParts
        .map((p) => `${p.partName}: Required ${p.required}, Available ${p.available}`)
        .join("\n");
      throw new Error(`Insufficient stock for the following parts:\n${unavailableList}`);
    }

    // Decrease stock for each part in the request
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
            request.jobCardId, // Using jobCardId as jobCardNumber if not available separately
            request.customerName,
            engineerName,
            assignedBy,
            `Parts assigned to ${engineerName} for job card ${request.jobCardId}`
          );
        } else {
          // Skip parts that don't exist in inventory (e.g., "unknown" parts)
          console.warn(`Part not found in inventory: ${part.partId} - ${part.partName}. Skipping stock update.`);
        }
      } catch (error) {
        console.error(`Failed to update stock for part ${part.partId} (${part.partName}):`, error);
        throw error; // Re-throw to prevent assignment if stock update fails
      }
    }

    // Update request status
    all[index] = {
      ...request,
      inventoryManagerAssigned: true,
      inventoryManagerAssignedBy: assignedBy,
      inventoryManagerAssignedAt: new Date().toISOString(),
      assignedEngineer: engineerName,
      status: "approved",
      notes: notes || request.notes,
    };

    safeStorage.setItem(STORAGE_KEY, all);
    return all[index];
  }

  /**
   * Check if parts are available in stock
   */
  async checkPartsAvailability(parts: Array<{ partId: string; quantity: number }>): Promise<{
    available: boolean;
    unavailableParts: Array<{ partId: string; partName: string; available: number; required: number }>;
  }> {
    const unavailableParts: Array<{ partId: string; partName: string; available: number; required: number }> = [];

    for (const part of parts) {
      const partData = await partsMasterService.getById(part.partId);
      if (!partData) {
        unavailableParts.push({
          partId: part.partId,
          partName: "Unknown Part",
          available: 0,
          required: part.quantity,
        });
      } else if (partData.stockQuantity < part.quantity) {
        unavailableParts.push({
          partId: part.partId,
          partName: partData.partName,
          available: partData.stockQuantity,
          required: part.quantity,
        });
      }
    }

    return {
      available: unavailableParts.length === 0,
      unavailableParts,
    };
  }
}

export const jobCardPartsRequestService = new JobCardPartsRequestService();

