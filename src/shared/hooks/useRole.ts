"use client";
import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { UserRole, UserInfo } from "../types/auth.types";

/**
 * Hook to get current user role and info
 * Ensures role is read from localStorage and stays synchronized
 */
export function useRole() {
  const [userRole, setUserRole] = useLocalStorage<UserRole>("userRole", "admin");
  const [userInfo, setUserInfo] = useLocalStorage<UserInfo | null>("userInfo", null);
  const [isLoading] = useState(() => typeof window === "undefined");

  // Sync with localStorage on mount and when storage changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromStorage = () => {
      try {
        const storedRole = window.localStorage.getItem("userRole");
        if (storedRole) {
          const parsed = JSON.parse(storedRole);
          if (parsed !== userRole) {
            setUserRole(parsed);
          }
        }
      } catch (error) {
        console.error("Error syncing userRole from localStorage:", error);
      }
    };

    // Sync immediately
    syncFromStorage();

    // Listen for storage events (from other tabs/windows)
    window.addEventListener("storage", syncFromStorage);
    
    // Also listen for custom events (same-window updates)
    window.addEventListener("localStorageChange", syncFromStorage);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("localStorageChange", syncFromStorage);
    };
  }, [userRole, setUserRole]);

  const updateRole = (role: UserRole, user: UserInfo) => {
    setUserRole(role);
    setUserInfo(user);
  };

  return {
    userRole,
    userInfo,
    updateRole,
    isLoading,
  };
}

