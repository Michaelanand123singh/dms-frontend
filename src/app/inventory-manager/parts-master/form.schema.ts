/**
 * Parts Master Form Schema
 * Defines form structure, field definitions, and validation
 * Updated with new parameters from image
 */

export interface PartsMasterFormData {
  // Basic Information
  oemPartNumber: string;
  partName: string;
  partNumber: string;
  originType: string; // OLD/NEW
  category: string;
  purchasePrice: string;
  description: string;
  minStock: number;
  unit: string;
  // Basic Part Info
  brandName: string;
  variant: string;
  partType: string; // PANEL, etc.
  color: string;
  // GST and Pricing
  gstAmount: string; // Auto-calculated from purchase price and GST rate input
  gstRateInput: string; // Percentage (e.g., 18%)
  pricePreGst: string; // Sale price pre GST
  gstRateOutput: string; // Percentage (e.g., 18%)
  // Labour Information
  estimatedLabour: string;
  estimatedLabourWorkTime: string; // Format like "0.3M"
  labourRate: string;
  labourGstRate: string; // Percentage
  labourPrice: string; // Auto-calculated
  // Calculated Totals
  gstInput: string; // Auto-calculated
  totalPrice: string; // Auto-calculated
  totalGst: string; // Auto-calculated
  // High Value Part
  highValuePart: boolean;
  // Optional
  centerId?: string;
}

export type FieldType = 
  | "text" 
  | "number" 
  | "textarea" 
  | "select" 
  | "checkbox"
  | "readonly";

export type FieldSection = 
  | "basic"
  | "serviceCenter"
  | "basicPartInfo"
  | "gstPricing"
  | "labour"
  | "totals"
  | "highValue";

export interface FormFieldDefinition {
  name: keyof PartsMasterFormData;
  label: string;
  type: FieldType;
  section: FieldSection;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  step?: string;
  min?: number;
  max?: number;
  conditional?: {
    field: keyof PartsMasterFormData;
    value: any;
  };
  helperText?: string;
  autoCalculated?: boolean;
  gridCols?: 1 | 2;
}

export const PARTS_MASTER_FORM_SCHEMA: FormFieldDefinition[] = [
  // Service Center Section
  {
    name: "centerId",
    label: "Service Center",
    type: "select",
    section: "serviceCenter",
    required: true,
    options: [],
  },
  
  // Basic Information Section
  {
    name: "oemPartNumber",
    label: "OEM PART NUMBER",
    type: "text",
    section: "basic",
    required: false,
  },
  {
    name: "partName",
    label: "Part Name",
    type: "text",
    section: "basic",
    required: true,
  },
  {
    name: "partNumber",
    label: "Part Number",
    type: "text",
    section: "basic",
    required: false,
  },
  {
    name: "originType",
    label: "ORIGIN TYPE",
    type: "select",
    section: "basic",
    required: false,
    options: [
      { value: "OLD", label: "OLD" },
      { value: "NEW", label: "NEW" },
    ],
  },
  {
    name: "category",
    label: "Category",
    type: "text",
    section: "basic",
    required: false,
  },
  {
    name: "purchasePrice",
    label: "PURCHASE PRICE",
    type: "number",
    section: "basic",
    step: "0.01",
    required: false,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    section: "basic",
    required: false,
  },
  {
    name: "minStock",
    label: "Min Stock",
    type: "number",
    section: "basic",
    required: false,
  },
  {
    name: "unit",
    label: "Unit",
    type: "text",
    section: "basic",
    required: false,
    placeholder: "piece",
  },

  // Basic Part Info Section
  {
    name: "brandName",
    label: "Brand Name",
    type: "text",
    section: "basicPartInfo",
    required: false,
  },
  {
    name: "variant",
    label: "Variant",
    type: "text",
    section: "basicPartInfo",
    required: false,
  },
  {
    name: "partType",
    label: "Part Type",
    type: "text",
    section: "basicPartInfo",
    required: false,
    placeholder: "PANEL",
  },
  {
    name: "color",
    label: "Color",
    type: "text",
    section: "basicPartInfo",
    required: false,
    placeholder: "ANTHRACITE",
  },

  // GST and Pricing Section
  {
    name: "gstAmount",
    label: "GST Amount",
    type: "readonly",
    section: "gstPricing",
    autoCalculated: true,
    helperText: "Auto-calculated from Purchase Price and GST Rate Input",
  },
  {
    name: "gstRateInput",
    label: "GST Rate Input",
    type: "number",
    section: "gstPricing",
    step: "0.01",
    placeholder: "18",
    helperText: "Enter as percentage (e.g., 18 for 18%)",
  },
  {
    name: "pricePreGst",
    label: "Price Pre GST",
    type: "number",
    section: "gstPricing",
    step: "0.01",
    required: false,
  },
  {
    name: "gstRateOutput",
    label: "GST Rate Output",
    type: "number",
    section: "gstPricing",
    step: "0.01",
    placeholder: "18",
    helperText: "Enter as percentage (e.g., 18 for 18%)",
  },

  // Labour Association Section
  {
    name: "estimatedLabour",
    label: "Estimated Labour",
    type: "text",
    section: "labour",
    required: false,
  },
  {
    name: "estimatedLabourWorkTime",
    label: "Estimated Labour Work Time",
    type: "text",
    section: "labour",
    required: false,
    placeholder: "0.3M",
    helperText: "Format: e.g., 0.3M for 0.3 minutes",
  },
  {
    name: "labourRate",
    label: "Labour Rate",
    type: "number",
    section: "labour",
    step: "0.01",
    required: false,
  },
  {
    name: "labourGstRate",
    label: "Labour GST Rate",
    type: "number",
    section: "labour",
    step: "0.01",
    placeholder: "18",
    helperText: "Enter as percentage (e.g., 18 for 18%)",
  },
  {
    name: "labourPrice",
    label: "LABOUR PRICE",
    type: "readonly",
    section: "labour",
    autoCalculated: true,
    helperText: "Auto-calculated from Labour Rate and Labour GST Rate",
  },

  // Totals Section (Auto-calculated)
  {
    name: "gstInput",
    label: "GST INPUT",
    type: "readonly",
    section: "totals",
    autoCalculated: true,
    helperText: "Auto-calculated GST on purchase",
  },
  {
    name: "totalPrice",
    label: "TOTAL PRICE",
    type: "readonly",
    section: "totals",
    autoCalculated: true,
    helperText: "Auto-calculated: Price Pre GST + Labour Price",
  },
  {
    name: "totalGst",
    label: "TOTAL GST",
    type: "readonly",
    section: "totals",
    autoCalculated: true,
    helperText: "Auto-calculated: GST Input + GST Output + Labour GST",
  },

  // High Value Part Section
  {
    name: "highValuePart",
    label: "High Value Part",
    type: "checkbox",
    section: "highValue",
  },
];

