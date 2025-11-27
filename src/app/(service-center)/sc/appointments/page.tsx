"use client";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, Clock, User, Car, PlusCircle, X, Edit, Phone, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { useCustomerSearch } from "../../../../hooks/api";
import { useRole } from "@/shared/hooks";
import type { CustomerWithVehicles, Vehicle } from "@/shared/types";

// ==================== Types ====================
interface Appointment {
  id: number;
  customerName: string;
  vehicle: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  duration: string;
  status: string;
}

interface AppointmentForm {
  customerName: string;
  vehicle: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  duration: string;
}

type ToastType = "success" | "error";
type AppointmentStatus = "Confirmed" | "Pending" | "Cancelled";

// ==================== Constants ====================
const INITIAL_APPOINTMENT_FORM: AppointmentForm = {
  customerName: "",
  vehicle: "",
  phone: "",
  serviceType: "",
  date: new Date().toISOString().split("T")[0],
  time: "",
  duration: "2",
};

const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    customerName: "Rajesh Kumar",
    vehicle: "Honda City",
    phone: "9876543210",
    serviceType: "Routine Maintenance",
    date: "2025-01-20",
    time: "10:00 AM",
    duration: "2 hours",
    status: "Confirmed",
  },
  {
    id: 2,
    customerName: "Priya Sharma",
    vehicle: "Maruti Swift",
    phone: "9876543211",
    serviceType: "AC Repair",
    date: "2025-01-20",
    time: "2:00 PM",
    duration: "3 hours",
    status: "Confirmed",
  },
];

const SERVICE_TYPES = [
  "Routine Maintenance",
  "AC Repair",
  "Oil Change",
  "Battery Replacement",
  "Tire Service",
  "Brake Service",
  "Other",
] as const;

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

const getStatusBadgeClass = (status: string): string => {
  const config = STATUS_CONFIG[status as AppointmentStatus] || { bg: "bg-gray-100", text: "text-gray-800" };
  return `px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`;
};

const validateAppointmentForm = (form: AppointmentForm): string | null => {
  if (!form.customerName || !form.phone || !form.vehicle || !form.serviceType || !form.date || !form.time) {
    return "Please fill in all required fields.";
  }
  if (!/^\d{10}$/.test(form.phone)) {
    return "Please enter a valid 10-digit phone number.";
  }
  return null;
};

