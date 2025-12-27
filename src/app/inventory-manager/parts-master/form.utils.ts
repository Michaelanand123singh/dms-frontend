/**
 * Form Utility Functions
 * Helper functions for form data transformation
 * Updated with new parameters from image
 */

import type { Part, PartFormData } from "@/features/inventory/types/inventory.types";
import { getInitialFormData, type PartsMasterFormData } from "./form.schema";

/**
 * Helper to get trimmed string value if not empty
 */
function getStringIfNotEmpty(value: string | number | undefined | null): string | undefined {
  if (value === undefined || value === null) return undefined;
  const stringValue = String(value).trim();
  return stringValue.length > 0 ? stringValue : undefined;
}

/**
 * Helper to get numeric value if valid
 */
function getNumberIfValid(value: string | number | undefined | null): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value).replace(/[%₹,\s]/g, ''));
  return isNaN(num) ? undefined : num;
}

/**
 * Map PartsMasterFormData to PartFormData (only includes fields with data)
 */
export function mapFormDataToPartFormData(formData: PartsMasterFormData): PartFormData {
  const partData: PartFormData = {
    // partName is required
    partName: String(formData.partName || "").trim(),

    // Optional basic fields - only include if they have data
    ...(getStringIfNotEmpty(formData.partNumber) && { partNumber: getStringIfNotEmpty(formData.partNumber) }),
    ...(getStringIfNotEmpty(formData.category) && { category: getStringIfNotEmpty(formData.category) }),
    ...(getStringIfNotEmpty(formData.description) && { description: getStringIfNotEmpty(formData.description) }),
    ...(formData.minStock !== undefined && formData.minStock !== null && { minStockLevel: Number(formData.minStock) || 0 }),
    ...(getStringIfNotEmpty(formData.unit) && { unit: getStringIfNotEmpty(formData.unit) }),

    // OEM and Origin
    ...(getStringIfNotEmpty(formData.oemPartNumber) && { oemPartNumber: getStringIfNotEmpty(formData.oemPartNumber) }),
    ...(getStringIfNotEmpty(formData.originType) && { originType: getStringIfNotEmpty(formData.originType) }),

    // Basic Part Info
    ...(getStringIfNotEmpty(formData.brandName) && { brandName: getStringIfNotEmpty(formData.brandName) }),
    ...(getStringIfNotEmpty(formData.variant) && { variant: getStringIfNotEmpty(formData.variant) }),
    ...(getStringIfNotEmpty(formData.partType) && { partType: getStringIfNotEmpty(formData.partType) }),
    ...(getStringIfNotEmpty(formData.color) && { color: getStringIfNotEmpty(formData.color) }),

    // Pricing - Purchase
    ...(getNumberIfValid(formData.purchasePrice) !== undefined && { costPrice: getNumberIfValid(formData.purchasePrice) }),
    ...(getNumberIfValid(formData.pricePreGst) !== undefined && { pricePreGst: getNumberIfValid(formData.pricePreGst) }),
    ...(getNumberIfValid(formData.gstRateInput) !== undefined && { gstRateInput: getNumberIfValid(formData.gstRateInput) }),
    ...(getNumberIfValid(formData.gstInput) !== undefined && { gstInput: getNumberIfValid(formData.gstInput) }),

    // Pricing - Sale
    ...(getNumberIfValid(formData.pricePreGst) !== undefined && { unitPrice: getNumberIfValid(formData.pricePreGst) }),
    ...(getNumberIfValid(formData.pricePreGst) !== undefined && { price: getNumberIfValid(formData.pricePreGst) }),
    ...(getNumberIfValid(formData.gstRateOutput) !== undefined && { gstRate: getNumberIfValid(formData.gstRateOutput) }),
    ...(getNumberIfValid(formData.gstRateOutput) !== undefined && { gstRateOutput: getNumberIfValid(formData.gstRateOutput) }),
    ...(getNumberIfValid(formData.totalPrice) !== undefined && { totalPrice: getNumberIfValid(formData.totalPrice) }),
    ...(getNumberIfValid(formData.totalGst) !== undefined && { totalGst: getNumberIfValid(formData.totalGst) }),

    // Labour Information - using new field names
    ...(getStringIfNotEmpty(formData.labourName) && { labourName: getStringIfNotEmpty(formData.labourName) }),
    ...(getStringIfNotEmpty(formData.labourCode) && { labourCode: getStringIfNotEmpty(formData.labourCode) }),
    ...(getStringIfNotEmpty(formData.labourWorkTime) && { labourWorkTime: getStringIfNotEmpty(formData.labourWorkTime) }),
    ...(getNumberIfValid(formData.labourRate) !== undefined && { labourRate: getNumberIfValid(formData.labourRate) }),
    ...(getNumberIfValid(formData.labourGstRate) !== undefined && { labourGstRate: getNumberIfValid(formData.labourGstRate) }),
    ...(getNumberIfValid(formData.labourPrice) !== undefined && { labourPrice: getNumberIfValid(formData.labourPrice) }),

    // High Value Part
    ...(formData.highValuePart !== undefined && { highValuePart: formData.highValuePart }),

    // Service Center
    ...(getStringIfNotEmpty(formData.centerId) && { serviceCenterId: getStringIfNotEmpty(formData.centerId) }),
  };

  return partData;
}

/**
 * Map Part entity to PartsMasterFormData
 */
export function mapPartToFormData(part: Part): PartsMasterFormData {
  const initialData = getInitialFormData();

  return {
    ...initialData,
    partName: part.partName || "",
    partNumber: part.partNumber || "",
    category: part.category || "",
    description: part.description || "",
    minStock: part.minStockLevel || 0,
    unit: part.unit || "piece",

    // OEM and Origin
    oemPartNumber: part.oemPartNumber || "",
    originType: part.originType || "NEW",
    purchasePrice: String(part.costPrice || ""),

    // Basic Part Info
    brandName: part.brandName || "",
    variant: part.variant || "",
    partType: part.partType || "",
    color: part.color || "",

    // GST and Pricing
    gstAmount: String(part.gstInput || ""),
    gstRateInput: String(part.gstRateInput || ""),
    pricePreGst: String(part.unitPrice || part.pricePreGst || ""),
    gstRateOutput: String(part.gstRate || part.gstRateOutput || ""),

    // Labour Information - using new field names
    labourName: part.labourName || "",
    labourCode: part.labourCode || "",
    labourWorkTime: part.labourWorkTime || "",
    labourRate: String(part.labourRate || ""),
    labourGstRate: String(part.labourGstRate || ""),
    labourPrice: String(part.labourPrice || ""),

    // Calculated Totals
    gstInput: String(part.gstInput || ""),
    totalPrice: String(part.totalPrice || ""),
    totalGst: String(part.totalGst || ""),

    // High Value Part
    highValuePart: part.highValuePart || false,

    // Service Center
    centerId: part.serviceCenterId,
  };
}
