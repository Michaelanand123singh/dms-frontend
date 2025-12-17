/**
 * Mock data for Inventory Management
 */

import type { Part, InventoryItem } from "@/shared/types/inventory.types";
import type { JobCardPartsRequest } from "@/shared/types/jobcard-inventory.types";
import { safeStorage } from "@/shared/lib/localStorage";

/**
 * Convert Part to InventoryItem
 * Helper function to convert Parts Master data to Service Center Inventory format
 */
export function convertPartToInventoryItem(part: Part, index: number): InventoryItem {
  // Calculate status based on stock quantity vs min stock level
  let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
  if (part.stockQuantity === 0) {
    status = "Out of Stock";
  } else if (part.stockQuantity <= part.minStockLevel) {
    status = "Low Stock";
  }

  // Format price with Indian Rupee symbol
  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  // Calculate cost price from purchasePrice or estimate as 80% of price
  const costPriceValue = part.purchasePrice 
    ? parseFloat(part.purchasePrice) 
    : part.price * 0.8;

  // Parse ID from part.id (e.g., "part-1" -> 1) or use index + 1
  const id = part.id && part.id.includes("-") 
    ? parseInt(part.id.split("-")[1]) || index + 1
    : index + 1;

  return {
    id,
    partName: part.partName,
    hsnCode: "", // Required by InventoryItem interface, not in new parameters
    partCode: undefined, // Optional field, not in new parameters
    category: part.category || "",
    currentQty: part.stockQuantity,
    minStock: part.minStockLevel,
    unitPrice: formatPrice(part.price),
    costPrice: formatPrice(costPriceValue),
    supplier: part.brandName || "Supplier",
    location: "Warehouse A",
    status,
  };
}

/**
 * Convert array of Parts to InventoryItems
 */
export function convertPartsToInventoryItems(parts: Part[]): InventoryItem[] {
  return parts.map((part, index) => convertPartToInventoryItem(part, index));
}

/**
 * Mock Parts Master Data
 * Updated to match new parameters from image
 */
