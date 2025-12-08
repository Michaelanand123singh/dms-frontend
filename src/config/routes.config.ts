/**
 * Routes configuration
 */
import { ROUTES } from "@/shared/constants/routes";

export const ROUTE_CONFIG = {
  ...ROUTES,
  // Additional route configurations
  ADMIN: {
    DASHBOARD: ROUTES.ADMIN_DASHBOARD,
    SERVICE_CENTERS: "/servicecenters",
    USERS_AND_ROLES: "/user&roles",
    INVENTORY: "/inventory",
    FINANCE: "/finance",
    REPORTS: "/reports",
    COMPLAINTS: "/complaints",
    AUDIT_LOGS: "/audit-logs",
  },
  SERVICE_CENTER: {
    DASHBOARD: ROUTES.SC_DASHBOARD,
    VEHICLE_SEARCH: ROUTES.VEHICLE_SEARCH,
    SERVICE_REQUESTS: ROUTES.SERVICE_REQUESTS,
    JOB_CARDS: ROUTES.JOB_CARDS,
    WORKSHOP: "/sc/workshop",
    INVENTORY: ROUTES.INVENTORY,
    OTC_ORDERS: ROUTES.OTC_ORDERS,
    HOME_SERVICE: ROUTES.HOME_SERVICE,
    INVOICES: ROUTES.INVOICES,
    APPOINTMENTS: "/sc/appointments",
    TECHNICIANS: "/sc/technicians",
    COMPLAINTS: "/sc/complaints",
    REPORTS: "/sc/reports",
    APPROVALS: "/sc/approvals",
    SETTINGS: "/sc/settings",
    PARTS_REQUEST: "/sc/parts-request",
    LEADS: "/sc/leads",
    QUOTATIONS: "/sc/quotations",
  },
} as const;

