import type { ServiceIntakeForm } from "./types";
import { INITIAL_DOCUMENTATION_FILES } from "@/shared/types/documentation.types";

export const SERVICE_CENTER_CODE_MAP: Record<string, string> = {
  "1": "SC001",
  "2": "SC002",
  "3": "SC003",
  "sc-001": "SC001",
  "sc-002": "SC002",
  "sc-003": "SC003",
};

export const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  // Backend AppointmentStatus enum values (UPPERCASE with underscores)
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-800" },
  CONFIRMED: { bg: "bg-green-100", text: "text-green-800" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-800" },
  COMPLETED: { bg: "bg-emerald-100", text: "text-emerald-800" },
  IN_PROGRESS: { bg: "bg-blue-100", text: "text-blue-800" },
  ARRIVED: { bg: "bg-cyan-100", text: "text-cyan-800" },
  QUOTATION_CREATED: { bg: "bg-indigo-100", text: "text-indigo-800" },
  SENT_TO_MANAGER: { bg: "bg-purple-100", text: "text-purple-800" },
};

export const TOAST_DURATION = 3000;
export const DEFAULT_MAX_APPOINTMENTS_PER_DAY = 20; // Default limit if not configured
export const JOB_CARD_STORAGE_KEY = "jobCards";

export const INITIAL_SERVICE_INTAKE_FORM: ServiceIntakeForm = {
  // Documentation
  customerIdProof: { ...INITIAL_DOCUMENTATION_FILES },
  vehicleRCCopy: { ...INITIAL_DOCUMENTATION_FILES },
  warrantyCardServiceBook: { ...INITIAL_DOCUMENTATION_FILES },
  photosVideos: { ...INITIAL_DOCUMENTATION_FILES },

  // Vehicle Information
  vehicleBrand: "",
  vehicleModel: "",
  registrationNumber: "",
  vinChassisNumber: "",
  variantBatteryCapacity: "",
  motorNumber: "",
  chargerSerialNumber: "",
  dateOfPurchase: "",
  warrantyStatus: "",
  insuranceStartDate: "",
  insuranceEndDate: "",
  insuranceCompanyName: "",

  // Service Details
  serviceType: "",
  customerComplaint: "",
  previousServiceHistory: "",
  estimatedServiceTime: "",
  estimatedCost: "",
  odometerReading: "",

  // Operational Details (Job Card)
  estimatedDeliveryDate: "",
  assignedServiceAdvisor: "",
  assignedTechnician: "",
  pickupDropRequired: false,
  pickupAddress: "",
  dropAddress: "",
  preferredCommunicationMode: "",

  jobCardId: "",
  arrivalMode: "",
  checkInNotes: "",
  checkInSlipNumber: "",
  checkInDate: "",
  checkInTime: "",
};

