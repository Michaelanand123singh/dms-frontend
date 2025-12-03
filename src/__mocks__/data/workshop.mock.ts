/**
 * Mock data for Workshop Management
 */

import type { Engineer } from "@/shared/types";

/**
 * Default engineers for the workshop page
 * In production, this would be fetched from an API
 */
export const defaultEngineers: Engineer[] = [
  {
    id: 1,
    name: "Engineer 1",
    status: "Busy",
    currentJobs: 2,
    completedToday: 3,
    utilization: 85,
    skills: ["Engine", "AC", "General"],
    workload: "High",
  },
  {
    id: 2,
    name: "Engineer 2",
    status: "Available",
    currentJobs: 1,
    completedToday: 2,
    utilization: 65,
    skills: ["Brakes", "Suspension"],
    workload: "Medium",
  },
  {
    id: 3,
    name: "Engineer 3",
    status: "Available",
    currentJobs: 0,
    completedToday: 1,
    utilization: 45,
    skills: ["General", "Oil Change"],
    workload: "Low",
  },
];

