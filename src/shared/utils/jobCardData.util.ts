/**
 * Job Card Data Utilities
 * Functions to populate job card data from customer and vehicle information
 */

import type { Customer, Vehicle, CustomerWithVehicles } from "@/shared/types";
import type { JobCardPart1, JobCardPart2Item, JobCardPart2A, JobCardPart3 } from "@/shared/types/job-card.types";

/**
 * Populate PART 1 (Customer & Vehicle Information) from customer and vehicle data
 */
export function populateJobCardPart1(
  customer: Customer | CustomerWithVehicles,
  vehicle: Vehicle | null,
  jobCardNumber: string,
  additionalData?: {
    customerFeedback?: string;
    technicianObservation?: string;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    insuranceCompanyName?: string;
    batterySerialNumber?: string;
    mcuSerialNumber?: string;
    vcuSerialNumber?: string;
    otherPartSerialNumber?: string;
    variantBatteryCapacity?: string;
    warrantyStatus?: string;
    estimatedDeliveryDate?: string;
  }
): JobCardPart1 {
  return {
    // LEFT SIDE
    fullName: customer.name || "",
    mobilePrimary: customer.phone || "",
    customerType: (customer.customerType || "") as "B2C" | "B2B" | "",
    vehicleBrand: vehicle?.vehicleMake || "",
    vehicleModel: vehicle?.vehicleModel || "",
    registrationNumber: vehicle?.registration || "",
    vinChassisNumber: vehicle?.vin || "",
    variantBatteryCapacity: additionalData?.variantBatteryCapacity || "",
    warrantyStatus: additionalData?.warrantyStatus || "",
    estimatedDeliveryDate: additionalData?.estimatedDeliveryDate || "",
    
    // RIGHT SIDE
    customerAddress: customer.address || "",
    
    // TOP RIGHT
    jobCardNumber: jobCardNumber || "",
    
    // BELOW DETAILS (Text Blocks)
    customerFeedback: additionalData?.customerFeedback || "",
    technicianObservation: additionalData?.technicianObservation || "",
    insuranceStartDate: additionalData?.insuranceStartDate || "",
    insuranceEndDate: additionalData?.insuranceEndDate || "",
    insuranceCompanyName: additionalData?.insuranceCompanyName || "",
    
    // MANDATORY SERIAL DATA (only if applicable)
    batterySerialNumber: additionalData?.batterySerialNumber || "",
    mcuSerialNumber: additionalData?.mcuSerialNumber || "",
    vcuSerialNumber: additionalData?.vcuSerialNumber || "",
    otherPartSerialNumber: additionalData?.otherPartSerialNumber || "",
  };
}

/**
 * Create empty PART 1 structure
 */
export function createEmptyJobCardPart1(jobCardNumber: string = ""): JobCardPart1 {
  return {
    fullName: "",
    mobilePrimary: "",
    customerType: "",
    vehicleBrand: "",
    vehicleModel: "",
    registrationNumber: "",
    vinChassisNumber: "",
    variantBatteryCapacity: "",
    warrantyStatus: "",
    estimatedDeliveryDate: "",
    customerAddress: "",
    jobCardNumber,
    customerFeedback: "",
    technicianObservation: "",
    insuranceStartDate: "",
    insuranceEndDate: "",
    insuranceCompanyName: "",
    batterySerialNumber: "",
    mcuSerialNumber: "",
    vcuSerialNumber: "",
    otherPartSerialNumber: "",
  };
}

/**
 * Create empty PART 2A structure (Warranty/Insurance Case Details)
 */
export function createEmptyJobCardPart2A(): JobCardPart2A {
  return {
    videoEvidence: "",
    vinImage: "",
    odoImage: "",
    damageImages: "",
    issueDescription: "",
    numberOfObservations: "",
    symptom: "",
    defectPart: "",
  };
}

/**
 * Create empty PART 3 structure (Part Requisition & Issue Details)
 */
export function createEmptyJobCardPart3(
  part1?: JobCardPart1,
  jobCardNumber: string = ""
): JobCardPart3 {
  return {
    customerType: part1?.customerType || "",
    vehicleBrand: part1?.vehicleBrand || "",
    vehicleModel: part1?.vehicleModel || "",
    registrationNumber: part1?.registrationNumber || "",
    vinChassisNumber: part1?.vinChassisNumber || "",
    jobCardNumber: jobCardNumber || part1?.jobCardNumber || "",
    partCode: "",
    partName: "",
    qty: 0,
    issueQty: 0,
    returnQty: 0,
    warrantyTagNumber: "",
    returnPartNumber: "",
    approvalDetails: "",
  };
}

/**
 * Convert legacy parts array to PART 2 items
 */
export function convertPartsToPart2Items(
  parts: string[],
  startSrNo: number = 1
): JobCardPart2Item[] {
  return parts.map((part, index) => ({
    srNo: startSrNo + index,
    partWarrantyTag: part,
    partName: part,
    partCode: extractPartCode(part),
    qty: 1,
    amount: 0,
    technician: "",
    labourCode: "Auto Select With Part",
    itemType: "part",
  }));
}

