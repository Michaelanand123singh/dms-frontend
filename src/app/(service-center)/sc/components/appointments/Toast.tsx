import { CheckCircle, AlertCircle } from "lucide-react";
import type { ToastType } from "../../appointments/types";
import { TOAST_DURATION } from "../../appointments/constants";

interface ToastProps {
  show: boolean;
  message: string;
  type: ToastType;
}

export function Toast({ show, message, type }: ToastProps) {
  if (!show) return null;

  return (
    <div
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[10000] transition-all duration-300"
      style={{ animation: "fadeInDown 0.3s ease-out" }}
    >
      <div
        className={`${type === "success" ? "bg-green-600" : "bg-red-600"
          } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}
      >
        {type === "success" ? (
          <CheckCircle size={20} className="flex-shrink-0" />
        ) : (
          <AlertCircle size={20} className="flex-shrink-0" />
        )}
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
}

