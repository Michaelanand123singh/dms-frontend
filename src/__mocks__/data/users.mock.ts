/**
 * Mock data for Users and Roles
 */

export interface User {
  initials: string;
  name: string;
  email: string;
  role: string;
  assigned: string;
  status: "Active" | "Inactive";
  serviceCenterIds?: string[];
  employeeId?: string;
}

/**
 * Default users for the users & roles page
 * In production, this would be fetched from an API
 */
export const defaultUsers: User[] = [
  {
    initials: "SM",
    name: "Service Center Manager",
    email: "service-manager@service.com",
    role: "sc_manager",
    assigned: "Delhi Central Hub",
    status: "Active",
    serviceCenterIds: ["sc-001"],
    employeeId: "user-001",
  },
  {
    initials: "IM",
    name: "Inventory Manager",
    email: "inventory@service.com",
    role: "inventory_manager",
    assigned: "Global Inventory",
    status: "Active",
    employeeId: "user-002",
  },
  {
    initials: "SA",
    name: "Service Advisor",
    email: "advisor@service.com",
    role: "service_advisor",
    assigned: "Delhi Central Hub",
    status: "Active",
    serviceCenterIds: ["sc-001"],
    employeeId: "user-003",
  },
  {
    initials: "ST",
    name: "Service Technician",
    email: "technician@service.com",
    role: "service_engineer",
    assigned: "SC001",
    status: "Active",
    serviceCenterIds: ["sc-001"],
    employeeId: "user-004",
  },
];

