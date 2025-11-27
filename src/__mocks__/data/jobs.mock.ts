/**
 * Mock data for Jobs
 */

export interface JobData {
  id: string;
  vehicle: string;
  customerName: string;
  technician: string;
  status: string;
  estimatedCost: string;
  serviceType?: string;
}

export const jobsData: JobData[] = [
  {
    id: "JC001",
    vehicle: "DL-01-CD-5678",
    customerName: "Priya Nair",
    technician: "Technician Raj",
    status: "In Progress",
    estimatedCost: "₹5500",
  },
  {
    id: "JC002",
    vehicle: "DL-01-AB-1234",
    customerName: "Rohit Shah",
    technician: "Technician Priya",
    status: "Not Started",
    estimatedCost: "₹3500",
  },
  {
    id: "JC003",
    vehicle: "DL-01-XY-9999",
    customerName: "Amit Kumar",
    technician: "Technician Raj",
    status: "Completed",
    estimatedCost: "₹4500",
  },
  {
    id: "JC004",
    vehicle: "DL-01-MN-8888",
    customerName: "Sneha Patel",
    technician: "Technician Priya",
    status: "Completed",
    estimatedCost: "₹6200",
  },
];

