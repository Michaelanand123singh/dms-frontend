/**
 * Inventory Type Definitions
 */

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";
export type FilterType = "all" | "low_stock" | "out_of_stock";

export interface InventoryItem {
  id: string | number;

  // Basic Part Information
  oemPartNumber?: string;
  partName: string;
  partNumber?: string;
  partCode?: string;
  originType?: string;
  category: string;
  description?: string;
  hsnCode?: string; // Legacy alias for oemPartNumber

  // Stock Information
  currentQty: number;
  stockQuantity?: number;
  minStock: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  unit?: string;
  location: string;

  // Part Details
  brandName?: string;
  variant?: string;
  partType?: string;
  color?: string;

  // Pricing - Purchase
  costPrice: string | number;
  pricePreGst?: number;
  gstRateInput?: number;
  gstInput?: number;

  // Pricing - Sale
  unitPrice: string | number;
  gstRate?: number;
  gstRateOutput?: number;
  totalPrice?: number;
  totalGst?: number;

  // Labour Information
  labourName?: string;
  labourCode?: string;
  labourWorkTime?: string;
  labourRate?: number;
  labourGstRate?: number;
  labourPrice?: number;

  // Flags
  highValuePart?: boolean;

  // Legacy fields
  supplier?: string;
  status: StockStatus;
}

export interface StockIndicator {
  color: string;
  text: string;
}

/**
 * Part Master - Complete part information
 * Matches the backend Inventory model
 */
export interface Part {
  id: string;
  serviceCenterId?: string;

  // Basic Part Information
  oemPartNumber?: string;    // OEM Part Number (e.g., 2W_000000000272_003)
  partName: string;          // Part Name
  partNumber: string;        // Internal Part Number
  partId?: string;           // Legacy alias for partNumber
  originType?: string;       // OLD/NEW
  category: string;          // Category (e.g., BODY PANEL)
  description?: string;      // Description

  // Stock Information
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel?: number;
  unit?: string;             // Unit of measurement
  location?: string;         // Storage location

  // Part Details
  brandName?: string;        // Brand Name (e.g., OLA ELECTRIC)
  variant?: string;          // Variant (e.g., S1 PRO, S1)
  partType?: string;         // Part Type (e.g., PANEL)
  color?: string;            // Color (e.g., ANTHRACITE)

  // Pricing - Purchase
  costPrice?: number;        // Purchase Price
  pricePreGst?: number;      // Pre GST Amount To Us
  gstRateInput?: number;     // GST Rate Input %
  gstInput?: number;         // GST Input Amount

  // Pricing - Sale
  price?: number;            // Legacy alias for unitPrice
  unitPrice?: number;        // Sale Price Pre GST
  gstRate?: number;          // GST Rate Output %
  gstRateOutput?: number;    // GST Rate Output Amount
  totalPrice?: number;       // Total Price including GST
  totalGst?: number;         // Total GST Amount

  // Labour Information
  labourName?: string;       // Associated Labour Name
  labourCode?: string;       // Associated Labour Code
  labourWorkTime?: string;   // Work Time (e.g., 0.3M)
  labourRate?: number;       // Labour Rate
  labourGstRate?: number;    // Labour GST Rate %
  labourPrice?: number;      // Labour Price including GST

  // Flags
  highValuePart?: boolean;   // High Value Part (YES/NO)

  // Legacy/Status
  status?: StockStatus;     // Computed status
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Part Form Data for create/update
 * Matches the backend CreateInventoryPartDto
 */
export interface PartFormData {
  // Basic Part Information
  oemPartNumber?: string;
  partName: string;          // Required
  partNumber?: string;
  partId?: string;
  originType?: string;
  category?: string;
  description?: string;

  // Stock Information
  stockQuantity?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  unit?: string;
  location?: string;

  // Part Details
  brandName?: string;
  variant?: string;
  partType?: string;
  color?: string;

  // Pricing - Purchase
  costPrice?: number;
  pricePreGst?: number;
  gstRateInput?: number;
  gstInput?: number;

  // Pricing - Sale
  price?: number;
  unitPrice?: number;
  gstRate?: number;
  gstRateOutput?: number;
  totalPrice?: number;
  totalGst?: number;

  // Labour Information
  labourName?: string;
  labourCode?: string;
  labourWorkTime?: string;
  labourRate?: number;
  labourGstRate?: number;
  labourPrice?: number;

  // Flags
  highValuePart?: boolean;

  // Service Center
  serviceCenterId?: string;
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

