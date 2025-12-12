/**
 * Service Request Type Definitions
 */

import type { ServiceLocation } from '@/shared/types/common.types';

export type RequestStatus = "Pending Approval" | "Approved" | "Rejected";
export type Urgency = "Low" | "Normal" | "Medium" | "High" | "Critical";

export interface ServiceRequest {
  id: string;
  customerName: string;
  phone: string;
  vehicle: string;
  registration: string;
  serviceType: string;
  description: string;
  location: ServiceLocation;
  preferredDate: string;
  preferredTime: string;
  estimatedCost: string;
  status: RequestStatus;
  urgency: Urgency;
  createdAt: string;
  createdBy: string;
  rejectionReason?: string;
}

