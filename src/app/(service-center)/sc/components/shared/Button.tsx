/**
 * Reusable Button component
 */

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

export const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  className = "",
  icon: Icon,
  ...props
}: ButtonProps) => {
  const baseClasses = "rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2";
  const variantClasses = {
    primary: "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800",
    secondary: "text-gray-700 hover:bg-gray-50",
    success: "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800",
    warning: "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800",
    danger: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800",
  };
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? "opacity-50 cursor-not-allowed disabled:active:scale-100" : ""} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === "sm" ? 16 : 18} strokeWidth={2} />}
      {children}
    </button>
  );
};

