import type { AppointmentRecord } from "./types";
import type { AppointmentForm as AppointmentFormType } from "../components/appointment/types";
import { formatTime } from "../components/appointment/utils";
import type { Vehicle } from "@/shared/types";
import { STATUS_CONFIG } from "./constants";

export const convertAppointmentToFormData = (appointment: AppointmentRecord): Partial<AppointmentFormType> => {
  return {
    customerName: appointment.customerName,
    vehicle: appointment.vehicle,
    phone: appointment.phone,
    serviceType: appointment.serviceType,
    date: appointment.date,
    time: appointment.time,
    duration: appointment.duration.replace(" hours", "").replace(" hour", ""),
    serviceCenterId: appointment.serviceCenterId ? Number(appointment.serviceCenterId) : undefined,
    serviceCenterName: appointment.serviceCenterName || undefined,
    customerType: appointment.customerType,
    customerComplaintIssue: appointment.customerComplaintIssue,
    previousServiceHistory: appointment.previousServiceHistory,
    estimatedServiceTime: appointment.estimatedServiceTime,
    estimatedCost: appointment.estimatedCost?.replace("₹", "").replace(",", ""),
    odometerReading: appointment.odometerReading,
    estimatedDeliveryDate: appointment.estimatedDeliveryDate,
    assignedServiceAdvisor: appointment.assignedServiceAdvisor,
    assignedTechnician: appointment.assignedTechnician,
    pickupDropRequired: appointment.pickupDropRequired,
    pickupAddress: appointment.pickupAddress,
    pickupState: (appointment as any).pickupState,
    pickupCity: (appointment as any).pickupCity,
    pickupPincode: (appointment as any).pickupPincode,
    dropAddress: appointment.dropAddress,
    dropState: (appointment as any).dropState,
    dropCity: (appointment as any).dropCity,
    dropPincode: (appointment as any).dropPincode,
    preferredCommunicationMode: appointment.preferredCommunicationMode,
    // Customer Contact & Address Fields
    whatsappNumber: (appointment as any).whatsappNumber,
    alternateMobile: (appointment as any).alternateMobile,
    email: (appointment as any).email,
    address: (appointment as any).address,
    cityState: (appointment as any).cityState,
    pincode: (appointment as any).pincode,
    // Vehicle Information Fields
    vehicleBrand: (appointment as any).vehicleBrand,
    vehicleModel: (appointment as any).vehicleModel,
    vehicleYear: (appointment as any).vehicleYear,
    registrationNumber: (appointment as any).registrationNumber,
    vinChassisNumber: (appointment as any).vinChassisNumber,
    variantBatteryCapacity: (appointment as any).variantBatteryCapacity,
    motorNumber: (appointment as any).motorNumber,
    chargerSerialNumber: (appointment as any).chargerSerialNumber,
    dateOfPurchase: (appointment as any).dateOfPurchase,
    warrantyStatus: (appointment as any).warrantyStatus,
    insuranceStartDate: (appointment as any).insuranceStartDate,
    insuranceEndDate: (appointment as any).insuranceEndDate,
    insuranceCompanyName: (appointment as any).insuranceCompanyName,
    vehicleColor: (appointment as any).vehicleColor,
    // Job Card Conversion Fields
    batterySerialNumber: (appointment as any).batterySerialNumber,
    mcuSerialNumber: (appointment as any).mcuSerialNumber,
    vcuSerialNumber: (appointment as any).vcuSerialNumber,
    otherPartSerialNumber: (appointment as any).otherPartSerialNumber,
    technicianObservation: (appointment as any).technicianObservation,
    // Service Intake/Check-in Fields
    arrivalMode: (appointment as any).arrivalMode,
    checkInNotes: (appointment as any).checkInNotes,
    checkInSlipNumber: (appointment as any).checkInSlipNumber,
    checkInDate: (appointment as any).checkInDate,
    checkInTime: (appointment as any).checkInTime,
    // Documentation files (if stored as URLs)
    customerIdProof: (appointment as any).customerIdProof,
    vehicleRCCopy: (appointment as any).vehicleRCCopy,
    warrantyCardServiceBook: (appointment as any).warrantyCardServiceBook,
    photosVideos: (appointment as any).photosVideos,
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

