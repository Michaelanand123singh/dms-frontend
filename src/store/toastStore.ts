import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
}

interface ToastState {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
    toasts: [],

    showToast: (message, type = 'info', duration = 3000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newToast: Toast = { id, message, type, duration };
        set((state) => ({ toasts: [...state.toasts, newToast] }));
    },

    showSuccess: (message, duration) => get().showToast(message, 'success', duration),
    showError: (message, duration) => get().showToast(message, 'error', duration),
    showWarning: (message, duration) => get().showToast(message, 'warning', duration),
    showInfo: (message, duration) => get().showToast(message, 'info', duration),

    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
    })),
}));
