"use client";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "danger" | "warning" | "info" | "success";
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: ConfirmModalProps) {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <XCircle className="text-red-600" size={48} />;
      case "warning":
        return <AlertCircle className="text-yellow-600" size={48} />;
      case "success":
        return <CheckCircle className="text-green-600" size={48} />;
      case "info":
        return <Info className="text-blue-600" size={48} />;
      default:
        return <AlertCircle className="text-yellow-600" size={48} />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700";
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "info":
        return "bg-blue-600 hover:bg-blue-700";
      default:
        return "bg-indigo-600 hover:bg-indigo-700";
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        <div className="flex justify-center mb-4">{getIcon()}</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="outline"
            className="min-w-[100px]"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`${getConfirmButtonColor()} text-white min-w-[100px]`}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

