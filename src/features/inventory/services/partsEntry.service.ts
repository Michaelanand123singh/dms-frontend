
// Stub service for Parts Entry (GRN/Receiving)
// For now, removing localStorage usage.

class PartsEntryService {
  async getAll() {
    return [];
  }

  async create(data: any) {
    console.warn("Parts Entry creation not implemented.");
    return data;
  }
}

export const partsEntryService = new PartsEntryService();
