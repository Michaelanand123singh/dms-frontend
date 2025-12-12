"use client";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { Calendar, Clock, User, Car, X, Phone, CheckCircle, AlertCircle, Eye, MapPin, Building2, AlertTriangle, Upload, FileText, Image as ImageIcon, Trash2, UserCheck, Camera, Mail } from "lucide-react";
import CheckInSlip, { generateCheckInSlipNumber, type CheckInSlipData } from "@/components/check-in-slip/CheckInSlip";
import CameraModal from "../components/shared/CameraModal";
import { useCustomerSearch } from "../../../../hooks/api";
import { useRole } from "@/shared/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import {
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
import { customerService } from "@/features/customers/services/customer.service";
import type { JobCardPart2Item } from "@/shared/types/job-card.types";
import { AppointmentFormModal } from "../customer-find/components/modals/AppointmentFormModal";
import type { AppointmentForm as AppointmentFormType } from "../components/appointment/types";
import { getInitialAppointmentForm } from "@/shared/utils/form.utils";
import { formatTime24 as formatTime } from "@/shared/utils/date";
import { canCreateAppointment } from "@/shared/constants/roles";

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
  pickupState?: string;
  pickupCity?: string;
  pickupPincode?: string;
  dropAddress?: string;
  dropState?: string;
  dropCity?: string;
  dropPincode?: string;
  preferredCommunicationMode?: "Phone" | "Email" | "SMS" | "WhatsApp";
  paymentMethod?: "Cash" | "Card" | "UPI" | "Online" | "Cheque";
  gstRequirement?: boolean;
  businessNameForInvoice?: string;
  feedbackRating?: number;
  nextServiceDueDate?: string;
  amcSubscriptionStatus?: string;
  createdByRole?: "call_center" | "service_advisor" | "service_manager"; // Track who created the appointment
}

// Import AppointmentForm from canonical types - no duplicate interface needed

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
// INITIAL_APPOINTMENT_FORM is now imported from canonical types file


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