export const mockParts: Part[] = [
  {
    id: "part-1",
    partId: "P001",
    partName: "COCKPIT TOP SHELL ANTHRACITE",
    partNumber: "003",
    category: "BODY PANEL",
    price: 1864.4,
    description: "HEADLIGHT",
    stockQuantity: 45,
    minStockLevel: 2,
    unit: "1",
    // Parameters from image - exact match
    oemPartNumber: "W_0000000272_00",
    originType: "OLD/NEW",
    purchasePrice: "950",
    brandName: "LA ELECTRIC",
    variant: "S1 PRO, S1",
    partType: "PANEL",
    color: "ANTHRACITE",
    gstAmount: "1400",
    gstRateInput: "18",
    pricePreGst: "1652",
    gstRateOutput: "18",
    estimatedLabour: "COCKPIT FIT",
    estimatedLabourWorkTime: "0.3M",
    labourRate: "180",
    labourGstRate: "18",
    labourPrice: "212.4",
    gstInput: "32.4",
    totalPrice: "1864.4",
    totalGst: "284.4",
    highValuePart: false,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "part-2",
    partId: "P002",
    partName: "Engine Oil Filter",
    partNumber: "EOF-001",
    category: "Engine",
    price: 586,
    description: "Standard engine oil filter",
    stockQuantity: 120,
    minStockLevel: 50,
    unit: "piece",
    oemPartNumber: "W_0000000273_00",
    originType: "NEW",
    purchasePrice: "280",
    brandName: "FilterMax",
    variant: "Standard",
    partType: "FILTER",
    color: "NA",
    gstAmount: "50.40",
    gstRateInput: "18",
    pricePreGst: "350",
    gstRateOutput: "18",
    estimatedLabour: "Oil Filter Replacement",
    estimatedLabourWorkTime: "0.5M",
    labourRate: "200",
    labourGstRate: "18",
    labourPrice: "236",
    gstInput: "36",
    totalPrice: "586",
    totalGst: "113.40",
    highValuePart: false,
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T11:20:00Z",
  },
  {
    id: "part-3",
    partId: "P003",
    partName: "Air Filter Element",
    partNumber: "AFE-001",
    category: "Engine",
    price: 686,
    description: "Premium air filter element",
    stockQuantity: 8,
    minStockLevel: 15,
    unit: "piece",
    oemPartNumber: "W_0000000274_00",
    originType: "NEW",
    purchasePrice: "360",
    brandName: "AirPure",
    variant: "Premium",
    partType: "FILTER",
    color: "NA",
    gstAmount: "64.80",
    gstRateInput: "18",
    pricePreGst: "450",
    gstRateOutput: "18",
    estimatedLabour: "Air Filter Replacement",
    estimatedLabourWorkTime: "0.5M",
    labourRate: "200",
    labourGstRate: "18",
    labourPrice: "236",
    gstInput: "36",
    totalPrice: "686",
    totalGst: "117.80",
    highValuePart: false,
    createdAt: "2024-01-12T08:00:00Z",
    updatedAt: "2024-01-19T16:45:00Z",
  },
  {
    id: "part-4",
    partId: "P004",
    partName: "Battery 12V 60Ah",
    partNumber: "BAT-12V-60",
    category: "Electrical",
    price: 8972,
    description: "12V 60Ah maintenance-free battery",
    stockQuantity: 0,
    minStockLevel: 10,
    unit: "piece",
    oemPartNumber: "W_0000000275_00",
    originType: "NEW",
    purchasePrice: "7200",
    brandName: "PowerCell",
    variant: "60Ah",
    partType: "BATTERY",
    color: "Black",
    gstAmount: "1296.00",
    gstRateInput: "18",
    pricePreGst: "8500",
    gstRateOutput: "18",
    estimatedLabour: "Battery Replacement",
    estimatedLabourWorkTime: "1.0M",
    labourRate: "400",
    labourGstRate: "18",
    labourPrice: "472",
    gstInput: "72",
    totalPrice: "8972",
    totalGst: "1898.00",
    highValuePart: false,
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-17T13:15:00Z",
  },
  {
    id: "part-5",
    partId: "P005",
    partName: "Spark Plug Set",
    partNumber: "SP-SET-001",
    category: "Engine",
    price: 1554,
    description: "Set of 4 spark plugs",
    stockQuantity: 25,
    minStockLevel: 20,
    unit: "set",
    oemPartNumber: "W_0000000276_00",
    originType: "NEW",
    purchasePrice: "1000",
    brandName: "SparkTech",
    variant: "Iridium",
    partType: "SPARK_PLUG",
    color: "NA",
    gstAmount: "180.00",
    gstRateInput: "18",
    pricePreGst: "1200",
    gstRateOutput: "18",
    estimatedLabour: "Spark Plug Replacement",
    estimatedLabourWorkTime: "1.0M",
    labourRate: "300",
    labourGstRate: "18",
    labourPrice: "354",
    gstInput: "54",
    totalPrice: "1554",
    totalGst: "270.00",
    highValuePart: false,
    createdAt: "2024-01-14T11:00:00Z",
    updatedAt: "2024-01-21T09:30:00Z",
  },
  {
    id: "part-6",
    partId: "P006",
    partName: "Windshield Wiper Blade",
    partNumber: "WWB-001",
    category: "Body & Exterior",
    price: 977,
    description: "Pair of windshield wiper blades",
    stockQuantity: 15,
    minStockLevel: 12,
    unit: "pair",
    oemPartNumber: "W_0000000277_00",
    originType: "NEW",
    purchasePrice: "650",
    brandName: "WipeClear",
    variant: "Standard",
    partType: "WIPER",
    color: "Black",
    gstAmount: "117.00",
    gstRateInput: "18",
    pricePreGst: "800",
    gstRateOutput: "18",
    estimatedLabour: "Wiper Blade Replacement",
    estimatedLabourWorkTime: "0.5M",
    labourRate: "150",
    labourGstRate: "18",
    labourPrice: "177",
    gstInput: "27",
    totalPrice: "977",
    totalGst: "144.00",
    highValuePart: false,
    createdAt: "2024-01-11T14:00:00Z",
    updatedAt: "2024-01-20T10:20:00Z",
  },
  {
    id: "part-7",
    partId: "P007",
    partName: "Headlight Bulb H4",
    partNumber: "HLB-H4-001",
    category: "Electrical",
    price: 836,
    description: "H4 halogen headlight bulb",
    stockQuantity: 5,
    minStockLevel: 10,
    unit: "piece",
    oemPartNumber: "W_0000000278_00",
    originType: "NEW",
    purchasePrice: "500",
    brandName: "BrightLight",
    variant: "H4",
    partType: "BULB",
    color: "NA",
    gstAmount: "90.00",
    gstRateInput: "18",
    pricePreGst: "600",
    gstRateOutput: "18",
    estimatedLabour: "Headlight Bulb Replacement",
    estimatedLabourWorkTime: "0.5M",
    labourRate: "200",
    labourGstRate: "18",
    labourPrice: "236",
    gstInput: "36",
    totalPrice: "836",
    totalGst: "126.00",
    highValuePart: false,
    createdAt: "2024-01-13T09:00:00Z",
    updatedAt: "2024-01-19T15:00:00Z",
  },
  {
    id: "part-8",
    partId: "P008",
    partName: "Clutch Disc",
    partNumber: "CD-001",
    category: "Transmission",
    price: 6860,
    description: "Heavy-duty clutch disc",
    stockQuantity: 12,
    minStockLevel: 8,
    unit: "piece",
    oemPartNumber: "W_0000000279_00",
    originType: "NEW",
    purchasePrice: "3800",
    brandName: "ClutchPro",
    variant: "Heavy Duty",
    partType: "CLUTCH",
    color: "NA",
    gstAmount: "684.00",
    gstRateInput: "18",
    pricePreGst: "4500",
    gstRateOutput: "18",
    estimatedLabour: "Clutch Disc Replacement",
    estimatedLabourWorkTime: "4.0M",
    labourRate: "2000",
    labourGstRate: "18",
    labourPrice: "2360",
    gstInput: "360",
    totalPrice: "6860",
    totalGst: "1854.00",
    highValuePart: false,
    createdAt: "2024-01-09T10:00:00Z",
    updatedAt: "2024-01-18T12:00:00Z",
  },
];

