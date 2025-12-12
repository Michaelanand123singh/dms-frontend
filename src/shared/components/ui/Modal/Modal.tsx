"use client";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../Button";

export interface ModalProps {
  isOpen?: boolean; // Optional for backward compatibility
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  maxWidth?: string; // For backward compatibility with old Modal API
  showCloseButton?: boolean;
  subtitle?: string; // For backward compatibility
}

export function Modal({
  isOpen = true, // Default to true for backward compatibility
  onClose,
  title,
  children,
  size = "md",
  maxWidth, // Support old maxWidth prop
  showCloseButton = true,
  subtitle,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Support both old maxWidth API and new size API
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  const widthClass = maxWidth || sizeClasses[size];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${widthClass} max-h-[90vh] overflow-y-auto`}>
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              {title && <h2 className="text-2xl font-bold text-gray-800">{title}</h2>}
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

