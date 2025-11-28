/**
 * Mock data for Inventory
 */

export interface InventoryItem {
  id: number;
  partName: string;
  sku: string;
  partCode?: string;
  category: string;
  quantity: number;
  price: string;
  status: "In Stock" | "Low Stock";
  centerId?: number;
  centerName?: string;
}

export const defaultInventoryData: InventoryItem[] = [
  {
    id: 1,
    partName: "Engine Oil 5L",
    sku: "EO-5L-001",
    category: "Fluids",
    quantity: 45,
    price: "₹450",
    status: "In Stock",
    centerId: 1,
    centerName: "Delhi Central Hub",
  },
  {
    id: 2,
    partName: "Air Filter",
    sku: "AF-001",
    category: "Filters",
    quantity: 12,
    price: "₹250",
    status: "In Stock",
    centerId: 1,
    centerName: "Delhi Central Hub",
  },
  {
    id: 3,
    partName: "Spark Plugs (Set of 4)",
    sku: "SP-4-001",
    category: "Ignition",
    quantity: 15,
    price: "₹600",
    status: "In Stock",
    centerId: 2,
    centerName: "Mumbai Metroplex",
  },
  {
    id: 4,
    partName: "Brake Pads",
    sku: "BP-001",
    category: "Brakes",
    quantity: 8,
    price: "₹1200",
    status: "In Stock",
    centerId: 2,
    centerName: "Mumbai Metroplex",
  },
  {
    id: 5,
    partName: "Coolant 5L",
    sku: "CL-5L-001",
    category: "Fluids",
    quantity: 6,
    price: "₹350",
    status: "Low Stock",
    centerId: 3,
    centerName: "Bangalore Innovation Center",
  },
  {
    id: 6,
    partName: "Oil Filter",
    sku: "OF-001",
    category: "Filters",
    quantity: 4,
    price: "₹180",
    status: "Low Stock",
    centerId: 3,
    centerName: "Bangalore Innovation Center",
  },
];

import type { InventoryItem } from "@/shared/types";

/**
 * Default inventory items for the service center inventory page
 * In production, this would be fetched from an API
 */
export const defaultServiceCenterInventory: InventoryItem[] = [
  {
    id: 1,
    partName: "Engine Oil 5W-30",
    sku: "EO-001",
    category: "Lubricants",
    currentQty: 45,
    minStock: 20,
    unitPrice: "₹450",
    costPrice: "₹350",
    supplier: "Shell India",
    location: "Shelf A-1",
    status: "In Stock",
  },
  {
    id: 2,
    partName: "Brake Pads - Front",
    sku: "BP-002",
    category: "Brakes",
    currentQty: 8,
    minStock: 15,
    unitPrice: "₹1,200",
    costPrice: "₹900",
    supplier: "Bosch",
    location: "Shelf B-3",
    status: "Low Stock",
  },
  {
    id: 3,
    partName: "Air Filter",
    sku: "AF-003",
    category: "Filters",
    currentQty: 0,
    minStock: 10,
    unitPrice: "₹350",
    costPrice: "₹250",
    supplier: "Mahle",
    location: "Shelf C-2",
    status: "Out of Stock",
  },
  {
    id: 4,
    partName: "AC Gas R134a",
    sku: "AC-004",
    category: "AC Parts",
    currentQty: 12,
    minStock: 5,
    unitPrice: "₹800",
    costPrice: "₹600",
    supplier: "Denso",
    location: "Shelf D-1",
    status: "In Stock",
  },
  {
    id: 5,
    partName: "Spark Plugs Set",
    sku: "SP-005",
    category: "Engine",
    currentQty: 25,
    minStock: 10,
    unitPrice: "₹600",
    costPrice: "₹450",
    supplier: "NGK",
    location: "Shelf E-2",
    status: "In Stock",
  },
];

export const serviceCenterInventoryData: InventoryItem[] = [
  {
    id: 1,
    partName: "Engine Oil 5L",
    sku: "EO-5L-001",
    category: "Fluids",
    currentQty: 20,
    minStock: 10,
    unitPrice: "₹450",
    costPrice: "₹350",
    supplier: "Shell India",
    location: "Shelf A-1",
    status: "In Stock",
  },
  {
    id: 2,
    partName: "Air Filter",
    sku: "AF-001",
    category: "Filters",
    currentQty: 12,
    minStock: 10,
    unitPrice: "₹250",
    costPrice: "₹200",
    supplier: "Mahle",
    location: "Shelf C-2",
    status: "In Stock",
  },
  {
    id: 3,
    partName: "Spark Plugs (Set of 4)",
    sku: "SP-4-001",
    category: "Ignition",
    currentQty: 15,
    minStock: 10,
    unitPrice: "₹600",
    costPrice: "₹450",
    supplier: "NGK",
    location: "Shelf E-2",
    status: "In Stock",
  },
  {
    id: 4,
    partName: "Brake Pads",
    sku: "BP-001",
    category: "Brakes",
    currentQty: 8,
    minStock: 10,
    unitPrice: "₹1200",
    costPrice: "₹900",
    supplier: "Bosch",
    location: "Shelf B-3",
    status: "Low Stock",
  },
  {
    id: 5,
    partName: "Coolant 5L",
    sku: "CL-5L-001",
    category: "Fluids",
    currentQty: 6,
    minStock: 10,
    unitPrice: "₹350",
    costPrice: "₹250",
    supplier: "Denso",
    location: "Shelf D-1",
    status: "Low Stock",
  },
];

export const partsData = [
  { id: 1, name: "Engine Oil 5L" },
  { id: 2, name: "Coolant 5L" },
  { id: 3, name: "Air Filter" },
  { id: 4, name: "Brake Pads" },
  { id: 5, name: "Spark Plugs (Set of 4)" },
];

