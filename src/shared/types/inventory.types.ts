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