const getNextAppointmentId = (appointments: Appointment[]): number => {
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
const countAppointmentsForDate = (appointments: Appointment[], date: string): number => {
  return appointments.filter((apt) => apt.date === date).length;
};

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
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-[100] p-4">
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

// ==================== Main Component ====================
export default function Appointments() {
  const { userInfo } = useRole();
  const serviceCenterName = userInfo?.serviceCenter;

  // State Management
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    if (typeof window !== "undefined") {
      const storedAppointments = safeStorage.getItem<Appointment[]>("appointments", []);
      return storedAppointments.length > 0 ? storedAppointments : DEFAULT_APPOINTMENTS;
    }
    return DEFAULT_APPOINTMENTS;
  });

  const [appointmentForm, setAppointmentForm] = useState<AppointmentForm>(INITIAL_APPOINTMENT_FORM);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithVehicles | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Modal States
  const [showAppointmentModal, setShowAppointmentModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState<boolean>(false);

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
  const {
    results: customerSearchResults,
    loading: customerSearchLoading,
    search: searchCustomer,
    clear: clearCustomerSearch,
  } = useCustomerSearch();

  // ==================== Helper Functions ====================
  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, TOAST_DURATION);
  }, []);

  const resetAppointmentForm = useCallback(() => {
    setAppointmentForm(INITIAL_APPOINTMENT_FORM);
    setCustomerSearchQuery("");
    setSelectedCustomer(null);
    setShowCustomerDropdown(false);
    clearCustomerSearch();
  }, [clearCustomerSearch]);

  const closeAppointmentModal = useCallback(() => {
    setShowAppointmentModal(false);
    setIsEditing(false);
    setSelectedAppointment(null);
    resetAppointmentForm();
  }, [resetAppointmentForm]);

  const closeDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedAppointment(null);
  }, []);

  const closeVehicleDetailsModal = useCallback(() => {
    setShowVehicleDetails(false);
    setSelectedVehicle(null);
    clearCustomerSearch();
  }, [clearCustomerSearch]);

  // ==================== Event Handlers ====================
  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
    setIsEditing(false);
  }, []);

  const handleEditAppointment = useCallback(
    (appointment: Appointment) => {
      setSelectedAppointment(appointment);
      setIsEditing(true);
      setAppointmentForm({
        customerName: appointment.customerName,
        vehicle: appointment.vehicle,
        phone: appointment.phone,
        serviceType: appointment.serviceType,
        date: appointment.date,
        time: appointment.time,
        duration: "2",
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
    [searchCustomer, clearCustomerSearch]
  );

  const handleCustomerSelect = useCallback(
    (customer: CustomerWithVehicles) => {
      setSelectedCustomer(customer);
      setCustomerSearchQuery(customer.name);
      setShowCustomerDropdown(false);
      clearCustomerSearch();

      const firstVehicle =
        customer.vehicles && customer.vehicles.length > 0 ? formatVehicleString(customer.vehicles[0]) : "";

      setAppointmentForm((prev) => ({
        ...prev,
        customerName: customer.name,
        phone: customer.phone,
        vehicle: firstVehicle,
      }));
    },
    [clearCustomerSearch]
  );

  const handleViewVehicleDetails = useCallback(() => {
    if (!selectedAppointment) return;
    searchCustomer(selectedAppointment.phone, "phone");
    setShowVehicleDetails(true);
  }, [selectedAppointment, searchCustomer]);

  const handleSubmitAppointment = useCallback(() => {
    const validationError = validateAppointmentForm(appointmentForm);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    // Check maximum appointments per day limit (only for new appointments)
    if (!isEditing) {
      const maxAppointments = getMaxAppointmentsPerDay(serviceCenterName);
      const appointmentsForDate = countAppointmentsForDate(appointments, appointmentForm.date);
      
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
          appointments.filter((apt) => apt.id !== selectedAppointment.id),
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

      const updatedAppointments = appointments.map((apt) =>
        apt.id === selectedAppointment.id
          ? {
              ...apt,
              ...appointmentForm,
              duration: "2 hours",
            }
          : apt
      );
      setAppointments(updatedAppointments);
      safeStorage.setItem("appointments", updatedAppointments);
      showToast("Appointment updated successfully!", "success");
    } else {
      const newAppointment: Appointment = {
        id: getNextAppointmentId(appointments),
        ...appointmentForm,
        duration: "2 hours",
        status: "Confirmed",
      };
      const updatedAppointments = [...appointments, newAppointment];
      setAppointments(updatedAppointments);
      safeStorage.setItem("appointments", updatedAppointments);
      showToast("Appointment scheduled successfully!", "success");
    }

    closeAppointmentModal();
  }, [appointmentForm, isEditing, selectedAppointment, appointments, serviceCenterName, showToast, closeAppointmentModal]);

  const handleOpenNewAppointment = useCallback(() => {
    setShowAppointmentModal(true);
    resetAppointmentForm();
  }, [resetAppointmentForm]);

  // ==================== Effects ====================
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };

    if (showCustomerDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCustomerDropdown]);

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
          <button
            onClick={handleOpenNewAppointment}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
          >
            <PlusCircle size={20} />
            New Appointment
          </button>
        </div>

        {/* Appointments Grid */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No appointments scheduled</p>
              <p className="text-gray-400 text-sm mt-2">Click &quot;New Appointment&quot; to schedule one</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {appointments.map((apt) => (
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      <Modal show={showAppointmentModal} onClose={closeAppointmentModal} title={isEditing ? "Edit Appointment" : "New Appointment"}>
        <div className="space-y-4">
          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative" ref={customerDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearchQuery}
                    onChange={(e) => handleCustomerSearchChange(e.target.value)}
                    onFocus={() => {
                      if (customerSearchQuery.trim().length >= 2 && customerSearchResults.length > 0) {
                        setShowCustomerDropdown(true);
                      }
                    }}
                    placeholder="Start typing customer name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                  {showCustomerDropdown && customerSearchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {customerSearchResults.map((customer) => (
                        <div
                          key={customer.id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-blue-100">
                              <User className="text-blue-600" size={16} strokeWidth={2} />
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
                              </div>
                            </div>
                            {selectedCustomer?.id === customer.id && (
                              <CheckCircle className="text-blue-600 shrink-0" size={18} strokeWidth={2} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {customerSearchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
                  value={appointmentForm.phone}
                  onChange={(e) =>
                    setAppointmentForm({ ...appointmentForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                  }
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle <span className="text-red-500">*</span>
                </label>
                {selectedCustomer && selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 ? (
                  <select
                    value={appointmentForm.vehicle}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, vehicle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {selectedCustomer.vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={formatVehicleString(vehicle)}>
                        {formatVehicleString(vehicle)} - {vehicle.registration}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={appointmentForm.vehicle}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, vehicle: e.target.value })}
                    placeholder={selectedCustomer ? "No vehicles found for this customer" : "Select a customer first"}
                    disabled={!selectedCustomer}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                )}
              </div>
            </div>

            {/* Selected Customer Info Display */}
            {selectedCustomer && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Selected Customer Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-blue-600 font-medium">Customer Number</p>
                    <p className="text-gray-800 font-semibold">{selectedCustomer.customerNumber}</p>
                  </div>
                  {selectedCustomer.email && (
                    <div>
                      <p className="text-blue-600 font-medium">Email</p>
                      <p className="text-gray-800 font-semibold">{selectedCustomer.email}</p>
                    </div>
                  )}
                  {selectedCustomer.address && (
                    <div className="sm:col-span-2">
                      <p className="text-blue-600 font-medium">Address</p>
                      <p className="text-gray-800 font-semibold">{selectedCustomer.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Appointment Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={appointmentForm.serviceType}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, serviceType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select service type</option>
                  {SERVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={appointmentForm.date}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                {appointmentForm.date && (
                  <div className="mt-2 text-xs">
                    {(() => {
                      const maxAppointments = getMaxAppointmentsPerDay(serviceCenterName);
                      const currentCount = countAppointmentsForDate(
                        isEditing && selectedAppointment
                          ? appointments.filter((apt) => apt.id !== selectedAppointment.id)
                          : appointments,
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={appointmentForm.time}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

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
      <Modal show={showDetailModal} onClose={closeDetailModal} title="Appointment Details">
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} />
                Customer Information
              </h3>
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
                <div>
                  <p className="text-sm text-gray-500 mb-1">Vehicle</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <Car size={14} />
                    {selectedAppointment.vehicle}
                  </p>
                </div>
              </div>
            </div>

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
    </div>
  );
}
