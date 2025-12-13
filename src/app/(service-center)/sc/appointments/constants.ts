import type { ServiceIntakeForm } from "./types";

export const SERVICE_CENTER_CODE_MAP: Record<string, string> = {
  "1": "SC001",
  "2": "SC002",
  "3": "SC003",
  "sc-001": "SC001",
  "sc-002": "SC002",
  "sc-003": "SC003",
};

export const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  Confirmed: { bg: "bg-green-100", text: "text-green-800" },
  Pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
  Cancelled: { bg: "bg-red-100", text: "text-red-800" },
  "In Progress": { bg: "bg-blue-100", text: "text-blue-800" },
  "Sent to Manager": { bg: "bg-purple-100", text: "text-purple-800" },
  "Quotation Created": { bg: "bg-indigo-100", text: "text-indigo-800" },
};

export const TOAST_DURATION = 3000;
export const DEFAULT_MAX_APPOINTMENTS_PER_DAY = 20; // Default limit if not configured
export const JOB_CARD_STORAGE_KEY = "jobCards";

const INITIAL_DOCUMENTATION_FILES = {
  files: [],
  urls: [],
};

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
  customerComplaintIssue: "",
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

