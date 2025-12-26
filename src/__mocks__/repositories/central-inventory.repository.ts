/**
 * Central Inventory Repository - Simulates database operations
 */

// Local storage helper
const safeStorage = {
  getItem: <T>(key: string, defaultValue: T): T => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  setItem: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  },
};
import {
  mockCentralStock,
  mockPurchaseOrders,
  mockPartsIssues,
  mockStockAdjustments,
  mockCentralInventoryStats,
  mockServiceCenters,
} from "../data/central-inventory.mock";
import type {
  CentralStock,
  PurchaseOrder,
  PartsIssue,
  StockAdjustment,
  CentralInventoryStats,
  ServiceCenterInfo,
  PurchaseOrderFormData,
  StockUpdateFormData,
  PartsIssueFormData,
} from "@/shared/types/central-inventory.types";

const STORAGE_KEYS = {
  CENTRAL_STOCK: "centralStock",
  PURCHASE_ORDERS: "purchaseOrders",
  PARTS_ISSUES: "partsIssues",
  STOCK_ADJUSTMENTS: "stockAdjustments",
};

class CentralInventoryRepository {
  private centralStock: CentralStock[];
  private purchaseOrders: PurchaseOrder[];
  private partsIssues: PartsIssue[];
  private stockAdjustments: StockAdjustment[];

  constructor() {
    // Load from localStorage if available, otherwise use mock data
    const storedStock = safeStorage.getItem<CentralStock[]>(STORAGE_KEYS.CENTRAL_STOCK, []);
    const storedPOs = safeStorage.getItem<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, []);
    const storedIssues = safeStorage.getItem<PartsIssue[]>(STORAGE_KEYS.PARTS_ISSUES, []);
    const storedAdjustments = safeStorage.getItem<StockAdjustment[]>(
      STORAGE_KEYS.STOCK_ADJUSTMENTS,
      []
    );

