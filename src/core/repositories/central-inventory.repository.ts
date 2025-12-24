import { BaseRepository } from './base.repository';
import { apiClient } from '@/core/api/client';

export interface CentralInventoryItem {
    id: string;
    partName: string;
    partNumber: string;
    category: string;
    stockQuantity: number;
    allocated: number;
    available: number;
    unitPrice: number;
    reorderPoint: number;
    reorderQuantity: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCentralInventoryDto {
    partName: string;
    partNumber: string;
    category: string;
    stockQuantity: number;
    allocated?: number;
    unitPrice: number;
    reorderPoint: number;
    reorderQuantity: number;
}

class CentralInventoryRepository extends BaseRepository<CentralInventoryItem> {
    protected endpoint = '/central-inventory';

    /**
     * Search central inventory items
     */
    async search(searchTerm: string, category?: string): Promise<CentralInventoryItem[]> {
        const params: Record<string, any> = { search: searchTerm };
        if (category) params.category = category;
        return this.getAll(params);
    }

    /**
     * Create inventory part
     */
    async createPart(data: CreateCentralInventoryDto): Promise<CentralInventoryItem> {
        const response = await apiClient.post<CentralInventoryItem>(`${this.endpoint}/parts`, data);
        return response.data;
    }
}

export const centralInventoryRepository = new CentralInventoryRepository();
