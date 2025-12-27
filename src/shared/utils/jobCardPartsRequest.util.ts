/**
 * Utility functions for creating parts requests from job cards
 * Stubbed after removal of localStorage based jobCardPartsRequestService
 */

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

  // Stub implementation
  console.log("Parts Request Creation from Job Card Stubbed. Backend should handle parts allocation or separate API call needed.", {
    jobCardId: jobCard.id,
    parts: jobCard.parts,
    requestedBy
  });
}
