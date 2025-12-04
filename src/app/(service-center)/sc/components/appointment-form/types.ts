/**
 * Shared types and defaults for the appointment form
 */

export interface DocumentationFiles {
  files: File[];
  urls: string[];
}

export interface AppointmentForm {
  customerName: string;
  vehicle: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  duration: string;
  serviceCenterId?: number;
  serviceCenterName?: string;
  customerType?: "B2C" | "B2B";
  customerComplaintIssue?: string;
  previousServiceHistory?: string;
  estimatedServiceTime?: string;
  estimatedCost?: string;
  odometerReading?: string;
  isMajorIssue?: boolean;
  customerIdProof?: DocumentationFiles;
  vehicleRCCopy?: DocumentationFiles;
  warrantyCardServiceBook?: DocumentationFiles;
  photosVideos?: DocumentationFiles;
  estimatedDeliveryDate?: string;
  assignedServiceAdvisor?: string;
  assignedTechnician?: string;
  pickupDropRequired?: boolean;
  pickupAddress?: string;
  dropAddress?: string;
  preferredCommunicationMode?: "Phone" | "Email" | "SMS" | "WhatsApp";
  paymentMethod?: "Cash" | "Card" | "UPI" | "Online" | "Cheque";
  gstRequirement?: boolean;
  businessNameForInvoice?: string;
  feedbackRating?: number;
  nextServiceDueDate?: string;
  amcSubscriptionStatus?: string;
}

export const INITIAL_DOCUMENTATION_FILES: DocumentationFiles = {
  files: [],
  urls: [],
};

export const INITIAL_APPOINTMENT_FORM: AppointmentForm = {
  customerName: "",
  vehicle: "",
  phone: "",
  serviceType: "",
  date: new Date().toISOString().split("T")[0],
  time: "",
  duration: "2",
  serviceCenterId: undefined,
  serviceCenterName: undefined,
  customerType: undefined,
  customerComplaintIssue: undefined,
  previousServiceHistory: undefined,
  estimatedServiceTime: undefined,
  estimatedCost: undefined,
  odometerReading: undefined,
  isMajorIssue: undefined,
  customerIdProof: undefined,
  vehicleRCCopy: undefined,
  warrantyCardServiceBook: undefined,
  photosVideos: undefined,
  estimatedDeliveryDate: undefined,
  assignedServiceAdvisor: undefined,
  assignedTechnician: undefined,
  pickupDropRequired: undefined,
  pickupAddress: undefined,
  dropAddress: undefined,
  preferredCommunicationMode: undefined,
  paymentMethod: undefined,
  gstRequirement: undefined,
  businessNameForInvoice: undefined,
  feedbackRating: undefined,
  nextServiceDueDate: undefined,
  amcSubscriptionStatus: undefined,
};

export type ToastType = "success" | "error";

export const validateAppointmentForm = (form: AppointmentForm, isCallCenter: boolean = false): string | null => {
  if (!form.customerName || !form.phone || !form.vehicle || !form.serviceType || !form.date || !form.time) {
    return "Please fill in all required fields.";
  }
  if (!/^\d{10}$/.test(form.phone.replace(/\s|[-+_]/g, "").replace(/^91/, ""))) {
    return "Please enter a valid 10-digit phone number.";
  }
  if (isCallCenter && !form.customerComplaintIssue) {
    return "Please fill in Service Type and Customer Complaint/Issue Description.";
  }
  return null;
};



