/**
 * Central Purchase Order Service - Business logic layer for purchase order operations
 */

import { apiClient, mockApiClient, ApiError } from "@/lib/api";
import { API_CONFIG } from "@/config/api.config";
import { centralInventoryRepository } from "@/__mocks__/repositories/central-inventory.repository";
import type { ApiRequestConfig } from "@/lib/api/types";
import type { PurchaseOrder } from "@/shared/types/central-inventory.types";

class CentralPurchaseOrderService {
  private useMock: boolean;

  constructor() {
    this.useMock = API_CONFIG.USE_MOCK;
    this.setupMockEndpoints();
  }

  private setupMockEndpoints(): void {
    if (!this.useMock) return;

    // GET /central-inventory/purchase-orders
    mockApiClient.registerMock(
      "/central-inventory/purchase-orders",
      "GET",
      async (config: ApiRequestConfig) => {
        const orders = await centralInventoryRepository.getAllPurchaseOrders();
        return orders;
      }
    );

    // GET /central-inventory/purchase-orders/:id
    mockApiClient.registerMock(
      "/central-inventory/purchase-orders/:id",
      "GET",
      async (config: ApiRequestConfig) => {
        const url = config.url || "";
        const match = url.match(/\/central-inventory\/purchase-orders\/([^/?]+)/);
        const id = match ? match[1] : "";
        if (!id) {
          throw new ApiError("Purchase order ID is required", 400, "VALIDATION_ERROR");
        }
        const order = await centralInventoryRepository.getPurchaseOrderById(id);
        if (!order) {
          throw new ApiError("Purchase order not found", 404, "NOT_FOUND");
        }
        return order;
      }
    );

    // POST /central-inventory/purchase-orders/:id/approve
    mockApiClient.registerMock(
      "/central-inventory/purchase-orders/:id/approve",
      "POST",
      async (config: ApiRequestConfig) => {
        const url = config.url || "";
        const match = url.match(/\/central-inventory\/purchase-orders\/([^/?]+)\/approve/);
        const id = match ? match[1] : "";
        if (!id) {
          throw new ApiError("Purchase order ID is required", 400, "VALIDATION_ERROR");
        }
        const body = config.body as { approvedBy: string; approvedItems?: Array<{ itemId: string; approvedQty: number }> };
        const approved = await centralInventoryRepository.approvePurchaseOrder(
          id,
          body.approvedBy,
          body.approvedItems
        );
        return approved;
      }
    );

    // POST /central-inventory/purchase-orders/:id/reject
    mockApiClient.registerMock(
      "/central-inventory/purchase-orders/:id/reject",
      "POST",
      async (config: ApiRequestConfig) => {
        const url = config.url || "";
        const match = url.match(/\/central-inventory\/purchase-orders\/([^/?]+)\/reject/);
        const id = match ? match[1] : "";
        if (!id) {
          throw new ApiError("Purchase order ID is required", 400, "VALIDATION_ERROR");
        }
        const body = config.body as { rejectedBy: string; rejectionReason: string };
        const rejected = await centralInventoryRepository.rejectPurchaseOrder(
          id,
          body.rejectedBy,
          body.rejectionReason
        );
        return rejected;
      }
    );
  }

  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    if (this.useMock) {
      return await centralInventoryRepository.getAllPurchaseOrders();
    }
    const response = await apiClient.get<PurchaseOrder[]>("/central-inventory/purchase-orders");
    return response.data;
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    if (this.useMock) {
      const order = await centralInventoryRepository.getPurchaseOrderById(id);
      if (!order) {
        throw new ApiError("Purchase order not found", 404, "NOT_FOUND");
      }
      return order;
    }
    const response = await apiClient.get<PurchaseOrder>(`/central-inventory/purchase-orders/${id}`);
    return response.data;
  }

  async approvePurchaseOrder(
    id: string,
    approvedBy: string,
    approvedItems?: Array<{ itemId: string; approvedQty: number }>
  ): Promise<PurchaseOrder> {
    if (this.useMock) {
      return await centralInventoryRepository.approvePurchaseOrder(id, approvedBy, approvedItems);
    }
    const response = await apiClient.post<PurchaseOrder>(
      `/central-inventory/purchase-orders/${id}/approve`,
      {
        approvedBy,
        approvedItems,
      }
    );
    return response.data;
  }

  async rejectPurchaseOrder(
    id: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<PurchaseOrder> {
    if (this.useMock) {
      return await centralInventoryRepository.rejectPurchaseOrder(id, rejectedBy, rejectionReason);
    }
    const response = await apiClient.post<PurchaseOrder>(
      `/central-inventory/purchase-orders/${id}/reject`,
      {
        rejectedBy,
        rejectionReason,
      }
    );
    return response.data;
  }

  async getPurchaseOrdersByStatus(status: PurchaseOrder["status"]): Promise<PurchaseOrder[]> {
    if (this.useMock) {
      return await centralInventoryRepository.getPurchaseOrdersByStatus(status);
    }
    const response = await apiClient.get<PurchaseOrder[]>(
      `/central-inventory/purchase-orders?status=${status}`
    );
    return response.data;
  }

  async getPurchaseOrdersByServiceCenter(serviceCenterId: string): Promise<PurchaseOrder[]> {
    if (this.useMock) {
      return await centralInventoryRepository.getPurchaseOrdersByServiceCenter(serviceCenterId);
    }
    const response = await apiClient.get<PurchaseOrder[]>(
      `/central-inventory/purchase-orders?serviceCenterId=${serviceCenterId}`
    );
    return response.data;
  }
}

export const centralPurchaseOrderService = new CentralPurchaseOrderService();

