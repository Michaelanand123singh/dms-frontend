/**
 * Parts Order Service - Manage purchase orders for parts
 */

import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import type { PartsOrderFormData } from "@/shared/types/inventory.types";

export type PartsOrderStatus = "draft" | "order" | "acknowledge" | "pending" | "in_transit" | "checked_in" | "approved" | "rejected" | "received";

export interface PartsOrderItem {
  partId: string;
  partName: string;
  requiredQty: number;
  urgency: "low" | "medium" | "high";
  notes?: string;
}

export interface PartsOrder {
  id: string;
  orderNumber: string;
  items: PartsOrderItem[];
  status: PartsOrderStatus;
  orderNotes?: string;
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
    const orders = safeStorage.getItem<any[]>(STORAGE_KEY, []);
    // Migrate old format to new format for backward compatibility
    return orders.map((order) => {
      // If order has old format (single part fields), convert to new format
      if (order.partId && !order.items) {
        return {
          ...order,
          items: [{
            partId: order.partId,
            partName: order.partName || "",
            requiredQty: order.requiredQty || 0,
            urgency: order.urgency || "medium",
            notes: order.notes,
          }],
          orderNotes: order.notes,
        } as PartsOrder;
      }
      return order as PartsOrder;
    });
  }

  async getById(id: string): Promise<PartsOrder | null> {
    const orders = await this.getAll();
    return orders.find((o) => o.id === id) || null;
  }

  async create(
    items: PartsOrderItem[],
    orderNotes?: string,
    requestedBy: string = "Inventory Manager",
    status: PartsOrderStatus = "order"
  ): Promise<PartsOrder> {
    if (!items || items.length === 0) {
      throw new Error("At least one part is required to create an order");
    }

    const order: PartsOrder = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderNumber: this.generateOrderNumber(),
      items,
      status,
      orderNotes,
      requestedBy,
      requestedAt: new Date().toISOString(),
    };

    const orders = await this.getAll();
    safeStorage.setItem(STORAGE_KEY, [order, ...orders]);

    return order;
  }

  async saveDraft(
    items: PartsOrderItem[],
    orderNotes?: string,
    requestedBy: string = "Inventory Manager",
    draftId?: string
  ): Promise<PartsOrder> {
    // If draftId is provided, update existing draft
    if (draftId) {
      return this.updateDraft(draftId, items, orderNotes);
    }
    // Otherwise create new draft
    return this.create(items, orderNotes, requestedBy, "draft");
  }

  async updateDraft(
    id: string,
    items: PartsOrderItem[],
    orderNotes?: string
  ): Promise<PartsOrder> {
    const orders = await this.getAll();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error("Draft order not found");
    }

    const order = orders[index];
    if (order.status !== "draft") {
      throw new Error("Can only update draft orders");
    }

    orders[index] = {
      ...order,
      items,
      orderNotes,
    };
    safeStorage.setItem(STORAGE_KEY, orders);

    return orders[index];
  }

  async submitDraft(id: string): Promise<PartsOrder> {
    const orders = await this.getAll();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error("Draft order not found");
    }

    const order = orders[index];
    if (order.status !== "draft") {
      throw new Error("Can only submit draft orders");
    }

    orders[index] = {
      ...order,
      status: "order",
    };
    safeStorage.setItem(STORAGE_KEY, orders);

    return orders[index];
  }

  async acknowledgeOrder(
    id: string,
    acknowledgedBy: string
  ): Promise<PartsOrder> {
    const orders = await this.getAll();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error("Order not found");
    }

    const order = orders[index];
    // Only acknowledge if status is "order" or "pending"
    if (order.status !== "order" && order.status !== "pending") {
      throw new Error(`Cannot acknowledge order with status: ${order.status}`);
    }

    orders[index] = {
      ...order,
      status: "acknowledge",
      approvedBy: acknowledgedBy,
      approvedAt: new Date().toISOString(),
    };
    safeStorage.setItem(STORAGE_KEY, orders);

    return orders[index];
  }

  // Legacy method for backward compatibility (single part)
  async createSingle(
    formData: PartsOrderFormData,
    partName: string,
    requestedBy: string = "Inventory Manager"
  ): Promise<PartsOrder> {
    return this.create(
      [{
        partId: formData.partId,
        partName,
        requiredQty: formData.requiredQty,
        urgency: formData.urgency,
        notes: formData.notes,
      }],
      undefined,
      requestedBy
    );
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
      orderNotes: notes || orders[index].orderNotes,
    };

    if (status === "approved" || status === "acknowledge") {
      update.approvedBy = updatedBy;
      update.approvedAt = new Date().toISOString();
    } else if (status === "rejected") {
      update.rejectedBy = updatedBy;
      update.rejectedAt = new Date().toISOString();
    } else if (status === "received" || status === "checked_in") {
      update.receivedAt = new Date().toISOString();
    } else if (status === "in_transit") {
      // Track when order went in transit
      if (!orders[index].approvedAt) {
        update.approvedAt = new Date().toISOString();
      }
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

