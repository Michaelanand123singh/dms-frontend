"use client";
import { useState, useEffect } from "react";

/**
 * Custom hook for localStorage with TypeScript support and reactivity
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Listen for storage changes to keep state in sync
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    // Also check localStorage on mount and when key changes
    const checkStorage = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          const parsed = JSON.parse(item);
          setStoredValue(parsed);
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Check immediately in case value was set in same window
    checkStorage();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch custom event for same-window updates
        window.dispatchEvent(new CustomEvent("localStorageChange", { detail: { key, value: valueToStore } }));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

