/**
 * Add Vehicle Form Modal Component
 * Preserves prefilled customer info (read-only) + manual vehicle entry pattern
 */

import { Modal, FormInput, FormSelect } from "../../../components/shared/FormElements";
import { ErrorAlert } from "../../../components/shared/InfoComponents";
import { Button } from "../../../components/shared/Button";
import { INDIAN_STATES, getCitiesByState } from "@/shared/constants/indian-states-cities";
import { validateVIN } from "@/shared/utils/validation";
import type { CustomerWithVehicles, NewVehicleForm } from "@/shared/types";

export interface AddVehicleFormModalProps {
  isOpen: boolean;
  customer: CustomerWithVehicles | null;
  formData: Partial<NewVehicleForm>;
  onFormChange: (data: Partial<NewVehicleForm>) => void;
  vehicleFormState: string;
  onVehicleFormStateChange: (state: string) => void;
  vehicleFormCity: string;
  onVehicleFormCityChange: (city: string) => void;
  hasInsurance: boolean;
  onHasInsuranceChange: (hasInsurance: boolean) => void;
  validationError: string;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}

export function AddVehicleFormModal({
  isOpen,
  customer,
  formData,
  onFormChange,
  vehicleFormState,
  onVehicleFormStateChange,
  vehicleFormCity,
  onVehicleFormCityChange,
  hasInsurance,
  onHasInsuranceChange,
  validationError,
  onClose,
  onSubmit,
}: AddVehicleFormModalProps) {
  if (!isOpen || !customer) return null;

  // Parse customer cityState for default values
  const getDefaultState = () => {
    if (vehicleFormState) return vehicleFormState;
    if (customer.cityState) {
      const parts = customer.cityState.split(",");
      return parts.length >= 2 ? parts[1]?.trim() || "" : "";
    }
    return "";
  };

  const getDefaultCity = () => {
    if (vehicleFormCity) return vehicleFormCity;
    if (customer.cityState) {
      const parts = customer.cityState.split(",");
      return parts.length >= 1 ? parts[0]?.trim() || "" : "";
    }
    return "";
  };

  const defaultState = getDefaultState();
  const defaultCity = getDefaultCity();

  return (
    <Modal title="Add New Vehicle" onClose={onClose}>
      <div className="p-6 space-y-6">
        {validationError && <ErrorAlert message={validationError} />}

        {/* Customer Information Section - Read-only, Prefilled */}
        <div className="bg-indigo-50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-indigo-900 mb-3">Customer Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Customer Type" value={customer.customerType || ""} onChange={() => {}} readOnly />
            <FormInput label="Phone Number" value={customer.phone} onChange={() => {}} readOnly />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormInput
                label="WhatsApp Number"
                value={customer.whatsappNumber || customer.phone || ""}
                onChange={() => {}}
                readOnly
              />
              {customer.whatsappNumber && customer.whatsappNumber !== customer.phone && (
                <p className="text-xs text-gray-500 mt-1">Different from phone number</p>
              )}
            </div>
            <FormInput label="Alternate Mobile Number" value={customer.alternateMobile || ""} onChange={() => {}} readOnly />
          </div>

          {customer.address && (
            <FormInput label="Full Address" value={customer.address} onChange={() => {}} readOnly />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
              <select
                value={vehicleFormState || defaultState}
                onChange={(e) => {
                  onVehicleFormStateChange(e.target.value);
                  onVehicleFormCityChange(""); // Reset city when state changes
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <select
                value={vehicleFormCity || defaultCity}
                onChange={(e) => onVehicleFormCityChange(e.target.value)}
                disabled={!vehicleFormState && !customer.cityState}
                className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:outline-none text-gray-900 transition-all duration-200 border ${
                  !vehicleFormState && !customer.cityState
                    ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
                    : "bg-white focus:ring-indigo-500/20 border-gray-200"
                }`}
              >
                <option value="">{(vehicleFormState || customer.cityState) ? "Select City" : "Select State First"}</option>
                {(vehicleFormState || customer.cityState) &&
                  getCitiesByState(vehicleFormState || defaultState).map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
              </select>
            </div>
            <FormInput label="Pincode" value={customer.pincode || ""} onChange={() => {}} readOnly />
          </div>
        </div>

        {/* Vehicle Form Fields - Manual Entry */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Vehicle Brand"
              required
              value={formData.vehicleBrand || ""}
              onChange={(e) => onFormChange({ ...formData, vehicleBrand: e.target.value })}
              placeholder="e.g., Honda, Toyota, Tesla"
            />
            <FormInput
              label="Vehicle Model"
              required
              value={formData.vehicleModel || ""}
              onChange={(e) => onFormChange({ ...formData, vehicleModel: e.target.value })}
              placeholder="e.g., City, Camry, Model 3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Registration Number"
              required
              value={formData.registrationNumber || ""}
              onChange={(e) => onFormChange({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
              placeholder="e.g., MH12AB1234"
            />
            <div>
              <FormInput
                label="VIN / Chassis Number"
                required
                value={formData.vin || ""}
                onChange={(e) => onFormChange({ ...formData, vin: e.target.value.toUpperCase() })}
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
              value={formData.variant || ""}
              onChange={(e) => onFormChange({ ...formData, variant: e.target.value })}
              placeholder="e.g., VX, 50kWh, Standard Range"
            />
            <FormInput
              label="Motor Number"
              value={formData.motorNumber || ""}
              onChange={(e) => onFormChange({ ...formData, motorNumber: e.target.value })}
              placeholder="Enter motor number"
            />
          </div>

          <FormInput
            label="Charger Serial Number"
            value={formData.chargerSerialNumber || ""}
            onChange={(e) => onFormChange({ ...formData, chargerSerialNumber: e.target.value })}
            placeholder="Enter charger serial number"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Date of Purchase"
              type="date"
              value={formData.purchaseDate || ""}
              onChange={(e) => onFormChange({ ...formData, purchaseDate: e.target.value })}
            />
            <FormInput
              label="Vehicle Color"
              value={formData.vehicleColor || ""}
              onChange={(e) => onFormChange({ ...formData, vehicleColor: e.target.value })}
              placeholder="e.g., Red, Blue, White, Black"
            />
          </div>

          <FormSelect
            label="Warranty Status"
            value={formData.warrantyStatus || ""}
            onChange={(e) => onFormChange({ ...formData, warrantyStatus: e.target.value })}
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
                  onHasInsuranceChange(e.target.checked);
                  // Clear insurance fields when unchecked
                  if (!e.target.checked) {
                    onFormChange({
                      ...formData,
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
                    value={formData.insuranceStartDate || ""}
                    onChange={(e) => onFormChange({ ...formData, insuranceStartDate: e.target.value })}
                  />
                  <FormInput
                    label="Insurance End Date"
                    type="date"
                    value={formData.insuranceEndDate || ""}
                    onChange={(e) => onFormChange({ ...formData, insuranceEndDate: e.target.value })}
                  />
                </div>
                <div className="mt-4">
                  <FormInput
                    label="Insurance Company Name"
                    value={formData.insuranceCompanyName || ""}
                    onChange={(e) => onFormChange({ ...formData, insuranceCompanyName: e.target.value })}
                    placeholder="Enter insurance company name"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button onClick={onSubmit} className="flex-1">
            Add Vehicle
          </Button>
        </div>
      </div>
    </Modal>
  );
}

