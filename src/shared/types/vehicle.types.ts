/**
 * Vehicle and Customer Type Definitions
 */

export type SearchType = "phone" | "registration" | "vin";
export type CustomerSearchType = "phone" | "name" | "customerNumber" | "email" | "vin" | "vehicleNumber" | "auto";
export type ServiceType = "walk-in" | "home-service";
export type CustomerType = "B2C" | "B2B";

export type VehicleStatus = "Available" | "Active Job Card";

export interface Customer {
  id: number | string;
  customerNumber: string; // Unique customer number
  name: string;
  phone: string;
  // Primary WhatsApp number for communication (can be same as phone)
  whatsappNumber?: string;
  email?: string;
  address?: string;
  cityState?: string;
  pincode?: string;
  alternateMobile?: string;
  customerType?: CustomerType;
  serviceType?: ServiceType;
  addressType?: "home" | "work";
  workAddress?: string;
  pickupDropRequired?: boolean;
  pickupAddress?: string;
  dropAddress?: string;
  createdAt: string;
  totalVehicles?: number;
  totalSpent?: string;
  lastServiceDate?: string;
  lastServiceCenterId?: number | string; // ID of last service center
  lastServiceCenterName?: string; // Name of last service center where service was done
  serviceCenterId?: number | string; // Primary service center affiliation
  serviceCenterName?: string;
  externalId?: string;
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
  lastServiceCenterId?: number | string; // ID of last service center
  lastServiceCenterName?: string; // Name of last service center where service was done
  externalId?: string;
}

export interface ServiceHistoryItem {
  id: number | string;
  jobCardId?: string;
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
  serviceCenterId?: number | string; // Service center where this service was done
  serviceCenterName?: string; // Service center name
}

export interface NewVehicleForm {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  vehicleBrand: string; // Vehicle Brand
  vehicleModel: string; // Vehicle Model
  registrationNumber: string; // Registration Number
  vin: string; // VIN / Chassis Number
  variant?: string; // Variant / Battery Capacity
  motorNumber?: string; // Motor Number
  chargerSerialNumber?: string; // Charger Serial Number
  purchaseDate?: string; // Date of Purchase
  vehicleAge?: string; // Vehicle Age (alternative to purchase date)
  warrantyStatus?: string; // Warranty Status
  insuranceStartDate?: string; // Insurance start date
  insuranceEndDate?: string; // Insurance end date
  insuranceCompanyName?: string; // Insurance company name
  // Legacy fields for backward compatibility
  vehicleMake?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  registration?: string;
}

export interface NewCustomerForm {
  name: string;
  phone: string;
  // Dedicated WhatsApp number field captured at creation time
  whatsappNumber?: string;
  alternateMobile?: string;
  email?: string;
  address?: string;
  cityState?: string;
  pincode?: string;
  customerType?: CustomerType;
  serviceType?: ServiceType;
  addressType?: "home" | "work";
  workAddress?: string;
  // Pickup / Drop preferences at customer level
  pickupDropRequired?: boolean;
  pickupAddress?: string;
  dropAddress?: string;
  serviceCenterId?: number | string;
  serviceCenterName?: string;
}

export interface CustomerWithVehicles extends Customer {
  vehicles: Vehicle[];
}

