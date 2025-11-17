"use client";
import { useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { UserRole, UserInfo } from "../types/auth.types";

/**
 * Hook to get current user role and info
 */
export function useRole() {
  const [userRole, setUserRole] = useLocalStorage<UserRole>("userRole", "admin");
  const [userInfo, setUserInfo] = useLocalStorage<UserInfo | null>("userInfo", null);
  const [isLoading] = useState(() => typeof window === "undefined");

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

