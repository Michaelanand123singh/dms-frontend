"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Calendar,
  Clock,
  User,
  Car,
  Phone,
  CheckCircle,
  AlertTriangle,
  Building2,
  Upload,
  FileText,
  Search,
  X,
} from "lucide-react";
import { useCustomerSearch } from "../../../../../hooks/api";
import { useRole } from "@/shared/hooks";
import { defaultServiceCenters } from "@/__mocks__/data/service-centers.mock";
import { SERVICE_TYPE_OPTIONS } from "@/shared/constants/service-types";
import { FormInput, FormSelect, Modal } from "../shared/FormElements";
import { CustomerInfoCard, ErrorAlert } from "../shared/InfoComponents";
import { formatVehicleString } from "../shared/vehicle-utils";
import {
  Appointment,
  AppointmentForm,
  INITIAL_APPOINTMENT_FORM,
  countAppointmentsForDate,
  findNearestServiceCenter,
  getMaxAppointmentsPerDay,
  validateAppointmentForm,
} from "../appointment/types";
import type { CustomerWithVehicles, Vehicle } from "@/shared/types";

const AVAILABLE_SERVICE_CENTERS = defaultServiceCenters.filter((sc) => sc.status === "Active");

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: AppointmentForm) => void;
  existingAppointments?: Appointment[];
  initialForm?: AppointmentForm;
  mode?: "create" | "edit";
  fixedCustomer?: CustomerWithVehicles;
  fixedVehicle?: Vehicle;
  allowCustomerSelection?: boolean;
}

