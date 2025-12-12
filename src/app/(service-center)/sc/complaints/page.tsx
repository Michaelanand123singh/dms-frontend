"use client";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  AlertCircle,
  Search,
  Filter,
  Eye,
  CheckCircle,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Calendar,
  AlertTriangle,
  History,
  Wrench,
  FileText,
  Clock,
  Building2,
} from "lucide-react";
import { defaultComplaints, type Complaint } from "@/__mocks__/data/complaints.mock";
import { useCustomerSearch } from "../../../../hooks/api";
import type { CustomerWithVehicles } from "@/shared/types";
import { getMockServiceHistory } from "@/__mocks__/data/customer-service-history.mock";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { defaultServiceCenters } from "@/__mocks__/data/service-centers.mock";
import { useRole } from "@/shared/hooks";
import { formatVehicleString } from "../components/shared/vehicle-utils";
import { findNearestServiceCenter } from "../components/appointment/types";

type FilterType = "all" | "open" | "resolved" | "closed";

interface ComplaintForm {
  customerName: string;
  vehicle: string;
  phone: string;
  complaint: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  serviceCenterId?: number;
}

const INITIAL_COMPLAINT_FORM: ComplaintForm = {
  customerName: "",
  vehicle: "",
  phone: "",
  complaint: "",
  severity: "Medium",
  serviceCenterId: undefined,
};

// Reusable Modal Component
const Modal = ({
  title,
  onClose,
  children,
  subtitle,
  maxWidth = "max-w-6xl",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  subtitle?: string;
  maxWidth?: string;
}) => (
  <div
    className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999] p-4 pt-8"
    style={{ animation: "fadeIn 0.2s ease-out" }}
  >
    <div
      className={`bg-white rounded-2xl shadow-xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto`}
      style={{ animation: "slideDownFromTop 0.3s ease-out" }}
    >
      <div className="sticky top-0 bg-white p-6 flex items-center justify-between rounded-t-2xl z-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
        >
          <X size={24} strokeWidth={2} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// Customer Info Card Component
const CustomerInfoCard = ({
  customer,
  title = "Customer Information",
}: {
  customer: CustomerWithVehicles;
  title?: string;
}) => (
  <div className="bg-indigo-50 rounded-lg p-4">
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
    </div>
  </div>
);

// Info Card Component
const InfoCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string | React.ReactNode;
}) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="p-2 rounded-lg bg-indigo-100">
      <Icon className="text-indigo-600" size={18} strokeWidth={2} />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
    </div>
  </div>
);

// Button Component
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
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  [key: string]: any;
}) => {
  const baseClasses =
    "rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2";
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
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? "opacity-50 cursor-not-allowed disabled:active:scale-100" : ""
      } ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === "sm" ? 16 : 18} strokeWidth={2} />}
      {children}
    </button>
  );
};

