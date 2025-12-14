"use client";
import { FormInput } from "../shared";
import type { CheckInSlipFormData } from "@/shared/types/check-in-slip.types";

interface WarrantyDefectSectionProps {
  formData: CheckInSlipFormData;
  onUpdate: (updates: Partial<CheckInSlipFormData>) => void;
  registrationNumber?: string;
}

export function WarrantyDefectSection({
  formData,
  onUpdate,
  registrationNumber,
}: WarrantyDefectSectionProps) {
  return (
    <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200">
      <h4 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-indigo-600 rounded"></span>
        5. Warranty Tag & Core Vehicle IDs
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Warranty Tag"
          value={formData.warrantyTag || ""}
          onChange={(e) => onUpdate({ warrantyTag: e.target.value })}
          placeholder="Enter warranty identification"
        />
        <FormInput
          label="Vehicle Serial Number"
          value={formData.vehicleSerialNumber || ""}
          onChange={(e) => onUpdate({ vehicleSerialNumber: e.target.value })}
          placeholder="Enter internal serial number"
        />
        <FormInput
          label="Vehicle Registration Number"
          value={formData.vehicleSerialNumber || registrationNumber || ""}
          onChange={(e) => onUpdate({ vehicleSerialNumber: e.target.value })}
          placeholder="Reconfirm registration number"
          readOnly={!!registrationNumber}
        />
        <FormInput
          label="Defect Part Number"
          value={formData.defectPartNumber || ""}
          onChange={(e) => onUpdate({ defectPartNumber: e.target.value })}
          placeholder="As per part catalog"
        />
        <FormInput
          label="Defect Description"
          value={formData.defectDescription || ""}
          onChange={(e) => onUpdate({ defectDescription: e.target.value })}
          placeholder="Short numeric code"
        />
        <FormInput
          label="Observation (Numeric Only)"
          value={formData.observation || ""}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            onUpdate({ observation: value });
          }}
          placeholder="Numeric only"
        />
      </div>
    </div>
  );
}


