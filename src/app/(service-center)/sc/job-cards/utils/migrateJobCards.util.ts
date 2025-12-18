/**
 * Migration utility to ensure existing job cards have all fields properly populated
 * This migrates legacy job cards to include all appointment data fields
 */

import type { JobCard } from "@/shared/types/job-card.types";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";

/**
 * Migrates a single job card to ensure all fields are properly populated
 * This function ensures that data from legacy fields is also available in part1
 */
export function migrateJobCard(jobCard: JobCard): JobCard {
  // Preserve all additional fields from the original job card
  const preservedFields = {
    // Additional Customer Contact Fields
    customerWhatsappNumber: jobCard.customerWhatsappNumber,
    customerAlternateMobile: jobCard.customerAlternateMobile,
    customerEmail: jobCard.customerEmail,
    
    // Additional Vehicle Details
    vehicleYear: jobCard.vehicleYear,
    motorNumber: jobCard.motorNumber,
    chargerSerialNumber: jobCard.chargerSerialNumber,
    dateOfPurchase: jobCard.dateOfPurchase,
    vehicleColor: jobCard.vehicleColor,
    
    // Additional Service Details
    previousServiceHistory: jobCard.previousServiceHistory,
    odometerReading: jobCard.odometerReading,
    
    // Operational Fields
    pickupDropRequired: jobCard.pickupDropRequired,
    pickupAddress: jobCard.pickupAddress,
    pickupState: jobCard.pickupState,
    pickupCity: jobCard.pickupCity,
    pickupPincode: jobCard.pickupPincode,
    dropAddress: jobCard.dropAddress,
    dropState: jobCard.dropState,
    dropCity: jobCard.dropCity,
    dropPincode: jobCard.dropPincode,
    preferredCommunicationMode: jobCard.preferredCommunicationMode,
    
    // Check-in Fields
    arrivalMode: jobCard.arrivalMode,
    checkInNotes: jobCard.checkInNotes,
    checkInSlipNumber: jobCard.checkInSlipNumber,
    checkInDate: jobCard.checkInDate,
    checkInTime: jobCard.checkInTime,
  };

  // If job card already has part1, ensure it's complete
  if (jobCard.part1) {
    // Populate part1 fields from legacy fields if part1 fields are empty
    const updatedPart1 = {
      ...jobCard.part1,
      // Customer info - use legacy fields if part1 is empty
      fullName: jobCard.part1.fullName || jobCard.customerName || "",
      mobilePrimary: jobCard.part1.mobilePrimary || "",
      customerType: (jobCard.part1.customerType || jobCard.customerType || "") as "B2C" | "B2B" | "",
      
      // Vehicle info - use legacy fields if part1 is empty
      vehicleBrand: jobCard.part1.vehicleBrand || jobCard.vehicleMake || "",
      vehicleModel: jobCard.part1.vehicleModel || jobCard.vehicleModel || "",
      registrationNumber: jobCard.part1.registrationNumber || jobCard.registration || "",
      
      // Description/Feedback
      customerFeedback: jobCard.part1.customerFeedback || jobCard.description || "",
      
      // Keep existing values for other fields
      vinChassisNumber: jobCard.part1.vinChassisNumber || "",
      variantBatteryCapacity: jobCard.part1.variantBatteryCapacity || "",
      warrantyStatus: jobCard.part1.warrantyStatus || "",
      estimatedDeliveryDate: jobCard.part1.estimatedDeliveryDate || "",
      customerAddress: jobCard.part1.customerAddress || "",
      technicianObservation: jobCard.part1.technicianObservation || "",
      insuranceStartDate: jobCard.part1.insuranceStartDate || "",
      insuranceEndDate: jobCard.part1.insuranceEndDate || "",
      insuranceCompanyName: jobCard.part1.insuranceCompanyName || "",
      batterySerialNumber: jobCard.part1.batterySerialNumber || "",
      mcuSerialNumber: jobCard.part1.mcuSerialNumber || "",
      vcuSerialNumber: jobCard.part1.vcuSerialNumber || "",
      otherPartSerialNumber: jobCard.part1.otherPartSerialNumber || "",
      jobCardNumber: jobCard.part1.jobCardNumber || jobCard.jobCardNumber || "",
    };

    return {
      ...jobCard,
      ...preservedFields,
      part1: updatedPart1,
    };
  } else {
    // If part1 doesn't exist, create it from legacy fields
    const newPart1 = {
      fullName: jobCard.customerName || "",
      mobilePrimary: "",
      customerType: (jobCard.customerType || "") as "B2C" | "B2B" | "",
      vehicleBrand: jobCard.vehicleMake || "",
      vehicleModel: jobCard.vehicleModel || "",
      registrationNumber: jobCard.registration || "",
      vinChassisNumber: "",
      variantBatteryCapacity: "",
      warrantyStatus: jobCard.warrantyStatus || "",
      estimatedDeliveryDate: "",
      customerAddress: "",
      customerFeedback: jobCard.description || "",
      technicianObservation: "",
      insuranceStartDate: "",
      insuranceEndDate: "",
      insuranceCompanyName: "",
      batterySerialNumber: "",
      mcuSerialNumber: "",
      vcuSerialNumber: "",
      otherPartSerialNumber: "",
      jobCardNumber: jobCard.jobCardNumber || "",
    };

    return {
      ...jobCard,
      ...preservedFields,
      part1: newPart1,
      // Ensure part2 and part2A exist
      part2: jobCard.part2 || [],
      part2A: jobCard.part2A,
    };
  }
}

/**
 * Migrates all job cards in storage
 * This should be called when loading job cards to ensure they're up to date
 */
export function migrateAllJobCards(): JobCard[] {
  if (typeof window === "undefined") return [];
  
  try {
    const storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
    
    if (storedJobCards.length === 0) {
      return [];
    }

    // Always migrate to ensure all fields are preserved
    // This is safe because migrateJobCard preserves all existing fields using spread operator
    // This ensures fields like whatsapp, email, vehicle details are not lost
    const migratedJobCards = storedJobCards.map((card) => migrateJobCard(card));
    
    // Save migrated job cards back to storage
    safeStorage.setItem("jobCards", migratedJobCards);
    
    if (process.env.NODE_ENV === "development") {
      console.log(`Migrated ${migratedJobCards.length} job cards`);
    }
    
    return migratedJobCards;
  } catch (error) {
    console.error("Error migrating job cards:", error);
    return safeStorage.getItem<JobCard[]>("jobCards", []);
  }
}

/**
 * Check if a job card needs migration
 */
export function needsMigration(jobCard: JobCard): boolean {
  // Check if part1 is missing
  if (!jobCard.part1) return true;
  
  // Check if part1 has empty fields that could be populated from legacy fields
  if (!jobCard.part1.fullName && jobCard.customerName) return true;
  if (!jobCard.part1.vehicleBrand && jobCard.vehicleMake) return true;
  if (!jobCard.part1.vehicleModel && jobCard.vehicleModel) return true;
  if (!jobCard.part1.registrationNumber && jobCard.registration) return true;
  if (!jobCard.part1.customerFeedback && jobCard.description) return true;
  
  return false;
}

