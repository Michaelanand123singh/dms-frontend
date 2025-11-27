/**
 * Mock data for Vehicles
 */

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

