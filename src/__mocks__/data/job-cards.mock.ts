/**
 * Mock data for Job Cards
 */

export interface Engineer {
  id: string;
  name: string;
  status: "Available" | "Busy" | "On Leave";
  currentJobs: number;
  skills: string[];
  completedToday?: number;
  utilization?: number;
  workload?: string;
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  category: string;
  availableQty: number;
  unitPrice: string;
}

import type { JobCard } from "@/shared/types";
import { mockCustomers } from "./customers.mock";

export const SERVICE_TYPES: readonly string[] = [
  "-SELECT-",
  "FREE SERVICE - 1",
  "FREE SERVICE - 2",
  "RUNNING REPAIR",
  "PMS",
  "TRANSIT DAMAGE",
  "CAMPAIGN SERVICE",
  "ACCIDENTAL REPAIR",
  "WARRANTY REPAIRS",
  "PDI",
];

const [rajesh, priya, amit] = mockCustomers;

/**
 * Default job cards for the job cards page
 * In production, this would be fetched from an API
 */
export const defaultJobCards: JobCard[] = [
  {
    id: "JC-2025-001",
    jobCardNumber: "SC001-202501-0001",
    serviceCenterId: "sc-001",
    serviceCenterCode: "SC001",
    customerId: rajesh.externalId ?? "",
    customerName: rajesh.name,
    vehicleId: rajesh.vehicles[0].externalId,
    vehicle: `${rajesh.vehicles[0].vehicleMake} ${rajesh.vehicles[0].vehicleModel}`,
    registration: rajesh.vehicles[0].registration,
    vehicleMake: rajesh.vehicles[0].vehicleMake,
    vehicleModel: rajesh.vehicles[0].vehicleModel,
    customerType: "B2C",
    serviceType: "Routine Maintenance",
    description: "Regular service - oil change, filter replacement",
    status: "In Progress",
    priority: "Normal",
    assignedEngineer: "Engineer 1",
    estimatedCost: "₹3,500",
    estimatedTime: "2 hours",
    startTime: "2025-01-15 10:00",
    createdAt: "2025-01-15 09:30",
    parts: ["Engine Oil", "Air Filter"],
    location: "Station",
    quotationId: "qt-001",
  },
  {
    id: "JC-2025-002",
    jobCardNumber: "SC001-202501-0002",
    serviceCenterId: "sc-001",
    serviceCenterCode: "SC001",
    customerId: priya.externalId ?? "",
    customerName: priya.name,
    vehicleId: priya.vehicles[0].externalId,
    vehicle: `${priya.vehicles[0].vehicleMake} ${priya.vehicles[0].vehicleModel}`,
    registration: priya.vehicles[0].registration,
    vehicleMake: priya.vehicles[0].vehicleMake,
    vehicleModel: priya.vehicles[0].vehicleModel,
    customerType: "B2C",
    serviceType: "Repair",
    description: "Brake pads replacement",
    status: "Assigned",
    priority: "High",
    assignedEngineer: "Engineer 2",
    estimatedCost: "₹4,200",
    estimatedTime: "3 hours",
    createdAt: "2025-01-15 11:15",
    parts: ["Brake Pads", "Brake Fluid"],
    location: "Station",
    workflowState: "arrival_pending",
    arrivalMode: "vehicle_absent",
    dualApproval: { technicianApproved: false, serviceManagerApproved: false, inventoryApproved: false },
    partRequestStatus: "n/a",
    technicianNotes: "Awaiting vehicle delivery",
    workCompletionNotified: false,
  },
  {
    id: "JC-2025-003",
    jobCardNumber: "SC001-202501-0003",
    serviceCenterId: "sc-001",
    serviceCenterCode: "SC001",
    customerId: amit.externalId ?? "",
    customerName: amit.name,
    vehicleId: amit.vehicles[0].externalId,
    vehicle: `${amit.vehicles[0].vehicleMake} ${amit.vehicles[0].vehicleModel}`,
    registration: amit.vehicles[0].registration,
    vehicleMake: amit.vehicles[0].vehicleMake,
    vehicleModel: amit.vehicles[0].vehicleModel,
    customerType: "B2C",
    serviceType: "Inspection",
    description: "Pre-purchase inspection",
    status: "Created",
    priority: "Normal",
    assignedEngineer: null,
    estimatedCost: "₹1,500",
    estimatedTime: "1 hour",
    createdAt: "2025-01-15 14:20",
    parts: [],
    location: "Station",
    workflowState: "check_in_only",
    arrivalMode: "check_in_only",
    dualApproval: { technicianApproved: true, serviceManagerApproved: true, inventoryApproved: true },
    partRequestStatus: "inventory_manager_approved",
    partRequests: [],
    workCompletionNotified: true,
  },
];

export const engineers: Engineer[] = [
  {
    id: "eng-1",
    name: "Engineer 1",
    status: "Available",
    currentJobs: 1,
    skills: ["Engine", "AC", "General"],
    completedToday: 3,
    utilization: 85,
    workload: "High",
  },
  {
    id: "eng-2",
    name: "Engineer 2",
    status: "Busy",
    currentJobs: 2,
    skills: ["Brakes", "Suspension"],
    completedToday: 2,
    utilization: 65,
    workload: "Medium",
  },
  {
    id: "eng-3",
    name: "Engineer 3",
    status: "Available",
    currentJobs: 0,
    skills: ["Electrical", "Battery"],
    completedToday: 1,
    utilization: 45,
    workload: "Low",
  },
];

