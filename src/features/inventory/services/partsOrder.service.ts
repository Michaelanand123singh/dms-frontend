/**
 * Parts Order Service - Manage purchase orders for parts
 */

import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import type { PartsOrderFormData } from "@/shared/types/inventory.types";

export type PartsOrderStatus = "pending" | "approved" | "rejected" | "received";

export interface PartsOrder {
  id: string;
  orderNumber: string;
  partId: string;
  partName: string;
  requiredQty: number;
  urgency: "low" | "medium" | "high";
  status: PartsOrderStatus;
  notes?: string;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  receivedAt?: string;
}

const STORAGE_KEY = "partsOrders";

class PartsOrderService {
  private generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const orders = safeStorage.getItem<PartsOrder[]>(STORAGE_KEY, []);
    const currentMonthOrders = orders.filter((o) => {
      const orderYear = parseInt(o.orderNumber.split("-")[1]);
      const orderMonth = parseInt(o.orderNumber.split("-")[2]);
      return orderYear === year && orderMonth === parseInt(month);
    });
    const nextSequence = currentMonthOrders.length + 1;
    return `PO-${year}-${month}-${String(nextSequence).padStart(4, "0")}`;
  }

  async getAll(): Promise<PartsOrder[]> {
    return safeStorage.getItem<PartsOrder[]>(STORAGE_KEY, []);
  }

  async getById(id: string): Promise<PartsOrder | null> {
    const orders = await this.getAll();
    return orders.find((o) => o.id === id) || null;
  }

  async create(
    formData: PartsOrderFormData,
    partName: string,
    requestedBy: string = "Inventory Manager"
  ): Promise<PartsOrder> {
    const order: PartsOrder = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderNumber: this.generateOrderNumber(),
      partId: formData.partId,
      partName,
      requiredQty: formData.requiredQty,
      urgency: formData.urgency,
      status: "pending",
      notes: formData.notes,
      requestedBy,
      requestedAt: new Date().toISOString(),
    };

    const orders = await this.getAll();
    safeStorage.setItem(STORAGE_KEY, [order, ...orders]);

    return order;
  }

  async updateStatus(
    id: string,
    status: PartsOrderStatus,
    updatedBy: string,
    notes?: string
  ): Promise<PartsOrder> {
    const orders = await this.getAll();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error("Order not found");
    }

    const update: Partial<PartsOrder> = {
      status,
      notes: notes || orders[index].notes,
    };

    if (status === "approved") {
      update.approvedBy = updatedBy;
      update.approvedAt = new Date().toISOString();
    } else if (status === "rejected") {
      update.rejectedBy = updatedBy;
      update.rejectedAt = new Date().toISOString();
    } else if (status === "received") {
      update.receivedAt = new Date().toISOString();
    }

    orders[index] = { ...orders[index], ...update };
    safeStorage.setItem(STORAGE_KEY, orders);

    return orders[index];
  }

  async getByStatus(status: PartsOrderStatus): Promise<PartsOrder[]> {
    const orders = await this.getAll();
    return orders.filter((o) => o.status === status);
  }
}

export const partsOrderService = new PartsOrderService();

