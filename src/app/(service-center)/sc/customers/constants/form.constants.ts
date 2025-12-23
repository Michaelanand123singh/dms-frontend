/**
 * Form constants for customers'  page
 */

import type { NewCustomerForm, NewVehicleForm } from "@/shared/types";
import type { DocumentationFiles } from "@/shared/types/documentation.types";
import { INITIAL_DOCUMENTATION_FILES } from "@/shared/types/documentation.types";

// Re-export for convenience
export type { DocumentationFiles };

// Initial form states (constants for reuse)
export const initialCustomerForm: NewCustomerForm = {
  name: "",
  phone: "",
  whatsappNumber: "",
  alternateNumber: "",
  email: "",
  address: "",
  pincode: "",
  cityState: "",
  customerType: undefined,
  serviceType: undefined,
  addressType: undefined,
  workAddress: "",
};

export const initialVehicleForm: Partial<NewVehicleForm> = {
  vehicleBrand: "",
  vehicleModel: "",
  registrationNumber: "",
  vin: "",
  variant: "",
  motorNumber: "",
  chargerSerialNumber: "",
  purchaseDate: "",
  warrantyStatus: "",
  insuranceStartDate: "",
  insuranceEndDate: "",
  insuranceCompanyName: "",
};

// Use shared initial value
export { INITIAL_DOCUMENTATION_FILES };

