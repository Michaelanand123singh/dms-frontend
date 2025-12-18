"use client";
import { useAuthStore } from "@/store/authStore";
import type { UserRole, UserInfo } from "../types/auth.types";

/**
 * Hook to get current user role and info
 * Now uses Zustand store instead of direct localStorage management
 */
export function useRole() {
  const { userRole, userInfo, setAuth, isLoading } = useAuthStore();

  const updateRole = (role: UserRole, user: UserInfo) => {
    setAuth(role, user);
  };

  return {
    userRole,
    userInfo,
    updateRole,
    isLoading,
  };
}

