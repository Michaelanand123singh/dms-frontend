"use client";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { Calendar, Clock, User, Car, PlusCircle, X, Edit, Phone, CheckCircle, AlertCircle, Eye, MapPin, Building2, AlertTriangle, Upload, FileText, Image as ImageIcon, Trash2, Search, UserCheck, Camera } from "lucide-react";
import CheckInSlip, { generateCheckInSlipNumber, type CheckInSlipData } from "@/components/check-in-slip/CheckInSlip";
import CameraModal from "../components/shared/CameraModal";
import { useCustomerSearch } from "../../../../hooks/api";
import { useRole } from "@/shared/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import {
  canCreateAppointment,
  canEditCustomerInfo,
  canEditVehicleInfo,
  canEditServiceDetails,
  canEditDocumentation,
  canEditOperationalDetails,
  canEditBillingPayment,
  canEditPostService,
} from "@/shared/constants/roles";
import {
  filterByServiceCenter,
  getServiceCenterContext,
  shouldFilterByServiceCenter,
} from "@/shared/lib/serviceCenter";
import { defaultJobCards } from "@/__mocks__/data/job-cards.mock";
import { staticServiceCenters } from "@/__mocks__/data/service-centers.mock";
import type { CustomerWithVehicles, Vehicle } from "@/shared/types";
import type { JobCard } from "@/shared/types/job-card.types";
import { populateJobCardPart1, createEmptyJobCardPart1, generateSrNoForPart2Items, createEmptyJobCardPart2A } from "@/shared/utils/jobCardData.util";
import { customerService } from "@/services/customers/customer.service";
import type { JobCardPart2Item } from "@/shared/types/job-card.types";

// ==================== Types ====================
interface AppointmentRecord {
  id: number;
  customerName: string;
  vehicle: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  customerExternalId?: string;
  vehicleExternalId?: string;
  serviceCenterId?: number | string;
  serviceCenterName?: string;
  assignedServiceCenter?: string; // Legacy field for backward compatibility
  customerType?: "B2C" | "B2B";
  customerComplaintIssue?: string;
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
  createdByRole?: "call_center" | "service_advisor" | "service_manager"; // Track who created the appointment
}

interface AppointmentForm {
  customerName: string;
  vehicle: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  duration: string;
  serviceCenterId?: number | string;
  serviceCenterName?: string;
  // Customer Information
  customerType?: "B2C" | "B2B";
  // Service Details
  customerComplaintIssue?: string;
  previousServiceHistory?: string;
  estimatedServiceTime?: string;
  estimatedCost?: string;
  odometerReading?: string;
  // Documentation
  customerIdProof?: DocumentationFiles;
  vehicleRCCopy?: DocumentationFiles;
  warrantyCardServiceBook?: DocumentationFiles;
  photosVideos?: DocumentationFiles;
  arrivalMode?: "vehicle_present" | "vehicle_absent";
  // Operational Details
  estimatedDeliveryDate?: string;
  assignedServiceAdvisor?: string;
  assignedTechnician?: string;
  pickupDropRequired?: boolean;
  pickupAddress?: string;
  dropAddress?: string;
  preferredCommunicationMode?: "Phone" | "Email" | "SMS" | "WhatsApp";
  // Billing & Payment
  paymentMethod?: "Cash" | "Card" | "UPI" | "Online" | "Cheque";
  gstRequirement?: boolean;
  businessNameForInvoice?: string;
  // Post-Service Survey
  feedbackRating?: number;
  nextServiceDueDate?: string;
  amcSubscriptionStatus?: string;
}

interface Complaint {
  id: number;
  customerName: string;
  vehicle: string;
  phone: string;
  complaint: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  serviceCenterId?: number;
  serviceCenterName?: string;
  createdAt: string;
}

interface ComplaintForm {
  customerName: string;
  vehicle: string;
  phone: string;
  complaint: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  serviceCenterId?: number;
}

interface DocumentationFiles {
  files: File[];
  urls: string[]; // For preview URLs
}

interface ServiceIntakeForm {
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
  customerComplaintIssue: string;
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
  
  // Billing & Payment
  paymentMethod: "Cash" | "Card" | "UPI" | "Online" | "Cheque" | "";
  gstRequirement: boolean;
  businessNameForInvoice: string;
  jobCardId?: string;
  arrivalMode?: "vehicle_present" | "vehicle_absent" | "";
  checkInNotes?: string;
  checkInSlipNumber?: string;
  checkInDate?: string;
  checkInTime?: string;
}

interface ServiceIntakeRequest {
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

type ToastType = "success" | "error";
const JOB_CARD_STORAGE_KEY = "jobCards";

const loadJobCards = (): JobCard[] => {
  if (typeof window === "undefined") return [];
  const stored = safeStorage.getItem<JobCard[]>(JOB_CARD_STORAGE_KEY, []);
  return stored.length > 0 ? stored : [...defaultJobCards];
};

const persistJobCards = (cards: JobCard[]) => {
  safeStorage.setItem(JOB_CARD_STORAGE_KEY, cards);
};

const deriveServiceCenterCode = (serviceCenterName?: string | null): string => {
  if (!serviceCenterName) {
    return "SC001";
  }
  return serviceCenterName.replace(/\s+/g, "").substring(0, 5).toUpperCase();
};

const generateJobCardNumber = (serviceCenterCode: string, existing: JobCard[]): string => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const sequences = existing
    .map((card) => {
      const parts = card.jobCardNumber?.split("-");
      if (parts && parts[0] === serviceCenterCode && parts[1] === year && parts[2] === month && parts[3]) {
        return Number(parts[3]);
      }
      return 0;
    })
    .filter((seq) => !isNaN(seq));

  const nextSequence = sequences.length > 0 ? Math.max(...sequences) + 1 : 1;
  return `${serviceCenterCode}-${year}-${month}-${String(nextSequence).padStart(4, "0")}`;
};

const formatVehicleLabel = (vehicle: Vehicle): string => {
  return `${vehicle.vehicleMake} ${vehicle.vehicleModel} (${vehicle.vehicleYear})`;
};

const findVehicleForAppointment = (
  customer: CustomerWithVehicles | null,
  appointmentVehicleLabel: string
): Vehicle | undefined => {
  if (!customer) return undefined;
  return customer.vehicles.find((vehicle) => formatVehicleLabel(vehicle) === appointmentVehicleLabel);
};

const getCurrentTimeValue = (): string => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};
type AppointmentStatus = "Confirmed" | "Pending" | "Cancelled";
type CustomerArrivalStatus = "arrived" | "not_arrived" | null;

// ==================== Constants ====================
const INITIAL_APPOINTMENT_FORM: AppointmentForm = {
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
  // Service Details
  customerComplaintIssue: undefined,
  previousServiceHistory: undefined,
  estimatedServiceTime: undefined,
  estimatedCost: undefined,
  odometerReading: undefined,
  // Documentation
  customerIdProof: undefined,
  vehicleRCCopy: undefined,
  warrantyCardServiceBook: undefined,
  photosVideos: undefined,
  // Operational Details
  estimatedDeliveryDate: undefined,
  assignedServiceAdvisor: undefined,
  assignedTechnician: undefined,
  pickupDropRequired: undefined,
  pickupAddress: undefined,
  dropAddress: undefined,
  preferredCommunicationMode: undefined,
  // Billing & Payment
  paymentMethod: undefined,
  gstRequirement: undefined,
  businessNameForInvoice: undefined,
  // Post-Service Survey
  feedbackRating: undefined,
  nextServiceDueDate: undefined,
  amcSubscriptionStatus: undefined,
};

const INITIAL_COMPLAINT_FORM: ComplaintForm = {
  customerName: "",
  vehicle: "",
  phone: "",
  complaint: "",
  severity: "Medium",
  serviceCenterId: undefined,
};

const INITIAL_DOCUMENTATION_FILES: DocumentationFiles = {
  files: [],
  urls: [],
};

const INITIAL_SERVICE_INTAKE_FORM: ServiceIntakeForm = {
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
  
  // Billing & Payment
  paymentMethod: "",
  gstRequirement: false,
  businessNameForInvoice: "",
  jobCardId: "",
  arrivalMode: "",
  checkInNotes: "",
  checkInSlipNumber: "",
  checkInDate: "",
  checkInTime: "",
};

import { defaultAppointments } from "@/__mocks__/data/appointments.mock";
import { defaultServiceCenters } from "@/__mocks__/data/service-centers.mock";
import { SERVICE_TYPE_OPTIONS } from "@/shared/constants/service-types";

const SERVICE_TYPES = SERVICE_TYPE_OPTIONS;

const SERVICE_CENTER_CODE_MAP: Record<string, string> = {
  "1": "SC001",
  "2": "SC002",
  "3": "SC003",
  "sc-001": "SC001",
  "sc-002": "SC002",
  "sc-003": "SC003",
};

const STATUS_CONFIG: Record<AppointmentStatus, { bg: string; text: string }> = {
  Confirmed: { bg: "bg-green-100", text: "text-green-800" },
  Pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
  Cancelled: { bg: "bg-red-100", text: "text-red-800" },
};

const TOAST_DURATION = 3000;
const DEFAULT_MAX_APPOINTMENTS_PER_DAY = 20; // Default limit if not configured

// ==================== Utility Functions ====================
const formatVehicleString = (vehicle: Vehicle): string => {
  return `${vehicle.vehicleMake} ${vehicle.vehicleModel} (${vehicle.vehicleYear})`;
};

const isCustomerWithVehicles = (customer: unknown): customer is CustomerWithVehicles => {
  if (!customer || typeof customer !== "object") {
    return false;
  }
  return "id" in customer && "name" in customer && "phone" in customer;
};

const getStatusBadgeClass = (status: string): string => {
  const config = STATUS_CONFIG[status as AppointmentStatus] || { bg: "bg-gray-100", text: "text-gray-800" };
  return `px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`;
};

const validateAppointmentForm = (form: AppointmentForm, isCallCenter: boolean = false): string | null => {
  if (!form.customerName || !form.phone || !form.vehicle || !form.serviceType || !form.date || !form.time) {
    return "Please fill in all required fields.";
  }
  if (!/^\d{10}$/.test(form.phone)) {
    return "Please enter a valid 10-digit phone number.";
  }
  if (isCallCenter && !form.serviceCenterId) {
    return "Please select a service center to assign this appointment.";
  }
  // If major issue is checked, customer complaint is required
  return null;
};

const getNextAppointmentId = (appointments: AppointmentRecord[]): number => {
  return appointments.length > 0 ? Math.max(...appointments.map((a) => a.id)) + 1 : 1;
};

/**
 * Get maximum appointments per day for a service center
 * Checks service center settings in localStorage
 */
const getMaxAppointmentsPerDay = (serviceCenterName: string | null | undefined): number => {
  if (!serviceCenterName || typeof window === "undefined") {
    return DEFAULT_MAX_APPOINTMENTS_PER_DAY;
  }

  try {
    const storedCenters = safeStorage.getItem<Record<string, any>>("serviceCenters", {});
    
    // Find service center by name
    const center = Object.values(storedCenters).find(
      (c: any) => c.name === serviceCenterName
    );

    // Check if maxAppointmentsPerDay is configured
    if (center && typeof center.maxAppointmentsPerDay === "number" && center.maxAppointmentsPerDay > 0) {
      return center.maxAppointmentsPerDay;
    }
  } catch (error) {
    console.error("Error reading service center settings:", error);
  }

  return DEFAULT_MAX_APPOINTMENTS_PER_DAY;
};

/**
 * Count appointments for a specific date
 */
const countAppointmentsForDate = (appointments: AppointmentRecord[], date: string): number => {
  return appointments.filter((apt) => apt.date === date).length;
};

// ==================== Reusable Components ====================
// Form Input Component
const FormInput = ({ 
  label, 
  required, 
  value, 
  onChange, 
  placeholder, 
  type = "text", 
  maxLength,
  readOnly,
  className = "",
  ...props 
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  readOnly?: boolean;
  className?: string;
  [key: string]: any;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      readOnly={readOnly}
      className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200 ${
        readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50/50 focus:bg-white"
      } ${className}`}
      {...props}
    />
  </div>
);

// Form Select Component
const FormSelect = ({
  label,
  required,
  value,
  onChange,
  options,
  placeholder,
  className = "",
  ...props
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  [key: string]: any;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200 ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// Customer Info Card Component
const CustomerInfoCard = ({ customer, title = "Customer Information" }: { customer: CustomerWithVehicles; title?: string }) => (
  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
    <h3 className="text-sm font-semibold text-indigo-900 mb-3">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      <div>
        <p className="text-indigo-600 font-medium">Name</p>
        <p className="text-gray-800 font-semibold">{customer.name}</p>
      </div>
      <div>
        <p className="text-indigo-600 font-medium">Phone</p>
        <p className="text-gray-800 font-semibold">{customer.phone}</p>
      </div>
      {customer.email && (
        <div>
          <p className="text-indigo-600 font-medium">Email</p>
          <p className="text-gray-800 font-semibold">{customer.email}</p>
        </div>
      )}
      {customer.address && (
        <div>
          <p className="text-indigo-600 font-medium">Address</p>
          <p className="text-gray-800 font-semibold">{customer.address}</p>
        </div>
      )}
      {customer.lastServiceCenterName && (
        <div className="sm:col-span-2">
          <p className="text-indigo-600 font-medium flex items-center gap-1">
            <Building2 size={14} />
            Last Service Center
          </p>
          <p className="text-gray-800 font-semibold">{customer.lastServiceCenterName}</p>
        </div>
      )}
    </div>
  </div>
);

// Error Alert Component
const ErrorAlert = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
    <AlertCircle className="text-red-600" size={20} strokeWidth={2} />
    <p className="text-red-600 text-sm">{message}</p>
  </div>
);

// ==================== Components ====================
interface ToastProps {
  show: boolean;
  message: string;
  type: ToastType;
}

const Toast = ({ show, message, type }: ToastProps) => {
  if (!show) return null;

  return (
    <div
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[10000] transition-all duration-300"
      style={{ animation: "fadeInDown 0.3s ease-out" }}
    >
      <div
        className={`${
          type === "success" ? "bg-green-600" : "bg-red-600"
        } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}
      >
        {type === "success" ? (
          <CheckCircle size={20} className="flex-shrink-0" />
        ) : (
          <AlertCircle size={20} className="flex-shrink-0" />
        )}
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const StatusBadge = ({ status, size = "sm" }: StatusBadgeProps) => {
  const sizeClass = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm";
  return <span className={`${getStatusBadgeClass(status)} ${sizeClass}`}>{status}</span>;
};

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "md" | "lg" | "xl" | "2xl" | "4xl";
}

