/**
 * Utility function to convert JobCard to CreateJobCardForm initial values
 * Used when editing an existing job card (e.g., from appointment)
 */

import type { JobCard } from "@/shared/types/job-card.types";
import type { CreateJobCardForm } from "@/features/job-cards/types/job-card.types";
import type { DocumentationFiles } from "@/shared/types/documentation.types";
import { INITIAL_DOCUMENTATION_FILES } from "@/shared/types/documentation.types";

/**
 * Convert PART 2A field (Yes/No string) to DocumentationFiles format
 */
function convertPart2AFieldToDocFiles(value: "Yes" | "No" | "" | undefined): DocumentationFiles {
  // If value is "Yes", we assume files exist but can't restore actual URLs
  // User will need to re-upload if needed
  if (value === "Yes") {
    return { ...INITIAL_DOCUMENTATION_FILES };
  }
  return { ...INITIAL_DOCUMENTATION_FILES };
}

/**
 * Convert JobCard to CreateJobCardForm initial values
 * This function ensures all fields from appointments are properly mapped to the form
 * Includes comprehensive fallbacks and diagnostic logging
 */
export function jobCardToFormInitialValues(jobCard: JobCard): Partial<CreateJobCardForm> {
  // Get related data from backend relations (single source of truth)
  const customer = (jobCard as any).customer;
  const vehicle = (jobCard as any).vehicle;
  const appointment = (jobCard as any).appointment;

  // Diagnostic logging
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.group(`[JobCardToForm] Mapping JobCard ${jobCard.id || jobCard.jobCardNumber}`);
    console.log("Has customer relation:", !!customer);
    console.log("Has vehicle relation:", !!vehicle);
    console.log("Has appointment relation:", !!appointment);
    console.groupEnd();
  }

  // Helper to safely get value
  const getValue = <T>(defaultValue: T, ...sources: (T | undefined | null | string)[]): T => {
    for (const source of sources) {
      if (source !== undefined && source !== null && source !== "") {
        return source as T;
      }
    }
    return defaultValue;
  };

  const formValues: Partial<CreateJobCardForm> = {
    // IDs
    vehicleId: jobCard.vehicleId || "",
    customerId: jobCard.customerId || "",

    // Customer data from customer relation
    customerName: getValue("", customer?.name, jobCard.customerName),
    fullName: getValue("", customer?.name),
    mobilePrimary: getValue("", customer?.phone),
    whatsappNumber: getValue("", customer?.whatsappNumber),
    alternateNumber: getValue("", customer?.alternateNumber),
    email: getValue("", customer?.email),
    // ✅ Combined full address (address + city/state + pincode)
    customerAddress: (() => {
      const parts = [
        customer?.address,
        customer?.cityState,
        customer?.pincode
      ].filter(Boolean); // Remove empty values
      return parts.length > 0 ? parts.join(', ') : "";
    })(),
    customerType: (getValue("", customer?.customerType, jobCard.customerType) as "B2C" | "B2B" | ""),

    // Vehicle data from vehicle relation
    vehicleRegistration: getValue("", vehicle?.registration, jobCard.registration),
    vehicleMake: getValue("", vehicle?.vehicleMake, jobCard.vehicleMake),
    vehicleModel: getValue("", vehicle?.vehicleModel, jobCard.vehicleModel),
    vehicleBrand: getValue("", vehicle?.vehicleMake),
    vehicleYear: vehicle?.vehicleYear || jobCard.vehicleYear,
    vinChassisNumber: getValue("", vehicle?.vin),
    variantBatteryCapacity: getValue("", vehicle?.variant),
    motorNumber: getValue("", vehicle?.motorNumber, jobCard.motorNumber),
    chargerSerialNumber: getValue("", vehicle?.chargerSerialNumber, jobCard.chargerSerialNumber),
    // ✅ Fixed: Format vehicle dates properly
    dateOfPurchase: vehicle?.purchaseDate
      ? new Date(vehicle.purchaseDate).toISOString().split('T')[0]
      : getValue("", jobCard.dateOfPurchase),
    vehicleColor: getValue("", vehicle?.vehicleColor, jobCard.vehicleColor),
    warrantyStatus: getValue("", vehicle?.warrantyStatus, jobCard.warrantyStatus),
    insuranceStartDate: vehicle?.insuranceStartDate
      ? new Date(vehicle.insuranceStartDate).toISOString().split('T')[0]
      : "",
    insuranceEndDate: vehicle?.insuranceEndDate
      ? new Date(vehicle.insuranceEndDate).toISOString().split('T')[0]
      : "",
    insuranceCompanyName: getValue("", vehicle?.insuranceCompanyName),

    // Service details from appointment relation
    description: getValue("", appointment?.customerComplaint, jobCard.description), // ✅ Fixed: customerComplaint
    customerFeedback: getValue("", appointment?.customerComplaint), // ✅ Fixed: customerComplaint
    technicianObservation: getValue("", appointment?.technicianObservation),
    previousServiceHistory: getValue("", appointment?.previousServiceHistory, jobCard.previousServiceHistory),
    odometerReading: getValue("", appointment?.odometerReading, jobCard.odometerReading),
    // ✅ Fixed: Format date properly
    estimatedDeliveryDate: appointment?.estimatedDeliveryDate
      ? new Date(appointment.estimatedDeliveryDate).toISOString().split('T')[0]
      : "",

    // Pickup/Drop from appointment relation
    pickupDropRequired: appointment?.pickupDropRequired ?? jobCard.pickupDropRequired ?? false,
    pickupAddress: getValue("", appointment?.pickupAddress, jobCard.pickupAddress),
    pickupState: getValue("", appointment?.pickupState, jobCard.pickupState),
    pickupCity: getValue("", appointment?.pickupCity, jobCard.pickupCity),
    pickupPincode: getValue("", appointment?.pickupPincode, jobCard.pickupPincode),
    dropAddress: getValue("", appointment?.dropAddress, jobCard.dropAddress),
    dropState: getValue("", appointment?.dropState, jobCard.dropState),
    dropCity: getValue("", appointment?.dropCity, jobCard.dropCity),
    dropPincode: getValue("", appointment?.dropPincode, jobCard.dropPincode),
    preferredCommunicationMode: appointment?.preferredCommunicationMode || jobCard.preferredCommunicationMode,

    // Check-in from appointment relation  
    arrivalMode: appointment?.arrivalMode || jobCard.arrivalMode,
    checkInNotes: getValue("", appointment?.checkInNotes, jobCard.checkInNotes),
    checkInSlipNumber: getValue("", appointment?.checkInSlipNumber, jobCard.checkInSlipNumber),
    // ✅ Fixed: Format dates properly
    checkInDate: appointment?.checkInDate
      ? new Date(appointment.checkInDate).toISOString().split('T')[0]
      : getValue("", jobCard.checkInDate),
    checkInTime: getValue("", appointment?.checkInTime, jobCard.checkInTime),

    // Parts
    selectedParts: jobCard.parts || [],
    part2Items: jobCard.part2 || [],

    // Part 2A (warranty docs)
    videoEvidence: convertPart2AFieldToDocFiles(jobCard.part2A?.videoEvidence),
    vinImage: convertPart2AFieldToDocFiles(jobCard.part2A?.vinImage),
    odoImage: convertPart2AFieldToDocFiles(jobCard.part2A?.odoImage),
    damageImages: convertPart2AFieldToDocFiles(jobCard.part2A?.damageImages),
    issueDescription: jobCard.part2A?.issueDescription || "",
    numberOfObservations: jobCard.part2A?.numberOfObservations || "",
    symptom: getValue("", jobCard.part2A?.symptom, jobCard.previousServiceHistory),
    defectPart: jobCard.part2A?.defectPart || "",
  };

  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("[JobCardToForm] Mapped form values:", formValues);
  }

  return formValues;
}

