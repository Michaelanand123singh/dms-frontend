"use client";
import { FormSelect, FormTextarea } from "../shared";
import type { CheckInSlipFormData } from "@/shared/types/check-in-slip.types";

interface MirrorLooseItemsSectionProps {
  formData: CheckInSlipFormData;
  onUpdate: (updates: Partial<CheckInSlipFormData>) => void;
}

export function MirrorLooseItemsSection({
  formData,
  onUpdate,
}: MirrorLooseItemsSectionProps) {
  return (
    <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
      <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-purple-600 rounded"></span>
        3. Mirror & Loose Items Check
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Mirror RH (Right Hand)"
          value={formData.mirrorRH || ""}
          onChange={(e) => onUpdate({ mirrorRH: e.target.value as any })}
          placeholder="Select condition"
          options={[
            { value: "", label: "Select condition" },
            { value: "Good", label: "Good" },
            { value: "Damaged", label: "Damaged" },
            { value: "Missing", label: "Missing" },
            { value: "N/A", label: "N/A" },
          ]}
        />
        <FormSelect
          label="Mirror LH (Left Hand)"
          value={formData.mirrorLH || ""}
          onChange={(e) => onUpdate({ mirrorLH: e.target.value as any })}
          placeholder="Select condition"
          options={[
            { value: "", label: "Select condition" },
            { value: "Good", label: "Good" },
            { value: "Damaged", label: "Damaged" },
            { value: "Missing", label: "Missing" },
            { value: "N/A", label: "N/A" },
          ]}
        />
      </div>
      <div className="mt-4">
        <FormTextarea
          label="Other Parts or Things in Vehicle"
          value={formData.otherPartsInVehicle || ""}
          onChange={(e) => onUpdate({ otherPartsInVehicle: e.target.value })}
          placeholder="Describe any loose items or other parts in the vehicle"
          rows={3}
        />
      </div>
    </div>
  );
}

