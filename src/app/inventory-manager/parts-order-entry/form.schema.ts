/**
 * Parts Order Entry Form Schema
 * Defines form structure, field definitions, and validation
 */

export interface PartsOrderItem {
  partId: string;
  partName: string;
  requiredQty: number;
  urgency: "low" | "medium" | "high";
  notes?: string;
}

export interface PartsOrderEntryFormData {
  items: PartsOrderItem[];
  orderNotes?: string; // Optional notes for entire order
}

export function getInitialFormData(): PartsOrderEntryFormData {
  return {
    items: [],
    orderNotes: "",
  };
}

export function getInitialItemFormData(): PartsOrderItem {
  return {
    partId: "",
    partName: "",
    requiredQty: 0,
    urgency: "medium",
    notes: "",
  };
}

