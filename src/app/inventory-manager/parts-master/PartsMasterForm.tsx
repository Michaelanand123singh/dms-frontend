"use client";

import { useEffect, useMemo } from "react";
import { Save, Plus } from "lucide-react";
import {
  SECTION_LABELS,
  SECTION_ORDER,
  getFieldsGroupedBySection,
  type FormFieldDefinition,
  type PartsMasterFormData,
} from "./form.schema";

interface ServiceCenter {
  id: number;
  name: string;
}

interface PartsMasterFormProps {
  formData: PartsMasterFormData;
  onFormChange: (data: PartsMasterFormData) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing?: boolean;
  showServiceCenter?: boolean;
  serviceCenters?: ServiceCenter[];
  submitButtonText?: string;
  submitButtonClass?: string;
}

export function PartsMasterForm({
  formData,
  onFormChange,
  onSubmit,
  isEditing = false,
  showServiceCenter = false,
  serviceCenters = [],
  submitButtonText,
  submitButtonClass = "w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition text-sm sm:text-base mt-4",
}: PartsMasterFormProps) {
  // Calculate GST amounts and totals when base amounts or rates change
  useEffect(() => {
    // Calculate Purchase GST
    const purchasePrice = parseFloat(formData.purchasePrice) || 0;
    const gstRateInput = parseFloat(formData.gstRateInput) || 0;
    const gstAmount = (purchasePrice * gstRateInput) / 100;
    const gstInput = gstAmount; // GST Input is the GST on purchase

    // Calculate Sale GST Output
    const pricePreGst = parseFloat(formData.pricePreGst) || 0;
    const gstRateOutput = parseFloat(formData.gstRateOutput) || 0;
    const gstOutputAmount = (pricePreGst * gstRateOutput) / 100;

    // Calculate Labour GST and Price
    const labourRate = parseFloat(formData.labourRate) || 0;
    const labourGstRate = parseFloat(formData.labourGstRate) || 0;
    const labourGstAmount = (labourRate * labourGstRate) / 100;
    const labourPrice = labourRate + labourGstAmount;

    // Calculate Totals
    const totalPrice = pricePreGst + labourPrice;
    const totalGst = gstInput + gstOutputAmount + labourGstAmount;

    // Only update if values have changed to avoid infinite loops
    if (
      formData.gstAmount !== gstAmount.toFixed(2) ||
      formData.gstInput !== gstInput.toFixed(2) ||
      formData.labourPrice !== labourPrice.toFixed(2) ||
      formData.totalPrice !== totalPrice.toFixed(2) ||
      formData.totalGst !== totalGst.toFixed(2)
    ) {
      onFormChange({
        ...formData,
        gstAmount: gstAmount.toFixed(2),
        gstInput: gstInput.toFixed(2),
        labourPrice: labourPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
        totalGst: totalGst.toFixed(2),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.purchasePrice,
    formData.gstRateInput,
    formData.pricePreGst,
    formData.gstRateOutput,
    formData.labourRate,
    formData.labourGstRate,
  ]);

  const handleChange = (field: keyof PartsMasterFormData, value: any) => {
    onFormChange({
      ...formData,
      [field]: value,
    });
  };

  // Helper function to check if field is required
  const isFieldRequired = (field: FormFieldDefinition): boolean => {
    if (field.conditional) {
      return field.conditional.value === true && field.required !== false;
    }
    return field.required ?? false;
  };

  // Helper function to render field label
  const renderFieldLabel = (field: FormFieldDefinition) => {
    if (field.type === "checkbox") return null;
    
    const isRequired = isFieldRequired(field);
    const showRequired = field.conditional
      ? formData[field.conditional.field] === field.conditional.value && isRequired
      : isRequired;

    return (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {showRequired && " *"}
      </label>
    );
  };

  // Helper function to check if field should be visible
  const isFieldVisible = (field: FormFieldDefinition): boolean => {
    // Skip conditional fields that shouldn't be visible
    if (
      field.conditional &&
      formData[field.conditional.field] !== field.conditional.value
    ) {
      return false;
    }

    // Skip partNumber if not provided
    if (field.name === "partNumber" && formData.partNumber === undefined) {
      return false;
    }

    // Skip optional fields that are undefined
    if (
      (field.name === "minStock" || field.name === "unit" || field.name === "description") &&
      formData[field.name] === undefined
    ) {
      return false;
    }

    return true;
  };

  // Render a single form field based on its definition
  const renderField = (field: FormFieldDefinition) => {
    const value = formData[field.name];
    const isRequired = isFieldRequired(field);

    const baseInputClasses =
      "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm";
    const readonlyInputClasses = `${baseInputClasses} bg-gray-50 text-gray-600`;

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseInputClasses}
            placeholder={field.placeholder}
            required={isRequired}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value as string | number}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseInputClasses}
            step={field.step}
            min={field.min}
            max={field.max}
            required={isRequired}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseInputClasses}
            rows={3}
            required={isRequired}
          />
        );

      case "select":
        if (field.name === "centerId") {
          return (
            <select
              value={(value as string) || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={baseInputClasses}
              required={isRequired}
            >
              <option value="">Select Service Center</option>
              {serviceCenters.map((center) => (
                <option key={center.id} value={String(center.id)}>
                  {center.name}
                </option>
              ))}
            </select>
          );
        }
        return (
          <select
            value={value as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseInputClasses}
            required={isRequired}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {field.label}
            </span>
          </label>
        );

      case "readonly":
        return (
          <input
            type="text"
            value={value as string}
            readOnly
            className={readonlyInputClasses}
          />
        );

      default:
        return null;
    }
  };

  // Render a single field wrapper (label + field + helper text)
  const renderFieldWrapper = (field: FormFieldDefinition) => (
    <div key={field.name}>
      {renderFieldLabel(field)}
      {renderField(field)}
      {field.helperText && (
        <p className="text-xs text-gray-500 mt-1">{field.helperText}</p>
      )}
    </div>
  );

  // Get fields grouped by section
  const fieldsBySection = useMemo(
    () => getFieldsGroupedBySection(showServiceCenter),
    [showServiceCenter]
  );

  // Render a section of fields
  const renderSection = (section: string, fields: FormFieldDefinition[]) => {
    if (fields.length === 0) return null;

    const sectionLabel = SECTION_LABELS[section as keyof typeof SECTION_LABELS];
    const isFirstSection = SECTION_ORDER[0] === section;

    // Filter visible fields
    const visibleFields = fields.filter(isFieldVisible);

    // Group fields for grid layout
    const renderFields = () => {
      const elements: React.ReactNode[] = [];
      let currentGridGroup: FormFieldDefinition[] = [];

      const flushGridGroup = () => {
        if (currentGridGroup.length > 0) {
          elements.push(
            <div key={`grid-${currentGridGroup[0].name}`} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentGridGroup.map(renderFieldWrapper)}
            </div>
          );
          currentGridGroup = [];
        }
      };

      visibleFields.forEach((field) => {
        if (field.gridCols === 2) {
          currentGridGroup.push(field);
        } else {
          flushGridGroup();
          elements.push(renderFieldWrapper(field));
        }
      });

      flushGridGroup();
      return elements;
    };

    return (
      <div
        key={section}
        className={isFirstSection ? "" : "border-t border-gray-200 pt-4 mt-4"}
      >
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {sectionLabel}
        </h3>
        <div className="space-y-4">{renderFields()}</div>
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-4">
      {SECTION_ORDER.map((section) =>
        renderSection(section, fieldsBySection[section])
      )}

      <button type="submit" className={submitButtonClass}>
        {isEditing ? (
          <>
            <Save size={20} />
            {submitButtonText || "Update Part"}
          </>
        ) : (
          <>
            <Plus size={20} />
            {submitButtonText || "Add Part"}
          </>
        )}
      </button>
    </form>
  );
}

