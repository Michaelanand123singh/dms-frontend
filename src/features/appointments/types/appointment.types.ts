/**
 * Appointment Type Definitions
 */

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
  status?: "Confirmed" | "Pending" | "Cancelled";
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
  location?: "STATION" | "DOORSTEP" | "PICKUP";
  estimatedCost?: number;
  documentationFiles?: DocumentationFilesDto;
  uploadedBy?: string;
  [key: string]: any; // Allow other fields that might be passed temporarily
}

export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {
  status?: string;
  assignedTechnician?: string;
  checkInDate?: string;
  checkInTime?: string;
}
