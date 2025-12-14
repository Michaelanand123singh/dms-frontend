/**
 * Inventory Type Definitions
 */

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";
export type FilterType = "all" | "low_stock" | "out_of_stock";

export interface InventoryItem {
  id: number;
  partName: string;
  sku: string;
  partCode?: string;
  category: string;
  currentQty: number;
  minStock: number;
  unitPrice: string;
  costPrice: string;
  supplier: string;
  location: string;
  status: StockStatus;
}

export interface StockIndicator {
  color: string;
  text: string;
}

/**
 * Part Master - Complete part information
 */
export interface Part {
  id: string;
  partId: string; // Required - auto-generated if not provided
  partName: string; // Required
  partNumber: string; // Required - can be empty string
  category: string; // Required - can be empty string
  price: number;
  description?: string;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
  // Extended fields from form
  sku?: string;
  partCode?: string;
  status?: "In Stock" | "Low Stock" | "Out of Stock";
  // Basic Part Info
  brandName?: string;
  variant?: string;
  partType?: "NEW" | "OLD";
  color?: string;
  // Purchase (Incoming)
  preGstAmountToUs?: string;
  gstRateInput?: string;
  gstInputAmount?: string;
  postGstAmountToUs?: string;
  // Sale (Outgoing)
  salePricePreGst?: string;
  gstRateOutput?: string;
  gstOutputAmount?: string;
  postGstSaleAmount?: string;
  // Labour Association
  associatedLabourName?: string;
  associatedLabourCode?: string;
  workTime?: string;
  labourRate?: string;
  labourGstRate?: string;
  labourGstAmount?: string;
  labourPostGstAmount?: string;
  // High Value Part
  highValuePart?: boolean;
  partSerialNumber?: string;
  // Optional
  centerId?: string;
}

/**
 * Part Form Data for create/update
 */
export interface PartFormData {
  partId?: string;
  partName: string; // Only partName is required
  partNumber?: string;
  category?: string;
  price?: number;
  description?: string;
  minStockLevel?: number;
  unit?: string;
  // Extended fields
  sku?: string;
  partCode?: string;
  status?: "In Stock" | "Low Stock" | "Out of Stock";
  // Basic Part Info
  brandName?: string;
  variant?: string;
  partType?: "NEW" | "OLD";
  color?: string;
  // Purchase (Incoming)
  preGstAmountToUs?: string;
  gstRateInput?: string;
  gstInputAmount?: string;
  postGstAmountToUs?: string;
  // Sale (Outgoing)
  salePricePreGst?: string;
  gstRateOutput?: string;
  gstOutputAmount?: string;
  postGstSaleAmount?: string;
  // Labour Association
  associatedLabourName?: string;
  associatedLabourCode?: string;
  workTime?: string;
  labourRate?: string;
  labourGstRate?: string;
  labourGstAmount?: string;
  labourPostGstAmount?: string;
  // High Value Part
  highValuePart?: boolean;
  partSerialNumber?: string;
  // Optional
  centerId?: string;
}

/**
 * Parts Order Form Data
 */
export interface PartsOrderFormData {
  partId: string;
  requiredQty: number;
  urgency: "low" | "medium" | "high";
  notes?: string;
}

/**
 * Inventory Statistics
 */
export interface InventoryStats {
  totalParts: number;
  lowStockParts: number;
  outOfStockParts: number;
  totalValue: number;
  pendingOrders: number;
  recentEntries: number;
}

