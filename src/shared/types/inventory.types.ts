/**
 * Inventory Type Definitions
 */

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";
export type FilterType = "all" | "low_stock" | "out_of_stock";

export interface InventoryItem {
  id: number;
  partName: string;
  hsnCode: string; // HSN Code
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
 * Updated with new parameters from image
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
  // New fields from image
  oemPartNumber?: string;
  originType?: string; // OLD/NEW
  purchasePrice?: string;
  // Basic Part Info
  brandName?: string;
  variant?: string;
  partType?: string; // PANEL, etc.
  color?: string;
  // GST and Pricing
  gstAmount?: string;
  gstRateInput?: string;
  pricePreGst?: string;
  gstRateOutput?: string;
  // Labour Information
  estimatedLabour?: string;
  estimatedLabourWorkTime?: string; // Format like "0.3M"
  labourRate?: string;
  labourGstRate?: string;
  labourPrice?: string;
  // Calculated Totals
  gstInput?: string;
  totalPrice?: string;
  totalGst?: string;
  // High Value Part
  highValuePart?: boolean;
  // Optional
  centerId?: string;
  // Legacy fields for backward compatibility (deprecated)
  status?: "In Stock" | "Low Stock" | "Out of Stock";
}

/**
 * Part Form Data for create/update
 * Updated with new parameters from image
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
  // New fields from image
  oemPartNumber?: string;
  originType?: string; // OLD/NEW
  purchasePrice?: string;
  // Basic Part Info
  brandName?: string;
  variant?: string;
  partType?: string; // PANEL, etc.
  color?: string;
  // GST and Pricing
  gstAmount?: string;
  gstRateInput?: string;
  pricePreGst?: string;
  gstRateOutput?: string;
  // Labour Information
  estimatedLabour?: string;
  estimatedLabourWorkTime?: string; // Format like "0.3M"
  labourRate?: string;
  labourGstRate?: string;
  labourPrice?: string;
  // Calculated Totals
  gstInput?: string;
  totalPrice?: string;
  totalGst?: string;
  // High Value Part
  highValuePart?: boolean;
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

