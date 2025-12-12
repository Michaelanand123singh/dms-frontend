/**
 * Parts Issue Service - Business logic layer for parts issue operations
 */

import { apiClient, mockApiClient, ApiError } from "@/core/api";
import { API_CONFIG } from "@/config/api.config";
import type { ApiRequestConfig } from "@/core/api";
import type { PartsIssue, PartsIssueRequest, PartsIssueResponse } from "@/shared/types/parts-issue.types";

class PartsIssueService {
  private useMock: boolean;

  constructor() {
    this.useMock = API_CONFIG.USE_MOCK;
    this.setupMockEndpoints();
  }

  private setupMockEndpoints(): void {
    if (!this.useMock) return;

    mockApiClient.registerMock("/parts/issues", "POST", async (config: ApiRequestConfig) => {
      const data = config.body as PartsIssueRequest;
      return {
        success: true,
        issueId: `pi_${Date.now()}`,
        message: "Parts issue created successfully",
      };
    });

    mockApiClient.registerMock("/parts/issues/by-job-card/:jobCardId", "GET", async (config: ApiRequestConfig) => {
      const url = config.url || "";
      const match = url.match(/\/parts\/issues\/by-job-card\/([^/?]+)/);
      const jobCardId = match ? match[1] : "";
      return [];
    });
  }

  async createIssue(data: PartsIssueRequest): Promise<PartsIssueResponse> {
    if (this.useMock) {
      return {
        success: true,
        issueId: `pi_${Date.now()}`,
        message: "Parts issue created successfully",
      };
    }
    const response = await apiClient.post<PartsIssueResponse>("/parts/issues", data);
    return response.data;
  }

  async getByJobCard(jobCardId: string): Promise<PartsIssue[]> {
    if (this.useMock) {
      return [];
    }
    const response = await apiClient.get<PartsIssue[]>(`/parts/issues/by-job-card/${jobCardId}`);
    return response.data;
  }
}

export const partsIssueService = new PartsIssueService();

