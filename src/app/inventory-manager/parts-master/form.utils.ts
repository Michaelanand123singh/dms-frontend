/**
 * Form Utility Functions
 * Helper functions for form data transformation
 * Updated with new parameters from image
 */

import type { Part, PartFormData } from "@/shared/types/inventory.types";
import { getInitialFormData, type PartsMasterFormData } from "./form.schema";

/**
 * Helper to get trimmed value if not empty
 */
function getValueIfNotEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Map PartsMasterFormData to PartFormData (only includes fields with data)
 */
export function mapFormDataToPartFormData(formData: PartsMasterFormData): PartFormData {
  const partData: PartFormData = {
    // partName is required
    partName: formData.partName?.trim() || "",
    // Optional basic fields - only include if they have data
    ...(formData.partId?.trim() && { partId: formData.partId.trim() }),
    ...(formData.partNumber?.trim() && { partNumber: formData.partNumber.trim() }),
    ...(formData.category?.trim() && { category: formData.category.trim() }),
    // Calculate price from totalPrice if available, otherwise use purchasePrice
    ...(formData.totalPrice && { price: parseFloat(formData.totalPrice) || 0 }),
    ...((!formData.totalPrice && formData.purchasePrice) && { price: parseFloat(formData.purchasePrice) || 0 }),
    ...(getValueIfNotEmpty(formData.description) && { description: getValueIfNotEmpty(formData.description) }),
    ...(formData.minStock !== undefined && formData.minStock !== null && { minStockLevel: formData.minStock }),
    ...(formData.unit?.trim() && { unit: formData.unit.trim() }),
    // New fields from image
    ...(getValueIfNotEmpty(formData.oemPartNumber) && { oemPartNumber: getValueIfNotEmpty(formData.oemPartNumber) }),
    ...(getValueIfNotEmpty(formData.originType) && { originType: getValueIfNotEmpty(formData.originType) }),
    ...(getValueIfNotEmpty(formData.purchasePrice) && { purchasePrice: getValueIfNotEmpty(formData.purchasePrice) }),
    // Basic Part Info
    ...(getValueIfNotEmpty(formData.brandName) && { brandName: getValueIfNotEmpty(formData.brandName) }),
    ...(getValueIfNotEmpty(formData.variant) && { variant: getValueIfNotEmpty(formData.variant) }),
    ...(getValueIfNotEmpty(formData.partType) && { partType: getValueIfNotEmpty(formData.partType) }),
    ...(getValueIfNotEmpty(formData.color) && { color: getValueIfNotEmpty(formData.color) }),
    // GST and Pricing
    ...(getValueIfNotEmpty(formData.gstAmount) && { gstAmount: getValueIfNotEmpty(formData.gstAmount) }),
    ...(getValueIfNotEmpty(formData.gstRateInput) && { gstRateInput: getValueIfNotEmpty(formData.gstRateInput) }),
    ...(getValueIfNotEmpty(formData.pricePreGst) && { pricePreGst: getValueIfNotEmpty(formData.pricePreGst) }),
    ...(getValueIfNotEmpty(formData.gstRateOutput) && { gstRateOutput: getValueIfNotEmpty(formData.gstRateOutput) }),
    // Labour Information
    ...(getValueIfNotEmpty(formData.estimatedLabour) && { estimatedLabour: getValueIfNotEmpty(formData.estimatedLabour) }),
    ...(getValueIfNotEmpty(formData.estimatedLabourWorkTime) && { estimatedLabourWorkTime: getValueIfNotEmpty(formData.estimatedLabourWorkTime) }),
    ...(getValueIfNotEmpty(formData.labourRate) && { labourRate: getValueIfNotEmpty(formData.labourRate) }),
    ...(getValueIfNotEmpty(formData.labourGstRate) && { labourGstRate: getValueIfNotEmpty(formData.labourGstRate) }),
    ...(getValueIfNotEmpty(formData.labourPrice) && { labourPrice: getValueIfNotEmpty(formData.labourPrice) }),
    // Calculated Totals
    ...(getValueIfNotEmpty(formData.gstInput) && { gstInput: getValueIfNotEmpty(formData.gstInput) }),
    ...(getValueIfNotEmpty(formData.totalPrice) && { totalPrice: getValueIfNotEmpty(formData.totalPrice) }),
    ...(getValueIfNotEmpty(formData.totalGst) && { totalGst: getValueIfNotEmpty(formData.totalGst) }),
    // High Value Part
    ...(formData.highValuePart !== undefined && { highValuePart: formData.highValuePart }),
    // Optional
    ...(getValueIfNotEmpty(formData.centerId) && { centerId: getValueIfNotEmpty(formData.centerId) }),
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
    partId: part.partId,
    partName: part.partName,
    partNumber: part.partNumber,
    category: part.category,
    description: part.description || "",
    minStock: part.minStockLevel || 0,
    unit: part.unit,
    // New fields from image
    oemPartNumber: part.oemPartNumber || "",
    originType: part.originType || "NEW",
    purchasePrice: part.purchasePrice || "",
    // Basic Part Info
    brandName: part.brandName || "",
    variant: part.variant || "",
    partType: part.partType || "",
    color: part.color || "",
    // GST and Pricing
    gstAmount: part.gstAmount || "",
    gstRateInput: part.gstRateInput || "",
    pricePreGst: part.pricePreGst || "",
    gstRateOutput: part.gstRateOutput || "",
    // Labour Information
    estimatedLabour: part.estimatedLabour || "",
    estimatedLabourWorkTime: part.estimatedLabourWorkTime || "",
    labourRate: part.labourRate || "",
    labourGstRate: part.labourGstRate || "",
    labourPrice: part.labourPrice || "",
    // Calculated Totals
    gstInput: part.gstInput || "",
    totalPrice: part.totalPrice || "",
    totalGst: part.totalGst || "",
    // High Value Part
    highValuePart: part.highValuePart || false,
    // Optional
    centerId: part.centerId,
  };
}
