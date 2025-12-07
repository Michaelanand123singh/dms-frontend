import type { UserRole } from '../types/auth.types';

/**
 * All available user roles
 */
export const USER_ROLES: UserRole[] = [
  "admin",
  "super_admin",
  "sc_manager",
  "service_engineer",
  "service_advisor",
  "call_center",
  "inventory_manager",
  "central_inventory_manager",
];

/**
 * Admin roles
 */
export const ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];

/**
 * Service Center roles
 */
export const SC_ROLES: UserRole[] = [
  "sc_manager",
  "service_engineer",
  "service_advisor",
  "call_center",
];

/**
 * Inventory Manager roles
 */
export const INVENTORY_ROLES: UserRole[] = ["inventory_manager"];

/**
 * Central Inventory Manager roles
 */
export const CENTRAL_INVENTORY_ROLES: UserRole[] = ["central_inventory_manager"];

/**
 * Role display names
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: "Admin",
  super_admin: "Super Admin",
  sc_manager: "SC Manager",
  service_engineer: "Service Engineer",
  service_advisor: "Service Advisor",
  call_center: "Call Center",
  inventory_manager: "Inventory Manager",
  central_inventory_manager: "Central Inventory Manager",
};

/**
 * Roles that can create new customers
 * SC Manager is explicitly excluded as they should not create customers
 */
export const ROLES_CAN_CREATE_CUSTOMER: UserRole[] = [
  "admin",
  "super_admin",
  "call_center",
  "service_advisor",
];

/**
 * Check if a role can create customers
 */
export function canCreateCustomer(role: UserRole): boolean {
  return ROLES_CAN_CREATE_CUSTOMER.includes(role);
}

/**
 * Roles that can create new appointments
 * SC Manager is explicitly excluded as they should not create appointments
 */
export const ROLES_CAN_CREATE_APPOINTMENT: UserRole[] = [
  "admin",
  "super_admin",
  "call_center",
  "service_advisor",
];

/**
 * Check if a role can create appointments
 */
export function canCreateAppointment(role: UserRole): boolean {
  return ROLES_CAN_CREATE_APPOINTMENT.includes(role);
}

/**
 * Roles that can edit customer information in appointments
 * SC Manager is explicitly excluded
 */
export const ROLES_CAN_EDIT_CUSTOMER_INFO: UserRole[] = [
  "admin",
  "super_admin",
  "call_center",
  "service_advisor",
];

/**
 * Check if a role can edit customer information
 */
export function canEditCustomerInfo(role: UserRole): boolean {
  return ROLES_CAN_EDIT_CUSTOMER_INFO.includes(role);
}

/**
 * Roles that can edit vehicle information in appointments
 * SC Manager is explicitly excluded
 */
export const ROLES_CAN_EDIT_VEHICLE_INFO: UserRole[] = [
  "admin",
  "super_admin",
  "call_center",
  "service_advisor",
];

/**
 * Check if a role can edit vehicle information
 */
export function canEditVehicleInfo(role: UserRole): boolean {
  return ROLES_CAN_EDIT_VEHICLE_INFO.includes(role);
}

/**
 * Roles that can edit service details in appointments
 * SC Manager CAN edit service details
 */
export const ROLES_CAN_EDIT_SERVICE_DETAILS: UserRole[] = [
  "admin",
  "super_admin",
  "call_center",
  "service_advisor",
  "sc_manager",
];

/**
 * Check if a role can edit service details
 */
export function canEditServiceDetails(role: UserRole): boolean {
  return ROLES_CAN_EDIT_SERVICE_DETAILS.includes(role);
}

/**
 * Roles that can edit documentation in appointments
 * SC Manager CAN edit documentation
 */
export const ROLES_CAN_EDIT_DOCUMENTATION: UserRole[] = [
  "admin",
  "super_admin",
  "call_center",
  "service_advisor",
  "sc_manager",
];

/**
 * Check if a role can edit documentation
 */
export function canEditDocumentation(role: UserRole): boolean {
  return ROLES_CAN_EDIT_DOCUMENTATION.includes(role);
}

/**
 * Roles that can edit operational details in appointments
 * SC Manager CAN edit operational details
 */
export const ROLES_CAN_EDIT_OPERATIONAL_DETAILS: UserRole[] = [
  "admin",
  "super_admin",
  "call_center",
  "service_advisor",
  "sc_manager",
];

/**
 * Check if a role can edit operational details
 */
export function canEditOperationalDetails(role: UserRole): boolean {
  return ROLES_CAN_EDIT_OPERATIONAL_DETAILS.includes(role);
}

/**
 * Roles that can edit billing and payment in appointments
 * SC Manager CAN edit billing and payment
 */
export const ROLES_CAN_EDIT_BILLING_PAYMENT: UserRole[] = [
  "admin",
  "super_admin",
  "service_advisor",
  "sc_manager",
];

/**
 * Check if a role can edit billing and payment
 */
export function canEditBillingPayment(role: UserRole): boolean {
  return ROLES_CAN_EDIT_BILLING_PAYMENT.includes(role);
}

/**
 * Roles that can edit post-service survey in appointments
 * SC Manager CAN edit post-service
 */
export const ROLES_CAN_EDIT_POST_SERVICE: UserRole[] = [
  "admin",
  "super_admin",
  "call_center",
  "service_advisor",
  "sc_manager",
  "service_engineer",
];

/**
 * Check if a role can edit post-service survey
 */
export function canEditPostService(role: UserRole): boolean {
  return ROLES_CAN_EDIT_POST_SERVICE.includes(role);
}

