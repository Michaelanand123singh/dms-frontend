"use client";
import { InputHTMLAttributes, forwardRef } from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/Input";

export interface FormDatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormDatePicker = forwardRef<HTMLInputElement, FormDatePickerProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <Input
          ref={ref}
          type="date"
          label={label}
          error={error}
          helperText={helperText}
          className={className}
          {...props}
        />
      </div>
    );
  }
);

FormDatePicker.displayName = "FormDatePicker";

