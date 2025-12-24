import { BaseRepository } from './base.repository';
import { apiClient } from '@/core/api/client';

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    supplier: string;
    status: 'Draft' | 'Submitted' | 'Approved' | 'Received' | 'Cancelled';
    totalAmount: number;
    items: PurchaseOrderItem[];
    createdAt?: string;
    submittedAt?: string;
    approvedAt?: string;
    receivedAt?: string;
}

export interface PurchaseOrderItem {
    id?: string;
    partId: string;
    partName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface CreatePurchaseOrderDto {
    supplier: string;
    items: Omit<PurchaseOrderItem, 'id'>[];
}

class PurchaseOrderRepository extends BaseRepository<PurchaseOrder> {
    protected endpoint = '/purchase-orders';

    /**
     * Submit purchase order for approval
     */
    async submit(id: string): Promise<PurchaseOrder> {
        const response = await apiClient.patch<PurchaseOrder>(`${this.endpoint}/${id}/submit`);
        return response.data;
    }

    /**
     * Approve purchase order
     */
    async approve(id: string): Promise<PurchaseOrder> {
        const response = await apiClient.patch<PurchaseOrder>(`${this.endpoint}/${id}/approve`);
        return response.data;
    }

    /**
     * Mark purchase order as received
     */
    async receive(id: string, receivedData: any): Promise<PurchaseOrder> {
        const response = await apiClient.patch<PurchaseOrder>(`${this.endpoint}/${id}/receive`, receivedData);
        return response.data;
    }

    /**
     * Get purchase orders by status
     */
    async getByStatus(status: string): Promise<PurchaseOrder[]> {
        return this.getAll({ status });
    }
}

export const purchaseOrderRepository = new PurchaseOrderRepository();
