/**
 * Parts Order Entry Form Schema
 * Defines form structure, field definitions, and validation
 */

export interface PartsOrderEntryFormData {
  partId: string;
  requiredQty: number;
  urgency: "low" | "medium" | "high";
  notes: string;
}


export function getInitialFormData(): PartsOrderEntryFormData {
  return {
    partId: "",
    requiredQty: 0,
    urgency: "medium",
    notes: "",
  };
}