export const SECTION_LABELS: Record<FieldSection, string> = {
  basic: "Basic Information",
  serviceCenter: "Service Center",
  basicPartInfo: "Basic Part Info",
  gstPricing: "GST and Pricing",
  labour: "Labour Association",
  totals: "Totals",
  highValue: "High Value Part",
};

export const SECTION_ORDER: FieldSection[] = [
  "serviceCenter",
  "basic",
  "basicPartInfo",
  "gstPricing",
  "labour",
  "totals",
  "highValue",
];

/**
 * Get initial form data
 */
export function getInitialFormData(): PartsMasterFormData {
  return {
    oemPartNumber: "",
    partName: "",
    partNumber: "",
    originType: "NEW",
    category: "",
    purchasePrice: "",
    description: "",
    minStock: 0,
    unit: "piece",
    // Basic Part Info
    brandName: "",
    variant: "",
    partType: "",
    color: "",
    // GST and Pricing
    gstAmount: "",
    gstRateInput: "",
    pricePreGst: "",
    gstRateOutput: "",
    // Labour
    estimatedLabour: "",
    estimatedLabourWorkTime: "",
    labourRate: "",
    labourGstRate: "",
    labourPrice: "",
    // Totals
    gstInput: "",
    totalPrice: "",
    totalGst: "",
    // High Value Part
    highValuePart: false,
  };
}

/**
 * Get fields by section
 */
export function getFieldsBySection(
  section: FieldSection,
  showServiceCenter: boolean = false
): FormFieldDefinition[] {
  return PARTS_MASTER_FORM_SCHEMA.filter((field) => {
    if (field.section === section) {
      if (field.section === "serviceCenter" && !showServiceCenter) {
        return false;
      }
      return true;
    }
    return false;
  });
}

/**
 * Get all fields grouped by section
 */
export function getFieldsGroupedBySection(
  showServiceCenter: boolean = false
): Record<FieldSection, FormFieldDefinition[]> {
  const grouped: Partial<Record<FieldSection, FormFieldDefinition[]>> = {};
  
  SECTION_ORDER.forEach((section) => {
    grouped[section] = getFieldsBySection(section, showServiceCenter);
  });

  return grouped as Record<FieldSection, FormFieldDefinition[]>;
}