const Modal = ({ show, onClose, title, subtitle, children, maxWidth = "2xl" }: ModalProps) => {
  if (!show) return null;

  const maxWidthClass = {
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div
        className={`bg-white rounded-xl md:rounded-2xl shadow-2xl w-full ${maxWidthClass} mx-2 max-h-[90vh] overflow-y-auto p-4 md:p-6 z-[101]`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ==================== Utility Functions ====================
/**
 * Find nearest service center based on customer address
 * Uses simple city matching for mock implementation
 */
const findNearestServiceCenter = (customerAddress: string | undefined): number | null => {
  if (!customerAddress) return null;

  const addressLower = customerAddress.toLowerCase();
  
  // Extract city from address (simple pattern matching)
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

  // If no match, return first active service center
  const activeCenters = defaultServiceCenters.filter((sc) => sc.status === "Active");
  return activeCenters.length > 0 ? activeCenters[0].id : null;
};

// ==================== Main Component ====================
function AppointmentsContent() {
  const { userInfo, userRole } = useRole();
  const serviceCenterName = userInfo?.serviceCenter;
  const isCallCenter = userRole === "call_center";
  const isServiceAdvisor = userRole === "service_advisor";
  const isServiceManager = userRole === "sc_manager";
  const isInventoryManager = userRole === "inventory_manager";
  const canViewCostEstimation = isServiceAdvisor || isServiceManager || isInventoryManager;
  const canAccessBillingSection = isServiceAdvisor || isServiceManager || isInventoryManager;
  const canAccessBusinessName = canAccessBillingSection;
  
  // Permission checks for appointments - SC Manager restrictions
  const canCreateNewAppointment = canCreateAppointment(userRole);
  const canEditCustomerInformation = canEditCustomerInfo(userRole);
  const canEditVehicleInformation = canEditVehicleInfo(userRole);
  const canEditServiceDetailsSection = canEditServiceDetails(userRole);
  const canEditDocumentationSection = canEditDocumentation(userRole);
  const canEditOperationalDetailsSection = canEditOperationalDetails(userRole);
  const canEditBillingPaymentSection = canEditBillingPayment(userRole);
  const canEditPostServiceSection = canEditPostService(userRole);

  // State Management
  const serviceCenterContext = useMemo(() => getServiceCenterContext(), []);
  const shouldFilterAppointments = shouldFilterByServiceCenter(serviceCenterContext);

  // Normalize appointments: if they have assignedServiceCenter but no serviceCenterId, resolve it
  const normalizeAppointments = useCallback((appointments: AppointmentRecord[]): AppointmentRecord[] => {
    return appointments.map((appointment) => {
      // If appointment already has serviceCenterId, return as is
      if (appointment.serviceCenterId) {
        return appointment;
      }
      
      // If appointment has assignedServiceCenter (name) but no serviceCenterId, resolve it
      const assignedCenter = (appointment as any).assignedServiceCenter;
      if (assignedCenter && !appointment.serviceCenterId) {
        const center = staticServiceCenters.find(
          (c) => c.name === assignedCenter
        );
        if (center) {
          return {
            ...appointment,
            serviceCenterId: (center as any).serviceCenterId || center.id?.toString() || null,
            serviceCenterName: assignedCenter,
          };
        }
      }
      
      return appointment;
    });
  }, []);

  const initializeAppointments = () => {
    if (typeof window !== "undefined") {
      const storedAppointments = safeStorage.getItem<AppointmentRecord[]>("appointments", []);
      const baseAppointments = storedAppointments.length > 0 ? storedAppointments : (defaultAppointments as AppointmentRecord[]);
      // Normalize appointments to ensure serviceCenterId is set
      const normalizedAppointments = normalizeAppointments(baseAppointments);
      return shouldFilterAppointments
        ? filterByServiceCenter(normalizedAppointments, serviceCenterContext)
        : normalizedAppointments;
    }
    return defaultAppointments as AppointmentRecord[];
  };

  const [appointments, setAppointments] = useState<AppointmentRecord[]>(initializeAppointments);

  // Initialize workflow mock data on first load
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Only initialize once - check if already initialized
      const initialized = localStorage.getItem("workflowMockDataInitialized");
      if (!initialized) {
        try {
          const { initializeWorkflowMockData } = require("@/__mocks__/data/workflow-mock-data");
          initializeWorkflowMockData();
          localStorage.setItem("workflowMockDataInitialized", "true");
        } catch (error) {
          console.warn("Failed to initialize workflow mock data:", error);
        }
      }
    }
  }, []);

  // Reload appointments from localStorage when component mounts or when serviceCenterContext changes
  useEffect(() => {
    const loadAppointments = () => {
      if (typeof window !== "undefined") {
        const storedAppointments = safeStorage.getItem<AppointmentRecord[]>("appointments", []);
        const baseAppointments = storedAppointments.length > 0 ? storedAppointments : (defaultAppointments as AppointmentRecord[]);
        // Normalize appointments to ensure serviceCenterId is set
        const normalizedAppointments = normalizeAppointments(baseAppointments);
        const filteredAppointments = shouldFilterAppointments
          ? filterByServiceCenter(normalizedAppointments, serviceCenterContext)
          : normalizedAppointments;
        setAppointments(filteredAppointments);
        
        // Persist normalized appointments back to localStorage if they were updated
        const needsUpdate = normalizedAppointments.some((app, index) => {
          const original = baseAppointments[index];
          return original && !original.serviceCenterId && app.serviceCenterId;
        });
        if (needsUpdate) {
          safeStorage.setItem("appointments", normalizedAppointments);
        }
      }
    };

    // Load appointments on mount
    loadAppointments();

    // Listen for storage events (when appointments are updated from another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "appointments") {
        loadAppointments();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [serviceCenterContext, shouldFilterAppointments, normalizeAppointments]);

  const [appointmentForm, setAppointmentForm] = useState<AppointmentForm>(INITIAL_APPOINTMENT_FORM);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRecord | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithVehicles | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [pickupAddressDifferent, setPickupAddressDifferent] = useState<boolean>(false);
  
  // Check if current appointment was created by call center (for service advisor view)
  const isAppointmentCreatedByCallCenter = useMemo(() => {
    return selectedAppointment?.createdByRole === "call_center";
  }, [selectedAppointment]);
  
  // When service advisor views appointment created by call center, call center fields are read-only
  // Call center fields: Customer Info, Vehicle Info, Service Type, Date/Time, Basic Service Details, Pickup/Drop, Communication Mode
  const isCallCenterFieldReadOnly = isServiceAdvisor && isEditing && isAppointmentCreatedByCallCenter;
  const [detailCustomer, setDetailCustomer] = useState<CustomerWithVehicles | null>(null);
  const [currentJobCardId, setCurrentJobCardId] = useState<string | null>(null);
  const [currentJobCard, setCurrentJobCard] = useState<JobCard | null>(null);
  const [arrivalMode, setArrivalMode] = useState<AppointmentForm["arrivalMode"] | null>(null);
  const [checkInSlipData, setCheckInSlipData] = useState<any>(null);
  const [showCheckInSlipModal, setShowCheckInSlipModal] = useState<boolean>(false);
  
  // Service Center States (for call center)
  const [availableServiceCenters] = useState(() => {
    return defaultServiceCenters.filter((sc) => sc.status === "Active");
  });

  const nearestServiceCenterId = selectedCustomer?.address
    ? findNearestServiceCenter(selectedCustomer.address)
    : null;
  const nearestServiceCenter = availableServiceCenters.find((center) => center.id === nearestServiceCenterId);
  const selectedServiceCenter = availableServiceCenters.find((center) => center.id === appointmentForm.serviceCenterId);

  const [serviceCenterSearch, setServiceCenterSearch] = useState<string>("");
  const [showServiceCenterSelector, setShowServiceCenterSelector] = useState<boolean>(false);
  const filteredServiceCenters = useMemo(() => {
    if (!serviceCenterSearch.trim()) {
      return availableServiceCenters;
    }
    const query = serviceCenterSearch.trim().toLowerCase();
    return availableServiceCenters.filter((center) =>
      `${center.name} ${center.location}`.toLowerCase().includes(query)
    );
  }, [availableServiceCenters, serviceCenterSearch]);

  // Modal States
  const [showAppointmentModal, setShowAppointmentModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState<boolean>(false);
  const [showComplaintModal, setShowComplaintModal] = useState<boolean>(false);
  
  // Complaint States
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    if (typeof window !== "undefined") {
      const storedComplaints = safeStorage.getItem<Complaint[]>("complaints", []);
      return storedComplaints;
    }
    return [];
  });
  const [complaintForm, setComplaintForm] = useState<ComplaintForm>(INITIAL_COMPLAINT_FORM);
  const [complaintCustomerSearchQuery, setComplaintCustomerSearchQuery] = useState<string>("");
  const [showComplaintCustomerDropdown, setShowComplaintCustomerDropdown] = useState<boolean>(false);
  const [selectedComplaintCustomer, setSelectedComplaintCustomer] = useState<CustomerWithVehicles | null>(null);
  const complaintCustomerDropdownRef = useRef<HTMLDivElement>(null);

  // Service Intake States (for service advisor)
  const [customerArrivalStatus, setCustomerArrivalStatus] = useState<CustomerArrivalStatus>(null);
  const [serviceIntakeForm, setServiceIntakeForm] = useState<ServiceIntakeForm>(INITIAL_SERVICE_INTAKE_FORM);
  
  // Camera Modal States
  const [cameraModalOpen, setCameraModalOpen] = useState<boolean>(false);
  const [cameraDocumentType, setCameraDocumentType] = useState<keyof Pick<ServiceIntakeForm, "customerIdProof" | "vehicleRCCopy" | "warrantyCardServiceBook" | "photosVideos"> | null>(null);
  const visibleAppointments = useMemo(() => {
    if (shouldFilterAppointments) {
      return filterByServiceCenter(appointments, serviceCenterContext);
    }
    return appointments;
  }, [appointments, serviceCenterContext, shouldFilterAppointments]);

  // Customer Search States
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState<boolean>(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
    show: false,
    message: "",
    type: "success",
  });

  // Customer Search Hook
  const customerSearch = useCustomerSearch();
  const customerSearchResults: CustomerWithVehicles[] = customerSearch.results as CustomerWithVehicles[];
  const typedCustomerSearchResults = customerSearchResults as CustomerWithVehicles[];
  const customerSearchLoading = customerSearch.loading;
  const searchCustomer = customerSearch.search;
  const clearCustomerSearch = customerSearch.clear;
  useEffect(() => {
    if (!selectedAppointment) return;
    searchCustomer(selectedAppointment.phone, "phone");
  }, [selectedAppointment, searchCustomer]);

  // Derive detailCustomer from selectedAppointment and customerSearchResults
  const detailCustomerDerived = useMemo(() => {
    if (!selectedAppointment) {
      return null;
    }
    return customerSearchResults.find(
      (customer) => customer.phone === selectedAppointment.phone
    ) ?? null;
  }, [customerSearchResults, selectedAppointment]);

  useEffect(() => {
    setDetailCustomer(detailCustomerDerived);
  }, [detailCustomerDerived]);

  // ==================== Helper Functions ====================
  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, TOAST_DURATION);
  }, []);

  const resetAppointmentForm = useCallback(() => {
    // Clean up object URLs before resetting form
    setAppointmentForm((prev) => {
      // Revoke all object URLs to prevent memory leaks
      if (prev.customerIdProof?.urls) {
        prev.customerIdProof.urls.forEach((url) => URL.revokeObjectURL(url));
      }
      if (prev.vehicleRCCopy?.urls) {
        prev.vehicleRCCopy.urls.forEach((url) => URL.revokeObjectURL(url));
      }
      if (prev.warrantyCardServiceBook?.urls) {
        prev.warrantyCardServiceBook.urls.forEach((url) => URL.revokeObjectURL(url));
      }
      if (prev.photosVideos?.urls) {
        prev.photosVideos.urls.forEach((url) => URL.revokeObjectURL(url));
      }
      return INITIAL_APPOINTMENT_FORM;
    });
    setCustomerSearchQuery("");
    setSelectedCustomer(null);
    setShowCustomerDropdown(false);
    clearCustomerSearch();
  }, [clearCustomerSearch]);

  const closeAppointmentModal = useCallback(() => {
    setShowAppointmentModal(false);
    setIsEditing(false); // Ensure isEditing is false when modal closes
    setSelectedAppointment(null);
    resetAppointmentForm();
  }, [resetAppointmentForm]);

  const closeDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedAppointment(null);
    setDetailCustomer(null);
    // Clean up object URLs before resetting form
    setServiceIntakeForm((prev) => {
      // Revoke all object URLs to prevent memory leaks
      prev.customerIdProof.urls.forEach((url) => URL.revokeObjectURL(url));
      prev.vehicleRCCopy.urls.forEach((url) => URL.revokeObjectURL(url));
      prev.warrantyCardServiceBook.urls.forEach((url) => URL.revokeObjectURL(url));
      prev.photosVideos.urls.forEach((url) => URL.revokeObjectURL(url));
      return INITIAL_SERVICE_INTAKE_FORM;
    });
    setCustomerArrivalStatus(null);
    clearCustomerSearch();
    setCurrentJobCardId(null);
  }, [clearCustomerSearch]);

  const closeVehicleDetailsModal = useCallback(() => {
    setShowVehicleDetails(false);
    setSelectedVehicle(null);
    clearCustomerSearch();
  }, [clearCustomerSearch]);

  // ==================== Event Handlers ====================
  const handleAppointmentClick = useCallback((appointment: AppointmentRecord) => {
    setSelectedAppointment(appointment);
    setDetailCustomer(null);
    setShowDetailModal(true);
    setIsEditing(false);
    // Reset service intake form when opening appointment details
    setCustomerArrivalStatus(null);
    setServiceIntakeForm(INITIAL_SERVICE_INTAKE_FORM);
  }, []);

  const handleEditAppointment = useCallback(
    (appointment: AppointmentRecord) => {
      setSelectedAppointment(appointment);
      setIsEditing(true);
      const resolvedServiceCenterId =
        typeof appointment.serviceCenterId === "number"
          ? appointment.serviceCenterId
          : appointment.serviceCenterId
          ? Number(appointment.serviceCenterId)
          : undefined;
      setAppointmentForm({
        customerName: appointment.customerName,
        vehicle: appointment.vehicle,
        phone: appointment.phone,
        serviceType: appointment.serviceType,
        date: appointment.date,
        time: appointment.time,
        // Strip the " hours" suffix if it exists; default to "2"
        duration: appointment.duration ? appointment.duration.replace(" hours", "") : "2",
        serviceCenterId: resolvedServiceCenterId,
        // Customer Information
        customerType: appointment.customerType,
        // Service Details
        customerComplaintIssue: appointment.customerComplaintIssue,
        previousServiceHistory: appointment.previousServiceHistory,
        estimatedServiceTime: appointment.estimatedServiceTime,
        estimatedCost: appointment.estimatedCost,
        odometerReading: appointment.odometerReading,
        // Operational Details
        estimatedDeliveryDate: appointment.estimatedDeliveryDate,
        assignedServiceAdvisor: appointment.assignedServiceAdvisor,
        assignedTechnician: appointment.assignedTechnician,
        pickupDropRequired: appointment.pickupDropRequired,
        pickupAddress: appointment.pickupAddress,
        dropAddress: appointment.dropAddress,
        preferredCommunicationMode: appointment.preferredCommunicationMode,
        // Billing & Payment
        paymentMethod: appointment.paymentMethod,
        gstRequirement: appointment.gstRequirement,
        businessNameForInvoice: appointment.businessNameForInvoice,
        // Post-Service Survey
        feedbackRating: appointment.feedbackRating,
        nextServiceDueDate: appointment.nextServiceDueDate,
        amcSubscriptionStatus: appointment.amcSubscriptionStatus,
      });
      setCustomerSearchQuery(appointment.customerName);
      setSelectedCustomer(null);
      setShowCustomerDropdown(false);
      clearCustomerSearch();
      setShowDetailModal(false);
      setShowAppointmentModal(true);
    },
    [clearCustomerSearch]
  );

  const handleDeleteAppointment = useCallback(
    (id: number) => {
      const appointmentToDelete = appointments.find((apt) => apt.id === id);
      const updatedAppointments = appointments.filter((apt) => apt.id !== id);
      setAppointments(updatedAppointments);
      safeStorage.setItem("appointments", updatedAppointments);
      closeDetailModal();
      showToast(
        appointmentToDelete
          ? `Appointment for ${appointmentToDelete.customerName} deleted successfully!`
          : "Appointment deleted successfully!",
        "success"
      );
    },
    [appointments, closeDetailModal, showToast]
  );

  const handleCustomerSearchChange = useCallback(
    (value: string) => {
      // Only block search when editing AND user doesn't have permission
      // Allow search when creating (not editing) for all roles
      if (isEditing && !canEditCustomerInformation) {
        return;
      }
      
      setCustomerSearchQuery(value);
      setAppointmentForm((prev) => ({ ...prev, customerName: value }));

      if (value.trim().length >= 2) {
        searchCustomer(value, "name");
        setShowCustomerDropdown(true);
      } else {
        clearCustomerSearch();
        setShowCustomerDropdown(false);
        setSelectedCustomer(null);
        setAppointmentForm((prev) => ({
          ...prev,
          customerName: value,
          phone: "",
          vehicle: "",
        }));
      }
    },
    [searchCustomer, clearCustomerSearch, isEditing, canEditCustomerInformation]
  );

  const handleCustomerSelect = useCallback(
    (customer: CustomerWithVehicles) => {
      setSelectedCustomer(customer);
      setCustomerSearchQuery(customer.name);
      setShowCustomerDropdown(false);
      clearCustomerSearch();

      const firstVehicle =
        customer.vehicles && customer.vehicles.length > 0 ? formatVehicleString(customer.vehicles[0]) : "";

      // Auto-suggest nearest service center for call center users
      let suggestedServiceCenterId: number | undefined = undefined;
      let suggestedServiceCenterName: string | undefined = undefined;
      if (isCallCenter && customer.address) {
        const nearestId = findNearestServiceCenter(customer.address);
        const nearestCenter = availableServiceCenters.find((sc) => sc.id === nearestId);
        if (nearestId) {
          suggestedServiceCenterId = nearestId;
          suggestedServiceCenterName = nearestCenter?.name;
        }
      }

      setAppointmentForm((prev) => ({
        ...prev,
        customerName: customer.name,
        phone: customer.phone,
        vehicle: firstVehicle,
        serviceCenterId: suggestedServiceCenterId,
        serviceCenterName: suggestedServiceCenterName,
      }));
    },
    [clearCustomerSearch, isCallCenter, availableServiceCenters]
  );

  const handleAssignNearestServiceCenter = useCallback(() => {
    if (!selectedCustomer?.address) return;
    const nearestId = findNearestServiceCenter(selectedCustomer.address);
    const nearestCenter = availableServiceCenters.find((sc) => sc.id === nearestId);
    if (nearestId) {
      setAppointmentForm((prev) => ({
        ...prev,
        serviceCenterId: nearestId,
        serviceCenterName: nearestCenter?.name,
      }));
    }
  }, [selectedCustomer, availableServiceCenters]);

  // Convert Appointment to Job Card
  const convertAppointmentToJobCard = useCallback(async (appointment: AppointmentRecord): Promise<JobCard> => {
    const serviceCenterId = serviceCenterContext.serviceCenterId?.toString() || appointment.serviceCenterId?.toString() || "sc-001";
    const serviceCenterCode = SERVICE_CENTER_CODE_MAP[serviceCenterId] || "SC001";
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    
    // Get next sequence number
    const existingJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
    const lastJobCard = existingJobCards
      .filter((jc) => jc.jobCardNumber?.startsWith(`${serviceCenterCode}-${year}-${month}`))
      .sort((a, b) => {
        const aSeq = parseInt(a.jobCardNumber?.split("-")[3] || "0");
        const bSeq = parseInt(b.jobCardNumber?.split("-")[3] || "0");
        return bSeq - aSeq;
      })[0];
    
    const nextSequence = lastJobCard
      ? parseInt(lastJobCard.jobCardNumber?.split("-")[3] || "0") + 1
      : 1;
    
    const jobCardNumber = `${serviceCenterCode}-${year}-${month}-${String(nextSequence).padStart(4, "0")}`;
    
    // Extract vehicle details from appointment vehicle string (format: "Make Model (Year)")
    const vehicleParts = appointment.vehicle.match(/^(.+?)\s+(.+?)\s+\((\d+)\)$/);
    const vehicleMake = vehicleParts ? vehicleParts[1] : appointment.vehicle.split(" ")[0] || "";
    const vehicleModel = vehicleParts ? vehicleParts[2] : appointment.vehicle.split(" ").slice(1, -1).join(" ") || "";
    
    // Try to fetch customer and vehicle data to populate PART 1
    let customerData: CustomerWithVehicles | null = null;
    let vehicleData: Vehicle | null = null;
    
    // Try to find customer by phone or external ID
    if (appointment.customerExternalId) {
      try {
        customerData = await customerService.getById(appointment.customerExternalId);
        // Find matching vehicle
        if (customerData.vehicles) {
          vehicleData = customerData.vehicles.find((v) => {
            const vehicleString = formatVehicleString(v);
            return vehicleString === appointment.vehicle || 
                   v.vehicleMake === vehicleMake || 
                   v.registration === appointment.vehicle;
          }) || customerData.vehicles[0] || null;
        }
      } catch (err) {
        console.warn("Could not fetch customer data for job card:", err);
      }
    }
    
    // Populate PART 1 from customer/vehicle data or use appointment data
    const part1 = customerData && vehicleData
      ? populateJobCardPart1(
          customerData,
          vehicleData,
          jobCardNumber,
          {
            customerFeedback: appointment.customerComplaintIssue || "",
            estimatedDeliveryDate: appointment.estimatedDeliveryDate || "",
            warrantyStatus: "", // Will be filled from service intake form
          }
        )
      : createEmptyJobCardPart1(jobCardNumber);
    
    // If customer/vehicle data not found, populate from appointment
    if (!customerData) {
      part1.fullName = appointment.customerName;
      part1.mobilePrimary = appointment.phone;
      part1.customerType = appointment.customerType || "";
      part1.customerFeedback = appointment.customerComplaintIssue || "";
      part1.estimatedDeliveryDate = appointment.estimatedDeliveryDate || "";
    }
    if (!vehicleData) {
      part1.vehicleBrand = vehicleMake;
      part1.vehicleModel = vehicleModel;
      part1.registrationNumber = ""; // Will be filled from service intake form
    }
    
    // Create job card from appointment with structured PART 1
    const newJobCard: JobCard = {
      id: `JC-${Date.now()}`,
      jobCardNumber,
      serviceCenterId: appointment.serviceCenterId?.toString() || serviceCenterContext.serviceCenterId?.toString() || "sc-001",
      serviceCenterCode,
      customerId: customerData?.id?.toString() || appointment.customerExternalId?.toString() || `customer-${appointment.id}`,
      customerName: appointment.customerName,
      vehicleId: vehicleData?.id?.toString(),
      vehicle: appointment.vehicle,
      registration: vehicleData?.registration || "",
      vehicleMake,
      vehicleModel,
      customerType: appointment.customerType,
      serviceType: appointment.serviceType,
      description: appointment.customerComplaintIssue || `Service: ${appointment.serviceType}`,
      status: "Created",
      priority: "Normal",
      assignedEngineer: appointment.assignedTechnician || null,
      estimatedCost: appointment.estimatedCost ? `₹${appointment.estimatedCost}` : "₹0",
      estimatedTime: appointment.estimatedServiceTime || "To be determined",
      createdAt: new Date().toISOString(),
      parts: [],
      location: "Station",
      quotationId: undefined, // No quotation yet
      sourceAppointmentId: appointment.id,
      isTemporary: true,
      customerArrivalTimestamp: new Date().toISOString(),
      // Structured PART 1 data
      part1,
      // PART 2 will be populated from service intake form
      part2: [],
      // PART 2A and PART 3 will be populated later if needed
    };
    
    // Save job card
    const updatedJobCards = [...existingJobCards, newJobCard];
    safeStorage.setItem("jobCards", updatedJobCards);
    setCurrentJobCardId(newJobCard.id);
    
    return newJobCard;
  }, [serviceCenterContext]);

  const updateStoredJobCard = useCallback(
    (jobId: string, updater: (card: JobCard) => JobCard) => {
      const stored = safeStorage.getItem<JobCard[]>("jobCards", []);
      const updated = stored.map((card) => (card.id === jobId ? updater(card) : card));
      safeStorage.setItem("jobCards", updated);
      return updated.find((card) => card.id === jobId) ?? null;
    },
    []
  );

  const handleSaveDraft = useCallback(async () => {
    if (!currentJobCardId) {
      showToast("Please arrive a customer before saving a draft.", "error");
      return;
    }
    
    // Try to fetch customer data for PART 1
    let customerData: CustomerWithVehicles | null = null;
    let vehicleData: Vehicle | null = null;
    
    if (selectedCustomer) {
      customerData = selectedCustomer;
      vehicleData = selectedCustomer.vehicles?.find((v) => 
        formatVehicleString(v) === selectedAppointment?.vehicle
      ) || selectedCustomer.vehicles?.[0] || null;
    } else if (detailCustomer) {
      customerData = detailCustomer;
      vehicleData = detailCustomer.vehicles?.find((v) => 
        formatVehicleString(v) === selectedAppointment?.vehicle
      ) || detailCustomer.vehicles?.[0] || null;
    }
    
    const intakeSnapshot = {
      ...serviceIntakeForm,
      customerIdProof: {
        files: [],
        urls: serviceIntakeForm.customerIdProof.urls,
      },
      vehicleRCCopy: {
        files: [],
        urls: serviceIntakeForm.vehicleRCCopy.urls,
      },
      warrantyCardServiceBook: {
        files: [],
        urls: serviceIntakeForm.warrantyCardServiceBook.urls,
      },
      photosVideos: {
        files: [],
        urls: serviceIntakeForm.photosVideos.urls,
      },
    };

    // Get current job card to preserve jobCardNumber
    const storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
    const currentJobCard = storedJobCards.find((card) => card.id === currentJobCardId);
    const jobCardNumber = currentJobCard?.jobCardNumber || "";

    // Populate PART 1 from service intake form
    const part1 = customerData && vehicleData
      ? populateJobCardPart1(
          customerData,
          vehicleData,
          jobCardNumber,
          {
            customerFeedback: serviceIntakeForm.customerComplaintIssue || "",
            technicianObservation: serviceIntakeForm.checkInNotes || "",
            insuranceStartDate: serviceIntakeForm.insuranceStartDate || "",
            insuranceEndDate: serviceIntakeForm.insuranceEndDate || "",
            insuranceCompanyName: serviceIntakeForm.insuranceCompanyName || "",
            variantBatteryCapacity: serviceIntakeForm.variantBatteryCapacity || "",
            warrantyStatus: serviceIntakeForm.warrantyStatus || "",
            estimatedDeliveryDate: serviceIntakeForm.estimatedDeliveryDate || "",
            batterySerialNumber: "", // Will be filled if applicable
            mcuSerialNumber: "", // Will be filled if applicable
            vcuSerialNumber: "", // Will be filled if applicable
            otherPartSerialNumber: "", // Will be filled if applicable
          }
        )
      : createEmptyJobCardPart1(jobCardNumber);

    // Override with service intake form data
    if (serviceIntakeForm.vehicleBrand) part1.vehicleBrand = serviceIntakeForm.vehicleBrand;
    if (serviceIntakeForm.vehicleModel) part1.vehicleModel = serviceIntakeForm.vehicleModel;
    if (serviceIntakeForm.registrationNumber) part1.registrationNumber = serviceIntakeForm.registrationNumber;
    if (serviceIntakeForm.vinChassisNumber) part1.vinChassisNumber = serviceIntakeForm.vinChassisNumber;
    if (serviceIntakeForm.variantBatteryCapacity) part1.variantBatteryCapacity = serviceIntakeForm.variantBatteryCapacity;
    if (serviceIntakeForm.warrantyStatus) part1.warrantyStatus = serviceIntakeForm.warrantyStatus;
    if (serviceIntakeForm.estimatedDeliveryDate) part1.estimatedDeliveryDate = serviceIntakeForm.estimatedDeliveryDate;
    if (serviceIntakeForm.customerComplaintIssue) part1.customerFeedback = serviceIntakeForm.customerComplaintIssue;
    if (serviceIntakeForm.checkInNotes) part1.technicianObservation = serviceIntakeForm.checkInNotes;
    if (serviceIntakeForm.insuranceStartDate) part1.insuranceStartDate = serviceIntakeForm.insuranceStartDate;
    if (serviceIntakeForm.insuranceEndDate) part1.insuranceEndDate = serviceIntakeForm.insuranceEndDate;
    if (serviceIntakeForm.insuranceCompanyName) part1.insuranceCompanyName = serviceIntakeForm.insuranceCompanyName;

    const updated = updateStoredJobCard(currentJobCardId, (card) => ({
      ...card,
      status: "Created",
      draftIntake: intakeSnapshot,
      // Update PART 1 with service intake form data
      part1,
      // PART 2 will be populated when parts are added
      part2: card.part2 || [],
    }));
    if (updated) {
      setCurrentJobCardId(updated.id);
    }
    showToast("Job card saved as draft.", "success");
  }, [currentJobCardId, showToast, updateStoredJobCard, serviceIntakeForm, selectedCustomer, detailCustomer, selectedAppointment]);

  const handleViewVehicleDetails = useCallback(() => {
    if (!selectedAppointment) return;
    searchCustomer(selectedAppointment.phone, "phone");
    setShowVehicleDetails(true);
  }, [selectedAppointment, searchCustomer]);

  useEffect(() => {
    if (!currentJobCardId) {
      setCurrentJobCard(null);
      return;
    }
    const storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
    const jobCard = storedJobCards.find((card) => card.id === currentJobCardId) ?? null;
    setCurrentJobCard(jobCard);
  }, [currentJobCardId]);

  // Generate check-in slip data
  const generateCheckInSlipData = useCallback((): CheckInSlipData | null => {
    if (!selectedAppointment || !currentJobCard) return null;

    const serviceCenterId = selectedAppointment.serviceCenterId?.toString() || serviceCenterContext.serviceCenterId?.toString() || "sc-001";
    const serviceCenterCode = SERVICE_CENTER_CODE_MAP[serviceCenterId] || "SC001";
    const serviceCenter = defaultServiceCenters.find(
      (sc) => (sc as any).serviceCenterId === serviceCenterId || sc.id?.toString() === serviceCenterId
    );

    const now = new Date();
    const checkInDate = serviceIntakeForm.checkInDate || now.toISOString().split("T")[0];
    const checkInTime = serviceIntakeForm.checkInTime || now.toTimeString().slice(0, 5);
    const slipNumber = serviceIntakeForm.checkInSlipNumber || generateCheckInSlipNumber(serviceCenterCode);

    // Extract vehicle details
    const vehicleParts = selectedAppointment.vehicle.match(/^(.+?)\s+(.+?)\s+\((\d+)\)$/);
    const vehicleMake = vehicleParts ? vehicleParts[1] : selectedAppointment.vehicle.split(" ")[0] || "";
    const vehicleModel = vehicleParts ? vehicleParts[2] : selectedAppointment.vehicle.split(" ").slice(1, -1).join(" ") || "";

    // Get registration from service intake form or job card
    const registrationNumber = serviceIntakeForm.registrationNumber || currentJobCard.registration || "";
    const vin = serviceIntakeForm.vinChassisNumber || currentJobCard.vehicleId || "";

    // Get customer email if available
    const customerEmail = detailCustomer?.email || selectedCustomer?.email || undefined;

    // Parse service center location for address components
    const locationParts = serviceCenter?.location?.split(",") || [];
    const serviceCenterAddress = locationParts[0]?.trim() || serviceCenter?.location || "";
    const serviceCenterCity = locationParts[1]?.trim() || "";
    const serviceCenterState = locationParts[2]?.trim() || "";
    const serviceCenterPincode = ""; // Not in mock data, can be added later

    return {
      slipNumber,
      customerName: selectedAppointment.customerName,
      phone: selectedAppointment.phone,
      email: customerEmail,
      vehicleMake,
      vehicleModel,
      registrationNumber,
      vin: vin || undefined,
      checkInDate,
      checkInTime,
      serviceCenterName: serviceCenter?.name || serviceCenterContext.serviceCenterName || "Service Center",
      serviceCenterAddress,
      serviceCenterCity,
      serviceCenterState,
      serviceCenterPincode,
      serviceCenterPhone: undefined, // Can be added to service center data
      expectedServiceDate: serviceIntakeForm.estimatedDeliveryDate || selectedAppointment.estimatedDeliveryDate || undefined,
      serviceType: serviceIntakeForm.serviceType || selectedAppointment.serviceType || undefined,
      notes: serviceIntakeForm.checkInNotes || undefined,
    };
  }, [selectedAppointment, currentJobCard, serviceIntakeForm, detailCustomer, selectedCustomer, serviceCenterContext]);

  const handleArrivalModeSelect = useCallback((mode: AppointmentForm["arrivalMode"] | null) => {
    if (!selectedAppointment) return;

    setArrivalMode(mode);
    setServiceIntakeForm((prev) => ({ ...prev, arrivalMode: mode || "" }));

    // If vehicle is present, generate check-in slip immediately
    if (mode === "vehicle_present") {
      // Ensure job card exists
      if (!currentJobCardId) {
        showToast("Please wait for job card to be created first.", "error");
        setArrivalMode(null);
        setServiceIntakeForm((prev) => ({ ...prev, arrivalMode: "" }));
        return;
      }

      // Generate check-in slip data
      const slipData = generateCheckInSlipData();
      if (slipData) {
        setCheckInSlipData(slipData);
        setServiceIntakeForm((prev) => ({
          ...prev,
          checkInSlipNumber: slipData.slipNumber,
          checkInDate: slipData.checkInDate,
          checkInTime: slipData.checkInTime,
        }));

        // Show check-in slip modal
        setShowCheckInSlipModal(true);
        showToast("Check-in slip generated. Vehicle is confirmed at service center.", "success");
      }
    } else if (mode === "vehicle_absent") {
      // Check if pickup/drop address is provided
      const hasPickupAddress = selectedAppointment.pickupDropRequired && 
        (selectedAppointment.pickupAddress || selectedAppointment.dropAddress);
      
      if (!hasPickupAddress) {
        showToast("Vehicle Absent mode requires pickup/drop address. Please update appointment with pickup/drop address first.", "error");
        setArrivalMode(null);
        setServiceIntakeForm((prev) => ({ ...prev, arrivalMode: "" }));
        return;
      }

      // For vehicle absent with pickup address, check-in slip will be generated when vehicle is picked up
      setCheckInSlipData(null);
      showToast("Vehicle will be picked up from provided address. Check-in slip will be generated when vehicle arrives.", "success");
    }
  }, [selectedAppointment, currentJobCardId, generateCheckInSlipData, showToast]);

  useEffect(() => {
    if (!currentJobCardId) {
      setCurrentJobCard(null);
      return;
    }
    const storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
    const jobCard = storedJobCards.find((card) => card.id === currentJobCardId) ?? null;
    setCurrentJobCard(jobCard);
  }, [currentJobCardId]);

  const handleSubmitAppointment = useCallback(() => {
    const validationError = validateAppointmentForm(appointmentForm, isCallCenter);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    const contextServiceCenterId = serviceCenterContext.serviceCenterId
      ? Number(serviceCenterContext.serviceCenterId)
      : undefined;
    const contextServiceCenterName = serviceCenterContext.serviceCenterName ?? undefined;

    // Check maximum appointments per day limit (only for new appointments)
    if (!isEditing) {
      const maxAppointments = getMaxAppointmentsPerDay(serviceCenterName);
      const appointmentsForDate = countAppointmentsForDate(visibleAppointments, appointmentForm.date);
      
      if (appointmentsForDate >= maxAppointments) {
        showToast(
          `Maximum appointments limit reached for ${appointmentForm.date}. Maximum allowed: ${maxAppointments} appointments per day.`,
          "error"
        );
        return;
      }
    }

    if (isEditing && selectedAppointment) {
      // Check limit when editing if date is changed
      if (selectedAppointment.date !== appointmentForm.date) {
        const maxAppointments = getMaxAppointmentsPerDay(serviceCenterName);
        const appointmentsForDate = countAppointmentsForDate(
          visibleAppointments.filter((apt) => apt.id !== selectedAppointment.id),
          appointmentForm.date
        );
        
        if (appointmentsForDate >= maxAppointments) {
          showToast(
            `Maximum appointments limit reached for ${appointmentForm.date}. Maximum allowed: ${maxAppointments} appointments per day.`,
            "error"
          );
          return;
        }
      }

      // Get service center name if service center is selected
      const selectedServiceCenter = appointmentForm.serviceCenterId
        ? availableServiceCenters.find((sc) => sc.id === appointmentForm.serviceCenterId)
        : contextServiceCenterId
        ? availableServiceCenters.find((sc) => sc.id === contextServiceCenterId)
        : null;

      const updatedAppointments = appointments.map((apt) =>
        apt.id === selectedAppointment.id
          ? {
              ...apt,
              ...appointmentForm,
      duration: "2 hours",
              status: apt.status,
              serviceCenterId: appointmentForm.serviceCenterId,
              serviceCenterName: selectedServiceCenter?.name,
              estimatedServiceTime: appointmentForm.estimatedServiceTime,
            }
          : apt
      );
      setAppointments(updatedAppointments);
      safeStorage.setItem("appointments", updatedAppointments);
      
      const successMessage = selectedServiceCenter
        ? `Appointment updated and assigned to ${selectedServiceCenter.name}!`
        : "Appointment updated successfully!";
      showToast(successMessage, "success");
    } else {
      // Get service center name if service center is selected
      const selectedServiceCenter = appointmentForm.serviceCenterId
        ? availableServiceCenters.find((sc) => sc.id === appointmentForm.serviceCenterId)
        : null;

      const newAppointment: AppointmentRecord = {
        id: getNextAppointmentId(appointments),
        ...appointmentForm,
        duration: "2 hours",
        status: "Confirmed",
        serviceCenterId: appointmentForm.serviceCenterId ?? contextServiceCenterId,
        serviceCenterName: selectedServiceCenter?.name ?? contextServiceCenterName,
        estimatedServiceTime: appointmentForm.estimatedServiceTime,
        createdByRole: isCallCenter ? "call_center" : isServiceAdvisor ? "service_advisor" : undefined,
      };
      const updatedAppointments = [...appointments, newAppointment];
      setAppointments(updatedAppointments);
      safeStorage.setItem("appointments", updatedAppointments);
      
      const successMessage = selectedServiceCenter
        ? `Appointment scheduled successfully and assigned to ${selectedServiceCenter.name}!`
        : "Appointment scheduled successfully!";
      showToast(successMessage, "success");
    }

    closeAppointmentModal();
  }, [appointmentForm, isEditing, selectedAppointment, appointments, serviceCenterName, availableServiceCenters, isCallCenter, showToast, closeAppointmentModal, visibleAppointments, serviceCenterContext]);

  const handleOpenNewAppointment = useCallback(() => {
    // Check permission before allowing appointment creation
    if (!canCreateNewAppointment) {
      showToast("You do not have permission to create new appointments.", "error");
      return;
    }
    setIsEditing(false); // Ensure isEditing is false when creating new appointment (allows search to work)
    setShowAppointmentModal(true);
    resetAppointmentForm();
  }, [canCreateNewAppointment, resetAppointmentForm, showToast]);

  // Complaint handlers
  const resetComplaintForm = useCallback(() => {
    setComplaintForm(INITIAL_COMPLAINT_FORM);
    setComplaintCustomerSearchQuery("");
    setSelectedComplaintCustomer(null);
    setShowComplaintCustomerDropdown(false);
    clearCustomerSearch();
  }, [clearCustomerSearch]);

  const closeComplaintModal = useCallback(() => {
    setShowComplaintModal(false);
    resetComplaintForm();
  }, [resetComplaintForm]);

  const handleComplaintCustomerSearchChange = useCallback(
    (value: string) => {
      setComplaintCustomerSearchQuery(value);
      setComplaintForm((prev) => ({ ...prev, customerName: value }));

      if (value.trim().length >= 2) {
        searchCustomer(value, "name");
        setShowComplaintCustomerDropdown(true);
      } else {
        clearCustomerSearch();
        setShowComplaintCustomerDropdown(false);
        setSelectedComplaintCustomer(null);
        setComplaintForm((prev) => ({
          ...prev,
          customerName: value,
          phone: "",
          vehicle: "",
        }));
      }
    },
    [searchCustomer, clearCustomerSearch]
  );

  const handleComplaintCustomerSelect = useCallback(
    (customer: CustomerWithVehicles) => {
      setSelectedComplaintCustomer(customer);
      setComplaintCustomerSearchQuery(customer.name);
      setShowComplaintCustomerDropdown(false);
      clearCustomerSearch();

      const firstVehicle =
        customer.vehicles && customer.vehicles.length > 0 ? formatVehicleString(customer.vehicles[0]) : "";

      // Auto-suggest nearest service center for call center users
      let suggestedServiceCenterId: number | undefined = undefined;
      if (isCallCenter && customer.address) {
        const nearestId = findNearestServiceCenter(customer.address);
        if (nearestId) {
          suggestedServiceCenterId = nearestId;
        }
      }

      setComplaintForm((prev) => ({
        ...prev,
        customerName: customer.name,
        phone: customer.phone,
        vehicle: firstVehicle,
        serviceCenterId: suggestedServiceCenterId,
      }));
    },
    [clearCustomerSearch, isCallCenter]
  );

  const handleSubmitComplaint = useCallback(() => {
    if (!complaintForm.customerName || !complaintForm.phone || !complaintForm.vehicle || !complaintForm.complaint) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    if (!/^\d{10}$/.test(complaintForm.phone)) {
      showToast("Please enter a valid 10-digit phone number.", "error");
      return;
    }

    if (isCallCenter && !complaintForm.serviceCenterId) {
      showToast("Please select a service center to assign this complaint.", "error");
      return;
    }

    // Get service center name if service center is selected
    const selectedServiceCenter = complaintForm.serviceCenterId
      ? availableServiceCenters.find((sc) => sc.id === complaintForm.serviceCenterId)
      : null;

    const newComplaint: Complaint = {
      id: complaints.length > 0 ? Math.max(...complaints.map((c) => c.id)) + 1 : 1,
      customerName: complaintForm.customerName,
      vehicle: complaintForm.vehicle,
      phone: complaintForm.phone,
      complaint: complaintForm.complaint,
      severity: complaintForm.severity,
      status: "Open",
      serviceCenterId: complaintForm.serviceCenterId,
      serviceCenterName: selectedServiceCenter?.name,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updatedComplaints = [...complaints, newComplaint];
    setComplaints(updatedComplaints);
    safeStorage.setItem("complaints", updatedComplaints);

    const successMessage = selectedServiceCenter
      ? `Complaint created successfully and assigned to ${selectedServiceCenter.name}!`
      : "Complaint created successfully!";
    showToast(successMessage, "success");

    closeComplaintModal();
  }, [complaintForm, complaints, isCallCenter, availableServiceCenters, showToast, closeComplaintModal]);

  // File Upload Handlers
  const handleDocumentUpload = useCallback(
    (documentType: keyof Pick<ServiceIntakeForm, "customerIdProof" | "vehicleRCCopy" | "warrantyCardServiceBook" | "photosVideos">, files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const newUrls = fileArray.map((file) => URL.createObjectURL(file));

      setServiceIntakeForm((prev) => ({
        ...prev,
        [documentType]: {
          files: [...prev[documentType].files, ...fileArray],
          urls: [...prev[documentType].urls, ...newUrls],
        },
      }));
    },
    []
  );

  const handleRemoveDocument = useCallback(
    (documentType: keyof Pick<ServiceIntakeForm, "customerIdProof" | "vehicleRCCopy" | "warrantyCardServiceBook" | "photosVideos">, index: number) => {
      setServiceIntakeForm((prev) => {
        const updated = { ...prev };
        const doc = updated[documentType];
        
        // Revoke object URL to free memory
        if (doc.urls[index]) {
          URL.revokeObjectURL(doc.urls[index]);
        }
        
        updated[documentType] = {
          files: doc.files.filter((_, i) => i !== index),
          urls: doc.urls.filter((_, i) => i !== index),
        };
        return updated;
      });
    },
    []
  );

  // Camera Handlers
  const handleOpenCamera = useCallback(
    (documentType: keyof Pick<ServiceIntakeForm, "customerIdProof" | "vehicleRCCopy" | "warrantyCardServiceBook" | "photosVideos">) => {
      setCameraDocumentType(documentType);
      setCameraModalOpen(true);
    },
    []
  );

  const handleCameraCapture = useCallback(
    (file: File) => {
      if (!cameraDocumentType) return;

      const newUrl = URL.createObjectURL(file);
      setServiceIntakeForm((prev) => ({
        ...prev,
        [cameraDocumentType]: {
          files: [...prev[cameraDocumentType].files, file],
          urls: [...prev[cameraDocumentType].urls, newUrl],
        },
      }));
      setCameraModalOpen(false);
      setCameraDocumentType(null);
      
      // Show success message
      const documentTypeNames: Record<typeof cameraDocumentType, string> = {
        customerIdProof: "Customer ID Proof",
        vehicleRCCopy: "Vehicle RC Copy",
        warrantyCardServiceBook: "Warranty Card / Service Book",
        photosVideos: "Vehicle Photo",
      };
      showToast(`Photo captured and added to ${documentTypeNames[cameraDocumentType]}`, "success");
    },
    [cameraDocumentType, showToast]
  );

  // Router for navigation
  const router = useRouter();
  const searchParams = useSearchParams();


  // Service Intake Handlers - Convert to Estimation/Quotation
  const handleConvertToQuotation = useCallback(async () => {
    if (!selectedAppointment) return;

    // Basic validation
    if (!serviceIntakeForm.vehicleBrand || !serviceIntakeForm.registrationNumber || !serviceIntakeForm.serviceType || !serviceIntakeForm.customerComplaintIssue) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    if (!currentJobCardId) {
      showToast("Select an arrival mode to generate the job card before creating a quotation.", "error");
      return;
    }

    // Try to fetch customer data for PART 1
    let customerData: CustomerWithVehicles | null = null;
    let vehicleData: Vehicle | null = null;
    
    if (selectedCustomer) {
      customerData = selectedCustomer;
      vehicleData = selectedCustomer.vehicles?.find((v) => 
        formatVehicleString(v) === selectedAppointment.vehicle
      ) || selectedCustomer.vehicles?.[0] || null;
    } else if (detailCustomer) {
      customerData = detailCustomer;
      vehicleData = detailCustomer.vehicles?.find((v) => 
        formatVehicleString(v) === selectedAppointment.vehicle
      ) || detailCustomer.vehicles?.[0] || null;
    }

    // Get current job card to preserve jobCardNumber
    const storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
    const currentJobCard = storedJobCards.find((card) => card.id === currentJobCardId);
    const jobCardNumber = currentJobCard?.jobCardNumber || "";

    // Populate PART 1 from service intake form
    const part1 = customerData && vehicleData
      ? populateJobCardPart1(
          customerData,
          vehicleData,
          jobCardNumber,
          {
            customerFeedback: serviceIntakeForm.customerComplaintIssue || "",
            technicianObservation: serviceIntakeForm.checkInNotes || "",
            insuranceStartDate: serviceIntakeForm.insuranceStartDate || "",
            insuranceEndDate: serviceIntakeForm.insuranceEndDate || "",
            insuranceCompanyName: serviceIntakeForm.insuranceCompanyName || "",
            variantBatteryCapacity: serviceIntakeForm.variantBatteryCapacity || "",
            warrantyStatus: serviceIntakeForm.warrantyStatus || "",
            estimatedDeliveryDate: serviceIntakeForm.estimatedDeliveryDate || "",
          }
        )
      : createEmptyJobCardPart1(jobCardNumber);

    // Override with service intake form data
    if (serviceIntakeForm.vehicleBrand) part1.vehicleBrand = serviceIntakeForm.vehicleBrand;
    if (serviceIntakeForm.vehicleModel) part1.vehicleModel = serviceIntakeForm.vehicleModel;
    if (serviceIntakeForm.registrationNumber) part1.registrationNumber = serviceIntakeForm.registrationNumber;
    if (serviceIntakeForm.vinChassisNumber) part1.vinChassisNumber = serviceIntakeForm.vinChassisNumber;
    if (serviceIntakeForm.variantBatteryCapacity) part1.variantBatteryCapacity = serviceIntakeForm.variantBatteryCapacity;
    if (serviceIntakeForm.warrantyStatus) part1.warrantyStatus = serviceIntakeForm.warrantyStatus;
    if (serviceIntakeForm.estimatedDeliveryDate) part1.estimatedDeliveryDate = serviceIntakeForm.estimatedDeliveryDate;
    if (serviceIntakeForm.customerComplaintIssue) part1.customerFeedback = serviceIntakeForm.customerComplaintIssue;
    if (serviceIntakeForm.checkInNotes) part1.technicianObservation = serviceIntakeForm.checkInNotes;
    if (serviceIntakeForm.insuranceStartDate) part1.insuranceStartDate = serviceIntakeForm.insuranceStartDate;
    if (serviceIntakeForm.insuranceEndDate) part1.insuranceEndDate = serviceIntakeForm.insuranceEndDate;
    if (serviceIntakeForm.insuranceCompanyName) part1.insuranceCompanyName = serviceIntakeForm.insuranceCompanyName;

    // Populate PART 2A if warranty/insurance evidence exists
    const part2A = (serviceIntakeForm.photosVideos.urls.length > 0 || 
                     serviceIntakeForm.warrantyCardServiceBook.urls.length > 0)
      ? {
          videoEvidence: serviceIntakeForm.photosVideos.urls.some(url => url.includes('video') || url.includes('mp4')) ? "Yes" : "No" as "Yes" | "No" | "",
          vinImage: serviceIntakeForm.photosVideos.urls.some(url => url.includes('vin')) ? "Yes" : "No" as "Yes" | "No" | "",
          odoImage: serviceIntakeForm.photosVideos.urls.some(url => url.includes('odo')) ? "Yes" : "No" as "Yes" | "No" | "",
          damageImages: serviceIntakeForm.photosVideos.urls.length > 0 ? "Yes" : "No" as "Yes" | "No" | "",
          issueDescription: serviceIntakeForm.customerComplaintIssue || "",
          numberOfObservations: String(serviceIntakeForm.photosVideos.urls.length),
          symptom: serviceIntakeForm.previousServiceHistory || "",
          defectPart: serviceIntakeForm.customerComplaintIssue || "",
        }
      : undefined;

    // Update job card with structured PART 1 and PART 2A before converting to quotation
    if (currentJobCardId) {
      updateStoredJobCard(currentJobCardId, (card) => ({
        ...card,
        status: "In Progress",
        // Update PART 1 with service intake form data
        part1,
        // PART 2 will be populated when parts are added in quotation
        part2: card.part2 || [],
        // PART 2A if warranty/insurance evidence exists
        part2A,
        // Update legacy fields for backward compatibility
        vehicleMake: serviceIntakeForm.vehicleBrand,
        vehicleModel: serviceIntakeForm.vehicleModel,
        registration: serviceIntakeForm.registrationNumber,
        description: serviceIntakeForm.customerComplaintIssue || card.description,
      }));
    }

    // Save service intake data to localStorage for quotation page to use
    const customerIdForQuotation =
      selectedCustomer?.id?.toString() ||
      detailCustomer?.id?.toString() ||
      selectedAppointment.customerExternalId ||
      undefined;
    const serviceCenterIdForQuotation =
      selectedAppointment.serviceCenterId?.toString() ||
      serviceCenterContext.serviceCenterId ||
      undefined;
    const serviceCenterNameForQuotation =
      selectedAppointment.serviceCenterName ||
      serviceCenterContext.serviceCenterName ||
      undefined;

    const serviceIntakeData = {
      appointmentId: selectedAppointment.id,
      customerName: selectedAppointment.customerName,
      phone: selectedAppointment.phone,
      vehicle: selectedAppointment.vehicle,
      customerId: customerIdForQuotation,
      serviceCenterId: serviceCenterIdForQuotation,
      serviceCenterName: serviceCenterNameForQuotation,
      jobCardId: currentJobCardId,
      serviceIntakeForm: {
        ...serviceIntakeForm,
        // Convert File objects to URLs for storage (in real app, these would be uploaded first)
        customerIdProof: {
          files: [],
          urls: serviceIntakeForm.customerIdProof.urls,
        },
        vehicleRCCopy: {
          files: [],
          urls: serviceIntakeForm.vehicleRCCopy.urls,
        },
        warrantyCardServiceBook: {
          files: [],
          urls: serviceIntakeForm.warrantyCardServiceBook.urls,
        },
        photosVideos: {
          files: [],
          urls: serviceIntakeForm.photosVideos.urls,
        },
      },
    };

    // Store service intake data for quotation page
    safeStorage.setItem("pendingQuotationFromAppointment", serviceIntakeData);
    
    // Update appointment status to indicate customer has arrived and intake is done
    const updatedAppointments = appointments.map((apt) =>
      apt.id === selectedAppointment.id
        ? { ...apt, status: "In Progress" }
        : apt
    );
    setAppointments(updatedAppointments);
    safeStorage.setItem("appointments", updatedAppointments);

    // Navigate to quotations page
    router.push("/sc/quotations?fromAppointment=true");
    
    // Close the appointment detail modal
    closeDetailModal();
  }, [selectedAppointment, serviceIntakeForm, appointments, router, closeDetailModal, showToast, currentJobCardId, updateStoredJobCard, selectedCustomer, detailCustomer, serviceCenterContext]);

  const updateLeadForAppointment = useCallback(
    (appointment: AppointmentRecord) => {
      const storedLeads = safeStorage.getItem<any>("leads", []);
      if (!storedLeads.length) return;
      const updatedLeads = storedLeads.map((lead: any) => {
        if (
          (lead.phone && lead.phone === appointment.phone) ||
          (lead.customerName && lead.customerName === appointment.customerName)
        ) {
          return {
            ...lead,
            status: "converted",
            convertedTo: "quotation",
            convertedId: currentJobCardId,
            updatedAt: new Date().toISOString(),
          };
        }
        return lead;
      });
      safeStorage.setItem("leads", updatedLeads);
    },
    [currentJobCardId]
  );

  // ==================== Effects ====================
  // Sync customerArrivalStatus with appointment status
  useEffect(() => {
    if (!selectedAppointment) {
      setCustomerArrivalStatus(null);
      return;
    }
    
    // If appointment status indicates customer has arrived, set arrival status
    if (selectedAppointment.status === "In Progress" || selectedAppointment.status === "Sent to Manager") {
      if (customerArrivalStatus !== "arrived") {
        setCustomerArrivalStatus("arrived");
      }
      
      // Try to find associated job card
      if (!currentJobCardId) {
        const storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
        const associatedJobCard = storedJobCards.find(
          (card) => card.sourceAppointmentId === selectedAppointment.id
        );
        if (associatedJobCard) {
          setCurrentJobCardId(associatedJobCard.id);
        }
      }
    } else if (selectedAppointment.status === "Confirmed" || selectedAppointment.status === "Pending") {
      // Reset arrival status if appointment is still pending/confirmed
      if (customerArrivalStatus === "arrived") {
        setCustomerArrivalStatus(null);
      }
    }
  }, [selectedAppointment, customerArrivalStatus, currentJobCardId]);

  // Watch for customer search results to populate vehicle details
  useEffect(() => {
    if (!customerSearchResults.length || !selectedAppointment || !showVehicleDetails) return;

    const customer = customerSearchResults[0];
    const vehicle = customer.vehicles?.find((v) => {
      const vehicleString = formatVehicleString(v);
      return (
        vehicleString === selectedAppointment.vehicle ||
        selectedAppointment.vehicle.includes(v.vehicleMake) ||
        selectedAppointment.vehicle.includes(v.vehicleModel)
      );
    });

    // Batch state updates using React's automatic batching
    if (vehicle) {
      requestAnimationFrame(() => {
        setSelectedVehicle(vehicle);
      });
    }
    clearCustomerSearch();
  }, [customerSearchResults, selectedAppointment, showVehicleDetails, clearCustomerSearch]);

  useEffect(() => {
    const draftAppointmentId = searchParams.get("draft");
    const jobCardId = searchParams.get("jobCard");
    if (!draftAppointmentId) return;
    const appointmentId = Number(draftAppointmentId);
    if (Number.isNaN(appointmentId)) return;

    const storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
    const jobCard = storedJobCards.find(
      (card) =>
        (jobCardId ? card.id === jobCardId : card.sourceAppointmentId === appointmentId) &&
        card.draftIntake
    );
    if (!jobCard) return;

    const appointment = appointments.find((apt) => apt.id === appointmentId);
    if (!appointment) return;

    // Batch state updates to avoid cascading renders
    setSelectedAppointment(appointment);
    setServiceIntakeForm((prev) => ({
      ...prev,
      ...jobCard.draftIntake,
    }));
    setCustomerArrivalStatus("arrived");
    setCurrentJobCardId(jobCard.id);
    setShowDetailModal(true);

    router.replace("/sc/appointments");
  }, [appointments, router, searchParams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
      if (complaintCustomerDropdownRef.current && !complaintCustomerDropdownRef.current.contains(event.target as Node)) {
        setShowComplaintCustomerDropdown(false);
      }
    };

    if (showCustomerDropdown || showComplaintCustomerDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCustomerDropdown, showComplaintCustomerDropdown]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup will happen when form is reset or component unmounts
      // URLs are already cleaned up in closeDetailModal and handleRemoveDocument
    };
  }, []);

  // ==================== Render ====================
  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <CameraModal
        isOpen={cameraModalOpen}
        onClose={() => {
          setCameraModalOpen(false);
          setCameraDocumentType(null);
        }}
        onCapture={handleCameraCapture}
        title={
          cameraDocumentType === "customerIdProof"
            ? "Capture Customer ID Proof"
            : cameraDocumentType === "vehicleRCCopy"
            ? "Capture Vehicle RC Copy"
            : cameraDocumentType === "warrantyCardServiceBook"
            ? "Capture Warranty Card / Service Book"
            : cameraDocumentType === "photosVideos"
            ? "Capture Vehicle Photo"
            : "Capture Photo"
        }
      />

      <div className="pt-6 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Appointments</h1>
            <p className="text-gray-500">Schedule and manage customer appointments</p>
          </div>
          <div className="flex gap-3">
            {isCallCenter && (
          <button
            onClick={() => {
                  setShowComplaintModal(true);
                  resetComplaintForm();
                }}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
              >
                <AlertTriangle size={20} />
                Create Complaint
              </button>
            )}
          {canCreateNewAppointment && (
            <button
              onClick={handleOpenNewAppointment}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
            >
              <PlusCircle size={20} />
              New Appointment
            </button>
          )}
          </div>
        </div>

        {/* Appointments Grid */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          {visibleAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No appointments scheduled</p>
              <p className="text-gray-400 text-sm mt-2">Click &quot;New Appointment&quot; to schedule one</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleAppointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => handleAppointmentClick(apt)}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200 bg-white hover:bg-blue-50/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-600" />
                  <span className="font-semibold text-sm">{apt.time}</span>
                </div>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p className="font-medium text-gray-800 text-sm mb-1">{apt.customerName}</p>
                  <div className="flex items-center gap-1 mb-1">
                    <Car size={12} className="text-gray-400" />
                <p className="text-xs text-gray-600">{apt.vehicle}</p>
                  </div>
                <p className="text-xs text-gray-500 mt-1">{apt.serviceType}</p>
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                    <Phone size={12} className="text-gray-400" />
                    <p className="text-xs text-gray-500">{apt.phone}</p>
                  </div>
                  {isCallCenter && apt.serviceCenterName && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                      <Building2 size={12} className="text-indigo-500" />
                      <p className="text-xs text-indigo-600 font-medium">{apt.serviceCenterName}</p>
                    </div>
                  )}
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      <Modal show={showAppointmentModal} onClose={closeAppointmentModal} title={isEditing ? "Edit Appointment" : "New Appointment"} maxWidth="2xl">
        <div className="space-y-6">
          {/* Customer Information Section */}
          {selectedCustomer && (
            <CustomerInfoCard customer={selectedCustomer} title="Customer Information (Pre-filled)" />
          )}

          {/* Customer Search (if no customer selected) */}
          {!selectedCustomer && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
              <div className="relative" ref={customerDropdownRef}>
                <FormInput
                  label="Customer Name"
                  required
                    value={customerSearchQuery}
                    onChange={(e) => {
                      // Only block when editing AND user doesn't have permission OR appointment was created by call center
                      // Always allow search when creating (isEditing = false)
                      if (isEditing && (!canEditCustomerInformation || isCallCenterFieldReadOnly)) {
                        return;
                      }
                      handleCustomerSearchChange(e.target.value);
                    }}
                    placeholder={isEditing && (!canEditCustomerInformation || isCallCenterFieldReadOnly) ? "Customer information cannot be edited (pre-filled by call center)" : "Start typing customer name..."}
                    disabled={isEditing && (!canEditCustomerInformation || isCallCenterFieldReadOnly)}
                    readOnly={isEditing && (!canEditCustomerInformation || isCallCenterFieldReadOnly)}
                  />
                  {showCustomerDropdown && customerSearchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {typedCustomerSearchResults.map((customer) => (
                        <div
                          key={customer.id}
                          onClick={() => {
                            if (isEditing && (!canEditCustomerInformation || isCallCenterFieldReadOnly)) return;
                            handleCustomerSelect(customer);
                          }}
                        className={`p-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                          isEditing && (!canEditCustomerInformation || isCallCenterFieldReadOnly)
                            ? "cursor-not-allowed opacity-50" 
                            : "hover:bg-indigo-50 cursor-pointer"
                        }`}
                        >
                          <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-indigo-100">
                            <User className="text-indigo-600" size={16} strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{customer.name}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <Phone size={12} />
                                  {customer.phone}
                                </span>
                                {customer.vehicles && customer.vehicles.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Car size={12} />
                                    {customer.vehicles.length} vehicle{customer.vehicles.length > 1 ? "s" : ""}
                                  </span>
                                )}
                              {customer.lastServiceCenterName && (
                                <span className="flex items-center gap-1">
                                  <Building2 size={12} />
                                  {customer.lastServiceCenterName}
                                </span>
                              )}
                              </div>
                            </div>
                          {/* @ts-ignore Customer comes from typed search results */}
                            {selectedCustomer?.id === customer.id && (
                            <CheckCircle className="text-indigo-600 shrink-0" size={18} strokeWidth={2} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {customerSearchLoading && (
                  <div className="absolute right-3 top-10 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
          )}

          {/* Appointment Form */}
          <div className="space-y-4">
            <FormInput
              label="Customer Name"
              required
              value={appointmentForm.customerName}
              onChange={() => {}}
              readOnly
            />
            <FormInput
              label="Phone Number"
              required
                  type="tel"
                  value={appointmentForm.phone}
              onChange={() => {}}
                  maxLength={10}
              readOnly
                />
              <div>
              {selectedCustomer && selectedCustomer.vehicles && selectedCustomer.vehicles.length > 1 ? (
                <FormSelect
                  label="Vehicle"
                    required
                    value={appointmentForm.vehicle}
                    onChange={(e) => {
                      if (isEditing && (!canEditVehicleInformation || isCallCenterFieldReadOnly)) return;
                      setAppointmentForm({ ...appointmentForm, vehicle: e.target.value });
                    }}
                  placeholder={isEditing && (!canEditVehicleInformation || isCallCenterFieldReadOnly) ? "Vehicle information cannot be edited (pre-filled by call center)" : "Select vehicle"}
                  disabled={isEditing && (!canEditVehicleInformation || isCallCenterFieldReadOnly)}
                  options={selectedCustomer.vehicles.map((v) => ({
                    value: formatVehicleString(v),
                    label: `${formatVehicleString(v)}${v.registration ? ` - ${v.registration}` : ""}`,
                  }))}
                />
              ) : (
                <FormInput
                  label="Vehicle"
                    required
                  value={appointmentForm.vehicle}
                  onChange={() => {}}
                  readOnly
                  disabled={isEditing && (!canEditVehicleInformation || isCallCenterFieldReadOnly)}
                />
              )}
              {selectedCustomer && appointmentForm.vehicle && (() => {
                const selectedVehicle = selectedCustomer.vehicles?.find((v) => 
                  formatVehicleString(v) === appointmentForm.vehicle
                );
                return selectedVehicle?.lastServiceCenterName ? (
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <Building2 size={12} />
                    Last serviced at: {selectedVehicle.lastServiceCenterName}
                  </p>
                ) : null;
              })()}
            </div>

            <FormSelect
              label="Service Type"
              required
              value={appointmentForm.serviceType}
              onChange={(e) => {
                if (isCallCenterFieldReadOnly) return;
                setAppointmentForm({ ...appointmentForm, serviceType: e.target.value });
              }}
              placeholder={isCallCenterFieldReadOnly ? "Service type (pre-filled by call center)" : "Select service type"}
              disabled={isCallCenterFieldReadOnly}
              options={SERVICE_TYPES.map((type) => ({ value: type, label: type }))}
            />

            {/* Service Center */}
            {(isCallCenter || isServiceAdvisor) && (
              <div className="space-y-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Service Center</label>
              <button
                      type="button"
                      onClick={() => setShowServiceCenterSelector(true)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 bg-white hover:border-indigo-500 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-800">
                          {selectedServiceCenter
                            ? `${selectedServiceCenter.name} • ${selectedServiceCenter.location}`
                            : "Select a service center"}
                        </span>
                        <Search size={14} className="text-gray-400" />
                      </div>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAssignNearestServiceCenter}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition whitespace-nowrap"
                  >
                    Assign Nearest
                  </button>
                </div>
                {selectedCustomer?.address && nearestServiceCenter && (
                  <p className="text-xs text-gray-500">
                    Suggested nearest center: {nearestServiceCenter.name} • {nearestServiceCenter.location}
                  </p>
                )}
                {appointmentForm.serviceCenterId && selectedServiceCenter && (
                  <p className="text-xs text-gray-500">
                    Selected center: {selectedServiceCenter.name} • {selectedServiceCenter.location}
                  </p>
                )}
              </div>
            )}

            {/* Customer Type (Call Center, Service Advisor, Inventory Manager) */}
            {(isCallCenter || isServiceAdvisor) && (
              <FormSelect
                label="Customer Type"
                value={appointmentForm.customerType || ""}
                onChange={(e) => {
                  if (isCallCenterFieldReadOnly) return;
                  setAppointmentForm({ ...appointmentForm, customerType: e.target.value as "B2C" | "B2B" | undefined });
                }}
                placeholder={isCallCenterFieldReadOnly ? "Customer type (pre-filled by call center)" : "Select customer type"}
                disabled={isCallCenterFieldReadOnly}
                options={[
                  { value: "B2C", label: "B2C" },
                  { value: "B2B", label: "B2B" },
                ]}
              />
            )}

            {/* Service Details Section (Call Center, Service Advisor, SC Manager when editing) */}
            {(isCallCenter || isServiceAdvisor || (isEditing && canEditServiceDetailsSection)) && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="text-purple-600" size={20} />
                  Service Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customer Complaint / Issue Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={appointmentForm.customerComplaintIssue || ""}
                      onChange={(e) => {
                        if (isEditing && (!canEditServiceDetailsSection || isCallCenterFieldReadOnly)) return;
                        setAppointmentForm({ ...appointmentForm, customerComplaintIssue: e.target.value });
                      }}
                      rows={3}
                      placeholder={isCallCenterFieldReadOnly ? "Customer complaint (pre-filled by call center)" : "Describe the customer complaint or issue..."}
                      className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none text-gray-900 transition-all duration-200 bg-gray-50/50 focus:bg-white resize-none ${
                        isEditing && (!canEditServiceDetailsSection || isCallCenterFieldReadOnly) ? "cursor-not-allowed opacity-50" : ""
                      }`}
                      required={isCallCenter}
                      disabled={isEditing && (!canEditServiceDetailsSection || isCallCenterFieldReadOnly)}
                      readOnly={isEditing && (!canEditServiceDetailsSection || isCallCenterFieldReadOnly)}
                    />
                  </div>
                  {/* Additional fields */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Previous Service History
                        </label>
                        <textarea
                          value={appointmentForm.previousServiceHistory || ""}
                          onChange={(e) => {
                            if (isEditing && !canEditServiceDetailsSection) return;
                            setAppointmentForm({ ...appointmentForm, previousServiceHistory: e.target.value });
                          }}
                          rows={3}
                          placeholder="Enter previous service history..."
                          className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none text-gray-900 transition-all duration-200 bg-gray-50/50 focus:bg-white resize-none ${
                            isEditing && !canEditServiceDetailsSection ? "cursor-not-allowed opacity-50" : ""
                          }`}
                          disabled={isEditing && !canEditServiceDetailsSection}
                          readOnly={isEditing && !canEditServiceDetailsSection}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          label="Estimated Service Time"
                          value={appointmentForm.estimatedServiceTime || ""}
                          onChange={(e) => {
                            if (isEditing && !canEditServiceDetailsSection) return;
                            setAppointmentForm({ ...appointmentForm, estimatedServiceTime: e.target.value });
                          }}
                          placeholder="e.g., 2 hours"
                          disabled={isEditing && !canEditServiceDetailsSection}
                          readOnly={isEditing && !canEditServiceDetailsSection}
                        />
                        <FormInput
                          label="Estimated Cost"
                          type="number"
                          value={appointmentForm.estimatedCost || ""}
                          onChange={(e) => {
                            if (isEditing && !canEditServiceDetailsSection) return;
                            setAppointmentForm({ ...appointmentForm, estimatedCost: e.target.value });
                          }}
                          placeholder="Enter estimated cost"
                          disabled={isEditing && !canEditServiceDetailsSection}
                          readOnly={isEditing && !canEditServiceDetailsSection}
                        />
                      </div>
                      {/* Odometer Reading - Service Advisor and SC Manager when editing */}
                      {(isServiceAdvisor || (isEditing && canEditServiceDetailsSection)) && (
                        <FormInput
                          label="Odometer Reading"
                          type="number"
                          value={appointmentForm.odometerReading || ""}
                          onChange={(e) => {
                            if (isEditing && !canEditServiceDetailsSection) return;
                            setAppointmentForm({ ...appointmentForm, odometerReading: e.target.value });
                          }}
                          placeholder="Enter odometer reading"
                          disabled={isEditing && !canEditServiceDetailsSection}
                          readOnly={isEditing && !canEditServiceDetailsSection}
                        />
                  )}
                </div>
              </div>
            )}

            {/* Documentation Section (Call Center, Service Advisor, SC Manager when editing) */}
            {(isCallCenter || isServiceAdvisor || (isEditing && canEditDocumentationSection)) && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Upload className="text-amber-600" size={20} />
                  Documentation
                </h3>
                <div className="space-y-4">
                  {/* Customer ID Proof */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customer ID Proof <span className="text-xs font-normal text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        if (isEditing && !canEditDocumentationSection) return;
                        const files = Array.from(e.target.files || []);
                        const urls = files.map((file) => URL.createObjectURL(file));
                  setAppointmentForm({
                          ...appointmentForm,
                          customerIdProof: {
                            files,
                            urls,
                          },
                  });
                }}
                      disabled={isEditing && !canEditDocumentationSection}
                      className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none text-gray-900 transition-all duration-200 bg-gray-50/50 focus:bg-white ${
                        isEditing && !canEditDocumentationSection ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    />
                    {appointmentForm.customerIdProof?.files && appointmentForm.customerIdProof.files.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {appointmentForm.customerIdProof.files.map((file, index) => (
                          <span key={index} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                            {file.name}
                          </span>
                        ))}
                </div>
                    )}
                  </div>

                  {/* Vehicle RC Copy */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vehicle RC Copy <span className="text-xs font-normal text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        if (isEditing && !canEditDocumentationSection) return;
                        const files = Array.from(e.target.files || []);
                        const urls = files.map((file) => URL.createObjectURL(file));
                        setAppointmentForm({
                          ...appointmentForm,
                          vehicleRCCopy: {
                            files,
                            urls,
                          },
                        });
                      }}
                      disabled={isEditing && !canEditDocumentationSection}
                      className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none text-gray-900 transition-all duration-200 bg-gray-50/50 focus:bg-white ${
                        isEditing && !canEditDocumentationSection ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    />
                    {appointmentForm.vehicleRCCopy?.files && appointmentForm.vehicleRCCopy.files.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {appointmentForm.vehicleRCCopy.files.map((file, index) => (
                          <span key={index} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                            {file.name}
                          </span>
                        ))}
              </div>
            )}
          </div>

                  {/* Warranty Card / Service Book */}
              <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Warranty Card / Service Book <span className="text-xs font-normal text-gray-500">(Optional)</span>
                </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        if (isEditing && !canEditDocumentationSection) return;
                        const files = Array.from(e.target.files || []);
                        const urls = files.map((file) => URL.createObjectURL(file));
                        setAppointmentForm({
                          ...appointmentForm,
                          warrantyCardServiceBook: {
                            files,
                            urls,
                          },
                        });
                      }}
                      disabled={isEditing && !canEditDocumentationSection}
                      className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none text-gray-900 transition-all duration-200 bg-gray-50/50 focus:bg-white ${
                        isEditing && !canEditDocumentationSection ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    />
                    {appointmentForm.warrantyCardServiceBook?.files && appointmentForm.warrantyCardServiceBook.files.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {appointmentForm.warrantyCardServiceBook.files.map((file, index) => (
                          <span key={index} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                            {file.name}
                          </span>
                        ))}
              </div>
                    )}
                  </div>

                  {/* Photos/Videos of Vehicle at Drop-off */}
              <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Photos/Videos of Vehicle at Drop-off <span className="text-xs font-normal text-gray-500">(Optional)</span>
                </label>
                <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => {
                        if (isEditing && !canEditDocumentationSection) return;
                        const files = Array.from(e.target.files || []);
                        const urls = files.map((file) => URL.createObjectURL(file));
                        setAppointmentForm({
                          ...appointmentForm,
                          photosVideos: {
                            files,
                            urls,
                          },
                        });
                      }}
                      disabled={isEditing && !canEditDocumentationSection}
                      className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none text-gray-900 transition-all duration-200 bg-gray-50/50 focus:bg-white ${
                        isEditing && !canEditDocumentationSection ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    />
                    {appointmentForm.photosVideos?.files && appointmentForm.photosVideos.files.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {appointmentForm.photosVideos.files.map((file, index) => (
                          <span key={index} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                            {file.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput
                  label="Date"
                  required
                  type="date"
                  value={appointmentForm.date}
                  onChange={(e) => {
                    if (isCallCenterFieldReadOnly) return;
                    setAppointmentForm({ ...appointmentForm, date: e.target.value });
                  }}
                  disabled={isCallCenterFieldReadOnly}
                  readOnly={isCallCenterFieldReadOnly}
                  // @ts-ignore
                  min={new Date().toISOString().split("T")[0]}
                />
                {appointmentForm.date && (
                  <div className="mt-2 text-xs">
                    {(() => {
                      const maxAppointments = getMaxAppointmentsPerDay(serviceCenterName);
                      const currentCount = countAppointmentsForDate(
                        isEditing && selectedAppointment
                      ? visibleAppointments.filter((apt) => apt.id !== selectedAppointment.id)
                      : visibleAppointments,
                        appointmentForm.date
                      );
                      const remaining = maxAppointments - currentCount;
                      const isNearLimit = remaining <= 3;
                      const isAtLimit = remaining <= 0;

                      return (
                        <div className={`flex items-center gap-2 ${isAtLimit ? "text-red-600" : isNearLimit ? "text-orange-600" : "text-gray-600"}`}>
                          <Calendar size={12} />
                          <span className="font-medium">
                            {currentCount} / {maxAppointments} appointments
                            {remaining > 0 && ` (${remaining} remaining)`}
                            {isAtLimit && " - Limit reached"}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div>
                <FormInput
                  label="Time"
                  required
                  type="time"
                  value={appointmentForm.time}
                  onChange={(e) => {
                    if (isCallCenterFieldReadOnly) return;
                    setAppointmentForm({ ...appointmentForm, time: e.target.value });
                  }}
                  disabled={isCallCenterFieldReadOnly}
                  readOnly={isCallCenterFieldReadOnly}
                />
              </div>
            </div>
          </div>

          {/* Operational Details Section */}
          {(isCallCenter || isServiceAdvisor || (isEditing && canEditOperationalDetailsSection)) && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="text-blue-600" size={20} />
                Operational Details
              </h3>
              <div className="space-y-4">
                {/* Estimated Delivery Date (Service Advisor & SC Manager when editing) */}
                {(isServiceAdvisor || (isEditing && canEditOperationalDetailsSection)) && (
                  <FormInput
                    label="Estimated Delivery Date"
                    type="date"
                    value={appointmentForm.estimatedDeliveryDate || ""}
                    onChange={(e) => {
                      if (isEditing && !canEditOperationalDetailsSection) return;
                      setAppointmentForm({ ...appointmentForm, estimatedDeliveryDate: e.target.value });
                    }}
                    disabled={isEditing && !canEditOperationalDetailsSection}
                    readOnly={isEditing && !canEditOperationalDetailsSection}
                  />
                )}

                {/* Assigned Service Advisor (Call Center, Service Advisor, SC Manager when editing) */}
                {(isCallCenter || isServiceAdvisor || (isEditing && canEditOperationalDetailsSection)) && (
                  <FormInput
                    label="Assigned Service Advisor"
                    value={appointmentForm.assignedServiceAdvisor || ""}
                    onChange={(e) => {
                      if (isEditing && !canEditOperationalDetailsSection) return;
                      setAppointmentForm({ ...appointmentForm, assignedServiceAdvisor: e.target.value });
                    }}
                    placeholder="Enter service advisor name"
                    disabled={isEditing && !canEditOperationalDetailsSection}
                    readOnly={isEditing && !canEditOperationalDetailsSection}
                  />
                )}

                {/* Assigned Technician (Service Advisor & SC Manager when editing) */}
                {(isServiceAdvisor || (isEditing && canEditOperationalDetailsSection)) && (
                  <FormInput
                    label="Assigned Technician"
                    value={appointmentForm.assignedTechnician || ""}
                    onChange={(e) => {
                      if (isEditing && !canEditOperationalDetailsSection) return;
                      setAppointmentForm({ ...appointmentForm, assignedTechnician: e.target.value });
                    }}
                    placeholder="Enter technician name"
                    disabled={isEditing && !canEditOperationalDetailsSection}
                    readOnly={isEditing && !canEditOperationalDetailsSection}
                  />
                )}

                        {/* Pickup / Drop Required */}
                        {(isCallCenter || isServiceAdvisor || (isEditing && canEditOperationalDetailsSection)) && (
                          <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={appointmentForm.pickupDropRequired || false}
                                onChange={(e) => {
                                  if (isEditing && (!canEditOperationalDetailsSection || isCallCenterFieldReadOnly)) return;
                                  const checked = e.target.checked;
                                  setAppointmentForm({
                                    ...appointmentForm,
                                    pickupDropRequired: checked,
                                    ...(checked
                                      ? {}
                                      : {
                                          pickupAddress: "",
                                          dropAddress: "",
                                        }),
                                  });
                                  if (!checked) {
                                    setPickupAddressDifferent(false);
                                  }
                                }}
                                disabled={isEditing && (!canEditOperationalDetailsSection || isCallCenterFieldReadOnly)}
                                className={`w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${
                                  isEditing && !canEditOperationalDetailsSection ? "cursor-not-allowed opacity-50" : ""
                                }`}
                              />
                              <span className="text-sm font-medium text-gray-700">Pickup / Drop Required</span>
                            </label>

                            {/* If pickup/drop is required, ask only when address is different */}
                            {appointmentForm.pickupDropRequired && (
                              <div className="space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={pickupAddressDifferent}
                                    onChange={(e) => {
                                      if (isEditing && (!canEditOperationalDetailsSection || isCallCenterFieldReadOnly)) return;
                                      const checked = e.target.checked;
                                      setPickupAddressDifferent(checked);
                                      if (!checked) {
                                        setAppointmentForm({
                                          ...appointmentForm,
                                          pickupAddress: "",
                                          dropAddress: "",
                                        });
                                      }
                                    }}
                                    disabled={isEditing && (!canEditOperationalDetailsSection || isCallCenterFieldReadOnly)}
                                    className={`w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${
                                      isEditing && !canEditOperationalDetailsSection ? "cursor-not-allowed opacity-50" : ""
                                    }`}
                                  />
                                  <span className="text-sm text-gray-700">
                                    Pickup / Drop address is different from customer address
                                  </span>
                                </label>

                                {pickupAddressDifferent && (
                                  <>
                                    <FormInput
                                      label="Pickup Address"
                                      value={appointmentForm.pickupAddress || ""}
                                      onChange={(e) => {
                                        if (isEditing && (!canEditOperationalDetailsSection || isCallCenterFieldReadOnly)) return;
                                        setAppointmentForm({ ...appointmentForm, pickupAddress: e.target.value });
                                      }}
                                      placeholder={isCallCenterFieldReadOnly ? "Pickup address (pre-filled by call center)" : "Enter pickup address"}
                                      disabled={isEditing && (!canEditOperationalDetailsSection || isCallCenterFieldReadOnly)}
                                      readOnly={isEditing && (!canEditOperationalDetailsSection || isCallCenterFieldReadOnly)}
                                    />

                                    <FormInput
                                      label="Drop Address"
                                      value={appointmentForm.dropAddress || ""}
                                      onChange={(e) => {
                                        if (isEditing && (!canEditOperationalDetailsSection || isCallCenterFieldReadOnly)) return;
                                        setAppointmentForm({ ...appointmentForm, dropAddress: e.target.value });
                                      }}
                                      placeholder={isCallCenterFieldReadOnly ? "Drop address (pre-filled by call center)" : "Enter drop address"}
                                      disabled={isEditing && (!canEditOperationalDetailsSection || isCallCenterFieldReadOnly)}
                                      readOnly={isEditing && (!canEditOperationalDetailsSection || isCallCenterFieldReadOnly)}
                                    />
                                  </>
                                )}
          </div>
                            )}
                          </div>
                        )}

                {/* Preferred Communication Mode */}
                {(isCallCenter || isServiceAdvisor || (isEditing && canEditOperationalDetailsSection)) && (
                  <FormSelect
                    label="Preferred Communication Mode"
                    value={appointmentForm.preferredCommunicationMode || ""}
                    onChange={(e) => {
                      if (isEditing && (!canEditOperationalDetailsSection || isCallCenterFieldReadOnly)) return;
                      setAppointmentForm({ ...appointmentForm, preferredCommunicationMode: e.target.value as "Phone" | "Email" | "SMS" | "WhatsApp" | undefined });
                    }}
                    placeholder={isCallCenterFieldReadOnly ? "Communication mode (pre-filled by call center)" : "Select communication mode"}
                    disabled={isEditing && (!canEditOperationalDetailsSection || isCallCenterFieldReadOnly)}
                    options={[
                      { value: "Phone", label: "Phone" },
                      { value: "Email", label: "Email" },
                      { value: "SMS", label: "SMS" },
                      { value: "WhatsApp", label: "WhatsApp" },
                    ]}
                  />
                )}
              </div>
            </div>
          )}

          {/* Cost Estimation (Billing & Payment fields removed - only available during invoice creation) */}
          {canViewCostEstimation && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="text-indigo-600" size={20} />
                Cost Estimation
              </h3>
              <div className="space-y-4">
                <FormInput
                  label="Estimated Cost"
                  value={appointmentForm.estimatedCost ? `₹${appointmentForm.estimatedCost}` : ""}
                  onChange={() => {}}
                  readOnly
                  placeholder="Cost will be determined during service"
                />
                <p className="text-xs text-gray-500">
                  Note: Payment method and billing details will be collected when creating the invoice during vehicle delivery.
                </p>
              </div>
            </div>
          )}
          {/* Post-Service Survey Section (Call Center, Service Advisor, Service Manager, Service Technician) */}
          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button onClick={closeAppointmentModal} className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition">
              Cancel
            </button>
            <button
              onClick={handleSubmitAppointment}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
            >
              Schedule Appointment
            </button>
            </div>
          </div>
      </Modal>

      {/* Appointment Detail Modal */}
      <Modal 
        show={showDetailModal} 
        onClose={closeDetailModal} 
        title="Appointment Details"
        maxWidth={isServiceAdvisor && customerArrivalStatus === "arrived" ? "4xl" : "2xl"}
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} />
                Customer Information
              </h3>
              <div className="space-y-5">
                {detailCustomer ? (
                  <CustomerInfoCard customer={detailCustomer} title="Customer Details" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                      <p className="font-medium text-gray-800 flex items-center gap-2">
                        <Phone size={14} />
                        {selectedAppointment.phone}
                      </p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Vehicle</p>
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <Car size={14} />
                      {selectedAppointment.vehicle}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Customer Type</p>
                    <p className="font-medium text-gray-800">
                      {selectedAppointment.customerType ?? "Not captured"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Preferred Communication</p>
                    <p className="font-medium text-gray-800">
                      {selectedAppointment.preferredCommunicationMode ?? "Not captured"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pickup / Drop Required</p>
                    <p className="font-medium text-gray-800">
                      {selectedAppointment.pickupDropRequired ? "Yes" : "No"}
                    </p>
                  </div>
                  {selectedAppointment.pickupAddress && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pickup Address</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.pickupAddress}</p>
                    </div>
                  )}
                  {selectedAppointment.dropAddress && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Drop Address</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.dropAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Service Center Assignment (for Call Center) */}
            {isCallCenter && selectedAppointment.serviceCenterName && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 className="text-indigo-600" size={20} />
                  Assigned Service Center
                </h3>
                <div className="flex items-center gap-3">
                  <MapPin className="text-indigo-600" size={18} strokeWidth={2} />
                  <div>
                    <p className="font-semibold text-gray-900">{selectedAppointment.serviceCenterName}</p>
                    {(() => {
                      const center = availableServiceCenters.find(
                        (sc) => sc.name === selectedAppointment.serviceCenterName
                      );
                      return center && <p className="text-sm text-gray-600">{center.location}</p>;
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Appointment Details */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Appointment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Service Type</p>
                  <p className="font-medium text-gray-800">{selectedAppointment.serviceType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date</p>
                  <p className="font-medium text-gray-800">{selectedAppointment.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Time</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <Clock size={14} />
                    {selectedAppointment.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Duration</p>
                  <p className="font-medium text-gray-800">{selectedAppointment.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <StatusBadge status={selectedAppointment.status} size="md" />
                </div>
              </div>
            </div>

            {/* Customer Arrival Section (Service Advisor Only) - Only show if customer hasn't arrived yet */}
            {isServiceAdvisor && 
             customerArrivalStatus !== "arrived" && 
             selectedAppointment.status !== "In Progress" && 
             selectedAppointment.status !== "Sent to Manager" && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-blue-600" />
                  Customer Arrival Status
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (!selectedAppointment) return;
                      
                      try {
                        // Check if pickup/drop service was selected
                        const hasPickupDropService = selectedAppointment.pickupDropRequired && 
                          (selectedAppointment.pickupAddress || selectedAppointment.dropAddress);
                        
                        if (hasPickupDropService) {
                          // Create pickup/drop charges and send to customer
                          const pickupDropCharges = {
                            id: `PDC-${Date.now()}`,
                            appointmentId: selectedAppointment.id,
                            customerName: selectedAppointment.customerName,
                            phone: selectedAppointment.phone,
                            pickupAddress: selectedAppointment.pickupAddress,
                            dropAddress: selectedAppointment.dropAddress,
                            amount: 500, // Default pickup/drop charge (can be configurable)
                            status: "pending",
                            createdAt: new Date().toISOString(),
                          };
                          
                          // Store pickup/drop charges
                          const existingCharges = safeStorage.getItem<any[]>("pickupDropCharges", []);
                          safeStorage.setItem("pickupDropCharges", [...existingCharges, pickupDropCharges]);
                          
                          // Send charges to customer via WhatsApp
                          const message = `Hello ${selectedAppointment.customerName}, your pickup/drop service charges are ₹${pickupDropCharges.amount}.\n\nPickup Address: ${selectedAppointment.pickupAddress || "N/A"}\nDrop Address: ${selectedAppointment.dropAddress || "N/A"}\n\nPlease confirm to proceed.`;
                          const whatsappUrl = `https://wa.me/${selectedAppointment.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, "_blank");
                          
                          showToast("Pickup/drop charges created and sent to customer via WhatsApp.", "success");
                        }
                        
                        // Update appointment status to "In Progress"
                        const updatedAppointments = appointments.map((apt) =>
                          apt.id === selectedAppointment.id
                            ? { ...apt, status: "In Progress" }
                            : apt
                        );
                        setAppointments(updatedAppointments);
                        safeStorage.setItem("appointments", updatedAppointments);
                        
                        // Update selectedAppointment state
                        setSelectedAppointment({ ...selectedAppointment, status: "In Progress" });
                        
                        // Set arrival status (NO JOB CARD CREATED YET)
                        setCustomerArrivalStatus("arrived");
                        
                        // Pre-fill form with appointment data (no job card yet)
                        setServiceIntakeForm({
                          ...INITIAL_SERVICE_INTAKE_FORM,
                          serviceType: selectedAppointment.serviceType || "",
                          vehicleBrand: selectedAppointment.vehicle.split(" ")[0] || "",
                          vehicleModel: selectedAppointment.vehicle.split(" ").slice(1, -1).join(" ") || "",
                          estimatedDeliveryDate: selectedAppointment.estimatedDeliveryDate || "",
                          customerComplaintIssue: selectedAppointment.customerComplaintIssue || "",
                        });
                        
                        showToast("Customer arrival recorded. Please select an action: Create Quotation, Pass to Manager, or Generate Check-in Slip.", "success");
                      } catch (error) {
                        console.error("Error recording customer arrival:", error);
                        showToast("Failed to record customer arrival. Please try again.", "error");
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-lg font-medium transition bg-white text-gray-700 border border-gray-300 hover:bg-green-50"
                  >
                    <CheckCircle size={18} className="inline mr-2" />
                    Customer Arrived
                  </button>
                  <button
                    onClick={() => {
                      setCustomerArrivalStatus("not_arrived");
                      setServiceIntakeForm(INITIAL_SERVICE_INTAKE_FORM);
                      setArrivalMode(null);
                      setCurrentJobCard(null);
                      setCheckInSlipData(null);
                      setShowCheckInSlipModal(false);
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                      customerArrivalStatus === "not_arrived"
                        ? "bg-red-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-red-50"
                    }`}
                  >
                    <AlertCircle size={18} className="inline mr-2" />
                    Customer Not Arrived
                  </button>
                </div>
              </div>
            )}

            {/* Customer Arrival Confirmation (Service Advisor Only) - Show when customer has arrived */}
            {isServiceAdvisor && 
             (customerArrivalStatus === "arrived" || 
              selectedAppointment.status === "In Progress" || 
              selectedAppointment.status === "Sent to Manager") && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Customer Arrived</h3>
                    <p className="text-sm text-green-700">
                      Appointment status: <span className="font-medium">{selectedAppointment.status}</span>
                      {currentJobCard && (
                        <span className="ml-2">• Job Card: <span className="font-medium">{currentJobCard.jobCardNumber}</span></span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {isServiceAdvisor && customerArrivalStatus === "arrived" && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-5 shadow-sm">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Select Action</p>
                    <p className="text-xs text-gray-500">Choose how to proceed with this customer arrival.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        // Navigate to quotations page to create quotation/estimation
                        const serviceIntakeData = {
                          appointmentId: selectedAppointment?.id,
                          customerName: selectedAppointment?.customerName,
                          phone: selectedAppointment?.phone,
                          vehicle: selectedAppointment?.vehicle,
                          customerId: selectedCustomer?.id?.toString() || detailCustomer?.id?.toString() || selectedAppointment?.customerExternalId,
                          serviceCenterId: selectedAppointment?.serviceCenterId?.toString() || serviceCenterContext.serviceCenterId,
                          serviceCenterName: selectedAppointment?.serviceCenterName || serviceCenterContext.serviceCenterName,
                          serviceIntakeForm: {
                            ...serviceIntakeForm,
                            customerIdProof: { files: [], urls: serviceIntakeForm.customerIdProof.urls },
                            vehicleRCCopy: { files: [], urls: serviceIntakeForm.vehicleRCCopy.urls },
                            warrantyCardServiceBook: { files: [], urls: serviceIntakeForm.warrantyCardServiceBook.urls },
                            photosVideos: { files: [], urls: serviceIntakeForm.photosVideos.urls },
                          },
                        };
                        safeStorage.setItem("pendingQuotationFromAppointment", serviceIntakeData);
                        router.push("/sc/quotations?fromAppointment=true");
                        closeDetailModal();
                      }}
                      className="px-4 py-3 rounded-lg border-2 border-indigo-300 bg-indigo-50 hover:bg-indigo-100 font-medium text-sm text-indigo-700 transition flex items-center justify-center gap-2"
                    >
                      <FileText size={18} />
                      Create Quotation/Estimation
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Pass to manager with service intake data
                        if (!selectedAppointment) return;
                        
                        // Create service intake request
                        const serviceIntakeRequest: ServiceIntakeRequest = {
                          id: `SIR-${Date.now()}`,
                          appointmentId: selectedAppointment.id,
                          appointment: selectedAppointment,
                          serviceIntakeForm: serviceIntakeForm,
                          status: "pending",
                          submittedAt: new Date().toISOString(),
                          submittedBy: userInfo?.name || userInfo?.id || "Service Advisor",
                          serviceCenterId: selectedAppointment.serviceCenterId || (serviceCenterContext.serviceCenterId !== null ? serviceCenterContext.serviceCenterId : undefined),
                          serviceCenterName: selectedAppointment.serviceCenterName || (serviceCenterContext.serviceCenterName !== null ? serviceCenterContext.serviceCenterName : undefined),
                        };
                        
                        // Save service intake request
                        const existingRequests = safeStorage.getItem<ServiceIntakeRequest[]>("serviceIntakeRequests", []);
                        const updatedRequests = [...existingRequests, serviceIntakeRequest];
                        safeStorage.setItem("serviceIntakeRequests", updatedRequests);
                        
                        // Update appointment status
                        const updatedAppointments = appointments.map((apt) =>
                          apt.id === selectedAppointment.id
                            ? { ...apt, status: "Sent to Manager" }
                            : apt
                        );
                        setAppointments(updatedAppointments);
                        safeStorage.setItem("appointments", updatedAppointments);
                        setSelectedAppointment({ ...selectedAppointment, status: "Sent to Manager" });
                        
                        showToast("Service intake request sent to manager for approval.", "success");
                      }}
                      className="px-4 py-3 rounded-lg border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 font-medium text-sm text-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <User size={18} />
                      Pass to Manager
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Generate check-in slip
                        if (!selectedAppointment) return;
                        const slipData = generateCheckInSlipData();
                        if (slipData) {
                          setCheckInSlipData(slipData);
                          setServiceIntakeForm((prev) => ({
                            ...prev,
                            checkInSlipNumber: slipData.slipNumber,
                            checkInDate: slipData.checkInDate,
                            checkInTime: slipData.checkInTime,
                          }));
                          setShowCheckInSlipModal(true);
                          showToast("Check-in slip generated successfully.", "success");
                        }
                      }}
                      className="px-4 py-3 rounded-lg border-2 border-green-300 bg-green-50 hover:bg-green-100 font-medium text-sm text-green-700 transition flex items-center justify-center gap-2"
                    >
                      <FileText size={18} />
                      Generate Check-in Slip
                    </button>
                  </div>
                </div>

                {/* Check-in Slip Status */}
                {checkInSlipData && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="text-green-600" size={20} />
                      <p className="font-semibold text-green-800">Check-in Slip Generated</p>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      Check-in slip has been generated. You can view or print it below.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCheckInSlipModal(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition text-sm flex items-center gap-2"
                    >
                      <FileText size={16} />
                      View / Print Check-in Slip
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-500">Job Card Status</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentJobCard ? currentJobCard.jobCardNumber : "Not Created Yet"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentJobCard 
                        ? `Status: ${currentJobCard.status}` 
                        : "Job card will be created after quotation approval"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Check-in Notes</label>
                    <textarea
                      value={serviceIntakeForm.checkInNotes || ""}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, checkInNotes: e.target.value })}
                      rows={3}
                      placeholder="Record observations from the arrival (e.g., vehicle condition, missing documentation)."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm text-gray-900 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Vehicle Condition Media</label>
                    <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => handleDocumentUpload("photosVideos", e.target.files)}
                    className="text-sm text-gray-700"
                  />
                  {serviceIntakeForm.photosVideos.files.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {serviceIntakeForm.photosVideos.files.map((file, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden">
                          {file.type.startsWith("image/") ? (
                            <img
                              src={serviceIntakeForm.photosVideos.urls[index]}
                              alt={file.name}
                              className="w-full h-24 object-cover"
                            />
                          ) : (
                            <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                              {file.name}
                    </div>
                          )}
                          <button
                            onClick={() => handleRemoveDocument("photosVideos", index)}
                            className="absolute top-1 right-1 text-white bg-black/50 rounded-full p-1"
                            type="button"
                          >
                            <Trash2 size={12} />
                          </button>
                </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Service Intake Form (Service Advisor Only - When Customer Arrived) */}
            {isServiceAdvisor && customerArrivalStatus === "arrived" && (
              <div className="space-y-6 border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Service Intake Form</h3>
                
                {/* Documentation Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200">
                  <h4 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-600 rounded"></span>
                    Documentation
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer ID Proof */}
                    <div className="bg-white rounded-lg p-4 border border-indigo-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Customer ID Proof
                      </label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <label className="flex-1 flex items-center justify-center h-32 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors">
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="text-indigo-600" size={24} />
                              <span className="text-sm text-gray-600 font-medium">Click to upload</span>
                              <span className="text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</span>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              multiple
                              onChange={(e) => handleDocumentUpload("customerIdProof", e.target.files)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleOpenCamera("customerIdProof")}
                            className="h-32 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex flex-col items-center justify-center gap-2 min-w-[100px]"
                            title="Capture from camera"
                          >
                            <Camera size={24} />
                            <span className="text-xs font-medium">Camera</span>
                          </button>
                        </div>
                        {serviceIntakeForm.customerIdProof.files.length > 0 && (
                          <div className="space-y-2">
                            {serviceIntakeForm.customerIdProof.files.map((file, index) => (
                              <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <FileText className="text-indigo-600 shrink-0" size={18} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                                <button
                                  onClick={() => handleRemoveDocument("customerIdProof", index)}
                                  className="text-red-600 hover:text-red-700 p-1 rounded transition"
                                  title="Remove file"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vehicle RC Copy */}
                    <div className="bg-white rounded-lg p-4 border border-indigo-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Vehicle RC Copy
                      </label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <label className="flex-1 flex items-center justify-center h-32 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors">
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="text-indigo-600" size={24} />
                              <span className="text-sm text-gray-600 font-medium">Click to upload</span>
                              <span className="text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</span>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              multiple
                              onChange={(e) => handleDocumentUpload("vehicleRCCopy", e.target.files)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleOpenCamera("vehicleRCCopy")}
                            className="h-32 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex flex-col items-center justify-center gap-2 min-w-[100px]"
                            title="Capture from camera"
                          >
                            <Camera size={24} />
                            <span className="text-xs font-medium">Camera</span>
                          </button>
                        </div>
                        {serviceIntakeForm.vehicleRCCopy.files.length > 0 && (
                          <div className="space-y-2">
                            {serviceIntakeForm.vehicleRCCopy.files.map((file, index) => (
                              <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <FileText className="text-indigo-600 shrink-0" size={18} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                                <button
                                  onClick={() => handleRemoveDocument("vehicleRCCopy", index)}
                                  className="text-red-600 hover:text-red-700 p-1 rounded transition"
                                  title="Remove file"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Warranty Card / Service Book */}
                    <div className="bg-white rounded-lg p-4 border border-indigo-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Warranty Card / Service Book
                      </label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <label className="flex-1 flex items-center justify-center h-32 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors">
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="text-indigo-600" size={24} />
                              <span className="text-sm text-gray-600 font-medium">Click to upload</span>
                              <span className="text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</span>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              multiple
                              onChange={(e) => handleDocumentUpload("warrantyCardServiceBook", e.target.files)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleOpenCamera("warrantyCardServiceBook")}
                            className="h-32 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex flex-col items-center justify-center gap-2 min-w-[100px]"
                            title="Capture from camera"
                          >
                            <Camera size={24} />
                            <span className="text-xs font-medium">Camera</span>
                          </button>
                        </div>
                        {serviceIntakeForm.warrantyCardServiceBook.files.length > 0 && (
                          <div className="space-y-2">
                            {serviceIntakeForm.warrantyCardServiceBook.files.map((file, index) => (
                              <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <FileText className="text-indigo-600 shrink-0" size={18} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                                <button
                                  onClick={() => handleRemoveDocument("warrantyCardServiceBook", index)}
                                  className="text-red-600 hover:text-red-700 p-1 rounded transition"
                                  title="Remove file"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Photos/Videos of Vehicle at Drop-off */}
                    <div className="bg-white rounded-lg p-4 border border-indigo-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Photos/Videos of Vehicle at Drop-off
                      </label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <label className="flex-1 flex items-center justify-center h-32 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors">
                            <div className="flex flex-col items-center gap-2">
                              <ImageIcon className="text-indigo-600" size={24} />
                              <span className="text-sm text-gray-600 font-medium">Click to upload</span>
                              <span className="text-xs text-gray-500">JPG, PNG, MP4, MOV (Max 50MB)</span>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept=".jpg,.jpeg,.png,.mp4,.mov"
                              multiple
                              onChange={(e) => handleDocumentUpload("photosVideos", e.target.files)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleOpenCamera("photosVideos")}
                            className="h-32 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex flex-col items-center justify-center gap-2 min-w-[100px]"
                            title="Capture from camera"
                          >
                            <Camera size={24} />
                            <span className="text-xs font-medium">Camera</span>
                          </button>
                        </div>
                        {serviceIntakeForm.photosVideos.files.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {serviceIntakeForm.photosVideos.files.map((file, index) => (
                              <div key={index} className="relative group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                {file.type.startsWith("image/") ? (
                                  <Image
                                    src={serviceIntakeForm.photosVideos.urls[index]}
                                    alt={file.name}
                                    width={128}
                                    height={128}
                                    className="w-full h-32 object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-32 flex items-center justify-center bg-gray-100">
                                    <FileText className="text-gray-400" size={32} />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    onClick={() => handleRemoveDocument("photosVideos", index)}
                                    className="text-white hover:text-red-300 p-2 rounded transition"
                                    title="Remove file"
                                  >
                                    <Trash2 size={20} />
                                  </button>
                                </div>
                                <div className="p-2 bg-white">
                                  <p className="text-xs font-medium text-gray-800 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information Section */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                  <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-green-600 rounded"></span>
                    Vehicle Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Vehicle Brand"
                      required
                      value={serviceIntakeForm.vehicleBrand}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, vehicleBrand: e.target.value })}
                      placeholder="Enter vehicle brand"
                    />
                    <FormInput
                      label="Vehicle Model"
                      required
                      value={serviceIntakeForm.vehicleModel}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, vehicleModel: e.target.value })}
                      placeholder="Enter vehicle model"
                    />
                    <FormInput
                      label="Registration Number"
                      required
                      value={serviceIntakeForm.registrationNumber}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, registrationNumber: e.target.value.toUpperCase() })}
                      placeholder="Enter registration number"
                    />
                    <FormInput
                      label="VIN / Chassis Number"
                      value={serviceIntakeForm.vinChassisNumber}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, vinChassisNumber: e.target.value.toUpperCase() })}
                      placeholder="Enter VIN/Chassis number"
                    />
                    <FormInput
                      label="Variant / Battery Capacity"
                      value={serviceIntakeForm.variantBatteryCapacity}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, variantBatteryCapacity: e.target.value })}
                      placeholder="Enter variant/battery capacity"
                    />
                    <FormInput
                      label="Motor Number"
                      value={serviceIntakeForm.motorNumber}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, motorNumber: e.target.value })}
                      placeholder="Enter motor number"
                    />
                    <FormInput
                      label="Charger Serial Number"
                      value={serviceIntakeForm.chargerSerialNumber}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, chargerSerialNumber: e.target.value })}
                      placeholder="Enter charger serial number"
                    />
                    <div>
                      <FormInput
                        label="Date of Purchase"
                        value={serviceIntakeForm.dateOfPurchase}
                        onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, dateOfPurchase: e.target.value })}
                        type="date"
                      />
                      {serviceIntakeForm.dateOfPurchase && (() => {
                        const purchaseDate = new Date(serviceIntakeForm.dateOfPurchase);
                        const today = new Date();
                        const yearsDiff = today.getFullYear() - purchaseDate.getFullYear();
                        const monthsDiff = today.getMonth() - purchaseDate.getMonth();
                        let vehicleAge = "";
                        if (yearsDiff > 0) {
                          vehicleAge = monthsDiff >= 0 
                            ? `${yearsDiff} year${yearsDiff > 1 ? 's' : ''}`
                            : `${yearsDiff - 1} year${yearsDiff - 1 > 1 ? 's' : ''}`;
                        } else if (monthsDiff > 0) {
                          vehicleAge = `${monthsDiff} month${monthsDiff > 1 ? 's' : ''}`;
                        } else {
                          vehicleAge = "Less than 1 month";
                        }
                        return (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Vehicle Age:</span> {vehicleAge}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                    <FormSelect
                      label="Warranty Status"
                      value={serviceIntakeForm.warrantyStatus}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, warrantyStatus: e.target.value })}
                      options={[
                        { value: "", label: "Select warranty status" },
                        { value: "Active", label: "Active" },
                        { value: "Expired", label: "Expired" },
                        { value: "Not Applicable", label: "Not Applicable" },
                      ]}
                    />
                    <FormInput
                      label="Insurance Start Date"
                      value={serviceIntakeForm.insuranceStartDate}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, insuranceStartDate: e.target.value })}
                      type="date"
                    />
                    <FormInput
                      label="Insurance End Date"
                      value={serviceIntakeForm.insuranceEndDate}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, insuranceEndDate: e.target.value })}
                      type="date"
                    />
                    <FormInput
                      label="Insurance Company Name"
                      value={serviceIntakeForm.insuranceCompanyName}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, insuranceCompanyName: e.target.value })}
                      placeholder="Enter insurance company name"
                    />
                  </div>
                </div>

                {/* Service Details Section */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-600 rounded"></span>
                    Service Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      label="Service Type"
                      required
                      value={serviceIntakeForm.serviceType}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, serviceType: e.target.value })}
                      placeholder="Select service type"
                      options={SERVICE_TYPES.map((type) => ({ value: type, label: type }))}
                    />
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Customer Complaint / Issue Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={serviceIntakeForm.customerComplaintIssue}
                        onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, customerComplaintIssue: e.target.value })}
                        rows={3}
                        placeholder="Describe the customer complaint or issue..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200 bg-gray-50/50 focus:bg-white resize-none"
                      />
                    </div>
                    {/* Additional fields */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Previous Service History
                          </label>
                          <textarea
                            value={serviceIntakeForm.previousServiceHistory}
                            onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, previousServiceHistory: e.target.value })}
                            rows={3}
                            placeholder="Enter previous service history..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200 bg-gray-50/50 focus:bg-white resize-none"
                          />
                        </div>
                        <FormInput
                          label="Estimated Service Time"
                          value={serviceIntakeForm.estimatedServiceTime}
                          onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, estimatedServiceTime: e.target.value })}
                          placeholder="e.g., 2 hours"
                        />
                        <FormInput
                          label="Estimated Cost"
                          value={serviceIntakeForm.estimatedCost}
                          onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, estimatedCost: e.target.value })}
                          placeholder="Enter estimated cost"
                          type="number"
                        />
                        <FormInput
                          label="Odometer Reading"
                          value={serviceIntakeForm.odometerReading}
                          onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, odometerReading: e.target.value })}
                          placeholder="Enter odometer reading"
                          type="number"
                        />
                  </div>
                </div>

                {/* Operational Details Section (Job Card) */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded"></span>
                    Operational Details (Job Card)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Estimated Delivery Date (Service Advisor & Service Manager) */}
                    <FormInput
                      label="Estimated Delivery Date"
                      type="date"
                      value={serviceIntakeForm.estimatedDeliveryDate}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, estimatedDeliveryDate: e.target.value })}
                    />
                    
                    {/* Assigned Service Advisor (Call Center, Service Advisor, Service Manager) */}
                    <FormInput
                      label="Assigned Service Advisor"
                      value={serviceIntakeForm.assignedServiceAdvisor}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, assignedServiceAdvisor: e.target.value })}
                      placeholder="Enter service advisor name"
                    />
                    
                    {/* Assigned Technician (Service Advisor & Service Manager) */}
                    <FormInput
                      label="Assigned Technician"
                      value={serviceIntakeForm.assignedTechnician}
                      onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, assignedTechnician: e.target.value })}
                      placeholder="Enter technician name"
                    />
                    
                    {/* Pickup / Drop Required */}
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={serviceIntakeForm.pickupDropRequired}
                          onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, pickupDropRequired: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Pickup / Drop Required</span>
                      </label>
                    </div>
                    
                    {/* Pickup Address */}
                    {serviceIntakeForm.pickupDropRequired && (
                      <FormInput
                        label="Pickup Address"
                        value={serviceIntakeForm.pickupAddress}
                        onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, pickupAddress: e.target.value })}
                        placeholder="Enter pickup address"
                      />
                    )}
                    
                    {/* Drop Address */}
                    {serviceIntakeForm.pickupDropRequired && (
                      <FormInput
                        label="Drop Address"
                        value={serviceIntakeForm.dropAddress}
                        onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, dropAddress: e.target.value })}
                        placeholder="Enter drop address"
                      />
                    )}
                    
                    {/* Preferred Communication Mode */}
                    <div className="md:col-span-2">
                      <FormSelect
                        label="Preferred Communication Mode"
                        value={serviceIntakeForm.preferredCommunicationMode}
                        onChange={(e) => setServiceIntakeForm({ ...serviceIntakeForm, preferredCommunicationMode: e.target.value as "Phone" | "Email" | "SMS" | "WhatsApp" | "" })}
                        placeholder="Select communication mode"
                        options={[
                          { value: "Phone", label: "Phone" },
                          { value: "Email", label: "Email" },
                          { value: "SMS", label: "SMS" },
                          { value: "WhatsApp", label: "WhatsApp" },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* Cost Estimation Note (Billing & Payment fields removed - only available during invoice creation) */}
                {canViewCostEstimation && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <span className="w-1 h-6 bg-blue-600 rounded"></span>
                      Cost Estimation
                    </h4>
                    <FormInput
                      label="Estimated Cost"
                      value={serviceIntakeForm.estimatedCost ? `₹${serviceIntakeForm.estimatedCost}` : appointmentForm.estimatedCost ? `₹${appointmentForm.estimatedCost}` : ""}
                      onChange={() => {}}
                      readOnly
                      placeholder="Cost will be determined during service"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      Note: Payment method, GST requirement, and billing details will be collected when creating the invoice during vehicle delivery.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setCustomerArrivalStatus(null);
                      setServiceIntakeForm(INITIAL_SERVICE_INTAKE_FORM);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    disabled={!currentJobCardId}
                    className={`flex-1 rounded-lg px-4 py-3 font-medium transition ${
                      currentJobCardId
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Save as Draft
                  </button>
                    <button
                      onClick={handleConvertToQuotation}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
                    >
                      <FileText size={18} />
                      Convert into Estimation/Quotation
                    </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleViewVehicleDetails}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Eye size={18} />
                View Details
              </button>
              <button
                onClick={() => {
                  closeDetailModal();
                  handleEditAppointment(selectedAppointment);
                }}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Edit Appointment
              </button>
              <button
                onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition"
              >
                Delete Appointment
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Vehicle Details Modal */}
      <Modal
        show={showVehicleDetails}
        onClose={closeVehicleDetailsModal}
        title="Vehicle Details"
        subtitle={selectedAppointment ? `${selectedAppointment.vehicle} - ${selectedAppointment.customerName}` : undefined}
        maxWidth="4xl"
      >
        <div className="space-y-6">
          {selectedVehicle ? (
            <>
              {/* Vehicle Information */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                  <Car size={20} />
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-indigo-600 font-medium mb-1">Vehicle Brand</p>
                    <p className="text-gray-800 font-semibold">{selectedVehicle.vehicleMake}</p>
                  </div>
                  <div>
                    <p className="text-indigo-600 font-medium mb-1">Vehicle Model</p>
                    <p className="text-gray-800 font-semibold">{selectedVehicle.vehicleModel}</p>
                  </div>
                  <div>
                    <p className="text-indigo-600 font-medium mb-1">Year</p>
                    <p className="text-gray-800 font-semibold">{selectedVehicle.vehicleYear}</p>
                  </div>
                  <div>
                    <p className="text-indigo-600 font-medium mb-1">Registration Number</p>
                    <p className="text-gray-800 font-semibold">{selectedVehicle.registration}</p>
                  </div>
                  <div>
                    <p className="text-indigo-600 font-medium mb-1">VIN / Chassis Number</p>
                    <p className="text-gray-800 font-semibold font-mono text-xs break-all">{selectedVehicle.vin}</p>
                  </div>
                  <div>
                    <p className="text-indigo-600 font-medium mb-1">Color</p>
                    <p className="text-gray-800 font-semibold">{selectedVehicle.vehicleColor}</p>
                  </div>
                  <div>
                    <p className="text-indigo-600 font-medium mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        selectedVehicle.currentStatus === "Active Job Card"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {selectedVehicle.currentStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-indigo-600 font-medium mb-1">Total Services</p>
                    <p className="text-gray-800 font-semibold">{selectedVehicle.totalServices}</p>
                  </div>
                  <div>
                    <p className="text-indigo-600 font-medium mb-1">Total Spent</p>
                    <p className="text-gray-800 font-semibold">{selectedVehicle.totalSpent}</p>
                  </div>
                  {selectedVehicle.lastServiceDate && (
                    <div>
                      <p className="text-indigo-600 font-medium mb-1">Last Service Date</p>
                      <p className="text-gray-800 font-semibold">{selectedVehicle.lastServiceDate}</p>
                    </div>
                  )}
                  {selectedVehicle.nextServiceDate && (
                    <div>
                      <p className="text-indigo-600 font-medium mb-1">Next Service Date</p>
                      <p className="text-gray-800 font-semibold">{selectedVehicle.nextServiceDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={20} />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Customer Name</p>
                    <p className="text-gray-800 font-semibold">{selectedVehicle.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Phone Number</p>
                    <p className="text-gray-800 font-semibold flex items-center gap-2">
                      <Phone size={14} />
                      {selectedVehicle.phone}
                    </p>
                  </div>
                  {selectedVehicle.customerEmail && (
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Email</p>
                      <p className="text-gray-800 font-semibold">{selectedVehicle.customerEmail}</p>
                    </div>
                  )}
                  {selectedVehicle.customerAddress && (
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Address</p>
                      <p className="text-gray-800 font-semibold">{selectedVehicle.customerAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Car className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Vehicle Details...</h3>
              <p className="text-gray-600">Searching for vehicle information...</p>
              {customerSearchLoading && (
                <div className="mt-4 flex justify-center">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!customerSearchLoading && customerSearchResults.length === 0 && selectedAppointment && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 text-left max-w-md mx-auto">
                  <h4 className="font-semibold text-gray-800 mb-3">Appointment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Customer</p>
                      <p className="text-gray-800">{selectedAppointment.customerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Phone</p>
                      <p className="text-gray-800">{selectedAppointment.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Vehicle</p>
                      <p className="text-gray-800">{selectedAppointment.vehicle}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Service Type</p>
                      <p className="text-gray-800">{selectedAppointment.serviceType}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-4">
                    Vehicle details not found in the system. The vehicle may not be registered yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {showCheckInSlipModal && checkInSlipData && (
        <CheckInSlip data={checkInSlipData} onClose={() => setShowCheckInSlipModal(false)} />
      )}

      {/* Create Complaint Modal (for Call Center) */}
      {isCallCenter && (
        <Modal show={showComplaintModal} onClose={closeComplaintModal} title="Create Complaint">
            <div className="space-y-4">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative" ref={complaintCustomerDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={complaintCustomerSearchQuery}
                      onChange={(e) => handleComplaintCustomerSearchChange(e.target.value)}
                      onFocus={() => {
                        if (complaintCustomerSearchQuery.trim().length >= 2 && customerSearchResults.length > 0) {
                          setShowComplaintCustomerDropdown(true);
                        }
                      }}
                      placeholder="Start typing customer name..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                      required
                    />
                    {showComplaintCustomerDropdown && customerSearchResults.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {typedCustomerSearchResults.map((customer) => (
                          <div
                            key={customer.id}
                            onClick={() => handleComplaintCustomerSelect(customer)}
                            className="p-3 hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-red-100">
                                <User className="text-red-600" size={16} strokeWidth={2} />
    </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{customer.name}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Phone size={12} />
                                    {customer.phone}
                                  </span>
                                  {customer.vehicles && customer.vehicles.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Car size={12} />
                                      {customer.vehicles.length} vehicle{customer.vehicles.length > 1 ? "s" : ""}
                                    </span>
                                  )}
                                  {customer.lastServiceCenterName && (
                                    <span className="flex items-center gap-1">
                                      <Building2 size={12} />
                                      {customer.lastServiceCenterName}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {/* @ts-ignore Customer comes from typed search results */}
                              {selectedComplaintCustomer?.id === customer.id && (
                                <CheckCircle className="text-red-600 shrink-0" size={18} strokeWidth={2} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {customerSearchLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                    value={complaintForm.phone}
                    onChange={(e) =>
                      setComplaintForm({ ...complaintForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                    }
                      placeholder="9876543210"
                      maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle <span className="text-red-500">*</span>
                    </label>
                  {selectedComplaintCustomer && selectedComplaintCustomer.vehicles && selectedComplaintCustomer.vehicles.length > 0 ? (
                    <div>
                      <select
                        value={complaintForm.vehicle}
                        onChange={(e) => setComplaintForm({ ...complaintForm, vehicle: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                        required
                      >
                        <option value="">Select Vehicle</option>
                        {selectedComplaintCustomer.vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={formatVehicleString(vehicle)}>
                            {formatVehicleString(vehicle)} - {vehicle.registration}
                          </option>
                        ))}
                      </select>
                      {complaintForm.vehicle && (() => {
                        const selectedVehicle = selectedComplaintCustomer.vehicles.find((v) => 
                          formatVehicleString(v) === complaintForm.vehicle
                        );
                        return selectedVehicle?.lastServiceCenterName ? (
                          <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                            <Building2 size={12} />
                            Last serviced at: {selectedVehicle.lastServiceCenterName}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={complaintForm.vehicle}
                      onChange={(e) => setComplaintForm({ ...complaintForm, vehicle: e.target.value })}
                      placeholder={selectedComplaintCustomer ? "No vehicles found" : "Select a customer first"}
                      disabled={!selectedComplaintCustomer}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    />
                  )}
                  </div>
                </div>

              {/* Selected Customer Info Display */}
              {selectedComplaintCustomer && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-900 mb-3">Selected Customer Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-red-600 font-medium">Customer Number</p>
                      <p className="text-gray-800 font-semibold">{selectedComplaintCustomer.customerNumber}</p>
                    </div>
                    {selectedComplaintCustomer.email && (
                      <div>
                        <p className="text-red-600 font-medium">Email</p>
                        <p className="text-gray-800 font-semibold">{selectedComplaintCustomer.email}</p>
                      </div>
                    )}
                    {selectedComplaintCustomer.address && (
                      <div className="sm:col-span-2">
                        <p className="text-red-600 font-medium">Address</p>
                        <p className="text-gray-800 font-semibold">{selectedComplaintCustomer.address}</p>
                      </div>
                    )}
                    {selectedComplaintCustomer.lastServiceCenterName && (
                      <div className="sm:col-span-2">
                        <p className="text-red-600 font-medium flex items-center gap-1">
                          <Building2 size={14} />
                          Last Service Center
                        </p>
                        <p className="text-gray-800 font-semibold">{selectedComplaintCustomer.lastServiceCenterName}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              </div>

            {/* Complaint Details */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Complaint Details</h3>
              <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complaint Description <span className="text-red-500">*</span>
                    </label>
                  <textarea
                    value={complaintForm.complaint}
                    onChange={(e) => setComplaintForm({ ...complaintForm, complaint: e.target.value })}
                    rows={4}
                    placeholder="Describe the complaint in detail..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                      required
                  />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity <span className="text-red-500">*</span>
                    </label>
                    <select
                    value={complaintForm.severity}
                    onChange={(e) => setComplaintForm({ ...complaintForm, severity: e.target.value as ComplaintForm["severity"] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                      required
                    >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                    </select>
                  </div>
                  </div>
            </div>

            {/* Service Center Selection (for Call Center) */}
            {isCallCenter && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 className="text-indigo-600" size={20} />
                  Service Center Assignment
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign to Service Center <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={complaintForm.serviceCenterId || ""}
                      onChange={(e) =>
                        setComplaintForm({
                          ...complaintForm,
                          serviceCenterId: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                      required
                    >
                      <option value="">Select Service Center</option>
                      {availableServiceCenters.map((center) => (
                        <option key={center.id} value={center.id}>
                          {center.name} - {center.location}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedComplaintCustomer?.address && complaintForm.serviceCenterId && (
                    <div className="bg-white border border-indigo-200 rounded-lg p-3 flex items-start gap-3">
                      <MapPin className="text-indigo-600 shrink-0 mt-0.5" size={18} strokeWidth={2} />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-indigo-700 mb-1">Nearest Service Center Suggested</p>
                        <p className="text-sm text-gray-700">
                          Based on customer address: <span className="font-medium">{selectedComplaintCustomer.address}</span>
                        </p>
                        {(() => {
                          const suggestedId = findNearestServiceCenter(selectedComplaintCustomer.address);
                          const isSuggested = suggestedId === complaintForm.serviceCenterId;
                          return isSuggested ? (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircle size={12} />
                              This is the nearest service center to the customer
                            </p>
                          ) : (
                            <p className="text-xs text-amber-600 mt-1">
                              Note: A different service center may be closer to the customer
                            </p>
                          );
                        })()}
                </div>
              </div>
                  )}
                </div>
              </div>
            )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button onClick={closeComplaintModal} className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition">
                Cancel
              </button>
                <button
                onClick={handleSubmitComplaint}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
              >
                Create Complaint
                </button>
            </div>
          </div>
        </Modal>
      )}

    {showServiceCenterSelector && (
      <div className="fixed inset-0 z-[1100] bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Choose Service Center</h3>
                <button
              type="button"
              onClick={() => setShowServiceCenterSelector(false)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-6 py-4 space-y-4">
            <input
              type="text"
              placeholder="Search service center..."
              value={serviceCenterSearch}
              onChange={(e) => setServiceCenterSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
              {filteredServiceCenters.map((center) => (
                <button
                  key={center.id}
                  type="button"
                  onClick={() => {
                    setAppointmentForm((prev) => ({
                      ...prev,
                      serviceCenterId: center.id,
                      serviceCenterName: center.name,
                    }));
                    setShowServiceCenterSelector(false);
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-left hover:bg-indigo-50 transition"
                >
                  <div className="font-semibold text-gray-900">{center.name}</div>
                  <p className="text-xs text-gray-500">{center.location}</p>
                </button>
              ))}
              {filteredServiceCenters.length === 0 && (
                <p className="text-sm text-gray-500 text-center">No service centers match your search.</p>
              )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading appointments...</div>}>
      <AppointmentsContent />
    </Suspense>
  );
}
