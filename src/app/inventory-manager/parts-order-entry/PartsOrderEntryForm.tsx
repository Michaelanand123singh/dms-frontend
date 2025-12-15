"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, X, Package } from "lucide-react";
import type { Part } from "@/shared/types/inventory.types";
import type { PartsOrderEntryFormData, PartsOrderItem } from "./form.schema";
import { LABEL_CLASSES, INPUT_CLASSES, TEXTAREA_CLASSES, createFormChangeHandler } from "../shared/form.utils";

interface PartsOrderEntryFormProps {
  formData: PartsOrderEntryFormData;
  onFormChange: (data: PartsOrderEntryFormData) => void;
  availableParts: Part[];
  selectedPart: Part | null;
  onPartSelect: (partId: string) => void;
  currentItem: PartsOrderItem;
  onCurrentItemChange: (item: PartsOrderItem) => void;
  onAddPart: () => void;
  onRemovePart: (index: number) => void;
}

export function PartsOrderEntryForm({
  formData,
  onFormChange,
  availableParts,
  selectedPart,
  onPartSelect,
  currentItem,
  onCurrentItemChange,
  onAddPart,
  onRemovePart,
}: PartsOrderEntryFormProps) {
  const handleChange = createFormChangeHandler(formData, onFormChange);

  const handleItemChange = (field: keyof PartsOrderItem, value: any) => {
    onCurrentItemChange({
      ...currentItem,
      [field]: value,
    });
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <Badge variant="danger">High</Badge>;
      case "medium":
        return <Badge variant="warning">Medium</Badge>;
      case "low":
        return <Badge variant="info">Low</Badge>;
      default:
        return <Badge>{urgency}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Part Section */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Part to Order</h3>
        <div className="space-y-4">
          <div>
            <label className={LABEL_CLASSES}>
              Select Part *
            </label>
            <select
              value={currentItem.partId}
              onChange={(e) => {
                const part = availableParts.find((p) => p.id === e.target.value);
                handleItemChange("partId", e.target.value);
                handleItemChange("partName", part?.partName || "");
                onPartSelect(e.target.value);
              }}
              className={INPUT_CLASSES}
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
            <div className="p-4 bg-white rounded-lg border border-gray-200">
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
              value={currentItem.requiredQty || ""}
              onChange={(e) => handleItemChange("requiredQty", parseInt(e.target.value) || 0)}
              min="1"
            />
          </div>

          <div>
            <label className={LABEL_CLASSES}>
              Urgency *
            </label>
            <select
              value={currentItem.urgency}
              onChange={(e) => handleItemChange("urgency", e.target.value as "low" | "medium" | "high")}
              className={INPUT_CLASSES}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASSES}>
              Notes (Optional)
            </label>
            <textarea
              value={currentItem.notes || ""}
              onChange={(e) => handleItemChange("notes", e.target.value)}
              className={TEXTAREA_CLASSES}
              rows={2}
              placeholder="Part-specific notes..."
            />
          </div>

          <Button
            type="button"
            onClick={onAddPart}
            disabled={!currentItem.partId || !currentItem.partName || !currentItem.requiredQty || currentItem.requiredQty <= 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus size={18} className="mr-2" />
            Add Part to Order
          </Button>
        </div>
      </div>

      {/* Added Parts List */}
      {formData.items.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Parts in Order ({formData.items.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {formData.items.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="text-indigo-600" size={18} />
                    <p className="font-semibold text-gray-900">{item.partName}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Part ID:</span>
                      <span className="ml-1 font-medium text-gray-900">{item.partId}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Quantity:</span>
                      <span className="ml-1 font-medium text-gray-900">{item.requiredQty}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Urgency:</span>
                      <span className="ml-1">{getUrgencyBadge(item.urgency)}</span>
                    </div>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-gray-500 mt-2">Notes: {item.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => onRemovePart(index)}
                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition ml-4"
                  title="Remove part"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Notes */}
      <div>
        <label className={LABEL_CLASSES}>
          Order Notes (Optional)
        </label>
        <textarea
          value={formData.orderNotes || ""}
          onChange={(e) => handleChange("orderNotes", e.target.value)}
          className={TEXTAREA_CLASSES}
          rows={3}
          placeholder="General notes for this purchase order..."
        />
      </div>
    </div>
  );
}
