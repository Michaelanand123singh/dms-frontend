"use client";

import { Button } from "@/components/ui/Button";
import { CheckCircle, XCircle } from "lucide-react";
import type { ApprovalFormData } from "./form.schema";
import { LABEL_CLASSES, INPUT_CLASSES, TEXTAREA_CLASSES, createFormChangeHandler } from "../shared/form.utils";

interface ApprovalFormProps {
  formData: ApprovalFormData;
  onFormChange: (data: ApprovalFormData) => void;
  approvalType: "sc_manager" | "inventory_manager";
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export function ApprovalForm({
  formData,
  onFormChange,
  approvalType,
  onApprove,
  onReject,
  onCancel,
  isProcessing,
  disabled = false,
}: ApprovalFormProps) {
  const handleChange = createFormChangeHandler(formData, onFormChange);
  const isInventoryManager = approvalType === "inventory_manager";
  const canApprove = isInventoryManager
    ? formData.assignedEngineer?.trim()
    : true;

  return (
    <div className="border-t pt-4 mt-4">
      {isInventoryManager && (
        <div className="mb-4">
          <label className={`${LABEL_CLASSES} mb-2`}>
            Assign to Engineer *
          </label>
          <input
            type="text"
            value={formData.assignedEngineer || ""}
            onChange={(e) => handleChange("assignedEngineer", e.target.value)}
            placeholder="Enter engineer name"
            className={INPUT_CLASSES.replace("p-2", "p-3")}
            required
            disabled={disabled}
          />
        </div>
      )}

      <textarea
        value={formData.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        placeholder="Add notes (optional)..."
        className={TEXTAREA_CLASSES + " mb-4"}
        rows={3}
        disabled={disabled}
      />

      <div className="flex gap-3">
        <Button
          onClick={onApprove}
          disabled={isProcessing || !canApprove || disabled}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle size={16} className="mr-2" />
          {isInventoryManager
            ? "Approve & Assign Parts as Inventory Manager"
            : "Approve as SC Manager"}
        </Button>
        <Button
          onClick={onReject}
          disabled={isProcessing || disabled}
          variant="outline"
          className="border-red-500 text-red-600 hover:bg-red-50"
        >
          <XCircle size={16} className="mr-2" />
          Reject
        </Button>
        <Button onClick={onCancel} variant="outline" disabled={disabled}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

