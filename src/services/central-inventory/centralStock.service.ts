/**
 * Central Stock Service - Business logic layer for central stock operations
 * Migrated to use backend API
 */

import { centralInventoryRepository } from '@/core/repositories/central-inventory.repository';
import type {
  CentralStock,
  StockUpdateFormData,
} from "@/shared/types/central-inventory.types";

class CentralStockService {
  /**
   * Get all central stock items
   */
  async getCentralStock(): Promise<CentralStock[]> {
    // Map from repository CentralInventoryItem to CentralStock type
    const items = await centralInventoryRepository.getAll();
    return items as unknown as CentralStock[];
  }

  /**
   * Get stock item by ID
   */
  async getStockById(id: string): Promise<CentralStock> {
    const item = await centralInventoryRepository.getById(id);
    return item as unknown as CentralStock;
  }

  /**
   * Update stock item
   */
  async updateStock(id: string, data: Partial<CentralStock>): Promise<CentralStock> {
    const updated = await centralInventoryRepository.update(id, data as any);
    return updated as unknown as CentralStock;
  }

  /**
   * Add stock (stock adjustment - increase)
   */
  async addStock(
    stockId: string,
    quantity: number,
    reason: string,
    adjustedBy: string,
    referenceNumber?: string
  ): Promise<{ stock: CentralStock; adjustment: any }> {
    // For now, this is a simple update - backend would need a dedicated endpoint for adjustments
    const current = await this.getStockById(stockId);
    const updated = await this.updateStock(stockId, {
      currentQty: current.currentQty + quantity,
    });

    return {
      stock: updated,
      adjustment: {
        type: 'add',
        quantity,
        reason,
        adjustedBy,
        referenceNumber,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Deduct stock (stock adjustment - decrease)
   */
  async deductStock(
    stockId: string,
    quantity: number,
    reason: string,
    adjustedBy: string,
    referenceNumber?: string
  ): Promise<{ stock: CentralStock; adjustment: any }> {
    const current = await this.getStockById(stockId);
    const updated = await this.updateStock(stockId, {
      currentQty: current.currentQty - quantity,
    });

    return {
      stock: updated,
      adjustment: {
        type: 'remove',
        quantity,
        reason,
        adjustedBy,
        referenceNumber,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Search stock items
   */
  async searchStock(query: string): Promise<CentralStock[]> {
    const items = await centralInventoryRepository.search(query);
    return items as unknown as CentralStock[];
  }
}

export const centralStockService = new CentralStockService();
