// Import DocumentationFiles type before using it
import type { DocumentationFiles } from '@/shared/types/documentation.types';

// Backend AppointmentStatus enum values (must match Prisma schema)
export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "IN_PROGRESS"
  | "ARRIVED"
  | "QUOTATION_CREATED"
  | "SENT_TO_MANAGER";

export interface AppointmentRecord {
  id: string | number;
  customerName: string;
  vehicle: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  duration: string;
  status: AppointmentStatus;
  customerExternalId?: string;
  vehicleExternalId?: string;
  serviceCenterId?: number | string;
  serviceCenterName?: string;
  assignedServiceCenter?: string; // Legacy field for backward compatibility
  customerType?: "B2C" | "B2B";
  customerComplaint?: string;
  previousServiceHistory?: string;
  estimatedServiceTime?: string;
  estimatedCost?: string;
  odometerReading?: string;
  documentationFiles?: {
    customerIdProof?: number;
    vehicleRCCopy?: number;
    warrantyCardServiceBook?: number;
    photosVideos?: number;
  };
  estimatedDeliveryDate?: string;
  assignedServiceAdvisor?: string;
  assignedTechnician?: string;
  location?: "STATION" | "DOORSTEP";
  pickupDropRequired?: boolean;
  pickupAddress?: string;
  pickupState?: string;
  pickupCity?: string;
  pickupPincode?: string;
  dropAddress?: string;
  dropState?: string;
  dropCity?: string;
  dropPincode?: string;
  preferredCommunicationMode?: "Phone" | "Email" | "SMS" | "WhatsApp";
  arrivalMode?: "vehicle_present" | "vehicle_absent" | "check_in_only";
  checkInNotes?: string;
  checkInSlipNumber?: string;
  checkInDate?: string;
  checkInTime?: string;
  createdByRole?: "call_center" | "service_advisor" | "service_manager"; // Track who created the appointment

  // Customer Contact & Address Fields
  whatsappNumber?: string;
  alternateNumber?: string;
  email?: string;
  address?: string;
  cityState?: string;
  pincode?: string;

  // Vehicle Information Fields
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  registrationNumber?: string;
  vinChassisNumber?: string;
  variantBatteryCapacity?: string;
  motorNumber?: string;
  chargerSerialNumber?: string;
  dateOfPurchase?: string;
  warrantyStatus?: string;
  insuranceStartDate?: string;
  insuranceEndDate?: string;
  insuranceCompanyName?: string;
  vehicleColor?: string;

  // Job Card Conversion Fields
  batterySerialNumber?: string;
  mcuSerialNumber?: string;
  vcuSerialNumber?: string;
  otherPartSerialNumber?: string;
  technicianObservation?: string;

  // Documentation Files (stored as objects with files and urls)
  customerIdProof?: DocumentationFiles;
  vehicleRCCopy?: DocumentationFiles;
  warrantyCardServiceBook?: DocumentationFiles;
  photosVideos?: DocumentationFiles;
}

// Re-export from shared types
export type { DocumentationFiles };
export { INITIAL_DOCUMENTATION_FILES } from '@/shared/types/documentation.types';

export interface ServiceIntakeForm {
  // Documentation
  customerIdProof: DocumentationFiles;
  vehicleRCCopy: DocumentationFiles;
  warrantyCardServiceBook: DocumentationFiles;
  photosVideos: DocumentationFiles;

  // Vehicle Information
  vehicleBrand: string;
  vehicleModel: string;
  registrationNumber: string;
  vinChassisNumber: string;
  variantBatteryCapacity: string;
  motorNumber: string;
  chargerSerialNumber: string;
  dateOfPurchase: string;
  warrantyStatus: string;
  insuranceStartDate: string;
  insuranceEndDate: string;
  insuranceCompanyName: string;

  // Service Details
  serviceType: string;
  customerComplaint: string;
  previousServiceHistory: string;
  estimatedServiceTime: string;
  estimatedCost: string;
  odometerReading: string;

  // Operational Details (Job Card)
  estimatedDeliveryDate: string;
  assignedServiceAdvisor: string;
  assignedTechnician: string;
  pickupDropRequired: boolean;
  pickupAddress: string;
  dropAddress: string;
  preferredCommunicationMode: "Phone" | "Email" | "SMS" | "WhatsApp" | "";

  jobCardId?: string;
  arrivalMode?: "vehicle_present" | "vehicle_absent" | "";
  checkInNotes?: string;
  checkInSlipNumber?: string;
  checkInDate?: string;
  checkInTime?: string;
}

export interface ServiceIntakeRequest {
  id: string;
  appointmentId: number;
  appointment: AppointmentRecord;
  serviceIntakeForm: ServiceIntakeForm;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  submittedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  serviceCenterId?: number | string;
  serviceCenterName?: string;
}

export type ToastType = "success" | "error";
export type CustomerArrivalStatus = "arrived" | "not_arrived" | null;
