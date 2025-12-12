/**
 * Central Stock Service - Business logic layer for central stock operations
 */

import { apiClient, mockApiClient, ApiError } from "@/core/api";
import { API_CONFIG } from "@/config/api.config";
import { centralInventoryRepository } from "@/__mocks__/repositories/central-inventory.repository";
import type { ApiRequestConfig } from "@/core/api";
import type {
  CentralStock,
  StockUpdateFormData,
} from "@/shared/types/central-inventory.types";

class CentralStockService {
  private useMock: boolean;

  constructor() {
    this.useMock = API_CONFIG.USE_MOCK;
    this.setupMockEndpoints();
  }

  private setupMockEndpoints(): void {
    if (!this.useMock) return;

    // GET /central-inventory/stock
    mockApiClient.registerMock(
      "/central-inventory/stock",
      "GET",
      async (config: ApiRequestConfig) => {
        const stock = await centralInventoryRepository.getAllStock();
        return stock;
      }
    );

    // GET /central-inventory/stock/:id
    mockApiClient.registerMock(
      "/central-inventory/stock/:id",
      "GET",
      async (config: ApiRequestConfig) => {
        const url = config.url || "";
        const match = url.match(/\/central-inventory\/stock\/([^/?]+)/);
        const id = match ? match[1] : "";
        if (!id) {
          throw new ApiError("Stock ID is required", 400, "VALIDATION_ERROR");
        }
        const stock = await centralInventoryRepository.getStockById(id);
        if (!stock) {
          throw new ApiError("Stock not found", 404, "NOT_FOUND");
        }
        return stock;
      }
    );

    // PUT /central-inventory/stock/:id
    mockApiClient.registerMock(
      "/central-inventory/stock/:id",
      "PUT",
      async (config: ApiRequestConfig) => {
        const url = config.url || "";
        const match = url.match(/\/central-inventory\/stock\/([^/?]+)/);
        const id = match ? match[1] : "";
        if (!id) {
          throw new ApiError("Stock ID is required", 400, "VALIDATION_ERROR");
        }
        const data = config.body as Partial<CentralStock>;
        const updated = await centralInventoryRepository.updateStock(id, data);
        return updated;
      }
    );

    // POST /central-inventory/stock/adjust
    mockApiClient.registerMock(
      "/central-inventory/stock/adjust",
      "POST",
      async (config: ApiRequestConfig) => {
        const data = config.body as {
          stockId: string;
          adjustment: StockUpdateFormData;
          adjustedBy: string;
        };
        if (!data.stockId || !data.adjustment || !data.adjustedBy) {
          throw new ApiError("Stock ID, adjustment data, and adjustedBy are required", 400, "VALIDATION_ERROR");
        }
        const result = await centralInventoryRepository.adjustStock(
          data.stockId,
          data.adjustment,
          data.adjustedBy
        );
        return result;
      }
    );
  }

  async getCentralStock(): Promise<CentralStock[]> {
    if (this.useMock) {
      return await centralInventoryRepository.getAllStock();
    }
    const response = await apiClient.get<CentralStock[]>("/central-inventory/stock");
    return response.data;
  }

  async getStockById(id: string): Promise<CentralStock> {
    if (this.useMock) {
      const stock = await centralInventoryRepository.getStockById(id);
      if (!stock) {
        throw new ApiError("Stock not found", 404, "NOT_FOUND");
      }
      return stock;
    }
    const response = await apiClient.get<CentralStock>(`/central-inventory/stock/${id}`);
    return response.data;
  }

  async updateStock(id: string, data: Partial<CentralStock>): Promise<CentralStock> {
    if (this.useMock) {
      return await centralInventoryRepository.updateStock(id, data);
    }
    const response = await apiClient.put<CentralStock>(`/central-inventory/stock/${id}`, data);
    return response.data;
  }

  async addStock(
    stockId: string,
    quantity: number,
    reason: string,
    adjustedBy: string,
    referenceNumber?: string
  ): Promise<{ stock: CentralStock; adjustment: any }> {
    const adjustment: StockUpdateFormData = {
      partId: "",
      adjustmentType: "add",
      quantity,
      reason,
      referenceNumber,
    };
    if (this.useMock) {
      return await centralInventoryRepository.adjustStock(stockId, adjustment, adjustedBy);
    }
    const response = await apiClient.post<{ stock: CentralStock; adjustment: any }>(
      "/central-inventory/stock/adjust",
      {
        stockId,
        adjustment,
        adjustedBy,
      }
    );
    return response.data;
  }

  async deductStock(
    stockId: string,
    quantity: number,
    reason: string,
    adjustedBy: string,
    referenceNumber?: string
  ): Promise<{ stock: CentralStock; adjustment: any }> {
    const adjustment: StockUpdateFormData = {
      partId: "",
      adjustmentType: "remove",
      quantity,
      reason,
      referenceNumber,
    };
    if (this.useMock) {
      return await centralInventoryRepository.adjustStock(stockId, adjustment, adjustedBy);
    }
    const response = await apiClient.post<{ stock: CentralStock; adjustment: any }>(
      "/central-inventory/stock/adjust",
      {
        stockId,
        adjustment,
        adjustedBy,
      }
    );
    return response.data;
  }

  async searchStock(query: string): Promise<CentralStock[]> {
    if (this.useMock) {
      return await centralInventoryRepository.searchStock(query);
    }
    const response = await apiClient.get<CentralStock[]>(
      `/central-inventory/stock/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  }
}

export const centralStockService = new CentralStockService();

