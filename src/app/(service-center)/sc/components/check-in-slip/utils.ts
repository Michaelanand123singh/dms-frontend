import type { CheckInSlipFormData } from "@/shared/types/check-in-slip.types";
import type { EnhancedCheckInSlipData } from "@/shared/types/check-in-slip.types";
import type { CustomerWithVehicles, Vehicle } from "@/shared/types";
import { generateCheckInSlipNumber } from "@/components/check-in-slip/CheckInSlip";
import { staticServiceCenters } from "@/shared/types";

import { SERVICE_CENTER_CODE_MAP } from "../../appointments/constants";

/**
 * Convert check-in slip form data to enhanced check-in slip data
 */
export function convertCheckInSlipFormToData(
  formData: CheckInSlipFormData,
  customer: CustomerWithVehicles | null,
  vehicle: Vehicle | null,
  appointmentData?: any,
  serviceCenterId?: string,
  serviceCenterName?: string
): EnhancedCheckInSlipData {
  const now = new Date();
  const checkInDate = now.toISOString().split("T")[0];
  const checkInTime = now.toTimeString().slice(0, 5);

  // Get service center details
  const normalizedServiceCenterId = serviceCenterId || "sc-001";
  const serviceCenterCode = SERVICE_CENTER_CODE_MAP[normalizedServiceCenterId] || "SC001";
  const serviceCenter = staticServiceCenters.find(
    (sc) => (sc as any).serviceCenterId === normalizedServiceCenterId || sc.id?.toString() === normalizedServiceCenterId
  );

  // Use the proper ServiceCenter properties (address, city, state, pinCode)
  const serviceCenterAddress = serviceCenter?.address || "";
  const serviceCenterCity = serviceCenter?.city || "";
  const serviceCenterState = serviceCenter?.state || "";
  const serviceCenterPincode = serviceCenter?.pinCode || "";

  const slipNumber = generateCheckInSlipNumber(serviceCenterCode);

  // Extract vehicle details
  const vehicleMake = vehicle?.vehicleMake || appointmentData?.vehicleBrand || "";
  const vehicleModel = vehicle?.vehicleModel || appointmentData?.vehicleModel || "";
  const registrationNumber = vehicle?.registration || appointmentData?.registrationNumber || "";
  const vin = vehicle?.vin || appointmentData?.vinChassisNumber || "";

  return {
    slipNumber,
    customerName: customer?.name || appointmentData?.customerName || "",
    phone: customer?.phone || appointmentData?.phone || "",
    email: customer?.email || appointmentData?.email,
    customerType: formData.customerType || customer?.customerType || appointmentData?.customerType,
    vehicleMake,
    vehicleModel,
    registrationNumber,
    vin,
    checkInDate,
    checkInTime,
    serviceCenterName: serviceCenterName || serviceCenter?.name || "Service Center",
    serviceCenterAddress,
    serviceCenterCity,
    serviceCenterState,
    serviceCenterPincode,
    serviceCenterPhone: (serviceCenter as any)?.phone || undefined,
    expectedServiceDate: appointmentData?.estimatedDeliveryDate || formData.extendedDeliveryDate,
    serviceType: appointmentData?.serviceType,
    notes: appointmentData?.customerComplaint || formData.customerFeedback,

    // Section 1: Customer & Vehicle Details
    dateOfVehicleDelivery: formData.dateOfVehicleDelivery || vehicle?.purchaseDate || appointmentData?.dateOfPurchase,
    extendedDeliveryDate: formData.extendedDeliveryDate,
    customerFeedback: formData.customerFeedback || appointmentData?.customerComplaint,
    technicalObservation: formData.technicalObservation || appointmentData?.technicianObservation,
    batterySerialNumber: formData.batterySerialNumber || appointmentData?.batterySerialNumber,
    mcuSerialNumber: formData.mcuSerialNumber || appointmentData?.mcuSerialNumber,
    vcuSerialNumber: formData.vcuSerialNumber || appointmentData?.vcuSerialNumber,
    otherPartSerialNumber: formData.otherPartSerialNumber || appointmentData?.otherPartSerialNumber,

    // Section 2: Vehicle Images
    vehicleImages: {
      front: typeof formData.vehicleImageFront === "string" ? formData.vehicleImageFront : undefined,
      rear: typeof formData.vehicleImageRear === "string" ? formData.vehicleImageRear : undefined,
      rightSide: typeof formData.vehicleImageRight === "string" ? formData.vehicleImageRight : undefined,
      leftSide: typeof formData.vehicleImageLeft === "string" ? formData.vehicleImageLeft : undefined,
      otherDamages: formData.vehicleImageDamages?.filter((img): img is string => typeof img === "string") || [],
    },
    chargerGiven: formData.chargerGiven,

    // Section 3: Mirror & Loose Items
    mirrorCondition: {
      rh: formData.mirrorRH,
      lh: formData.mirrorLH,
    },
    otherPartsInVehicle: formData.otherPartsInVehicle,

    // Section 4: Service & Consent
    serviceAdvisor: formData.serviceAdvisor || appointmentData?.assignedServiceAdvisor,
    signatures: {
      receivingSignature: formData.receivingSignature,
      customerSignature: formData.customerSignature,
      signedDate: checkInDate,
    },
    customerAcceptsTerms: formData.customerAcceptsTerms,

    // Section 5: Warranty Tag
    warrantyTag: {
      warrantyTag: formData.warrantyTag,
      vehicleSerialNumber: formData.vehicleSerialNumber,
      vehicleRegistrationNumber: registrationNumber,
      defectPartNumber: formData.defectPartNumber,
      defectDescription: formData.defectDescription,
      observation: formData.observation,
    },

    // Section 6: Symptom
    symptom: formData.symptom,

    // Section 7: Defect Area
    defectArea: formData.defectArea,
  };
}