// validateAppointmentForm is now imported from canonical types file


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
      className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200 ${readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50/50 focus:bg-white"
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
        className={`${type === "success" ? "bg-green-600" : "bg-red-600"
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

  // Appointment creation form states
  const [showAppointmentFormModal, setShowAppointmentFormModal] = useState<boolean>(false);
  const [selectedAppointmentCustomer, setSelectedAppointmentCustomer] = useState<CustomerWithVehicles | null>(null);
  const [selectedAppointmentVehicle, setSelectedAppointmentVehicle] = useState<Vehicle | null>(null);
  const [appointmentFormData, setAppointmentFormData] = useState<Partial<AppointmentFormType>>(() => getInitialAppointmentForm());

  // Customer search for appointment creation (separate from detail modal search)
  const appointmentCustomerSearch = useCustomerSearch();
  const appointmentCustomerSearchResults: CustomerWithVehicles[] = appointmentCustomerSearch.results as CustomerWithVehicles[];
  const typedAppointmentCustomerSearchResults = appointmentCustomerSearchResults as CustomerWithVehicles[];
  const appointmentCustomerSearchLoading = appointmentCustomerSearch.loading;
  const searchAppointmentCustomer = appointmentCustomerSearch.search;
  const clearAppointmentCustomerSearch = appointmentCustomerSearch.clear;

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

  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRecord | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Check if current appointment was created by call center (for service advisor view)
  const isAppointmentCreatedByCallCenter = useMemo(() => {
    return selectedAppointment?.createdByRole === "call_center";
  }, [selectedAppointment]);
  const [detailCustomer, setDetailCustomer] = useState<CustomerWithVehicles | null>(null);
  const [currentJobCardId, setCurrentJobCardId] = useState<string | null>(null);
  const [currentJobCard, setCurrentJobCard] = useState<JobCard | null>(null);
  const [arrivalMode, setArrivalMode] = useState<ServiceIntakeForm["arrivalMode"] | null>(null);
  const [checkInSlipData, setCheckInSlipData] = useState<any>(null);
  const [showCheckInSlipModal, setShowCheckInSlipModal] = useState<boolean>(false);

  // Service Center States (for call center)
  const [availableServiceCenters] = useState(() => {
    return defaultServiceCenters.filter((sc) => sc.status === "Active");
  });

  // Modal States
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState<boolean>(false);

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
    // Reset service intake form when opening appointment details
    setCustomerArrivalStatus(null);
    setServiceIntakeForm(INITIAL_SERVICE_INTAKE_FORM);
  }, []);

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

    if (detailCustomer) {
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
  }, [currentJobCardId, showToast, updateStoredJobCard, serviceIntakeForm, detailCustomer, selectedAppointment]);

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
    const customerEmail = detailCustomer?.email || undefined;

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
  }, [selectedAppointment, currentJobCard, serviceIntakeForm, detailCustomer, serviceCenterContext]);

  const handleArrivalModeSelect = useCallback((mode: ServiceIntakeForm["arrivalMode"] | null) => {
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

  // Appointment form handlers
  const handleOpenNewAppointment = useCallback(() => {
    if (!canCreateNewAppointment) {
      showToast("You do not have permission to create new appointments.", "error");
      return;
    }
    setSelectedAppointmentCustomer(null);
    setSelectedAppointmentVehicle(null);
    setAppointmentFormData(getInitialAppointmentForm());
    setShowAppointmentFormModal(true);
  }, [canCreateNewAppointment, showToast]);

  const handleCloseAppointmentForm = useCallback(() => {
    setShowAppointmentFormModal(false);
    setSelectedAppointmentCustomer(null);
    setSelectedAppointmentVehicle(null);
    setAppointmentFormData(getInitialAppointmentForm());
    clearAppointmentCustomerSearch();
  }, [clearAppointmentCustomerSearch]);

  const handleCustomerSelectForAppointment = useCallback((customer: CustomerWithVehicles) => {
    setSelectedAppointmentCustomer(customer);
    // Auto-select first vehicle if available
    if (customer.vehicles && customer.vehicles.length > 0) {
      setSelectedAppointmentVehicle(customer.vehicles[0]);
      const vehicleString = `${customer.vehicles[0].vehicleMake} ${customer.vehicles[0].vehicleModel} (${customer.vehicles[0].vehicleYear})`;
      setAppointmentFormData((prev) => ({
        ...prev,
        customerName: customer.name,
        phone: customer.phone,
        vehicle: vehicleString,
      }));
    } else {
      setSelectedAppointmentVehicle(null);
      setAppointmentFormData((prev) => ({
        ...prev,
        customerName: customer.name,
        phone: customer.phone,
        vehicle: "",
      }));
    }
    clearAppointmentCustomerSearch();
  }, [clearAppointmentCustomerSearch]);

  const handleSubmitAppointmentForm = useCallback((form: AppointmentFormType) => {
    // Map service center name to ID for proper filtering
    const selectedServiceCenter = form.serviceCenterName
      ? staticServiceCenters.find((center) => center.name === form.serviceCenterName)
      : null;
    const serviceCenterId = (selectedServiceCenter as any)?.serviceCenterId || selectedServiceCenter?.id?.toString() || null;
    const serviceCenterName = form.serviceCenterName || null;
    const assignedServiceCenter = form.serviceCenterName || null;

    // Clean up file URLs before saving
    const appointmentData: any = {
      customerName: form.customerName,
      vehicle: form.vehicle,
      phone: form.phone,
      serviceType: form.serviceType,
      date: form.date,
      time: formatTime(form.time),
      duration: `${form.duration} hours`,
      status: "Confirmed",
      customerType: selectedAppointmentCustomer?.customerType,
      alternateMobile: (form as any).alternateMobile,
      customerComplaintIssue: form.customerComplaintIssue,
      previousServiceHistory: form.previousServiceHistory,
      estimatedServiceTime: form.estimatedServiceTime,
      estimatedCost: form.estimatedCost,
      estimationCost: (form as any).estimationCost,
      odometerReading: form.odometerReading,
      estimatedDeliveryDate: form.estimatedDeliveryDate,
      assignedServiceAdvisor: form.assignedServiceAdvisor,
      assignedTechnician: form.assignedTechnician,
      assignedServiceCenter: assignedServiceCenter,
      serviceCenterId: serviceCenterId,
      serviceCenterName: serviceCenterName,
      pickupDropRequired: form.pickupDropRequired,
      pickupAddress: form.pickupAddress,
      pickupState: (form as any).pickupState,
      pickupCity: (form as any).pickupCity,
      pickupPincode: (form as any).pickupPincode,
      dropAddress: form.dropAddress,
      dropState: (form as any).dropState,
      dropCity: (form as any).dropCity,
      dropPincode: (form as any).dropPincode,
      preferredCommunicationMode: form.preferredCommunicationMode,
      paymentMethod: form.paymentMethod,
      gstRequirement: form.gstRequirement,
      businessNameForInvoice: form.businessNameForInvoice,
      serviceStatus: form.serviceStatus,
      feedbackRating: form.feedbackRating,
      nextServiceDueDate: form.nextServiceDueDate,
      amcSubscriptionStatus: form.amcSubscriptionStatus,
      documentationFiles: {
        customerIdProof: form.customerIdProof?.files.length || 0,
        vehicleRCCopy: form.vehicleRCCopy?.files.length || 0,
        warrantyCardServiceBook: form.warrantyCardServiceBook?.files.length || 0,
        photosVideos: form.photosVideos?.files.length || 0,
      },
      createdByRole: isCallCenter ? "call_center" : isServiceAdvisor ? "service_advisor" : undefined,
    };

    // Get existing appointments from localStorage
    const existingAppointments = safeStorage.getItem<Array<any>>("appointments", []);

    // Create new appointment
    const newAppointment: AppointmentRecord = {
      id: existingAppointments.length > 0 
        ? Math.max(...existingAppointments.map((a: any) => a.id)) + 1 
        : 1,
      ...appointmentData,
    };

    // Save to localStorage
    const updatedAppointments = [...existingAppointments, newAppointment];
    safeStorage.setItem("appointments", updatedAppointments);
    setAppointments(updatedAppointments);

    // Clean up file URLs
    if (form.customerIdProof?.urls) {
      form.customerIdProof.urls.forEach((url: string) => URL.revokeObjectURL(url));
    }
    if (form.vehicleRCCopy?.urls) {
      form.vehicleRCCopy.urls.forEach((url: string) => URL.revokeObjectURL(url));
    }
    if (form.warrantyCardServiceBook?.urls) {
      form.warrantyCardServiceBook.urls.forEach((url: string) => URL.revokeObjectURL(url));
    }
    if (form.photosVideos?.urls) {
      form.photosVideos.urls.forEach((url: string) => URL.revokeObjectURL(url));
    }

    showToast(`Appointment scheduled successfully! Customer: ${form.customerName} | Vehicle: ${form.vehicle} | Service: ${form.serviceType} | Date: ${form.date} | Time: ${formatTime(form.time)}`, "success");

    // Close modal and reset form
    handleCloseAppointmentForm();
  }, [selectedAppointmentCustomer, isCallCenter, isServiceAdvisor, showToast, handleCloseAppointmentForm]);

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

    if (detailCustomer) {
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
  }, [selectedAppointment, serviceIntakeForm, appointments, router, closeDetailModal, showToast, currentJobCardId, updateStoredJobCard, detailCustomer, serviceCenterContext]);

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
          {canCreateNewAppointment && (
            <button
              onClick={handleOpenNewAppointment}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
            >
              <Calendar size={20} />
              Create New Appointment
            </button>
          )}
        </div>

        {/* Appointments Grid */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          {visibleAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No appointments scheduled</p>
              <p className="text-gray-400 text-sm mt-2">No appointments available</p>
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

            {/* Service Details */}
            {(selectedAppointment.customerComplaintIssue || 
              selectedAppointment.previousServiceHistory || 
              selectedAppointment.estimatedServiceTime || 
              selectedAppointment.estimatedCost || 
              selectedAppointment.odometerReading || 
              selectedAppointment.estimatedDeliveryDate ||
              selectedAppointment.isMajorIssue !== undefined) && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-purple-600" />
                  Service Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAppointment.isMajorIssue !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Major Issue</p>
                      <p className="font-medium text-gray-800">
                        {selectedAppointment.isMajorIssue ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertTriangle size={14} />
                            Yes
                          </span>
                        ) : (
                          <span className="text-green-600">No</span>
                        )}
                      </p>
                    </div>
                  )}
                  {selectedAppointment.customerComplaintIssue && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Customer Complaint / Issue</p>
                      <p className="font-medium text-gray-800 whitespace-pre-wrap">{selectedAppointment.customerComplaintIssue}</p>
                    </div>
                  )}
                  {selectedAppointment.previousServiceHistory && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Previous Service History</p>
                      <p className="font-medium text-gray-800 whitespace-pre-wrap">{selectedAppointment.previousServiceHistory}</p>
                    </div>
                  )}
                  {selectedAppointment.estimatedServiceTime && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Estimated Service Time</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.estimatedServiceTime}</p>
                    </div>
                  )}
                  {selectedAppointment.estimatedCost && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.estimatedCost}</p>
                    </div>
                  )}
                  {selectedAppointment.odometerReading && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Odometer Reading</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.odometerReading}</p>
                    </div>
                  )}
                  {selectedAppointment.estimatedDeliveryDate && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Estimated Delivery Date</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.estimatedDeliveryDate}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Operational Details */}
            {(selectedAppointment.assignedServiceAdvisor || 
              selectedAppointment.assignedTechnician || 
              selectedAppointment.documentationFiles) && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <UserCheck size={20} className="text-blue-600" />
                  Operational Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAppointment.assignedServiceAdvisor && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Assigned Service Advisor</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.assignedServiceAdvisor}</p>
                    </div>
                  )}
                  {selectedAppointment.assignedTechnician && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Assigned Technician</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.assignedTechnician}</p>
                    </div>
                  )}
                  {selectedAppointment.documentationFiles && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Documentation Files</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {selectedAppointment.documentationFiles.customerIdProof !== undefined && (
                          <div className="bg-white p-2 rounded border border-gray-200">
                            <p className="text-xs text-gray-500">Customer ID Proof</p>
                            <p className="font-medium text-gray-800">{selectedAppointment.documentationFiles.customerIdProof} file(s)</p>
                          </div>
                        )}
                        {selectedAppointment.documentationFiles.vehicleRCCopy !== undefined && (
                          <div className="bg-white p-2 rounded border border-gray-200">
                            <p className="text-xs text-gray-500">Vehicle RC Copy</p>
                            <p className="font-medium text-gray-800">{selectedAppointment.documentationFiles.vehicleRCCopy} file(s)</p>
                          </div>
                        )}
                        {selectedAppointment.documentationFiles.warrantyCardServiceBook !== undefined && (
                          <div className="bg-white p-2 rounded border border-gray-200">
                            <p className="text-xs text-gray-500">Warranty Card</p>
                            <p className="font-medium text-gray-800">{selectedAppointment.documentationFiles.warrantyCardServiceBook} file(s)</p>
                          </div>
                        )}
                        {selectedAppointment.documentationFiles.photosVideos !== undefined && (
                          <div className="bg-white p-2 rounded border border-gray-200">
                            <p className="text-xs text-gray-500">Photos/Videos</p>
                            <p className="font-medium text-gray-800">{selectedAppointment.documentationFiles.photosVideos} file(s)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pickup/Drop Details */}
            {selectedAppointment.pickupDropRequired && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-green-600" />
                  Pickup / Drop Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAppointment.pickupAddress && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Pickup Address</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.pickupAddress}</p>
                      {((selectedAppointment as any).pickupState || (selectedAppointment as any).pickupCity || (selectedAppointment as any).pickupPincode) && (
                        <div className="mt-1 text-sm text-gray-600">
                          {[(selectedAppointment as any).pickupCity, (selectedAppointment as any).pickupState, (selectedAppointment as any).pickupPincode].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedAppointment.dropAddress && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Drop Address</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.dropAddress}</p>
                      {((selectedAppointment as any).dropState || (selectedAppointment as any).dropCity || (selectedAppointment as any).dropPincode) && (
                        <div className="mt-1 text-sm text-gray-600">
                          {[(selectedAppointment as any).dropCity, (selectedAppointment as any).dropState, (selectedAppointment as any).dropPincode].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Billing & Payment Details */}
            {(selectedAppointment.paymentMethod || 
              selectedAppointment.gstRequirement !== undefined || 
              selectedAppointment.businessNameForInvoice) && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-yellow-600" />
                  Billing & Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAppointment.paymentMethod && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.paymentMethod}</p>
                    </div>
                  )}
                  {selectedAppointment.gstRequirement !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">GST Requirement</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.gstRequirement ? "Yes" : "No"}</p>
                    </div>
                  )}
                  {selectedAppointment.businessNameForInvoice && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Business Name for Invoice</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.businessNameForInvoice}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Post-Service Feedback */}
            {(selectedAppointment.feedbackRating !== undefined || 
              selectedAppointment.nextServiceDueDate || 
              selectedAppointment.amcSubscriptionStatus) && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-indigo-600" />
                  Post-Service Feedback
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAppointment.feedbackRating !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Feedback Rating</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{selectedAppointment.feedbackRating}/5</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-lg ${star <= selectedAppointment.feedbackRating! ? "text-yellow-400" : "text-gray-300"}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedAppointment.nextServiceDueDate && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Next Service Due Date</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.nextServiceDueDate}</p>
                    </div>
                  )}
                  {selectedAppointment.amcSubscriptionStatus && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">AMC Subscription Status</p>
                      <p className="font-medium text-gray-800">{selectedAppointment.amcSubscriptionStatus}</p>
                    </div>
                  )}
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
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${customerArrivalStatus === "not_arrived"
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
                          customerId: detailCustomer?.id?.toString() || selectedAppointment?.customerExternalId,
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
                      value={serviceIntakeForm.estimatedCost ? `₹${serviceIntakeForm.estimatedCost}` : ""}
                      onChange={() => { }}
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
                    className={`flex-1 rounded-lg px-4 py-3 font-medium transition ${currentJobCardId
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
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${selectedVehicle.currentStatus === "Active Job Card"
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

      {/* Create New Appointment Modal */}
      {showAppointmentFormModal && selectedAppointmentCustomer && (
        <AppointmentFormModal
          isOpen={showAppointmentFormModal}
          customer={selectedAppointmentCustomer}
          vehicle={selectedAppointmentVehicle}
          initialFormData={appointmentFormData}
          onClose={handleCloseAppointmentForm}
          onSubmit={handleSubmitAppointmentForm}
          canAccessCustomerType={canEditCustomerInformation}
          canAccessVehicleInfo={canEditVehicleInformation}
          existingAppointments={appointments}
        />
      )}

      {/* Customer Search Modal for Appointment Creation */}
      {showAppointmentFormModal && !selectedAppointmentCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 flex items-center justify-between rounded-t-2xl z-10 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Select Customer</h2>
                <p className="text-sm text-gray-600 mt-1">Search for a customer to schedule an appointment</p>
              </div>
              <button
                onClick={handleCloseAppointmentForm}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim().length >= 2) {
                      searchAppointmentCustomer(value, "name");
                    } else {
                      clearAppointmentCustomerSearch();
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {appointmentCustomerSearchLoading && (
                  <div className="mt-2 text-center">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                )}
              </div>
              {appointmentCustomerSearchResults.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {typedAppointmentCustomerSearchResults.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => handleCustomerSelectForAppointment(customer)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100">
                          <User className="text-indigo-600" size={20} strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{customer.name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Phone size={14} />
                              {customer.phone}
                            </span>
                            {customer.email && (
                              <span className="flex items-center gap-1">
                                <Mail size={14} />
                                {customer.email}
                              </span>
                            )}
                            {customer.vehicles && customer.vehicles.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Car size={14} />
                                {customer.vehicles.length} vehicle{customer.vehicles.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        <CheckCircle className="text-indigo-600 shrink-0" size={20} strokeWidth={2} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!appointmentCustomerSearchLoading && appointmentCustomerSearchResults.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Customers Found</h3>
                  <p className="text-gray-600">Start typing to search for customers</p>
                </div>
              )}
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
