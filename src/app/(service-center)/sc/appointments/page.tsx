"use client";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Calendar, Clock, X, Phone, CheckCircle, AlertCircle, Mail, User, Car } from "lucide-react";
import CheckInSlip, { generateCheckInSlipNumber, type CheckInSlipData } from "@/components/check-in-slip/CheckInSlip";
import { AppointmentGrid, Toast, AppointmentDetailModal, CustomerSearchModal } from "../components/appointments";
import { useCustomerSearch } from "@/app/(service-center)/sc/components/customers";
import { useRole } from "@/shared/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import {
  canEditCustomerInfo,
  canEditVehicleInfo,
  canEditServiceDetails,
  canEditDocumentation,
  canEditOperationalDetails,
  canCreateAppointment,
} from "@/shared/constants/roles";
import {
  filterByServiceCenter,
  getServiceCenterContext,
  shouldFilterByServiceCenter,
  staticServiceCenters,
} from "@/app/(service-center)/sc/components/service-center";
import { defaultJobCards } from "@/__mocks__/data/job-cards.mock";
import { defaultAppointments } from "@/__mocks__/data/appointments.mock";
import { defaultServiceCenters } from "@/__mocks__/data/service-centers.mock";
import type { CustomerWithVehicles, Vehicle } from "@/shared/types";
import type { JobCard } from "@/shared/types/job-card.types";
import { populateJobCardPart1, createEmptyJobCardPart1 } from "@/shared/utils/jobCardData.util";
import { customerService } from "@/features/customers/services/customer.service";
import { AppointmentFormModal } from "../components/appointment/AppointmentFormModal";
import type { AppointmentForm as AppointmentFormType } from "../components/appointment/types";
import { getInitialAppointmentForm, formatTime } from "../components/appointment/utils";
import type { AppointmentRecord, ToastType, CustomerArrivalStatus } from "./types";
import { convertAppointmentToFormData, formatVehicleString } from "./utils";
import { SERVICE_CENTER_CODE_MAP, TOAST_DURATION, JOB_CARD_STORAGE_KEY } from "./constants";

