/**
 * Hook for managing modal state
 */

import { useState, useCallback } from "react";

export interface UseModalStateReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Hook to manage modal open/close state
 * @param initialOpen - Initial open state (default: false)
 * @returns Modal state and control functions
 */
export function useModalState(initialOpen: boolean = false): UseModalStateReturn {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