export const availableParts: Part[] = [
  { id: "part-1", name: "Engine Oil 5W-30", sku: "EO-001", category: "Lubricants", availableQty: 45, unitPrice: "₹450" },
  { id: "part-2", name: "Brake Pads - Front", sku: "BP-002", category: "Brakes", availableQty: 8, unitPrice: "₹1,200" },
  { id: "part-3", name: "Air Filter", sku: "AF-003", category: "Filters", availableQty: 25, unitPrice: "₹350" },
  { id: "part-4", name: "AC Gas R134a", sku: "AC-004", category: "AC Parts", availableQty: 12, unitPrice: "₹800" },
  { id: "part-5", name: "Spark Plugs Set", sku: "SP-005", category: "Engine", availableQty: 25, unitPrice: "₹600" },
];

/**
 * Mock job cards specifically for service engineers
 * These demonstrate the workflow for service engineers
 */
export const serviceEngineerJobCards: JobCard[] = [
  {
    id: "JC-ENG-001",
    jobCardNumber: "SC001-202501-0101",
    serviceCenterId: "1",
    serviceCenterCode: "SC001",
    customerId: "cust-001",
    customerName: "Rajesh Kumar",
    vehicleId: "veh-001",
    vehicle: "Maruti Swift VDI",
    registration: "MH-12-AB-1234",
    vehicleMake: "Maruti",
    vehicleModel: "Swift VDI",
    customerType: "B2C",
    serviceType: "Routine Maintenance",
    description: "Regular service - oil change, filter replacement, brake inspection",
    status: "In Progress",
    priority: "Normal",
    assignedEngineer: "Service Engineer",
    estimatedCost: "₹3,500",
    estimatedTime: "2 hours",
    startTime: typeof window !== "undefined" ? new Date().toLocaleString() : new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: typeof window !== "undefined" ? new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString() : new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    parts: ["Engine Oil", "Air Filter"],
    location: "Station",
    quotationId: "qt-001",
  },
  {
    id: "JC-ENG-002",
    jobCardNumber: "SC001-202501-0102",
    serviceCenterId: "1",
    serviceCenterCode: "SC001",
    customerId: "cust-002",
    customerName: "Priya Sharma",
    vehicleId: "veh-002",
    vehicle: "Honda City VX",
    registration: "MH-12-CD-5678",
    vehicleMake: "Honda",
    vehicleModel: "City VX",
    customerType: "B2C",
    serviceType: "Repair",
    description: "Brake pads replacement - front and rear",
    status: "Parts Pending",
    priority: "High",
    assignedEngineer: "Service Engineer",
    estimatedCost: "₹4,200",
    estimatedTime: "3 hours",
    startTime: typeof window !== "undefined" ? new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString() : new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    createdAt: typeof window !== "undefined" ? new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString() : new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    parts: ["Brake Pads", "Brake Fluid"],
    location: "Station",
    partsPending: true,
    partRequestStatus: "pending",
  },
  {
    id: "JC-ENG-003",
    jobCardNumber: "SC001-202501-0103",
    serviceCenterId: "1",
    serviceCenterCode: "SC001",
    customerId: "cust-003",
    customerName: "Amit Patel",
    vehicleId: "veh-003",
    vehicle: "Hyundai Creta SX",
    registration: "MH-12-EF-9012",
    vehicleMake: "Hyundai",
    vehicleModel: "Creta SX",
    customerType: "B2C",
    serviceType: "AC Service",
    description: "AC gas refill and cleaning",
    status: "Assigned",
    priority: "Normal",
    assignedEngineer: "Service Engineer",
    estimatedCost: "₹2,800",
    estimatedTime: "1.5 hours",
    createdAt: typeof window !== "undefined" ? new Date(Date.now() - 30 * 60 * 1000).toLocaleString() : new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    parts: ["AC Gas R134a"],
    location: "Station",
  },
  {
    id: "JC-ENG-004",
    jobCardNumber: "SC001-202501-0104",
    serviceCenterId: "1",
    serviceCenterCode: "SC001",
    customerId: "cust-004",
    customerName: "Sneha Desai",
    vehicleId: "veh-004",
    vehicle: "Tata Nexon EV",
    registration: "MH-12-GH-3456",
    vehicleMake: "Tata",
    vehicleModel: "Nexon EV",
    customerType: "B2C",
    serviceType: "Battery Check",
    description: "Battery health check and software update",
    status: "Completed",
    priority: "Normal",
    assignedEngineer: "Service Engineer",
    estimatedCost: "₹1,200",
    estimatedTime: "1 hour",
    startTime: typeof window !== "undefined" ? new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleString() : new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    completedAt: typeof window !== "undefined" ? new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString() : new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    createdAt: typeof window !== "undefined" ? new Date(Date.now() - 7 * 60 * 60 * 1000).toLocaleString() : new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
    parts: [],
    location: "Station",
    workCompletionNotified: true,
  },
  {
    id: "JC-ENG-005",
    jobCardNumber: "SC001-202501-0105",
    serviceCenterId: "1",
    serviceCenterCode: "SC001",
    customerId: "cust-005",
    customerName: "Vikram Singh",
    vehicleId: "veh-005",
    vehicle: "Mahindra XUV700",
    registration: "MH-12-IJ-7890",
    vehicleMake: "Mahindra",
    vehicleModel: "XUV700",
    customerType: "B2C",
    serviceType: "Engine Repair",
    description: "Engine oil leak inspection and repair",
    status: "In Progress",
    priority: "High",
    assignedEngineer: "Service Engineer",
    estimatedCost: "₹5,500",
    estimatedTime: "4 hours",
    startTime: typeof window !== "undefined" ? new Date(Date.now() - 1 * 60 * 60 * 1000).toLocaleString() : new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    createdAt: typeof window !== "undefined" ? new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString() : new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    parts: ["Engine Oil", "Gasket Set"],
    location: "Station",
  },
];

