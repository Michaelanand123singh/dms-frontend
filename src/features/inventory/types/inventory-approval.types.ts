/**
 * Inventory Approval Type Definitions
 */

export interface InventoryApproval {
  id: string;
  quotationId?: string;
  items: Array<{
    partName: string;
    partNumber: string;
    quantity: number;
  }>;
  status: InventoryApprovalStatus;
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

export type InventoryApprovalStatus = "pending" | "approved" | "rejected";

