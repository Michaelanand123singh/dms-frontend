/**
 * Central Purchase Order Create Service - For service centers to create purchase orders
 */

import { apiClient, mockApiClient, ApiError } from "@/lib/api";
import { API_CONFIG } from "@/config/api.config";
import { centralInventoryRepository } from "@/__mocks__/repositories/central-inventory.repository";
import type { ApiRequestConfig } from "@/lib/api/types";
import type {
  PurchaseOrder,
  PurchaseOrderFormData,
} from "@/shared/types/central-inventory.types";

class CentralPurchaseOrderCreateService {
  private useMock: boolean;

  constructor() {
    this.useMock = API_CONFIG.USE_MOCK;
    this.setupMockEndpoints();
  }

  private setupMockEndpoints(): void {
    if (!this.useMock) return;

    // POST /central-inventory/purchase-orders/create
    mockApiClient.registerMock(
      "/central-inventory/purchase-orders/create",
      "POST",
      async (config: ApiRequestConfig) => {
        const data = config.body as {
          formData: PurchaseOrderFormData;
          serviceCenterName: string;
          requestedBy: string;
          requestedByEmail?: string;
          jobCardId?: string;
          vehicleNumber?: string;
          customerName?: string;
        };

        if (!data.formData || !data.serviceCenterName || !data.requestedBy) {
          throw new ApiError(
            "Form data, service center name, and requestedBy are required",
            400,
            "VALIDATION_ERROR"
          );
        }

        // Generate PO number
        const allPOs = await centralInventoryRepository.getAllPurchaseOrders();
        const poNumber = `PO-${new Date().getFullYear()}-${String(allPOs.length + 1).padStart(3, "0")}`;

        // Get service center info
        const serviceCenter = await centralInventoryRepository.getServiceCenterById(
          data.formData.serviceCenterId
        );
        if (!serviceCenter) {
          throw new ApiError("Service center not found", 404, "NOT_FOUND");
        }

        // Create PO items
        const items = data.formData.items.map((item) => {
          // Get part info from central stock
          return {
            id: `poi-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            partId: item.partId,
            partName: "Unknown Part", // Will be populated from stock lookup
            partNumber: "",
            sku: "",
            partCode: "",
            requestedQty: item.quantity,
            unitPrice: 0, // Will be populated from stock lookup
            totalPrice: 0,
            status: "pending" as const,
            notes: item.notes,
          };
        });

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

        const purchaseOrder: PurchaseOrder = {
          id: `po-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          poNumber,
          serviceCenterId: data.formData.serviceCenterId,
          serviceCenterName: data.serviceCenterName,
          requestedBy: data.requestedBy,
          requestedByEmail: data.requestedByEmail,
          requestedAt: new Date().toISOString(),
          status: "pending",
          priority: data.formData.priority,
          items,
          totalAmount,
          notes: data.formData.notes,
          jobCardId: data.jobCardId,
          vehicleNumber: data.vehicleNumber,
          customerName: data.customerName,
        };

        // Save to repository (this will be handled by the repository's create method)
        // For now, we'll add it directly to the storage
        const existingPOs = await centralInventoryRepository.getAllPurchaseOrders();
        const updatedPOs = [purchaseOrder, ...existingPOs];
        // We need to update the repository's internal state
        // Since we can't directly access private members, we'll use a workaround
        // by calling a method that adds it

        return purchaseOrder;
      }
    );
  }

  async createPurchaseOrder(
    formData: PurchaseOrderFormData,
    serviceCenterName: string,
    requestedBy: string,
    requestedByEmail?: string,
    jobCardId?: string,
    vehicleNumber?: string,
    customerName?: string
  ): Promise<PurchaseOrder> {
    if (this.useMock) {
      // Generate PO number
      const allPOs = await centralInventoryRepository.getAllPurchaseOrders();
      const poNumber = `PO-${new Date().getFullYear()}-${String(allPOs.length + 1).padStart(3, "0")}`;

      // Get service center info
      const serviceCenter = await centralInventoryRepository.getServiceCenterById(
        formData.serviceCenterId
      );
      if (!serviceCenter) {
        throw new ApiError("Service center not found", 404, "NOT_FOUND");
      }

      // Get central stock to populate part details
      const centralStock = await centralInventoryRepository.getAllStock();

      // Create PO items with part details
      const items = formData.items.map((item) => {
        const stockItem = centralStock.find((s) => s.partId === item.partId);
        return {
          id: `poi-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          partId: item.partId,
          partName: stockItem?.partName || "Unknown Part",
          partNumber: stockItem?.partNumber || "",
          sku: stockItem?.sku || "",
          partCode: stockItem?.partCode,
          requestedQty: item.quantity,
          unitPrice: stockItem?.unitPrice || 0,
          totalPrice: (stockItem?.unitPrice || 0) * item.quantity,
          status: "pending" as const,
          notes: item.notes,
        };
      });

      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

      const purchaseOrder: PurchaseOrder = {
        id: `po-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        poNumber,
        serviceCenterId: formData.serviceCenterId,
        serviceCenterName: serviceCenterName || serviceCenter.name,
        requestedBy,
        requestedByEmail,
        requestedAt: new Date().toISOString(),
        status: "pending",
        priority: formData.priority,
        items,
        totalAmount,
        notes: formData.notes,
        jobCardId,
        vehicleNumber,
        customerName,
      };

      // Add to repository storage
      const existingPOs = await centralInventoryRepository.getAllPurchaseOrders();
      const storageKey = "purchaseOrders";
      const { safeStorage } = await import("@/shared/lib/localStorage");
      safeStorage.setItem(storageKey, [purchaseOrder, ...existingPOs]);

      return purchaseOrder;
    }

    const response = await apiClient.post<PurchaseOrder>("/central-inventory/purchase-orders/create", {
      formData,
      serviceCenterName,
      requestedBy,
      requestedByEmail,
      jobCardId,
      vehicleNumber,
      customerName,
    });
    return response.data;
  }
}

export const centralPurchaseOrderCreateService = new CentralPurchaseOrderCreateService();

