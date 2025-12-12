"use client";
import { createContext, useContext, ReactNode } from "react";
import { useRole } from "@/shared/hooks";
import type { UserRole, UserInfo } from "@/shared/types";

interface AuthContextType {
  userRole: UserRole;
  userInfo: UserInfo | null;
  updateRole: (role: UserRole, user: UserInfo) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { userRole, userInfo, updateRole, isLoading } = useRole();

  const isAuthenticated = !!userInfo && userRole !== "admin";

  return (
    <AuthContext.Provider
      value={{
        userRole,
        userInfo,
        updateRole,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

