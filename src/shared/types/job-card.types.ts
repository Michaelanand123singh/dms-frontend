/**
 * Job Card Type Definitions
 * Based on Job Card Extraction Rules: PART 1, PART 2, PART 2A, PART 3
 */

import type { ServiceLocation, Priority } from './common.types';

export type JobCardStatus =
  | "arrival_pending"
  | "job_card_pending_vehicle"
  | "job_card_active"
  | "check_in_only"
  | "no_response_lead"
  | "manager_quote"
  | "Awaiting Quotation Approval"
  | "Created"
  | "Assigned"
  | "In Progress"
  | "Parts Pending"
  | "Completed"
  | "Invoiced";

/**
 * PART 1 — CUSTOMER & VEHICLE INFORMATION
 */
export interface JobCardPart1 {
  // LEFT SIDE
  fullName: string;
  mobilePrimary: string;
  customerType: "B2C" | "B2B" | "";
  vehicleBrand: string;
  vehicleModel: string;
  registrationNumber: string;
  vinChassisNumber: string;
  variantBatteryCapacity: string;
  warrantyStatus: string;
  estimatedDeliveryDate: string;
  
  // RIGHT SIDE
  customerAddress: string;
  
  // TOP RIGHT
  jobCardNumber: string;
  
  // BELOW DETAILS (Text Blocks)
  customerFeedback: string; // Customer Feedback / Concerns
  technicianObservation: string;
  insuranceStartDate: string;
  insuranceEndDate: string;
  insuranceCompanyName: string;
  
  // MANDATORY SERIAL DATA (only if applicable)
  batterySerialNumber: string;
  mcuSerialNumber: string;
  vcuSerialNumber: string;
  otherPartSerialNumber: string;
}

/**
 * PART 2 — PARTS & WORK ITEMS LIST
 */
export interface JobCardPart2Item {
  srNo: number; // Auto-generate starting from 1
  partWarrantyTag: string; // Job Card Line Name
  partName: string; // Clean name from description
  partCode: string; // First alphanumeric block from description
  qty: number; // Quantity
  amount: number; // Amount (if available, default 0)
  technician: string; // Technician (if provided)
  labourCode: string; // If Item Type = Work Item → extract labour text, If Item Type = Part → "Auto Select With Part"
  itemType?: "part" | "work_item"; // To distinguish between parts and work items
  serialNumber?: string; // Serial number for warranty parts
  isWarranty?: boolean; // Flag to indicate if this is a warranty part
}

/**
 * PART 2A — WARRANTY / INSURANCE CASE DETAILS
 * ONLY extract if input indicates warranty or insurance case
 */
export interface JobCardPart2A {
  videoEvidence: "Yes" | "No" | "";
  vinImage: "Yes" | "No" | "";
  odoImage: "Yes" | "No" | ""; // ODO Meter Image
  damageImages: "Yes" | "No" | ""; // Images of Damaged Parts
  issueDescription: string;
  numberOfObservations: string;
  symptom: string;
  defectPart: string;
}

/**
 * PART 3 — PART REQUISITION & ISSUE DETAILS
 */
export interface JobCardPart3 {
  customerType: "B2C" | "B2B" | "";
  vehicleBrand: string;
  vehicleModel: string;
  registrationNumber: string;
  vinChassisNumber: string;
  jobCardNumber: string;
  partCode: string;
  partName: string;
  qty: number;
  issueQty: number;
  returnQty: number;
  warrantyTagNumber: string;
  returnPartNumber: string;
  approvalDetails: string; // Approval Mail / Details (can be email/screenshot summary)
}

/**
 * Complete Job Card Structure
 */
export interface JobCard {
  id: string;
  jobCardNumber: string; // Format: SC001-2025-11-0001
  serviceCenterId: string;
  serviceCenterCode?: string; // e.g., "SC001"
  serviceCenterName?: string;
  customerId: string;
  customerName: string;
  vehicleId?: string;
  vehicle: string; // Legacy field for backward compatibility
  registration: string; // Legacy field for backward compatibility
  vehicleMake?: string; // Legacy field for backward compatibility
  vehicleModel?: string; // Legacy field for backward compatibility
  customerType?: "B2C" | "B2B";
  serviceType: string;
  description: string;
  status: JobCardStatus;
  priority: Priority;
  assignedEngineer: string | null;
  estimatedCost: string;
  estimatedTime: string;
  startTime?: string;
  createdAt: string;
  completedAt?: string;
  parts: string[]; // Legacy field for backward compatibility
  location: ServiceLocation;
  quotationId?: string;
  workflowState?: JobCardStatus;
  arrivalMode?: "vehicle_present" | "vehicle_absent" | "check_in_only";
  dualApproval?: {
    technicianApproved?: boolean;
    serviceManagerApproved?: boolean;
    inventoryApproved?: boolean;
  };
  partRequestStatus?: "pending" | "service_manager_approved" | "inventory_manager_approved" | "n/a";
  partRequests?: string[];
  technicianNotes?: string;
  workCompletionNotified?: boolean;
  // Insurance details (legacy)
  hasInsurance?: boolean;
  insurerName?: string;
  insurerAddress?: string;
  insurerGstNumber?: string;
  // Part pending status
  partsPending?: boolean;
  // Warranty information (legacy)
  warrantyStatus?: string;
  warrantyDetails?: string;
  sourceAppointmentId?: number;
  isTemporary?: boolean;
  customerArrivalTimestamp?: string;
  draftIntake?: Record<string, any>;
  
  // Service Advisor submission to manager
  submittedToManager?: boolean;
  submittedAt?: string;
  
  // Invoice workflow
  invoiceNumber?: string;
  invoiceCreatedAt?: string;
  invoiceSentToAdvisor?: boolean;
  invoiceSentToCustomer?: boolean;
  invoiceSentAt?: string;
  
  // Additional appointment data fields
  customerWhatsappNumber?: string;
  customerAlternateMobile?: string;
  customerEmail?: string;
  vehicleYear?: number;
  motorNumber?: string;
  chargerSerialNumber?: string;
  dateOfPurchase?: string;
  vehicleColor?: string;
  previousServiceHistory?: string;
  odometerReading?: string;
  pickupAddress?: string;
  pickupState?: string;
  pickupCity?: string;
  pickupPincode?: string;
  dropAddress?: string;
  dropState?: string;
  dropCity?: string;
  dropPincode?: string;
  preferredCommunicationMode?: "Phone" | "Email" | "SMS" | "WhatsApp";
  pickupDropRequired?: boolean;
  checkInNotes?: string;
  checkInSlipNumber?: string;
  checkInDate?: string;
  checkInTime?: string;
  
  // NEW STRUCTURED DATA (PART 1, PART 2, PART 2A, PART 3)
  part1?: JobCardPart1; // Customer & Vehicle Information
  part2?: JobCardPart2Item[]; // Parts & Work Items List
  part2A?: JobCardPart2A; // Warranty / Insurance Case Details (only if applicable)
  part3?: JobCardPart3; // Part Requisition & Issue Details
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: JobCardStatus;
}

