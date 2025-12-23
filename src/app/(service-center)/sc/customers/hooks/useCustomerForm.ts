/**
 * Hook for managing customer form state, validation, and submission
 * Preserves prefilled/manual entry pattern
 */

import { useState, useCallback } from "react";
import { useCreateCustomer } from "../../../../../hooks/api";
import { canCreateCustomer } from "@/shared/constants/roles";
import { getServiceCenterContext } from "@/shared/lib/serviceCenter";
import { staticServiceCenters } from "@/__mocks__/data/service-centers.mock";
import { validatePhone, validateEmail, cleanPhone } from "@/shared/utils/validation";
import { initialCustomerForm } from "../constants/form.constants";
import type { NewCustomerForm, CustomerWithVehicles, UserRole } from "@/shared/types";

export interface UseCustomerFormReturn {
  newCustomerForm: NewCustomerForm;
  setNewCustomerForm: React.Dispatch<React.SetStateAction<NewCustomerForm>>;
  selectedState: string;
  setSelectedState: React.Dispatch<React.SetStateAction<string>>;
  selectedCity: string;
  setSelectedCity: React.Dispatch<React.SetStateAction<string>>;
  whatsappSameAsMobile: boolean;
  setWhatsappSameAsMobile: React.Dispatch<React.SetStateAction<boolean>>;
  fieldErrors: Record<string, string>;
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  resetCustomerForm: () => void;
  validateCustomerForm: () => { errors: Record<string, string>; hasErrors: boolean };
  handleSaveNewCustomer: (
    userRole: UserRole,
    serviceCenterFilterId: number | null,
    showToast: (message: string, type: "success" | "error") => void,
    setSelectedCustomer: (customer: CustomerWithVehicles) => void,
    setShowCreateForm: (show: boolean) => void,
    setShowCreateCustomer: (show: boolean) => void,
    setValidationError: (error: string) => void
  ) => Promise<CustomerWithVehicles | null>;
}

/**
 * Hook to manage customer form state and operations
 * Supports prefilled data via initialData pattern
 * @param initialData - Optional initial form data (for prefilled values)
 * @returns Customer form state and handlers
 */
