/**
 * Central Issue Service - Business logic layer for parts issue operations
 */

import { apiClient, mockApiClient, ApiError } from "@/lib/api";
import { API_CONFIG } from "@/config/api.config";
import { centralInventoryRepository } from "@/__mocks__/repositories/central-inventory.repository";
import type { ApiRequestConfig } from "@/lib/api/types";
import type {
  PartsIssue,
  PartsIssueFormData,
} from "@/shared/types/central-inventory.types";

class CentralIssueService {
  private useMock: boolean;

  constructor() {
    this.useMock = API_CONFIG.USE_MOCK;
    this.setupMockEndpoints();
  }

  private setupMockEndpoints(): void {
    if (!this.useMock) return;

    // POST /central-inventory/issues
    mockApiClient.registerMock(
      "/central-inventory/issues",
      "POST",
      async (config: ApiRequestConfig) => {
        const data = config.body as { formData: PartsIssueFormData; issuedBy: string };
        if (!data.formData || !data.issuedBy) {
          throw new ApiError("Form data and issuedBy are required", 400, "VALIDATION_ERROR");
        }
        const result = await centralInventoryRepository.createPartsIssue(
          data.formData,
          data.issuedBy
        );
        return result;
      }
    );

    // GET /central-inventory/issues
    mockApiClient.registerMock(
      "/central-inventory/issues",
      "GET",
      async (config: ApiRequestConfig) => {
        const issues = await centralInventoryRepository.getAllPartsIssues();
        return issues;
      }
    );

    // GET /central-inventory/issues/:id
    mockApiClient.registerMock(
      "/central-inventory/issues/:id",
      "GET",
      async (config: ApiRequestConfig) => {
        const url = config.url || "";
        const match = url.match(/\/central-inventory\/issues\/([^/?]+)/);
        const id = match ? match[1] : "";
        if (!id) {
          throw new ApiError("Issue ID is required", 400, "VALIDATION_ERROR");
        }
        const issue = await centralInventoryRepository.getPartsIssueById(id);
        if (!issue) {
          throw new ApiError("Issue not found", 404, "NOT_FOUND");
        }
        return issue;
      }
    );

    // GET /central-inventory/issues/by-service-center/:serviceCenterId
    mockApiClient.registerMock(
      "/central-inventory/issues/by-service-center/:serviceCenterId",
      "GET",
      async (config: ApiRequestConfig) => {
        const url = config.url || "";
        const match = url.match(/\/central-inventory\/issues\/by-service-center\/([^/?]+)/);
        const serviceCenterId = match ? match[1] : "";
        if (!serviceCenterId) {
          throw new ApiError("Service center ID is required", 400, "VALIDATION_ERROR");
        }
        const issues = await centralInventoryRepository.getPartsIssuesByServiceCenter(serviceCenterId);
        return issues;
      }
    );
  }

  async issuePartsToServiceCenter(
    formData: PartsIssueFormData,
    issuedBy: string
  ): Promise<{ issue: PartsIssue; stockUpdates: any[] }> {
    if (this.useMock) {
      return await centralInventoryRepository.createPartsIssue(formData, issuedBy);
    }
    const response = await apiClient.post<{ issue: PartsIssue; stockUpdates: any[] }>(
      "/central-inventory/issues",
      {
        formData,
        issuedBy,
      }
    );
    return response.data;
  }

  async getIssueHistory(): Promise<PartsIssue[]> {
    if (this.useMock) {
      return await centralInventoryRepository.getAllPartsIssues();
    }
    const response = await apiClient.get<PartsIssue[]>("/central-inventory/issues");
    return response.data;
  }

  async getIssueById(id: string): Promise<PartsIssue> {
    if (this.useMock) {
      const issue = await centralInventoryRepository.getPartsIssueById(id);
      if (!issue) {
        throw new ApiError("Issue not found", 404, "NOT_FOUND");
      }
      return issue;
    }
    const response = await apiClient.get<PartsIssue>(`/central-inventory/issues/${id}`);
    return response.data;
  }

  async getIssuesByServiceCenter(serviceCenterId: string): Promise<PartsIssue[]> {
    if (this.useMock) {
      return await centralInventoryRepository.getPartsIssuesByServiceCenter(serviceCenterId);
    }
    const response = await apiClient.get<PartsIssue[]>(
      `/central-inventory/issues/by-service-center/${serviceCenterId}`
    );
    return response.data;
  }
}

export const centralIssueService = new CentralIssueService();

