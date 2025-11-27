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

export const serviceCenterInventoryData: InventoryItem[] = [
  {
    id: 1,
    partName: "Engine Oil 5L",
    sku: "EO-5L-001",
    category: "Fluids",
    quantity: 20,
    price: "₹450",
    status: "In Stock",
  },
  {
    id: 2,
    partName: "Air Filter",
    sku: "AF-001",
    category: "Filters",
    quantity: 12,
    price: "₹250",
    status: "In Stock",
  },
  {
    id: 3,
    partName: "Spark Plugs (Set of 4)",
    sku: "SP-4-001",
    category: "Ignition",
    quantity: 15,
    price: "₹600",
    status: "In Stock",
  },
  {
    id: 4,
    partName: "Brake Pads",
    sku: "BP-001",
    category: "Brakes",
    quantity: 8,
    price: "₹1200",
    status: "In Stock",
  },
  {
    id: 5,
    partName: "Coolant 5L",
    sku: "CL-5L-001",
    category: "Fluids",
    quantity: 6,
    price: "₹350",
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

