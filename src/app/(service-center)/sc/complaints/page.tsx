"use client";
import { useState, useCallback, useEffect } from "react";
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
} from "lucide-react";
import { defaultComplaints, type Complaint } from "@/__mocks__/data/complaints.mock";
import { useCustomerSearch } from "../../../../hooks/api";
import type { CustomerWithVehicles } from "@/shared/types";
import { getMockServiceHistory } from "@/__mocks__/data/customer-service-history.mock";

type FilterType = "all" | "open" | "resolved" | "closed";

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
    className="fixed inset-0 backdrop-blur-md bg-black/10 flex items-start justify-center z-9999 p-4 pt-8"
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
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithVehicles | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState<boolean>(false);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState<boolean>(false);
  const [resolutionNote, setResolutionNote] = useState<string>("");
  const [isResolving, setIsResolving] = useState<boolean>(false);

  // Use mock data from __mocks__ folder
  const complaints: Complaint[] = defaultComplaints;

  // Customer search hook
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
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Complaints</h1>
          <p className="text-gray-500">Manage and resolve customer complaints</p>
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
      </div>
    </div>
  );
}

