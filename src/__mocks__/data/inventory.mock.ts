/**
 * Mock data for Inventory Management
 */

import type { Part, InventoryItem } from "@/shared/types/inventory.types";
import type { JobCardPartsRequest } from "@/shared/types/jobcard-inventory.types";
import { safeStorage } from "@/shared/lib/localStorage";

/**
 * Mock Inventory Item type for Admin inventory page
 */
export interface MockInventoryItem {
  id: number;
  partName: string;
  hsnCode: string;
  partCode?: string;
  category: string;
  quantity: string;
  price: string;
  status: "In Stock" | "Low Stock";
  centerId: string;
  centerName?: string;
}

/**
 * Default inventory data for Admin inventory page
 */
export const defaultInventoryData: MockInventoryItem[] = [
  {
    id: 1,
    partName: "Brake Pad Set - Front",
    hsnCode: "BP-FR-001",
    partCode: "P001",
    category: "Brakes",
    quantity: "45",
    price: "2500",
    status: "In Stock",
    centerId: "1",
    centerName: "Pune Phase 1",
  },
  {
    id: 2,
    partName: "Engine Oil Filter",
    hsnCode: "EOF-001",
    partCode: "P002",
    category: "Engine",
    quantity: "120",
    price: "350",
    status: "In Stock",
    centerId: "1",
    centerName: "Pune Phase 1",
  },
  {
    id: 3,
    partName: "Air Filter Element",
    hsnCode: "AFE-001",
    partCode: "P003",
    category: "Engine",
    quantity: "8",
    price: "450",
    status: "Low Stock",
    centerId: "1",
    centerName: "Pune Phase 1",
  },
];

/**
 * Default service center inventory data
 */
export const defaultServiceCenterInventory: InventoryItem[] = [
  {
    id: 1,
    partName: "Brake Pad Set - Front",
    hsnCode: "BP-FR-001",
    partCode: "P001",
    category: "Brakes",
    currentQty: 45,
    minStock: 20,
    unitPrice: "₹2,500",
    costPrice: "₹2,000",
    supplier: "Auto Parts Co.",
    location: "Warehouse A",
    status: "In Stock",
  },
  {
    id: 2,
    partName: "Engine Oil Filter",
    hsnCode: "EOF-001",
    partCode: "P002",
    category: "Engine",
    currentQty: 120,
    minStock: 50,
    unitPrice: "₹350",
    costPrice: "₹280",
    supplier: "Filter Solutions",
    location: "Warehouse A",
    status: "In Stock",
  },
  {
    id: 3,
    partName: "Air Filter Element",
    hsnCode: "AFE-001",
    partCode: "P003",
    category: "Engine",
    currentQty: 8,
    minStock: 15,
    unitPrice: "₹450",
    costPrice: "₹360",
    supplier: "Filter Solutions",
    location: "Warehouse B",
    status: "Low Stock",
  },
  {
    id: 4,
    partName: "Battery 12V 60Ah",
    hsnCode: "BAT-12V-60",
    partCode: "P004",
    category: "Electrical",
    currentQty: 0,
    minStock: 10,
    unitPrice: "₹8,500",
    costPrice: "₹7,200",
    supplier: "Battery Corp",
    location: "Warehouse A",
    status: "Out of Stock",
  },
];

/**
 * Mock Parts Master Data
 * Updated to match PartsMasterFormData schema with all extended fields
 */
