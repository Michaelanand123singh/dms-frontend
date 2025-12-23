export { getInitialAppointmentForm } from "@/shared/utils/form.utils";
export { formatTime24 as formatTime } from "@/shared/utils/date";

export {
  findNearestServiceCenter,
  countAppointmentsForDate,
  getMaxAppointmentsPerDay,
  DEFAULT_MAX_APPOINTMENTS_PER_DAY,
  validateAppointmentForm,
} from "./types";

import type { Vehicle, CustomerWithVehicles } from "@/shared/types";
import type { AppointmentForm } from "./types";

/**
 * Maps vehicle object fields to appointment form data fields
 * Handles field name differences between Vehicle and AppointmentForm types
 * @param vehicle - Vehicle object to map from
 * @returns Partial AppointmentForm with mapped vehicle fields
 */
export function mapVehicleToFormData(vehicle: Vehicle | null): Partial<AppointmentForm> {
  if (!vehicle) return {};

  return {
    vehicleBrand: vehicle.vehicleMake || "",
    vehicleModel: vehicle.vehicleModel || "",
    vehicleYear: vehicle.vehicleYear || undefined,
    registrationNumber: vehicle.registration || "",
    vinChassisNumber: vehicle.vin || "",
    variantBatteryCapacity: vehicle.variant || "",
    motorNumber: vehicle.motorNumber || "",
    chargerSerialNumber: vehicle.chargerSerialNumber || "",
    vehicleColor: vehicle.vehicleColor || "",
    dateOfPurchase: vehicle.purchaseDate ? vehicle.purchaseDate.split("T")[0] : "",
    warrantyStatus: vehicle.warrantyStatus || "",
    insuranceStartDate: vehicle.insuranceStartDate ? vehicle.insuranceStartDate.split("T")[0] : "",
    insuranceEndDate: vehicle.insuranceEndDate ? vehicle.insuranceEndDate.split("T")[0] : "",
    insuranceCompanyName: vehicle.insuranceCompanyName || "",
  };
}

/**
 * Maps customer object fields to appointment form data fields
 * Handles field name differences between Customer and AppointmentForm types
 * @param customer - Customer object to map from
 * @returns Partial AppointmentForm with mapped customer fields
 */
export function mapCustomerToFormData(customer: CustomerWithVehicles | null): Partial<AppointmentForm> {
  if (!customer) return {};

  return {
    customerName: customer.name || "",
    phone: customer.phone || "",
    whatsappNumber: customer.whatsappNumber || "",
    alternateNumber: customer.alternateNumber || "",
    email: customer.email || "",
    address: customer.address || "",
    cityState: customer.cityState || "",
    pincode: customer.pincode || "",
    customerType: customer.customerType || undefined,
  };
}
