/**
 * Stock Update History Service - Track automatic stock updates from inventory approvals
 */

import { localStorage as safeStorage } from "@/shared/lib/localStorage";

export interface StockUpdateHistory {
  id: string;
  partId: string;
  partName: string;
  partNumber: string;
  quantity: number;
  operation: "decrease" | "increase";
  previousStock: number;
  newStock: number;
  jobCardId: string;
  jobCardNumber?: string;
  customerName?: string;
  assignedEngineer?: string;
  updatedBy: string;
  updatedAt: string;
  reason: string; // e.g., "Parts assigned to engineer from job card"
}

const STORAGE_KEY = "stockUpdateHistory";

class StockUpdateHistoryService {
  /**
   * Record a stock update
   */
  async recordUpdate(
    partId: string,
    partName: string,
    partNumber: string,
    quantity: number,
    operation: "decrease" | "increase",
    previousStock: number,
    newStock: number,
    jobCardId: string,
    jobCardNumber?: string,
    customerName?: string,
    assignedEngineer?: string,
    updatedBy: string = "Inventory Manager",
    reason: string = "Parts assigned from job card"
  ): Promise<StockUpdateHistory> {
    const update: StockUpdateHistory = {
      id: `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      partId,
      partName,
      partNumber,
      quantity,
      operation,
      previousStock,
      newStock,
      jobCardId,
      jobCardNumber,
      customerName,
      assignedEngineer,
      updatedBy,
      updatedAt: new Date().toISOString(),
      reason,
    };

    const history = await this.getAll();
    safeStorage.setItem(STORAGE_KEY, [update, ...history]);

    return update;
  }

  /**
   * Get all stock update history
   */
  async getAll(): Promise<StockUpdateHistory[]> {
    return safeStorage.getItem<StockUpdateHistory[]>(STORAGE_KEY, []);
  }

  /**
   * Get updates by part ID
   */
  async getByPartId(partId: string): Promise<StockUpdateHistory[]> {
    const all = await this.getAll();
    return all.filter((u) => u.partId === partId);
  }

  /**
   * Get updates by job card ID
   */
  async getByJobCardId(jobCardId: string): Promise<StockUpdateHistory[]> {
    const all = await this.getAll();
    return all.filter((u) => u.jobCardId === jobCardId);
  }

  /**
   * Get recent updates (last N updates)
   */
  async getRecent(limit: number = 50): Promise<StockUpdateHistory[]> {
    const all = await this.getAll();
    return all.slice(0, limit);
  }
}

export const stockUpdateHistoryService = new StockUpdateHistoryService();

