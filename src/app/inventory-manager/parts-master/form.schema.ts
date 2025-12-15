/**
 * Parts Master Form Schema
 * Defines form structure, field definitions, and validation
 */

export interface PartsMasterFormData {
  partId: string;
  partName: string;
  partNumber: string;
  hsnCode: string; // HSN Code
  partCode: string;
  labourCode: string; // Labour Code
  category: string;
  quantity: string;
  price: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  description: string;
  minStockLevel: number;
  unit: string;
  // Basic Part Info
  brandName: string;
  variant: string;
  partType: "NEW" | "OLD";
  color: string;
  // Purchase (Incoming)
  preGstAmountToUs: string;
  gstRateInput: string;
  gstInputAmount: string;
  postGstAmountToUs: string;
  // Sale (Outgoing)
  salePricePreGst: string;
  gstRateOutput: string;
  gstOutputAmount: string;
  postGstSaleAmount: string;
  // Labour Association
  associatedLabourName: string;
  associatedLabourCode: string;
  workTime: string;
  labourRate: string;
  labourGstRate: string;
  labourGstAmount: string;
  labourPostGstAmount: string;
  // High Value Part
  highValuePart: boolean;
  partSerialNumber: string;
  // Optional fields
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
  | "purchase"
  | "sale"
  | "labour"
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
    name: "partId",
    label: "Part ID",
    type: "text",
    section: "basic",
    required: false,
  },
  {
    name: "partName",
    label: "Part Name",
    type: "text",
    section: "basic",
    required: true, // Only partName is required
  },
  {
    name: "partNumber",
    label: "Part Number",
    type: "text",
    section: "basic",
    required: false,
  },
  {
    name: "hsnCode",
    label: "HSN Code",
    type: "text",
    section: "basic",
    required: false,
  },
  {
    name: "partCode",
    label: "Part Code",
    type: "text",
    section: "basic",
    placeholder: "Enter part code",
  },
  {
    name: "labourCode",
    label: "Labour Code",
    type: "text",
    section: "basic",
    placeholder: "Enter labour code",
  },
  {
    name: "category",
    label: "Category",
    type: "text",
    section: "basic",
  },
  {
    name: "quantity",
    label: "Quantity",
    type: "number",
    section: "basic",
    gridCols: 2,
  },
  {
    name: "price",
    label: "Price",
    type: "text",
    section: "basic",
    placeholder: "₹450",
    gridCols: 2,
  },
  {
    name: "minStockLevel",
    label: "Min Stock Level",
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
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    section: "basic",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    section: "basic",
    options: [
      { value: "In Stock", label: "In Stock" },
      { value: "Low Stock", label: "Low Stock" },
      { value: "Out of Stock", label: "Out of Stock" },
    ],
  },

  // Basic Part Info Section
  {
    name: "brandName",
    label: "Brand Name",
    type: "text",
    section: "basicPartInfo",
  },
  {
    name: "variant",
    label: "Variant",
    type: "text",
    section: "basicPartInfo",
  },
  {
    name: "partType",
    label: "Part Type",
    type: "select",
    section: "basicPartInfo",
    options: [
      { value: "NEW", label: "NEW" },
      { value: "OLD", label: "OLD" },
    ],
    gridCols: 2,
  },
  {
    name: "color",
    label: "Color",
    type: "text",
    section: "basicPartInfo",
    placeholder: "NA",
    gridCols: 2,
  },

  // Purchase (Incoming) Section
  {
    name: "preGstAmountToUs",
    label: "Pre GST Amount To Us",
    type: "number",
    section: "purchase",
    step: "0.01",
  },
  {
    name: "gstRateInput",
    label: "GST Rate (Input)",
    type: "number",
    section: "purchase",
    step: "0.01",
  },
  {
    name: "gstInputAmount",
    label: "GST Input Amount (auto-calculated)",
    type: "readonly",
    section: "purchase",
    autoCalculated: true,
    helperText: "Auto-calculated from Pre GST Amount and GST Rate",
  },
  {
    name: "postGstAmountToUs",
    label: "Post GST Amount To Us (auto-calculated)",
    type: "readonly",
    section: "purchase",
    autoCalculated: true,
    helperText: "Auto-calculated from Pre GST Amount and GST Input Amount",
  },

  // Sale (Outgoing) Section
  {
    name: "salePricePreGst",
    label: "Sale Price (Pre GST)",
    type: "number",
    section: "sale",
    step: "0.01",
  },
  {
    name: "gstRateOutput",
    label: "GST Rate",
    type: "number",
    section: "sale",
    step: "0.01",
  },
  {
    name: "gstOutputAmount",
    label: "GST Output Amount (auto-calculated)",
    type: "readonly",
    section: "sale",
    autoCalculated: true,
    helperText: "Auto-calculated from Sale Price and GST Rate",
  },
  {
    name: "postGstSaleAmount",
    label: "Post GST Sale Amount (auto-calculated)",
    type: "readonly",
    section: "sale",
    autoCalculated: true,
    helperText: "Auto-calculated from Sale Price and GST Output Amount",
  },

  // Labour Association Section
  {
    name: "associatedLabourName",
    label: "Associated Labour Name",
    type: "text",
    section: "labour",
    gridCols: 2,
  },
  {
    name: "associatedLabourCode",
    label: "Associated Labour Code",
    type: "text",
    section: "labour",
    gridCols: 2,
  },
  {
    name: "workTime",
    label: "Work Time (in Hours)",
    type: "number",
    section: "labour",
    step: "0.01",
    gridCols: 2,
  },
  {
    name: "labourRate",
    label: "Labour Rate",
    type: "number",
    section: "labour",
    step: "0.01",
    gridCols: 2,
  },
  {
    name: "labourGstRate",
    label: "Labour GST Rate",
    type: "number",
    section: "labour",
    step: "0.01",
  },
  {
    name: "labourGstAmount",
    label: "Labour GST Amount (auto-calculated)",
    type: "readonly",
    section: "labour",
    autoCalculated: true,
    helperText: "Auto-calculated from Labour Rate and Labour GST Rate",
  },
  {
    name: "labourPostGstAmount",
    label: "Labour Post GST Amount (auto-calculated)",
    type: "readonly",
    section: "labour",
    autoCalculated: true,
    helperText: "Auto-calculated from Labour Rate and Labour GST Amount",
  },

  // High Value Part Section
  {
    name: "highValuePart",
    label: "High Value Part",
    type: "checkbox",
    section: "highValue",
  },
  {
    name: "partSerialNumber",
    label: "Part Serial Number",
    type: "text",
    section: "highValue",
    required: false,
    conditional: {
      field: "highValuePart",
      value: true,
    },
  },
];

