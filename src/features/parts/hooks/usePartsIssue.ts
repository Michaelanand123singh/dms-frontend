/**
 * Hook for parts issue operations
 */

import { useState, useCallback } from "react";
import { partsIssueService } from "@/features/parts/services/partsIssue.service";
import type { PartsIssue, PartsIssueRequest, PartsIssueResponse } from "@/shared/types/parts-issue.types";

export function usePartsIssue() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const issueParts = useCallback(
    async (data: PartsIssueRequest): Promise<PartsIssueResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await partsIssueService.createIssue(data);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to issue parts";
        setError(errorMessage);
        console.error("Error issuing parts:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getByJobCard = useCallback(
    async (jobCardId: string): Promise<PartsIssue[]> => {
      try {
        return await partsIssueService.getByJobCard(jobCardId);
      } catch (err) {
        console.error("Error fetching parts issues:", err);
        return [];
      }
    },
    []
  );

  return {
    issueParts,
    getByJobCard,
    loading,
    error,
  };
}

