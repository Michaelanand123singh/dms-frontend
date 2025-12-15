"use client";

import { Input } from "@/components/ui/Input";
import type { Part } from "@/shared/types/inventory.types";
import type { PartsOrderEntryFormData } from "./form.schema";
import { LABEL_CLASSES, INPUT_CLASSES, TEXTAREA_CLASSES, createFormChangeHandler } from "../shared/form.utils";

interface PartsOrderEntryFormProps {
  formData: PartsOrderEntryFormData;
  onFormChange: (data: PartsOrderEntryFormData) => void;
  availableParts: Part[];
  selectedPart: Part | null;
  onPartSelect: (partId: string) => void;
}

export function PartsOrderEntryForm({
  formData,
  onFormChange,
  availableParts,
  selectedPart,
  onPartSelect,
}: PartsOrderEntryFormProps) {
  const handleChange = createFormChangeHandler(formData, onFormChange);

  return (
    <div className="space-y-4">
      <div>
        <label className={LABEL_CLASSES}>
          Select Part *
        </label>
        <select
          value={formData.partId}
          onChange={(e) => {
            handleChange("partId", e.target.value);
            onPartSelect(e.target.value);
          }}
          className={INPUT_CLASSES}
          required
        >
          <option value="">Select a part</option>
          {availableParts.map((part) => (
            <option key={part.id} value={part.id}>
              {part.partName} ({part.partId}) - Stock: {part.stockQuantity}
            </option>
          ))}
        </select>
      </div>

      {selectedPart && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-900">{selectedPart.partName}</p>
          <p className="text-sm text-gray-600">
            Part Number: {selectedPart.partNumber} | Current Stock: {selectedPart.stockQuantity} {selectedPart.unit}
          </p>
        </div>
      )}

      <div>
        <label className={LABEL_CLASSES}>
          Required Quantity *
        </label>
        <Input
          type="number"
          value={formData.requiredQty}
          onChange={(e) => handleChange("requiredQty", parseInt(e.target.value) || 0)}
          min="1"
          required
        />
      </div>

      <div>
        <label className={LABEL_CLASSES}>
          Urgency *
        </label>
        <select
          value={formData.urgency}
          onChange={(e) => handleChange("urgency", e.target.value as "low" | "medium" | "high")}
          className={INPUT_CLASSES}
          required
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className={LABEL_CLASSES}>
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          className={TEXTAREA_CLASSES}
          rows={3}
          placeholder="Additional notes..."
        />
      </div>
    </div>
  );
}

