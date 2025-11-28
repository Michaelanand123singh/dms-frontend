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

export const SERVICE_TYPES: readonly string[] = [
  "Routine Maintenance",
  "Repair",
  "Inspection",
  "Warranty",
  "AC Service",
  "Battery Replacement",
  "Tire Service",
  "Other",
];

/**
 * Default job cards for the job cards page
 * In production, this would be fetched from an API
 */
export const defaultJobCards: JobCard[] = [
  {
    id: "JC-2025-001",
    customerName: "Rajesh Kumar",
    vehicle: "Honda City 2020",
    registration: "PB10AB1234",
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
  },
  {
    id: "JC-2025-002",
    customerName: "Priya Sharma",
    vehicle: "Maruti Swift 2019",
    registration: "MH01XY5678",
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
  },
  {
    id: "JC-2025-003",
    customerName: "Amit Patel",
    vehicle: "Hyundai i20 2021",
    registration: "DL05CD9012",
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

