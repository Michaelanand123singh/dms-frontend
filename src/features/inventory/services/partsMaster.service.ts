/**
 * Parts Master Service - Business logic layer for parts master operations
 */

import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import type { Part, PartFormData } from "@/shared/types/inventory.types";

class PartsMasterService {
  private storageKey = "partsMaster";

  async getAll(): Promise<Part[]> {
    const parts = safeStorage.getItem<Part[]>(this.storageKey, []);
    return parts;
  }

  async getById(id: string): Promise<Part | null> {
    const parts = await this.getAll();
    return parts.find((p) => p.id === id) || null;
  }

  async create(data: PartFormData): Promise<Part> {
    const parts = await this.getAll();
    const newPart: Part = {
      id: `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      stockQuantity: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
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
      // Validate required fields
      if (!data.partId || !data.partName || !data.partNumber || !data.category) {
        failed++;
        errors.push(`Row ${index + 2}: Missing required fields (Part ID, Part Name, Part Number, or Category)`);
        return;
      }

      // Check for duplicates
      if (existingPartIds.has(data.partId)) {
        failed++;
        errors.push(`Row ${index + 2}: Part ID "${data.partId}" already exists`);
        return;
      }

      if (existingPartNumbers.has(data.partNumber)) {
        failed++;
        errors.push(`Row ${index + 2}: Part Number "${data.partNumber}" already exists`);
        return;
      }

      // Create new part
      const newPart: Part = {
        id: `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
        ...data,
        stockQuantity: 0,
        price: data.price || 0,
        minStockLevel: data.minStockLevel || 0,
        unit: data.unit || "piece",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      newParts.push(newPart);
      existingPartIds.add(data.partId);
      existingPartNumbers.add(data.partNumber);
      success++;
    });

    // Save all new parts
    if (newParts.length > 0) {
      const updatedParts = [...existingParts, ...newParts];
      safeStorage.setItem(this.storageKey, updatedParts);
    }

    return { success, failed, errors };
  }
}

export const partsMasterService = new PartsMasterService();

