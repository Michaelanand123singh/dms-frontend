"use client";
import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export function ToastComponent({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle size={20} className="flex-shrink-0" />;
      case "error":
        return <XCircle size={20} className="flex-shrink-0" />;
      case "warning":
        return <AlertCircle size={20} className="flex-shrink-0" />;
      case "info":
        return <Info size={20} className="flex-shrink-0" />;
      default:
        return <Info size={20} className="flex-shrink-0" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-600";
      case "error":
        return "bg-red-600";
      case "warning":
        return "bg-yellow-600";
      case "info":
        return "bg-blue-600";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <div
      className={`${getBgColor()} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}
      style={{ animation: "fade-in-down 0.3s ease-out" }}
    >
      {getIcon()}
      <p className="font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}

