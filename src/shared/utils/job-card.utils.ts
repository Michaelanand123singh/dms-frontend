/**
 * Job Card utilities for number generation and sequence management
 */

import type { JobCard } from "@/shared/types/job-card.types";
import { getServiceCenterCode } from "./service-center.utils";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";

/**
 * Get next sequence number for job card generation
 * @param existingJobCards - Array of existing job cards
 * @param serviceCenterCode - Service center code (e.g., "SC001")
 * @param year - Year (e.g., 2025)
 * @param month - Month as string with leading zero (e.g., "01")
 * @returns Next sequence number
 */
export function getNextSequenceNumber(
  existingJobCards: JobCard[],
  serviceCenterCode: string,
  year: number,
  month: string
): number {
  const prefix = `${serviceCenterCode}-${year}-${month}`;
  const lastJobCard = existingJobCards
    .filter((jc) => jc.jobCardNumber?.startsWith(prefix))
    .sort((a, b) => {
      const aSeq = parseInt(a.jobCardNumber?.split("-")[3] || "0");
      const bSeq = parseInt(b.jobCardNumber?.split("-")[3] || "0");
      return bSeq - aSeq;
    })[0];

  return lastJobCard
    ? parseInt(lastJobCard.jobCardNumber?.split("-")[3] || "0") + 1
    : 1;
}

/**
 * Generate job card number in format: SC001-YYYY-MM-####
 * @param serviceCenterId - Service center ID (string or number)
 * @param existingJobCards - Optional array of existing job cards (if not provided, reads from localStorage)
 * @returns Generated job card number
 */
export function generateJobCardNumber(
  serviceCenterId: string | number,
  existingJobCards?: JobCard[]
): string {
  const serviceCenterCode = getServiceCenterCode(serviceCenterId);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  // Get existing job cards if not provided
  const jobCards =
    existingJobCards || safeStorage.getItem<JobCard[]>("jobCards", []);

  const nextSequence = getNextSequenceNumber(
    jobCards,
    serviceCenterCode,
    year,
    month
  );

  return `${serviceCenterCode}-${year}-${month}-${String(nextSequence).padStart(4, "0")}`;
}

