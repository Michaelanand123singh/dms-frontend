/**
 * Workshop Type Definitions
 */

import type { Priority } from '@/shared/types/common.types';

export type EngineerStatus = "Available" | "Busy";
export type Workload = "Low" | "Medium" | "High";

export interface Engineer {
  id: number;
  name: string;
  status: EngineerStatus;
  currentJobs: number;
  completedToday: number;
  utilization: number;
  skills: string[];
  workload: Workload;
}

export interface WorkshopStats {
  totalBays: number;
  occupiedBays: number;
  availableBays: number;
  activeJobs: number;
  completedToday: number;
  averageServiceTime: string;
  utilizationRate: number;
}

export interface ActiveJob {
  id: string;
  customer: string;
  vehicle: string;
  serviceType: string;
  engineer: string;
  startTime: string;
  estimatedCompletion: string;
  status: string;
  priority: Priority;
}

