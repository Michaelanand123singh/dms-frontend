"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Building2,
  FileText,
  Upload,
  Search,
  X,
  CheckCircle,
  Camera,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { useRole } from "@/shared/hooks";
import { defaultServiceCenters } from "../service-center";
import { SERVICE_TYPE_OPTIONS } from "@/shared/constants/service-types";
import { INDIAN_STATES, getCitiesByState } from "@/shared/constants/indian-states-cities";
import { FormInput, FormSelect, formatVehicleString, CameraModal } from "../shared";
import { findNearestServiceCenter } from "./types";
import type { CustomerWithVehicles, Vehicle } from "@/shared/types";
import type { AppointmentForm as AppointmentFormType } from "./types";
import { INITIAL_APPOINTMENT_FORM } from "./types";
import {
  getCurrentTime,
  getCurrentDate,
  isToday,
  getMinTime,
} from "@/shared/utils/date";
import { validatePhone } from "@/shared/utils/validation";
import { getInitialAppointmentForm, mapVehicleToFormData, mapCustomerToFormData } from "./utils";

export interface AppointmentFormProps {
  initialData?: Partial<AppointmentFormType>;
  onSubmit: (form: AppointmentFormType) => void;
  onCancel: () => void;
  mode?: "create" | "edit";
  customerInfo?: CustomerWithVehicles | null;
  vehicleInfo?: Vehicle | null;
  existingAppointments?: any[];
  showCustomerSelection?: boolean;
  onCustomerSelect?: (customer: CustomerWithVehicles) => void;
  customerSearchResults?: CustomerWithVehicles[];
  customerSearchLoading?: boolean;
  onVehicleChange?: (vehicle: Vehicle | null) => void;
  onCustomerArrived?: (form: AppointmentFormType) => void;
  appointmentStatus?: string;
  customerArrived?: boolean;
  onCreateQuotation?: (form: AppointmentFormType) => void;
}

