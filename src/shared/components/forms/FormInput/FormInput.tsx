"use client";
import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, helperText, className, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    className={clsx(
                        "w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:outline-none text-gray-900 transition-all duration-200",
                        error
                            ? "bg-red-50 border-2 border-red-300 focus:ring-red-500/20 focus:border-red-500"
                            : "focus:ring-indigo-500/20 border border-gray-200",
                        props.readOnly
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-gray-50/50 focus:bg-white",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <span className="text-red-500">•</span>
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

FormInput.displayName = "FormInput";
