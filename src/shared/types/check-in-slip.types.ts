/**
 * Enhanced Check-in Slip Type Definitions
 * Based on comprehensive check-in slip specification
 */

export interface VehicleImageData {
  front?: string; // URL or base64
  rear?: string;
  rightSide?: string;
  leftSide?: string;
  otherDamages?: string[]; // Array of URLs/base64 (max 5)
}

export interface MirrorCondition {
  rh?: "Good" | "Damaged" | "Missing" | "N/A";
  lh?: "Good" | "Damaged" | "Missing" | "N/A";
}

export interface SignatureData {
  receivingSignature?: string; // URL or base64
  customerSignature?: string; // URL or base64
  customerName?: string;
  signedDate?: string;
}

export interface WarrantyTagData {
  warrantyTag?: string;
  vehicleSerialNumber?: string;
  vehicleRegistrationNumber?: string;
  defectPartNumber?: string;
  defectDescription?: string;
  observation?: string; // Numeric only
}

export type DefectArea =
  | "Chassis"
  | "VCU / MCU"
  | "Motor"
  | "Battery"
  | "Charger"
  | "Electrical Component"
  | "Wiring"
  | "Suspension"
  | "Speedometer"
  | "Braking System"
  | "Other";

export interface EnhancedCheckInSlipData {
  // Basic Information (from existing CheckInSlipData)
  slipNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  customerType?: "B2C" | "B2B";
  vehicleMake: string;
  vehicleModel: string;
  registrationNumber: string;
  vin?: string;
  checkInDate: string;
  checkInTime: string;
  serviceCenterName: string;
  serviceCenterAddress: string;
  serviceCenterCity: string;
  serviceCenterState: string;
  serviceCenterPincode: string;
  serviceCenterPhone?: string;
  expectedServiceDate?: string;
  serviceType?: string;
  notes?: string;

  // Section 1: Customer & Vehicle Details (Additional fields)
  dateOfVehicleDelivery?: string;
  extendedDeliveryDate?: string;
  customerFeedback?: string; // Customer Feedback / Concerns
  technicalObservation?: string; // Initial technician notes
  batterySerialNumber?: string;
  mcuSerialNumber?: string;
  vcuSerialNumber?: string;
  otherPartSerialNumber?: string;

  // Section 2: Vehicle Image & Condition Check
  vehicleImages?: VehicleImageData;
  chargerGiven?: boolean;

  // Section 3: Mirror & Loose Items Check
  mirrorCondition?: MirrorCondition;
  otherPartsInVehicle?: string; // Loose items description

  // Section 4: Service & Customer Consent
  serviceAdvisor?: string;
  signatures?: SignatureData;
  customerAcceptsTerms?: boolean;

  // Section 5: Warranty Tag & Core Vehicle IDs
  warrantyTag?: WarrantyTagData;

  // Section 6: Symptom Section (Problem Description)
  symptom?: string; // Large free-text area

  // Section 7: Defect Area (System Classification)
  defectArea?: DefectArea;
}

export interface CheckInSlipFormData {
  // Customer & Vehicle Details
  customerType?: "B2C" | "B2B";
  dateOfVehicleDelivery?: string;
  extendedDeliveryDate?: string;
  customerFeedback?: string;
  technicalObservation?: string;
  batterySerialNumber?: string;
  mcuSerialNumber?: string;
  vcuSerialNumber?: string;
  otherPartSerialNumber?: string;

  // Vehicle Images
  vehicleImageFront?: File | string;
  vehicleImageRear?: File | string;
  vehicleImageRight?: File | string;
  vehicleImageLeft?: File | string;
  vehicleImageDamages?: (File | string)[]; // Max 5

  // Condition Checks
  chargerGiven?: boolean;
  mirrorRH?: "Good" | "Damaged" | "Missing" | "N/A";
  mirrorLH?: "Good" | "Damaged" | "Missing" | "N/A";
  otherPartsInVehicle?: string;

  // Service & Consent
  serviceAdvisor?: string;
  receivingSignature?: string;
  customerSignature?: string;
  customerAcceptsTerms?: boolean;

  // Warranty & Defect
  warrantyTag?: string;
  vehicleSerialNumber?: string;
  defectPartNumber?: string;
  defectDescription?: string;
  observation?: string;

  // Symptom & Defect Area
  symptom?: string;
  defectArea?: DefectArea;
}


