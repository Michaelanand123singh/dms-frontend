"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Calendar,
  Clock,
  Building2,
  FileText,
  Upload,
  Search,
  X,
  CheckCircle,
} from "lucide-react";
import { useRole } from "@/shared/hooks";
import { defaultServiceCenters } from "@/__mocks__/data/service-centers.mock";
import { SERVICE_TYPE_OPTIONS } from "@/shared/constants/service-types";
import { INDIAN_STATES, getCitiesByState } from "@/shared/constants/indian-states-cities";
import { FormInput, FormSelect } from "@/app/(service-center)/sc/components/shared/FormElements";
import { formatVehicleString } from "@/app/(service-center)/sc/components/shared/vehicle-utils";
import { findNearestServiceCenter } from "@/app/(service-center)/sc/components/appointment/types";
import type { CustomerWithVehicles, Vehicle } from "@/shared/types";
import type { AppointmentForm as AppointmentFormType } from "@/app/(service-center)/sc/components/appointment/types";
import { INITIAL_APPOINTMENT_FORM } from "@/app/(service-center)/sc/components/appointment/types";

// Helper functions
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
  return undefined;
};

const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s-+]/g, "").replace(/^91/, "");
  return cleaned.length === 10 && /^\d{10}$/.test(cleaned);
};

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
  const canAccessPostServiceSurvey = hasRoleAccess(["call_center", "service_advisor", "sc_manager", "service_engineer"]);
  const canAccessServiceStatus = hasRoleAccess(["call_center", "service_advisor", "sc_manager", "service_engineer"]);
  const canAccessAMCStatus = hasRoleAccess(["call_center", "service_advisor", "sc_manager"]);
  const canViewCostEstimation = canAccessEstimatedCost || isInventoryManager;

  // Form state
  const [formData, setFormData] = useState<AppointmentFormType>(() => ({
    ...INITIAL_APPOINTMENT_FORM,
    date: getCurrentDate(),
    time: getCurrentTime(),
    ...initialData,
  }));

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
    }
  }, [initialData]);

  // Update form when customer/vehicle info changes
  useEffect(() => {
    if (selectedCustomer) {
      setFormData((prev) => ({
        ...prev,
        customerName: selectedCustomer.name || prev.customerName,
        phone: selectedCustomer.phone || prev.phone,
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
    const errors: Record<string, string> = {};
    const missingFields: string[] = [];

    if (!formData.customerName?.trim()) {
      errors.customerName = "Customer Name is required";
      missingFields.push("Customer Name");
    }

    if (!formData.phone?.trim()) {
      errors.phone = "Phone Number is required";
      missingFields.push("Phone Number");
    } else if (!validatePhone(formData.phone)) {
      errors.phone = "Please enter a valid 10-digit phone number";
      missingFields.push("Phone Number (invalid format)");
    }

    if (!formData.vehicle?.trim()) {
      errors.vehicle = "Vehicle is required";
      missingFields.push("Vehicle");
    }

    if (!formData.serviceType?.trim()) {
      errors.serviceType = "Service Type is required";
      missingFields.push("Service Type");
    }

    if (!formData.date?.trim()) {
      errors.date = "Date is required";
      missingFields.push("Date");
    }

    if (!formData.time?.trim()) {
      errors.time = "Time is required";
      missingFields.push("Time");
    } else if (formData.date && isToday(formData.date)) {
      const currentTime = getCurrentTime();
      if (formData.time < currentTime) {
        errors.time = "Cannot schedule appointment for a past time on today's date";
        missingFields.push("Time");
      }
    }

    if (isCallCenter && !formData.customerComplaintIssue?.trim()) {
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
    onSubmit(formData);
  }, [formData, isCallCenter, onSubmit]);

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

      {/* Customer Type */}
      {canAccessCustomerType && (
        <FormSelect
          label="Customer Type"
          value={formData.customerType || ""}
          onChange={(e) => updateFormData({ customerType: e.target.value as "B2C" | "B2B" | undefined })}
          placeholder="Select customer type"
          options={[
            { value: "B2C", label: "B2C" },
            { value: "B2B", label: "B2B" },
          ]}
        />
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
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Upload className="text-amber-600" size={20} />
            Documentation
          </h3>
          <div className="space-y-4">
            {hasDocUploadAccess && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer ID Proof <span className="text-xs font-normal text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const urls = files.map((file) => URL.createObjectURL(file));
                      updateFormData({
                        customerIdProof: { files, urls },
                      });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none text-gray-900 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                  />
                  {formData.customerIdProof?.files && formData.customerIdProof.files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.customerIdProof.files.map((file, index) => (
                        <span key={index} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                          {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vehicle RC Copy <span className="text-xs font-normal text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const urls = files.map((file) => URL.createObjectURL(file));
                      updateFormData({
                        vehicleRCCopy: { files, urls },
                      });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none text-gray-900 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                  />
                  {formData.vehicleRCCopy?.files && formData.vehicleRCCopy.files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.vehicleRCCopy.files.map((file, index) => (
                        <span key={index} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                          {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Warranty Card / Service Book
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const urls = files.map((file) => URL.createObjectURL(file));
                      updateFormData({
                        warrantyCardServiceBook: { files, urls },
                      });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none text-gray-900 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                  />
                  {formData.warrantyCardServiceBook?.files && formData.warrantyCardServiceBook.files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.warrantyCardServiceBook.files.map((file, index) => (
                        <span key={index} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                          {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            {hasDropoffMediaAccess && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Photos/Videos of Vehicle at Drop-off
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const urls = files.map((file) => URL.createObjectURL(file));
                    updateFormData({
                      photosVideos: { files, urls },
                    });
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none text-gray-900 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                />
                {formData.photosVideos?.files && formData.photosVideos.files.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.photosVideos.files.map((file, index) => (
                      <span key={index} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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

      {/* Post-Service Feedback */}
      {canAccessPostServiceSurvey && (
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-teal-600" size={20} />
            Post-Service Feedback
          </h3>
          <div className="space-y-4">
            {/* Service Status */}
            {canAccessServiceStatus && (
              <FormSelect
                label="Service Status"
                value={formData.serviceStatus || ""}
                onChange={(e) => updateFormData({ serviceStatus: e.target.value })}
                placeholder="Select service status"
                options={[
                  { value: "Pending", label: "Pending" },
                  { value: "In Service", label: "In Service" },
                  { value: "Ready for Delivery", label: "Ready for Delivery" },
                  { value: "Delivered", label: "Delivered" },
                  { value: "Cancelled", label: "Cancelled" },
                ]}
              />
            )}

            {/* Feedback Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Feedback Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => updateFormData({ feedbackRating: rating })}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      formData.feedbackRating === rating
                        ? "bg-teal-600 text-white scale-110"
                        : "bg-gray-200 text-gray-600 hover:bg-teal-100 hover:text-teal-700"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
                {formData.feedbackRating && (
                  <span className="text-sm text-gray-600 ml-2">
                    {formData.feedbackRating === 5
                      ? "Excellent"
                      : formData.feedbackRating === 4
                      ? "Very Good"
                      : formData.feedbackRating === 3
                      ? "Good"
                      : formData.feedbackRating === 2
                      ? "Fair"
                      : "Poor"}
                  </span>
                )}
              </div>
            </div>

            {/* Next Service Due Date */}
            {canAccessServiceStatus && (
              <FormInput
                label="Next Service Due Date"
                type="date"
                value={formData.nextServiceDueDate || ""}
                onChange={(e) => updateFormData({ nextServiceDueDate: e.target.value })}
                placeholder="Select next service due date"
              />
            )}

            {/* AMC / Subscription Status */}
            {canAccessAMCStatus && (
              <FormSelect
                label="AMC / Subscription Status"
                value={formData.amcSubscriptionStatus || ""}
                onChange={(e) => updateFormData({ amcSubscriptionStatus: e.target.value })}
                placeholder="Select AMC/Subscription status"
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Expired", label: "Expired" },
                  { value: "Not Applicable", label: "Not Applicable" },
                  { value: "Pending Renewal", label: "Pending Renewal" },
                ]}
              />
            )}
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

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
        >
          {mode === "edit" ? "Update Appointment" : "Schedule Appointment"}
        </button>
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

