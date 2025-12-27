import { inventoryService } from "./inventory.service";
import type { Part, PartFormData } from "../types/inventory.types";
import type { InventoryItem } from "../types/inventory.types";

class PartsMasterService {

  private mapInventoryItemToPart(item: InventoryItem): Part {
    // Map from InventoryItem (list view) to Part (entity)
    // Most fields now match between the two interfaces
    const priceStr = typeof item.unitPrice === 'string'
      ? item.unitPrice.replace(/[^0-9.]/g, '')
      : String(item.unitPrice || 0);
    const costStr = typeof item.costPrice === 'string'
      ? item.costPrice.replace(/[^0-9.]/g, '')
      : String(item.costPrice || 0);

    return {
      id: String(item.id),
      partId: item.partCode || String(item.id),
      partName: item.partName,
      partNumber: item.partNumber || item.partCode || "",
      category: item.category,

      // Pricing
      price: parseFloat(priceStr) || 0,
      unitPrice: parseFloat(priceStr) || 0,
      costPrice: parseFloat(costStr) || 0,
      pricePreGst: item.pricePreGst || 0,
      gstRate: item.gstRate || 18,
      gstRateInput: item.gstRateInput || 0,
      gstRateOutput: item.gstRateOutput || 0,
      gstInput: item.gstInput || 0,
      totalPrice: item.totalPrice || 0,
      totalGst: item.totalGst || 0,

      // Stock
      stockQuantity: item.currentQty || item.stockQuantity || 0,
      minStockLevel: item.minStock || item.minStockLevel || 0,
      maxStockLevel: item.maxStockLevel || 100,

      // Part Details
      unit: item.unit || "piece",
      oemPartNumber: item.oemPartNumber || item.hsnCode || "",
      originType: item.originType || "NEW",
      description: item.description || "",
      brandName: item.brandName || "",
      variant: item.variant || "",
      partType: item.partType || "",
      color: item.color || "",
      location: item.location || "",

      // Labour
      labourName: item.labourName || "",
      labourCode: item.labourCode || "",
      labourWorkTime: item.labourWorkTime || "",
      labourRate: item.labourRate || 0,
      labourGstRate: item.labourGstRate || 18,
      labourPrice: item.labourPrice || 0,

      // Flags
      highValuePart: item.highValuePart || false,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getAll(): Promise<Part[]> {
    const items = await inventoryService.getAll();
    return items.map(this.mapInventoryItemToPart);
  }

  async getById(id: string): Promise<Part | null> {
    const parts = await this.getAll();
    return parts.find((p) => p.id === id || p.partId === id || p.partNumber === id) || null;
  }

  async create(data: PartFormData): Promise<Part> {
    // Map PartFormData to CreateInventoryPartPayload with full schema
    const createdItem = await inventoryService.create({
      serviceCenterId: data.serviceCenterId || "",

      // Basic Part Information
      oemPartNumber: data.oemPartNumber || "",
      partName: data.partName,
      partNumber: data.partNumber || `PN-${Date.now()}`,
      originType: data.originType || "NEW",
      category: data.category || "General",
      description: data.description || "",

      // Stock Information
      stockQuantity: data.stockQuantity || 0,
      minStockLevel: data.minStockLevel || 0,
      maxStockLevel: data.maxStockLevel || 100,
      unit: data.unit || "piece",
      location: data.location || "",

      // Part Details
      brandName: data.brandName || "",
      variant: data.variant || "",
      partType: data.partType || "",
      color: data.color || "",

      // Pricing - Purchase
      costPrice: data.costPrice || 0,
      pricePreGst: data.pricePreGst || 0,
      gstRateInput: data.gstRateInput || 0,
      gstInput: data.gstInput || 0,

      // Pricing - Sale
      unitPrice: data.unitPrice || data.price || 0,
      gstRate: data.gstRate || 18,
      gstRateOutput: data.gstRateOutput || 0,
      totalPrice: data.totalPrice || 0,
      totalGst: data.totalGst || 0,

      // Labour Information
      labourName: data.labourName || "",
      labourCode: data.labourCode || "",
      labourWorkTime: data.labourWorkTime || "",
      labourRate: data.labourRate || 0,
      labourGstRate: data.labourGstRate || 0,
      labourPrice: data.labourPrice || 0,

      // Flags
      highValuePart: data.highValuePart || false,
    });
    return this.mapInventoryItemToPart(createdItem);
  }

  async update(id: string, data: Partial<PartFormData>): Promise<Part> {
    // Map Partial<PartFormData> to payload
    const payload: any = { ...data };

    // Handle specific mappings
    if (data.price !== undefined) payload.unitPrice = data.price;

    // Backend expects unitPrice, not price
    if (payload.price) delete payload.price;

    const updatedItem = await inventoryService.update(id, payload);
    return this.mapInventoryItemToPart(updatedItem);
  }

  async delete(id: string): Promise<void> {
    await inventoryService.delete(id);
  }

  async updateStock(id: string, quantity: number, operation: "add" | "subtract" | "set"): Promise<Part> {
    const adjustmentType = operation === "add" ? "ADD" : operation === "subtract" ? "SUBTRACT" : "SET";

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
    const items = await inventoryService.getAll({ search: query });
    return items.map(this.mapInventoryItemToPart);
  }
}

export const partsMasterService = new PartsMasterService();
