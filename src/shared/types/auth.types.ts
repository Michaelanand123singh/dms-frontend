/**
 * User roles in the system
 */
export type UserRole = 
  | "admin" 
  | "super_admin" 
  | "sc_manager" 
  | "service_engineer" 
  | "service_advisor" 
  | "call_center"
  | "inventory_manager"
  | "central_inventory_manager";

/**
 * User information interface
 */
export interface UserInfo {
  email: string;
  name: string;
  role: UserRole;
  initials: string;
  serviceCenter?: string | null;
  id?: string;
}

/**
 * Authentication context type
 */
export interface AuthContextType {
  userRole: UserRole;
  userInfo: UserInfo | null;
  updateRole: (role: UserRole, user: UserInfo) => void;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