export const SECTION_LABELS: Record<FieldSection, string> = {
  basic: "Basic Information",
  serviceCenter: "Service Center",
  basicPartInfo: "Basic Part Info",
  purchase: "Purchase (Incoming – To Us)",
  sale: "Sale (Outgoing)",
  labour: "Labour Association",
  highValue: "High Value Part",
};

export const SECTION_ORDER: FieldSection[] = [
  "serviceCenter",
  "basic",
  "basicPartInfo",
  "purchase",
  "sale",
  "labour",
  "highValue",
];

/**
 * Get initial form data
 */
export function getInitialFormData(): PartsMasterFormData {
  return {
    partId: "",
    partName: "",
    partNumber: "",
    hsnCode: "",
    partCode: "",
    labourCode: "",
    category: "",
    quantity: "",
    price: "",
    status: "In Stock",
    description: "",
    minStockLevel: 0,
    unit: "piece",
    // Basic Part Info
    brandName: "",
    variant: "",
    partType: "NEW",
    color: "NA",
    // Purchase (Incoming)
    preGstAmountToUs: "",
    gstRateInput: "",
    gstInputAmount: "",
    postGstAmountToUs: "",
    // Sale (Outgoing)
    salePricePreGst: "",
    gstRateOutput: "",
    gstOutputAmount: "",
    postGstSaleAmount: "",
    // Labour Association
    associatedLabourName: "",
    associatedLabourCode: "",
    workTime: "",
    labourRate: "",
    labourGstRate: "",
    labourGstAmount: "",
    labourPostGstAmount: "",
    // High Value Part
    highValuePart: false,
    partSerialNumber: "",
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

