/**
 * Job Card Inventory Types
 */

export type PartsRequestStatus = "pending" | "approved" | "rejected";

export interface JobCardPartsRequest {
  id: string;
  jobCardId: string;
  vehicleId?: string;
  vehicleNumber?: string;
  customerName?: string;
  requestedBy: string;
  requestedAt: string;
  status: PartsRequestStatus;
  parts: Array<{
    partId: string;
    partName: string;
    quantity: number;
    serialNumber?: string; // Serial number for warranty parts
    isWarranty?: boolean; // Flag to indicate if this is a warranty part
  }>;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  notes?: string;
  // Approval workflow fields
  scManagerApproved?: boolean;
  scManagerApprovedBy?: string;
  scManagerApprovedAt?: string;
  inventoryManagerAssigned?: boolean;
  inventoryManagerAssignedBy?: string;
  inventoryManagerAssignedAt?: string;
  assignedEngineer?: string;
}