/**
 * Extract part code from part description (first alphanumeric block)
 */
function extractPartCode(description: string): string {
  // Match first alphanumeric block (e.g., "ABC123", "PART-001", etc.)
  const match = description.match(/[A-Z0-9-]+/i);
  return match ? match[0] : "";
}

/**
 * Auto-generate SR NO for PART 2 items
 */
export function generateSrNoForPart2Items(items: JobCardPart2Item[]): JobCardPart2Item[] {
  return items.map((item, index) => ({
    ...item,
    srNo: index + 1,
  }));
}

/**
 * Convert JobCardPart1 to JSON format as specified in the extraction rules
 */
export function jobCardPart1ToJSON(part1: JobCardPart1): Record<string, string> {
  return {
    full_name: part1.fullName,
    mobile_primary: part1.mobilePrimary,
    customer_type: part1.customerType,
    vehicle_brand: part1.vehicleBrand,
    vehicle_model: part1.vehicleModel,
    registration_number: part1.registrationNumber,
    vin_chassis_number: part1.vinChassisNumber,
    variant_battery_capacity: part1.variantBatteryCapacity,
    warranty_status: part1.warrantyStatus,
    estimated_delivery_date: part1.estimatedDeliveryDate,
    customer_address: part1.customerAddress,
    job_card_number: part1.jobCardNumber,
    customer_feedback: part1.customerFeedback,
    technician_observation: part1.technicianObservation,
    insurance_start_date: part1.insuranceStartDate,
    insurance_end_date: part1.insuranceEndDate,
    insurance_company_name: part1.insuranceCompanyName,
    battery_serial_number: part1.batterySerialNumber,
    mcu_serial_number: part1.mcuSerialNumber,
    vcu_serial_number: part1.vcuSerialNumber,
    other_part_serial_number: part1.otherPartSerialNumber,
  };
}

/**
 * Convert JobCardPart2Item[] to JSON format as specified in the extraction rules
 * Note: qty and amount are returned as strings per specification
 */
export function jobCardPart2ToJSON(part2: JobCardPart2Item[]): Array<Record<string, string>> {
  return part2.map((item) => ({
    sr_no: String(item.srNo),
    part_warranty_tag: item.partWarrantyTag || "",
    part_name: item.partName || "",
    part_code: item.partCode || "",
    qty: String(item.qty || 0),
    amount: String(item.amount || 0),
    technician: item.technician || "",
    labour_code: item.labourCode || "",
  }));
}

/**
 * Convert JobCardPart2A to JSON format as specified in the extraction rules
 */
export function jobCardPart2AToJSON(part2A: JobCardPart2A): Record<string, string> {
  return {
    video_evidence: part2A.videoEvidence,
    vin_image: part2A.vinImage,
    odo_image: part2A.odoImage,
    damage_images: part2A.damageImages,
    issue_description: part2A.issueDescription,
    number_of_observations: part2A.numberOfObservations,
    symptom: part2A.symptom,
    defect_part: part2A.defectPart,
  };
}

/**
 * Convert JobCardPart3 to JSON format as specified in the extraction rules
 * Note: qty, issue_qty, and return_qty are returned as strings per specification
 */
export function jobCardPart3ToJSON(part3: JobCardPart3): Record<string, string> {
  return {
    customer_type: part3.customerType || "",
    vehicle_brand: part3.vehicleBrand || "",
    vehicle_model: part3.vehicleModel || "",
    registration_number: part3.registrationNumber || "",
    vin_chassis_number: part3.vinChassisNumber || "",
    job_card_number: part3.jobCardNumber || "",
    part_code: part3.partCode || "",
    part_name: part3.partName || "",
    qty: String(part3.qty || 0),
    issue_qty: String(part3.issueQty || 0),
    return_qty: String(part3.returnQty || 0),
    warranty_tag_number: part3.warrantyTagNumber || "",
    return_part_number: part3.returnPartNumber || "",
    approval_details: part3.approvalDetails || "",
  };
}

/**
 * Convert complete job card to JSON format as specified in the extraction rules
 */
export function jobCardToExtractionJSON(jobCard: {
  part1?: JobCardPart1;
  part2?: JobCardPart2Item[];
  part2A?: JobCardPart2A;
  part3?: JobCardPart3;
}): Record<string, any> {
  return {
    part1: jobCard.part1 ? jobCardPart1ToJSON(jobCard.part1) : {},
    part2: jobCard.part2 ? jobCardPart2ToJSON(jobCard.part2) : [],
    part2A: jobCard.part2A ? jobCardPart2AToJSON(jobCard.part2A) : {},
    part3: jobCard.part3 ? jobCardPart3ToJSON(jobCard.part3) : {},
  };
}

