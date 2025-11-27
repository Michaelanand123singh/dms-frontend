"use client";
import { useState, useCallback } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { useRole } from "@/shared/hooks";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import {
  useCustomerSearch,
  useCreateCustomer,
  useRecentCustomers,
} from "../../../../hooks/api";
import type {
  CustomerSearchType,
  CustomerWithVehicles,
  NewCustomerForm,
  ServiceType,
  Vehicle,
  ServiceHistoryItem,
  CustomerType,
  NewVehicleForm,
} from "@/shared/types";

// Initial form states (constants for reuse)
const initialCustomerForm: NewCustomerForm = {
  name: "",
  phone: "",
  alternateMobile: "",
  email: "",
  address: "",
  cityState: "",
  pincode: "",
  customerType: undefined,
  serviceType: undefined,
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
  vehicleAge: "",
  warrantyStatus: "",
  insuranceStartDate: "",
  insuranceEndDate: "",
  insuranceCompanyName: "",
};

const initialAppointmentForm = {
  customerName: "",
  phone: "",
  vehicle: "",
  serviceType: "",
  date: new Date().toISOString().split("T")[0],
  time: "",
  duration: "2",
};

export default function CustomerFind() {
  const { userRole } = useRole();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithVehicles | null>(null);
  const [showCreateCustomer, setShowCreateCustomer] = useState<boolean>(false);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showAddVehiclePopup, setShowAddVehiclePopup] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState<boolean>(false);
  const [showScheduleAppointment, setShowScheduleAppointment] = useState<boolean>(false);
  const [showComplaints, setShowComplaints] = useState<boolean>(false);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryItem[]>([]);
  const [validationError, setValidationError] = useState<string>("");
  const [detectedSearchType, setDetectedSearchType] = useState<CustomerSearchType | null>(null);
  
  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string; type?: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });

  // Hooks for data fetching
  const { results: searchResults, loading: searchLoading, search: performSearch, clear: clearSearch } = useCustomerSearch();
  const { loading: createLoading, error: createError, createCustomer } = useCreateCustomer();
  const { customers: recentCustomers, loading: recentLoading } = useRecentCustomers(10);

  // Form state for creating new customer
  const [newCustomerForm, setNewCustomerForm] = useState<NewCustomerForm>(initialCustomerForm);

  // Form state for adding new vehicle
  const [newVehicleForm, setNewVehicleForm] = useState<Partial<NewVehicleForm>>(initialVehicleForm);

  // Form state for scheduling appointment
  const [appointmentForm, setAppointmentForm] = useState(() => ({
    ...initialAppointmentForm,
    date: new Date().toISOString().split("T")[0],
  }));

  // Auto-detect search type based on input
  const detectSearchType = (query: string): CustomerSearchType => {
    const trimmed = query.trim();

    // Check for customer number pattern (CUST-YYYY-XXXX)
    if (/^CUST-\d{4}-\d{4}$/i.test(trimmed)) {
      return "customerNumber";
    }

    // Check for VIN (typically 17 alphanumeric characters)
    if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(trimmed)) {
      return "vin";
    }

    // Check for vehicle registration (typically 2 letters, 2 digits, 2 letters, 4 digits)
    if (/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/i.test(trimmed)) {
      return "vehicleNumber";
    }

    // Check for email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return "email";
    }

    // Check for phone (10 digits, with or without country code)
    const cleanedPhone = trimmed.replace(/[\s-+]/g, "").replace(/^91/, "");
    if (/^\d{10}$/.test(cleanedPhone)) {
      return "phone";
    }

    // Default to name search
    return "name";
  };

  // Handle search input change
  const handleSearchInputChange = useCallback((value: string): void => {
    setSearchQuery(value);
    setValidationError("");
    setSelectedCustomer(null);
    setShowCreateCustomer(false);

    if (value.trim().length >= 2) {
      const searchType = detectSearchType(value);
      setDetectedSearchType(searchType);
      performSearch(value, searchType);
    } else {
      clearSearch();
      setDetectedSearchType(null);
    }
  }, [performSearch, clearSearch]);

  // Handle search execution
  const handleSearch = useCallback((): void => {
    if (!searchQuery.trim()) {
      setValidationError("Please enter a search query");
      return;
    }

    const searchType = detectSearchType(searchQuery);
    performSearch(searchQuery, searchType);
  }, [searchQuery, performSearch]);

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
    setNewCustomerForm({ ...initialCustomerForm });
  }, []);

  const resetVehicleForm = useCallback(() => {
    setNewVehicleForm({ ...initialVehicleForm });
  }, []);

  const resetAppointmentForm = useCallback(() => {
    setAppointmentForm({ ...initialAppointmentForm, date: new Date().toISOString().split("T")[0] });
  }, []);

  // Helper to initialize appointment form with customer and vehicle data
  const initializeAppointmentForm = useCallback((customer: CustomerWithVehicles, vehicle: Vehicle) => {
    setAppointmentForm({
      customerName: customer.name,
      phone: customer.phone,
      vehicle: `${vehicle.vehicleMake} ${vehicle.vehicleModel} (${vehicle.vehicleYear})`,
      serviceType: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      duration: "2",
    });
  }, []);

  // Modal close handlers
  const closeCustomerForm = useCallback(() => {
    setShowCreateForm(false);
    setValidationError("");
    resetCustomerForm();
  }, [resetCustomerForm]);

  const closeVehicleForm = useCallback(() => {
    setShowAddVehiclePopup(false);
    setValidationError("");
    resetVehicleForm();
  }, [resetVehicleForm]);

  const closeAppointmentForm = useCallback(() => {
    setShowScheduleAppointment(false);
    resetAppointmentForm();
  }, [resetAppointmentForm]);

  // Handle direct create customer button
  const handleDirectCreateCustomer = useCallback((): void => {
    setShowCreateForm(true);
    resetCustomerForm();
  }, [resetCustomerForm]);

  // Handle service type selection (now integrated in form)
  const handleServiceTypeSelect = useCallback((serviceType: ServiceType): void => {
    setNewCustomerForm((prev) => ({ ...prev, serviceType }));
  }, []);

  // Toast function
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  }, []);

  // Save new customer
  const handleSaveNewCustomer = useCallback(async (): Promise<void> => {
    // Validate form
    if (!newCustomerForm.name || !newCustomerForm.phone) {
      setValidationError("Full Name and Mobile Number (Primary) are required fields");
      return;
    }

    // Validate primary phone
    const cleanedPhone = newCustomerForm.phone.replace(/[\s-+]/g, "").replace(/^91/, "");
    if (cleanedPhone.length !== 10 || !/^\d{10}$/.test(cleanedPhone)) {
      setValidationError("Please enter a valid 10-digit primary mobile number");
      return;
    }

    // Validate alternate mobile if provided
    if (newCustomerForm.alternateMobile) {
      const cleanedAlternate = newCustomerForm.alternateMobile.replace(/[\s-+]/g, "").replace(/^91/, "");
      if (cleanedAlternate.length !== 10 || !/^\d{10}$/.test(cleanedAlternate)) {
        setValidationError("Please enter a valid 10-digit alternate mobile number");
        return;
      }
      if (cleanedAlternate === cleanedPhone) {
        setValidationError("Alternate mobile number must be different from primary mobile number");
        return;
      }
    }

    // Validate email if provided
    if (newCustomerForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newCustomerForm.email)) {
        setValidationError("Please enter a valid email address");
        return;
      }
    }

    // Validate pincode if provided
    if (newCustomerForm.pincode) {
      if (!/^\d{6}$/.test(newCustomerForm.pincode)) {
        setValidationError("Pincode must be exactly 6 digits");
        return;
      }
    }

    // Validate service type
    if (!newCustomerForm.serviceType) {
      setValidationError("Please select a service type (Walk-in or Home Service)");
      return;
    }

    setValidationError("");

    const customer = await createCustomer({
      ...newCustomerForm,
      phone: cleanedPhone,
      alternateMobile: newCustomerForm.alternateMobile 
        ? newCustomerForm.alternateMobile.replace(/[\s-+]/g, "").replace(/^91/, "")
        : undefined,
    });

    if (customer) {
      setSelectedCustomer(customer);
      setShowCreateForm(false);
      setShowCreateCustomer(false);

      // Reset form
      resetCustomerForm();

      showToast(`Customer created successfully! Customer Number: ${customer.customerNumber} | Service Type: ${newCustomerForm.serviceType === "walk-in" ? "Walk-in" : "Home Service"}`, "success");
    } else if (createError) {
      setValidationError(createError);
    }
  }, [newCustomerForm, createCustomer, createError, showToast, resetCustomerForm]);

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
  const shouldShowCreateCustomer = showCreateCustomer || (searchQuery.trim().length >= 2 && searchResults.length === 0 && !searchLoading);

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
            <button
              onClick={handleDirectCreateCustomer}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2 self-start sm:self-auto"
            >
              <PlusCircle size={18} strokeWidth={2} />
              Create New Customer
            </button>
          </div>
        </div>

        {/* Global Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} strokeWidth={2} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Search by phone, email, customer ID, VIN, or vehicle number..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 placeholder:text-gray-400 transition-all duration-200"
              />
              {detectedSearchType && searchQuery.length >= 2 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md font-medium">
                    {getSearchTypeLabel(detectedSearchType)}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery.trim()}
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
            <div className="mt-3 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-red-700 text-sm font-medium">
              <AlertCircle size={18} strokeWidth={2} />
              {validationError}
            </div>
          )}

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && searchQuery.trim().length >= 2 && (
            <div className="mt-3 border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto bg-white">
              {searchResults.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer)}
                  className="p-4 hover:bg-indigo-50/50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-150 group"
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

        {/* Recent Customers Section */}
        {!selectedCustomer && !showCreateForm && recentCustomers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-1.5 rounded-lg bg-indigo-100">
                <Clock className="text-indigo-600" size={18} strokeWidth={2} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Customers</h2>
            </div>
            {recentLoading ? (
              <div className="text-center py-8 text-gray-500 text-sm">Loading recent customers...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-gray-50/30 hover:bg-indigo-50/30 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                          <User className="text-indigo-600" size={16} strokeWidth={2} />
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{customer.name}</h3>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm text-gray-600 ml-8">
                      <div className="flex items-center gap-1.5">
                        <Hash size={12} strokeWidth={2} />
                        <span className="font-mono text-xs text-gray-700">{customer.customerNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} strokeWidth={2} />
                        <span>{customer.phone}</span>
                      </div>
                      {customer.totalVehicles && customer.totalVehicles > 0 && (
                        <div className="flex items-center gap-1">
                          <Car size={12} />
                          <span>{customer.totalVehicles} vehicle{customer.totalVehicles > 1 ? "s" : ""}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Customer Not Found - Create New */}
        {shouldShowCreateCustomer && !showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 sm:p-8 mb-6">
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <AlertCircle className="text-amber-600" size={32} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Not Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                No customer found with the provided search. Would you like to create a new customer?
              </p>
              <button
                onClick={handleDirectCreateCustomer}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2 mx-auto"
              >
                <PlusCircle size={18} strokeWidth={2} />
                Create New Customer
              </button>
            </div>
          </div>
        )}

        {/* Create Customer Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Customer</h2>
              <button
                onClick={closeCustomerForm}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomerForm.name}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, name: e.target.value })
                  }
                  placeholder="Enter full name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number (Primary) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newCustomerForm.phone}
                    onChange={(e) =>
                      setNewCustomerForm({ ...newCustomerForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                    }
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alternate Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={newCustomerForm.alternateMobile || ""}
                    onChange={(e) =>
                      setNewCustomerForm({ ...newCustomerForm, alternateMobile: e.target.value.replace(/\D/g, "").slice(0, 10) })
                    }
                    placeholder="10-digit mobile number (optional)"
                    maxLength={10}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email ID
                </label>
                <input
                  type="email"
                  value={newCustomerForm.email || ""}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Address
                </label>
                <textarea
                  value={newCustomerForm.address || ""}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, address: e.target.value })
                  }
                  rows={3}
                  placeholder="Enter complete address"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City / State
                  </label>
                  <input
                    type="text"
                    value={newCustomerForm.cityState || ""}
                    onChange={(e) =>
                      setNewCustomerForm({ ...newCustomerForm, cityState: e.target.value })
                    }
                    placeholder="Enter city and state"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={newCustomerForm.pincode || ""}
                    onChange={(e) =>
                      setNewCustomerForm({ ...newCustomerForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })
                    }
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer Type
                  </label>
                  <select
                    value={newCustomerForm.customerType || ""}
                    onChange={(e) =>
                      setNewCustomerForm({ ...newCustomerForm, customerType: e.target.value as CustomerType | undefined })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                  >
                    <option value="">Select Customer Type</option>
                    <option value="B2C">B2C</option>
                    <option value="B2B">B2B</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleServiceTypeSelect("walk-in")}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 ${
                        newCustomerForm.serviceType === "walk-in"
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                      }`}
                    >
                      <Building2 className={`${newCustomerForm.serviceType === "walk-in" ? "text-indigo-600" : "text-gray-400"}`} size={24} strokeWidth={2} />
                      <span className={`text-sm font-medium ${newCustomerForm.serviceType === "walk-in" ? "text-indigo-700" : "text-gray-600"}`}>Walk-in</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleServiceTypeSelect("home-service")}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 ${
                        newCustomerForm.serviceType === "home-service"
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                      }`}
                    >
                      <Home className={`${newCustomerForm.serviceType === "home-service" ? "text-indigo-600" : "text-gray-400"}`} size={24} strokeWidth={2} />
                      <span className={`text-sm font-medium ${newCustomerForm.serviceType === "home-service" ? "text-indigo-700" : "text-gray-600"}`}>Home Service</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setValidationError("");
                    setNewCustomerForm({
                      name: "",
                      phone: "",
                      alternateMobile: "",
                      email: "",
                      address: "",
                      cityState: "",
                      pincode: "",
                      customerType: undefined,
                      serviceType: undefined,
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewCustomer}
                  disabled={createLoading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {createLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Customer"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Customer Details */}
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-4 sm:p-6">
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
                  <button
                    onClick={() => {
                      setShowComplaints(true);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg text-sm font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2"
                  >
                    <AlertTriangle size={16} strokeWidth={2} />
                    Complaints
                  </button>
                  <button
                    onClick={() => {
                      setShowAddVehiclePopup(true);
                      resetVehicleForm();
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg text-sm font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2"
                  >
                    <PlusCircle size={16} strokeWidth={2} />
                    Add Vehicle
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <Phone className="text-indigo-600" size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{selectedCustomer.phone}</p>
                  </div>
                </div>
                {selectedCustomer.email && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="p-2 rounded-lg bg-indigo-100">
                      <Mail className="text-indigo-600" size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{selectedCustomer.email}</p>
                    </div>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="p-2 rounded-lg bg-indigo-100">
                      <MapPin className="text-indigo-600" size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5 line-clamp-1">
                        {selectedCustomer.address}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <Calendar className="text-indigo-600" size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Member Since</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
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
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition"
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
                          <button
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowVehicleDetails(true);
                              // Load mock service history for the vehicle
                              setServiceHistory([
                                {
                                  id: 1,
                                  date: "2024-12-15",
                                  type: "Routine Maintenance",
                                  engineer: "Engineer 1",
                                  parts: ["Engine Oil", "Air Filter"],
                                  labor: "₹1,500",
                                  partsCost: "₹2,500",
                                  total: "₹4,000",
                                  invoice: "INV-2024-456",
                                  status: "Completed",
                                  odometer: "25,000 km",
                                },
                                {
                                  id: 2,
                                  date: "2024-11-20",
                                  type: "Repair",
                                  engineer: "Engineer 2",
                                  parts: ["Brake Pads", "Brake Fluid"],
                                  labor: "₹2,000",
                                  partsCost: "₹3,500",
                                  total: "₹5,500",
                                  invoice: "INV-2024-389",
                                  status: "Completed",
                                  odometer: "24,500 km",
                                },
                              ]);
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                          >
                            <FileText size={16} strokeWidth={2} />
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowScheduleAppointment(true);
                              // Auto-fill appointment form with customer and vehicle details
                              initializeAppointmentForm(selectedCustomer, vehicle);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-green-800 transition flex items-center gap-2"
                          >
                            <Calendar size={16} strokeWidth={2} />
                            Schedule Appointment
                          </button>
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
                    setShowAddVehiclePopup(true);
                    setNewVehicleForm({
                      vehicleBrand: "",
                      vehicleModel: "",
                      registrationNumber: "",
                      vin: "",
                      variant: "",
                      motorNumber: "",
                      chargerSerialNumber: "",
                      purchaseDate: "",
                      vehicleAge: "",
                      warrantyStatus: "",
                      insuranceStartDate: "",
                      insuranceEndDate: "",
                      insuranceCompanyName: "",
                    });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  <PlusCircle size={20} />
                  Add First Vehicle
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add Vehicle Popup Form */}
        {showAddVehiclePopup && selectedCustomer && (
          <div 
            className="fixed inset-0 backdrop-blur-md bg-black/10 flex items-start justify-center z-[9999] p-4 pt-8"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              style={{ animation: 'slideDownFromTop 0.3s ease-out' }}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-800">Add New Vehicle</h2>
                <button
                  onClick={closeVehicleForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <X size={24} strokeWidth={2} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {validationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="text-red-600" size={20} strokeWidth={2} />
                    <p className="text-red-600 text-sm">{validationError}</p>
                  </div>
                )}

                {/* Pre-filled Customer Information */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-indigo-600 font-medium">Name</p>
                      <p className="text-gray-800 font-semibold">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-indigo-600 font-medium">Phone</p>
                      <p className="text-gray-800 font-semibold">{selectedCustomer.phone}</p>
                    </div>
                    {selectedCustomer.email && (
                      <div>
                        <p className="text-indigo-600 font-medium">Email</p>
                        <p className="text-gray-800 font-semibold">{selectedCustomer.email}</p>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div>
                        <p className="text-indigo-600 font-medium">Address</p>
                        <p className="text-gray-800 font-semibold">{selectedCustomer.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle Form Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Vehicle Brand <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newVehicleForm.vehicleBrand || ""}
                        onChange={(e) =>
                          setNewVehicleForm({ ...newVehicleForm, vehicleBrand: e.target.value })
                        }
                        placeholder="e.g., Honda, Toyota, Tesla"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Vehicle Model <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newVehicleForm.vehicleModel || ""}
                        onChange={(e) =>
                          setNewVehicleForm({ ...newVehicleForm, vehicleModel: e.target.value })
                        }
                        placeholder="e.g., City, Camry, Model 3"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Registration Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newVehicleForm.registrationNumber || ""}
                        onChange={(e) =>
                          setNewVehicleForm({ ...newVehicleForm, registrationNumber: e.target.value.toUpperCase() })
                        }
                        placeholder="e.g., MH12AB1234"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        VIN / Chassis Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newVehicleForm.vin || ""}
                        onChange={(e) =>
                          setNewVehicleForm({ ...newVehicleForm, vin: e.target.value.toUpperCase() })
                        }
                        placeholder="Enter 17-character VIN number"
                        maxLength={17}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 font-mono transition-all duration-200"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1.5">17 alphanumeric characters</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Variant / Battery Capacity
                      </label>
                      <input
                        type="text"
                        value={newVehicleForm.variant || ""}
                        onChange={(e) =>
                          setNewVehicleForm({ ...newVehicleForm, variant: e.target.value })
                        }
                        placeholder="e.g., VX, 50kWh, Standard Range"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Motor Number
                      </label>
                      <input
                        type="text"
                        value={newVehicleForm.motorNumber || ""}
                        onChange={(e) =>
                          setNewVehicleForm({ ...newVehicleForm, motorNumber: e.target.value })
                        }
                        placeholder="Enter motor number"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Charger Serial Number
                    </label>
                    <input
                      type="text"
                      value={newVehicleForm.chargerSerialNumber || ""}
                      onChange={(e) =>
                        setNewVehicleForm({ ...newVehicleForm, chargerSerialNumber: e.target.value })
                      }
                      placeholder="Enter charger serial number"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Purchase
                      </label>
                      <input
                        type="date"
                        value={newVehicleForm.purchaseDate || ""}
                        onChange={(e) =>
                          setNewVehicleForm({ ...newVehicleForm, purchaseDate: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Vehicle Age
                      </label>
                      <input
                        type="text"
                        value={newVehicleForm.vehicleAge || ""}
                        onChange={(e) =>
                          setNewVehicleForm({ ...newVehicleForm, vehicleAge: e.target.value })
                        }
                        placeholder="e.g., 2 years, 6 months"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Warranty Status
                    </label>
                    <select
                      value={newVehicleForm.warrantyStatus || ""}
                      onChange={(e) =>
                        setNewVehicleForm({ ...newVehicleForm, warrantyStatus: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                    >
                      <option value="">Select Warranty Status</option>
                      <option value="Active">Active</option>
                      <option value="Expired">Expired</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Insurance Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Insurance Start Date
                        </label>
                        <input
                          type="date"
                          value={newVehicleForm.insuranceStartDate || ""}
                          onChange={(e) =>
                            setNewVehicleForm({ ...newVehicleForm, insuranceStartDate: e.target.value })
                          }
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Insurance End Date
                        </label>
                        <input
                          type="date"
                          value={newVehicleForm.insuranceEndDate || ""}
                          onChange={(e) =>
                            setNewVehicleForm({ ...newVehicleForm, insuranceEndDate: e.target.value })
                          }
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Insurance Company Name
                      </label>
                      <input
                        type="text"
                        value={newVehicleForm.insuranceCompanyName || ""}
                        onChange={(e) =>
                          setNewVehicleForm({ ...newVehicleForm, insuranceCompanyName: e.target.value })
                        }
                        placeholder="Enter insurance company name"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      closeVehicleForm();
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
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

                      if (newVehicleForm.vin.length !== 17) {
                        setValidationError("VIN must be exactly 17 characters");
                        return;
                      }

                      // Validate VIN format (alphanumeric, excluding I, O, Q)
                      const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
                      if (!vinRegex.test(newVehicleForm.vin)) {
                        setValidationError("Invalid VIN format. VIN should contain only alphanumeric characters (excluding I, O, Q)");
                        return;
                      }

                      // Validate insurance dates if provided
                      if (newVehicleForm.insuranceStartDate && newVehicleForm.insuranceEndDate) {
                        const startDate = new Date(newVehicleForm.insuranceStartDate);
                        const endDate = new Date(newVehicleForm.insuranceEndDate);
                        if (endDate <= startDate) {
                          setValidationError("Insurance end date must be after start date");
                          return;
                        }
                      }

                      setValidationError("");

                      // TODO: Call API to create vehicle
                      // For now, show success message
                      showToast(`Vehicle added successfully! Brand: ${newVehicleForm.vehicleBrand} | Model: ${newVehicleForm.vehicleModel} | Registration: ${newVehicleForm.registrationNumber}`, "success");

                      // Close popup and reset form
                      closeVehicleForm();

                      // Optionally refresh customer data to show new vehicle
                      // You might want to refetch the customer data here
                    }}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    Add Vehicle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Details Modal */}
        {showVehicleDetails && selectedVehicle && selectedCustomer && (
          <div 
            className="fixed inset-0 backdrop-blur-md bg-black/10 flex items-start justify-center z-[9999] p-4 pt-8"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              style={{ animation: 'slideDownFromTop 0.3s ease-out' }}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Vehicle Details</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedVehicle.vehicleMake} {selectedVehicle.vehicleModel} ({selectedVehicle.vehicleYear})
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowVehicleDetails(false);
                    setSelectedVehicle(null);
                    setServiceHistory([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <X size={24} strokeWidth={2} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Vehicle Information */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200">
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
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        selectedVehicle.currentStatus === "Active Job Card"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {selectedVehicle.currentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service History */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <History className="text-purple-600" size={20} />
                      Service History
                    </h3>
                    <button
                      onClick={() => {
                        setShowVehicleDetails(false);
                        setShowScheduleAppointment(true);
                        // Pre-fill appointment form with customer and vehicle details
                        initializeAppointmentForm(selectedCustomer, selectedVehicle);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2"
                    >
                      <Calendar size={16} strokeWidth={2} />
                      Schedule Appointment
                    </button>
                  </div>

                  {serviceHistory.length > 0 ? (
                    <div className="space-y-4">
                      {serviceHistory.map((service) => (
                        <div
                          key={service.id}
                          className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
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
            </div>
          </div>
        )}

        {/* Schedule Appointment Modal */}
        {showScheduleAppointment && selectedVehicle && selectedCustomer && (
          <div 
            className="fixed inset-0 backdrop-blur-md bg-black/10 flex items-start justify-center z-[9999] p-4 pt-8"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{ animation: 'slideDownFromTop 0.3s ease-out' }}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-800">Schedule Appointment</h2>
                <button
                  onClick={closeAppointmentForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <X size={24} strokeWidth={2} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {validationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="text-red-600" size={20} strokeWidth={2} />
                    <p className="text-red-600 text-sm">{validationError}</p>
                  </div>
                )}

                {/* Pre-filled Customer Information */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-3">Customer Information (Pre-filled)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-indigo-600 font-medium">Name</p>
                      <p className="text-gray-800 font-semibold">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-indigo-600 font-medium">Phone</p>
                      <p className="text-gray-800 font-semibold">{selectedCustomer.phone}</p>
                    </div>
                    {selectedCustomer.email && (
                      <div>
                        <p className="text-indigo-600 font-medium">Email</p>
                        <p className="text-gray-800 font-semibold">{selectedCustomer.email}</p>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div>
                        <p className="text-indigo-600 font-medium">Address</p>
                        <p className="text-gray-800 font-semibold">{selectedCustomer.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={appointmentForm.customerName}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={appointmentForm.phone}
                      readOnly
                      maxLength={10}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vehicle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={appointmentForm.vehicle}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Service Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={appointmentForm.serviceType}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, serviceType: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                      required
                    >
                      <option value="">Select service type</option>
                      <option value="Routine Maintenance">Routine Maintenance</option>
                      <option value="AC Repair">AC Repair</option>
                      <option value="Oil Change">Oil Change</option>
                      <option value="Battery Replacement">Battery Replacement</option>
                      <option value="Tire Service">Tire Service</option>
                      <option value="Brake Service">Brake Service</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={appointmentForm.date}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={appointmentForm.time}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-gray-900 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                    closeAppointmentForm();
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Validate form
                      if (!appointmentForm.customerName || !appointmentForm.phone || !appointmentForm.vehicle || !appointmentForm.serviceType || !appointmentForm.date || !appointmentForm.time) {
                        setValidationError("Please fill all required fields");
                        return;
                      }

                      if (appointmentForm.phone.length !== 10 || !/^\d{10}$/.test(appointmentForm.phone)) {
                        setValidationError("Please enter a valid 10-digit phone number");
                        return;
                      }

                      setValidationError("");

                      // Convert time to 12-hour format (e.g., "14:30" -> "2:30 PM")
                      const formatTime = (time24: string): string => {
                        const [hours, minutes] = time24.split(":");
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? "PM" : "AM";
                        const hour12 = hour % 12 || 12;
                        return `${hour12}:${minutes} ${ampm}`;
                      };

                      // Get existing appointments from localStorage
                      const existingAppointments = safeStorage.getItem<Array<{
                        id: number;
                        customerName: string;
                        vehicle: string;
                        phone: string;
                        serviceType: string;
                        date: string;
                        time: string;
                        duration: string;
                        status: string;
                      }>>("appointments", []);

                      // Create new appointment
                      const newAppointment = {
                        id: existingAppointments.length > 0 
                          ? Math.max(...existingAppointments.map((a) => a.id)) + 1 
                          : 1,
                        customerName: appointmentForm.customerName,
                        vehicle: appointmentForm.vehicle,
                        phone: appointmentForm.phone,
                        serviceType: appointmentForm.serviceType,
                        date: appointmentForm.date,
                        time: formatTime(appointmentForm.time),
                        duration: `${appointmentForm.duration} hours`,
                        status: "Confirmed",
                      };

                      // Save to localStorage
                      const updatedAppointments = [...existingAppointments, newAppointment];
                      safeStorage.setItem("appointments", updatedAppointments);

                      showToast(`Appointment scheduled successfully! Customer: ${appointmentForm.customerName} | Vehicle: ${appointmentForm.vehicle} | Service: ${appointmentForm.serviceType} | Date: ${appointmentForm.date} | Time: ${formatTime(appointmentForm.time)}`, "success");

                      // Close modal and reset form
                    closeAppointmentForm();
                    }}
                    className="flex-1 px-4 py-2.5 bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    Schedule Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Complaints Modal */}
        {showComplaints && selectedCustomer && (
          <div 
            className="fixed inset-0 backdrop-blur-md bg-black/10 flex items-start justify-center z-[9999] p-4 pt-8"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              style={{ animation: 'slideDownFromTop 0.3s ease-out' }}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Customer Complaints</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCustomer.name} - {selectedCustomer.customerNumber}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowComplaints(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <X size={24} strokeWidth={2} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Mock complaints data - Replace with API call */}
                {(() => {
                  // Mock complaints for the selected customer
                  const mockComplaints = [
                    {
                      id: "COMP-001",
                      customerName: selectedCustomer.name,
                      phone: selectedCustomer.phone,
                      vehicle: selectedCustomer.vehicles?.[0] 
                        ? `${selectedCustomer.vehicles[0].vehicleMake} ${selectedCustomer.vehicles[0].vehicleModel}`
                        : "N/A",
                      complaint: "Service quality was poor. The technician did not properly diagnose the issue.",
                      status: "Open",
                      date: "2025-01-15",
                      severity: "Medium",
                    },
                    {
                      id: "COMP-002",
                      customerName: selectedCustomer.name,
                      phone: selectedCustomer.phone,
                      vehicle: selectedCustomer.vehicles?.[0]
                        ? `${selectedCustomer.vehicles[0].vehicleMake} ${selectedCustomer.vehicles[0].vehicleModel}`
                        : "N/A",
                      complaint: "Delayed service delivery. Vehicle was promised to be ready in 2 days but took 5 days.",
                      status: "Resolved",
                      date: "2024-12-20",
                      severity: "High",
                    },
                  ];

                  return mockComplaints.length > 0 ? (
                    <div className="space-y-4">
                      {mockComplaints.map((complaint) => (
                        <div
                          key={complaint.id}
                          className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

