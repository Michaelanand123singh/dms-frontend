/**
 * Form Utility Functions
 * Helper functions for form data transformation
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
    ...(formData.price && { price: typeof formData.price === 'string' ? parseFloat(formData.price) || 0 : (formData.price || 0) }),
    ...(getValueIfNotEmpty(formData.description) && { description: getValueIfNotEmpty(formData.description) }),
    ...(formData.minStockLevel !== undefined && { minStockLevel: formData.minStockLevel }),
    ...(formData.unit?.trim() && { unit: formData.unit.trim() }),
    // Extended fields - only include if they have data
    ...(getValueIfNotEmpty(formData.sku) && { sku: getValueIfNotEmpty(formData.sku) }),
    ...(getValueIfNotEmpty(formData.partCode) && { partCode: getValueIfNotEmpty(formData.partCode) }),
    ...(formData.status && { status: formData.status }),
    // Basic Part Info
    ...(getValueIfNotEmpty(formData.brandName) && { brandName: getValueIfNotEmpty(formData.brandName) }),
    ...(getValueIfNotEmpty(formData.variant) && { variant: getValueIfNotEmpty(formData.variant) }),
    ...(formData.partType && { partType: formData.partType }),
    ...(getValueIfNotEmpty(formData.color) && { color: getValueIfNotEmpty(formData.color) }),
    // Purchase (Incoming)
    ...(getValueIfNotEmpty(formData.preGstAmountToUs) && { preGstAmountToUs: getValueIfNotEmpty(formData.preGstAmountToUs) }),
    ...(getValueIfNotEmpty(formData.gstRateInput) && { gstRateInput: getValueIfNotEmpty(formData.gstRateInput) }),
    ...(getValueIfNotEmpty(formData.gstInputAmount) && { gstInputAmount: getValueIfNotEmpty(formData.gstInputAmount) }),
    ...(getValueIfNotEmpty(formData.postGstAmountToUs) && { postGstAmountToUs: getValueIfNotEmpty(formData.postGstAmountToUs) }),
    // Sale (Outgoing)
    ...(getValueIfNotEmpty(formData.salePricePreGst) && { salePricePreGst: getValueIfNotEmpty(formData.salePricePreGst) }),
    ...(getValueIfNotEmpty(formData.gstRateOutput) && { gstRateOutput: getValueIfNotEmpty(formData.gstRateOutput) }),
    ...(getValueIfNotEmpty(formData.gstOutputAmount) && { gstOutputAmount: getValueIfNotEmpty(formData.gstOutputAmount) }),
    ...(getValueIfNotEmpty(formData.postGstSaleAmount) && { postGstSaleAmount: getValueIfNotEmpty(formData.postGstSaleAmount) }),
    // Labour Association
    ...(getValueIfNotEmpty(formData.associatedLabourName) && { associatedLabourName: getValueIfNotEmpty(formData.associatedLabourName) }),
    ...(getValueIfNotEmpty(formData.associatedLabourCode) && { associatedLabourCode: getValueIfNotEmpty(formData.associatedLabourCode) }),
    ...(getValueIfNotEmpty(formData.workTime) && { workTime: getValueIfNotEmpty(formData.workTime) }),
    ...(getValueIfNotEmpty(formData.labourRate) && { labourRate: getValueIfNotEmpty(formData.labourRate) }),
    ...(getValueIfNotEmpty(formData.labourGstRate) && { labourGstRate: getValueIfNotEmpty(formData.labourGstRate) }),
    ...(getValueIfNotEmpty(formData.labourGstAmount) && { labourGstAmount: getValueIfNotEmpty(formData.labourGstAmount) }),
    ...(getValueIfNotEmpty(formData.labourPostGstAmount) && { labourPostGstAmount: getValueIfNotEmpty(formData.labourPostGstAmount) }),
    // High Value Part
    ...(formData.highValuePart !== undefined && { highValuePart: formData.highValuePart }),
    ...(getValueIfNotEmpty(formData.partSerialNumber) && { partSerialNumber: getValueIfNotEmpty(formData.partSerialNumber) }),
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
    sku: part.sku || "",
    partCode: part.partCode || "",
    category: part.category,
    quantity: String(part.stockQuantity || ""),
    price: String(part.price || ""),
    status: part.status || "In Stock",
    description: part.description || "",
    minStockLevel: part.minStockLevel,
    unit: part.unit,
    // Basic Part Info
    brandName: part.brandName || "",
    variant: part.variant || "",
    partType: part.partType || "NEW",
    color: part.color || "NA",
    // Purchase (Incoming)
    preGstAmountToUs: part.preGstAmountToUs || "",
    gstRateInput: part.gstRateInput || "",
    gstInputAmount: part.gstInputAmount || "",
    postGstAmountToUs: part.postGstAmountToUs || "",
    // Sale (Outgoing)
    salePricePreGst: part.salePricePreGst || "",
    gstRateOutput: part.gstRateOutput || "",
    gstOutputAmount: part.gstOutputAmount || "",
    postGstSaleAmount: part.postGstSaleAmount || "",
    // Labour Association
    associatedLabourName: part.associatedLabourName || "",
    associatedLabourCode: part.associatedLabourCode || "",
    workTime: part.workTime || "",
    labourRate: part.labourRate || "",
    labourGstRate: part.labourGstRate || "",
    labourGstAmount: part.labourGstAmount || "",
    labourPostGstAmount: part.labourPostGstAmount || "",
    // High Value Part
    highValuePart: part.highValuePart || false,
    partSerialNumber: part.partSerialNumber || "",
    // Optional
    centerId: part.centerId,
  };
}