export function useCustomerForm(
  initialData?: Partial<NewCustomerForm>
): UseCustomerFormReturn {
  const [newCustomerForm, setNewCustomerForm] = useState<NewCustomerForm>(() => ({
    ...initialCustomerForm,
    ...initialData, // Prefilled values override defaults
  }));
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [whatsappSameAsMobile, setWhatsappSameAsMobile] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { loading: createLoading, error: createError, createCustomer } = useCreateCustomer();

  const resetCustomerForm = useCallback(() => {
    setSelectedState("");
    setSelectedCity("");
    setNewCustomerForm({
      ...initialCustomerForm,
      addressType: undefined,
      workAddress: "",
    });
    setWhatsappSameAsMobile(false);
    setFieldErrors({});
  }, []);

  const validateCustomerForm = useCallback(() => {
    const errors: Record<string, string> = {};
    let hasErrors = false;

    // Validate name
    if (!newCustomerForm.name?.trim()) {
      errors.name = "Full Name is required";
      hasErrors = true;
    }

    // Validate primary phone
    if (!newCustomerForm.phone?.trim()) {
      errors.phone = "Mobile Number (Primary) is required";
      hasErrors = true;
    } else if (!validatePhone(newCustomerForm.phone)) {
      errors.phone = "Please enter a valid 10-digit mobile number";
      hasErrors = true;
    }

    // Validate address
    if (!newCustomerForm.address?.trim()) {
      errors.address = "Full Address is required";
      hasErrors = true;
    }

    // Validate alternate mobile if provided
    if (newCustomerForm.alternateNumber) {
      if (!validatePhone(newCustomerForm.alternateNumber)) {
        errors.alternateNumber = "Please enter a valid 10-digit alternate mobile number";
        hasErrors = true;
      } else if (cleanPhone(newCustomerForm.alternateNumber) === cleanPhone(newCustomerForm.phone)) {
        errors.alternateNumber = "Alternate mobile number must be different from primary mobile number";
        hasErrors = true;
      }
    }

    // Validate email if provided
    if (newCustomerForm.email && !validateEmail(newCustomerForm.email)) {
      errors.email = "Please enter a valid email address";
      hasErrors = true;
    }

    // Validate pincode if provided
    if (newCustomerForm.pincode && !/^\d{6}$/.test(newCustomerForm.pincode)) {
      errors.pincode = "Pincode must be exactly 6 digits";
      hasErrors = true;
    }

    // Validate state
    if (!selectedState) {
      errors.state = "Please select a state";
      hasErrors = true;
    }

    // Validate city
    if (!selectedCity) {
      errors.city = "Please select a city";
      hasErrors = true;
    }

    // Validate work address if work address type is selected
    if (newCustomerForm.addressType === "work" && !newCustomerForm.workAddress?.trim()) {
      errors.workAddress = "Please enter work address for pickup/drop service";
      hasErrors = true;
    }

    return { errors, hasErrors };
  }, [newCustomerForm, selectedState, selectedCity]);

  const handleSaveNewCustomer = useCallback(
    async (
      userRole: UserRole,
      serviceCenterFilterId: number | null,
      showToast: (message: string, type: "success" | "error") => void,
      setSelectedCustomer: (customer: CustomerWithVehicles) => void,
      setShowCreateForm: (show: boolean) => void,
      setShowCreateCustomer: (show: boolean) => void,
      setValidationError: (error: string) => void
    ): Promise<CustomerWithVehicles | null> => {
      const { errors, hasErrors } = validateCustomerForm();

      // Check permission before creating customer
      const canCreateNewCustomer = canCreateCustomer(userRole);
      if (!canCreateNewCustomer) {
        setValidationError("You do not have permission to create new customers.");
        showToast("You do not have permission to create new customers.", "error");
        return null;
      }

      setFieldErrors(errors);

      if (hasErrors) {
        const errorCount = Object.keys(errors).length;
        setValidationError(`Please fill ${errorCount} mandatory field${errorCount > 1 ? "s" : ""} to continue`);
        return null;
      }

      setValidationError("");
      setFieldErrors({});

      const serviceCenterContext = getServiceCenterContext();
      const fallbackCenterId = serviceCenterFilterId ? serviceCenterFilterId.toString() : undefined;
      const preferredServiceCenterId = serviceCenterContext.serviceCenterId ?? fallbackCenterId;
      const preferredServiceCenterName =
        serviceCenterContext.serviceCenterName ??
        staticServiceCenters.find((center) => center.id === serviceCenterFilterId)?.name;

      // Combine city and state into cityState for backend compatibility
      const cityState = selectedCity && selectedState ? `${selectedCity}, ${selectedState}` : "";

      const customer = await createCustomer({
        ...newCustomerForm,
        cityState,
        phone: cleanPhone(newCustomerForm.phone),
        alternateNumber: newCustomerForm.alternateNumber ? cleanPhone(newCustomerForm.alternateNumber) : undefined,
        serviceCenterId: preferredServiceCenterId,
        serviceCenterName: preferredServiceCenterName,
      });

      if (customer) {
        setSelectedCustomer(customer);
        setShowCreateForm(false);
        setShowCreateCustomer(false);
        resetCustomerForm();
        showToast(`Customer created successfully! Customer Number: ${customer.customerNumber}`, "success");
        return customer;
      } else if (createError) {
        setValidationError(createError);
      }

      return null;
    },
    [newCustomerForm, selectedState, selectedCity, validateCustomerForm, resetCustomerForm, createCustomer, createError]
  );

  return {
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
    validateCustomerForm,
    handleSaveNewCustomer,
  };
}

