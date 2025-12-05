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
  customerComplaintIssue?: string;
  previousServiceHistory?: string;
}

