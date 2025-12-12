/**
 * Job Card Service - Business logic layer for job card operations
 */

import { apiClient, mockApiClient, ApiError } from "@/core/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { API_CONFIG } from "@/config/api.config";
import type { JobCard } from "@/shared/types/job-card.types";
import type { ApiRequestConfig } from "@/core/api";

class JobCardService {
  private useMock: boolean;

  constructor() {
    this.useMock = API_CONFIG.USE_MOCK;
    this.setupMockEndpoints();
  }

  private setupMockEndpoints(): void {
    if (!this.useMock) return;

    mockApiClient.registerMock("/job-cards/:id/from-quotation", "POST", async (config: ApiRequestConfig) => {
      const url = config.url || "";
      const match = url.match(/\/job-cards\/([^/?]+)\/from-quotation/);
      const quotationId = match ? match[1] : "";
      if (!quotationId) {
        throw new ApiError("Quotation ID is required", 400, "VALIDATION_ERROR");
      }
      const body = config.body as { engineerId?: string };
      return {
        id: `jc_${Date.now()}`,
        jobCardNumber: `JC-${Date.now()}`,
        serviceCenterId: "",
        customerId: "",
        customerName: "",
        vehicle: "",
        registration: "",
        serviceType: "",
        description: "",
        status: "Created",
        priority: "Normal",
        assignedEngineer: body.engineerId || null,
        estimatedCost: "0",
        estimatedTime: "0",
        parts: [],
        location: "Station",
        quotationId,
        createdAt: new Date().toISOString(),
      };
    });

    mockApiClient.registerMock("/job-cards/:id/assign-engineer", "PATCH", async (config: ApiRequestConfig) => {
      const url = config.url || "";
      const match = url.match(/\/job-cards\/([^/?]+)\/assign-engineer/);
      const jobCardId = match ? match[1] : "";
      if (!jobCardId) {
        throw new ApiError("Job Card ID is required", 400, "VALIDATION_ERROR");
      }
      const body = config.body as { engineerId: string; engineerName: string };
      return {
        id: jobCardId,
        jobCardNumber: `JC-${jobCardId}`,
        serviceCenterId: "",
        customerId: "",
        customerName: "",
        vehicle: "",
        registration: "",
        serviceType: "",
        description: "",
        status: "Assigned",
        priority: "Normal",
        assignedEngineer: body.engineerId,
        estimatedCost: "0",
        estimatedTime: "0",
        parts: [],
        location: "Station",
        createdAt: new Date().toISOString(),
      };
    });
  }

  async createFromQuotation(quotationId: string, engineerId?: string): Promise<JobCard> {
    if (this.useMock) {
      return {
        id: `jc_${Date.now()}`,
        jobCardNumber: `JC-${Date.now()}`,
        serviceCenterId: "",
        customerId: "",
        customerName: "",
        vehicle: "",
        registration: "",
        serviceType: "",
        description: "",
        status: "Created",
        priority: "Normal",
        assignedEngineer: engineerId || null,
        estimatedCost: "0",
        estimatedTime: "0",
        parts: [],
        location: "Station",
        quotationId,
        createdAt: new Date().toISOString(),
      };
    }
    const response = await apiClient.post<JobCard>(`${API_ENDPOINTS.JOB_CARD(quotationId)}/from-quotation`, {
      engineerId,
    });
    return response.data;
  }

  async assignEngineer(jobCardId: string, engineerId: string, engineerName: string): Promise<JobCard> {
    if (this.useMock) {
      return {
        id: jobCardId,
        jobCardNumber: `JC-${jobCardId}`,
        serviceCenterId: "",
        customerId: "",
        customerName: "",
        vehicle: "",
        registration: "",
        serviceType: "",
        description: "",
        status: "Assigned",
        priority: "Normal",
        assignedEngineer: engineerId,
        estimatedCost: "0",
        estimatedTime: "0",
        parts: [],
        location: "Station",
        createdAt: new Date().toISOString(),
      };
    }
    const response = await apiClient.patch<JobCard>(`${API_ENDPOINTS.JOB_CARD(jobCardId)}/assign-engineer`, {
      engineerId,
      engineerName,
    });
    return response.data;
  }
}

export const jobCardService = new JobCardService();

