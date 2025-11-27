/**
 * Mock data for Job Cards
 */

export interface Engineer {
  id: string;
  name: string;
  status: string;
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

export const SERVICE_TYPES = [
  "Full Service",
  "Maintenance",
  "Repair",
  "Inspection",
  "Warranty",
  "Other",
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