// ==================== Utility Functions ====================
const loadJobCards = (): JobCard[] => {
  if (typeof window === "undefined") return [];
  const stored = safeStorage.getItem<JobCard[]>(JOB_CARD_STORAGE_KEY, []);
  return stored.length > 0 ? stored : [...defaultJobCards];
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



// ==================== Main Component ====================
function AppointmentsContent() {
  const { userInfo, userRole } = useRole();
  const serviceCenterName = userInfo?.serviceCenter;
  const isCallCenter = userRole === "call_center";
  const isServiceAdvisor = userRole === "service_advisor";
  const isServiceManager = userRole === "sc_manager";
  const isInventoryManager = userRole === "inventory_manager";
  const canViewCostEstimation = isServiceAdvisor || isServiceManager || isInventoryManager;
  // Permission checks for appointments - SC Manager restrictions
  const canCreateNewAppointment = canCreateAppointment(userRole);
  const canEditCustomerInformation = canEditCustomerInfo(userRole);
  const canEditVehicleInformation = canEditVehicleInfo(userRole);
  const canEditServiceDetailsSection = canEditServiceDetails(userRole);
  const canEditDocumentationSection = canEditDocumentation(userRole);
  const canEditOperationalDetailsSection = canEditOperationalDetails(userRole);

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
  const appointmentCustomerSearchLoading = appointmentCustomerSearch.loading;
  const searchAppointmentCustomer = appointmentCustomerSearch.search;
  const clearAppointmentCustomerSearch = appointmentCustomerSearch.clear;
  const [customerSearchValue, setCustomerSearchValue] = useState("");

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
  const [checkInSlipData, setCheckInSlipData] = useState<any>(null);
  const [showCheckInSlipModal, setShowCheckInSlipModal] = useState<boolean>(false);

  // Service Center States (for call center)
  const [availableServiceCenters] = useState(() => {
    return defaultServiceCenters.filter((sc) => sc.status === "Active");
  });

  // Modal States
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState<boolean>(false);

  // Customer Arrival State (for service advisor)
  const [customerArrivalStatus, setCustomerArrivalStatus] = useState<CustomerArrivalStatus>(null);
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

  // Update customer/vehicle for appointment form when search completes
  useEffect(() => {
    if (!selectedAppointment || !showAppointmentFormModal) return;
    
    const customer = customerSearchResults.find(
      (c) => c.phone === selectedAppointment.phone
    ) || null;

    if (customer) {
      const vehicle = customer.vehicles?.find((v) => {
        const vehicleString = formatVehicleString(v);
        return vehicleString === selectedAppointment.vehicle;
      }) || customer.vehicles?.[0] || null;
      
      setSelectedAppointmentCustomer(customer);
      setSelectedAppointmentVehicle(vehicle);
    } else {
      // If customer not found, still allow form to open (edit mode)
      // Just don't set customer/vehicle
      setSelectedAppointmentCustomer(null);
      setSelectedAppointmentVehicle(null);
    }
  }, [customerSearchResults, selectedAppointment, showAppointmentFormModal]);

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
    // For all cases, open the form modal for editing
    try {
      // Convert appointment to form data immediately
      const formData = convertAppointmentToFormData(appointment);

      // Set state for form modal immediately
      // Note: Setting selectedAppointment will trigger useEffect to search for customer
      setSelectedAppointment(appointment);
      setAppointmentFormData(formData);
      setShowAppointmentFormModal(true);
      // Customer/vehicle will be updated via useEffect when search completes
    } catch (error) {
      console.error("Error loading appointment for edit:", error);
      showToast("Failed to load appointment details. Please try again.", "error");
    }
  }, [showToast]);

  const handleDeleteAppointment = useCallback(
    (id: number) => {
      const appointmentToDelete = appointments.find((apt) => apt.id === id);
      const updatedAppointments = appointments.filter((apt) => apt.id !== id);
      setAppointments(updatedAppointments);
      safeStorage.setItem("appointments", updatedAppointments);
      
      // Close any open modals
      closeDetailModal();
      // Close appointment form modal if open
      setShowAppointmentFormModal(false);
      setSelectedAppointment(null);
      setSelectedAppointmentCustomer(null);
      setSelectedAppointmentVehicle(null);
      setAppointmentFormData(getInitialAppointmentForm());
      clearAppointmentCustomerSearch();
      
      showToast(
        appointmentToDelete
          ? `Appointment for ${appointmentToDelete.customerName} deleted successfully!`
          : "Appointment deleted successfully!",
        "success"
      );
    },
    [appointments, closeDetailModal, showToast, clearAppointmentCustomerSearch]
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
          warrantyStatus: (appointment as any).warrantyStatus || "",
          technicianObservation: (appointment as any).technicianObservation || "",
          insuranceStartDate: (appointment as any).insuranceStartDate || "",
          insuranceEndDate: (appointment as any).insuranceEndDate || "",
          insuranceCompanyName: (appointment as any).insuranceCompanyName || "",
          batterySerialNumber: (appointment as any).batterySerialNumber || "",
          mcuSerialNumber: (appointment as any).mcuSerialNumber || "",
          vcuSerialNumber: (appointment as any).vcuSerialNumber || "",
          otherPartSerialNumber: (appointment as any).otherPartSerialNumber || "",
          variantBatteryCapacity: (appointment as any).variantBatteryCapacity || "",
        }
      )
      : createEmptyJobCardPart1(jobCardNumber);

    // Populate PART 1 from appointment fields (overrides customer/vehicle data if appointment has more details)
    part1.fullName = appointment.customerName || part1.fullName;
    part1.mobilePrimary = appointment.phone || part1.mobilePrimary;
    part1.customerType = (appointment.customerType || part1.customerType) as "B2C" | "B2B" | "";
    part1.customerFeedback = appointment.customerComplaintIssue || part1.customerFeedback;
    part1.estimatedDeliveryDate = appointment.estimatedDeliveryDate || part1.estimatedDeliveryDate;
    
    // Build full customer address with city/state/pincode
    const fullAddress = [
      (appointment as any).address,
      (appointment as any).cityState,
      (appointment as any).pincode
    ].filter(Boolean).join(", ");
    part1.customerAddress = fullAddress || part1.customerAddress;
    
    // Append previous service history to customer feedback if available
    if ((appointment as any).previousServiceHistory) {
      const existingFeedback = part1.customerFeedback || "";
      const serviceHistory = `Previous Service History: ${(appointment as any).previousServiceHistory}`;
      part1.customerFeedback = existingFeedback 
        ? `${existingFeedback}\n\n${serviceHistory}`
        : serviceHistory;
    }
    
    // Vehicle fields from appointment
    part1.vehicleBrand = (appointment as any).vehicleBrand || vehicleMake || part1.vehicleBrand;
    part1.vehicleModel = (appointment as any).vehicleModel || vehicleModel || part1.vehicleModel;
    part1.registrationNumber = (appointment as any).registrationNumber || part1.registrationNumber;
    part1.vinChassisNumber = (appointment as any).vinChassisNumber || part1.vinChassisNumber;
    part1.variantBatteryCapacity = (appointment as any).variantBatteryCapacity || part1.variantBatteryCapacity;
    
    // Warranty and insurance fields from appointment
    part1.warrantyStatus = (appointment as any).warrantyStatus || part1.warrantyStatus;
    part1.technicianObservation = (appointment as any).technicianObservation || part1.technicianObservation;
    part1.insuranceStartDate = (appointment as any).insuranceStartDate || part1.insuranceStartDate;
    part1.insuranceEndDate = (appointment as any).insuranceEndDate || part1.insuranceEndDate;
    part1.insuranceCompanyName = (appointment as any).insuranceCompanyName || part1.insuranceCompanyName;
    
    // Serial numbers from appointment
    part1.batterySerialNumber = (appointment as any).batterySerialNumber || part1.batterySerialNumber;
    part1.mcuSerialNumber = (appointment as any).mcuSerialNumber || part1.mcuSerialNumber;
    part1.vcuSerialNumber = (appointment as any).vcuSerialNumber || part1.vcuSerialNumber;
    part1.otherPartSerialNumber = (appointment as any).otherPartSerialNumber || part1.otherPartSerialNumber;

    // Create job card from appointment with structured PART 1
    const newJobCard: JobCard = {
      id: `JC-${Date.now()}`,
      jobCardNumber,
      serviceCenterId: appointment.serviceCenterId?.toString() || serviceCenterContext.serviceCenterId?.toString() || "sc-001",
      serviceCenterCode,
      serviceCenterName: appointment.serviceCenterName || serviceCenterContext.serviceCenterName || undefined,
      customerId: customerData?.id?.toString() || appointment.customerExternalId?.toString() || `customer-${appointment.id}`,
      customerName: appointment.customerName,
      vehicleId: vehicleData?.id?.toString() || (appointment as any).vehicleExternalId?.toString(),
      vehicle: appointment.vehicle,
      registration: (appointment as any).registrationNumber || vehicleData?.registration || part1.registrationNumber || "",
      vehicleMake: (appointment as any).vehicleBrand || vehicleMake || "",
      vehicleModel: (appointment as any).vehicleModel || vehicleModel || "",
      customerType: appointment.customerType,
      serviceType: appointment.serviceType,
      description: appointment.customerComplaintIssue || `Service: ${appointment.serviceType}`,
      status: "Awaiting Quotation Approval",
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
      // Additional appointment data fields
      customerWhatsappNumber: (appointment as any).whatsappNumber,
      customerAlternateMobile: (appointment as any).alternateMobile,
      customerEmail: (appointment as any).email,
      vehicleYear: (appointment as any).vehicleYear,
      motorNumber: (appointment as any).motorNumber,
      chargerSerialNumber: (appointment as any).chargerSerialNumber,
      dateOfPurchase: (appointment as any).dateOfPurchase,
      vehicleColor: (appointment as any).vehicleColor,
      previousServiceHistory: (appointment as any).previousServiceHistory,
      odometerReading: (appointment as any).odometerReading,
      pickupAddress: appointment.pickupAddress,
      pickupState: appointment.pickupState,
      pickupCity: appointment.pickupCity,
      pickupPincode: appointment.pickupPincode,
      dropAddress: appointment.dropAddress,
      dropState: appointment.dropState,
      dropCity: appointment.dropCity,
      dropPincode: appointment.dropPincode,
      preferredCommunicationMode: appointment.preferredCommunicationMode,
      pickupDropRequired: appointment.pickupDropRequired,
      arrivalMode: appointment.arrivalMode,
      checkInNotes: appointment.checkInNotes,
      checkInSlipNumber: appointment.checkInSlipNumber,
      checkInDate: appointment.checkInDate,
      checkInTime: appointment.checkInTime,
      // Structured PART 1 data
      part1,
      // PART 2 will be populated when parts are added
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

  // Generate check-in slip data from appointment
  const generateCheckInSlipData = useCallback((): CheckInSlipData | null => {
    if (!selectedAppointment) return null;

    const serviceCenterId = selectedAppointment.serviceCenterId?.toString() || serviceCenterContext.serviceCenterId?.toString() || "sc-001";
    const serviceCenterCode = SERVICE_CENTER_CODE_MAP[serviceCenterId] || "SC001";
    const serviceCenter = defaultServiceCenters.find(
      (sc) => (sc as any).serviceCenterId === serviceCenterId || sc.id?.toString() === serviceCenterId
    );

    const now = new Date();
    const checkInDate = now.toISOString().split("T")[0];
    const checkInTime = now.toTimeString().slice(0, 5);
    const slipNumber = generateCheckInSlipNumber(serviceCenterCode);

    // Extract vehicle details
    const vehicleParts = selectedAppointment.vehicle.match(/^(.+?)\s+(.+?)\s+\((\d+)\)$/);
    const vehicleMake = vehicleParts ? vehicleParts[1] : selectedAppointment.vehicle.split(" ")[0] || "";
    const vehicleModel = vehicleParts ? vehicleParts[2] : selectedAppointment.vehicle.split(" ").slice(1, -1).join(" ") || "";

    // Get registration from appointment or job card
    const registrationNumber = (selectedAppointment as any).registrationNumber || currentJobCard?.registration || "";
    const vin = (selectedAppointment as any).vinChassisNumber || currentJobCard?.vehicleId || "";

    // Get customer email if available
    const customerEmail = detailCustomer?.email || (selectedAppointment as any).email || undefined;

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
      expectedServiceDate: selectedAppointment.estimatedDeliveryDate || undefined,
      serviceType: selectedAppointment.serviceType || undefined,
      notes: (selectedAppointment as any).technicianObservation || selectedAppointment.customerComplaintIssue || undefined,
    };
  }, [selectedAppointment, currentJobCard, detailCustomer, serviceCenterContext]);

  // Generate check-in slip handler
  const handleGenerateCheckInSlip = useCallback(() => {
    if (!selectedAppointment) {
      showToast("Please select an appointment first.", "error");
      return;
    }

      // Ensure job card exists
      if (!currentJobCardId) {
        showToast("Please wait for job card to be created first.", "error");
        return;
      }

      // Generate check-in slip data
      const slipData = generateCheckInSlipData();
      if (slipData) {
        setCheckInSlipData(slipData);
        setShowCheckInSlipModal(true);
      showToast("Check-in slip generated successfully.", "success");
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
    setSelectedAppointment(null); // Reset appointment to prevent unwanted searches
    setSelectedAppointmentCustomer(null);
    setSelectedAppointmentVehicle(null);
    setAppointmentFormData(getInitialAppointmentForm());
    setCustomerSearchValue("");
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
      status: selectedAppointment?.status || "Confirmed", // Preserve existing status
      customerType: selectedAppointmentCustomer?.customerType || form.customerType,
      // Customer Contact & Address Fields
      whatsappNumber: form.whatsappNumber,
      alternateMobile: form.alternateMobile,
      email: form.email,
      address: form.address,
      cityState: form.cityState,
      pincode: form.pincode,
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
      pickupState: form.pickupState,
      pickupCity: form.pickupCity,
      pickupPincode: form.pickupPincode,
      dropAddress: form.dropAddress,
      dropState: form.dropState,
      dropCity: form.dropCity,
      dropPincode: form.dropPincode,
      preferredCommunicationMode: form.preferredCommunicationMode,
      documentationFiles: {
        customerIdProof: form.customerIdProof?.files.length || 0,
        vehicleRCCopy: form.vehicleRCCopy?.files.length || 0,
        warrantyCardServiceBook: form.warrantyCardServiceBook?.files.length || 0,
        photosVideos: form.photosVideos?.files.length || 0,
      },
      // Vehicle Information Fields
      vehicleBrand: form.vehicleBrand,
      vehicleModel: form.vehicleModel,
      vehicleYear: form.vehicleYear,
      registrationNumber: form.registrationNumber,
      vinChassisNumber: form.vinChassisNumber,
      variantBatteryCapacity: form.variantBatteryCapacity,
      motorNumber: form.motorNumber,
      chargerSerialNumber: form.chargerSerialNumber,
      dateOfPurchase: form.dateOfPurchase,
      warrantyStatus: form.warrantyStatus,
      insuranceStartDate: form.insuranceStartDate,
      insuranceEndDate: form.insuranceEndDate,
      insuranceCompanyName: form.insuranceCompanyName,
      vehicleColor: form.vehicleColor,
      // Job Card Conversion Fields
      batterySerialNumber: form.batterySerialNumber,
      mcuSerialNumber: form.mcuSerialNumber,
      vcuSerialNumber: form.vcuSerialNumber,
      otherPartSerialNumber: form.otherPartSerialNumber,
      technicianObservation: form.technicianObservation,
      // Service Intake/Check-in Fields
      arrivalMode: form.arrivalMode,
      checkInNotes: form.checkInNotes,
      checkInSlipNumber: form.checkInSlipNumber,
      checkInDate: form.checkInDate,
      checkInTime: form.checkInTime,
      // Store documentation files for later retrieval
      customerIdProof: form.customerIdProof,
      vehicleRCCopy: form.vehicleRCCopy,
      warrantyCardServiceBook: form.warrantyCardServiceBook,
      photosVideos: form.photosVideos,
      createdByRole: selectedAppointment?.createdByRole || (isCallCenter ? "call_center" : isServiceAdvisor ? "service_advisor" : undefined),
    };

    // Get existing appointments from localStorage
    const existingAppointments = safeStorage.getItem<Array<any>>("appointments", []);

    // Check if this is an update or create
    if (selectedAppointment) {
      // Update existing appointment
      const updatedAppointments = existingAppointments.map((apt: any) =>
        apt.id === selectedAppointment.id
          ? { ...apt, ...appointmentData }
          : apt
      );
      safeStorage.setItem("appointments", updatedAppointments);
      setAppointments(updatedAppointments);
      showToast(`Appointment updated successfully! Customer: ${form.customerName} | Vehicle: ${form.vehicle}`, "success");
    } else {
      // Create new appointment
      const newAppointment: AppointmentRecord = {
        id: existingAppointments.length > 0 
          ? Math.max(...existingAppointments.map((a: any) => a.id)) + 1 
          : 1,
        ...appointmentData,
      };

      const updatedAppointments = [...existingAppointments, newAppointment];
      safeStorage.setItem("appointments", updatedAppointments);
      setAppointments(updatedAppointments);
      showToast(`Appointment scheduled successfully! Customer: ${form.customerName} | Vehicle: ${form.vehicle} | Service: ${form.serviceType} | Date: ${form.date} | Time: ${formatTime(form.time)}`, "success");
    }

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

    // Close modal and reset form
    handleCloseAppointmentForm();
  }, [selectedAppointment, selectedAppointmentCustomer, isCallCenter, isServiceAdvisor, showToast, handleCloseAppointmentForm]);

  // Handle Customer Arrived from Form
  const handleCustomerArrivedFromForm = useCallback((form: AppointmentFormType) => {
    if (!selectedAppointment) return;

    // Update appointment status to "In Progress" and save all form data
    const selectedServiceCenter = form.serviceCenterName
      ? staticServiceCenters.find((center) => center.name === form.serviceCenterName)
      : null;
    const serviceCenterId = (selectedServiceCenter as any)?.serviceCenterId || selectedServiceCenter?.id?.toString() || null;
    const serviceCenterName = form.serviceCenterName || null;

    const appointmentData: any = {
      ...form,
      status: "In Progress", // Update status to In Progress
      serviceCenterId: serviceCenterId,
      serviceCenterName: serviceCenterName,
      time: formatTime(form.time),
      duration: `${form.duration} hours`,
      createdByRole: selectedAppointment.createdByRole,
    };

    // Update appointment
    const existingAppointments = safeStorage.getItem<Array<any>>("appointments", []);
    const updatedAppointments = existingAppointments.map((apt: any) =>
      apt.id === selectedAppointment.id
        ? { ...apt, ...appointmentData }
        : apt
    );
    safeStorage.setItem("appointments", updatedAppointments);
    setAppointments(updatedAppointments);

    // Update selectedAppointment state
    const updatedAppointment = { ...selectedAppointment, ...appointmentData };
    setSelectedAppointment(updatedAppointment);
    setAppointmentFormData(form);

    showToast("Customer arrival recorded. Appointment status updated to 'In Progress'.", "success");
  }, [selectedAppointment, showToast]);


  // Router for navigation
  const router = useRouter();
  const searchParams = useSearchParams();

  // Convert Appointment to Quotation
  const handleConvertToQuotation = useCallback(async () => {
    if (!selectedAppointment) return;

    // Basic validation - use appointment data
    const appointment = selectedAppointment as any;
    if (!appointment.vehicleBrand && !appointment.vehicle) {
      showToast("Please ensure vehicle information is available in the appointment.", "error");
      return;
    }

    if (!currentJobCardId) {
      // Create job card if it doesn't exist
      const jobCard = await convertAppointmentToJobCard(selectedAppointment);
      setCurrentJobCardId(jobCard.id);
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

    // Populate PART 1 from appointment data
    const part1 = customerData && vehicleData
      ? populateJobCardPart1(
        customerData,
        vehicleData,
        jobCardNumber,
        {
          customerFeedback: appointment.customerComplaintIssue || "",
          technicianObservation: appointment.technicianObservation || "",
          insuranceStartDate: appointment.insuranceStartDate || "",
          insuranceEndDate: appointment.insuranceEndDate || "",
          insuranceCompanyName: appointment.insuranceCompanyName || "",
          variantBatteryCapacity: appointment.variantBatteryCapacity || "",
          warrantyStatus: appointment.warrantyStatus || "",
          estimatedDeliveryDate: appointment.estimatedDeliveryDate || "",
        }
      )
      : createEmptyJobCardPart1(jobCardNumber);

    // Override with appointment data
    if (appointment.vehicleBrand) part1.vehicleBrand = appointment.vehicleBrand;
    if (appointment.vehicleModel) part1.vehicleModel = appointment.vehicleModel;
    if (appointment.registrationNumber) part1.registrationNumber = appointment.registrationNumber;
    if (appointment.vinChassisNumber) part1.vinChassisNumber = appointment.vinChassisNumber;
    if (appointment.variantBatteryCapacity) part1.variantBatteryCapacity = appointment.variantBatteryCapacity;
    if (appointment.warrantyStatus) part1.warrantyStatus = appointment.warrantyStatus;
    if (appointment.estimatedDeliveryDate) part1.estimatedDeliveryDate = appointment.estimatedDeliveryDate;
    if (appointment.customerComplaintIssue) part1.customerFeedback = appointment.customerComplaintIssue;
    if (appointment.technicianObservation) part1.technicianObservation = appointment.technicianObservation;
    if (appointment.insuranceStartDate) part1.insuranceStartDate = appointment.insuranceStartDate;
    if (appointment.insuranceEndDate) part1.insuranceEndDate = appointment.insuranceEndDate;
    if (appointment.insuranceCompanyName) part1.insuranceCompanyName = appointment.insuranceCompanyName;

    // Populate PART 2A if documentation files exist
    const hasPhotos = appointment.photosVideos?.urls?.length > 0 || appointment.documentationFiles?.photosVideos > 0;
    const hasWarranty = appointment.warrantyCardServiceBook?.urls?.length > 0 || appointment.documentationFiles?.warrantyCardServiceBook > 0;
    const part2A = (hasPhotos || hasWarranty)
      ? {
        videoEvidence: hasPhotos ? "Yes" : "No" as "Yes" | "No" | "",
        vinImage: hasPhotos ? "Yes" : "No" as "Yes" | "No" | "",
        odoImage: hasPhotos ? "Yes" : "No" as "Yes" | "No" | "",
        damageImages: hasPhotos ? "Yes" : "No" as "Yes" | "No" | "",
        issueDescription: appointment.customerComplaintIssue || "",
        numberOfObservations: String(appointment.documentationFiles?.photosVideos || 0),
        symptom: appointment.previousServiceHistory || "",
        defectPart: appointment.customerComplaintIssue || "",
      }
      : undefined;

    // Update job card with structured PART 1 and PART 2A before converting to quotation
    if (currentJobCardId) {
      updateStoredJobCard(currentJobCardId, (card) => ({
        ...card,
        status: "In Progress",
        // Update PART 1 with appointment data
        part1,
        // PART 2 will be populated when parts are added in quotation
        part2: card.part2 || [],
        // PART 2A if documentation exists
        part2A,
        // Update legacy fields for backward compatibility
        vehicleMake: appointment.vehicleBrand || card.vehicleMake,
        vehicleModel: appointment.vehicleModel || card.vehicleModel,
        registration: appointment.registrationNumber || card.registration,
        description: appointment.customerComplaintIssue || card.description,
      }));
    }

    // Save appointment data to localStorage for quotation page to use
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

    const quotationData = {
      appointmentId: selectedAppointment.id,
      customerName: selectedAppointment.customerName,
      phone: selectedAppointment.phone,
      vehicle: selectedAppointment.vehicle,
      customerId: customerIdForQuotation,
      serviceCenterId: serviceCenterIdForQuotation,
      serviceCenterName: serviceCenterNameForQuotation,
      jobCardId: currentJobCardId,
      appointmentData: appointment, // Store full appointment data
    };

    // Store appointment data for quotation page
    safeStorage.setItem("pendingQuotationFromAppointment", quotationData);

    // Navigate to quotations page
    router.push("/sc/quotations?fromAppointment=true");

    // Close the appointment detail modal
    closeDetailModal();
  }, [selectedAppointment, detailCustomer, currentJobCardId, updateStoredJobCard, serviceCenterContext, router, closeDetailModal, showToast]);

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

      // Try to find associated job card, or create one if it doesn't exist
      if (!currentJobCardId) {
        const storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
        const associatedJobCard = storedJobCards.find(
          (card) => card.sourceAppointmentId === selectedAppointment.id
        );
        if (associatedJobCard) {
          setCurrentJobCardId(associatedJobCard.id);
          // Redirect to job card detail page
          router.push(`/sc/job-cards/${associatedJobCard.id}`);
        } else {
          // Auto-create job card when customer arrives
          convertAppointmentToJobCard(selectedAppointment).then((jobCard) => {
            setCurrentJobCardId(jobCard.id);
            // Redirect to job card detail page after creation
            router.push(`/sc/job-cards/${jobCard.id}`);
          }).catch((error) => {
            console.error("Error creating job card:", error);
          });
        }
      }
    } else if (selectedAppointment.status === "Confirmed" || selectedAppointment.status === "Pending") {
      // Reset arrival status if appointment is still pending/confirmed
      if (customerArrivalStatus === "arrived") {
        setCustomerArrivalStatus(null);
      }
    }
  }, [selectedAppointment, customerArrivalStatus, currentJobCardId, convertAppointmentToJobCard, router]);

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
    // Job card data is already loaded in currentJobCard
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
          <AppointmentGrid
            appointments={visibleAppointments}
            onAppointmentClick={handleAppointmentClick}
            onDeleteAppointment={handleDeleteAppointment}
            isCallCenter={isCallCenter}
          />
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        appointment={selectedAppointment}
        detailCustomer={detailCustomer}
        isCallCenter={isCallCenter}
        isServiceAdvisor={isServiceAdvisor}
        customerArrivalStatus={customerArrivalStatus}
        currentJobCard={currentJobCard}
        availableServiceCenters={availableServiceCenters}
        onCustomerArrived={() => setCustomerArrivalStatus("arrived")}
        onCustomerNotArrived={() => setCustomerArrivalStatus("not_arrived")}
        setCurrentJobCard={setCurrentJobCard}
        setCheckInSlipData={setCheckInSlipData}
        setShowCheckInSlipModal={setShowCheckInSlipModal}
        setAppointments={setAppointments}
        setSelectedAppointment={setSelectedAppointment}
        showToast={showToast}
        appointments={appointments}
        onGenerateCheckInSlip={handleGenerateCheckInSlip}
        currentJobCardId={currentJobCardId}
      />

      {showCheckInSlipModal && checkInSlipData && (
        <CheckInSlip data={checkInSlipData} onClose={() => setShowCheckInSlipModal(false)} />
      )}

      {/* Create/Edit Appointment Modal */}
      {showAppointmentFormModal && (
        <AppointmentFormModal
          isOpen={showAppointmentFormModal}
          customer={selectedAppointmentCustomer}
          vehicle={selectedAppointmentVehicle}
          initialFormData={appointmentFormData}
          onClose={handleCloseAppointmentForm}
          onSubmit={handleSubmitAppointmentForm}
          canAccessCustomerType={canEditCustomerInformation}
          canAccessVehicleInfo={canEditVehicleInformation}
          existingAppointments={appointments.filter(apt => apt.id !== selectedAppointment?.id)} // Exclude current appointment from conflict check
          onCustomerArrived={isServiceAdvisor ? handleCustomerArrivedFromForm : undefined}
          appointmentStatus={selectedAppointment?.status}
          customerArrived={selectedAppointment?.status === "In Progress" || selectedAppointment?.status === "Sent to Manager"}
        />
      )}

      {/* Customer Search Modal for Appointment Creation (only show when creating new, not editing) */}
      <CustomerSearchModal
        isOpen={showAppointmentFormModal && !selectedAppointmentCustomer && !selectedAppointment}
        onClose={handleCloseAppointmentForm}
        searchValue={customerSearchValue}
        onSearchChange={setCustomerSearchValue}
        onSearch={searchAppointmentCustomer}
        onClearSearch={clearAppointmentCustomerSearch}
        customers={appointmentCustomerSearchResults}
        loading={appointmentCustomerSearchLoading}
        onSelectCustomer={handleCustomerSelectForAppointment}
      />

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
