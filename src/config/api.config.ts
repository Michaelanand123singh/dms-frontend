/**
 * API configuration
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  TIMEOUT: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  // Default to mock mode if not explicitly set to "false"
  USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK_API !== "false",
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
  
  // Service Requests
  SERVICE_REQUESTS: "/service-requests",
  SERVICE_REQUEST: (id: string) => `/service-requests/${id}`,
  
  // Inventory
  INVENTORY: "/inventory",
  INVENTORY_ITEM: (id: string) => `/inventory/${id}`,
  
  // Invoices
  INVOICES: "/invoices",
  INVOICE: (id: string) => `/invoices/${id}`,
  
  // Appointments
  APPOINTMENTS: "/appointments",
  APPOINTMENT: (id: string) => `/appointments/${id}`,
  
  // Quotations
  QUOTATIONS: "/service-center/quotations",
  QUOTATION: (id: string) => `/service-center/quotations/${id}`,
  QUOTATION_PASS_TO_MANAGER: (id: string) => `/service-center/quotations/${id}/pass-to-manager`,
  QUOTATION_STATUS: (id: string) => `/service-center/quotations/${id}/status`,
  
  // Insurers
  INSURERS: "/insurers",
  INSURER: (id: string) => `/insurers/${id}`,
  
  // Notes Templates
  NOTES_TEMPLATES: "/notes-templates",
  NOTES_TEMPLATE: (id: string) => `/notes-templates/${id}`,
  
  // Leads
  LEADS: "/service-center/leads",
  LEAD: (id: string) => `/service-center/leads/${id}`,
  
  // Vehicle Photos
  VEHICLE_PHOTOS: "/service-center/vehicle-photos",
  VEHICLE_PHOTO: (id: string) => `/service-center/vehicle-photos/${id}`,
} as const;

