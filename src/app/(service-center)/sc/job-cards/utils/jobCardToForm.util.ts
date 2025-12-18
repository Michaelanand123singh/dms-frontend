/**
 * Utility function to convert JobCard to CreateJobCardForm initial values
 * Used when editing an existing job card (e.g., from appointment)
 */

import type { JobCard } from "@/shared/types/job-card.types";
import type { CreateJobCardForm } from "@/features/job-cards/types/job-card.types";

interface DocumentationFiles {
  files: File[];
  urls: string[];
}

const INITIAL_DOCUMENTATION_FILES: DocumentationFiles = {
  files: [],
  urls: [],
};

/**
 * Convert PART 2A field (Yes/No string) to DocumentationFiles format
 */
function convertPart2AFieldToDocFiles(value: "Yes" | "No" | "" | undefined): DocumentationFiles {
  // If value is "Yes", we assume files exist but can't restore actual files
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
  // Diagnostic logging to track field mapping
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.group(`[JobCardToForm] Mapping JobCard ${jobCard.id || jobCard.jobCardNumber}`);
    console.log("JobCard source appointment ID:", jobCard.sourceAppointmentId);
    console.log("JobCard part1 exists:", !!jobCard.part1);
    console.log("JobCard legacy fields:", {
      customerName: jobCard.customerName,
      registration: jobCard.registration,
      vehicleMake: jobCard.vehicleMake,
      vehicleModel: jobCard.vehicleModel,
      customerWhatsappNumber: jobCard.customerWhatsappNumber,
      customerAlternateMobile: jobCard.customerAlternateMobile,
      customerEmail: jobCard.customerEmail,
      vehicleYear: jobCard.vehicleYear,
      motorNumber: jobCard.motorNumber,
      chargerSerialNumber: jobCard.chargerSerialNumber,
      dateOfPurchase: jobCard.dateOfPurchase,
      vehicleColor: jobCard.vehicleColor,
      previousServiceHistory: jobCard.previousServiceHistory,
      odometerReading: jobCard.odometerReading,
    });
    if (jobCard.part1) {
      console.log("JobCard part1 fields:", {
        fullName: jobCard.part1.fullName,
        mobilePrimary: jobCard.part1.mobilePrimary,
        customerType: jobCard.part1.customerType,
        vehicleBrand: jobCard.part1.vehicleBrand,
        vehicleModel: jobCard.part1.vehicleModel,
        registrationNumber: jobCard.part1.registrationNumber,
        vinChassisNumber: jobCard.part1.vinChassisNumber,
        variantBatteryCapacity: jobCard.part1.variantBatteryCapacity,
        warrantyStatus: jobCard.part1.warrantyStatus,
        customerAddress: jobCard.part1.customerAddress,
      });
    }
    console.groupEnd();
  }

  // Helper to safely get value with multiple fallbacks
  const getValue = <T>(defaultValue: T, ...sources: (T | undefined | null | string)[]): T => {
    for (const source of sources) {
      if (source !== undefined && source !== null && source !== "") {
        return source as T;
      }
    }
    return defaultValue;
  };

  const formValues: Partial<CreateJobCardForm> = {
    // Basic fields with fallbacks
    vehicleId: jobCard.vehicleId || "",
    customerId: jobCard.customerId || "",
    customerName: getValue("", jobCard.part1?.fullName, jobCard.customerName),
    vehicleRegistration: getValue(
      "",
      jobCard.part1?.registrationNumber,
      jobCard.registration
    ),
    vehicleMake: getValue(
      "",
      jobCard.part1?.vehicleBrand,
      jobCard.vehicleMake
    ),
    vehicleModel: getValue(
      "",
      jobCard.part1?.vehicleModel,
      jobCard.vehicleModel
    ),
    description: getValue(
      "",
      jobCard.part1?.customerFeedback,
      jobCard.description
    ),
    selectedParts: jobCard.parts || [],
    part2Items: jobCard.part2 || [],

    // PART 1 fields with comprehensive fallbacks
    fullName: getValue("", jobCard.part1?.fullName, jobCard.customerName),
    // mobilePrimary: Try part1 first, then check if we can extract from other sources
    mobilePrimary: getValue("", jobCard.part1?.mobilePrimary),
    customerType: (getValue(
      "",
      jobCard.part1?.customerType,
      jobCard.customerType
    ) as "B2C" | "B2B" | ""),
    vehicleBrand: getValue(
      "",
      jobCard.part1?.vehicleBrand,
      jobCard.vehicleMake
    ),
    vinChassisNumber: getValue("", jobCard.part1?.vinChassisNumber),
    variantBatteryCapacity: getValue("", jobCard.part1?.variantBatteryCapacity),
    warrantyStatus: getValue(
      "",
      jobCard.part1?.warrantyStatus,
      jobCard.warrantyStatus
    ),
    estimatedDeliveryDate: getValue("", jobCard.part1?.estimatedDeliveryDate),
    customerAddress: getValue("", jobCard.part1?.customerAddress),
    customerFeedback: getValue(
      "",
      jobCard.part1?.customerFeedback,
      jobCard.description
    ),
    technicianObservation: getValue("", jobCard.part1?.technicianObservation),
    insuranceStartDate: getValue("", jobCard.part1?.insuranceStartDate),
    insuranceEndDate: getValue("", jobCard.part1?.insuranceEndDate),
    insuranceCompanyName: getValue("", jobCard.part1?.insuranceCompanyName),
    batterySerialNumber: getValue("", jobCard.part1?.batterySerialNumber),
    mcuSerialNumber: getValue("", jobCard.part1?.mcuSerialNumber),
    vcuSerialNumber: getValue("", jobCard.part1?.vcuSerialNumber),
    otherPartSerialNumber: getValue("", jobCard.part1?.otherPartSerialNumber),

    // Additional Customer Contact Fields - direct from JobCard
    whatsappNumber: jobCard.customerWhatsappNumber || "",
    alternateMobile: jobCard.customerAlternateMobile || "",
    email: jobCard.customerEmail || "",

    // Additional Vehicle Details - direct from JobCard
    vehicleYear: jobCard.vehicleYear,
    motorNumber: jobCard.motorNumber || "",
    chargerSerialNumber: jobCard.chargerSerialNumber || "",
    dateOfPurchase: jobCard.dateOfPurchase || "",
    vehicleColor: jobCard.vehicleColor || "",

    // Additional Service Details - direct from JobCard
    previousServiceHistory: jobCard.previousServiceHistory || "",
    odometerReading: jobCard.odometerReading || "",

    // Operational Fields - Use nullish coalescing for boolean to handle false values correctly
    pickupDropRequired: jobCard.pickupDropRequired ?? false,
    pickupAddress: jobCard.pickupAddress || "",
    pickupState: jobCard.pickupState || "",
    pickupCity: jobCard.pickupCity || "",
    pickupPincode: jobCard.pickupPincode || "",
    dropAddress: jobCard.dropAddress || "",
    dropState: jobCard.dropState || "",
    dropCity: jobCard.dropCity || "",
    dropPincode: jobCard.dropPincode || "",
    preferredCommunicationMode: jobCard.preferredCommunicationMode,

    // Check-in Fields - direct from JobCard
    arrivalMode: jobCard.arrivalMode,
    checkInNotes: jobCard.checkInNotes || "",
    checkInSlipNumber: jobCard.checkInSlipNumber || "",
    checkInDate: jobCard.checkInDate || "",
    checkInTime: jobCard.checkInTime || "",

    // PART 2A fields from jobCard.part2A
    videoEvidence: convertPart2AFieldToDocFiles(jobCard.part2A?.videoEvidence),
    vinImage: convertPart2AFieldToDocFiles(jobCard.part2A?.vinImage),
    odoImage: convertPart2AFieldToDocFiles(jobCard.part2A?.odoImage),
    damageImages: convertPart2AFieldToDocFiles(jobCard.part2A?.damageImages),
    issueDescription: jobCard.part2A?.issueDescription || "",
    numberOfObservations: jobCard.part2A?.numberOfObservations || "",
    symptom: getValue(
      "",
      jobCard.part2A?.symptom,
      jobCard.previousServiceHistory
    ),
    defectPart: jobCard.part2A?.defectPart || "",
  };

  // Log missing critical fields in development
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    const missingFields: string[] = [];
    if (!formValues.mobilePrimary) missingFields.push("mobilePrimary");
    if (!formValues.whatsappNumber && !formValues.mobilePrimary) missingFields.push("whatsappNumber/mobilePrimary");
    if (!formValues.email) missingFields.push("email");
    if (!formValues.vehicleRegistration) missingFields.push("vehicleRegistration");
    if (!formValues.vehicleYear) missingFields.push("vehicleYear");

    if (missingFields.length > 0) {
      console.warn(`[JobCardToForm] Missing fields in JobCard ${jobCard.id || jobCard.jobCardNumber}:`, missingFields);
    }
  }

  return formValues;
}

