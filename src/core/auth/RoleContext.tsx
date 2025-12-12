"use client";
import { createContext, useContext, ReactNode } from "react";
import { useRole } from "@/shared/hooks";
import type { UserRole, UserInfo } from "@/shared/types";

interface RoleContextType {
  userRole: UserRole;
  userInfo: UserInfo | null;
  updateRole: (role: UserRole, user: UserInfo) => void;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const { userRole, userInfo, updateRole, isLoading } = useRole();

  return (
    <RoleContext.Provider value={{ userRole, userInfo, updateRole, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRoleContext() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRoleContext must be used within RoleProvider");
  }
  return context;
}

