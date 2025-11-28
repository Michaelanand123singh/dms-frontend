/**
 * Mock data for Customer Service History
 * This matches the ServiceHistoryItem type from vehicle.types.ts
 */

import type { ServiceHistoryItem } from "@/shared/types";

/**
 * Get mock service history for a vehicle
 * In a real app, this would be fetched from an API based on vehicle ID
 */
export const getMockServiceHistory = (vehicleId?: number | string): ServiceHistoryItem[] => {
  // Return default mock data - in production, this would be vehicle-specific
  return [
    {
      id: 1,
      date: "2024-12-15",
      type: "Routine Maintenance",
      engineer: "Engineer 1",
      parts: ["Engine Oil", "Air Filter"],
      labor: "₹1,500",
      partsCost: "₹2,500",
      total: "₹4,000",
      invoice: "INV-2024-456",
      status: "Completed",
      odometer: "25,000 km",
    },
    {
      id: 2,
      date: "2024-11-20",
      type: "Repair",
      engineer: "Engineer 2",
      parts: ["Brake Pads", "Brake Fluid"],
      labor: "₹2,000",
      partsCost: "₹3,500",
      total: "₹5,500",
      invoice: "INV-2024-389",
      status: "Completed",
      odometer: "24,500 km",
    },
  ];
};

