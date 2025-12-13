"use client";
import { useState, useCallback, useMemo } from "react";
import {
  PlusCircle,
  Clock,
  Phone,
  Mail,
  Car,
  Calendar,
  AlertCircle,
  Building2,
  History,
  Wrench,
  FileText,
  AlertTriangle,
  Edit2,
  X as XIcon,
  CheckCircle,
  User,
  MapPin,
  X,
} from "lucide-react";
import { useRole } from "@/shared/hooks";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { getServiceCenterContext, staticServiceCenters } from "@/app/(service-center)/sc/components/service-center";
import { useCustomerSearch } from "@/app/(service-center)/sc/components/customers";
import { canCreateCustomer } from "@/shared/constants/roles";
import type {
  CustomerSearchType,
  CustomerWithVehicles,
  Vehicle,
  ServiceHistoryItem,
  NewCustomerForm,
  NewVehicleForm,
  CustomerType,
} from "@/shared/types";
import { getMockServiceHistory } from "@/__mocks__/data/customer-service-history.mock";
import { getMockComplaints } from "@/__mocks__/data/complaints.mock";
import { mockCustomers } from "@/__mocks__/data/customers.mock";
import { validatePhone, validateEmail, validateVIN, cleanPhone } from "@/shared/utils/validation";
import { formatVehicleString } from "../components/shared";
import type { Appointment } from "@/app/(service-center)/sc/components/appointment/types";
import type { AppointmentForm as AppointmentFormType } from "@/app/(service-center)/sc/components/appointment/types";
import { getInitialAppointmentForm, formatTime } from "@/app/(service-center)/sc/components/appointment/utils";
import { detectSearchType, getSearchTypeLabel } from "./utils/search.utils";
// Extracted Hooks
import {
  useModalState,
  useRolePermissions,
  useToast,
  useServiceHistory,
  useInvoice,
  useCustomerForm,
  useVehicleForm,
} from "./hooks";

// Extracted Components
import {
  CustomerSearchBar,
  RecentCustomersTable,
  CustomerNotFound,
  CreateCustomerFormModal,
  CustomerDetailsModal,
  AddVehicleFormModal,
  VehicleDetailsModal,
  AppointmentFormModal,
  ComplaintsModal,
  InvoiceModal,
} from "./components";

// Extracted Shared Components
import { Button } from "../components/shared";




