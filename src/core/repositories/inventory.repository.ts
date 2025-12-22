import { BaseRepository } from './base.repository';
import { apiClient } from '@/core/api/client';

export interface InventoryPart {
    id: string;
    partId: string;
    partName: string;
    partNumber?: string;
    category?: string;
    quantity: number;
    minLevel?: number;
    maxLevel?: number;
    serviceCenterId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface StockAdjustment {
    adjustmentType: 'ADD' | 'SUBTRACT' | 'SET';
    quantity: number;
    reason: string;
    notes?: string;
    referenceNumber?: string;
}

class InventoryRepository extends BaseRepository<InventoryPart> {
    protected endpoint = '/inventory';

    async getLowStock(serviceCenterId?: string): Promise<InventoryPart[]> {
        const params = serviceCenterId ? { serviceCenterId } : {};
        const response = await apiClient.get<InventoryPart[]>(`${this.endpoint}/low-stock`, { params });
        return response.data;
    }

    async adjustStock(partId: string, adjustmentData: StockAdjustment): Promise<InventoryPart> {
        const response = await apiClient.patch<InventoryPart>(
            `${this.endpoint}/parts/${partId}/adjust-stock`,
            adjustmentData
        );
        return response.data;
    }

    async createPart(data: Partial<InventoryPart>): Promise<InventoryPart> {
        const response = await apiClient.post<InventoryPart>(`${this.endpoint}/parts`, data);
        return response.data;
    }
}

export const inventoryRepository = new InventoryRepository();
