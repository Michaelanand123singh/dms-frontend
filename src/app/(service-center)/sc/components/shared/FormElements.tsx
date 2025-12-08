"use client";
import React from "react";
import { X } from "lucide-react";

export const FormInput = ({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  readOnly,
  className = "",
  error,
  ...props
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  readOnly?: boolean;
  className?: string;
  error?: string;
  [key: string]: any;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      readOnly={readOnly}
      className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:outline-none text-gray-900 transition-all duration-200 ${
        error 
          ? "bg-red-50 border-2 border-red-300 focus:ring-red-500/20 focus:border-red-500" 
          : "focus:ring-indigo-500/20 border border-gray-200"
      } ${
        readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50/50 focus:bg-white"
      } ${className}`}
      {...props}
    />
    {error && (
      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
        <span className="text-red-500">•</span>
        {error}
      </p>
    )}
  </div>
);

export const FormSelect = ({
  label,
  required,
  value,
  onChange,
  options,
  placeholder,
  className = "",
  error,
  ...props
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  error?: string;
  [key: string]: any;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2.5 rounded-lg focus:bg-white focus:ring-2 focus:outline-none text-gray-900 transition-all duration-200 ${
        error 
          ? "bg-red-50 border-2 border-red-300 focus:ring-red-500/20 focus:border-red-500" 
          : "bg-gray-50/50 focus:ring-indigo-500/20 border border-gray-200"
      } ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
        <span className="text-red-500">•</span>
        {error}
      </p>
    )}
  </div>
);

export const Modal = ({
  title,
  onClose,
  children,
  subtitle,
  maxWidth = "max-w-4xl",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  subtitle?: string;
  maxWidth?: string;
}) => (
  <div
    className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999] p-4 pt-8"
    style={{ animation: "fadeIn 0.2s ease-out" }}
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}
  >
    <div
      className={`bg-white rounded-2xl shadow-xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto`}
      style={{ animation: "slideDownFromTop 0.3s ease-out" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
          title="Close"
        >
          <X size={24} strokeWidth={2} />
        </button>
      </div>
      {children}
    </div>
  </div>
);