    this.centralStock = storedStock.length > 0 ? storedStock : [...mockCentralStock];
    this.purchaseOrders = storedPOs.length > 0 ? storedPOs : [...mockPurchaseOrders];
    this.partsIssues = storedIssues.length > 0 ? storedIssues : [...mockPartsIssues];
    this.stockAdjustments =
      storedAdjustments.length > 0 ? storedAdjustments : [...mockStockAdjustments];
  }

  private saveStock(): void {
    safeStorage.setItem(STORAGE_KEYS.CENTRAL_STOCK, this.centralStock);
  }

  private savePurchaseOrders(): void {
    safeStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, this.purchaseOrders);
  }

  private savePartsIssues(): void {
    safeStorage.setItem(STORAGE_KEYS.PARTS_ISSUES, this.partsIssues);
  }

  private saveStockAdjustments(): void {
    safeStorage.setItem(STORAGE_KEYS.STOCK_ADJUSTMENTS, this.stockAdjustments);
  }

  // ==================== Central Stock Operations ====================

  async getAllStock(): Promise<CentralStock[]> {
    return [...this.centralStock];
  }

  async getStockById(id: string): Promise<CentralStock | null> {
    const stock = this.centralStock.find((s) => s.id === id);
    return stock ? { ...stock } : null;
  }

  async getStockByPartId(partId: string): Promise<CentralStock | null> {
    const stock = this.centralStock.find((s) => s.partId === partId);
    return stock ? { ...stock } : null;
  }

  async searchStock(query: string): Promise<CentralStock[]> {
    const lowerQuery = query.toLowerCase();
    return this.centralStock.filter(
      (stock) =>
        stock.partName.toLowerCase().includes(lowerQuery) ||
        stock.partNumber.toLowerCase().includes(lowerQuery) ||
        stock.hsnCode.toLowerCase().includes(lowerQuery) ||
        stock.category.toLowerCase().includes(lowerQuery)
    );
  }

  async createStock(data: Omit<CentralStock, "id" | "lastUpdated" | "lastUpdatedBy"> & { lastUpdatedBy: string }): Promise<CentralStock> {
    const newStock: CentralStock = {
      ...data,
      id: `cs-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: data.lastUpdatedBy,
      // Auto-calculate status based on quantity
      status: data.currentQty === 0 ? "Out of Stock" : (data.currentQty < data.minStock ? "Low Stock" : "In Stock"),
    };
    this.centralStock.push(newStock);
    this.saveStock();
    return { ...newStock };
  }

  async updateStock(id: string, data: Partial<CentralStock>): Promise<CentralStock> {
    const index = this.centralStock.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error("Stock not found");
    }

    this.centralStock[index] = {
      ...this.centralStock[index],
      ...data,
      id: this.centralStock[index].id,
      lastUpdated: new Date().toISOString(),
    };

    // Update status based on quantity
    if (data.currentQty !== undefined) {
      const stock = this.centralStock[index];
      if (stock.currentQty === 0) {
        stock.status = "Out of Stock";
      } else if (stock.currentQty < stock.minStock) {
        stock.status = "Low Stock";
      } else {
        stock.status = "In Stock";
      }
    }

    this.saveStock();
    return { ...this.centralStock[index] };
  }

  async deleteStock(id: string): Promise<void> {
    const index = this.centralStock.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error("Stock not found");
    }
    this.centralStock.splice(index, 1);
    this.saveStock();
  }

  async adjustStock(
    stockId: string,
    adjustment: StockUpdateFormData,
    adjustedBy: string
  ): Promise<{ stock: CentralStock; adjustment: StockAdjustment }> {
    const stock = await this.getStockById(stockId);
    if (!stock) {
      throw new Error("Stock not found");
    }

    const previousQty = stock.currentQty;
    let newQty = previousQty;

    if (adjustment.adjustmentType === "add") {
      newQty = previousQty + adjustment.quantity;
    } else if (adjustment.adjustmentType === "remove") {
      newQty = Math.max(0, previousQty - adjustment.quantity);
    } else if (adjustment.adjustmentType === "adjust") {
      newQty = adjustment.quantity;
    }

    const updatedStock = await this.updateStock(stockId, {
      currentQty: newQty,
      lastUpdatedBy: adjustedBy,
    });

    const stockAdjustment: StockAdjustment = {
      id: `sa-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      stockId,
      partId: stock.partId,
      partName: stock.partName,
      adjustmentType: adjustment.adjustmentType,
      quantity: adjustment.quantity,
      previousQty,
      newQty,
      reason: adjustment.reason,
      adjustedBy,
      adjustedAt: new Date().toISOString(),
      notes: adjustment.notes,
      referenceNumber: adjustment.referenceNumber,
    };

    this.stockAdjustments.unshift(stockAdjustment);
    this.saveStockAdjustments();

    return { stock: updatedStock, adjustment: stockAdjustment };
  }

  // ==================== Purchase Order Operations ====================

  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return [...this.purchaseOrders];
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    const po = this.purchaseOrders.find((p) => p.id === id);
    return po ? { ...po } : null;
  }

  async getPurchaseOrdersByStatus(status: PurchaseOrder["status"]): Promise<PurchaseOrder[]> {
    return this.purchaseOrders.filter((po) => po.status === status);
  }

  async getPurchaseOrdersByServiceCenter(serviceCenterId: string): Promise<PurchaseOrder[]> {
    return this.purchaseOrders.filter((po) => po.serviceCenterId === serviceCenterId);
  }

  async approvePurchaseOrder(
    id: string,
    approvedBy: string,
    approvedItems?: Array<{ itemId: string; approvedQty: number }>
  ): Promise<PurchaseOrder> {
    const po = this.purchaseOrders.find((p) => p.id === id);
    if (!po) {
      throw new Error("Purchase order not found");
    }

    if (po.status !== "pending") {
      throw new Error("Purchase order is not in pending status");
    }

    // Update item statuses if provided
    if (approvedItems) {
      approvedItems.forEach(({ itemId, approvedQty }) => {
        const item = po.items.find((i) => i.id === itemId);
        if (item) {
          item.approvedQty = approvedQty;
          item.status = approvedQty > 0 ? "approved" : "rejected";
        }
      });
    } else {
      // Approve all items with requested quantity
      po.items.forEach((item) => {
        item.approvedQty = item.requestedQty;
        item.status = "approved";
      });
    }

    po.status = "approved";
    po.approvedBy = approvedBy;
    po.approvedAt = new Date().toISOString();

    this.savePurchaseOrders();
    return { ...po };
  }

  async rejectPurchaseOrder(
    id: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<PurchaseOrder> {
    const po = this.purchaseOrders.find((p) => p.id === id);
    if (!po) {
      throw new Error("Purchase order not found");
    }

    if (po.status !== "pending") {
      throw new Error("Purchase order is not in pending status");
    }

    po.status = "rejected";
    po.rejectedBy = rejectedBy;
    po.rejectedAt = new Date().toISOString();
    po.rejectionReason = rejectionReason;

    // Reject all items
    po.items.forEach((item) => {
      item.status = "rejected";
    });

    this.savePurchaseOrders();
    return { ...po };
  }

  // ==================== Parts Issue Operations ====================

  async getAllPartsIssues(): Promise<PartsIssue[]> {
    return [...this.partsIssues];
  }

  async getPartsIssueById(id: string): Promise<PartsIssue | null> {
    const issue = this.partsIssues.find((p) => p.id === id);
    return issue ? { ...issue } : null;
  }

  async getPartsIssuesByServiceCenter(serviceCenterId: string): Promise<PartsIssue[]> {
    return this.partsIssues.filter((issue) => issue.serviceCenterId === serviceCenterId);
  }

  async createPartsIssue(
    data: PartsIssueFormData,
    issuedBy: string
  ): Promise<{ issue: PartsIssue; stockUpdates: CentralStock[] }> {
    // Generate issue number
    const issueNumber = `PI-${new Date().getFullYear()}-${String(
      this.partsIssues.length + 1
    ).padStart(3, "0")}`;

    // Calculate total amount
    const totalAmount = data.items.reduce((sum, item) => {
      const stock = this.centralStock.find((s) => s.id === item.fromStock);
      if (!stock) return sum;
      return sum + stock.unitPrice * item.quantity;
    }, 0);

    // Get service center info
    const serviceCenter = mockServiceCenters.find((sc) => sc.id === data.serviceCenterId);
    if (!serviceCenter) {
      throw new Error("Service center not found");
    }

    // Create issue items
    const issueItems = data.items.map((item) => {
      const stock = this.centralStock.find((s) => s.id === item.fromStock);
      if (!stock) {
        throw new Error(`Stock not found for item: ${item.partId}`);
      }

      return {
        id: `pii-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        partId: item.partId,
        partName: stock.partName,
        partNumber: stock.partNumber,
        hsnCode: stock.hsnCode,
        quantity: item.quantity,
        unitPrice: stock.unitPrice,
        totalPrice: stock.unitPrice * item.quantity,
        fromStock: item.fromStock,
      };
    });

    const issue: PartsIssue = {
      id: `pi-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      issueNumber,
      serviceCenterId: data.serviceCenterId,
      serviceCenterName: serviceCenter.name,
      issuedBy,
      issuedAt: new Date().toISOString(),
      status: "issued",
      items: issueItems,
      totalAmount,
      purchaseOrderId: data.purchaseOrderId,
      notes: data.notes,
      transportDetails: data.transportDetails,
    };

    // Update stock quantities
    const updatedStocks: CentralStock[] = [];
    for (const item of data.items) {
      const stock = await this.getStockById(item.fromStock);
      if (stock) {
        const updated = await this.adjustStock(
          item.fromStock,
          {
            partId: item.partId,
            adjustmentType: "remove",
            quantity: item.quantity,
            reason: `Issued to ${serviceCenter.name}`,
            referenceNumber: issueNumber,
          },
          issuedBy
        );
        updatedStocks.push(updated.stock);
      }
    }

    // Update purchase order if linked
    if (data.purchaseOrderId) {
      const po = await this.getPurchaseOrderById(data.purchaseOrderId);
      if (po) {
        // Update issued quantities
        issueItems.forEach((issueItem) => {
          const poItem = po.items.find(
            (item) => item.partId === issueItem.partId
          );
          if (poItem) {
            poItem.issuedQty = (poItem.issuedQty || 0) + issueItem.quantity;
            if (poItem.issuedQty >= (poItem.approvedQty || poItem.requestedQty)) {
              poItem.status = "issued";
            }
          }
        });

        // Check if all items are issued
        const allIssued = po.items.every((item) => item.status === "issued");
        if (allIssued) {
          po.status = "fulfilled";
          po.fulfilledBy = issuedBy;
          po.fulfilledAt = new Date().toISOString();
        } else {
          po.status = "partially_fulfilled";
        }

        this.savePurchaseOrders();
      }
    }

    this.partsIssues.unshift(issue);
    this.savePartsIssues();

    return { issue, stockUpdates: updatedStocks };
  }

  // ==================== Statistics ====================

  async getStats(): Promise<CentralInventoryStats> {
    const stats = { ...mockCentralInventoryStats };

    // Calculate real-time stats
    stats.totalParts = this.centralStock.length;
    stats.totalStockValue = this.centralStock.reduce(
      (sum, stock) => sum + stock.currentQty * stock.unitPrice,
      0
    );
    stats.lowStockParts = this.centralStock.filter((s) => s.status === "Low Stock").length;
    stats.outOfStockParts = this.centralStock.filter((s) => s.status === "Out of Stock").length;
    stats.pendingPurchaseOrders = this.purchaseOrders.filter((p) => p.status === "pending").length;
    stats.approvedPurchaseOrders = this.purchaseOrders.filter((p) => p.status === "approved")
      .length;
    stats.pendingIssues = this.partsIssues.filter((p) => p.status === "issued").length;

    return stats;
  }

  // ==================== Service Centers ====================

  async getAllServiceCenters(): Promise<ServiceCenterInfo[]> {
    return [...mockServiceCenters];
  }

  async getServiceCenterById(id: string): Promise<ServiceCenterInfo | null> {
    const sc = mockServiceCenters.find((s) => s.id === id);
    return sc ? { ...sc } : null;
  }

  // ==================== Stock Adjustments ====================

  async getStockAdjustments(limit?: number): Promise<StockAdjustment[]> {
    const adjustments = [...this.stockAdjustments];
    return limit ? adjustments.slice(0, limit) : adjustments;
  }

  async getStockAdjustmentsByStockId(stockId: string): Promise<StockAdjustment[]> {
    return this.stockAdjustments.filter((adj) => adj.stockId === stockId);
  }
}

export const centralInventoryRepository = new CentralInventoryRepository();

