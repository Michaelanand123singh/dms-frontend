import type { UserRole } from '../types/auth.types';

/**
 * Route paths
 */
export const ROUTES = {
  LOGIN: "/",
  ADMIN_DASHBOARD: "/dashboard",
  SC_DASHBOARD: "/sc/dashboard",
  VEHICLE_SEARCH: "/sc/vehicle-search",
  SERVICE_REQUESTS: "/sc/service-requests",
  JOB_CARDS: "/sc/job-cards",
  ADVISOR_JOB_CARDS: "/sc/advisor-job-cards",
  WORKSHOP: "/sc/workshop",
  INVENTORY: "/sc/inventory",
  OTC_ORDERS: "/sc/otc-orders",
  HOME_SERVICE: "/sc/home-service",
  INVOICES: "/sc/invoices",
} as const;

/**
 * Get redirect path based on role
 */
export function getRedirectPath(role: UserRole): string {
  const rolePaths: Record<UserRole, string> = {
    admin: ROUTES.ADMIN_DASHBOARD,
    super_admin: ROUTES.ADMIN_DASHBOARD,
    sc_manager: ROUTES.SC_DASHBOARD,
    sc_staff: ROUTES.SC_DASHBOARD,
    service_engineer: ROUTES.SC_DASHBOARD,
    service_advisor: ROUTES.SC_DASHBOARD,
    call_center: ROUTES.SC_DASHBOARD,
  };

  return rolePaths[role] || ROUTES.ADMIN_DASHBOARD;
}

/**
 * Check if user has access to a route
 */
export function hasAccess(role: UserRole, path: string): boolean {
  // Admin has access to everything
  if (role === "admin" || role === "super_admin") {
    return true;
  }

  // Service center roles can only access SC routes
  const scRoles: UserRole[] = [
    "sc_manager",
    "sc_staff",
    "service_engineer",
    "service_advisor",
    "call_center",
  ];
  
  if (scRoles.includes(role)) {
    return path.startsWith("/sc");
  }

  return false;
}

