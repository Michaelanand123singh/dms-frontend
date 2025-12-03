import { defaultServiceCenters } from "@/__mocks__/data/service-centers.mock";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";

export type AppointmentStatus = "Confirmed" | "Pending" | "Cancelled";

export interface Appointment {
  id: number;
  customerName: string;
  vehicle: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  serviceCenterId?: number;
  serviceCenterName?: string;
  customerType?: "B2C" | "B2B";
  customerComplaintIssue?: string;
  previousServiceHistory?: string;
  estimatedServiceTime?: string;
  estimatedCost?: string;
  odometerReading?: string;
  isMajorIssue?: boolean;
  documentationFiles?: {
    customerIdProof?: number;
    vehicleRCCopy?: number;
    warrantyCardServiceBook?: number;
    photosVideos?: number;
  };
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

export const DEFAULT_MAX_APPOINTMENTS_PER_DAY = 20;

export const validateAppointmentForm = (form: AppointmentForm, isCallCenter: boolean = false): string | null => {
  if (!form.customerName || !form.phone || !form.vehicle || !form.serviceType || !form.date || !form.time) {
    return "Please fill in all required fields.";
  }
  if (!/^\d{10}$/.test(form.phone.replace(/\s|[-+_]/g, "").replace(/^91/, ""))) {
    return "Please enter a valid 10-digit phone number.";
  }
  if (isCallCenter && form.isMajorIssue && !form.customerComplaintIssue) {
    return "Customer Complaint/Issue Description is required for major issues.";
  }
  return null;
};

export const countAppointmentsForDate = (appointments: Appointment[], date: string): number =>
  appointments.filter((apt) => apt.date === date).length;

export const getMaxAppointmentsPerDay = (serviceCenterName: string | null | undefined): number => {
  if (!serviceCenterName || typeof window === "undefined") {
    return 20;
  }

  try {
    const storedCenters = safeStorage.getItem<Record<string, any>>("serviceCenters", {});
    const center = Object.values(storedCenters).find((c: any) => c.name === serviceCenterName);
    if (center?.maxAppointmentsPerDay && typeof center.maxAppointmentsPerDay === "number") {
      return center.maxAppointmentsPerDay;
    }
  } catch (error) {
    console.error("Error reading service center settings:", error);
  }

  return 20;
};

export const findNearestServiceCenter = (customerAddress: string | undefined): number | null => {
  if (!customerAddress) return null;
  const addressLower = customerAddress.toLowerCase();
  const cities = [
    { city: "delhi", centerId: 1 },
    { city: "mumbai", centerId: 2 },
    { city: "bangalore", centerId: 3 },
    { city: "bengaluru", centerId: 3 },
  ];

  for (const { city, centerId } of cities) {
    if (addressLower.includes(city)) {
      return centerId;
    }
  }

  const activeCenters = defaultServiceCenters.filter((sc) => sc.status === "Active");
  return activeCenters.length > 0 ? activeCenters[0].id : null;
};

