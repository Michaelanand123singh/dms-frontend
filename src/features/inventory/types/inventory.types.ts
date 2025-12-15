/**
 * Inventory Type Definitions
 */

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";
export type FilterType = "all" | "low_stock" | "out_of_stock";

export interface InventoryItem {
  id: number;
  partName: string;
  hsnCode: string;
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
  partId: string;
  partName: string;
  partNumber: string;
  category: string;
  price: number;
  description?: string;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Part Form Data for create/update
 */
export interface PartFormData {
  partId: string;
  partName: string;
  partNumber: string;
  category: string;
  price: number;
  description?: string;
  minStockLevel: number;
  unit: string;
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

