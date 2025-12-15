"use client";

import { Input } from "@/components/ui/Input";
import type { PartsEntryFormData } from "./form.schema";
import { LABEL_CLASSES, createFormChangeHandler } from "../shared/form.utils";

interface PartsEntryFormProps {
  formData: PartsEntryFormData;
  onFormChange: (data: PartsEntryFormData) => void;
}

export function PartsEntryForm({ formData, onFormChange }: PartsEntryFormProps) {
  const handleChange = createFormChangeHandler(formData, onFormChange);

  return (
    <div className="space-y-4">
      <div>
        <label className={LABEL_CLASSES}>
          Invoice Number *
        </label>
        <Input
          value={formData.invoiceNumber}
          onChange={(e) => handleChange("invoiceNumber", e.target.value)}
          placeholder="Enter invoice number"
          required
        />
      </div>
      <div>
        <label className={LABEL_CLASSES}>
          Vendor *
        </label>
        <Input
          value={formData.vendor}
          onChange={(e) => handleChange("vendor", e.target.value)}
          placeholder="Enter vendor name"
          required
        />
      </div>
      <div>
        <label className={LABEL_CLASSES}>
          Entry Date *
        </label>
        <Input
          type="date"
          value={formData.entryDate}
          onChange={(e) => handleChange("entryDate", e.target.value)}
          required
        />
      </div>
    </div>
  );
}

