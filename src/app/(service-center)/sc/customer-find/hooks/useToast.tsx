/**
 * Hook for toast notifications
 */

import { useState, useCallback } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import React from "react";

export type ToastType = "success" | "error";

export interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

export interface UseToastReturn {
  toast: ToastState;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  ToastComponent: React.FC;
}

/**
 * Hook to manage toast notifications
 * @param duration - Toast display duration in milliseconds (default: 3000)
 * @returns Toast state, control functions, and Toast component
 */
export function useToast(duration: number = 3000): UseToastReturn {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, duration);
  }, [duration]);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: "", type: "success" });
  }, []);

  const ToastComponent: React.FC = () => {
    if (!toast.show) return null;

    return (
      <div
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[10000] transition-all duration-300"
        style={{
          animation: "fadeInDown 0.3s ease-out",
        }}
      >
        <div
          className={`${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={20} className="shrink-0" />
          ) : (
            <AlertCircle size={20} className="shrink-0" />
          )}
          <p className="font-medium">{toast.message}</p>
        </div>
      </div>
    );
  };

  return {
    toast,
    showToast,
    hideToast,
    ToastComponent,
  };
}