export const mockParts: Part[] = [
  {
    id: "part-1",
    partId: "P001",
    partName: "Brake Pad Set - Front",
    partNumber: "BP-FR-001",
    hsnCode: "8708.99.00", // HSN Code
    partCode: "P001",
    labourCode: "LAB-BRK-001",
    category: "Brakes",
    price: 2500,
    description: "High-quality front brake pad set for all models",
    stockQuantity: 45,
    minStockLevel: 20,
    unit: "set",
    status: "In Stock",
    // Basic Part Info
    brandName: "AutoBrake Pro",
    variant: "Standard",
    partType: "NEW",
    color: "NA",
    // Purchase (Incoming)
    preGstAmountToUs: "2000.00",
    gstRateInput: "18.00",
    gstInputAmount: "360.00",
    postGstAmountToUs: "2360.00",
    // Sale (Outgoing)
    salePricePreGst: "2500.00",
    gstRateOutput: "18.00",
    gstOutputAmount: "450.00",
    postGstSaleAmount: "2950.00",
    // Labour Association
    associatedLabourName: "Brake Pad Replacement",
    associatedLabourCode: "LAB-BRK-001",
    workTime: "1.5",
    labourRate: "500.00",
    labourGstRate: "18.00",
    labourGstAmount: "90.00",
    labourPostGstAmount: "590.00",
    // High Value Part
    highValuePart: false,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "part-2",
    partId: "P002",
    partName: "Engine Oil Filter",
    partNumber: "EOF-001",
    hsnCode: "8421.23.00", // HSN Code
    partCode: "P002",
    labourCode: "LAB-OIL-001",
    category: "Engine",
    price: 350,
    description: "Standard engine oil filter",
    stockQuantity: 120,
    minStockLevel: 50,
    unit: "piece",
    status: "In Stock",
    // Basic Part Info
    brandName: "FilterMax",
    variant: "Standard",
    partType: "NEW",
    color: "NA",
    // Purchase (Incoming)
    preGstAmountToUs: "280.00",
    gstRateInput: "18.00",
    gstInputAmount: "50.40",
    postGstAmountToUs: "330.40",
    // Sale (Outgoing)
    salePricePreGst: "350.00",
    gstRateOutput: "18.00",
    gstOutputAmount: "63.00",
    postGstSaleAmount: "413.00",
    // Labour Association
    associatedLabourName: "Oil Filter Replacement",
    associatedLabourCode: "LAB-OIL-001",
    workTime: "0.5",
    labourRate: "200.00",
    labourGstRate: "18.00",
    labourGstAmount: "36.00",
    labourPostGstAmount: "236.00",
    // High Value Part
    highValuePart: false,
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T11:20:00Z",
  },
  {
    id: "part-3",
    partId: "P003",
    partName: "Air Filter Element",
    partNumber: "AFE-001",
    hsnCode: "8421.31.00", // HSN Code
    partCode: "P003",
    labourCode: "LAB-AIR-001",
    category: "Engine",
    price: 450,
    description: "Premium air filter element",
    stockQuantity: 8,
    minStockLevel: 15,
    unit: "piece",
    status: "Low Stock",
    // Basic Part Info
    brandName: "AirPure",
    variant: "Premium",
    partType: "NEW",
    color: "NA",
    // Purchase (Incoming)
    preGstAmountToUs: "360.00",
    gstRateInput: "18.00",
    gstInputAmount: "64.80",
    postGstAmountToUs: "424.80",
    // Sale (Outgoing)
    salePricePreGst: "450.00",
    gstRateOutput: "18.00",
    gstOutputAmount: "81.00",
    postGstSaleAmount: "531.00",
    // Labour Association
    associatedLabourName: "Air Filter Replacement",
    associatedLabourCode: "LAB-AIR-001",
    workTime: "0.5",
    labourRate: "200.00",
    labourGstRate: "18.00",
    labourGstAmount: "36.00",
    labourPostGstAmount: "236.00",
    // High Value Part
    highValuePart: false,
    createdAt: "2024-01-12T08:00:00Z",
    updatedAt: "2024-01-19T16:45:00Z",
  },
  {
    id: "part-4",
    partId: "P004",
    partName: "Battery 12V 60Ah",
    partNumber: "BAT-12V-60",
    hsnCode: "8507.20.00", // HSN Code
    partCode: "P004",
    labourCode: "LAB-BAT-001",
    category: "Electrical",
    price: 8500,
    description: "12V 60Ah maintenance-free battery",
    stockQuantity: 0,
    minStockLevel: 10,
    unit: "piece",
    status: "Out of Stock",
    // Basic Part Info
    brandName: "PowerCell",
    variant: "60Ah",
    partType: "NEW",
    color: "Black",
    // Purchase (Incoming)
    preGstAmountToUs: "7200.00",
    gstRateInput: "18.00",
    gstInputAmount: "1296.00",
    postGstAmountToUs: "8496.00",
    // Sale (Outgoing)
    salePricePreGst: "8500.00",
    gstRateOutput: "18.00",
    gstOutputAmount: "1530.00",
    postGstSaleAmount: "10030.00",
    // Labour Association
    associatedLabourName: "Battery Replacement",
    associatedLabourCode: "LAB-BAT-001",
    workTime: "1.0",
    labourRate: "400.00",
    labourGstRate: "18.00",
    labourGstAmount: "72.00",
    labourPostGstAmount: "472.00",
    // High Value Part
    highValuePart: true,
    partSerialNumber: "BAT-2024-001234",
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-17T13:15:00Z",
  },
  {
    id: "part-5",
    partId: "P005",
    partName: "Spark Plug Set",
    partNumber: "SP-SET-001",
    hsnCode: "8511.10.00", // HSN Code
    partCode: "P005",
    labourCode: "LAB-SPK-001",
    category: "Engine",
    price: 1200,
    description: "Set of 4 spark plugs",
    stockQuantity: 25,
    minStockLevel: 20,
    unit: "set",
    status: "In Stock",
    // Basic Part Info
    brandName: "SparkTech",
    variant: "Iridium",
    partType: "NEW",
    color: "NA",
    // Purchase (Incoming)
    preGstAmountToUs: "1000.00",
    gstRateInput: "18.00",
    gstInputAmount: "180.00",
    postGstAmountToUs: "1180.00",
    // Sale (Outgoing)
    salePricePreGst: "1200.00",
    gstRateOutput: "18.00",
    gstOutputAmount: "216.00",
    postGstSaleAmount: "1416.00",
    // Labour Association
    associatedLabourName: "Spark Plug Replacement",
    associatedLabourCode: "LAB-SPK-001",
    workTime: "1.0",
    labourRate: "300.00",
    labourGstRate: "18.00",
    labourGstAmount: "54.00",
    labourPostGstAmount: "354.00",
    // High Value Part
    highValuePart: false,
    createdAt: "2024-01-14T11:00:00Z",
    updatedAt: "2024-01-21T09:30:00Z",
  },
  {
    id: "part-6",
    partId: "P006",
    partName: "Windshield Wiper Blade",
    partNumber: "WWB-001",
    hsnCode: "8512.20.00", // HSN Code
    partCode: "P006",
    labourCode: "LAB-WIP-001",
    category: "Body & Exterior",
    price: 800,
    description: "Pair of windshield wiper blades",
    stockQuantity: 15,
    minStockLevel: 12,
    unit: "pair",
    status: "In Stock",
    // Basic Part Info
    brandName: "WipeClear",
    variant: "Standard",
    partType: "NEW",
    color: "Black",
    // Purchase (Incoming)
    preGstAmountToUs: "650.00",
    gstRateInput: "18.00",
    gstInputAmount: "117.00",
    postGstAmountToUs: "767.00",
    // Sale (Outgoing)
    salePricePreGst: "800.00",
    gstRateOutput: "18.00",
    gstOutputAmount: "144.00",
    postGstSaleAmount: "944.00",
    // Labour Association
    associatedLabourName: "Wiper Blade Replacement",
    associatedLabourCode: "LAB-WIP-001",
    workTime: "0.5",
    labourRate: "150.00",
    labourGstRate: "18.00",
    labourGstAmount: "27.00",
    labourPostGstAmount: "177.00",
    // High Value Part
    highValuePart: false,
    createdAt: "2024-01-11T14:00:00Z",
    updatedAt: "2024-01-20T10:20:00Z",
  },
  {
    id: "part-7",
    partId: "P007",
    partName: "Headlight Bulb H4",
    partNumber: "HLB-H4-001",
    hsnCode: "8539.22.00", // HSN Code
    partCode: "P007",
    labourCode: "LAB-HLB-001",
    category: "Electrical",
    price: 600,
    description: "H4 halogen headlight bulb",
    stockQuantity: 5,
    minStockLevel: 10,
    unit: "piece",
    status: "Low Stock",
    // Basic Part Info
    brandName: "BrightLight",
    variant: "H4",
    partType: "NEW",
    color: "NA",
    // Purchase (Incoming)
    preGstAmountToUs: "500.00",
    gstRateInput: "18.00",
    gstInputAmount: "90.00",
    postGstAmountToUs: "590.00",
    // Sale (Outgoing)
    salePricePreGst: "600.00",
    gstRateOutput: "18.00",
    gstOutputAmount: "108.00",
    postGstSaleAmount: "708.00",
    // Labour Association
    associatedLabourName: "Headlight Bulb Replacement",
    associatedLabourCode: "LAB-HLB-001",
    workTime: "0.5",
    labourRate: "200.00",
    labourGstRate: "18.00",
    labourGstAmount: "36.00",
    labourPostGstAmount: "236.00",
    // High Value Part
    highValuePart: false,
    createdAt: "2024-01-13T09:00:00Z",
    updatedAt: "2024-01-19T15:00:00Z",
  },
  {
    id: "part-8",
    partId: "P008",
    partName: "Clutch Disc",
    partNumber: "CD-001",
    hsnCode: "8708.40.00", // HSN Code
    partCode: "P008",
    labourCode: "LAB-CLT-001",
    category: "Transmission",
    price: 4500,
    description: "Heavy-duty clutch disc",
    stockQuantity: 12,
    minStockLevel: 8,
    unit: "piece",
    status: "In Stock",
    // Basic Part Info
    brandName: "ClutchPro",
    variant: "Heavy Duty",
    partType: "NEW",
    color: "NA",
    // Purchase (Incoming)
    preGstAmountToUs: "3800.00",
    gstRateInput: "18.00",
    gstInputAmount: "684.00",
    postGstAmountToUs: "4484.00",
    // Sale (Outgoing)
    salePricePreGst: "4500.00",
    gstRateOutput: "18.00",
    gstOutputAmount: "810.00",
    postGstSaleAmount: "5310.00",
    // Labour Association
    associatedLabourName: "Clutch Disc Replacement",
    associatedLabourCode: "LAB-CLT-001",
    workTime: "4.0",
    labourRate: "2000.00",
    labourGstRate: "18.00",
    labourGstAmount: "360.00",
    labourPostGstAmount: "2360.00",
    // High Value Part
    highValuePart: true,
    partSerialNumber: "CLT-2024-005678",
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
 * Service Center Inventory Data (for admin service center detail page)
 */
export const serviceCenterInventoryData = defaultServiceCenterInventory.map((item) => ({
  ...item,
  selectedQuantity: 0,
}));

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
