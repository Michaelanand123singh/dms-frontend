"use client";
import { useState, useCallback, useMemo } from "react";
import {
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  PlusCircle,
  X,
  CheckCircle,
  Hash,
  Calendar,
  AlertCircle,
  Clock,
  Home,
  Building2,
  History,
  Wrench,
  FileText,
  AlertTriangle,
  Upload,
  Trash2,
  Image as ImageIcon,
  Edit2,
  X as XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRole } from "@/shared/hooks";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { canCreateCustomer } from "@/shared/constants/roles";
import { getServiceCenterContext } from "@/shared/lib/serviceCenter";
import { useCustomerSearch, useCreateCustomer } from "../../../../hooks/api";
import { customerService } from "@/features/customers/services/customer.service";
import type {
  CustomerSearchType,
  CustomerWithVehicles,
  NewCustomerForm,
  ServiceType,
  Vehicle,
  ServiceHistoryItem,
  CustomerType,
  NewVehicleForm,
  UserRole,
  Invoice,
} from "@/shared/types";
import { getMockServiceHistory } from "@/__mocks__/data/customer-service-history.mock";
import { getMockComplaints } from "@/__mocks__/data/complaints.mock";
import { mockCustomers } from "@/__mocks__/data/customers.mock";
import { SERVICE_TYPE_OPTIONS } from "@/shared/constants/service-types";
import { staticServiceCenters } from "@/__mocks__/data/service-centers.mock";
import { INDIAN_STATES, getCitiesByState } from "@/shared/constants/indian-states-cities";
import { FormInput, FormSelect, Modal } from "../components/shared/FormElements";
import { CustomerInfoCard, InfoCard, ErrorAlert } from "../components/shared/InfoComponents";
import { formatVehicleString } from "../components/shared/vehicle-utils";
import { AppointmentModal } from "../components/appointment/AppointmentModal";
import type { Appointment, AppointmentForm as AppointmentFormType } from "../components/appointment/types";
import { INITIAL_APPOINTMENT_FORM } from "../components/appointment/types";
import { AppointmentForm } from "@/components/shared/appointment-form";

// Initial form states (constants for reuse)
const initialCustomerForm: NewCustomerForm = {
  name: "",
  phone: "",
  whatsappNumber: "",
  alternateMobile: "",
  email: "",
  address: "",
  pincode: "",
  cityState: "",
  customerType: undefined,
  serviceType: undefined,
  addressType: undefined,
  workAddress: "",
};


const initialVehicleForm: Partial<NewVehicleForm> = {
  vehicleBrand: "",
  vehicleModel: "",
  registrationNumber: "",
  vin: "",
  variant: "",
  motorNumber: "",
  chargerSerialNumber: "",
  purchaseDate: "",
  warrantyStatus: "",
  insuranceStartDate: "",
  insuranceEndDate: "",
  insuranceCompanyName: "",
};

// Documentation Files interface
interface DocumentationFiles {
  files: File[];
  urls: string[]; // For preview URLs
}

const INITIAL_DOCUMENTATION_FILES: DocumentationFiles = {
  files: [],
  urls: [],
};

// Helper functions (defined before use)
const getCurrentTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const getCurrentDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

const isToday = (dateString: string): boolean => {
  return dateString === getCurrentDate();
};

const getMinTime = (selectedDate: string): string | undefined => {
  if (isToday(selectedDate)) {
    return getCurrentTime();
  }
  return undefined; // No restriction for future dates
};

// Use canonical INITIAL_APPOINTMENT_FORM from types file
// Local state will extend it with date/time defaults
const getInitialAppointmentForm = () => ({
  ...INITIAL_APPOINTMENT_FORM,
  date: new Date().toISOString().split("T")[0],
  time: getCurrentTime(),
});

const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s-+]/g, "").replace(/^91/, "");
  return cleaned.length === 10 && /^\d{10}$/.test(cleaned);
};

const cleanPhone = (phone: string): string => {
  return phone.replace(/[\s-+]/g, "").replace(/^91/, "");
};

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateVIN = (vin: string): boolean => {
  return vin.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
};




// Reusable button component
const Button = ({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "md", 
  disabled, 
  className = "",
  icon: Icon,
  ...props 
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  [key: string]: any;
}) => {
  const baseClasses = "rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2";
  const variantClasses = {
    primary: "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800",
    secondary: "text-gray-700 hover:bg-gray-50",
    success: "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800",
    warning: "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800",
    danger: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800",
  };
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3",
  };
  
  return (
    <button
      onClick={(e) => onClick?.(e)}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? "opacity-50 cursor-not-allowed disabled:active:scale-100" : ""} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === "sm" ? 16 : 18} strokeWidth={2} />}
      {children}
    </button>
  );
};


