/**
 * Mock data for Vehicles
 */

import type { Vehicle, ServiceHistoryItem } from "@/shared/types";

/**
 * Default vehicles for the vehicle search page
 * In production, this would be fetched from an API
 */
export const defaultVehicles: Vehicle[] = [
  {
    id: 1,
    customerId: 1,
    customerNumber: "CUST-2025-001",
    phone: "9876543210",
    registration: "PB10AB1234",
    vin: "MH12AB3456CD7890",
    customerName: "Rajesh Kumar",
    customerEmail: "rajesh@example.com",
    customerAddress: "123 Main St, Pune",
    vehicleMake: "Honda",
    vehicleModel: "City",
    vehicleYear: 2020,
    vehicleColor: "White",
    lastServiceDate: "2024-12-15",
    totalServices: 8,
    totalSpent: "₹45,000",
    currentStatus: "Active Job Card",
    activeJobCardId: "JC-2025-001",
    nextServiceDate: "2025-02-15",
  },
  {
    id: 2,
    customerId: 2,
    customerNumber: "CUST-2025-002",
    phone: "9876543211",
    registration: "MH01XY5678",
    vin: "MH12AB3456CD7891",
    customerName: "Priya Sharma",
    customerEmail: "priya@example.com",
    customerAddress: "456 Park Ave, Mumbai",
    vehicleMake: "Maruti",
    vehicleModel: "Swift",
    vehicleYear: 2019,
    vehicleColor: "Red",
    lastServiceDate: "2024-11-20",
    totalServices: 5,
    totalSpent: "₹28,000",
    currentStatus: "Available",
    activeJobCardId: null,
    nextServiceDate: "2025-01-20",
  },
];

/**
 * Default service history for vehicles
 * In production, this would be fetched from an API
 */
export const defaultVehicleServiceHistory: ServiceHistoryItem[] = [
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

export interface VehicleData {
  id: number;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  vin: string;
  totalServices: number;
  lastServiceDate: string;
  currentStatus: string;
  activeJobCard: string | null;
  nextServiceDate: string;
}

export const vehiclesData: VehicleData[] = [
  {
    id: 1,
    registrationNumber: "DL-01-AB-1234",
    make: "Honda",
    model: "City",
    year: 2020,
    customerName: "Rohit Shah",
    phone: "+91-9876-543-210",
    email: "rohit.shah@email.com",
    address: "123 Main Street, New Delhi, 110001",
    vin: "MBJC123456789012A",
    totalServices: 5,
    lastServiceDate: "2024-10-15",
    currentStatus: "Active Job Card",
    activeJobCard: "JC001",
    nextServiceDate: "2025-01-15",
  },
  {
    id: 2,
    registrationNumber: "DL-01-CD-5678",
    make: "Maruti",
    model: "Swift",
    year: 2021,
    customerName: "Priya Sharma",
    phone: "+91-9876-543-211",
    email: "priya.sharma@email.com",
    address: "456 Park Avenue, New Delhi, 110002",
    vin: "MBJC123456789012B",
    totalServices: 3,
    lastServiceDate: "2024-09-20",
    currentStatus: "Available",
    activeJobCard: null,
    nextServiceDate: "2025-02-20",
  },
  {
    id: 3,
    registrationNumber: "DL-01-EF-9012",
    make: "Hyundai",
    model: "i20",
    year: 2019,
    customerName: "Amit Kumar",
    phone: "+91-9876-543-212",
    email: "amit.kumar@email.com",
    address: "789 MG Road, New Delhi, 110003",
    vin: "MBJC123456789012C",
    totalServices: 7,
    lastServiceDate: "2024-11-05",
    currentStatus: "Available",
    activeJobCard: null,
    nextServiceDate: "2025-01-05",
  },
];

