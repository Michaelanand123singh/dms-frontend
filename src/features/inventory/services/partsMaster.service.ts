/**
 * Parts Master Service - Business logic layer for parts master operations
 */

import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import type { Part, PartFormData } from "@/shared/types/inventory.types";
import { PARTS_MASTER_STORAGE_KEYS } from "@/app/inventory-manager/parts-master/storage.constants";

/**
 * Generate unique part ID
 */
function generatePartId(prefix: string = ""): string {
  return `PART-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}${prefix}`;
}

/**
 * Generate unique internal part ID
 */
function generateInternalId(prefix: string = ""): string {
  return `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${prefix}`;
}

/**
 * Map PartFormData to Part entity (only includes fields with values)
 */
function mapPartFormDataToPart(data: PartFormData, id: string): Part {
  // Generate partId if not provided
  const partId = data.partId?.trim() || generatePartId();
  const partNumber = data.partNumber?.trim() || "";
  const category = data.category?.trim() || "";

  const part: Part = {
    id,
    partId, // Always set (auto-generated if not provided)
    partName: data.partName.trim(),
    partNumber, // Always set (empty string if not provided)
    category, // Always set (empty string if not provided)
    price: data.price || 0,
    stockQuantity: 0,
    minStockLevel: data.minStockLevel || 0,
    unit: data.unit || "piece",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Include all extended fields from data (only if they have values)
    ...(data.hsnCode && { hsnCode: data.hsnCode }),
    ...(data.partCode && { partCode: data.partCode }),
    ...(data.labourCode && { labourCode: data.labourCode }),
    ...(data.status && { status: data.status }),
    ...(data.description && { description: data.description }),
    ...(data.brandName && { brandName: data.brandName }),
    ...(data.variant && { variant: data.variant }),
    ...(data.partType && { partType: data.partType }),
    ...(data.color && { color: data.color }),
    ...(data.preGstAmountToUs && { preGstAmountToUs: data.preGstAmountToUs }),
    ...(data.gstRateInput && { gstRateInput: data.gstRateInput }),
    ...(data.gstInputAmount && { gstInputAmount: data.gstInputAmount }),
    ...(data.postGstAmountToUs && { postGstAmountToUs: data.postGstAmountToUs }),
    ...(data.salePricePreGst && { salePricePreGst: data.salePricePreGst }),
    ...(data.gstRateOutput && { gstRateOutput: data.gstRateOutput }),
    ...(data.gstOutputAmount && { gstOutputAmount: data.gstOutputAmount }),
    ...(data.postGstSaleAmount && { postGstSaleAmount: data.postGstSaleAmount }),
    ...(data.associatedLabourName && { associatedLabourName: data.associatedLabourName }),
    ...(data.associatedLabourCode && { associatedLabourCode: data.associatedLabourCode }),
    ...(data.workTime && { workTime: data.workTime }),
    ...(data.labourRate && { labourRate: data.labourRate }),
    ...(data.labourGstRate && { labourGstRate: data.labourGstRate }),
    ...(data.labourGstAmount && { labourGstAmount: data.labourGstAmount }),
    ...(data.labourPostGstAmount && { labourPostGstAmount: data.labourPostGstAmount }),
    ...(data.highValuePart !== undefined && { highValuePart: data.highValuePart }),
    ...(data.partSerialNumber && { partSerialNumber: data.partSerialNumber }),
    ...(data.centerId && { centerId: data.centerId }),
  };

  return part;
}

class PartsMasterService {
  private storageKey = PARTS_MASTER_STORAGE_KEYS.PARTS_MASTER;

  async getAll(): Promise<Part[]> {
    const parts = safeStorage.getItem<Part[]>(this.storageKey, []);
    return parts;
  }

  async getById(id: string): Promise<Part | null> {
    const parts = await this.getAll();
    return parts.find((p) => p.id === id) || null;
  }

