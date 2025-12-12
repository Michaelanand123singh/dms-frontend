/**
 * Parts Entry Service - Manage incoming parts stock entries
 */

import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { partsMasterService } from "./partsMaster.service";

export interface PartsEntry {
  id: string;
  invoiceNumber: string;
  vendor: string;
  entryDate: string;
  parts: Array<{
    partId: string;
    partName: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  createdAt: string;
  createdBy: string;
}

const STORAGE_KEY = "partsEntries";

class PartsEntryService {
  async getAll(): Promise<PartsEntry[]> {
    return safeStorage.getItem<PartsEntry[]>(STORAGE_KEY, []);
  }

  async getById(id: string): Promise<PartsEntry | null> {
    const entries = await this.getAll();
    return entries.find((e) => e.id === id) || null;
  }

  async create(
    invoiceNumber: string,
    vendor: string,
    entryDate: string,
    parts: Array<{ partId: string; partName: string; quantity: number; unitPrice: number }>,
    createdBy: string = "Inventory Manager"
  ): Promise<PartsEntry> {
    const totalAmount = parts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
    
    const entry: PartsEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      invoiceNumber,
      vendor,
      entryDate,
      parts,
      totalAmount,
      createdAt: new Date().toISOString(),
      createdBy,
    };

    const entries = await this.getAll();
    safeStorage.setItem(STORAGE_KEY, [entry, ...entries]);

    // Update stock quantities in parts master
    for (const part of parts) {
      try {
        const partData = await partsMasterService.getById(part.partId);
        if (partData) {
          await partsMasterService.updateStock(part.partId, part.quantity, "add");
        }
      } catch (error) {
        console.error(`Failed to update stock for part ${part.partId}:`, error);
      }
    }

    return entry;
  }

  async getRecent(limit: number = 10): Promise<PartsEntry[]> {
    const entries = await this.getAll();
    return entries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export const partsEntryService = new PartsEntryService();

