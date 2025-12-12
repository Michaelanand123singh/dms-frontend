/**
 * Utility functions for creating parts requests from job cards
 */

import { jobCardPartsRequestService } from "@/features/inventory/services/jobCardPartsRequest.service";
import { partsMasterService } from "@/features/inventory/services/partsMaster.service";
import type { JobCard } from "@/shared/types/job-card.types";

/**
 * Create parts request from job card when parts are selected
 * This is called automatically when SC Manager creates a job card with parts
 * @param jobCard - The job card that was created
 * @param requestedBy - Name/ID of the person requesting (e.g., "SC Manager - Pune Phase 1")
 */
export async function createPartsRequestFromJobCard(
  jobCard: JobCard,
  requestedBy: string
): Promise<void> {
  // If no parts selected, don't create a request
  if (!jobCard.parts || jobCard.parts.length === 0) {
    return;
  }

  try {
    // Get all parts from master to map names to IDs
    const allParts = await partsMasterService.getAll();
    
    // Map part names to part IDs and quantities
    const partsWithDetails = jobCard.parts
      .map((partName) => {
        // Find part by name (case-insensitive)
        const part = allParts.find(
          (p) => p.partName.toLowerCase() === partName.toLowerCase()
        );
        
        if (part) {
          return {
            partId: part.id,
            partName: part.partName,
            quantity: 1, // Default quantity, can be enhanced later
          };
        }
        
        // If part not found in master, still create request with name
        return {
          partId: `unknown-${partName.replace(/\s+/g, "-").toLowerCase()}`,
          partName: partName,
          quantity: 1,
        };
      })
      .filter((p) => p !== null);

    // Create the parts request
    if (partsWithDetails.length > 0) {
      await jobCardPartsRequestService.createRequestFromJobCard(
        jobCard,
        partsWithDetails,
        requestedBy
      );
    }
  } catch (error) {
    console.error("Failed to create parts request from job card:", error);
    // Don't throw - job card creation should still succeed even if parts request fails
  }
}