export default function Complaints() {
  const { userRole } = useRole();
  const isCallCenter = userRole === "call_center";

  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithVehicles | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState<boolean>(false);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState<boolean>(false);
  const [resolutionNote, setResolutionNote] = useState<string>("");
  const [isResolving, setIsResolving] = useState<boolean>(false);

  // Complaint creation form states
  const [showComplaintModal, setShowComplaintModal] = useState<boolean>(false);
  const [complaintForm, setComplaintForm] = useState<ComplaintForm>(INITIAL_COMPLAINT_FORM);
  const [complaintCustomerSearchQuery, setComplaintCustomerSearchQuery] = useState<string>("");
  const [showComplaintCustomerDropdown, setShowComplaintCustomerDropdown] = useState<boolean>(false);
  const [selectedComplaintCustomer, setSelectedComplaintCustomer] = useState<CustomerWithVehicles | null>(null);
  const complaintCustomerDropdownRef = useRef<HTMLDivElement>(null);

  // Service centers for complaint assignment
  const [availableServiceCenters] = useState(() => {
    return defaultServiceCenters.filter((sc) => sc.status === "Active");
  });

  // Load complaints from storage or use default
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    if (typeof window !== "undefined") {
      const storedComplaints = safeStorage.getItem<Complaint[]>("complaints", []);
      return storedComplaints.length > 0 ? storedComplaints : defaultComplaints;
    }
    return defaultComplaints;
  });

  // Customer search hook for complaint form
  const customerSearch = useCustomerSearch();
  const customerSearchResults: CustomerWithVehicles[] = customerSearch.results as CustomerWithVehicles[];
  const typedCustomerSearchResults = customerSearchResults as CustomerWithVehicles[];
  const customerSearchLoading = customerSearch.loading;
  const searchCustomer = customerSearch.search;
  const clearCustomerSearch = customerSearch.clear;

  // Customer search hook for complaint resolution
  const { results: searchResults, loading: searchLoading, search: performSearch, clear: clearSearch } =
    useCustomerSearch();

  // Handle complaint click
  const handleComplaintClick = useCallback(
    async (complaint: Complaint) => {
      setSelectedComplaint(complaint);
      setShowCustomerDetails(true);
      setSelectedCustomer(null);
      setResolutionNote("");

      // Search for customer by phone
      if (complaint.phone) {
        await performSearch(complaint.phone, "phone");
      }
    },
    [performSearch]
  );

  // When search results are available, select the first customer
  useEffect(() => {
    if (searchResults.length > 0 && selectedComplaint && !selectedCustomer) {
      // Use requestAnimationFrame to make state update asynchronous
      const rafId = requestAnimationFrame(() => {
        setSelectedCustomer(searchResults[0]);
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [searchResults, selectedComplaint, selectedCustomer]);

  // Complaint form handlers
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
      alert("Please fill in all required fields.");
      return;
    }

    if (!/^\d{10}$/.test(complaintForm.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (isCallCenter && !complaintForm.serviceCenterId) {
      alert("Please select a service center to assign this complaint.");
      return;
    }

    // Get service center name if service center is selected
    const selectedServiceCenter = complaintForm.serviceCenterId
      ? availableServiceCenters.find((sc) => sc.id === complaintForm.serviceCenterId)
      : null;

    // Generate complaint ID
    const maxId = complaints.length > 0 
      ? Math.max(...complaints.map((c) => {
          const numId = parseInt(c.id.replace("COMP-", ""), 10);
          return isNaN(numId) ? 0 : numId;
        }))
      : 0;
    const newId = `COMP-${String(maxId + 1).padStart(3, "0")}`;

    const newComplaint: Complaint = {
      id: newId,
      customerName: complaintForm.customerName,
      vehicle: complaintForm.vehicle,
      phone: complaintForm.phone,
      complaint: complaintForm.complaint,
      severity: complaintForm.severity,
      status: "Open",
      date: new Date().toISOString().split("T")[0],
      serviceCenterId: complaintForm.serviceCenterId?.toString(),
      serviceCenterName: selectedServiceCenter?.name,
    };

    const updatedComplaints = [...complaints, newComplaint];
    setComplaints(updatedComplaints);
    safeStorage.setItem("complaints", updatedComplaints);

    const successMessage = selectedServiceCenter
      ? `Complaint created successfully and assigned to ${selectedServiceCenter.name}!`
      : "Complaint created successfully!";
    alert(successMessage);

    closeComplaintModal();
  }, [complaintForm, complaints, isCallCenter, availableServiceCenters, closeComplaintModal]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (complaintCustomerDropdownRef.current && !complaintCustomerDropdownRef.current.contains(event.target as Node)) {
        setShowComplaintCustomerDropdown(false);
      }
    };

    if (showComplaintCustomerDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showComplaintCustomerDropdown]);

  // Handle complaint resolution
  const handleResolveComplaint = useCallback(async () => {
    if (!selectedComplaint || !resolutionNote.trim()) {
      alert("Please enter a resolution note");
      return;
    }

    setIsResolving(true);
    // TODO: Call API to resolve complaint
    // For now, simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsResolving(false);
    alert(`Complaint ${selectedComplaint.id} has been resolved successfully!`);
    setShowCustomerDetails(false);
    setSelectedComplaint(null);
    setSelectedCustomer(null);
    setResolutionNote("");
    clearSearch();
  }, [selectedComplaint, resolutionNote, clearSearch]);

  // Filter complaints
  const filteredComplaints =
    filter === "all"
      ? complaints
      : complaints.filter((c) => c.status.toLowerCase() === filter);

  return (
    <div className="bg-[#f9f9fb] min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Complaints</h1>
              <p className="text-gray-500">Manage and resolve customer complaints</p>
            </div>
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
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {(["all", "open", "resolved", "closed"] as FilterType[]).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filter === filterType
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints List */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          {filteredComplaints.length > 0 ? (
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  onClick={() => handleComplaintClick(complaint)}
                  className="rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          complaint.severity === "High" || complaint.severity === "Critical"
                            ? "bg-red-100"
                            : complaint.severity === "Medium"
                            ? "bg-amber-100"
                            : "bg-blue-100"
                        }`}
                      >
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
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              complaint.status === "Open"
                                ? "bg-yellow-100 text-yellow-700"
                                : complaint.status === "Resolved"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {complaint.status}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              complaint.severity === "High" || complaint.severity === "Critical"
                                ? "bg-red-50 text-red-700"
                                : complaint.severity === "Medium"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {complaint.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {complaint.customerName} • {complaint.phone} • {complaint.date}
                        </p>
                      </div>
                    </div>
                    <Eye
                      className="text-gray-400 group-hover:text-indigo-600 transition-colors shrink-0"
                      size={20}
                      strokeWidth={2}
                    />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed ml-12">{complaint.complaint}</p>
                  <p className="text-xs text-gray-500 mt-2 ml-12">
                    Vehicle: {complaint.vehicle}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Complaints Found</h3>
              <p className="text-gray-600">No complaints match the selected filter.</p>
            </div>
          )}
        </div>

        {/* Customer Details Modal for Complaint Resolution */}
        {showCustomerDetails && selectedComplaint && (
          <Modal
            title={`Resolve Complaint: ${selectedComplaint.id}`}
            subtitle={`Customer: ${selectedComplaint.customerName} • ${selectedComplaint.phone}`}
            onClose={() => {
              setShowCustomerDetails(false);
              setSelectedComplaint(null);
              setSelectedCustomer(null);
              setResolutionNote("");
              clearSearch();
            }}
            maxWidth="max-w-6xl"
          >
            <div className="space-y-6">
              {/* Complaint Details */}
              <div className="bg-amber-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="text-amber-600" size={18} />
                  Complaint Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-amber-800">Status:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedComplaint.status === "Open"
                          ? "bg-yellow-100 text-yellow-700"
                          : selectedComplaint.status === "Resolved"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedComplaint.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-amber-800">Severity:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedComplaint.severity === "High" || selectedComplaint.severity === "Critical"
                          ? "bg-red-50 text-red-700"
                          : selectedComplaint.severity === "Medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {selectedComplaint.severity}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-amber-800">Complaint:</span>
                    <p className="text-gray-800 mt-1">{selectedComplaint.complaint}</p>
                  </div>
                  <div>
                    <span className="font-medium text-amber-800">Date:</span>
                    <span className="text-gray-800 ml-2">{selectedComplaint.date}</span>
                  </div>
                  <div>
                    <span className="font-medium text-amber-800">Vehicle:</span>
                    <span className="text-gray-800 ml-2">{selectedComplaint.vehicle}</span>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {searchLoading && !selectedCustomer && (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading customer data...</p>
                </div>
              )}

              {/* Customer Not Found */}
              {!searchLoading && searchResults.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Customer Not Found</h3>
                  <p className="text-gray-600">
                    Could not find customer with phone number: {selectedComplaint.phone}
                  </p>
                </div>
              )}

              {/* Customer Details */}
              {selectedCustomer && (
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
                          <p className="text-sm text-gray-600 font-medium mt-0.5">
                            Customer #{selectedCustomer.customerNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <InfoCard icon={Phone} label="Phone" value={selectedCustomer.phone} />
                      {selectedCustomer.email && (
                        <InfoCard icon={Mail} label="Email" value={selectedCustomer.email} />
                      )}
                      {selectedCustomer.address && (
                        <InfoCard
                          icon={MapPin}
                          label="Address"
                          value={<span className="line-clamp-1">{selectedCustomer.address}</span>}
                        />
                      )}
                      <InfoCard
                        icon={Calendar}
                        label="Member Since"
                        value={new Date(selectedCustomer.createdAt).toLocaleDateString()}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedCustomer.totalVehicles || 0}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Total Vehicles</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {selectedCustomer.totalSpent || "₹0"}
                        </p>
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
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    setSelectedVehicle(vehicle);
                                    setShowVehicleDetails(true);
                                    setServiceHistory(getMockServiceHistory(vehicle.id));
                                  }}
                                  size="sm"
                                  icon={FileText}
                                  className="px-4 py-2"
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resolution Section */}
                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={20} />
                      Resolve Complaint
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Resolution Note <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          rows={4}
                          placeholder="Enter details about how the complaint was resolved..."
                          className="w-full px-4 py-2.5 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-gray-900 transition-all duration-200 resize-none"
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={() => {
                            setShowCustomerDetails(false);
                            setSelectedComplaint(null);
                            setSelectedCustomer(null);
                            setResolutionNote("");
                            clearSearch();
                          }}
                          variant="secondary"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleResolveComplaint}
                          disabled={isResolving || !resolutionNote.trim()}
                          variant="success"
                          className="flex-1"
                          icon={CheckCircle}
                        >
                          {isResolving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Resolving...
                            </>
                          ) : (
                            "Mark as Resolved"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                    <p className="text-gray-800 font-semibold">{selectedVehicle.vehicleColor}</p>
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
                </div>
              </div>

              {/* Service History */}
              <div className="bg-white rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <History className="text-purple-600" size={20} />
                  Service History
                </h3>

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
                            <p className="text-sm text-gray-600 mb-2">Odometer: {service.odometer}</p>
                            <div className="flex flex-wrap gap-2">
                              {service.parts.map((part: string, idx: number) => (
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
                            <p className="text-lg font-bold text-gray-800 mt-1">Total: {service.total}</p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 justify-end">
                              <FileText size={12} />
                              Invoice: {service.invoice}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No service history found</p>
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* Create Complaint Modal */}
        {isCallCenter && showComplaintModal && (
          <Modal
            title="Create Complaint"
            onClose={closeComplaintModal}
            maxWidth="max-w-2xl"
          >
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
      </div>
    </div>
  );
}