export default function CustomerFind() {
  const { userInfo } = useRole();
  const serviceCenterContext = useMemo(() => getServiceCenterContext(), []);

  // Extracted Hooks
  const rolePermissions = useRolePermissions();
  const {
    isCallCenter,
    canAccessCustomerType,
    canAccessVehicleInfo,
  } = rolePermissions;
  const { userRole } = useRole();
  const canCreateNewCustomer = canCreateCustomer(userRole);

  const { toast, showToast, ToastComponent } = useToast();
  
  // Modal states using extracted hook
  const createFormModal = useModalState(false);
  const addVehicleModal = useModalState(false);
  const vehicleDetailsModal = useModalState(false);
  const appointmentModal = useModalState(false);
  const complaintsModal = useModalState(false);
  const serviceCenterSelectorModal = useModalState(false);

  // Service History hook - initialized with empty array
  const serviceHistoryHook = useServiceHistory([]);
  const {
    serviceHistory,
    editingFeedbackRating,
    setServiceHistory,
    setEditingFeedbackRating,
    enrichServiceHistoryWithFeedbackRatings,
    handleUpdateFeedbackRating: handleUpdateFeedbackRatingFromHook,
  } = serviceHistoryHook;

  // Invoice hook
  const invoiceHook = useInvoice();
  const {
    selectedInvoice,
    showInvoiceModal,
    setSelectedInvoice,
    setShowInvoiceModal,
    handleOpenServiceInvoice: handleOpenServiceInvoiceFromHook,
  } = invoiceHook;

  // Customer Form hook
  const customerForm = useCustomerForm();
  const {
    newCustomerForm,
    setNewCustomerForm,
    selectedState,
    setSelectedState,
    selectedCity,
    setSelectedCity,
    whatsappSameAsMobile,
    setWhatsappSameAsMobile,
    fieldErrors,
    setFieldErrors,
    resetCustomerForm,
    handleSaveNewCustomer,
  } = customerForm;

  // Vehicle Form hook - initialize without customer, will be updated when customer is selected
  const vehicleForm = useVehicleForm();
  const {
    newVehicleForm,
    setNewVehicleForm,
    vehicleFormState,
    setVehicleFormState,
    vehicleFormCity,
    setVehicleFormCity,
    hasInsurance,
    setHasInsurance,
    validationError: vehicleValidationError,
    setValidationError: setVehicleValidationError,
    resetVehicleForm,
    handleSaveVehicle,
  } = vehicleForm;

  // Core state (not extracted to hooks)
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithVehicles | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showCreateCustomer, setShowCreateCustomer] = useState<boolean>(false);
  const [shouldOpenAppointmentAfterVehicleAdd, setShouldOpenAppointmentAfterVehicleAdd] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");
  const [detectedSearchType, setDetectedSearchType] = useState<CustomerSearchType | null>(null);
  const [serviceCenterSearch, setServiceCenterSearch] = useState<string>("");
  const [appointmentForm, setAppointmentForm] = useState<Partial<AppointmentFormType>>(() => getInitialAppointmentForm());
  const [pickupAddressDifferent, setPickupAddressDifferent] = useState<boolean>(false);
  const [pickupState, setPickupState] = useState<string>("");
  const [pickupCity, setPickupCity] = useState<string>("");
  const [dropState, setDropState] = useState<string>("");
  const [dropCity, setDropCity] = useState<string>("");
  const [dropSameAsPickup, setDropSameAsPickup] = useState<boolean>(false);
  const [appointmentFieldErrors, setAppointmentFieldErrors] = useState<Record<string, string>>({});

  const filteredServiceCenters = useMemo(() => {
    const query = serviceCenterSearch.trim().toLowerCase();
    if (!query) return staticServiceCenters;
    return staticServiceCenters.filter((center) =>
      `${center.name} ${center.location}`.toLowerCase().includes(query)
    );
  }, [serviceCenterSearch]);

  const serviceCenterFilterId = userInfo?.serviceCenter ? Number(userInfo.serviceCenter) : null;
  const shouldFilterByServiceCenter = !isCallCenter && serviceCenterFilterId;

  // Wrapper for invoice hook to match existing signature
  const handleOpenServiceInvoice = useCallback(
    (service: ServiceHistoryItem) => {
      handleOpenServiceInvoiceFromHook(service, selectedCustomer, selectedVehicle);
    },
    [selectedCustomer, selectedVehicle, handleOpenServiceInvoiceFromHook]
  );

  // Wrapper for feedback rating hook
  const handleUpdateFeedbackRating = useCallback(
    (service: ServiceHistoryItem, newRating: number) => {
      handleUpdateFeedbackRatingFromHook(service, newRating, selectedCustomer, selectedVehicle, showToast);
    },
    [selectedCustomer, selectedVehicle, showToast, handleUpdateFeedbackRatingFromHook]
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

  // Hooks for data fetching
  const { results: searchResults, loading: searchLoading, search: performSearch, clear: clearSearch } = useCustomerSearch();
  const filteredSearchResults = useMemo(() => {
    if (!shouldFilterByServiceCenter || searchResults.length === 0) return searchResults;
    return searchResults.filter(
      (customer: CustomerWithVehicles) => Number(customer.serviceCenterId) === Number(serviceCenterFilterId)
    );
  }, [searchResults, shouldFilterByServiceCenter, serviceCenterFilterId]);
  
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



  // Handle search input change
  const handleSearchInputChange = useCallback((value: string): void => {
    // Prevent search when creating customer
    if (createFormModal.isOpen) return;
    
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
  }, [performSearch, clearSearch, createFormModal.isOpen]);

  // Handle search execution
  const handleSearch = useCallback((): void => {
    // Prevent search when creating customer
    if (createFormModal.isOpen) return;
    
    if (!searchQuery.trim()) {
      setValidationError("Please enter a search query");
      return;
    }

    const searchType = detectSearchType(searchQuery);
    performSearch(searchQuery, searchType);
  }, [searchQuery, performSearch, createFormModal.isOpen]);

  // Handle customer selection
  const handleCustomerSelect = useCallback(async (customer: CustomerWithVehicles): Promise<void> => {
    setSelectedCustomer(customer);
    setSearchQuery("");
    clearSearch();
    setShowCreateCustomer(false);
    
    // Add to recent customers (this will be handled by the service/repository)
    // The repository tracks this automatically when a customer is accessed
  }, [clearSearch]);

  // Form reset functions - using hooks
  const handleResetCustomerForm = useCallback(() => {
    resetCustomerForm();
    setValidationError("");
    setFieldErrors({});
  }, [resetCustomerForm]);

  const handleResetVehicleForm = useCallback(() => {
    resetVehicleForm();
    setVehicleValidationError("");
  }, [resetVehicleForm]);

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

  // Modal close handlers - defined once
  const closeCustomerFormHandler = useCallback(() => {
    createFormModal.close();
    setValidationError("");
    setFieldErrors({});
    resetCustomerForm();
  }, [createFormModal, resetCustomerForm]);

  const closeVehicleFormHandler = useCallback(() => {
    addVehicleModal.close();
    setVehicleValidationError("");
    resetVehicleForm();
    setShouldOpenAppointmentAfterVehicleAdd(false);
  }, [addVehicleModal, resetVehicleForm, setVehicleValidationError]);

  const closeAppointmentFormHandler = useCallback(() => {
    // Clean up file URLs before closing
    setAppointmentForm((prev: Partial<AppointmentFormType>) => {
      if (prev.customerIdProof?.urls) {
        prev.customerIdProof.urls.forEach((url: string) => URL.revokeObjectURL(url));
      }
      if (prev.vehicleRCCopy?.urls) {
        prev.vehicleRCCopy.urls.forEach((url: string) => URL.revokeObjectURL(url));
      }
      if (prev.warrantyCardServiceBook?.urls) {
        prev.warrantyCardServiceBook.urls.forEach((url: string) => URL.revokeObjectURL(url));
      }
      if (prev.photosVideos?.urls) {
        prev.photosVideos.urls.forEach((url: string) => URL.revokeObjectURL(url));
      }
      return getInitialAppointmentForm();
    });
    appointmentModal.close();
    setValidationError("");
    setAppointmentFieldErrors({});
    setPickupState("");
    setPickupCity("");
    setDropState("");
    setDropCity("");
    setPickupAddressDifferent(false);
    setDropSameAsPickup(false);
  }, [appointmentModal]);

  // Modal close handlers (using extracted handlers)
  const closeCustomerForm = closeCustomerFormHandler;
  const closeVehicleForm = closeVehicleFormHandler;
  const closeAppointmentForm = closeAppointmentFormHandler;

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
    
    createFormModal.open();
    resetCustomerForm();
  }, [canCreateNewCustomer, resetCustomerForm, clearSearch, showToast, createFormModal]);

  // Wrapper for customer form save - using hook's handleSaveNewCustomer
  const handleSaveNewCustomerWrapper = useCallback(async (): Promise<void> => {
    const customer = await handleSaveNewCustomer(
      rolePermissions.userRole,
      serviceCenterFilterId,
      showToast,
      setSelectedCustomer,
      (show: boolean) => {
        if (show) createFormModal.open();
        else createFormModal.close();
      },
      setShowCreateCustomer,
      setValidationError
    );
    if (customer) {
      createFormModal.close();
    }
  }, [
    handleSaveNewCustomer,
    rolePermissions.userRole,
    serviceCenterFilterId,
    showToast,
    createFormModal,
  ]);

  // Show create customer if search returned no results
  const shouldShowCreateCustomer =
    showCreateCustomer || (searchQuery.trim().length >= 2 && filteredSearchResults.length === 0 && !searchLoading);

  return (
    <div className="bg-gray-50 min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-10">
      {/* Toast Notification */}
      <ToastComponent />
      
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

        {/* Global Search Section - Using Extracted Component */}
        <CustomerSearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchInputChange}
          onSearch={handleSearch}
          searchLoading={searchLoading}
          showCreateForm={createFormModal.isOpen}
          detectedSearchType={detectedSearchType}
          validationError={validationError}
          filteredSearchResults={filteredSearchResults}
          onCustomerSelect={handleCustomerSelect}
          isCallCenter={isCallCenter}
        />

        {/* Recent Customers Section - Always show when no customer selected and not creating */}
        {!selectedCustomer && !createFormModal.isOpen && searchQuery.length < 2 && (
          <RecentCustomersTable
            recentCustomers={recentCustomers}
            isCallCenter={isCallCenter}
            onCustomerSelect={handleCustomerSelect}
            onScheduleClick={(e, customer) => {
              e.stopPropagation();
              setSelectedCustomer(customer);
              initializeAppointmentForm(customer);
              vehicleDetailsModal.close();
              appointmentModal.open();
              
              const availableVehicles = customer.vehicles?.filter(
                (v) => v.currentStatus !== "Active Job Card"
              ) || [];
              
              if (availableVehicles.length === 0) {
                resetVehicleForm();
                if (customer.cityState) {
                  const parts = customer.cityState.split(",");
                  if (parts.length >= 2) {
                    setVehicleFormCity(parts[0]?.trim() || "");
                    setVehicleFormState(parts[1]?.trim() || "");
                  }
                }
                setShouldOpenAppointmentAfterVehicleAdd(true);
                addVehicleModal.open();
              }
            }}
            setSelectedCustomer={setSelectedCustomer}
            initializeAppointmentForm={initializeAppointmentForm}
            setShowVehicleDetails={(show: boolean) => {
              if (show) vehicleDetailsModal.open();
              else vehicleDetailsModal.close();
            }}
            setShowScheduleAppointment={(show: boolean) => {
              if (show) appointmentModal.open();
              else appointmentModal.close();
            }}
            resetVehicleForm={resetVehicleForm}
            setVehicleFormCity={setVehicleFormCity}
            setVehicleFormState={setVehicleFormState}
            setShouldOpenAppointmentAfterVehicleAdd={setShouldOpenAppointmentAfterVehicleAdd}
            setShowAddVehiclePopup={(show: boolean) => {
              if (show) addVehicleModal.open();
              else addVehicleModal.close();
            }}
          />
        )}

        {/* Customer Not Found - Create New */}
        {shouldShowCreateCustomer && !createFormModal.isOpen && (
          <CustomerNotFound
            canCreateNewCustomer={canCreateNewCustomer}
            onCreateCustomer={handleDirectCreateCustomer}
          />
        )}

        {/* Create Customer Form Modal */}
        <CreateCustomerFormModal
          isOpen={createFormModal.isOpen && canCreateNewCustomer}
          onClose={closeCustomerForm}
          formData={newCustomerForm}
          onFormChange={(data) => setNewCustomerForm(data)}
          selectedState={selectedState}
          onStateChange={setSelectedState}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          whatsappSameAsMobile={whatsappSameAsMobile}
          onWhatsappSameAsMobileChange={setWhatsappSameAsMobile}
          fieldErrors={fieldErrors}
          onFieldErrorChange={setFieldErrors}
          validationError={validationError}
          isLoading={false}
          onSubmit={async () => {
            await handleSaveNewCustomerWrapper();
          }}
        />

        {/* Customer Details Modal */}
        {selectedCustomer && (
          <CustomerDetailsModal
            isOpen={!!selectedCustomer}
            customer={selectedCustomer}
            onClose={() => {
              setSelectedCustomer(null);
              setSearchQuery("");
              clearSearch();
            }}
            onAddVehicle={() => {
              resetVehicleForm();
              // Initialize state and city from customer's cityState
              if (selectedCustomer.cityState) {
                const parts = selectedCustomer.cityState.split(",");
                if (parts.length >= 2) {
                  setVehicleFormCity(parts[0]?.trim() || "");
                  setVehicleFormState(parts[1]?.trim() || "");
                }
              }
              addVehicleModal.open();
            }}
            onViewComplaints={() => complaintsModal.open()}
            onViewVehicleDetails={(vehicle: Vehicle) => {
              setSelectedVehicle(vehicle);
              vehicleDetailsModal.open();
              // Load service history if vehicle has services
              if (vehicle.totalServices > 0 && vehicle.lastServiceDate) {
                const baseHistory = getMockServiceHistory(vehicle.id);
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
            onScheduleAppointment={(vehicle: Vehicle) => {
              setSelectedVehicle(vehicle);
              vehicleDetailsModal.close();
              appointmentModal.open();
              initializeAppointmentForm(selectedCustomer, vehicle);
            }}
            enrichServiceHistoryWithFeedbackRatings={enrichServiceHistoryWithFeedbackRatings}
            setServiceHistory={setServiceHistory}
            setSelectedVehicle={setSelectedVehicle}
            initializeAppointmentForm={initializeAppointmentForm}
            setShowVehicleDetails={(show: boolean) => {
              if (show) vehicleDetailsModal.open();
              else vehicleDetailsModal.close();
            }}
            setShowScheduleAppointment={(show: boolean) => {
              if (show) appointmentModal.open();
              else appointmentModal.close();
            }}
          />
        )}

        {/* Add Vehicle Popup Form */}
        <AddVehicleFormModal
          isOpen={addVehicleModal.isOpen}
          customer={selectedCustomer}
          formData={newVehicleForm}
          onFormChange={(data) => setNewVehicleForm(data)}
          vehicleFormState={vehicleFormState}
          onVehicleFormStateChange={setVehicleFormState}
          vehicleFormCity={vehicleFormCity}
          onVehicleFormCityChange={setVehicleFormCity}
          hasInsurance={hasInsurance}
          onHasInsuranceChange={setHasInsurance}
          validationError={vehicleValidationError}
          onClose={closeVehicleForm}
          onSubmit={async () => {
            if (!selectedCustomer) return;
            await handleSaveVehicle(
              selectedCustomer,
              showToast,
              setSelectedCustomer,
              setSelectedVehicle,
              closeVehicleForm,
              shouldOpenAppointmentAfterVehicleAdd,
              initializeAppointmentForm,
              (show: boolean) => {
                if (show) appointmentModal.open();
                else appointmentModal.close();
              },
              (show: boolean) => {
                if (show) vehicleDetailsModal.open();
                else vehicleDetailsModal.close();
              },
              setShouldOpenAppointmentAfterVehicleAdd
            );
          }}
        />

        {/* Vehicle Details Modal */}
        {vehicleDetailsModal.isOpen && selectedVehicle && selectedCustomer && (
          <VehicleDetailsModal
            isOpen={vehicleDetailsModal.isOpen}
            vehicle={selectedVehicle}
            customer={selectedCustomer}
            serviceHistory={serviceHistory}
            editingFeedbackRating={editingFeedbackRating}
            onClose={() => {
              vehicleDetailsModal.close();
              setSelectedVehicle(null);
              setServiceHistory([]);
            }}
            onScheduleAppointment={() => {
              vehicleDetailsModal.close();
              appointmentModal.open();
              initializeAppointmentForm(selectedCustomer, selectedVehicle);
            }}
            onUpdateFeedbackRating={handleUpdateFeedbackRating}
            onSetEditingFeedbackRating={setEditingFeedbackRating}
            onOpenInvoice={handleOpenServiceInvoice}
          />
        )}

        {/* Schedule Appointment Modal */}
        <AppointmentFormModal
          isOpen={appointmentModal.isOpen && !vehicleDetailsModal.isOpen}
          customer={selectedCustomer}
          vehicle={selectedVehicle}
          initialFormData={appointmentForm}
          onClose={closeAppointmentForm}
          onSubmit={(form: AppointmentFormType) => {
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
              customerType: selectedCustomer?.customerType,
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
              pickupState: (form as any).pickupState,
              pickupCity: (form as any).pickupCity,
              pickupPincode: (form as any).pickupPincode,
              dropAddress: form.dropAddress,
              dropState: (form as any).dropState,
              dropCity: (form as any).dropCity,
              dropPincode: (form as any).dropPincode,
              preferredCommunicationMode: form.preferredCommunicationMode,
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
                ? Math.max(...existingAppointments.map((a: any) => a.id)) + 1 
                : 1,
              ...appointmentData,
            };

            // Save to localStorage
            const updatedAppointments = [...existingAppointments, newAppointment];
            safeStorage.setItem("appointments", updatedAppointments);

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
            closeAppointmentForm();
          }}
          canAccessCustomerType={canAccessCustomerType}
          canAccessVehicleInfo={canAccessVehicleInfo}
          existingAppointments={safeStorage.getItem<Array<any>>("appointments", [])}
        />

        {/* Complaints Modal */}
        <ComplaintsModal
          isOpen={complaintsModal.isOpen}
          onClose={complaintsModal.close}
          customer={selectedCustomer}
        />

        {/* Invoice Modal */}
        <InvoiceModal
          isOpen={showInvoiceModal}
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedInvoice(null);
          }}
        />

        {serviceCenterSelectorModal.isOpen && (
          <div className="fixed inset-0 z-12000 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Choose Service Center</h3>
                <button
                  type="button"
                  onClick={() => {
                    serviceCenterSelectorModal.close();
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
                        serviceCenterSelectorModal.close();
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