/**
 * Mock Job Card Parts Requests
 */
export const mockJobCardPartsRequests: JobCardPartsRequest[] = [
  {
    id: "req-1",
    jobCardId: "JC-2024-01-001",
    vehicleId: "veh-001",
    vehicleNumber: "MH12AB1234",
    customerName: "Rajesh Kumar",
    requestedBy: "SC Manager - Pune Phase 1",
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: "pending",
    parts: [
      {
        partId: "part-1",
        partName: "Brake Pad Set - Front",
        quantity: 2,
      },
      {
        partId: "part-2",
        partName: "Engine Oil Filter",
        quantity: 1,
      },
    ],
  },
  {
    id: "req-2",
    jobCardId: "JC-2024-01-002",
    vehicleId: "veh-002",
    vehicleNumber: "MH12CD5678",
    customerName: "Priya Sharma",
    requestedBy: "SC Manager - Mumbai",
    requestedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    status: "pending",
    parts: [
      {
        partId: "part-4",
        partName: "Battery 12V 60Ah",
        quantity: 1,
      },
      {
        partId: "part-5",
        partName: "Spark Plug Set",
        quantity: 1,
      },
    ],
  },
  {
    id: "req-3",
    jobCardId: "JC-2024-01-003",
    vehicleId: "veh-003",
    vehicleNumber: "MH12EF9012",
    customerName: "Amit Patel",
    requestedBy: "SC Manager - Pune Phase 1",
    requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: "approved",
    approvedBy: "Inventory Manager",
    approvedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    parts: [
      {
        partId: "part-3",
        partName: "Air Filter Element",
        quantity: 2,
      },
    ],
  },
];

/**
 * Get default service center inventory data from mockParts
 * Converts Parts Master data to InventoryItem format
 */
export function getDefaultServiceCenterInventory(): InventoryItem[] {
  return convertPartsToInventoryItems(mockParts);
}

/**
 * Service Center Inventory Data (for admin service center detail page)
 * Includes selectedQuantity field for form handling
 */
export function getServiceCenterInventoryData() {
  return getDefaultServiceCenterInventory().map((item) => ({
    ...item,
    selectedQuantity: 0,
  }));
}

/**
 * Initialize mock data in localStorage
 */
export function initializeInventoryMockData() {
  if (typeof window === "undefined") return;

  // Initialize parts master if empty
  const existingParts = safeStorage.getItem<Part[]>("partsMaster", []);
  if (existingParts.length === 0) {
    safeStorage.setItem("partsMaster", mockParts);
  }

  // Initialize job card parts requests if empty
  const existingRequests = safeStorage.getItem<JobCardPartsRequest[]>("jobCardPartsRequests", []);
  if (existingRequests.length === 0) {
    safeStorage.setItem("jobCardPartsRequests", mockJobCardPartsRequests);
  }
}
