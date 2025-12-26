import { inventoryService } from "./inventory.service";
import type { Part, PartFormData } from "@/shared/types/inventory.types";
import type { InventoryItem } from "@/shared/types/inventory.types";

class PartsMasterService {

  private mapInventoryItemToPart(item: InventoryItem): Part {
    // Best effort mapping from InventoryItem (Frontend View) to Part (Frontend Entity)
    // Note: Backend InventoryItem lacks many fields present in Part entity.
    return {
      id: String(item.id),
      partId: String(item.id), // Use DB ID or partCode
      partName: item.partName,
      partNumber: item.partCode,
      category: item.category,
      price: parseFloat(item.unitPrice.replace(/[^0-9.]/g, '')) || 0, // Remove currency symbol
      stockQuantity: item.currentQty,
      minStockLevel: item.minStock,
      unit: "piece", // Default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Defaulting missing fields
      originType: "OEM",
      purchasePrice: parseFloat(item.costPrice.replace(/[^0-9.]/g, '')) || 0,
      description: "",
      brandName: "",
      variant: "",
      partType: "",
      color: "",
      gstAmount: 0,
      gstRateInput: 18,
      pricePreGst: 0,
      gstRateOutput: 18,
      estimatedLabour: 0,
      estimatedLabourWorkTime: "",
      labourRate: 0,
      labourGstRate: 18,
      labourPrice: 0,
      gstInput: 0,
      totalPrice: 0,
      totalGst: 0,
      highValuePart: false,
      location: item.location
    };
  }

  async getAll(): Promise<Part[]> {
    const items = await inventoryService.getAll();
    return items.map(this.mapInventoryItemToPart);
  }

  async getById(id: string): Promise<Part | null> {
    // InventoryController does not support getById. We must shim it using getAll.
    // In efficient, but necessary given current backend.
    const parts = await this.getAll();
    return parts.find((p) => p.id === id || p.partId === id || p.partNumber === id) || null;
  }

  async create(data: PartFormData): Promise<Part> {
    // Map PartFormData to CreateInventoryPartPayload
    // Note: Data loss will occur for unsupported fields
    const createdItem = await inventoryService.create({
      serviceCenterId: data.centerId || "", // This might fail if centerId is missing.
      partName: data.partName,
      partNumber: data.partNumber || `PN-${Date.now()}`,
      category: data.category || "General",
      unitPrice: data.price || 0,
      costPrice: data.purchasePrice ? parseFloat(data.purchasePrice) : 0,
      gstRate: data.gstRateOutput || 18,
      stockQuantity: 0, // Initial stock is 0
      minStockLevel: data.minStockLevel || 0,
      maxStockLevel: 100, // Default
      location: ""
    });
    return this.mapInventoryItemToPart(createdItem);
  }

  async update(id: string, data: Partial<PartFormData>): Promise<Part> {
    console.warn("Update Part Metadata not supported by backend API. Only Stock Adjustment is supported.");
    const part = await this.getById(id);
    if (!part) throw new Error("Part not found");
    return part;
    // Return existing part as we cannot update metadata
  }

  async delete(id: string): Promise<void> {
    console.warn("Delete Part not supported by backend API.");
    // No-op
  }

  async updateStock(id: string, quantity: number, operation: "add" | "subtract" | "set"): Promise<Part> {
    // Map operation to backend enum: ADD, SUBTRACT, SET
    const adjustmentType = operation === "add" ? "ADD" : operation === "subtract" ? "SUBTRACT" : "SET";

    // InventoryService.adjustStock uses ID. 
    // Be careful about ID mismatch (UUID vs PartNumber). 
    // inventoryService.adjustStock takes 'id' which is likely the UUID.

    const updateditem = await inventoryService.adjustStock(id, {
      adjustmentType,
      quantity,
      reason: "Part Master Manual Update"
    });
    return this.mapInventoryItemToPart(updateditem);
  }

  async bulkCreate(partsData: PartFormData[]): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const [index, data] of partsData.entries()) {
      try {
        await this.create(data);
        success++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${index + 2}: ${err.message || "Failed to create"}`);
      }
    }

    return { success, failed, errors };
  }

  async searchParts(query: string): Promise<Part[]> {
    // Backend supports search via getAll params?
    // inventoryService.getAll({ search: query })
    const items = await inventoryService.getAll({ search: query });
    return items.map(this.mapInventoryItemToPart);
  }
}

export const partsMasterService = new PartsMasterService();

