/**
 * Appointment Type Definitions
 */

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

// Backend AppointmentLocation enum values
export type AppointmentLocation = "STATION" | "DOORSTEP";

export interface Appointment {
  id: number | string;
  customerId: string;
  customerName?: string;
  vehicleId?: string;
  vehicle?: string;
  phone?: string;
  serviceType?: string;
  date?: string;
  time?: string;
  duration?: string;
  status?: AppointmentStatus;
  customerExternalId?: string;
  vehicleExternalId?: string;
  serviceCenterId?: string | number;
  serviceCenterName?: string;
  customerComplaint?: string;
  previousServiceHistory?: string;
}

export interface DocumentationFilesDto {
  customerIdProof?: Array<any>;
  vehicleRCCopy?: Array<any>;
  warrantyCardServiceBook?: Array<any>;
  photosVideos?: Array<any>;
}

export interface CreateAppointmentDto {
  customerId: string;
  vehicleId: string;
  serviceCenterId: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  customerComplaint?: string;
  location?: AppointmentLocation;
  estimatedCost?: number;
  documentationFiles?: DocumentationFilesDto;
  uploadedBy?: string;
  // Operational details
  estimatedDeliveryDate?: string;
  assignedServiceAdvisor?: string;
  assignedTechnician?: string;
  pickupDropRequired?: boolean;
  pickupAddress?: string;
  pickupState?: string;
  pickupCity?: string;
  pickupPincode?: string;
  dropAddress?: string;
  dropState?: string;
  dropCity?: string;
  dropPincode?: string;
  preferredCommunicationMode?: string;
  previousServiceHistory?: string;
  estimatedServiceTime?: string;
  odometerReading?: string;
  duration?: string;
  [key: string]: any; // Allow other fields that might be passed temporarily
}

export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {
  status?: AppointmentStatus;
}

