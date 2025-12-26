
// Stub service for Stock Update History
// Backend does not currently support history log retrieval via API.
// This service is now a no-op placeholder.

class StockUpdateHistoryService {
  async recordUpdate(
    partId: string,
    partName: string,
    partNumber: string,
    quantity: number,
    operation: "increase" | "decrease" | "set",
    previousStock: number,
    newStock: number,
    referenceId: string,
    referenceNumber?: string,
    customerName?: string,
    technicianName?: string,
    updatedBy?: string,
    notes?: string
  ): Promise<void> {
    console.log("Stock update recorded (client-side log):", {
      partId, partName, quantity, operation, newStock
    });
    // API call to log history would go here if backend supported it
  }

  async getAll(): Promise<any[]> {
    return [];
  }

  async getByPartId(partId: string): Promise<any[]> {
    return [];
  }
}

export const stockUpdateHistoryService = new StockUpdateHistoryService();
