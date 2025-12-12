/**
 * Home Service Type Definitions
 */

export type HomeServiceStatus = "Scheduled" | "In Progress" | "Completed" | "Cancelled";
export type HomeServiceFilterType = "all" | "scheduled" | "in_progress" | "completed";

export interface HomeService {
  id: string;
  customerName: string;
  phone: string;
  vehicle: string;
  registration: string;
  address: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  engineer: string;
  status: HomeServiceStatus;
  estimatedCost: string;
  createdAt: string;
  startTime?: string;
  completedAt?: string;
}

export interface HomeServiceStats {
  scheduled: number;
  inProgress: number;
  completed: number;
  total: number;
}

