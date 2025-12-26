
// Stub service for Parts Orders (Purchase Orders)
// Usage of this service should be replaced by centralPurchaseOrder.service.ts or similar if applicable.
// For now, removing localStorage usage.

class PartsOrderService {
  async getAll() {
    return [];
  }

  async create(data: any) {
    console.warn("Parts Order creation not implemented in this stub.");
    return data;
  }

  async updateStatus(id: string, status: string) {
    console.warn("Parts Order update not implemented in this stub.");
  }
}

export const partsOrderService = new PartsOrderService();
