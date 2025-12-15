/**
 * Parts Entry Form Schema
 * Defines form structure, field definitions, and validation
 */

export interface PartsEntryFormData {
  invoiceNumber: string;
  vendor: string;
  entryDate: string;
}

export interface PartsEntryItemFormData {
  partId: string;
  partName: string;
  quantity: string;
  unitPrice: string;
}


export function getInitialFormData(): PartsEntryFormData {
  return {
    invoiceNumber: "",
    vendor: "",
    entryDate: new Date().toISOString().split("T")[0],
  };
}

export function getInitialItemFormData(): PartsEntryItemFormData {
  return {
    partId: "",
    partName: "",
    quantity: "",
    unitPrice: "",
  };
}

