"use client";

import { X } from "lucide-react";
import { InventoryPartForm, InventoryPartFormData } from "./InventoryPartForm";

interface InventoryPartFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: InventoryPartFormData;
  onFormChange: (data: InventoryPartFormData) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing?: boolean;
  showServiceCenter?: boolean;
  serviceCenters?: Array<{ id: number; name: string }>;
  submitButtonText?: string;
  submitButtonClass?: string;
  modalTitle?: string;
}

export function InventoryPartFormModal({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSubmit,
  isEditing = false,
  showServiceCenter = false,
  serviceCenters = [],
  submitButtonText,
  submitButtonClass,
  modalTitle,
}: InventoryPartFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {modalTitle || (isEditing ? "Edit Part" : "Add New Part")}
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <InventoryPartForm
          formData={formData}
          onFormChange={onFormChange}
          onSubmit={onSubmit}
          onClose={onClose}
          isEditing={isEditing}
          showServiceCenter={showServiceCenter}
          serviceCenters={serviceCenters}
          submitButtonText={submitButtonText}
          submitButtonClass={submitButtonClass}
        />
      </div>
    </div>
  );
}

export type { InventoryPartFormData } from "./InventoryPartForm";