  async create(data: PartFormData): Promise<Part> {
    // Only require partName for identification
    if (!data.partName?.trim()) {
      throw new Error("Part Name is required to save a part");
    }

    const parts = await this.getAll();

    // Generate partId if not provided
    const partId = data.partId?.trim() || generatePartId();
    const partNumber = data.partNumber?.trim() || "";

    // Check for duplicate partId
    if (parts.some(p => p.partId === partId)) {
      throw new Error(`Part with ID "${partId}" already exists`);
    }

    // Check for duplicate partNumber only if provided
    if (partNumber && parts.some(p => p.partNumber === partNumber)) {
      throw new Error(`Part with Number "${partNumber}" already exists`);
    }

    const newPart = mapPartFormDataToPart(data, generateInternalId());
    parts.push(newPart);
    safeStorage.setItem(this.storageKey, parts);
    return newPart;
  }

  async update(id: string, data: Partial<PartFormData>): Promise<Part> {
    const parts = await this.getAll();
    const index = parts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("Part not found");
    }
    parts[index] = {
      ...parts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    safeStorage.setItem(this.storageKey, parts);
    return parts[index];
  }

  async delete(id: string): Promise<void> {
    const parts = await this.getAll();
    const filtered = parts.filter((p) => p.id !== id);
    safeStorage.setItem(this.storageKey, filtered);
  }

  async updateStock(id: string, quantity: number, operation: "add" | "subtract" | "set"): Promise<Part> {
    const parts = await this.getAll();
    const index = parts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("Part not found");
    }
    const part = parts[index];
    let newQuantity = part.stockQuantity;
    if (operation === "add") {
      newQuantity += quantity;
    } else if (operation === "subtract") {
      newQuantity = Math.max(0, newQuantity - quantity);
    } else {
      newQuantity = quantity;
    }
    parts[index] = {
      ...part,
      stockQuantity: newQuantity,
      updatedAt: new Date().toISOString(),
    };
    safeStorage.setItem(this.storageKey, parts);
    return parts[index];
  }

  async bulkCreate(partsData: PartFormData[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const existingParts = await this.getAll();
    const existingPartIds = new Set(existingParts.map((p) => p.partId));
    const existingPartNumbers = new Set(existingParts.map((p) => p.partNumber));

    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    const newParts: Part[] = [];

    partsData.forEach((data, index) => {
      // Validate required field (only partName is required)
      if (!data.partName?.trim()) {
        failed++;
        errors.push(`Row ${index + 2}: Part Name is required`);
        return;
      }

      // Generate partId if not provided
      const partId = data.partId?.trim() || generatePartId(`-${index}`);
      const partNumber = data.partNumber?.trim() || "";

      // Check for duplicates
      if (existingPartIds.has(partId)) {
        failed++;
        errors.push(`Row ${index + 2}: Part ID "${partId}" already exists`);
        return;
      }

      if (partNumber && existingPartNumbers.has(partNumber)) {
        failed++;
        errors.push(`Row ${index + 2}: Part Number "${partNumber}" already exists`);
        return;
      }

      // Create new part using utility function
      const newPart = mapPartFormDataToPart(data, generateInternalId(`-${index}`));

      newParts.push(newPart);
      existingPartIds.add(newPart.partId);
      if (newPart.partNumber) {
        existingPartNumbers.add(newPart.partNumber);
      }
      success++;
    });

    // Save all new parts
    if (newParts.length > 0) {
      const updatedParts = [...existingParts, ...newParts];
      safeStorage.setItem(this.storageKey, updatedParts);
    }

    return { success, failed, errors };
  }

  async searchParts(query: string): Promise<Part[]> {
    const parts = await this.getAll();
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];

    return parts.filter(
      (p) =>
        p.partName.toLowerCase().includes(normalizedQuery) ||
        p.partId.toLowerCase().includes(normalizedQuery) ||
        p.partNumber?.toLowerCase().includes(normalizedQuery)
    );
  }
}

export const partsMasterService = new PartsMasterService();

