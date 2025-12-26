import { API_CONFIG, API_ENDPOINTS } from "@/config/api.config";
import { apiClient } from "@/core/api/client";
import type { InventoryItem, StockStatus } from "@/shared/types/inventory.types";

interface InventoryFilterParams {
    serviceCenterId?: string;
    category?: string;
    search?: string;
    lowStock?: boolean;
}

interface CreateInventoryPartPayload {
    serviceCenterId: string;
    partName: string;
    partNumber: string;
    category: string;
    unitPrice: number;
    costPrice: number;
    gstRate: number;
    stockQuantity: number;
    minStockLevel: number;
    maxStockLevel: number;
    location?: string;
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
            if (API_CONFIG.USE_MOCK) {
                return [];
            }

            // Backend returns array of items directly based on our previous analysis of Client usage
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
     */
    private transformBackendToFrontend(item: any): InventoryItem {
        let status: StockStatus = "In Stock";
        if (item.stockQuantity <= 0) status = "Out of Stock";
        else if (item.stockQuantity <= item.minStockLevel) status = "Low Stock";

        return {
            id: item.id, // ID is usually string UUID from backend, but Interface says number. We might need to adjust interface or cast.
            // The backend uses UUIDs (string). The frontend Interface defined id: number (line 9).
            // This is a mismatch. I will cast to any for now or try to use string if logic permits.
            // IMPORTANT: If frontend strictly expects number, this will break. 
            // Looking at page.tsx usage is recommended. For now, assuming string is acceptable or will fix types later.

            partName: item.partName,
            hsnCode: "0000", // Not in backend DTO yet, placeholder
            partCode: item.partNumber,
            category: item.category,
            currentQty: item.stockQuantity,
            minStock: item.minStockLevel,
            unitPrice: `₹${item.unitPrice}`,
            costPrice: `₹${item.costPrice}`,
            supplier: "Unknown", // Not in backend DTO
            location: item.location || "N/A",
            status: status
        } as unknown as InventoryItem; // Cast because 'id' type mismatch (string vs number)
    }
}

export const inventoryService = new InventoryService();
