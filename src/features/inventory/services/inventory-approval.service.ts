/**
 * Inventory Approval Service - Business logic layer for inventory approval operations
 */

import { apiClient, mockApiClient, ApiError } from "@/core/api";
import { API_CONFIG } from "@/config/api.config";
import type { ApiRequestConfig } from "@/core/api";

// Type definitions for inventory approval
export interface InventoryApproval {
  id: string;
  quotationId?: string;
  items: Array<{
    partName: string;
    partNumber: string;
    quantity: number;
  }>;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryApprovalRequest {
  quotationId?: string;
  items: Array<{
    partName: string;
    partNumber: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface InventoryApprovalResponse {
  success: boolean;
  approvalId: string;
  message?: string;
}

class InventoryApprovalService {
  private useMock: boolean;

  constructor() {
    this.useMock = API_CONFIG.USE_MOCK;
    this.setupMockEndpoints();
  }

  private setupMockEndpoints(): void {
    if (!this.useMock) return;

    mockApiClient.registerMock("/inventory/approvals", "GET", async () => {
      return [];
    });

    mockApiClient.registerMock("/inventory/approvals", "POST", async (config: ApiRequestConfig) => {
      const data = config.body as InventoryApprovalRequest;
      return {
        success: true,
        approvalId: `ia_${Date.now()}`,
        message: "Approval request created successfully",
      };
    });

    mockApiClient.registerMock("/inventory/approvals/pending", "GET", async () => {
      return [];
    });

    mockApiClient.registerMock("/inventory/approvals/:id/approve", "POST", async (config: ApiRequestConfig) => {
      const url = config.url || "";
      const match = url.match(/\/inventory\/approvals\/([^/?]+)\/approve/);
      const approvalId = match ? match[1] : "";
      return {
        id: approvalId,
        status: "approved",
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
      };
    });

    mockApiClient.registerMock("/inventory/approvals/:id/reject", "POST", async (config: ApiRequestConfig) => {
      const url = config.url || "";
      const match = url.match(/\/inventory\/approvals\/([^/?]+)\/reject/);
      const approvalId = match ? match[1] : "";
      const body = config.body as { reason?: string };
      return {
        id: approvalId,
        status: "rejected",
        rejectionReason: body.reason,
        rejectedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
      };
    });
  }

  async getAll(): Promise<InventoryApproval[]> {
    if (this.useMock) {
      return [];
    }
    const response = await apiClient.get<InventoryApproval[]>("/inventory/approvals");
    return response.data;
  }

  async getPending(): Promise<InventoryApproval[]> {
    if (this.useMock) {
      return [];
    }
    const response = await apiClient.get<InventoryApproval[]>("/inventory/approvals/pending");
    return response.data;
  }

  async createRequest(data: InventoryApprovalRequest): Promise<InventoryApprovalResponse> {
    if (this.useMock) {
      return {
        success: true,
        approvalId: `ia_${Date.now()}`,
        message: "Approval request created successfully",
      };
    }
    const response = await apiClient.post<InventoryApprovalResponse>("/inventory/approvals", data);
    return response.data;
  }

  async approve(approvalId: string): Promise<InventoryApproval> {
    if (this.useMock) {
      return {
        id: approvalId,
        status: "approved",
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
      };
    }
    const response = await apiClient.post<InventoryApproval>(`/inventory/approvals/${approvalId}/approve`);
    return response.data;
  }

  async reject(approvalId: string, reason?: string): Promise<InventoryApproval> {
    if (this.useMock) {
      return {
        id: approvalId,
        status: "rejected",
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
      };
    }
    const response = await apiClient.post<InventoryApproval>(`/inventory/approvals/${approvalId}/reject`, {
      reason,
    });
    return response.data;
  }
}

export const inventoryApprovalService = new InventoryApprovalService();

