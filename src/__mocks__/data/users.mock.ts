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
}

/**
 * Default users for the users & roles page
 * In production, this would be fetched from an API
 */
export const defaultUsers: User[] = [
  {
    initials: "RKS",
    name: "Rajesh Kumar Singh",
    email: "admin@service.com",
    role: "Super Admin",
    assigned: "SC001,SC002,SC003,SC004",
    status: "Active",
  },
  {
    initials: "DM",
    name: "Delhi Manager",
    email: "delhi@service.com",
    role: "SC Manager",
    assigned: "SC001",
    status: "Active",
  },
  {
    initials: "FM",
    name: "Finance Manager",
    email: "finance@service.com",
    role: "Finance Manager",
    assigned: "SC002,SC003",
    status: "Inactive",
  },
  {
    initials: "CCT",
    name: "Call Center Team",
    email: "callcenter@service.com",
    role: "Call Center",
    assigned: "SC002",
    status: "Active",
  },
];

