import type { UserRole } from '../types/auth.types';

/**
 * Route paths
 */
export const ROUTES = {
  LOGIN: "/",
  ADMIN_DASHBOARD: "/dashboard",
  SC_DASHBOARD: "/sc/dashboard",
  INVENTORY_MANAGER_DASHBOARD: "/inventory-manager/dashboard",
  VEHICLE_SEARCH: "/sc/vehicle-search",
  SERVICE_REQUESTS: "/sc/service-requests",
  JOB_CARDS: "/sc/job-cards",
  WORKSHOP: "/sc/workshop",
  INVENTORY: "/sc/inventory",
  OTC_ORDERS: "/sc/otc-orders",
  HOME_SERVICE: "/sc/home-service",
  INVOICES: "/sc/invoices",
  // Inventory Manager routes
  PARTS_MASTER: "/inventory-manager/parts-master",
  PARTS_STOCK_UPDATE: "/inventory-manager/parts-stock-update",
  PARTS_ENTRY: "/inventory-manager/parts-entry",
  PARTS_ORDER_ENTRY: "/inventory-manager/parts-order-entry",
  PARTS_ORDER_VIEW: "/inventory-manager/parts-order-view",
  // Central Inventory Manager routes
  CENTRAL_INVENTORY_DASHBOARD: "/central-inventory/dashboard",
  CENTRAL_INVENTORY_PURCHASE_ORDERS: "/central-inventory/purchase-orders",
  CENTRAL_INVENTORY_PURCHASE_ORDER_DETAIL: "/central-inventory/purchase-orders/[id]",
  CENTRAL_INVENTORY_STOCK: "/central-inventory/stock",
  CENTRAL_INVENTORY_STOCK_UPDATE: "/central-inventory/stock/update",
  CENTRAL_INVENTORY_STOCK_ISSUE: "/central-inventory/stock/issue/[serviceCenterId]",
} as const;

/**
 * Get redirect path based on role
 */
export function getRedirectPath(role: UserRole): string {
  const rolePaths: Record<UserRole, string> = {
    admin: ROUTES.ADMIN_DASHBOARD,
    super_admin: ROUTES.ADMIN_DASHBOARD,
    sc_manager: ROUTES.SC_DASHBOARD,
    service_engineer: ROUTES.SC_DASHBOARD,
    service_advisor: ROUTES.SC_DASHBOARD,
    call_center: ROUTES.SC_DASHBOARD,
    inventory_manager: ROUTES.INVENTORY_MANAGER_DASHBOARD,
    central_inventory_manager: ROUTES.CENTRAL_INVENTORY_DASHBOARD,
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
    "service_engineer",
    "service_advisor",
    "call_center",
  ];
  
  if (scRoles.includes(role)) {
    return path.startsWith("/sc");
  }

  // Inventory manager can only access inventory manager routes
  if (role === "inventory_manager") {
    return path.startsWith("/inventory-manager");
  }

  // Central inventory manager can only access central inventory routes
  if (role === "central_inventory_manager") {
    return path.startsWith("/central-inventory");
  }

  return false;
}

