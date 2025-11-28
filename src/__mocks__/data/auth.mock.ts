/**
 * Mock data for Authentication and User Login
 */

import type { UserRole } from "@/shared/types";

export interface MockUser {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  initials: string;
  serviceCenter: string | null;
}

/**
 * Mock users for login authentication
 * In production, this would be fetched from an API
 */
export const mockUsers: MockUser[] = [
  {
    email: "admin@service.com",
    password: "admin123",
    role: "admin",
    name: "Rajesh Kumar Singh",
    initials: "RKS",
    serviceCenter: null,
  },
  {
    email: "scmanager@service.com",
    password: "sc123",
    role: "sc_manager",
    name: "SC Manager",
    initials: "SCM",
    serviceCenter: "Pune Phase 1",
  },
  {
    email: "scstaff@service.com",
    password: "staff123",
    role: "sc_staff",
    name: "SC Staff",
    initials: "SCS",
    serviceCenter: "Pune Phase 1",
  },
  {
    email: "engineer@service.com",
    password: "eng123",
    role: "service_engineer",
    name: "Service Engineer",
    initials: "SE",
    serviceCenter: "Pune Phase 1",
  },
  {
    email: "advisor@service.com",
    password: "adv123",
    role: "service_advisor",
    name: "Service Advisor",
    initials: "SA",
    serviceCenter: "Pune Phase 1",
  },
  {
    email: "callcenter@service.com",
    password: "cc123",
    role: "call_center",
    name: "Call Center Staff",
    initials: "CC",
    serviceCenter: null, // Call center can assign to any service center
  },
];

/**
 * Get demo credentials for display purposes
 */
export const getDemoCredentials = () => {
  return mockUsers.map((user) => ({
    role: user.role,
    label: user.name,
    email: user.email,
    password: user.password,
  }));
};

