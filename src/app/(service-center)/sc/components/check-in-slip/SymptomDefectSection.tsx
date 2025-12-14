"use client";
import { FormTextarea, FormSelect } from "../shared";
import type { CheckInSlipFormData } from "@/shared/types/check-in-slip.types";
import type { DefectArea } from "@/shared/types/check-in-slip.types";

interface SymptomDefectSectionProps {
  formData: CheckInSlipFormData;
  onUpdate: (updates: Partial<CheckInSlipFormData>) => void;
}

const DEFECT_AREAS: { value: DefectArea; label: string }[] = [
  { value: "Chassis", label: "Chassis" },
  { value: "VCU / MCU", label: "VCU / MCU" },
  { value: "Motor", label: "Motor" },
  { value: "Battery", label: "Battery" },
  { value: "Charger", label: "Charger" },
  { value: "Electrical Component", label: "Electrical Component" },
  { value: "Wiring", label: "Wiring" },
  { value: "Suspension", label: "Suspension" },
  { value: "Speedometer", label: "Speedometer" },
  { value: "Braking System", label: "Braking System" },
  { value: "Other", label: "Other" },
];

const SYMPTOM_EXAMPLES = [
  "Heating",
  "Noise",
  "Doesn't work",
  "Intermittent working",
  "Water entry",
  "Insufficient performance",
  "Gradeability issues",
];

export function SymptomDefectSection({
  formData,
  onUpdate,
}: SymptomDefectSectionProps) {
  return (
    <div className="bg-red-50 p-5 rounded-xl border border-red-200">
      <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-red-600 rounded"></span>
        6. Symptom Section & 7. Defect Area
      </h4>
      <div className="space-y-4">
        {/* Symptom Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symptom Section (Problem Description)
          </label>
          <FormTextarea
            value={formData.symptom || ""}
            onChange={(e) => onUpdate({ symptom: e.target.value })}
            placeholder="Describe what the customer is experiencing..."
            rows={6}
          />
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Examples:</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_EXAMPLES.map((example) => (
                <span
                  key={example}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs cursor-pointer hover:bg-gray-200"
                  onClick={() => {
                    const currentSymptom = formData.symptom || "";
                    onUpdate({
                      symptom: currentSymptom
                        ? `${currentSymptom}, ${example}`
                        : example,
                    });
                  }}
                >
                  {example}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Defect Area */}
        <FormSelect
          label="Defect Area (System Classification)"
          value={formData.defectArea || ""}
          onChange={(e) => onUpdate({ defectArea: e.target.value as DefectArea })}
          placeholder="Select defect area"
          options={[
            { value: "", label: "Select defect area" },
            ...DEFECT_AREAS.map((area) => ({ value: area.value, label: area.label })),
          ]}
        />
      </div>
    </div>
  );
}

