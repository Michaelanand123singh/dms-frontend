/**
 * Central Purchase Order Service - Business logic layer for purchase order operations
 * Migrated to use backend API
 */

import { purchaseOrderRepository } from '@/core/repositories/purchase-order.repository';
import type { PurchaseOrder } from "@/shared/types/central-inventory.types";

class CentralPurchaseOrderService {
  /**
   * Get all purchase orders
   */
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    const orders = await purchaseOrderRepository.getAll();
    return orders as unknown as PurchaseOrder[];
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    const order = await purchaseOrderRepository.getById(id);
    return order as unknown as PurchaseOrder;
  }

  /**
   * Approve purchase order
   */
  async approvePurchaseOrder(
    id: string,
    approvedBy: string,
    approvedItems?: Array<{ itemId: string; approvedQty: number }>
  ): Promise<PurchaseOrder> {
    // Backend approve endpoint handles the logic
    const approved = await purchaseOrderRepository.approve(id);
    return approved as unknown as PurchaseOrder;
  }

  /**
   * Reject purchase order
   */
  async rejectPurchaseOrder(
    id: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<PurchaseOrder> {
    // For now, we update the status - backend would have reject endpoint
    const updated = await purchaseOrderRepository.update(id, {
      status: 'Cancelled',
    } as any);
    return updated as unknown as PurchaseOrder;
  }

  /**
   * Get purchase orders by status
   */
  async getPurchaseOrdersByStatus(status: PurchaseOrder["status"]): Promise<PurchaseOrder[]> {
    const orders = await purchaseOrderRepository.getByStatus(status);
    return orders as unknown as PurchaseOrder[];
  }

  /**
   * Get purchase orders by service center
   */
  async getPurchaseOrdersByServiceCenter(serviceCenterId: string): Promise<PurchaseOrder[]> {
    const orders = await purchaseOrderRepository.getAll({ serviceCenterId });
    return orders as unknown as PurchaseOrder[];
  }
}

export const centralPurchaseOrderService = new CentralPurchaseOrderService();
