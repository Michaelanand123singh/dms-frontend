/**
 * Parts Issue Service - Business logic layer for parts issue operations
 */

import { apiClient } from "@/core/api";
import type { PartsIssue, PartsIssueRequest, PartsIssueResponse } from "@/shared/types/parts-issue.types";

class PartsIssueService {

  async createIssue(data: PartsIssueRequest): Promise<PartsIssueResponse> {
    const response = await apiClient.post<PartsIssueResponse>("/parts/issues", data);
    return response.data;
  }

  async getByJobCard(jobCardId: string): Promise<PartsIssue[]> {
    const response = await apiClient.get<PartsIssue[]>(`/parts/issues/by-job-card/${jobCardId}`);
    return response.data;
  }
}

export const partsIssueService = new PartsIssueService();

