import type { AppointmentRecord } from "./types";
import type { AppointmentForm as AppointmentFormType } from "../components/appointment/types";
import { formatTime } from "../components/appointment/utils";
import { parseTime12To24 } from "@/shared/utils/date";
import type { Vehicle } from "@/shared/types";
import { STATUS_CONFIG } from "./constants";

export const convertAppointmentToFormData = (appointment: AppointmentRecord): Partial<AppointmentFormType> => {
  // Convert time from 12-hour format (hh:mm AM/PM) to 24-hour format (HH:mm) for HTML time input
  const timeIn24Hour = parseTime12To24(appointment.time);

  return {
    customerName: appointment.customerName,
    vehicle: appointment.vehicle,
    phone: appointment.phone,
    serviceType: appointment.serviceType,
    date: appointment.date,
    time: timeIn24Hour || appointment.time, // Fallback to original if conversion fails
    duration: appointment.duration.replace(" hours", "").replace(" hour", ""),
    serviceCenterId: appointment.serviceCenterId ? appointment.serviceCenterId.toString() : undefined,
    serviceCenterName: appointment.serviceCenterName || undefined,
    customerType: appointment.customerType,
    customerComplaint: appointment.customerComplaint,
    previousServiceHistory: appointment.previousServiceHistory,
    estimatedServiceTime: appointment.estimatedServiceTime,
    estimatedCost: appointment.estimatedCost?.replace("₹", "").replace(",", ""),
    odometerReading: appointment.odometerReading,
    estimatedDeliveryDate: appointment.estimatedDeliveryDate,
    assignedServiceAdvisor: appointment.assignedServiceAdvisor,
    assignedTechnician: appointment.assignedTechnician,
    pickupDropRequired: appointment.pickupDropRequired,
    pickupAddress: appointment.pickupAddress,
    pickupState: appointment.pickupState,
    pickupCity: appointment.pickupCity,
    pickupPincode: appointment.pickupPincode,
    dropAddress: appointment.dropAddress,
    dropState: appointment.dropState,
    dropCity: appointment.dropCity,
    dropPincode: appointment.dropPincode,
    preferredCommunicationMode: appointment.preferredCommunicationMode,
    // Customer Contact & Address Fields
    whatsappNumber: appointment.whatsappNumber,
    alternateNumber: appointment.alternateNumber,
    email: appointment.email,
    address: appointment.address,
    cityState: appointment.cityState,
    pincode: appointment.pincode,
    // Vehicle Information Fields
    vehicleBrand: appointment.vehicleBrand,
    vehicleModel: appointment.vehicleModel,
    vehicleYear: appointment.vehicleYear,
    registrationNumber: appointment.registrationNumber,
    vinChassisNumber: appointment.vinChassisNumber,
    variantBatteryCapacity: appointment.variantBatteryCapacity,
    motorNumber: appointment.motorNumber,
    chargerSerialNumber: appointment.chargerSerialNumber,
    dateOfPurchase: appointment.dateOfPurchase,
    warrantyStatus: appointment.warrantyStatus,
    insuranceStartDate: appointment.insuranceStartDate,
    insuranceEndDate: appointment.insuranceEndDate,
    insuranceCompanyName: appointment.insuranceCompanyName,
    vehicleColor: appointment.vehicleColor,
    // Job Card Conversion Fields
    batterySerialNumber: appointment.batterySerialNumber,
    mcuSerialNumber: appointment.mcuSerialNumber,
    vcuSerialNumber: appointment.vcuSerialNumber,
    otherPartSerialNumber: appointment.otherPartSerialNumber,
    technicianObservation: appointment.technicianObservation,
    // Service Intake/Check-in Fields
    arrivalMode: appointment.arrivalMode,
    checkInNotes: appointment.checkInNotes,
    checkInSlipNumber: appointment.checkInSlipNumber,
    checkInDate: appointment.checkInDate,
    checkInTime: appointment.checkInTime,
    // Documentation files (if stored as URLs)
    customerIdProof: appointment.customerIdProof,
    vehicleRCCopy: appointment.vehicleRCCopy,
    warrantyCardServiceBook: appointment.warrantyCardServiceBook,
    photosVideos: appointment.photosVideos,
  };
};

export const formatVehicleString = (vehicle: Vehicle): string => {
  return `${vehicle.vehicleMake} ${vehicle.vehicleModel} (${vehicle.vehicleYear})`;
};

export const getStatusBadgeClass = (status: string): string => {
  const config = STATUS_CONFIG[status] || { bg: "bg-gray-100", text: "text-gray-800" };
  return `px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`;
};

export const formatVehicleLabel = (vehicle: Vehicle): string => {
  return `${vehicle.vehicleMake} ${vehicle.vehicleModel} (${vehicle.vehicleYear})`;
};

export const findVehicleForAppointment = (
  customer: { vehicles?: Vehicle[] } | null,
  appointmentVehicleLabel: string
): Vehicle | undefined => {
  if (!customer) return undefined;
  return customer.vehicles?.find((vehicle) => formatVehicleLabel(vehicle) === appointmentVehicleLabel);
};

