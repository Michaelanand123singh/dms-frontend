import { API_ENDPOINTS } from "@/config/api.config";
import { apiClient } from "@/core/api/client";
import type { InventoryItem, StockStatus } from "../types/inventory.types";

interface InventoryFilterParams {
    serviceCenterId?: string;
    category?: string;
    search?: string;
    lowStock?: boolean;
}

interface CreateInventoryPartPayload {
    serviceCenterId: string;

    // Basic Part Information
    oemPartNumber?: string;
    partName: string;
    partNumber: string;
    originType?: string;
    category: string;
    description?: string;

    // Stock Information
    stockQuantity: number;
    minStockLevel: number;
    maxStockLevel: number;
    unit?: string;
    location?: string;

    // Part Details
    brandName?: string;
    variant?: string;
    partType?: string;
    color?: string;

    // Pricing - Purchase
    costPrice: number;
    pricePreGst?: number;
    gstRateInput?: number;
    gstInput?: number;

    // Pricing - Sale
    unitPrice: number;
    gstRate: number;
    gstRateOutput?: number;
    totalPrice?: number;
    totalGst?: number;

    // Labour Information
    labourName?: string;
    labourCode?: string;
    labourWorkTime?: string;
    labourRate?: number;
    labourGstRate?: number;
    labourPrice?: number;

    // Flags
    highValuePart?: boolean;
}

interface AdjustStockPayload {
    adjustmentType: "ADD" | "SUBTRACT" | "SET";
    quantity: number;
    reason?: string;
}

class InventoryService {
    /**
     * Fetch all inventory items
     */
    async getAll(params?: InventoryFilterParams): Promise<InventoryItem[]> {
        try {
            const response = await apiClient.get<any[]>(API_ENDPOINTS.INVENTORY, { params: params as any });
            return response.data.map(this.transformBackendToFrontend);
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
            throw error;
        }
    }

    /**
     * Create a new inventory part
     */
    async create(payload: CreateInventoryPartPayload): Promise<InventoryItem> {
        try {
            const response = await apiClient.post<any>(`${API_ENDPOINTS.INVENTORY}/parts`, payload);
            return this.transformBackendToFrontend(response.data);
        } catch (error) {
            console.error("Failed to create inventory part:", error);
            throw error;
        }
    }

    /**
     * Update an inventory part
     */
    async update(id: string, payload: Partial<CreateInventoryPartPayload>): Promise<InventoryItem> {
        try {
            const response = await apiClient.patch<any>(`${API_ENDPOINTS.INVENTORY}/parts/${id}`, payload);
            return this.transformBackendToFrontend(response.data);
        } catch (error) {
            console.error("Failed to update inventory part:", error);
            throw error;
        }
    }

    /**
     * Delete an inventory part
     */
    async delete(id: string): Promise<void> {
        try {
            await apiClient.delete(`${API_ENDPOINTS.INVENTORY}/parts/${id}`);
        } catch (error) {
            console.error("Failed to delete inventory part:", error);
            throw error;
        }
    }

    /**
     * Adjust stock level
     */
    async adjustStock(id: string, payload: AdjustStockPayload): Promise<InventoryItem> {
        try {
            const response = await apiClient.patch<any>(`${API_ENDPOINTS.INVENTORY}/parts/${id}/adjust-stock`, payload);
            return this.transformBackendToFrontend(response.data);
        } catch (error) {
            console.error("Failed to adjust stock:", error);
            throw error;
        }
    }

    /**
     * Transform backend entity to frontend InventoryItem
     * Maps the complete part master schema
     */
    private transformBackendToFrontend(item: any): InventoryItem {
        let status: StockStatus = "In Stock";
        if (item.stockQuantity <= 0) status = "Out of Stock";
        else if (item.stockQuantity <= item.minStockLevel) status = "Low Stock";

        return {
            id: item.id,

            // Basic Part Information
            oemPartNumber: item.oemPartNumber || "",
            partName: item.partName,
            partNumber: item.partNumber,
            partCode: item.partNumber, // Alias
            originType: item.originType || "",
            category: item.category,
            description: item.description || "",

            // Stock Information
            currentQty: item.stockQuantity,
            stockQuantity: item.stockQuantity,
            minStock: item.minStockLevel,
            minStockLevel: item.minStockLevel,
            maxStockLevel: item.maxStockLevel,
            unit: item.unit || "piece",
            location: item.location || "N/A",

            // Part Details
            brandName: item.brandName || "",
            variant: item.variant || "",
            partType: item.partType || "",
            color: item.color || "",

            // Pricing - Purchase
            costPrice: `₹${item.costPrice || 0}`,
            pricePreGst: item.pricePreGst || 0,
            gstRateInput: item.gstRateInput || 0,
            gstInput: item.gstInput || 0,

            // Pricing - Sale
            unitPrice: `₹${item.unitPrice || 0}`,
            gstRate: item.gstRate || 0,
            gstRateOutput: item.gstRateOutput || 0,
            totalPrice: item.totalPrice || 0,
            totalGst: item.totalGst || 0,

            // Labour Information
            labourName: item.labourName || "",
            labourCode: item.labourCode || "",
            labourWorkTime: item.labourWorkTime || "",
            labourRate: item.labourRate || 0,
            labourGstRate: item.labourGstRate || 0,
            labourPrice: item.labourPrice || 0,

            // Flags
            highValuePart: item.highValuePart || false,

            // Legacy fields
            hsnCode: item.oemPartNumber || "0000",
            supplier: item.brandName || "Unknown",
            status: status,
        } as unknown as InventoryItem;
    }
}

export const inventoryService = new InventoryService();
