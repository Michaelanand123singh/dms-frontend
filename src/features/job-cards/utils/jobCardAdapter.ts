import { Quotation } from "@/shared/types/quotation.types";
import { CustomerWithVehicles, Vehicle } from "@/shared/types/vehicle.types";
import { CreateJobCardForm, JobCardPart2Item } from "../types/job-card.types";

/**
 * Adapter to map various source data (Quotations, Customers, Vehicles) 
 * into a Job Card Form structure.
 */
export const jobCardAdapter = {
    /**
     * Initialize a form with common defaults
     */
    createEmptyForm: (): CreateJobCardForm => ({
        vehicleId: "",
        customerId: "",
        customerName: "",
        vehicleRegistration: "",
        vehicleMake: "",
        vehicleModel: "",
        description: "",
        selectedParts: [],
        part2Items: [],
        fullName: "",
        mobilePrimary: "",
        customerType: "",
        vehicleBrand: "",
        vinChassisNumber: "",
        variantBatteryCapacity: "",
        warrantyStatus: "",
        estimatedDeliveryDate: "",
        customerAddress: "",
        customerFeedback: "",
        technicianObservation: "",
        insuranceStartDate: "",
        insuranceEndDate: "",
        insuranceCompanyName: "",
        batterySerialNumber: "",
        mcuSerialNumber: "",
        vcuSerialNumber: "",
        otherPartSerialNumber: "",
        videoEvidence: { files: [], urls: [] },
        vinImage: { files: [], urls: [] },
        odoImage: { files: [], urls: [] },
        damageImages: { files: [], urls: [] },
        issueDescription: "",
        numberOfObservations: "",
        symptom: "",
        defectPart: "",
    }),

    /**
     * Map an approved Quotation and its associated Customer/Vehicle to Job Card Form
     */
    mapQuotationToForm: (
        quotation: Quotation,
        customer: CustomerWithVehicles,
        vehicle?: Vehicle
    ): Partial<CreateJobCardForm> => {
        const vehicleToUse = vehicle ||
            customer.vehicles?.find(v => quotation.vehicleId && v.id.toString() === quotation.vehicleId) ||
            (customer.vehicles && customer.vehicles.length > 0 ? customer.vehicles[0] : undefined);

        const customerName = quotation.customer
            ? `${quotation.customer.firstName || ""} ${quotation.customer.lastName || ""}`.trim()
            : customer.name || "";

        const part2Items: JobCardPart2Item[] = (quotation.items || []).map((item, index) => ({
            srNo: index + 1,
            partWarrantyTag: "",
            partName: item?.partName || "",
            partCode: item?.partNumber || "",
            qty: item?.quantity || 0,
            amount: item?.amount || 0,
            technician: "",
            labourCode: "Auto Select With Part",
            itemType: "part" as const,
        }));

        return {
            customerId: customer.id.toString(),
            customerName: customerName,
            fullName: customerName,
            mobilePrimary: quotation.customer?.phone || customer.phone || "",
            customerType: customer.customerType || "",
            customerAddress: quotation.customer?.address || customer.address || "",
            vehicleId: vehicleToUse?.id?.toString() || quotation.vehicleId || "",
            vehicleRegistration: quotation.vehicle?.registration || vehicleToUse?.registration || "",
            vehicleMake: quotation.vehicle?.make || vehicleToUse?.vehicleMake || "",
            vehicleModel: quotation.vehicle?.model || vehicleToUse?.vehicleModel || "",
            vehicleBrand: quotation.vehicle?.make || vehicleToUse?.vehicleMake || "",
            vinChassisNumber: quotation.vehicle?.vin || vehicleToUse?.vin || "",
            variantBatteryCapacity: vehicleToUse?.variant || "",
            warrantyStatus: vehicleToUse?.warrantyStatus || "",
            description: quotation.notes || quotation.customNotes || "",
            customerFeedback: quotation.customNotes || quotation.notes || "",
            part2Items,
            insuranceCompanyName: (quotation as any).insurer?.name || "",
            insuranceStartDate: quotation.insuranceStartDate || "",
            insuranceEndDate: quotation.insuranceEndDate || "",
            batterySerialNumber: quotation.batterySerialNumber || "",
        };
    },

    /**
     * Map a Customer and optional Vehicle to Job Card Form
     */
    mapCustomerToForm: (
        customer: CustomerWithVehicles,
        vehicle?: Vehicle
    ): Partial<CreateJobCardForm> => {
        const vehicleToUse = vehicle || (customer.vehicles && customer.vehicles.length > 0 ? customer.vehicles[0] : undefined);

        return {
            customerId: customer.id.toString(),
            customerName: customer.name,
            fullName: customer.name,
            mobilePrimary: customer.phone,
            whatsappNumber: customer.whatsappNumber,
            alternateMobile: customer.alternateMobile,
            email: customer.email,
            customerType: customer.customerType || "",
            customerAddress: customer.address || "",
            vehicleId: vehicleToUse?.id?.toString() || "",
            vehicleRegistration: vehicleToUse?.registration || "",
            vehicleMake: vehicleToUse?.vehicleMake || "",
            vehicleModel: vehicleToUse?.vehicleModel || "",
            vehicleBrand: vehicleToUse?.vehicleMake || "",
            vinChassisNumber: vehicleToUse?.vin || "",
            variantBatteryCapacity: vehicleToUse?.variant || "",
            warrantyStatus: vehicleToUse?.warrantyStatus || "",
            vehicleYear: vehicleToUse?.vehicleYear,
            motorNumber: vehicleToUse?.motorNumber,
            chargerSerialNumber: vehicleToUse?.chargerSerialNumber,
            dateOfPurchase: vehicleToUse?.purchaseDate,
            vehicleColor: vehicleToUse?.vehicleColor,
            insuranceCompanyName: "",
            insuranceStartDate: vehicleToUse?.insuranceStartDate || "",
            insuranceEndDate: vehicleToUse?.insuranceEndDate || "",
        };
    },

    /**
     * Map Form data back to a JobCard object for saving
     */
    mapFormToJobCard: (
        form: CreateJobCardForm,
        serviceCenterId: string,
        serviceCenterCode: string,
        existingJobCard?: any
    ): any => {
        const { generateJobCardNumber } = require("@/shared/utils/job-card.utils");
        const { generateSrNoForPart2Items } = require("./jobCardUtils");

        const jobCardNumber = existingJobCard?.jobCardNumber || generateJobCardNumber(serviceCenterId);

        // Construct Part 1
        const part1 = {
            fullName: form.fullName || form.customerName,
            mobilePrimary: form.mobilePrimary,
            customerType: form.customerType,
            vehicleBrand: form.vehicleBrand || form.vehicleMake,
            vehicleModel: form.vehicleModel,
            registrationNumber: form.vehicleRegistration,
            vinChassisNumber: form.vinChassisNumber,
            variantBatteryCapacity: form.variantBatteryCapacity,
            warrantyStatus: form.warrantyStatus,
            estimatedDeliveryDate: form.estimatedDeliveryDate,
            customerAddress: form.customerAddress,
            jobCardNumber: jobCardNumber,
            customerFeedback: form.customerFeedback || form.description,
            technicianObservation: form.technicianObservation,
            insuranceStartDate: form.insuranceStartDate,
            insuranceEndDate: form.insuranceEndDate,
            insuranceCompanyName: form.insuranceCompanyName,
            batterySerialNumber: form.batterySerialNumber,
            mcuSerialNumber: form.mcuSerialNumber,
            vcuSerialNumber: form.vcuSerialNumber,
            otherPartSerialNumber: form.otherPartSerialNumber,
        };

        // Construct Part 2
        const part2 = generateSrNoForPart2Items(form.part2Items);

        // Construct Part 2A
        const part2A = {
            videoEvidence: (form.videoEvidence.files.length > 0 || form.videoEvidence.urls.length > 0) ? "Yes" : "No",
            vinImage: (form.vinImage.files.length > 0 || form.vinImage.urls.length > 0) ? "Yes" : "No",
            odoImage: (form.odoImage.files.length > 0 || form.odoImage.urls.length > 0) ? "Yes" : "No",
            damageImages: (form.damageImages.files.length > 0 || form.damageImages.urls.length > 0) ? "Yes" : "No",
            issueDescription: form.issueDescription || "",
            numberOfObservations: form.numberOfObservations || "",
            symptom: form.symptom || "",
            defectPart: form.defectPart || "",
        };

        return {
            ...(existingJobCard || {}),
            id: existingJobCard?.id || `JC-${Date.now()}`,
            jobCardNumber,
            serviceCenterId,
            serviceCenterCode,
            customerId: form.customerId,
            customerName: form.customerName,
            vehicleId: form.vehicleId,
            vehicle: `${form.vehicleMake} ${form.vehicleModel}`.trim(),
            registration: form.vehicleRegistration,
            vehicleMake: form.vehicleMake,
            vehicleModel: form.vehicleModel,
            customerType: form.customerType || "B2C",
            serviceType: form.description || "General Service",
            description: form.description,
            status: existingJobCard?.status || "Created",
            priority: existingJobCard?.priority || "Normal",
            createdAt: existingJobCard?.createdAt || new Date().toISOString(),
            parts: form.selectedParts,

            // Additional fields
            customerWhatsappNumber: form.whatsappNumber,
            customerAlternateMobile: form.alternateMobile,
            customerEmail: form.email,
            vehicleYear: form.vehicleYear,
            motorNumber: form.motorNumber,
            chargerSerialNumber: form.chargerSerialNumber,
            dateOfPurchase: form.dateOfPurchase,
            vehicleColor: form.vehicleColor,
            previousServiceHistory: form.previousServiceHistory,
            odometerReading: form.odometerReading,
            pickupDropRequired: form.pickupDropRequired,
            pickupAddress: form.pickupAddress,
            pickupState: form.pickupState,
            pickupCity: form.pickupCity,
            pickupPincode: form.pickupPincode,
            dropAddress: form.dropAddress,
            dropState: form.dropState,
            dropCity: form.dropCity,
            dropPincode: form.dropPincode,
            preferredCommunicationMode: form.preferredCommunicationMode,
            arrivalMode: form.arrivalMode,
            checkInNotes: form.checkInNotes,
            checkInSlipNumber: form.checkInSlipNumber,
            checkInDate: form.checkInDate,
            checkInTime: form.checkInTime,

            // Structured Data
            part1,
            part2,
            part2A,
        };
    },
    /**
     * Map a JobCard object back to Form data for editing
     */
    mapJobCardToForm: (jobCard: any): Partial<CreateJobCardForm> => {
        return {
            customerId: jobCard.customerId || "",
            customerName: jobCard.customerName || "",
            fullName: jobCard.part1?.fullName || jobCard.customerName || "",
            mobilePrimary: jobCard.part1?.mobilePrimary || "",
            whatsappNumber: jobCard.customerWhatsappNumber || "",
            alternateMobile: jobCard.customerAlternateMobile || "",
            email: jobCard.customerEmail || "",
            customerType: jobCard.part1?.customerType || jobCard.customerType || "",
            customerAddress: jobCard.part1?.customerAddress || "",
            vehicleId: jobCard.vehicleId || "",
            vehicleRegistration: jobCard.part1?.registrationNumber || jobCard.registration || "",
            vehicleMake: jobCard.vehicleMake || "",
            vehicleModel: jobCard.vehicleModel || "",
            vehicleBrand: jobCard.part1?.vehicleBrand || jobCard.vehicleMake || "",
            vinChassisNumber: jobCard.part1?.vinChassisNumber || "",
            variantBatteryCapacity: jobCard.part1?.variantBatteryCapacity || "",
            warrantyStatus: jobCard.part1?.warrantyStatus || "",
            vehicleYear: jobCard.vehicleYear,
            motorNumber: jobCard.motorNumber,
            chargerSerialNumber: jobCard.chargerSerialNumber,
            dateOfPurchase: jobCard.dateOfPurchase,
            vehicleColor: jobCard.vehicleColor,
            description: jobCard.description || "",
            customerFeedback: jobCard.part1?.customerFeedback || "",
            technicianObservation: jobCard.part1?.technicianObservation || "",
            insuranceStartDate: jobCard.part1?.insuranceStartDate || "",
            insuranceEndDate: jobCard.part1?.insuranceEndDate || "",
            insuranceCompanyName: jobCard.part1?.insuranceCompanyName || "",
            batterySerialNumber: jobCard.part1?.batterySerialNumber || "",
            mcuSerialNumber: jobCard.part1?.mcuSerialNumber || "",
            vcuSerialNumber: jobCard.part1?.vcuSerialNumber || "",
            otherPartSerialNumber: jobCard.part1?.otherPartSerialNumber || "",
            part2Items: jobCard.part2 || [],
            videoEvidence: { files: [], urls: [] },
            vinImage: { files: [], urls: [] },
            odoImage: { files: [], urls: [] },
            damageImages: { files: [], urls: [] },
            issueDescription: jobCard.part2A?.issueDescription || "",
            numberOfObservations: jobCard.part2A?.numberOfObservations || "",
            symptom: jobCard.part2A?.symptom || "",
            defectPart: jobCard.part2A?.defectPart || "",
            estimatedDeliveryDate: jobCard.part1?.estimatedDeliveryDate || "",
            previousServiceHistory: jobCard.previousServiceHistory || "",
            odometerReading: jobCard.odometerReading || "",
            arrivalMode: jobCard.arrivalMode || "vehicle_present",
            checkInNotes: jobCard.checkInNotes || "",
            pickupDropRequired: jobCard.pickupDropRequired || false,
            pickupAddress: jobCard.pickupAddress || "",
            pickupState: jobCard.pickupState || "",
            pickupCity: jobCard.pickupCity || "",
            pickupPincode: jobCard.pickupPincode || "",
            dropAddress: jobCard.dropAddress || "",
            dropState: jobCard.dropState || "",
            dropCity: jobCard.dropCity || "",
            dropPincode: jobCard.dropPincode || "",
            preferredCommunicationMode: jobCard.preferredCommunicationMode || "WhatsApp",
        };
    }
};
