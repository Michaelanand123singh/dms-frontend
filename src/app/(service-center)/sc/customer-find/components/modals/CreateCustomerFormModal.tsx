/**
 * Create Customer Form Modal Component
 */

import { Modal, FormInput, FormSelect } from "../../../components/shared/FormElements";
import { ErrorAlert } from "../../../components/shared/InfoComponents";
import { Button } from "../../../components/shared/Button";
import { INDIAN_STATES, getCitiesByState } from "@/shared/constants/indian-states-cities";
import type { NewCustomerForm, CustomerType } from "@/shared/types";

export interface CreateCustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: NewCustomerForm;
  onFormChange: (data: NewCustomerForm) => void;
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  whatsappSameAsMobile: boolean;
  onWhatsappSameAsMobileChange: (same: boolean) => void;
  fieldErrors: Record<string, string>;
  onFieldErrorChange: (errors: Record<string, string>) => void;
  validationError: string;
  isLoading: boolean;
  onSubmit: () => void;
}

export function CreateCustomerFormModal({
  isOpen,
  onClose,
  formData,
  onFormChange,
  selectedState,
  onStateChange,
  selectedCity,
  onCityChange,
  whatsappSameAsMobile,
  onWhatsappSameAsMobileChange,
  fieldErrors,
  onFieldErrorChange,
  validationError,
  isLoading,
  onSubmit,
}: CreateCustomerFormModalProps) {
  if (!isOpen) return null;

  return (
    <Modal title="Create New Customer" subtitle="Fill in the customer details below" onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6 space-y-4">
        <FormInput
          label="Full Name"
          required
          value={formData.name}
          onChange={(e) => {
            onFormChange({ ...formData, name: e.target.value });
            if (fieldErrors.name) {
              onFieldErrorChange({ ...fieldErrors, name: "" });
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
            value={formData.phone}
            onChange={(e) => {
              const phoneValue = e.target.value.replace(/\D/g, "").slice(0, 10);
              onFormChange({
                ...formData,
                phone: phoneValue,
                ...(whatsappSameAsMobile ? { whatsappNumber: phoneValue } : {}),
              });
              if (fieldErrors.phone) {
                onFieldErrorChange({ ...fieldErrors, phone: "" });
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
              value={formData.whatsappNumber || ""}
              onChange={(e) =>
                onFormChange({
                  ...formData,
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
                  onWhatsappSameAsMobileChange(checked);
                  onFormChange({
                    ...formData,
                    whatsappNumber: checked ? formData.phone : "",
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
            value={formData.alternateMobile || ""}
            onChange={(e) => {
              onFormChange({
                ...formData,
                alternateMobile: e.target.value.replace(/\D/g, "").slice(0, 10),
              });
              if (fieldErrors.alternateMobile) {
                onFieldErrorChange({ ...fieldErrors, alternateMobile: "" });
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
          value={formData.email || ""}
          onChange={(e) => {
            onFormChange({ ...formData, email: e.target.value });
            if (fieldErrors.email) {
              onFieldErrorChange({ ...fieldErrors, email: "" });
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
            value={formData.address || ""}
            onChange={(e) => {
              onFormChange({ ...formData, address: e.target.value });
              if (fieldErrors.address) {
                onFieldErrorChange({ ...fieldErrors, address: "" });
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
                onStateChange(e.target.value);
                onCityChange(""); // Reset city when state changes
                if (fieldErrors.state) {
                  onFieldErrorChange({ ...fieldErrors, state: "" });
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
                onCityChange(e.target.value);
                if (fieldErrors.city) {
                  onFieldErrorChange({ ...fieldErrors, city: "" });
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
              {selectedState &&
                getCitiesByState(selectedState).map((city) => (
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
            value={formData.pincode || ""}
            onChange={(e) => {
              onFormChange({ ...formData, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) });
              if (fieldErrors.pincode) {
                onFieldErrorChange({ ...fieldErrors, pincode: "" });
              }
            }}
            placeholder="6-digit pincode"
            maxLength={6}
            error={fieldErrors.pincode}
          />
        </div>

        {/* Customer Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Type</label>
          <select
            value={formData.customerType || ""}
            onChange={(e) =>
              onFormChange({ ...formData, customerType: e.target.value as CustomerType | undefined })
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
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading} className="flex-1">
            {isLoading ? (
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
  );
}

