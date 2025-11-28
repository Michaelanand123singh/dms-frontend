/**
 * Mock data for Service Requests
 */

import type { ServiceRequest } from "@/shared/types";

/**
 * Default service requests for the service requests page
 * In production, this would be fetched from an API
 */
export const defaultServiceRequests: ServiceRequest[] = [
  {
    id: "SR-2025-001",
    customerName: "Rajesh Kumar",
    phone: "9876543210",
    vehicle: "Honda City 2020",
    registration: "PB10AB1234",
    serviceType: "Routine Maintenance",
    description: "Regular service - oil change, filter replacement",
    location: "Station",
    preferredDate: "2025-01-20",
    preferredTime: "10:00 AM",
    estimatedCost: "₹3,500",
    status: "Pending Approval",
    urgency: "Normal",
    createdAt: "2025-01-15 09:30",
    createdBy: "SC Staff",
  },
  {
    id: "SR-2025-002",
    customerName: "Priya Sharma",
    phone: "9876543211",
    vehicle: "Maruti Swift 2019",
    registration: "MH01XY5678",
    serviceType: "Repair",
    description: "Brake pads replacement",
    estimatedCost: "₹4,200",
    location: "Home Service",
    preferredDate: "2025-01-18",
    preferredTime: "2:00 PM",
    status: "Pending Approval",
    urgency: "High",
    createdAt: "2025-01-15 11:15",
    createdBy: "Call Center",
  },
  {
    id: "SR-2025-003",
    customerName: "Amit Patel",
    phone: "9876543212",
    vehicle: "Hyundai i20 2021",
    registration: "DL05CD9012",
    serviceType: "Inspection",
    description: "Pre-purchase inspection",
    estimatedCost: "₹1,500",
    location: "Station",
    preferredDate: "2025-01-19",
    preferredTime: "3:00 PM",
    status: "Approved",
    urgency: "Normal",
    createdAt: "2025-01-14 14:20",
    createdBy: "Service Advisor",
  },
];

export interface ServiceRequestLegacy {
  id: string;
  vehicle: string;
  customerName: string;
  serviceType: string;
  description: string;
  estimatedCost: string;
  requestedDate: string;
  status: string;
}

export const serviceRequestsData: ServiceRequestLegacy[] = [
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

