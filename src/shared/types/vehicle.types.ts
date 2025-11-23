/**
 * Vehicle and Customer Type Definitions
 */

export type SearchType = "phone" | "registration" | "vin";
export type CustomerSearchType = "phone" | "name" | "customerNumber" | "email";

export type VehicleStatus = "Available" | "Active Job Card";

export interface Customer {
  id: number | string;
  customerNumber: string; // Unique customer number
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  totalVehicles?: number;
  totalSpent?: string;
  lastServiceDate?: string;
}

export interface Vehicle {
  id: number | string;
  customerId: number | string; // Link to customer
  customerNumber?: string; // Customer number for quick reference
  phone: string;
  registration: string;
  vin: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  lastServiceDate: string;
  totalServices: number;
  totalSpent: string;
  currentStatus: VehicleStatus;
  activeJobCardId: string | null;
  nextServiceDate?: string;
}

export interface ServiceHistoryItem {
  id: number | string;
  date: string;
  type: string;
  engineer: string;
  parts: string[];
  labor: string;
  partsCost: string;
  total: string;
  invoice: string;
  status: string;
  odometer: string;
}

export interface NewVehicleForm {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  registration: string;
  vin: string;
}

export interface NewCustomerForm {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface CustomerWithVehicles extends Customer {
  vehicles: Vehicle[];
}

