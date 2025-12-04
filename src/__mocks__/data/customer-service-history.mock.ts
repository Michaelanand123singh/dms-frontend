/**
 * Mock data for Customer Service History
 * This matches the ServiceHistoryItem type from vehicle.types.ts
 */

import type { ServiceHistoryItem } from "@/shared/types";

type ExtendedServiceHistoryItem = ServiceHistoryItem & {
  customerId?: string;
  vehicleId?: string;
};

/**
 * Get mock service history for a vehicle
 * In a real app, this would be fetched from an API based on vehicle ID
 */
export const getMockServiceHistory = (vehicleId?: number | string): ExtendedServiceHistoryItem[] => {
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
      serviceCenterId: "sc-001",
      serviceCenterName: "Delhi Central Hub",
      customerId: "cust-001",
      vehicleId: "veh-001",
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
      serviceCenterId: "sc-002",
      serviceCenterName: "Mumbai Metroplex",
      customerId: "cust-002",
      vehicleId: "veh-003",
    },
    {
      id: 3,
      date: "2024-10-10",
      type: "AC Repair",
      engineer: "Engineer 3",
      parts: ["AC Compressor"],
      labor: "₹1,800",
      partsCost: "₹4,000",
      total: "₹5,800",
      invoice: "INV-2024-312",
      status: "Completed",
      odometer: "23,800 km",
      serviceCenterId: "sc-003",
      serviceCenterName: "Bangalore Innovation Center",
      customerId: "cust-003",
      vehicleId: "veh-004",
    },
  ];
};