export default function CustomerFind() {
  const { userRole, userInfo } = useRole();
  const isCallCenter = userRole === "call_center";
  const isServiceAdvisor = userRole === "service_advisor";
  const isServiceManager = userRole === "sc_manager";
  const isTechnician = userRole === "service_engineer";
  const isInventoryManager = userRole === "inventory_manager";
  const isAdminRole = userRole === "admin" || userRole === "super_admin";
  const serviceCenterContext = useMemo(() => getServiceCenterContext(), []);

  const hasRoleAccess = (roles: UserRole[]): boolean => {
    return isAdminRole || roles.includes(userRole);
  };

  const canAccessCustomerType = hasRoleAccess(["call_center", "service_advisor"]);
  const canAccessServiceDetails = hasRoleAccess(["call_center", "service_advisor", "sc_manager", "service_engineer"]);
  const canAccessEstimatedCost = hasRoleAccess(["service_advisor", "sc_manager"]);
  const canAccessOdometer = hasRoleAccess(["service_advisor"]);
  const hasDocUploadAccess = hasRoleAccess(["call_center", "service_advisor"]);
  const hasDropoffMediaAccess = hasRoleAccess([
    "call_center",
    "service_advisor",
    "sc_manager",
  ]);
  const canAccessOperationalDetails = hasRoleAccess(["call_center", "service_advisor", "sc_manager"]);
  const canAssignTechnician = hasRoleAccess(["service_advisor", "sc_manager", "service_engineer"]);
  const canAccessPreferredCommunication = hasRoleAccess([
    "call_center",
    "service_advisor",
    "sc_manager",
  ]);
  const canAccessPostServiceSurvey = hasRoleAccess([
    "call_center",
    "service_advisor",
    "sc_manager",
    "service_engineer",
  ]);
  const canAccessAMCStatus = hasRoleAccess(["call_center", "service_advisor", "sc_manager"]);
  const canAccessPickupAddress = hasRoleAccess(["call_center", "service_advisor"]);
  const canAccessVehicleInfo = hasRoleAccess(["call_center", "service_advisor"]);
  const canAccessBillingSection = hasRoleAccess(["service_advisor", "sc_manager"]);
  const canAccessBusinessName = hasRoleAccess(["service_advisor", "sc_manager"]);
  const canAccessServiceStatus = hasRoleAccess(["call_center", "service_advisor", "sc_manager", "service_engineer"]);
  const canViewCostEstimation = canAccessEstimatedCost || isInventoryManager;
  const canAssignServiceCenter = canAccessOperationalDetails;
  // Permission to create customers - SC Manager is explicitly excluded
  const canCreateNewCustomer = canCreateCustomer(userRole);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithVehicles | null>(null);
  const [showCreateCustomer, setShowCreateCustomer] = useState<boolean>(false);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showAddVehiclePopup, setShowAddVehiclePopup] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState<boolean>(false);
  const [showScheduleAppointment, setShowScheduleAppointment] = useState<boolean>(false);
  const [showComplaints, setShowComplaints] = useState<boolean>(false);
  const [shouldOpenAppointmentAfterVehicleAdd, setShouldOpenAppointmentAfterVehicleAdd] = useState<boolean>(false);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryItem[]>([]);
  const [editingFeedbackRating, setEditingFeedbackRating] = useState<number | string | null>(null);
  const [validationError, setValidationError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [appointmentFieldErrors, setAppointmentFieldErrors] = useState<Record<string, string>>({});
  const [detectedSearchType, setDetectedSearchType] = useState<CustomerSearchType | null>(null);
  const [serviceCenterSearch, setServiceCenterSearch] = useState<string>("");
  const [showServiceCenterSelector, setShowServiceCenterSelector] = useState<boolean>(false);
  const filteredServiceCenters = useMemo(() => {
    const query = serviceCenterSearch.trim().toLowerCase();
    if (!query) return staticServiceCenters;
    return staticServiceCenters.filter((center) =>
      `${center.name} ${center.location}`.toLowerCase().includes(query)
    );
  }, [serviceCenterSearch]);
  const serviceCenterFilterId = userInfo?.serviceCenter ? Number(userInfo.serviceCenter) : null;
  const shouldFilterByServiceCenter = !isCallCenter && serviceCenterFilterId;
  const handleOpenServiceInvoice = useCallback(
    (service: ServiceHistoryItem) => {
      if (!service.invoice || typeof window === "undefined") return;
      const invoiceUrl = new URL("/sc/invoices", window.location.origin);

      const vehicleDescription = selectedVehicle
        ? `${selectedVehicle.vehicleMake} ${selectedVehicle.vehicleModel}${
            selectedVehicle.registration ? ` (${selectedVehicle.registration})` : ""
          }`
        : "Vehicle";

      const customerName = selectedCustomer?.name || "Customer";

      const serviceInvoice = {
        id: service.invoice,
        jobCardId: service.jobCardId,
        customerName,
        vehicle: vehicleDescription,
        date: service.date,
        dueDate: service.date,
        amount: service.total,
        paidAmount: service.total,
        balance: "₹0",
        status: "paid" as const,
        paymentMethod: undefined,
        items: [
          {
            id: `item-${service.invoice}-labor`,
            partId: "labor",
            partName: "Labor",
            partNumber: "LABOR-001",
            sku: "LABOR-001",
            quantity: 1,
            unitPrice: parseFloat(service.labor.replace(/[₹,]/g, "")) || 0,
            totalPrice: parseFloat(service.labor.replace(/[₹,]/g, "")) || 0,
          },
          {
            id: `item-${service.invoice}-parts`,
            partId: "parts",
            partName: "Parts",
            partNumber: "PARTS-001",
            sku: "PARTS-001",
            quantity: 1,
            unitPrice: parseFloat(service.partsCost.replace(/[₹,]/g, "")) || 0,
            totalPrice: parseFloat(service.partsCost.replace(/[₹,]/g, "")) || 0,
          },
        ],
      };

      const existingInvoices = safeStorage.getItem<Invoice[]>("serviceHistoryInvoices", []);
      const filtered = existingInvoices.filter((item) => item.id !== serviceInvoice.id);
      safeStorage.setItem("serviceHistoryInvoices", [...filtered, serviceInvoice]);

      invoiceUrl.searchParams.set("invoiceId", service.invoice);
      window.open(invoiceUrl.toString(), "_blank");
    },
    [selectedCustomer, selectedVehicle]
  );
  const getNearestServiceCenter = useCallback(() => {
    const defaultCenter = staticServiceCenters[0]?.name ?? "";
    if (!selectedCustomer) return defaultCenter;
    const normalizedCity = selectedCustomer.cityState?.split(",")[0]?.trim().toLowerCase();
    if (normalizedCity) {
      const match = staticServiceCenters.find(
        (center) =>
          center.location.toLowerCase().includes(normalizedCity) ||
          center.name.toLowerCase().includes(normalizedCity)
      );
      if (match) return match.name;
    }
    return defaultCenter;
  }, [selectedCustomer]);

  const [whatsappSameAsMobile, setWhatsappSameAsMobile] = useState<boolean>(false);
  const [pickupAddressDifferent, setPickupAddressDifferent] = useState<boolean>(false);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  // State for vehicle form customer info (separate from create customer form)
  const [vehicleFormState, setVehicleFormState] = useState<string>("");
  const [vehicleFormCity, setVehicleFormCity] = useState<string>("");
  const [hasInsurance, setHasInsurance] = useState<boolean>(false);
  // State for pickup and drop address
  const [pickupState, setPickupState] = useState<string>("");
  const [pickupCity, setPickupCity] = useState<string>("");
  const [dropState, setDropState] = useState<string>("");
  const [dropCity, setDropCity] = useState<string>("");
  const [dropSameAsPickup, setDropSameAsPickup] = useState<boolean>(false);
  
  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string; type?: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });

  // Toast function - defined early so it can be used in other callbacks
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  }, []);

  // Hooks for data fetching
  const { results: searchResults, loading: searchLoading, search: performSearch, clear: clearSearch } = useCustomerSearch();
  const filteredSearchResults = useMemo(() => {
    if (!shouldFilterByServiceCenter || searchResults.length === 0) return searchResults;
    return searchResults.filter(
      (customer) => Number(customer.serviceCenterId) === Number(serviceCenterFilterId)
    );
  }, [searchResults, shouldFilterByServiceCenter, serviceCenterFilterId]);
  const { loading: createLoading, error: createError, createCustomer } = useCreateCustomer();
  
  // Use mock customers directly for recent customers list (show first 10)
  const filteredMockCustomers = useMemo(() => {
    if (isCallCenter || !serviceCenterFilterId) {
      return mockCustomers;
    }
    return mockCustomers.filter(
      (customer) => Number(customer.serviceCenterId) === Number(serviceCenterFilterId)
    );
  }, [isCallCenter, serviceCenterFilterId]);

  const recentCustomers = filteredMockCustomers.slice(0, 10);

  // Form state for creating new customer
  const [newCustomerForm, setNewCustomerForm] = useState<NewCustomerForm>(initialCustomerForm);

  // Form state for adding new vehicle
  const [newVehicleForm, setNewVehicleForm] = useState<Partial<NewVehicleForm>>(initialVehicleForm);

  // Form state for scheduling appointment
  const [appointmentForm, setAppointmentForm] = useState<Partial<AppointmentFormType>>(() => 
    getInitialAppointmentForm()
  );

  const handleAssignNearestCenter = useCallback(() => {
    const nearest = getNearestServiceCenter();
    if (nearest) {
      const nearestCenter = staticServiceCenters.find((c) => c.name === nearest);
      setAppointmentForm((prev) => ({ 
        ...prev, 
        assignedServiceCenter: nearest,
        // Note: serviceCenterId will be resolved when saving the appointment
      }));
    }
  }, [getNearestServiceCenter]);


  // Auto-detect search type based on input
  const detectSearchType = (query: string): CustomerSearchType => {
    const trimmed = query.trim();

    // Check for customer number pattern (CUST-YYYY-XXXX) - allow partial matches
    if (/^CUST-/i.test(trimmed)) {
      return "customerNumber";
    }

    // Check for VIN (typically 17 alphanumeric characters) - allow partial matches
    if (/^[A-HJ-NPR-Z0-9]{8,}$/i.test(trimmed)) {
      return "vin";
    }

    // Check for vehicle registration (typically 2 letters, 2 digits, 2 letters, 4 digits) - allow partial matches
    if (/^[A-Z]{2}\d{2}/i.test(trimmed) || /^[A-Z]{2}\d{2}[A-Z]{2}/i.test(trimmed)) {
      return "vehicleNumber";
    }

    // Check for email - allow partial matches (contains @)
    if (trimmed.includes("@")) {
      return "email";
    }

    // Check for phone - allow partial numbers (3+ digits)
    const cleanedPhone = trimmed.replace(/[\s-+().]/g, "").replace(/^91/, "");
    if (/^\d{3,}$/.test(cleanedPhone)) {
      return "phone";
    }

    // Default to name search
    return "name";
  };

  // Handle search input change
  const handleSearchInputChange = useCallback((value: string): void => {
    // Prevent search when creating customer
    if (showCreateForm) return;
    
    setSearchQuery(value);
    setValidationError("");
    setSelectedCustomer(null);
    setShowCreateCustomer(false);

    const trimmed = value.trim();
    const cleanedPhone = trimmed.replace(/[\s-+().]/g, "").replace(/^91/, "");
    const isPhoneNumber = /^\d{3,}$/.test(cleanedPhone);

    // For phone numbers, start searching after 3 digits
    // For other searches, start after 2 characters
    const minLength = isPhoneNumber ? 3 : 2;

    if (trimmed.length >= minLength) {
      const searchType = detectSearchType(value);
      setDetectedSearchType(searchType);
      performSearch(value, searchType);
    } else {
      clearSearch();
      setDetectedSearchType(null);
    }
  }, [performSearch, clearSearch, showCreateForm]);

  // Handle search execution
  const handleSearch = useCallback((): void => {
    // Prevent search when creating customer
    if (showCreateForm) return;
    
    if (!searchQuery.trim()) {
      setValidationError("Please enter a search query");
      return;
    }

    const searchType = detectSearchType(searchQuery);
    performSearch(searchQuery, searchType);
  }, [searchQuery, performSearch, showCreateForm]);

  // Handle customer selection
  const handleCustomerSelect = useCallback(async (customer: CustomerWithVehicles): Promise<void> => {
    setSelectedCustomer(customer);
    setSearchQuery("");
    clearSearch();
    setShowCreateCustomer(false);
    
    // Add to recent customers (this will be handled by the service/repository)
    // The repository tracks this automatically when a customer is accessed
  }, [clearSearch]);

  // Form reset functions
  const resetCustomerForm = useCallback(() => {
    setSelectedState("");
    setSelectedCity("");
    setNewCustomerForm({ 
      ...initialCustomerForm,
      addressType: undefined,
      workAddress: "",
    });
    setWhatsappSameAsMobile(false);
  }, [setNewCustomerForm]);

  const resetVehicleForm = useCallback(() => {
    setNewVehicleForm({ ...initialVehicleForm });
    setVehicleFormState("");
    setVehicleFormCity("");
    setHasInsurance(false);
  }, [setNewVehicleForm]);

  const resetAppointmentForm = useCallback(() => {
    setAppointmentForm(getInitialAppointmentForm());
    setPickupState("");
    setPickupCity("");
    setDropState("");
    setDropCity("");
    setPickupAddressDifferent(false);
    setDropSameAsPickup(false);
  }, [setAppointmentForm]);

  // Helper to initialize appointment form with customer and optional vehicle data
  const initializeAppointmentForm = useCallback((customer: CustomerWithVehicles, vehicle?: Vehicle | null) => {
    const vehicleString = vehicle 
      ? `${vehicle.vehicleMake} ${vehicle.vehicleModel} (${vehicle.vehicleYear})`
      : (customer.vehicles && customer.vehicles.length > 0
          ? formatVehicleString(customer.vehicles[0])
          : "");
    
    setAppointmentForm({
      ...getInitialAppointmentForm(),
      customerName: customer.name,
      phone: customer.phone,
      vehicle: vehicleString,
      serviceType: "",
    });
    
    // Set selected vehicle if provided, otherwise set first vehicle if available
    if (vehicle) {
      setSelectedVehicle(vehicle);
    } else if (customer.vehicles && customer.vehicles.length > 0) {
      setSelectedVehicle(customer.vehicles[0]);
    } else {
      setSelectedVehicle(null);
    }
  }, [setAppointmentForm]);

  // Modal close handlers
  const closeCustomerForm = useCallback(() => {
    setShowCreateForm(false);
    setValidationError("");
    setFieldErrors({});
    resetCustomerForm();
  }, [resetCustomerForm]);

  const closeVehicleForm = useCallback(() => {
    setShowAddVehiclePopup(false);
    setValidationError("");
    resetVehicleForm();
    setShouldOpenAppointmentAfterVehicleAdd(false);
  }, [resetVehicleForm]);

  // Function to enrich service history with feedback ratings from appointments
  const enrichServiceHistoryWithFeedbackRatings = useCallback((
    serviceHistory: ServiceHistoryItem[],
    vehicle: Vehicle,
    customer: CustomerWithVehicles | null
  ): ServiceHistoryItem[] => {
    if (!customer || typeof window === "undefined") return serviceHistory;

    try {
      const appointments = safeStorage.getItem<Appointment[]>("appointments", []);
      const vehicleString = formatVehicleString(vehicle);

      // Match appointments to service history items by date and vehicle
      return serviceHistory.map((service) => {
        // Find matching appointment by date and vehicle
        const matchingAppointment = appointments.find((apt) => {
          const appointmentDate = apt.date?.split("T")[0] || apt.date;
          const serviceDate = service.date;
          const vehicleMatches = apt.vehicle === vehicleString || 
                                 apt.vehicle?.includes(vehicle.vehicleMake) ||
                                 apt.vehicle?.includes(vehicle.vehicleModel);
          
          return appointmentDate === serviceDate && vehicleMatches && 
                 apt.customerName === customer.name &&
                 apt.feedbackRating !== undefined && apt.feedbackRating !== null;
        });

        if (matchingAppointment?.feedbackRating) {
          return {
            ...service,
            feedbackRating: matchingAppointment.feedbackRating,
          };
        }

        return service;
      });
    } catch (error) {
      console.error("Error enriching service history with feedback ratings:", error);
      return serviceHistory;
    }
  }, []);

  // Function to update feedback rating for a service
  const handleUpdateFeedbackRating = useCallback((
    service: ServiceHistoryItem,
    newRating: number
  ) => {
    if (!selectedCustomer || !selectedVehicle || typeof window === "undefined") return;

    try {
      const appointments = safeStorage.getItem<Appointment[]>("appointments", []);
      const vehicleString = formatVehicleString(selectedVehicle);

      // Find matching appointment by date and vehicle
      const matchingAppointmentIndex = appointments.findIndex((apt) => {
        const appointmentDate = apt.date?.split("T")[0] || apt.date;
        const serviceDate = service.date;
        const vehicleMatches = apt.vehicle === vehicleString || 
                               apt.vehicle?.includes(selectedVehicle.vehicleMake) ||
                               apt.vehicle?.includes(selectedVehicle.vehicleModel);
        
        return appointmentDate === serviceDate && vehicleMatches && 
               apt.customerName === selectedCustomer.name;
      });

      if (matchingAppointmentIndex !== -1) {
        // Update the appointment's feedback rating
        const updatedAppointments = [...appointments];
        updatedAppointments[matchingAppointmentIndex] = {
          ...updatedAppointments[matchingAppointmentIndex],
          feedbackRating: newRating,
        };
        safeStorage.setItem("appointments", updatedAppointments);

        // Update the service history display
        setServiceHistory((prev) =>
          prev.map((s) =>
            s.id === service.id ? { ...s, feedbackRating: newRating } : s
          )
        );

        showToast(`Feedback rating updated to ${newRating} stars`, "success");
      } else {
        // If no matching appointment found, still update the display
        setServiceHistory((prev) =>
          prev.map((s) =>
            s.id === service.id ? { ...s, feedbackRating: newRating } : s
          )
        );
        showToast(`Feedback rating updated to ${newRating} stars`, "success");
      }

      setEditingFeedbackRating(null);
    } catch (error) {
      console.error("Error updating feedback rating:", error);
      showToast("Failed to update feedback rating", "error");
    }
  }, [selectedCustomer, selectedVehicle, showToast]);

  const closeAppointmentForm = useCallback(() => {
    // Clean up file URLs before closing
    setAppointmentForm((prev) => {
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
      return getInitialAppointmentForm();
    });
    setShowScheduleAppointment(false);
    setValidationError("");
    setAppointmentFieldErrors({});
    setPickupState("");
    setPickupCity("");
    setDropState("");
    setDropCity("");
    setPickupAddressDifferent(false);
    setDropSameAsPickup(false);
  }, [setAppointmentForm]);

  // Handle direct create customer button
  const handleDirectCreateCustomer = useCallback((): void => {
    // Check permission before allowing customer creation
    if (!canCreateNewCustomer) {
      showToast("You do not have permission to create new customers.", "error");
      return;
    }
    
    // Clear search when opening create form
    setSearchQuery("");
    clearSearch();
    setSelectedCustomer(null);
    setShowCreateCustomer(false);
    setDetectedSearchType(null);
    setValidationError("");
    
    setShowCreateForm(true);
    resetCustomerForm();
  }, [canCreateNewCustomer, resetCustomerForm, clearSearch, showToast]);


  // Save new customer
  const handleSaveNewCustomer = useCallback(async (): Promise<void> => {
    const errors: Record<string, string> = {};
    let hasErrors = false;

    // Validate name
    if (!newCustomerForm.name?.trim()) {
      errors.name = "Full Name is required";
      hasErrors = true;
    }

    // Validate primary phone
    if (!newCustomerForm.phone?.trim()) {
      errors.phone = "Mobile Number (Primary) is required";
      hasErrors = true;
    } else if (!validatePhone(newCustomerForm.phone)) {
      errors.phone = "Please enter a valid 10-digit mobile number";
      hasErrors = true;
    }

    // Validate address
    if (!newCustomerForm.address?.trim()) {
      errors.address = "Full Address is required";
      hasErrors = true;
    }

    // Validate alternate mobile if provided
    if (newCustomerForm.alternateMobile) {
      if (!validatePhone(newCustomerForm.alternateMobile)) {
        errors.alternateMobile = "Please enter a valid 10-digit alternate mobile number";
        hasErrors = true;
      } else if (cleanPhone(newCustomerForm.alternateMobile) === cleanPhone(newCustomerForm.phone)) {
        errors.alternateMobile = "Alternate mobile number must be different from primary mobile number";
        hasErrors = true;
      }
    }

    // Validate email if provided
    if (newCustomerForm.email && !validateEmail(newCustomerForm.email)) {
      errors.email = "Please enter a valid email address";
      hasErrors = true;
    }

    // Validate pincode if provided
    if (newCustomerForm.pincode && !/^\d{6}$/.test(newCustomerForm.pincode)) {
      errors.pincode = "Pincode must be exactly 6 digits";
      hasErrors = true;
    }

    // Validate state
    if (!selectedState) {
      errors.state = "Please select a state";
      hasErrors = true;
    }

    // Validate city
    if (!selectedCity) {
      errors.city = "Please select a city";
      hasErrors = true;
    }

    // Validate work address if work address type is selected
    if (newCustomerForm.addressType === "work" && !newCustomerForm.workAddress?.trim()) {
      errors.workAddress = "Please enter work address for pickup/drop service";
      hasErrors = true;
    }

    // Check permission before creating customer
    if (!canCreateNewCustomer) {
      setValidationError("You do not have permission to create new customers.");
      showToast("You do not have permission to create new customers.", "error");
      return;
    }

    setFieldErrors(errors);

    if (hasErrors) {
      const errorCount = Object.keys(errors).length;
      setValidationError(`Please fill ${errorCount} mandatory field${errorCount > 1 ? 's' : ''} to continue`);
      return;
    }

    setValidationError("");
    setFieldErrors({});

    const fallbackCenterId = serviceCenterFilterId ? serviceCenterFilterId.toString() : undefined;
    const preferredServiceCenterId = serviceCenterContext.serviceCenterId ?? fallbackCenterId;
    const preferredServiceCenterName =
      serviceCenterContext.serviceCenterName ??
      staticServiceCenters.find((center) => center.id === serviceCenterFilterId)?.name;

    // Combine city and state into cityState for backend compatibility
    const cityState = selectedCity && selectedState ? `${selectedCity}, ${selectedState}` : "";

    const customer = await createCustomer({
      ...newCustomerForm,
      cityState,
      phone: cleanPhone(newCustomerForm.phone),
      alternateMobile: newCustomerForm.alternateMobile ? cleanPhone(newCustomerForm.alternateMobile) : undefined,
      serviceCenterId: preferredServiceCenterId,
      serviceCenterName: preferredServiceCenterName,
    });

    if (customer) {
      setSelectedCustomer(customer);
      setShowCreateForm(false);
      setShowCreateCustomer(false);

      // Reset form
      resetCustomerForm();

      showToast(`Customer created successfully! Customer Number: ${customer.customerNumber}`, "success");
      safeStorage.setItem("lastCreatedCustomerMeta", {
        customerId: customer.id?.toString() || "",
        serviceCenterId: preferredServiceCenterId ?? null,
        serviceCenterName: preferredServiceCenterName ?? null,
      });
    } else if (createError) {
      setValidationError(createError);
    }
  }, [
    newCustomerForm,
    createCustomer,
    createError,
    showToast,
    resetCustomerForm,
    canCreateNewCustomer,
    serviceCenterFilterId,
    serviceCenterContext.serviceCenterId,
    serviceCenterContext.serviceCenterName,
  ]);

  // Get search type label
  const getSearchTypeLabel = (type: CustomerSearchType | null): string => {
    if (!type) return "";
    const labels: Record<CustomerSearchType, string> = {
      phone: "Phone Number",
      email: "Email ID",
      customerNumber: "Customer ID",
      vin: "VIN Number",
      vehicleNumber: "Vehicle Number",
      name: "Name",
      auto: "Auto-detect",
    };
    return labels[type];
  };

  // Show create customer if search returned no results
  const shouldShowCreateCustomer =
    showCreateCustomer || (searchQuery.trim().length >= 2 && filteredSearchResults.length === 0 && !searchLoading);

  return (
    <div className="bg-gray-50 min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-10">
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[10000] transition-all duration-300"
          style={{
            animation: 'fadeInDown 0.3s ease-out',
          }}
        >
          <div className={`${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}>
            {toast.type === "success" ? (
              <CheckCircle size={20} className="flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="flex-shrink-0" />
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Customer Search
              </h1>
              <p className="text-gray-600 text-sm mt-1.5">
                Search by phone, email, customer ID, VIN, or vehicle number
              </p>
            </div>
            {canCreateNewCustomer && (
              <Button onClick={handleDirectCreateCustomer} icon={PlusCircle} className="self-start sm:self-auto">
                Create New Customer
              </Button>
            )}
          </div>
        </div>

        {/* Global Search Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className={`absolute left-3.5 top-1/2 transform -translate-y-1/2 z-10 ${showCreateForm ? "text-gray-300" : "text-gray-400"}`} size={18} strokeWidth={2} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !showCreateForm) {
                    handleSearch();
                  }
                }}
                placeholder={showCreateForm ? "Search disabled while creating customer..." : "Search by phone, email, customer ID, VIN, or vehicle number..."}
                disabled={showCreateForm}
                className={`w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-gray-900 placeholder:text-gray-400 transition-all duration-200 ${
                  showCreateForm 
                    ? "bg-gray-100 cursor-not-allowed" 
                    : "bg-gray-50/50 focus:bg-white"
                }`}
              />
              {detectedSearchType && searchQuery.length >= 2 && !showCreateForm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md font-medium">
                    {getSearchTypeLabel(detectedSearchType)}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery.trim() || showCreateForm}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {searchLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Searching...</span>
                </>
              ) : (
                <>
                  <Search size={18} strokeWidth={2} />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </button>
          </div>

          {validationError && (
            <div className="mt-3 p-3.5 bg-red-50 rounded-lg flex items-center gap-2.5 text-red-700 text-sm font-medium">
              <AlertCircle size={18} strokeWidth={2} />
              {validationError}
            </div>
          )}

          {/* Search Results Dropdown */}
          {filteredSearchResults.length > 0 && searchQuery.trim().length >= 2 && !showCreateForm && (
            <div className="mt-3 rounded-lg shadow-lg max-h-64 overflow-y-auto bg-white">
              {filteredSearchResults.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer)}
                  className="p-4 hover:bg-indigo-50/50 cursor-pointer transition-all duration-150 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                          <User className="text-indigo-600 shrink-0" size={16} strokeWidth={2} />
                        </div>
                        <h4 className="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{customer.name}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 ml-8">
                        <div className="flex items-center gap-1.5">
                          <Hash size={12} strokeWidth={2} />
                          <span className="font-mono text-gray-700">{customer.customerNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} strokeWidth={2} />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} strokeWidth={2} />
                            <span className="truncate max-w-[150px]">{customer.email}</span>
                          </div>
                        )}
                        {isCallCenter && customer.serviceCenterName && (
                          <div className="flex items-center gap-1.5">
                            <Building2 size={12} strokeWidth={2} className="text-gray-400" />
                            <span className="truncate max-w-[150px]">{customer.serviceCenterName}</span>
                          </div>
                        )}
                      </div>
                      {customer.totalVehicles && customer.totalVehicles > 0 && (
                        <div className="flex items-center gap-1.5 ml-8 mt-1.5">
                          <Car size={12} className="text-gray-400" strokeWidth={2} />
                          <span className="text-xs text-gray-500 font-medium">
                            {customer.totalVehicles} {customer.totalVehicles === 1 ? "vehicle" : "vehicles"}
                          </span>
                        </div>
                      )}
                    </div>
                    <CheckCircle className="text-indigo-600 shrink-0 group-hover:scale-110 transition-transform" size={18} strokeWidth={2} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Customers Section - Always show when no customer selected and not creating */}
        {!selectedCustomer && !showCreateForm && searchQuery.length < 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-100">
                <Clock className="text-indigo-600" size={18} strokeWidth={2} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Customers</h2>
                <span className="text-sm text-gray-500 font-medium">({recentCustomers.length})</span>
            </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer ID</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      {isCallCenter && (
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Service Center
                        </th>
                      )}
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicles</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Spent</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                {recentCustomers.map((customer) => (
                      <tr
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                        className="hover:bg-indigo-50/50 cursor-pointer transition-colors duration-150 group"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm group-hover:shadow-md transition-shadow">
                              {customer.name.charAt(0).toUpperCase()}
                        </div>
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{customer.name}</p>
                              {customer.address && (
                                <p className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">{customer.address}</p>
                              )}
                      </div>
                    </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm text-gray-700 font-medium">{customer.customerNumber}</span>
                        </td>
                        <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                            <Phone size={14} className="text-gray-400" strokeWidth={2} />
                            <span className="text-sm text-gray-700">{customer.phone}</span>
                      </div>
                        </td>
                        <td className="py-4 px-4">
                          {customer.email ? (
                      <div className="flex items-center gap-1.5">
                              <Mail size={14} className="text-gray-400" strokeWidth={2} />
                              <span className="text-sm text-gray-700 truncate max-w-[180px]">{customer.email}</span>
                      </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        {isCallCenter && (
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">
                              {customer.serviceCenterName || "—"}
                            </span>
                          </td>
                        )}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            <Car size={14} className="text-gray-400" strokeWidth={2} />
                            <span className="text-sm text-gray-700 font-medium">
                              {customer.totalVehicles || 0}
                            </span>
                    </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {customer.totalSpent || "₹0"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {(() => {
                            // Get available vehicles (status !== "Active Job Card")
                            const availableVehicles = customer.vehicles?.filter(
                              (v) => v.currentStatus !== "Active Job Card"
                            ) || [];
                            
                            // Check if customer has any available vehicles or no vehicles (can add new)
                            const canSchedule = availableVehicles.length > 0 || !customer.vehicles || customer.vehicles.length === 0;
                            
                            if (!canSchedule) {
                              return (
                                <span className="text-xs text-gray-400 italic">No available vehicles</span>
                              );
                            }
                            
                            return (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCustomer(customer);
                                  
                                  // Initialize appointment form (will use first vehicle if available, or show dropdown for multiple)
                                  initializeAppointmentForm(customer);
                                    setShowVehicleDetails(false); // Ensure vehicle details modal is closed
                                    setShowScheduleAppointment(true);
                                  
                                  if (availableVehicles.length === 0) {
                                    // No vehicles - allow scheduling for new vehicle
                                    // First add a vehicle, then schedule
                                    resetVehicleForm();
                                    // Initialize state and city from customer's cityState
                                    if (customer.cityState) {
                                      const parts = customer.cityState.split(",");
                                      if (parts.length >= 2) {
                                        setVehicleFormCity(parts[0]?.trim() || "");
                                        setVehicleFormState(parts[1]?.trim() || "");
                                      }
                                    }
                                    setShouldOpenAppointmentAfterVehicleAdd(true);
                                    setShowAddVehiclePopup(true);
                                  }
                                }}
                                variant="success"
                                size="sm"
                                icon={Calendar}
                                className="px-3 py-1.5 text-xs"
                              >
                                Schedule
                              </Button>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Customer Not Found - Create New */}
        {shouldShowCreateCustomer && !showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-6">
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <AlertCircle className="text-amber-600" size={32} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Not Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {canCreateNewCustomer 
                  ? "No customer found with the provided search. Would you like to create a new customer?"
                  : "No customer found with the provided search. Please contact a service advisor or call center to create a new customer."}
              </p>
              {canCreateNewCustomer && (
                <button
                  onClick={handleDirectCreateCustomer}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2 mx-auto"
                >
                  <PlusCircle size={18} strokeWidth={2} />
                  Create New Customer
                </button>
              )}
            </div>
          </div>
        )}

        {/* Create Customer Form Modal */}
        {showCreateForm && canCreateNewCustomer && (
          <Modal 
            title="Create New Customer" 
            subtitle="Fill in the customer details below"
            onClose={closeCustomerForm}
            maxWidth="max-w-3xl"
          >
            <div className="p-6 space-y-4">
              <FormInput
                label="Full Name"
                required
                value={newCustomerForm.name}
                onChange={(e) => {
                  setNewCustomerForm({ ...newCustomerForm, name: e.target.value });
                  if (fieldErrors.name) {
                    setFieldErrors({ ...fieldErrors, name: "" });
                  }
                }}
                placeholder="Enter full name"
                error={fieldErrors.name}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Mobile Number (Primary)"
                  required
                  type="tel"
                  value={newCustomerForm.phone}
                  onChange={(e) => {
                    const phoneValue = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setNewCustomerForm({
                      ...newCustomerForm,
                      phone: phoneValue,
                      ...(whatsappSameAsMobile ? { whatsappNumber: phoneValue } : {}),
                    });
                    if (fieldErrors.phone) {
                      setFieldErrors({ ...fieldErrors, phone: "" });
                    }
                  }}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  error={fieldErrors.phone}
                />
                <div>
                  <FormInput
                    label="WhatsApp Number"
                    type="tel"
                    value={newCustomerForm.whatsappNumber || ""}
                    onChange={(e) =>
                      setNewCustomerForm({
                        ...newCustomerForm,
                        whatsappNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    placeholder="10-digit WhatsApp number"
                    maxLength={10}
                    disabled={whatsappSameAsMobile}
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappSameAsMobile}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setWhatsappSameAsMobile(checked);
                        setNewCustomerForm({
                          ...newCustomerForm,
                          whatsappNumber: checked ? newCustomerForm.phone : "",
                        });
                      }}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600">Same as mobile number</span>
                  </label>
                </div>
                <FormInput
                  label="Alternate Mobile Number"
                  type="tel"
                  value={newCustomerForm.alternateMobile || ""}
                  onChange={(e) => {
                    setNewCustomerForm({
                      ...newCustomerForm,
                      alternateMobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                    });
                    if (fieldErrors.alternateMobile) {
                      setFieldErrors({ ...fieldErrors, alternateMobile: "" });
                    }
                  }}
                  placeholder="10-digit mobile number (optional)"
                  maxLength={10}
                  error={fieldErrors.alternateMobile}
                />
              </div>

              <FormInput
                label="Email ID"
                type="email"
                value={newCustomerForm.email || ""}
                onChange={(e) => {
                  setNewCustomerForm({ ...newCustomerForm, email: e.target.value });
                  if (fieldErrors.email) {
                    setFieldErrors({ ...fieldErrors, email: "" });
                  }
                }}
                placeholder="Enter email address"
                error={fieldErrors.email}
              />

              {/* Full Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newCustomerForm.address || ""}
                  onChange={(e) => {
                    setNewCustomerForm({ ...newCustomerForm, address: e.target.value });
                    if (fieldErrors.address) {
                      setFieldErrors({ ...fieldErrors, address: "" });
                    }
                  }}
                  rows={3}
                  placeholder="House / Flat, Street, Area, City, State, Pincode"
                  className={`w-full px-4 py-2.5 rounded-lg focus:bg-white focus:ring-2 focus:outline-none text-gray-900 transition-all duration-200 resize-none ${
                    fieldErrors.address 
                      ? "bg-red-50 border-2 border-red-300 focus:ring-red-500/20 focus:border-red-500" 
                      : "bg-gray-50/50 focus:ring-indigo-500/20 border border-gray-200"
                  }`}
                />
                {fieldErrors.address && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">•</span>
                    {fieldErrors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedCity(""); // Reset city when state changes
                      if (fieldErrors.state) {
                        setFieldErrors({ ...fieldErrors, state: "" });
                      }
                    }}
                    className={`w-full px-4 py-2.5 rounded-lg focus:bg-white focus:ring-2 focus:outline-none text-gray-900 transition-all duration-200 ${
                      fieldErrors.state 
                        ? "bg-red-50 border-2 border-red-300 focus:ring-red-500/20 focus:border-red-500" 
                        : "bg-gray-50/50 focus:ring-indigo-500/20 border border-gray-200"
                    }`}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state.code} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.state && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span>
                      {fieldErrors.state}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      if (fieldErrors.city) {
                        setFieldErrors({ ...fieldErrors, city: "" });
                      }
                    }}
                    disabled={!selectedState}
                    className={`w-full px-4 py-2.5 rounded-lg focus:bg-white focus:ring-2 focus:outline-none text-gray-900 transition-all duration-200 ${
                      !selectedState
                        ? "bg-gray-100 border border-gray-200 cursor-not-allowed text-gray-400"
                        : fieldErrors.city
                        ? "bg-red-50 border-2 border-red-300 focus:ring-red-500/20 focus:border-red-500"
                        : "bg-gray-50/50 focus:ring-indigo-500/20 border border-gray-200"
                    }`}
                  >
                    <option value="">{selectedState ? "Select City" : "Select State First"}</option>
                    {selectedState && getCitiesByState(selectedState).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.city && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span>
                      {fieldErrors.city}
                    </p>
                  )}
                </div>
                <FormInput
                  label="Pincode"
                  value={newCustomerForm.pincode || ""}
                  onChange={(e) => {
                    setNewCustomerForm({ ...newCustomerForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) });
                    if (fieldErrors.pincode) {
                      setFieldErrors({ ...fieldErrors, pincode: "" });
                    }
                  }}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  error={fieldErrors.pincode}
                />
              </div>

              {/* Customer Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Type
                </label>
                <select
                  value={newCustomerForm.customerType || ""}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, customerType: e.target.value as CustomerType | undefined })
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-gray-900 transition-all duration-200 border border-gray-200"
                >
                  <option value="">Select Customer Type</option>
                  <option value="B2C">B2C</option>
                  <option value="B2B">B2B</option>
                </select>
              </div>

              {validationError && <ErrorAlert message={validationError} />}
              
              {Object.keys(fieldErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800 mb-2">Please fill the following mandatory fields:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                    {Object.entries(fieldErrors).map(([field, error]) => (
                      <li key={field}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button onClick={closeCustomerForm} variant="secondary" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveNewCustomer} disabled={createLoading} className="flex-1">
                  {createLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Customer"
                  )}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Customer Details Modal */}
        {selectedCustomer && (
          <Modal 
            title="Customer Details" 
            subtitle={`${selectedCustomer.name} - ${selectedCustomer.customerNumber}`}
            onClose={() => {
              setSelectedCustomer(null);
              setSearchQuery("");
              clearSearch();
            }}
            maxWidth="max-w-6xl"
          >
          <div className="space-y-6">
            {/* Customer Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-3.5 rounded-xl shadow-sm">
                    <User className="text-indigo-600" size={24} strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                    <p className="text-sm text-gray-600 font-medium mt-0.5">Customer #{selectedCustomer.customerNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                <Button onClick={() => setShowComplaints(true)} variant="warning" icon={AlertTriangle}>
                  Complaints
                </Button>
                <Button onClick={() => { 
                  resetVehicleForm();
                  // Initialize state and city from customer's cityState
                  if (selectedCustomer.cityState) {
                    const parts = selectedCustomer.cityState.split(",");
                    if (parts.length >= 2) {
                      setVehicleFormCity(parts[0]?.trim() || "");
                      setVehicleFormState(parts[1]?.trim() || "");
                    }
                  }
                  setShowAddVehiclePopup(true); 
                }} icon={PlusCircle}>
                  Add Vehicle
                </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <InfoCard icon={Phone} label="Phone" value={selectedCustomer.phone} />
                {selectedCustomer.whatsappNumber && (
                  <InfoCard icon={Phone} label="WhatsApp" value={selectedCustomer.whatsappNumber} />
                )}
                {selectedCustomer.alternateMobile && (
                  <InfoCard icon={Phone} label="Alternate Mobile" value={selectedCustomer.alternateMobile} />
                )}
                {selectedCustomer.email && <InfoCard icon={Mail} label="Email" value={selectedCustomer.email} />}
                {selectedCustomer.customerType && (
                  <InfoCard icon={User} label="Customer Type" value={selectedCustomer.customerType} />
                )}
                {(selectedCustomer.address || selectedCustomer.cityState || selectedCustomer.pincode) && (
                  <InfoCard 
                    icon={MapPin} 
                    label="Full Address" 
                    value={
                      <div className="space-y-1 text-left">
                        {selectedCustomer.address && (
                          <span className="block text-gray-900 font-medium">{selectedCustomer.address}</span>
                        )}
                        {selectedCustomer.cityState && (
                          <span className="block text-gray-700 text-sm">{selectedCustomer.cityState}</span>
                        )}
                        {selectedCustomer.pincode && (
                          <span className="block text-gray-600 text-sm">Pincode: {selectedCustomer.pincode}</span>
                        )}
                      </div>
                    } 
                  />
                )}
                <InfoCard icon={Calendar} label="Member Since" value={new Date(selectedCustomer.createdAt).toLocaleDateString()} />
                {selectedCustomer.lastServiceCenterName && (
                  <InfoCard 
                    icon={Building2} 
                    label="Last Service Center" 
                    value={selectedCustomer.lastServiceCenterName} 
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalVehicles || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Vehicles</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{selectedCustomer.totalSpent || "₹0"}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Spent</p>
                </div>
                {selectedCustomer.lastServiceDate && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-bold text-purple-600">
                      {new Date(selectedCustomer.lastServiceDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Last Service</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicles List */}
            {selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Car className="text-indigo-600" size={20} />
                  Linked Vehicles ({selectedCustomer.vehicles.length})
                </h3>
                <div className="space-y-3">
                  {selectedCustomer.vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="rounded-lg p-4 hover:shadow-sm transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-800">
                              {vehicle.vehicleMake} {vehicle.vehicleModel} ({vehicle.vehicleYear})
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                vehicle.currentStatus === "Active Job Card"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {vehicle.currentStatus}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Registration</p>
                              <p className="font-medium text-gray-800">{vehicle.registration}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">VIN</p>
                              <p className="font-medium text-gray-800 font-mono text-xs">
                                {vehicle.vin}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Color</p>
                              <p className="font-medium text-gray-800">{vehicle.vehicleColor}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Services</p>
                              <p className="font-medium text-gray-800">
                                {vehicle.totalServices} ({vehicle.totalSpent})
                              </p>
                            </div>
                            {vehicle.lastServiceCenterName && (
                              <div className="sm:col-span-4">
                                <p className="text-gray-500 flex items-center gap-1">
                                  <Building2 size={14} />
                                  Last Service Center
                                </p>
                                <p className="font-medium text-gray-800">{vehicle.lastServiceCenterName}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowVehicleDetails(true);
                              // Only show service history if vehicle has services (totalServices > 0)
                              // Newly added vehicles should have empty service history
                              if (vehicle.totalServices > 0 && vehicle.lastServiceDate) {
                                const baseHistory = getMockServiceHistory(vehicle.id);
                                // Enrich service history with feedback ratings from appointments
                                const enrichedHistory = enrichServiceHistoryWithFeedbackRatings(
                                  baseHistory,
                                  vehicle,
                                  selectedCustomer
                                );
                                setServiceHistory(enrichedHistory);
                              } else {
                                setServiceHistory([]);
                              }
                            }}
                            size="sm"
                            icon={FileText}
                            className="px-4 py-2"
                          >
                            View Details
                          </Button>

                          {/* Allow scheduling only when vehicle is not already under active service */}
                          {vehicle.currentStatus !== "Active Job Card" ? (
                            <Button
                              onClick={() => {
                                setSelectedVehicle(vehicle);
                                setShowVehicleDetails(false); // Ensure vehicle details modal is closed
                                setShowScheduleAppointment(true);
                                initializeAppointmentForm(selectedCustomer, vehicle);
                              }}
                              variant="success"
                              size="sm"
                              icon={Calendar}
                              className="px-4 py-2"
                            >
                              Schedule Appointment
                            </Button>
                          ) : (
                            <span className="text-xs text-orange-600 font-medium self-center">
                              Appointment blocked: vehicle already in active service
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!selectedCustomer.vehicles || selectedCustomer.vehicles.length === 0) && (
              <div className="bg-white rounded-2xl shadow-md p-6 text-center">
                <Car className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Vehicles Linked</h3>
                <p className="text-gray-600 mb-4">
                  This customer doesn&apos;t have any vehicles linked yet.
                </p>
                <button
                  onClick={() => {
                    resetVehicleForm();
                    // Initialize state and city from customer's cityState
                    if (selectedCustomer.cityState) {
                      const parts = selectedCustomer.cityState.split(",");
                      if (parts.length >= 2) {
                        setVehicleFormCity(parts[0]?.trim() || "");
                        setVehicleFormState(parts[1]?.trim() || "");
                      }
                    }
                    setShowAddVehiclePopup(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  <PlusCircle size={20} />
                  Add First Vehicle
                </button>
              </div>
            )}
          </div>
          </Modal>
        )}

        {/* Add Vehicle Popup Form */}
        {showAddVehiclePopup && selectedCustomer && (
          <Modal title="Add New Vehicle" onClose={closeVehicleForm}>
            <div className="p-6 space-y-6">
                {validationError && <ErrorAlert message={validationError} />}
                
                {/* Customer Information Section */}
                <div className="bg-indigo-50 rounded-lg p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-3">Customer Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Customer Type"
                      value={selectedCustomer.customerType || ""}
                      onChange={() => {}}
                      readOnly
                    />
                    <FormInput
                      label="Phone Number"
                      value={selectedCustomer.phone}
                      onChange={() => {}}
                      readOnly
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormInput
                        label="WhatsApp Number"
                        value={selectedCustomer.whatsappNumber || selectedCustomer.phone || ""}
                        onChange={() => {}}
                        readOnly
                      />
                      {selectedCustomer.whatsappNumber && selectedCustomer.whatsappNumber !== selectedCustomer.phone && (
                        <p className="text-xs text-gray-500 mt-1">Different from phone number</p>
                      )}
                    </div>
                    <FormInput
                      label="Alternate Mobile Number"
                      value={selectedCustomer.alternateMobile || ""}
                      onChange={() => {}}
                      readOnly
                    />
                  </div>

                  {selectedCustomer.address && (
                    <FormInput
                      label="Full Address"
                      value={selectedCustomer.address}
                      onChange={() => {}}
                      readOnly
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State
                      </label>
                      <select
                        value={vehicleFormState || (() => {
                          // Parse cityState: format is "City, State"
                          if (selectedCustomer.cityState) {
                            const parts = selectedCustomer.cityState.split(",");
                            return parts.length >= 2 ? parts[1]?.trim() || "" : "";
                          }
                          return "";
                        })()}
                        onChange={(e) => {
                          setVehicleFormState(e.target.value);
                          setVehicleFormCity(""); // Reset city when state changes
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-gray-900 transition-all duration-200 border border-gray-200"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state.code} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <select
                        value={vehicleFormCity || (() => {
                          // Parse cityState: format is "City, State"
                          if (selectedCustomer.cityState) {
                            const parts = selectedCustomer.cityState.split(",");
                            return parts.length >= 1 ? parts[0]?.trim() || "" : "";
                          }
                          return "";
                        })()}
                        onChange={(e) => setVehicleFormCity(e.target.value)}
                        disabled={!vehicleFormState && !selectedCustomer.cityState}
                        className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:outline-none text-gray-900 transition-all duration-200 border ${
                          !vehicleFormState && !selectedCustomer.cityState
                            ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
                            : "bg-white focus:ring-indigo-500/20 border-gray-200"
                        }`}
                      >
                        <option value="">{(vehicleFormState || selectedCustomer.cityState) ? "Select City" : "Select State First"}</option>
                        {(vehicleFormState || selectedCustomer.cityState) && 
                          getCitiesByState(vehicleFormState || (() => {
                            if (selectedCustomer.cityState) {
                              const parts = selectedCustomer.cityState.split(",");
                              return parts.length >= 2 ? parts[1]?.trim() || "" : "";
                            }
                            return "";
                          })()).map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    <FormInput
                      label="Pincode"
                      value={selectedCustomer.pincode || ""}
                      onChange={() => {}}
                      readOnly
                    />
                  </div>
                </div>

                {/* Vehicle Form Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Vehicle Brand"
                      required
                      value={newVehicleForm.vehicleBrand || ""}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, vehicleBrand: e.target.value })}
                      placeholder="e.g., Honda, Toyota, Tesla"
                    />
                    <FormInput
                      label="Vehicle Model"
                      required
                      value={newVehicleForm.vehicleModel || ""}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, vehicleModel: e.target.value })}
                      placeholder="e.g., City, Camry, Model 3"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Registration Number"
                      required
                      value={newVehicleForm.registrationNumber || ""}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, registrationNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g., MH12AB1234"
                    />
                    <div>
                      <FormInput
                        label="VIN / Chassis Number"
                        required
                        value={newVehicleForm.vin || ""}
                        onChange={(e) => setNewVehicleForm({ ...newVehicleForm, vin: e.target.value.toUpperCase() })}
                        placeholder="Enter 17-character VIN number"
                        maxLength={17}
                        className="font-mono"
                      />
                      <p className="text-xs text-gray-500 mt-1.5">17 alphanumeric characters</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Variant / Battery Capacity"
                      value={newVehicleForm.variant || ""}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, variant: e.target.value })}
                      placeholder="e.g., VX, 50kWh, Standard Range"
                    />
                    <FormInput
                      label="Motor Number"
                      value={newVehicleForm.motorNumber || ""}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, motorNumber: e.target.value })}
                      placeholder="Enter motor number"
                    />
                  </div>

                  <FormInput
                    label="Charger Serial Number"
                    value={newVehicleForm.chargerSerialNumber || ""}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, chargerSerialNumber: e.target.value })}
                    placeholder="Enter charger serial number"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Date of Purchase"
                      type="date"
                      value={newVehicleForm.purchaseDate || ""}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, purchaseDate: e.target.value })}
                    />
                    <FormInput
                      label="Vehicle Color"
                      value={newVehicleForm.vehicleColor || ""}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, vehicleColor: e.target.value })}
                      placeholder="e.g., Red, Blue, White, Black"
                    />
                  </div>

                  <FormSelect
                    label="Warranty Status"
                    value={newVehicleForm.warrantyStatus || ""}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, warrantyStatus: e.target.value })}
                    placeholder="Select Warranty Status"
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "Expired", label: "Expired" },
                      { value: "Not Applicable", label: "Not Applicable" },
                    ]}
                  />

                  {/* Has Insurance Toggle */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="hasInsurance"
                        checked={hasInsurance}
                        onChange={(e) => {
                          setHasInsurance(e.target.checked);
                          // Clear insurance fields when unchecked
                          if (!e.target.checked) {
                            setNewVehicleForm({
                              ...newVehicleForm,
                              insuranceStartDate: "",
                              insuranceEndDate: "",
                              insuranceCompanyName: "",
                            });
                          }
                        }}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                      />
                      <label htmlFor="hasInsurance" className="text-sm font-semibold text-gray-800 cursor-pointer">
                        Has Insurance
                      </label>
                    </div>

                    {/* Insurance Information - Only show when hasInsurance is true */}
                    {hasInsurance && (
                      <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Insurance Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            label="Insurance Start Date"
                            type="date"
                            value={newVehicleForm.insuranceStartDate || ""}
                            onChange={(e) => setNewVehicleForm({ ...newVehicleForm, insuranceStartDate: e.target.value })}
                          />
                          <FormInput
                            label="Insurance End Date"
                            type="date"
                            value={newVehicleForm.insuranceEndDate || ""}
                            onChange={(e) => setNewVehicleForm({ ...newVehicleForm, insuranceEndDate: e.target.value })}
                          />
                        </div>
                        <div className="mt-4">
                          <FormInput
                            label="Insurance Company Name"
                            value={newVehicleForm.insuranceCompanyName || ""}
                            onChange={(e) => setNewVehicleForm({ ...newVehicleForm, insuranceCompanyName: e.target.value })}
                            placeholder="Enter insurance company name"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={closeVehicleForm} variant="secondary" className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      // Validate form
                      if (!newVehicleForm.vehicleBrand || !newVehicleForm.vehicleModel) {
                        setValidationError("Vehicle Brand and Vehicle Model are required");
                        return;
                      }

                      if (!newVehicleForm.registrationNumber) {
                        setValidationError("Registration Number is required");
                        return;
                      }

                      if (!newVehicleForm.vin) {
                        setValidationError("VIN / Chassis Number is required");
                        return;
                      }

                      if (!validateVIN(newVehicleForm.vin)) {
                        setValidationError("Invalid VIN format. VIN must be exactly 17 alphanumeric characters (excluding I, O, Q)");
                        return;
                      }

                      // Validate insurance dates if provided and hasInsurance is checked
                      if (hasInsurance && newVehicleForm.insuranceStartDate && newVehicleForm.insuranceEndDate) {
                        const startDate = new Date(newVehicleForm.insuranceStartDate);
                        const endDate = new Date(newVehicleForm.insuranceEndDate);
                        if (endDate <= startDate) {
                          setValidationError("Insurance end date must be after start date");
                          return;
                        }
                      }

                      setValidationError("");

                      // Create a new vehicle object
                      const newVehicle: Vehicle = {
                        id: Date.now(), // Temporary ID
                        customerId: selectedCustomer.id,
                        customerNumber: selectedCustomer.customerNumber,
                        phone: selectedCustomer.phone,
                        registration: newVehicleForm.registrationNumber || "",
                        vin: newVehicleForm.vin || "",
                        customerName: selectedCustomer.name,
                        customerEmail: selectedCustomer.email || "",
                        customerAddress: selectedCustomer.address || "",
                        vehicleMake: newVehicleForm.vehicleBrand || "",
                        vehicleModel: newVehicleForm.vehicleModel || "",
                        vehicleYear: newVehicleForm.purchaseDate 
                          ? new Date(newVehicleForm.purchaseDate).getFullYear()
                          : new Date().getFullYear(),
                        vehicleColor: newVehicleForm.vehicleColor || "",
                        lastServiceDate: "",
                        totalServices: 0,
                        totalSpent: "₹0",
                        currentStatus: "Available",
                        activeJobCardId: null,
                        // Additional vehicle details
                        variant: newVehicleForm.variant || undefined,
                        motorNumber: newVehicleForm.motorNumber || undefined,
                        chargerSerialNumber: newVehicleForm.chargerSerialNumber || undefined,
                        purchaseDate: newVehicleForm.purchaseDate || undefined,
                        warrantyStatus: newVehicleForm.warrantyStatus || undefined,
                        insuranceStartDate: hasInsurance ? (newVehicleForm.insuranceStartDate || undefined) : undefined,
                        insuranceEndDate: hasInsurance ? (newVehicleForm.insuranceEndDate || undefined) : undefined,
                        insuranceCompanyName: hasInsurance ? (newVehicleForm.insuranceCompanyName || undefined) : undefined,
                      };

                      // Add vehicle to customer's vehicles array
                      const updatedVehicles = [...(selectedCustomer.vehicles || []), newVehicle];
                      const updatedCustomer: CustomerWithVehicles = {
                        ...selectedCustomer,
                        vehicles: updatedVehicles,
                        totalVehicles: updatedVehicles.length,
                      };

                      // Persist the vehicle to the repository
                      try {
                        await customerService.update(selectedCustomer.id, {
                          vehicles: updatedVehicles,
                          totalVehicles: updatedVehicles.length,
                        });
                      } catch (error) {
                        console.error("Failed to save vehicle:", error);
                        setValidationError("Failed to save vehicle. Please try again.");
                        return;
                      }

                      // Update selected customer
                      setSelectedCustomer(updatedCustomer);
                      setSelectedVehicle(newVehicle);

                      showToast(`Vehicle added successfully! Brand: ${newVehicleForm.vehicleBrand} | Model: ${newVehicleForm.vehicleModel} | Registration: ${newVehicleForm.registrationNumber}`, "success");

                      // Close popup and reset form
                      closeVehicleForm();

                      // If we should open appointment after adding vehicle, do it now
                      if (shouldOpenAppointmentAfterVehicleAdd) {
                        initializeAppointmentForm(updatedCustomer, newVehicle);
                        setShowVehicleDetails(false); // Ensure vehicle details modal is closed
                        setShowScheduleAppointment(true);
                        setShouldOpenAppointmentAfterVehicleAdd(false);
                      }
                    }}
                    className="flex-1"
                  >
                    Add Vehicle
                  </Button>
                </div>
            </div>
          </Modal>
        )}

        {/* Vehicle Details Modal */}
        {showVehicleDetails && selectedVehicle && selectedCustomer && (
          <Modal 
            title="Vehicle Details" 
            subtitle={`${selectedVehicle.vehicleMake} ${selectedVehicle.vehicleModel} (${selectedVehicle.vehicleYear})`}
            onClose={() => {
              setShowVehicleDetails(false);
              setSelectedVehicle(null);
              setServiceHistory([]);
            }}
          >
            <div className="space-y-6">
                {/* Vehicle Information */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                    <Car className="text-indigo-600" size={20} />
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-indigo-600 font-medium">Registration</p>
                      <p className="text-gray-800 font-semibold">{selectedVehicle.registration}</p>
                    </div>
                    <div>
                      <p className="text-indigo-600 font-medium">VIN Number</p>
                      <p className="text-gray-800 font-semibold font-mono text-xs">{selectedVehicle.vin}</p>
                    </div>
                    <div>
                      <p className="text-indigo-600 font-medium">Color</p>
                      <p className="text-gray-800 font-semibold">{selectedVehicle.vehicleColor || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-indigo-600 font-medium">Make</p>
                      <p className="text-gray-800 font-semibold">{selectedVehicle.vehicleMake}</p>
                    </div>
                    <div>
                      <p className="text-indigo-600 font-medium">Model</p>
                      <p className="text-gray-800 font-semibold">{selectedVehicle.vehicleModel}</p>
                    </div>
                    <div>
                      <p className="text-indigo-600 font-medium">Year</p>
                      <p className="text-gray-800 font-semibold">{selectedVehicle.vehicleYear}</p>
                    </div>
                    {selectedVehicle.variant && (
                      <div>
                        <p className="text-indigo-600 font-medium">Variant / Battery Capacity</p>
                        <p className="text-gray-800 font-semibold">{selectedVehicle.variant}</p>
                      </div>
                    )}
                    {selectedVehicle.motorNumber && (
                      <div>
                        <p className="text-indigo-600 font-medium">Motor Number</p>
                        <p className="text-gray-800 font-semibold">{selectedVehicle.motorNumber}</p>
                      </div>
                    )}
                    {selectedVehicle.chargerSerialNumber && (
                      <div>
                        <p className="text-indigo-600 font-medium">Charger Serial Number</p>
                        <p className="text-gray-800 font-semibold">{selectedVehicle.chargerSerialNumber}</p>
                      </div>
                    )}
                    {selectedVehicle.purchaseDate && (
                      <div>
                        <p className="text-indigo-600 font-medium">Date of Purchase</p>
                        <p className="text-gray-800 font-semibold">
                          {new Date(selectedVehicle.purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedVehicle.warrantyStatus && (
                      <div>
                        <p className="text-indigo-600 font-medium">Warranty Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          selectedVehicle.warrantyStatus === "Active"
                            ? "bg-green-100 text-green-700"
                            : selectedVehicle.warrantyStatus === "Expired"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {selectedVehicle.warrantyStatus}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-indigo-600 font-medium">Total Services</p>
                      <p className="text-gray-800 font-semibold">{selectedVehicle.totalServices}</p>
                    </div>
                    <div>
                      <p className="text-indigo-600 font-medium">Total Spent</p>
                      <p className="text-gray-800 font-semibold">{selectedVehicle.totalSpent}</p>
                    </div>
                    <div>
                      <p className="text-indigo-600 font-medium">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        selectedVehicle.currentStatus === "Active Job Card"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {selectedVehicle.currentStatus}
                      </span>
                    </div>
                    {selectedVehicle.lastServiceCenterName && (
                      <div className="sm:col-span-3">
                        <p className="text-indigo-600 font-medium flex items-center gap-1">
                          <Building2 size={14} />
                          Last Service Center
                        </p>
                        <p className="text-gray-800 font-semibold">{selectedVehicle.lastServiceCenterName}</p>
                      </div>
                    )}
                  </div>

                  {/* Insurance Information Section */}
                  {(selectedVehicle.insuranceStartDate || selectedVehicle.insuranceEndDate || selectedVehicle.insuranceCompanyName) && (
                    <div className="mt-6 pt-6 border-t border-indigo-200">
                      <h4 className="text-md font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                        <FileText className="text-indigo-600" size={18} />
                        Insurance Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {selectedVehicle.insuranceStartDate && (
                          <div>
                            <p className="text-indigo-600 font-medium">Insurance Start Date</p>
                            <p className="text-gray-800 font-semibold">
                              {new Date(selectedVehicle.insuranceStartDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {selectedVehicle.insuranceEndDate && (
                          <div>
                            <p className="text-indigo-600 font-medium">Insurance End Date</p>
                            <p className="text-gray-800 font-semibold">
                              {new Date(selectedVehicle.insuranceEndDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {selectedVehicle.insuranceCompanyName && (
                          <div>
                            <p className="text-indigo-600 font-medium">Insurance Company</p>
                            <p className="text-gray-800 font-semibold">{selectedVehicle.insuranceCompanyName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Service History */}
                <div className="bg-white rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <History className="text-purple-600" size={20} />
                      Service History
                    </h3>
                    <Button
                      onClick={() => {
                        // Close vehicle details modal first, then open appointment modal
                        setShowVehicleDetails(false);
                        setShowScheduleAppointment(true);
                        initializeAppointmentForm(selectedCustomer, selectedVehicle);
                      }}
                      variant="success"
                      icon={Calendar}
                    >
                      Schedule Appointment
                    </Button>
                  </div>

                  {serviceHistory.length > 0 ? (
                    <div className="space-y-4">
                      {serviceHistory.map((service) => (
                        <div
                          key={service.id}
                          className="rounded-xl p-5 hover:shadow-md transition"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                  {service.type}
                                </span>
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                  <Calendar size={14} />
                                  {service.date}
                                </span>
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                  <Wrench size={14} />
                                  {service.engineer}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Odometer: {service.odometer}
                              </p>
                              {service.serviceCenterName && (
                                <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                                  <Building2 size={14} />
                                  Service Center: <span className="font-medium">{service.serviceCenterName}</span>
                                </p>
                              )}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-gray-600 font-medium">Feedback Rating:</span>
                                {editingFeedbackRating === service.id ? (
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => {
                                        const currentRating = service.feedbackRating || 0;
                                        return (
                                          <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleUpdateFeedbackRating(service, star)}
                                            className={`text-xl transition-all hover:scale-110 ${
                                              star <= currentRating
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                            title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                                          >
                                            ★
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      ({service.feedbackRating || 0}/5)
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setEditingFeedbackRating(null)}
                                      className="text-gray-400 hover:text-gray-600 transition"
                                      title="Cancel editing"
                                    >
                                      <XIcon size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                          key={star}
                                          className={`text-lg ${
                                            star <= (service.feedbackRating || 0)
                                              ? "text-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      ({service.feedbackRating || 0}/5)
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setEditingFeedbackRating(service.id)}
                                      className="ml-2 text-indigo-600 hover:text-indigo-700 transition flex items-center gap-1 text-xs"
                                      title="Edit feedback rating"
                                    >
                                      <Edit2 size={14} />
                                      <span>Edit</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {service.parts.map((part, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                                  >
                                    {part}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="mt-3 md:mt-0 text-right">
                              <p className="text-sm text-gray-600">Labor: {service.labor}</p>
                              <p className="text-sm text-gray-600">Parts: {service.partsCost}</p>
                              <p className="text-lg font-bold text-gray-800 mt-1">
                                Total: {service.total}
                              </p>
                            <div className="mt-3 md:mt-0 text-right flex justify-end">
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={FileText}
                                onClick={() => handleOpenServiceInvoice(service)}
                                title={`Open invoice ${service.invoice}`}
                                className="whitespace-nowrap"
                              >
                                View Invoice
                              </Button>
                            </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No service history found</p>
                  )}
                  {/* Post-Service Survey fields are now handled by SharedAppointmentForm component */}
                </div>
            </div>
          </Modal>
        )}

        {/* Schedule Appointment Modal */}
        {showScheduleAppointment && selectedCustomer && !showVehicleDetails && (
          <Modal title="Schedule Appointment" onClose={closeAppointmentForm} maxWidth="max-w-3xl">
            <div className="p-6 space-y-6">
                {canAccessCustomerType && (
                  <CustomerInfoCard customer={selectedCustomer} title="Customer Information (Pre-filled)" />
                )}

                {/* Vehicle Information - Right after Customer Details */}
                {selectedVehicle && canAccessVehicleInfo && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Car className="text-indigo-600" size={20} />
                      Vehicle Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        label="Vehicle Brand"
                        value={selectedVehicle.vehicleMake}
                        onChange={() => {}}
                        readOnly
                      />
                      <FormInput
                        label="Vehicle Model"
                        value={selectedVehicle.vehicleModel}
                        onChange={() => {}}
                        readOnly
                      />
                      <FormInput
                        label="Registration Number"
                        value={selectedVehicle.registration || ""}
                        onChange={() => {}}
                        readOnly
                      />
                      <FormInput
                        label="VIN / Chassis Number"
                        value={selectedVehicle.vin}
                        onChange={() => {}}
                        readOnly
                        className="font-mono"
                      />
                      <FormInput
                        label="Year of Manufacture"
                        value={selectedVehicle.vehicleYear?.toString() || ""}
                        onChange={() => {}}
                        readOnly
                      />
                      {selectedVehicle.vehicleColor && (
                        <FormInput
                          label="Vehicle Color"
                          value={selectedVehicle.vehicleColor}
                          onChange={() => {}}
                          readOnly
                        />
                      )}
                      {selectedVehicle.variant && (
                        <FormInput
                          label="Variant / Battery Capacity"
                          value={selectedVehicle.variant}
                          onChange={() => {}}
                          readOnly
                        />
                      )}
                      {selectedVehicle.motorNumber && (
                        <FormInput
                          label="Motor Number"
                          value={selectedVehicle.motorNumber}
                          onChange={() => {}}
                          readOnly
                        />
                      )}
                      {selectedVehicle.chargerSerialNumber && (
                        <FormInput
                          label="Charger Serial Number"
                          value={selectedVehicle.chargerSerialNumber}
                          onChange={() => {}}
                          readOnly
                        />
                      )}
                      {selectedVehicle.purchaseDate && (
                        <FormInput
                          label="Date of Purchase"
                          value={new Date(selectedVehicle.purchaseDate).toLocaleDateString()}
                          onChange={() => {}}
                          readOnly
                        />
                      )}
                      {selectedVehicle.warrantyStatus && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Warranty Status</label>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            selectedVehicle.warrantyStatus === "Active"
                              ? "bg-green-100 text-green-700"
                              : selectedVehicle.warrantyStatus === "Expired"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {selectedVehicle.warrantyStatus}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Insurance Information Section */}
                    {(selectedVehicle.insuranceStartDate || selectedVehicle.insuranceEndDate || selectedVehicle.insuranceCompanyName) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FileText className="text-indigo-600" size={18} />
                          Insurance Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedVehicle.insuranceStartDate && (
                            <FormInput
                              label="Insurance Start Date"
                              value={new Date(selectedVehicle.insuranceStartDate).toLocaleDateString()}
                              onChange={() => {}}
                              readOnly
                            />
                          )}
                          {selectedVehicle.insuranceEndDate && (
                            <FormInput
                              label="Insurance End Date"
                              value={new Date(selectedVehicle.insuranceEndDate).toLocaleDateString()}
                              onChange={() => {}}
                              readOnly
                            />
                          )}
                          {selectedVehicle.insuranceCompanyName && (
                            <FormInput
                              label="Insurance Company Name"
                              value={selectedVehicle.insuranceCompanyName}
                              onChange={() => {}}
                              readOnly
                            />
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Appointment Form - Using Shared Component */}
                <AppointmentForm
                  initialData={appointmentForm}
                  onSubmit={(form) => {
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
                        customerType: selectedCustomer.customerType,
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
                      };

                      // Get existing appointments from localStorage
                      const existingAppointments = safeStorage.getItem<Array<any>>("appointments", []);

                      // Create new appointment
                      const newAppointment = {
                        id: existingAppointments.length > 0 
                          ? Math.max(...existingAppointments.map((a) => a.id)) + 1 
                          : 1,
                        ...appointmentData,
                      };

                      // Save to localStorage
                      const updatedAppointments = [...existingAppointments, newAppointment];
                      safeStorage.setItem("appointments", updatedAppointments);

                      // Clean up file URLs
                    if (form.customerIdProof?.urls) {
                      form.customerIdProof.urls.forEach((url) => URL.revokeObjectURL(url));
                      }
                    if (form.vehicleRCCopy?.urls) {
                      form.vehicleRCCopy.urls.forEach((url) => URL.revokeObjectURL(url));
                      }
                    if (form.warrantyCardServiceBook?.urls) {
                      form.warrantyCardServiceBook.urls.forEach((url) => URL.revokeObjectURL(url));
                      }
                    if (form.photosVideos?.urls) {
                      form.photosVideos.urls.forEach((url) => URL.revokeObjectURL(url));
                      }

                    showToast(`Appointment scheduled successfully! Customer: ${form.customerName} | Vehicle: ${form.vehicle} | Service: ${form.serviceType} | Date: ${form.date} | Time: ${formatTime(form.time)}`, "success");

                      // Close modal and reset form
                      closeAppointmentForm();
                    }}
                  onCancel={closeAppointmentForm}
                  mode="create"
                  customerInfo={selectedCustomer}
                  vehicleInfo={selectedVehicle || undefined}
                  onVehicleChange={(vehicle) => {
                    setSelectedVehicle(vehicle);
                  }}
                />
            </div>
          </Modal>
        )}

        {/* Complaints Modal */}
        {showComplaints && selectedCustomer && (
          <Modal 
            title="Customer Complaints" 
            subtitle={`${selectedCustomer.name} - ${selectedCustomer.customerNumber}`}
            onClose={() => setShowComplaints(false)}
          >
            <div className="space-y-4">
                {(() => {
                  const vehicleName = selectedCustomer.vehicles?.[0] 
                    ? `${selectedCustomer.vehicles[0].vehicleMake} ${selectedCustomer.vehicles[0].vehicleModel}`
                    : "N/A";
                  const mockComplaints = getMockComplaints(selectedCustomer.name, selectedCustomer.phone, vehicleName);

                  return mockComplaints.length > 0 ? (
                    <div className="space-y-4">
                      {mockComplaints.map((complaint) => (
                        <div
                          key={complaint.id}
                          className="rounded-xl p-5 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                complaint.severity === "High" || complaint.severity === "Critical"
                                  ? "bg-red-100"
                                  : complaint.severity === "Medium"
                                  ? "bg-amber-100"
                                  : "bg-blue-100"
                              }`}>
                                <AlertTriangle 
                                  className={
                                    complaint.severity === "High" || complaint.severity === "Critical"
                                      ? "text-red-600"
                                      : complaint.severity === "Medium"
                                      ? "text-amber-600"
                                      : "text-blue-600"
                                  } 
                                  size={20} 
                                  strokeWidth={2} 
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">{complaint.id}</span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    complaint.status === "Open"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : complaint.status === "Resolved"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}>
                                    {complaint.status}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    complaint.severity === "High" || complaint.severity === "Critical"
                                      ? "bg-red-50 text-red-700"
                                      : complaint.severity === "Medium"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-blue-50 text-blue-700"
                                  }`}>
                                    {complaint.severity}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {complaint.date} • {complaint.vehicle}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="ml-12">
                            <p className="text-sm text-gray-700 leading-relaxed">{complaint.complaint}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <CheckCircle className="text-gray-400" size={32} strokeWidth={2} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No Complaints Found</h3>
                      <p className="text-gray-600">
                        This customer has no complaints registered.
                      </p>
                    </div>
                  );
                })()}
            </div>
          </Modal>
        )}

        {showServiceCenterSelector && (
          <div className="fixed inset-0 z-[12000] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Choose Service Center</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowServiceCenterSelector(false);
                    setServiceCenterSearch("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                  aria-label="Close service center selector"
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
                          assignedServiceCenter: center.name,
                        }));
                        setShowServiceCenterSelector(false);
                        setServiceCenterSearch("");
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
    </div>
  );
}

