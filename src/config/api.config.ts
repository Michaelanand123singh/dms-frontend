/**
 * API configuration
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  TIMEOUT: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  USE_MOCK: false, // Force disable usage of mock API
} as const;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",

  // Service Centers
  SERVICE_CENTERS: "/service-centers",
  SERVICE_CENTER: (id: string) => `/service-centers/${id}`,

  // Users
  USERS: "/users",
  USER: (id: string) => `/users/${id}`,

  // Customers
  CUSTOMERS: "/customers",
  CUSTOMER: (id: string) => `/customers/${id}`,
  CUSTOMER_SEARCH: "/customers/search",
  CUSTOMER_RECENT: "/customers/recent",

  // Vehicles
  VEHICLES: "/vehicles",
  VEHICLE: (id: string) => `/vehicles/${id}`,
  VEHICLE_SEARCH: "/vehicles/search",

  // Job Cards
  JOB_CARDS: "/job-cards",
  JOB_CARD: (id: string) => `/job-cards/${id}`,
  JOB_CARD_PASS_TO_MANAGER: (id: string) => `/job-cards/${id}/pass-to-manager`,
  JOB_CARD_MANAGER_REVIEW: (id: string) => `/job-cards/${id}/manager-review`,
  JOB_CARD_CONVERT_TO_ACTUAL: (id: string) => `/job-cards/${id}/convert-to-actual`,



  // Inventory
  INVENTORY: "/inventory",
  INVENTORY_ITEM: (id: string) => `/inventory/${id}`,
  PARTS_ISSUES: "/parts-issues",

  // Invoices
  INVOICES: "/invoices",
  INVOICE: (id: string) => `/invoices/${id}`,

  // Appointments
  APPOINTMENTS: "/appointments",
  APPOINTMENT: (id: string) => `/appointments/${id}`,

  // Quotations (Fixed to match Backend)
  QUOTATIONS: "/quotations",
  QUOTATION: (id: string) => `/quotations/${id}`,
  QUOTATION_PASS_TO_MANAGER: (id: string) => `/quotations/${id}/pass-to-manager`,
  QUOTATION_STATUS: (id: string) => `/quotations/${id}/status`,

  // Files
  FILES_UPLOAD: "/files/upload",
  FILES: "/files",





  // Leads (NOT IMPLEMENTED IN BACKEND)
  LEADS: "/service-center/leads",
  LEAD: (id: string) => `/service-center/leads/${id}`,


} as const;

