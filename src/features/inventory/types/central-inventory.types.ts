/**
 * Central Inventory Type Definitions
 */

/**
 * Central Stock Schema
 */
export interface CentralStock {
  id: string;
  partId: string;
  partName: string;
  partNumber: string;
  sku: string;
  partCode?: string;
  category: string;
  currentQty: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  costPrice: number;
  supplier: string;
  location: string;
  warehouse: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lastUpdated: string;
  lastUpdatedBy: string;
  notes?: string;
}

/**
 * Purchase Order Status
 */
export type PurchaseOrderStatus = "pending" | "approved" | "rejected" | "partially_fulfilled" | "fulfilled";

/**
 * Purchase Order Priority
 */
export type PurchaseOrderPriority = "low" | "normal" | "high" | "urgent";

/**
 * Purchase Order Item
 */
export interface PurchaseOrderItem {
  id: string;
  partId: string;
  partName: string;
  partNumber: string;
  sku: string;
  partCode?: string;
  requestedQty: number;
  approvedQty?: number;
  issuedQty?: number;
  unitPrice: number;
  totalPrice: number;
  status: "pending" | "approved" | "rejected" | "issued";
  notes?: string;
}

/**
 * Purchase Order from Service Center to Central
 */
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  serviceCenterId: string;
  serviceCenterName: string;
  requestedBy: string;
  requestedByEmail?: string;
  requestedAt: string;
  status: PurchaseOrderStatus;
  priority: PurchaseOrderPriority;
  items: PurchaseOrderItem[];
  totalAmount: number;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  fulfilledBy?: string;
  fulfilledAt?: string;
  notes?: string;
  jobCardId?: string;
  vehicleNumber?: string;
  customerName?: string;
}

/**
 * Parts Issue from Central to Service Center
 */
export interface PartsIssue {
  id: string;
  issueNumber: string;
  serviceCenterId: string;
  serviceCenterName: string;
  issuedBy: string;
  issuedAt: string;
  status: "pending" | "pending_admin_approval" | "admin_approved" | "admin_rejected" | "issued" | "received" | "cancelled";
  items: Array<{
    id: string;
    partId: string;
    partName: string;
    partNumber: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    fromStock: string; // Central stock ID
  }>;
  totalAmount: number;
  purchaseOrderId?: string;
  receivedBy?: string;
  receivedAt?: string;
  notes?: string;
  transportDetails?: {
    transporter?: string;
    trackingNumber?: string;
    expectedDelivery?: string;
  };
  // Admin approval fields
  sentToAdmin?: boolean;
  sentToAdminAt?: string;
  adminApproved?: boolean;
  adminApprovedBy?: string;
  adminApprovedAt?: string;
  adminRejected?: boolean;
  adminRejectedBy?: string;
  adminRejectedAt?: string;
  adminRejectionReason?: string;
}

/**
 * Stock Update/Adjustment
 */
export interface StockAdjustment {
  id: string;
  stockId: string;
  partId: string;
  partName: string;
  adjustmentType: "add" | "remove" | "adjust" | "transfer";
  quantity: number;
  previousQty: number;
  newQty: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: string;
  notes?: string;
  referenceNumber?: string; // PO number, issue number, etc.
}

/**
 * Central Inventory Dashboard Stats
 */
export interface CentralInventoryStats {
  totalParts: number;
  totalStockValue: number;
  lowStockParts: number;
  outOfStockParts: number;
  pendingPurchaseOrders: number;
  approvedPurchaseOrders: number;
  pendingIssues: number;
  totalServiceCenters: number;
  recentActivity: number;
}

/**
 * Purchase Order Form Data
 */
export interface PurchaseOrderFormData {
  serviceCenterId: string;
  priority: PurchaseOrderPriority;
  items: Array<{
    partId: string;
    quantity: number;
    notes?: string;
  }>;
  notes?: string;
  jobCardId?: string;
}

/**
 * Stock Update Form Data
 */
export interface StockUpdateFormData {
  partId: string;
  adjustmentType: "add" | "remove" | "adjust";
  quantity: number;
  reason: string;
  notes?: string;
  referenceNumber?: string;
}

/**
 * Parts Issue Form Data
 */
export interface PartsIssueFormData {
  serviceCenterId: string;
  purchaseOrderId?: string;
  items: Array<{
    partId: string;
    quantity: number;
    fromStock: string;
  }>;
  notes?: string;
  transportDetails?: {
    transporter?: string;
    trackingNumber?: string;
    expectedDelivery?: string;
  };
}

/**
 * Service Center Info for Central Inventory
 */
export interface ServiceCenterInfo {
  id: string;
  name: string;
  location?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  active: boolean;
}

