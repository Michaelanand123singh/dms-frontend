/**
 * Central Purchase Order Create Service - For service centers to create purchase orders
 * Migrated to use backend API
 */

import { purchaseOrderRepository } from '@/core/repositories/purchase-order.repository';
import type {
  PurchaseOrder,
  PurchaseOrderFormData,
} from "@/shared/types/central-inventory.types";

class CentralPurchaseOrderCreateService {
  /**
   * Create a purchase order from service center
   */
  async createPurchaseOrder(
    formData: PurchaseOrderFormData,
    serviceCenterName: string,
    requestedBy: string,
    requestedByEmail?: string,
    jobCardId?: string,
    vehicleNumber?: string,
    customerName?: string
  ): Promise<PurchaseOrder> {
    // Map form data to backend DTO
    const createDto = {
      supplier: serviceCenterName, // Backend expects supplier field
      items: formData.items.map(item => ({
        partId: item.partId,
        partName: '', // Backend will populate from inventory
        quantity: item.quantity,
        unitPrice: 0, // Backend will populate from inventory
        totalPrice: 0, // Backend will calculate
      })),
    };

    const created = await purchaseOrderRepository.create(createDto);
    return created as unknown as PurchaseOrder;
  }
}

export const centralPurchaseOrderCreateService = new CentralPurchaseOrderCreateService();