export const AppointmentModal = ({
  open,
  onClose,
  onSubmit,
  existingAppointments = [],
  initialForm,
  mode = "create",
  fixedCustomer,
  fixedVehicle,
  allowCustomerSelection = true,
}: AppointmentModalProps) => {
  const { userRole, userInfo } = useRole();
  const isCallCenter = userRole === "call_center";
  const isServiceAdvisor = userRole === "service_advisor";
  const [appointmentForm, setAppointmentForm] = useState<AppointmentForm>({
    ...INITIAL_APPOINTMENT_FORM,
    ...initialForm,
  });
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithVehicles | null>(fixedCustomer || null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState(fixedCustomer?.name || "");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [serviceCenterSearch, setServiceCenterSearch] = useState("");
  const [showServiceCenterSelector, setShowServiceCenterSelector] = useState(false);
  const [pickupAddressDifferent, setPickupAddressDifferent] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const customerSearch = useCustomerSearch();
  const customerSearchResults: CustomerWithVehicles[] = customerSearch.results;
  const customerSearchLoading = customerSearch.loading;

  useEffect(() => {
    if (open) {
      setAppointmentForm((prev) => ({
        ...INITIAL_APPOINTMENT_FORM,
        ...initialForm,
      }));
      if (fixedCustomer) {
        setSelectedCustomer(fixedCustomer);
        setCustomerSearchQuery(fixedCustomer.name);
        setShowCustomerDropdown(false);
      }
      if (fixedVehicle) {
        setAppointmentForm((prev) => ({
          ...prev,
          vehicle: formatVehicleString(fixedVehicle),
        }));
      }
    }
  }, [open, initialForm, fixedCustomer, fixedVehicle]);

  const filteredServiceCenters = useMemo(() => {
    const query = serviceCenterSearch.trim().toLowerCase();
    if (!query) return AVAILABLE_SERVICE_CENTERS;
    return AVAILABLE_SERVICE_CENTERS.filter((center) =>
      `${center.name} ${center.location}`.toLowerCase().includes(query)
    );
  }, [serviceCenterSearch]);

  const nearestServiceCenterId = selectedCustomer?.address
    ? findNearestServiceCenter(selectedCustomer.address)
    : null;
  const nearestServiceCenter = AVAILABLE_SERVICE_CENTERS.find(
    (center) => center.id === nearestServiceCenterId
  );
  const selectedServiceCenter = AVAILABLE_SERVICE_CENTERS.find(
    (center) => center.id === appointmentForm.serviceCenterId
  );

  const selectedVehicle = useMemo(() => {
    if (!selectedCustomer || !appointmentForm.vehicle) return null;
    return selectedCustomer.vehicles?.find(
      (v) => formatVehicleString(v) === appointmentForm.vehicle
    );
  }, [selectedCustomer, appointmentForm.vehicle]);

  const serviceCenterName = userInfo?.serviceCenter ?? appointmentForm.serviceCenterName;

  const handleCustomerSearchChange = useCallback(
    (query: string) => {
      setCustomerSearchQuery(query);
      if (query.trim().length === 0) {
        setShowCustomerDropdown(false);
        customerSearch.clear();
        return;
      }
      setShowCustomerDropdown(true);
      customerSearch.search(query, "name");
    },
    [customerSearch]
  );

  const handleCustomerSelect = useCallback(
    (customer: CustomerWithVehicles) => {
      setSelectedCustomer(customer);
      setCustomerSearchQuery(customer.name);
      setShowCustomerDropdown(false);
      customerSearch.clear();

      const firstVehicle = customer.vehicles && customer.vehicles.length > 0
        ? formatVehicleString(customer.vehicles[0])
        : "";

      setAppointmentForm((prev) => ({
        ...prev,
        customerName: customer.name,
        phone: customer.phone,
        vehicle: firstVehicle,
      }));
    },
    [customerSearch]
  );

  const renderCustomerSearchResult = useCallback(
    (customer: CustomerWithVehicles) => (
      <div
        key={customer.id}
        onClick={() => handleCustomerSelect(customer)}
        className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-100">
            <User className="text-indigo-600" size={16} strokeWidth={2} />
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
          {selectedCustomer?.id === customer.id && (
            <CheckCircle className="text-indigo-600 shrink-0" size={18} strokeWidth={2} />
          )}
        </div>
      </div>
    ),
    [handleCustomerSelect, selectedCustomer]
  );

  const handleAssignNearestServiceCenter = useCallback(() => {
    if (!selectedCustomer?.address) return;
    const nearestId = findNearestServiceCenter(selectedCustomer.address);
    const nearestCenter = AVAILABLE_SERVICE_CENTERS.find((sc) => sc.id === nearestId);
    if (nearestId) {
      setAppointmentForm((prev) => ({
        ...prev,
        serviceCenterId: nearestId,
        serviceCenterName: nearestCenter?.name,
      }));
    }
  }, [selectedCustomer]);

  const handleSubmit = () => {
    const error = validateAppointmentForm(appointmentForm, isCallCenter);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError("");
    onSubmit(appointmentForm);
  };

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

  if (!open) return null;

  const currentCount = countAppointmentsForDate(existingAppointments, appointmentForm.date);
  const maxAppointments = getMaxAppointmentsPerDay(serviceCenterName);
  const remaining = maxAppointments - currentCount;
  const isNearLimit = remaining <= 3 && remaining > 0;
  const isAtLimit = remaining <= 0;

  return (
    <Modal
      title={mode === "edit" ? "Edit Appointment" : "Schedule Appointment"}
      onClose={() => {
        setValidationError("");
        onClose();
      }}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 p-6">
        {validationError && <ErrorAlert message={validationError} />}

        {allowCustomerSelection && !selectedCustomer && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
            <div className="relative" ref={customerDropdownRef}>
              <FormInput
                label="Customer Name"
                required
                value={customerSearchQuery}
                onChange={(e) => handleCustomerSearchChange(e.target.value)}
                placeholder="Start typing customer name..."
              />
              {showCustomerDropdown && customerSearchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {customerSearchResults.map((result) => renderCustomerSearchResult(result as CustomerWithVehicles))}
                </div>
              )}
              {customerSearchLoading && (
                <div className="absolute right-3 top-10 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}

        {selectedCustomer && (
          <CustomerInfoCard customer={selectedCustomer} title="Customer Information (Pre-filled)" />
        )}

        <div className="space-y-4">
          <FormInput
            label="Customer Name"
            required
            value={selectedCustomer?.name || appointmentForm.customerName}
            onChange={() => {}}
            readOnly
          />
          <FormInput
            label="Phone Number"
            required
            type="tel"
            value={selectedCustomer?.phone || appointmentForm.phone}
            onChange={() => {}}
            maxLength={10}
            readOnly
          />
          <div>
            {selectedCustomer && selectedCustomer.vehicles && selectedCustomer.vehicles.length > 1 ? (
              <FormSelect
                label="Vehicle"
                required
                value={appointmentForm.vehicle}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, vehicle: e.target.value })}
                placeholder="Select vehicle"
                options={selectedCustomer.vehicles.map((v) => ({
                  value: formatVehicleString(v),
                  label: `${formatVehicleString(v)}${v.registration ? ` - ${v.registration}` : ""}`,
                }))}
              />
            ) : (
              <FormInput
                label="Vehicle"
                required
                value={appointmentForm.vehicle}
                onChange={() => {}}
                readOnly
              />
            )}
            {selectedCustomer && appointmentForm.vehicle && selectedVehicle && selectedVehicle.lastServiceCenterName && (
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <Building2 size={12} />
                Last serviced at: {selectedVehicle.lastServiceCenterName}
              </p>
            )}
          </div>
          <FormSelect
            label="Service Type"
            required
            value={appointmentForm.serviceType}
            onChange={(e) => setAppointmentForm({ ...appointmentForm, serviceType: e.target.value })}
            placeholder="Select service type"
            options={SERVICE_TYPE_OPTIONS.map((type) => ({ value: type, label: type }))}
          />
          <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!appointmentForm.isMajorIssue}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, isMajorIssue: e.target.checked })}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={20} />
                <span className="text-base font-bold text-red-700">Major Issue - Send to Service Manager Directly</span>
              </div>
            </label>
            {appointmentForm.isMajorIssue && (
              <p className="text-sm text-red-600 mt-2 ml-8">
                Appointment will be sent directly to Service Manager. Only Service Type and Customer Complaint are required.
              </p>
            )}
          </div>
          {(isCallCenter || (isServiceAdvisor && !appointmentForm.isMajorIssue)) && (
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
                          : "Select a service center"}
                      </span>
                      <Search size={14} className="text-gray-400" />
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
              {appointmentForm.serviceCenterId && selectedServiceCenter && (
                <p className="text-xs text-gray-500">
                  Selected center: {selectedServiceCenter.name} • {selectedServiceCenter.location}
                </p>
              )}
            </div>
          )}
          {(isCallCenter || isServiceAdvisor) && (
            <FormSelect
              label="Customer Type"
              value={appointmentForm.customerType || ""}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, customerType: e.target.value as "B2C" | "B2B" | undefined })}
              placeholder="Select customer type"
              options={[
                { value: "B2C", label: "B2C" },
                { value: "B2B", label: "B2B" },
              ]}
            />
          )}
          {(isCallCenter || isServiceAdvisor) && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <FormInput
                  label="Date"
                  required
                  type="date"
                  value={appointmentForm.date}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
                <div className={`mt-2 flex items-center gap-2 ${isAtLimit ? "text-red-600" : isNearLimit ? "text-orange-600" : "text-gray-600"}`}>
                  <Calendar size={12} />
                  <span className="font-medium">
                    {currentCount} / {maxAppointments} appointments
                    {remaining > 0 && ` (${remaining} remaining)`}
                    {isAtLimit && " - Limit reached"}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <FormInput
                  label="Time"
                  required
                  type="time"
                  value={appointmentForm.time}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                />
              </div>
            </div>
          )}
          {(isCallCenter || isServiceAdvisor) && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="text-blue-600" size={20} />
                Operational Details
              </h3>
              <div className="space-y-4">
                {isServiceAdvisor && (
                  <FormInput
                    label="Estimated Delivery Date"
                    type="date"
                    value={appointmentForm.estimatedDeliveryDate || ""}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, estimatedDeliveryDate: e.target.value })}
                  />
                )}
                {(isCallCenter || isServiceAdvisor) && (
                  <FormInput
                    label="Assigned Service Advisor"
                    value={appointmentForm.assignedServiceAdvisor || ""}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, assignedServiceAdvisor: e.target.value })}
                    placeholder="Enter service advisor name"
                  />
                )}
                {isServiceAdvisor && (
                  <FormInput
                    label="Assigned Technician"
                    value={appointmentForm.assignedTechnician || ""}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, assignedTechnician: e.target.value })}
                    placeholder="Enter technician name"
                  />
                )}
                {(isCallCenter || isServiceAdvisor) && (
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appointmentForm.pickupDropRequired || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setAppointmentForm({
                            ...appointmentForm,
                            pickupDropRequired: checked,
                            ...(checked
                              ? {}
                              : { pickupAddress: "", dropAddress: "" }),
                          });
                          if (!checked) {
                            setPickupAddressDifferent(false);
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Pickup / Drop Required</span>
                    </label>
                    {appointmentForm.pickupDropRequired && (
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={appointmentForm.pickupAddress !== "" || appointmentForm.dropAddress !== ""}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              if (!checked) {
                                setAppointmentForm({
                                  ...appointmentForm,
                                  pickupAddress: "",
                                  dropAddress: "",
                                });
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">
                            Pickup / Drop address is different from customer address
                          </span>
                        </label>
                        <FormInput
                          label="Pickup Address"
                          value={appointmentForm.pickupAddress || ""}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, pickupAddress: e.target.value })}
                          placeholder="Enter pickup address"
                        />
                        <FormInput
                          label="Drop Address"
                          value={appointmentForm.dropAddress || ""}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, dropAddress: e.target.value })}
                          placeholder="Enter drop address"
                        />
                      </div>
                    )}
                  </div>
                )}
                {(isCallCenter || isServiceAdvisor) && (
                  <FormSelect
                    label="Preferred Communication Mode"
                    value={appointmentForm.preferredCommunicationMode || ""}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, preferredCommunicationMode: e.target.value as "Phone" | "Email" | "SMS" | "WhatsApp" | undefined })}
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
          {(isCallCenter || isServiceAdvisor) && !appointmentForm.isMajorIssue && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="text-indigo-600" size={20} />
                Billing & Payment
              </h3>
              <div className="space-y-4">
                <FormSelect
                  label="Payment Mode"
                  value={appointmentForm.paymentMethod || ""}
                  onChange={(e) =>
                    setAppointmentForm({
                      ...appointmentForm,
                      paymentMethod: e.target.value as "Cash" | "Card" | "UPI" | "Online" | "Cheque" | undefined,
                    })
                  }
                  placeholder="Select payment mode"
                  options={[
                    { value: "Cash", label: "Cash" },
                    { value: "Card", label: "Card" },
                    { value: "UPI", label: "UPI" },
                    { value: "Online", label: "Online" },
                    { value: "Cheque", label: "Cheque" },
                  ]}
                />
                <FormInput
                  label="Business Name for Invoice"
                  value={appointmentForm.businessNameForInvoice || ""}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, businessNameForInvoice: e.target.value })}
                  placeholder="Enter business name for invoice"
                />
                <FormInput
                  label="Cost Estimation"
                  value={appointmentForm.estimatedCost ? `₹${appointmentForm.estimatedCost}` : ""}
                  onChange={() => {}}
                  readOnly
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!appointmentForm.gstRequirement}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, gstRequirement: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">GST Requirement</span>
                </label>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setValidationError("");
                onClose();
              }}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${
                appointmentForm.isMajorIssue
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:opacity-90"
                  : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:opacity-90"
              }`}
            >
              {appointmentForm.isMajorIssue ? "Send to Manager" : "Schedule Appointment"}
            </button>
          </div>
        </div>

        {showServiceCenterSelector && (
          <div className="fixed inset-0 z-[1100] bg-black/40 flex items-center justify-center p-4">
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
                          serviceCenterId: center.id,
                          serviceCenterName: center.name,
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
    </Modal>
  );
};

