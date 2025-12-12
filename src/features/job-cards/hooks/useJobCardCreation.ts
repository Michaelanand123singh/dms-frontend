/**
 * Hook for job card creation from quotation
 */

import { useState, useCallback } from "react";
import { jobCardService } from "@/features/job-cards/services/jobCard.service";
import type { JobCard } from "@/shared/types/job-card.types";

export function useJobCardCreation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFromQuotation = useCallback(
    async (quotationId: string, engineerId?: string): Promise<JobCard | null> => {
      setLoading(true);
      setError(null);

      try {
        const jobCard = await jobCardService.createFromQuotation(quotationId, engineerId);
        return jobCard;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create job card";
        setError(errorMessage);
        console.error("Error creating job card from quotation:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const assignEngineer = useCallback(
    async (jobCardId: string, engineerId: string, engineerName: string): Promise<JobCard | null> => {
      setLoading(true);
      setError(null);

      try {
        const jobCard = await jobCardService.assignEngineer(jobCardId, engineerId, engineerName);
        return jobCard;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to assign engineer";
        setError(errorMessage);
        console.error("Error assigning engineer:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createFromQuotation,
    assignEngineer,
    loading,
    error,
  };
}