export const AppointmentForm = ({
  initialData,
  onSubmit,
  onCancel,
  mode = "create",
  customerInfo,
  vehicleInfo,
  existingAppointments = [],
  showCustomerSelection = false,
  onCustomerSelect,
  customerSearchResults = [],
  customerSearchLoading = false,
  onVehicleChange,
  onCustomerArrived,
  appointmentStatus,
  customerArrived,
  onCreateQuotation,
}: AppointmentFormProps) => {
  const { userRole, userInfo } = useRole();
  const isCallCenter = userRole === "call_center";
  const isServiceAdvisor = userRole === "service_advisor";
  const isServiceManager = userRole === "sc_manager";
  const isTechnician = userRole === "service_engineer";
  const isInventoryManager = userRole === "inventory_manager";
  const isAdminRole = userRole === "admin" || userRole === "super_admin";

  const hasRoleAccess = (roles: string[]): boolean => {
    return isAdminRole || roles.includes(userRole);
  };

  // Permission checks
  const canAccessCustomerType = hasRoleAccess(["call_center", "service_advisor"]);
  const canAccessServiceDetails = hasRoleAccess(["call_center", "service_advisor", "sc_manager", "service_engineer"]);
  const canAccessEstimatedCost = hasRoleAccess(["service_advisor", "sc_manager"]);
  const canAccessOdometer = hasRoleAccess(["service_advisor"]);
  const hasDocUploadAccess = hasRoleAccess(["call_center", "service_advisor"]);
  const hasDropoffMediaAccess = hasRoleAccess(["call_center", "service_advisor", "sc_manager"]);
  const canAccessOperationalDetails = hasRoleAccess(["call_center", "service_advisor", "sc_manager"]);
  const canAssignTechnician = hasRoleAccess(["service_advisor", "sc_manager", "service_engineer"]);
  const canAccessPreferredCommunication = hasRoleAccess(["call_center", "service_advisor", "sc_manager"]);
  const canAccessPickupAddress = hasRoleAccess(["call_center", "service_advisor"]);
  const canAssignServiceCenter = canAccessOperationalDetails;
  const canViewCostEstimation = canAccessEstimatedCost || isInventoryManager;

  // Form state
  const [formData, setFormData] = useState<AppointmentFormType>(() =>
    getInitialAppointmentForm(initialData)
  );

  // Local state for UI
  const [pickupAddressDifferent, setPickupAddressDifferent] = useState(false);
  const [pickupState, setPickupState] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [dropState, setDropState] = useState("");
  const [dropCity, setDropCity] = useState("");
  const [dropSameAsPickup, setDropSameAsPickup] = useState(false);
  const [showServiceCenterSelector, setShowServiceCenterSelector] = useState(false);
  const [serviceCenterSearch, setServiceCenterSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState("");

  const availableServiceCenters = useMemo(
    () => defaultServiceCenters.filter((sc) => sc.status === "Active"),
    []
  );

  const selectedCustomer = customerInfo;
  const selectedVehicle = useMemo(() => {
    // If vehicleInfo is explicitly provided, use it
    if (vehicleInfo) return vehicleInfo;
    
    // If form has a vehicle selected, find it in customer's vehicles
    if (selectedCustomer && formData.vehicle) {
      return selectedCustomer.vehicles?.find(
        (v) => formatVehicleString(v) === formData.vehicle
      ) || null;
    }
    
    // If no vehicle selected but customer has vehicles, use first one
    if (selectedCustomer && selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0) {
      return selectedCustomer.vehicles[0];
    }
    
    return null;
  }, [selectedCustomer, formData.vehicle, vehicleInfo]);

  const nearestServiceCenterId = selectedCustomer?.address
    ? findNearestServiceCenter(selectedCustomer.address)
    : null;
  const nearestServiceCenter = availableServiceCenters.find(
    (center) => center.id === nearestServiceCenterId
  );
  const selectedServiceCenter = availableServiceCenters.find(
    (center) => center.id === formData.serviceCenterId
  );

  const filteredServiceCenters = useMemo(() => {
    const query = serviceCenterSearch.trim().toLowerCase();
    if (!query) return availableServiceCenters;
    return availableServiceCenters.filter((center) =>
      `${center.name} ${center.location}`.toLowerCase().includes(query)
    );
  }, [serviceCenterSearch, availableServiceCenters]);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
      
      // Initialize pickup/drop state and city from initialData
      if (initialData.pickupState) {
        setPickupState(initialData.pickupState);
      }
      if (initialData.pickupCity) {
        setPickupCity(initialData.pickupCity);
      }
      if (initialData.dropState) {
        setDropState(initialData.dropState);
      }
      if (initialData.dropCity) {
        setDropCity(initialData.dropCity);
      }
      // Initialize pickupAddressDifferent if pickup address exists
      if (initialData.pickupAddress) {
        setPickupAddressDifferent(true);
      }
      // Initialize dropSameAsPickup if drop address matches pickup
      if (initialData.dropAddress && 
          initialData.dropAddress === initialData.pickupAddress &&
          initialData.dropState === initialData.pickupState &&
          initialData.dropCity === initialData.pickupCity &&
          initialData.dropPincode === initialData.pickupPincode) {
        setDropSameAsPickup(true);
      }
    }
  }, [initialData]);

  // Update form when customer/vehicle info changes
  useEffect(() => {
    if (selectedCustomer) {
      const customerData = mapCustomerToFormData(selectedCustomer);
      setFormData((prev) => ({
        ...prev,
        // Only populate if field is empty (preserve user edits)
        customerName: prev.customerName || customerData.customerName || "",
        phone: prev.phone || customerData.phone || "",
        whatsappNumber: prev.whatsappNumber || customerData.whatsappNumber || "",
        alternateMobile: prev.alternateMobile || customerData.alternateMobile || "",
        email: prev.email || customerData.email || "",
        address: prev.address || customerData.address || "",
        cityState: prev.cityState || customerData.cityState || "",
        pincode: prev.pincode || customerData.pincode || "",
        customerType: prev.customerType || customerData.customerType || undefined,
      }));
      
      // Auto-select first vehicle if none selected and customer has vehicles
      if (!formData.vehicle && selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0) {
        const firstVehicle = selectedCustomer.vehicles[0];
        setFormData((prev) => ({
          ...prev,
          vehicle: formatVehicleString(firstVehicle),
        }));
        // Notify parent about vehicle selection
        if (onVehicleChange) {
          onVehicleChange(firstVehicle);
        }
      }
    } else if (selectedVehicle && !formData.vehicle) {
      setFormData((prev) => ({
        ...prev,
        vehicle: formatVehicleString(selectedVehicle),
      }));
      // Notify parent about vehicle selection
      if (onVehicleChange) {
        onVehicleChange(selectedVehicle);
      }
    }
  }, [selectedCustomer, selectedVehicle, formData.vehicle, onVehicleChange]);
  
  // Update parent when form vehicle changes (for external vehicle selection)
  useEffect(() => {
    if (formData.vehicle && selectedCustomer && onVehicleChange) {
      const vehicle = selectedCustomer.vehicles?.find(
        (v) => formatVehicleString(v) === formData.vehicle
      );
      if (vehicle) {
        onVehicleChange(vehicle);
      }
    }
  }, [formData.vehicle, selectedCustomer, onVehicleChange]);

  // Auto-populate vehicle fields from selectedVehicle (preserve user edits)
  useEffect(() => {
    if (selectedVehicle) {
      const vehicleData = mapVehicleToFormData(selectedVehicle);
      setFormData((prev) => ({
        ...prev,
        // Only populate if field is empty (preserve user edits)
        vehicleBrand: prev.vehicleBrand || vehicleData.vehicleBrand || "",
        vehicleModel: prev.vehicleModel || vehicleData.vehicleModel || "",
        vehicleYear: prev.vehicleYear || vehicleData.vehicleYear || undefined,
        registrationNumber: prev.registrationNumber || vehicleData.registrationNumber || "",
        vinChassisNumber: prev.vinChassisNumber || vehicleData.vinChassisNumber || "",
        variantBatteryCapacity: prev.variantBatteryCapacity || vehicleData.variantBatteryCapacity || "",
        motorNumber: prev.motorNumber || vehicleData.motorNumber || "",
        chargerSerialNumber: prev.chargerSerialNumber || vehicleData.chargerSerialNumber || "",
        vehicleColor: prev.vehicleColor || vehicleData.vehicleColor || "",
        dateOfPurchase: prev.dateOfPurchase || vehicleData.dateOfPurchase || "",
        warrantyStatus: prev.warrantyStatus || vehicleData.warrantyStatus || "",
        insuranceStartDate: prev.insuranceStartDate || vehicleData.insuranceStartDate || "",
        insuranceEndDate: prev.insuranceEndDate || vehicleData.insuranceEndDate || "",
        insuranceCompanyName: prev.insuranceCompanyName || vehicleData.insuranceCompanyName || "",
      }));
    }
  }, [selectedVehicle]);

  const handleAssignNearestServiceCenter = useCallback(() => {
    if (!selectedCustomer?.address) return;
    const nearestId = findNearestServiceCenter(selectedCustomer.address);
    const nearestCenter = availableServiceCenters.find((sc) => sc.id === nearestId);
    if (nearestId && nearestCenter) {
      setFormData((prev) => ({
        ...prev,
        serviceCenterId: nearestId,
        serviceCenterName: nearestCenter.name,
      }));
    }
  }, [selectedCustomer, availableServiceCenters]);

  const handleSubmit = useCallback(() => {
    // Ensure all state values are synced to formData before submission
    const finalFormData: AppointmentFormType = {
      ...formData,
      // Sync pickup/drop state and city from separate state variables
      pickupState: pickupState || formData.pickupState,
      pickupCity: pickupCity || formData.pickupCity,
      dropState: dropState || formData.dropState,
      dropCity: dropCity || formData.dropCity,
    };
    
    const errors: Record<string, string> = {};
    const missingFields: string[] = [];

    if (!finalFormData.customerName?.trim()) {
      errors.customerName = "Customer Name is required";
      missingFields.push("Customer Name");
    }

    if (!finalFormData.phone?.trim()) {
      errors.phone = "Phone Number is required";
      missingFields.push("Phone Number");
    } else if (!validatePhone(finalFormData.phone)) {
      errors.phone = "Please enter a valid 10-digit phone number";
      missingFields.push("Phone Number (invalid format)");
    }

    if (!finalFormData.vehicle?.trim()) {
      errors.vehicle = "Vehicle is required";
      missingFields.push("Vehicle");
    }

    if (!finalFormData.serviceType?.trim()) {
      errors.serviceType = "Service Type is required";
      missingFields.push("Service Type");
    }

    if (!finalFormData.date?.trim()) {
      errors.date = "Date is required";
      missingFields.push("Date");
    }

    if (!finalFormData.time?.trim()) {
      errors.time = "Time is required";
      missingFields.push("Time");
    } else if (finalFormData.date && isToday(finalFormData.date)) {
      const currentTime = getCurrentTime();
      if (finalFormData.time < currentTime) {
        errors.time = "Cannot schedule appointment for a past time on today's date";
        missingFields.push("Time");
      }
    }

    if (isCallCenter && !finalFormData.customerComplaintIssue?.trim()) {
      errors.customerComplaintIssue = "Customer Complaint / Issue Description is required";
      missingFields.push("Customer Complaint / Issue Description");
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const errorMessage = `Please fill the following mandatory fields: ${missingFields.join(", ")}`;
      setValidationError(errorMessage);
      return;
    }

    setValidationError("");
    setFieldErrors({});
    onSubmit(finalFormData);
  }, [formData, pickupState, pickupCity, dropState, dropCity, isCallCenter, onSubmit]);

  const updateFormData = useCallback((updates: Partial<AppointmentFormType>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear field errors when user starts typing
    const fieldKeys = Object.keys(updates);
    if (fieldKeys.length > 0 && fieldErrors[fieldKeys[0]]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        fieldKeys.forEach((key) => delete newErrors[key]);
        return newErrors;
      });
    }
  }, [fieldErrors]);

  // Document handlers
  const [cameraDocumentType, setCameraDocumentType] = useState<"customerIdProof" | "vehicleRCCopy" | "warrantyCardServiceBook" | "photosVideos" | null>(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  const handleDocumentUpload = useCallback(
    (field: "customerIdProof" | "vehicleRCCopy" | "warrantyCardServiceBook" | "photosVideos", files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const existingFiles = formData[field]?.files || [];
      const existingUrls = formData[field]?.urls || [];

      const newUrls = fileArray.map((file) => URL.createObjectURL(file));

      updateFormData({
        [field]: {
          files: [...existingFiles, ...fileArray],
          urls: [...existingUrls, ...newUrls],
        },
      });
    },
    [formData, updateFormData]
  );

  const handleRemoveDocument = useCallback(
    (field: "customerIdProof" | "vehicleRCCopy" | "warrantyCardServiceBook" | "photosVideos", index: number) => {
      const existingFiles = formData[field]?.files || [];
      const existingUrls = formData[field]?.urls || [];

      // Revoke URL to free memory
      if (existingUrls[index]) {
        URL.revokeObjectURL(existingUrls[index]);
      }

      const newFiles = existingFiles.filter((_, i) => i !== index);
      const newUrls = existingUrls.filter((_, i) => i !== index);

      updateFormData({
        [field]: {
          files: newFiles,
          urls: newUrls,
        },
      });
    },
    [formData, updateFormData]
  );

  const handleOpenCamera = useCallback(
    (field: "customerIdProof" | "vehicleRCCopy" | "warrantyCardServiceBook" | "photosVideos") => {
      setCameraDocumentType(field);
      setCameraModalOpen(true);
    },
    []
  );

  const handleCameraCapture = useCallback(
    (file: File) => {
      if (!cameraDocumentType) return;

      const newUrl = URL.createObjectURL(file);
      const existingFiles = formData[cameraDocumentType]?.files || [];
      const existingUrls = formData[cameraDocumentType]?.urls || [];

      updateFormData({
        [cameraDocumentType]: {
          files: [...existingFiles, file],
          urls: [...existingUrls, newUrl],
        },
      });

      setCameraModalOpen(false);
      setCameraDocumentType(null);
    },
    [cameraDocumentType, formData, updateFormData]
  );

  return (
    <div className="space-y-6 p-6">
      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800">{validationError}</p>
        </div>
      )}

      {/* Customer Selection (if enabled) */}
      {showCustomerSelection && onCustomerSelect && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
          {/* Customer search would be handled by parent component */}
        </div>
      )}

      {/* Vehicle Selection */}
      <div>
        {selectedCustomer && selectedCustomer.vehicles && selectedCustomer.vehicles.length > 1 ? (
          <FormSelect
            label="Vehicle"
            required
            value={formData.vehicle}
            onChange={(e) => {
              const selectedVehicleValue = e.target.value;
              updateFormData({ vehicle: selectedVehicleValue });
              
              // Find and notify parent about vehicle change
              if (selectedCustomer && onVehicleChange) {
                const vehicle = selectedCustomer.vehicles?.find(
                  (v) => formatVehicleString(v) === selectedVehicleValue
                );
                onVehicleChange(vehicle || null);
              }
            }}
            placeholder="Select vehicle"
            options={selectedCustomer.vehicles.map((v) => ({
              value: formatVehicleString(v),
              label: `${formatVehicleString(v)}${v.registration ? ` - ${v.registration}` : ""}`,
            }))}
            error={fieldErrors.vehicle}
          />
        ) : (
          <FormInput
            label="Vehicle"
            required
            value={formData.vehicle}
            onChange={() => {}}
            readOnly
            error={fieldErrors.vehicle}
          />
        )}
        {selectedCustomer && formData.vehicle && selectedVehicle?.lastServiceCenterName && (
          <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
            <Building2 size={12} />
            Last serviced at: {selectedVehicle.lastServiceCenterName}
          </p>
        )}
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
            value={formData.vehicleBrand || ""}
            onChange={(e) => updateFormData({ vehicleBrand: e.target.value })}
            placeholder="Enter vehicle brand"
          />
          <FormInput
            label="Vehicle Model"
            value={formData.vehicleModel || ""}
            onChange={(e) => updateFormData({ vehicleModel: e.target.value })}
            placeholder="Enter vehicle model"
          />
          <FormInput
            label="Registration Number"
            value={formData.registrationNumber || ""}
            onChange={(e) => updateFormData({ registrationNumber: e.target.value.toUpperCase() })}
            placeholder="Enter registration number"
          />
          <FormInput
            label="VIN / Chassis Number"
            value={formData.vinChassisNumber || ""}
            onChange={(e) => updateFormData({ vinChassisNumber: e.target.value.toUpperCase() })}
            placeholder="Enter VIN/Chassis number"
          />
          <FormInput
            label="Variant / Battery Capacity"
            value={formData.variantBatteryCapacity || ""}
            onChange={(e) => updateFormData({ variantBatteryCapacity: e.target.value })}
            placeholder="Enter variant/battery capacity"
          />
          <FormInput
            label="Motor Number"
            value={formData.motorNumber || ""}
            onChange={(e) => updateFormData({ motorNumber: e.target.value })}
            placeholder="Enter motor number"
          />
          <FormInput
            label="Charger Serial Number"
            value={formData.chargerSerialNumber || ""}
            onChange={(e) => updateFormData({ chargerSerialNumber: e.target.value })}
            placeholder="Enter charger serial number"
          />
          <div>
            <FormInput
              label="Date of Purchase"
              type="date"
              value={formData.dateOfPurchase || ""}
              onChange={(e) => updateFormData({ dateOfPurchase: e.target.value })}
            />
            {formData.dateOfPurchase && (() => {
              const purchaseDate = new Date(formData.dateOfPurchase);
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
            value={formData.warrantyStatus || ""}
            onChange={(e) => updateFormData({ warrantyStatus: e.target.value })}
            placeholder="Select warranty status"
            options={[
              { value: "", label: "Select warranty status" },
              { value: "Active", label: "Active" },
              { value: "Expired", label: "Expired" },
              { value: "Not Applicable", label: "Not Applicable" },
            ]}
          />
          <FormInput
            label="Insurance Start Date"
            type="date"
            value={formData.insuranceStartDate || ""}
            onChange={(e) => updateFormData({ insuranceStartDate: e.target.value })}
          />
          <FormInput
            label="Insurance End Date"
            type="date"
            value={formData.insuranceEndDate || ""}
            onChange={(e) => updateFormData({ insuranceEndDate: e.target.value })}
          />
          <FormInput
            label="Insurance Company Name"
            value={formData.insuranceCompanyName || ""}
            onChange={(e) => updateFormData({ insuranceCompanyName: e.target.value })}
            placeholder="Enter insurance company name"
          />
          <FormInput
            label="Vehicle Color"
            value={formData.vehicleColor || ""}
            onChange={(e) => updateFormData({ vehicleColor: e.target.value })}
            placeholder="Enter vehicle color"
          />
        </div>
      </div>
      {/* Service Type */}
      <FormSelect
        label="Service Type"
        required
        value={formData.serviceType}
        onChange={(e) => updateFormData({ serviceType: e.target.value })}
        placeholder="Select service type"
        options={SERVICE_TYPE_OPTIONS.map((type) => ({ value: type, label: type }))}
        error={fieldErrors.serviceType}
      />

      {/* Service Center Selection */}
      {canAssignServiceCenter && (
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
                      : formData.serviceCenterName || "Select a service center"}
                  </span>
                  <Search size={16} className="text-gray-400" />
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
          {formData.serviceCenterId && selectedServiceCenter && (
            <p className="text-xs text-gray-500">
              Selected center: {selectedServiceCenter.name} • {selectedServiceCenter.location}
            </p>
          )}
        </div>
      )}

      {/* Service Details Section */}
      {canAccessServiceDetails && (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="text-purple-600" size={20} />
            Service Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Complaint / Issue Description {isCallCenter && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={formData.customerComplaintIssue || ""}
                onChange={(e) => updateFormData({ customerComplaintIssue: e.target.value })}
                rows={3}
                placeholder="Describe the customer complaint or issue..."
                className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:outline-none text-gray-900 transition-all duration-200 resize-none ${
                  fieldErrors.customerComplaintIssue
                    ? "bg-red-50 border-2 border-red-300 focus:ring-red-500/20 focus:border-red-500"
                    : "border border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50 focus:bg-white"
                }`}
                required={isCallCenter}
              />
              {fieldErrors.customerComplaintIssue && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span className="text-red-500">•</span>
                  {fieldErrors.customerComplaintIssue}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Previous Service History
              </label>
              <textarea
                value={formData.previousServiceHistory || ""}
                onChange={(e) => updateFormData({ previousServiceHistory: e.target.value })}
                rows={3}
                placeholder="Enter previous service history..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none text-gray-900 transition-all duration-200 bg-gray-50/50 focus:bg-white resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Estimated Service Time"
                value={formData.estimatedServiceTime || ""}
                onChange={(e) => updateFormData({ estimatedServiceTime: e.target.value })}
                placeholder="e.g., 2 hours"
              />
              {canAccessEstimatedCost && (
                <FormInput
                  label="Estimated Cost"
                  type="number"
                  value={formData.estimatedCost || ""}
                  onChange={(e) => updateFormData({ estimatedCost: e.target.value })}
                  placeholder="Enter estimated cost"
                />
              )}
            </div>
            {canAccessOdometer && (
              <FormInput
                label="Odometer Reading"
                type="number"
                value={formData.odometerReading || ""}
                onChange={(e) => updateFormData({ odometerReading: e.target.value })}
                placeholder="Enter odometer reading"
              />
            )}
          </div>
        </div>
      )}


      {/* Documentation Section */}
      {(hasDocUploadAccess || hasDropoffMediaAccess) && (
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200">
          <h4 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded"></span>
            Documentation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hasDocUploadAccess && (
              <>
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
                    {formData.customerIdProof?.files && formData.customerIdProof.files.length > 0 && (
                      <div className="space-y-2">
                        {formData.customerIdProof.files.map((file, index) => (
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
                    {formData.vehicleRCCopy?.files && formData.vehicleRCCopy.files.length > 0 && (
                      <div className="space-y-2">
                        {formData.vehicleRCCopy.files.map((file, index) => (
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
                    {formData.warrantyCardServiceBook?.files && formData.warrantyCardServiceBook.files.length > 0 && (
                      <div className="space-y-2">
                        {formData.warrantyCardServiceBook.files.map((file, index) => (
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
              </>
            )}
            {hasDropoffMediaAccess && (
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
                  {formData.photosVideos?.files && formData.photosVideos.files.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {formData.photosVideos.files.map((file, index) => (
                        <div key={index} className="relative group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                          {file.type.startsWith("image/") ? (
                            <Image
                              src={formData.photosVideos?.urls[index] || ""}
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
            )}
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {cameraModalOpen && cameraDocumentType && (
        <CameraModal
          isOpen={cameraModalOpen}
          onClose={() => {
            setCameraModalOpen(false);
            setCameraDocumentType(null);
          }}
          onCapture={handleCameraCapture}
        />
      )}

    

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormInput
            label="Date"
            required
            type="date"
            value={formData.date}
            onChange={(e) => {
              const newDate = e.target.value;
              let updatedTime = formData.time;
              if (isToday(newDate) && formData.time) {
                const currentTime = getCurrentTime();
                if (formData.time < currentTime) {
                  updatedTime = currentTime;
                }
              }
              updateFormData({ date: newDate, time: updatedTime });
            }}
            min={getCurrentDate()}
            error={fieldErrors.date}
          />
        </div>
        <FormInput
          label="Time"
          required
          type="time"
          value={formData.time}
          onChange={(e) => {
            const selectedTime = e.target.value;
            if (formData.date && isToday(formData.date)) {
              const currentTime = getCurrentTime();
              if (selectedTime < currentTime) {
                return;
              }
            }
            updateFormData({ time: selectedTime });
          }}
          min={formData.date ? getMinTime(formData.date) : undefined}
          error={fieldErrors.time}
        />
      </div>

      {/* Operational Details Section */}
      {canAccessOperationalDetails && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="text-blue-600" size={20} />
            Operational Details
          </h3>
          <div className="space-y-4">
            {(isServiceAdvisor || isServiceManager) && (
              <FormInput
                label="Estimated Delivery Date"
                type="date"
                value={formData.estimatedDeliveryDate || ""}
                onChange={(e) => updateFormData({ estimatedDeliveryDate: e.target.value })}
              />
            )}
            {(isServiceAdvisor || isServiceManager) && (
              <FormInput
                label="Assigned Service Advisor"
                value={formData.assignedServiceAdvisor || ""}
                onChange={(e) => updateFormData({ assignedServiceAdvisor: e.target.value })}
                placeholder="Enter service advisor name"
              />
            )}
            {canAssignTechnician && (
              <FormInput
                label="Assigned Technician"
                value={formData.assignedTechnician || ""}
                onChange={(e) => updateFormData({ assignedTechnician: e.target.value })}
                placeholder="Enter technician name"
              />
            )}
            {/* Pickup / Drop Required */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pickupDropRequired || false}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    updateFormData({
                      pickupDropRequired: checked,
                      ...(checked
                        ? {}
                        : {
                            pickupAddress: undefined,
                            pickupState: undefined,
                            pickupCity: undefined,
                            pickupPincode: undefined,
                            dropAddress: undefined,
                            dropState: undefined,
                            dropCity: undefined,
                            dropPincode: undefined,
                          }),
                    });
                    if (!checked) {
                      setPickupAddressDifferent(false);
                      setPickupState("");
                      setPickupCity("");
                      setDropState("");
                      setDropCity("");
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Pickup / Drop Required</span>
              </label>
              {formData.pickupDropRequired && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pickupAddressDifferent}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPickupAddressDifferent(checked);
                        if (!checked) {
                          updateFormData({
                            pickupAddress: undefined,
                            pickupState: undefined,
                            pickupCity: undefined,
                            pickupPincode: undefined,
                            dropAddress: undefined,
                            dropState: undefined,
                            dropCity: undefined,
                            dropPincode: undefined,
                          });
                          setPickupState("");
                          setPickupCity("");
                          setDropState("");
                          setDropCity("");
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      Pickup / Drop address is different from customer address
                    </span>
                  </label>
                  {pickupAddressDifferent && canAccessPickupAddress && (
                    <>
                      {/* Pickup Address Section */}
                      <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="text-md font-semibold text-gray-800 mb-3">Pickup Address</h4>
                        <FormInput
                          label="Address"
                          value={formData.pickupAddress || ""}
                          onChange={(e) => {
                            updateFormData({
                              pickupAddress: e.target.value,
                              ...(dropSameAsPickup ? { dropAddress: e.target.value } : {}),
                            });
                          }}
                          placeholder="Enter full address"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormSelect
                            label="State"
                            value={pickupState}
                            onChange={(e) => {
                              const newState = e.target.value;
                              setPickupState(newState);
                              setPickupCity("");
                              updateFormData({
                                pickupState: newState,
                                pickupCity: undefined,
                                ...(dropSameAsPickup
                                  ? {
                                      dropState: newState,
                                      dropCity: undefined,
                                    }
                                  : {}),
                              });
                              if (dropSameAsPickup) {
                                setDropState(newState);
                                setDropCity("");
                              }
                            }}
                            placeholder="Select State"
                            options={INDIAN_STATES.map((state) => ({ value: state.name, label: state.name }))}
                          />
                          <FormSelect
                            label="City"
                            value={pickupCity}
                            onChange={(e) => {
                              const newCity = e.target.value;
                              setPickupCity(newCity);
                              updateFormData({
                                pickupCity: newCity,
                                ...(dropSameAsPickup ? { dropCity: newCity } : {}),
                              });
                              if (dropSameAsPickup) {
                                setDropCity(newCity);
                              }
                            }}
                            placeholder={pickupState ? "Select City" : "Select State First"}
                            options={
                              pickupState
                                ? getCitiesByState(pickupState).map((city) => ({ value: city, label: city }))
                                : []
                            }
                            disabled={!pickupState}
                          />
                        </div>
                        <FormInput
                          label="PIN Code"
                          value={formData.pickupPincode || ""}
                          onChange={(e) => {
                            const newPincode = e.target.value.replace(/\D/g, "").slice(0, 6);
                            updateFormData({
                              pickupPincode: newPincode,
                              ...(dropSameAsPickup ? { dropPincode: newPincode } : {}),
                            });
                          }}
                          placeholder="6-digit PIN code"
                          maxLength={6}
                        />
                      </div>
                      {/* Drop Address Section */}
                      <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-md font-semibold text-gray-800">Drop Address</h4>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={dropSameAsPickup}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setDropSameAsPickup(checked);
                                if (checked) {
                                  setDropState(pickupState);
                                  setDropCity(pickupCity);
                                  updateFormData({
                                    dropAddress: formData.pickupAddress,
                                    dropState: formData.pickupState,
                                    dropCity: formData.pickupCity,
                                    dropPincode: formData.pickupPincode,
                                  });
                                } else {
                                  setDropState("");
                                  setDropCity("");
                                  updateFormData({
                                    dropAddress: undefined,
                                    dropState: undefined,
                                    dropCity: undefined,
                                    dropPincode: undefined,
                                  });
                                }
                              }}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Same as pickup address</span>
                          </label>
                        </div>
                        <FormInput
                          label="Address"
                          value={formData.dropAddress || ""}
                          onChange={(e) => updateFormData({ dropAddress: e.target.value })}
                          placeholder="Enter full address"
                          readOnly={dropSameAsPickup}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormSelect
                            label="State"
                            value={dropState}
                            onChange={(e) => {
                              setDropState(e.target.value);
                              setDropCity("");
                              updateFormData({ dropState: e.target.value, dropCity: undefined });
                            }}
                            placeholder="Select State"
                            options={INDIAN_STATES.map((state) => ({ value: state.name, label: state.name }))}
                            disabled={dropSameAsPickup}
                          />
                          <FormSelect
                            label="City"
                            value={dropCity}
                            onChange={(e) => {
                              setDropCity(e.target.value);
                              updateFormData({ dropCity: e.target.value });
                            }}
                            placeholder={dropState ? "Select City" : "Select State First"}
                            options={
                              dropState
                                ? getCitiesByState(dropState).map((city) => ({ value: city, label: city }))
                                : []
                            }
                            disabled={!dropState || dropSameAsPickup}
                          />
                        </div>
                        <FormInput
                          label="PIN Code"
                          value={formData.dropPincode || ""}
                          onChange={(e) =>
                            updateFormData({ dropPincode: e.target.value.replace(/\D/g, "").slice(0, 6) })
                          }
                          placeholder="6-digit PIN code"
                          maxLength={6}
                          readOnly={dropSameAsPickup}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* Preferred Communication Mode */}
            {canAccessPreferredCommunication && (
              <FormSelect
                label="Preferred Communication Mode"
                value={formData.preferredCommunicationMode || ""}
                onChange={(e) =>
                  updateFormData({
                    preferredCommunicationMode: e.target.value as
                      | "Phone"
                      | "Email"
                      | "SMS"
                      | "WhatsApp"
                      | undefined,
                  })
                }
                placeholder="Select communication mode"
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

      {/* Cost Estimation */}
      {canViewCostEstimation && formData.estimatedCost && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="text-indigo-600" size={20} />
            Cost Estimation
          </h3>
          <div className="space-y-4">
            <FormInput
              label="Estimated Cost"
              value={formData.estimatedCost ? `₹${formData.estimatedCost}` : ""}
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

      {/* Validation Errors */}
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

      {/* Customer Arrival Section (Service Advisor Only) */}
      {isServiceAdvisor && 
       onCustomerArrived && 
       appointmentStatus && 
       appointmentStatus !== "In Progress" && 
       appointmentStatus !== "Sent to Manager" && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-blue-600" />
            Customer Arrival
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Mark customer arrival status. This will update the appointment status when you save.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                if (onCustomerArrived) {
                  // Ensure all state values are synced to formData
                  const finalFormData: AppointmentFormType = {
                    ...formData,
                    pickupState: pickupState || formData.pickupState,
                    pickupCity: pickupCity || formData.pickupCity,
                    dropState: dropState || formData.dropState,
                    dropCity: dropCity || formData.dropCity,
                  };
                  onCustomerArrived(finalFormData);
                }
              }}
              className="flex-1 px-4 py-3 rounded-lg font-medium transition bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Customer Arrived
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-lg font-medium transition bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Customer Not Arrived
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          Cancel
        </button>
        {customerArrived && onCreateQuotation ? (
          <button
            onClick={() => {
              if (onCreateQuotation) {
                // Ensure all state values are synced to formData
                const finalFormData: AppointmentFormType = {
                  ...formData,
                  pickupState: pickupState || formData.pickupState,
                  pickupCity: pickupCity || formData.pickupCity,
                  dropState: dropState || formData.dropState,
                  dropCity: dropCity || formData.dropCity,
                };
                onCreateQuotation(finalFormData);
              }
            }}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <FileText size={18} />
            Create Quotation
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
          >
            {mode === "edit" ? "Update Appointment" : "Schedule Appointment"}
          </button>
        )}
      </div>

      {/* Service Center Selector Modal */}
      {showServiceCenterSelector && (
        <div className="fixed inset-0 z-1100 bg-black/40 flex items-center justify-center p-4">
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
                      updateFormData({
                        serviceCenterId: center.id,
                        serviceCenterName: center.name,
                      });
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
  );
};

