/**
 * Mock data for Service Requests
 */

export interface ServiceRequest {
  id: string;
  vehicle: string;
  customerName: string;
  serviceType: string;
  description: string;
  estimatedCost: string;
  requestedDate: string;
  status: string;
}

export const serviceRequestsData: ServiceRequest[] = [
  {
    id: "SR001",
    vehicle: "DL-01-AB-1234",
    customerName: "Rohit Shah",
    serviceType: "Full Service",
    description: "Regular maintenance and oil change",
    estimatedCost: "₹5500",
    requestedDate: "2024-11-10",
    status: "Pending",
  },
  {
    id: "SR002",
    vehicle: "DL-01-CD-5678",
    customerName: "Priya Sharma",
    serviceType: "Repair",
    description: "Brake pad replacement",
    estimatedCost: "₹3500",
    requestedDate: "2024-11-11",
    status: "Pending",
  },
];

export interface PartRequest {
  id: string;
  part: string;
  quantity: number;
  reason: string;
  requestedDate: string;
  status: string;
}

export const partRequestsData: PartRequest[] = [
  {
    id: "PR001",
    part: "Engine Oil 5L",
    quantity: 10,
    reason: "Low Stock",
    requestedDate: "2024-11-10",
    status: "Pending",
  },
  {
    id: "PR002",
    part: "Coolant 5L",
    quantity: 15,
    reason: "Replacement",
    requestedDate: "2024-11-09",
    status: "Approved",
  },
];

