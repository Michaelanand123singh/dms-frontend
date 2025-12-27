import { apiClient } from "@/core/api";

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
  async getAll(): Promise<InventoryApproval[]> {
    const response = await apiClient.get<InventoryApproval[]>("/inventory/approvals");
    return response.data;
  }

  async getPending(): Promise<InventoryApproval[]> {
    const response = await apiClient.get<InventoryApproval[]>("/inventory/approvals/pending");
    return response.data;
  }

  async createRequest(data: InventoryApprovalRequest): Promise<InventoryApprovalResponse> {
    const response = await apiClient.post<InventoryApprovalResponse>("/inventory/approvals", data);
    return response.data;
  }

  async approve(approvalId: string): Promise<InventoryApproval> {
    const response = await apiClient.post<InventoryApproval>(`/inventory/approvals/${approvalId}/approve`);
    return response.data;
  }

  async reject(approvalId: string, reason?: string): Promise<InventoryApproval> {
    const response = await apiClient.post<InventoryApproval>(`/inventory/approvals/${approvalId}/reject`, {
      reason,
    });
    return response.data;
  }
}

export const inventoryApprovalService = new InventoryApprovalService();
