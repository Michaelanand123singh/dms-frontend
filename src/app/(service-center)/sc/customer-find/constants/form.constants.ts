/**
 * Form constants for customer find page
 */

import type { NewCustomerForm, NewVehicleForm } from "@/shared/types";

// Documentation Files interface
export interface DocumentationFiles {
  files: File[];
  urls: string[]; // For preview URLs
}

// Initial form states (constants for reuse)
export const initialCustomerForm: NewCustomerForm = {
  name: "",
  phone: "",
  whatsappNumber: "",
  alternateMobile: "",
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

export const INITIAL_DOCUMENTATION_FILES: DocumentationFiles = {
  files: [],
  urls: [],
};

