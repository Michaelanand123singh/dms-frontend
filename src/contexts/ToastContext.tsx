"use client";
import { createContext, useContext, ReactNode } from "react";
import { ToastContainer } from "@/components/ui/Toast";
import { useToastStore } from "@/store/toastStore";

const ToastContext = createContext<ReturnType<typeof useToastStore> | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const store = useToastStore();
  const { toasts, removeToast } = store;

  return (
    <ToastContext.Provider value={store}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const store = useToastStore();
  return store;
}
