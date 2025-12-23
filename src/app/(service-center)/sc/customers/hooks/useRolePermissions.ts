/**
 * Hook for role-based permissions in customer  page
 */

import { useRole } from "@/shared/hooks";
import type { UserRole } from "@/shared/types";

/**
 * Hook to check role-based permissions for customer  features
 * @returns Object with permission flags
 */
export function useRolePermissions() {
  const { userRole } = useRole();
  const isCallCenter = userRole === "call_center";
  const isServiceAdvisor = userRole === "service_advisor";
  const isServiceManager = userRole === "sc_manager";
  const isTechnician = userRole === "service_engineer";
  const isInventoryManager = userRole === "inventory_manager";
  const isAdminRole = userRole === "admin";

  const hasRoleAccess = (roles: UserRole[]): boolean => {
    return isAdminRole || roles.includes(userRole);
  };

  return {
    userRole,
    isCallCenter,
    isServiceAdvisor,
    isServiceManager,
    isTechnician,
    isInventoryManager,
    isAdminRole,
    hasRoleAccess,
    // Specific permissions
    canAccessCustomerType: hasRoleAccess(["call_center", "service_advisor"]),
    canAccessServiceDetails: hasRoleAccess(["call_center", "service_advisor", "sc_manager", "service_engineer"]),
    canAccessEstimatedCost: hasRoleAccess(["service_advisor", "sc_manager"]),
    canAccessOdometer: hasRoleAccess(["service_advisor"]),
    hasDocUploadAccess: hasRoleAccess(["call_center", "service_advisor"]),
    hasDropoffMediaAccess: hasRoleAccess(["call_center", "service_advisor", "sc_manager"]),
    canAccessOperationalDetails: hasRoleAccess(["call_center", "service_advisor", "sc_manager"]),
    canAssignTechnician: hasRoleAccess(["service_advisor", "sc_manager", "service_engineer"]),
    canAccessPreferredCommunication: hasRoleAccess(["call_center", "service_advisor", "sc_manager"]),
    canAccessPostServiceSurvey: hasRoleAccess(["call_center", "service_advisor", "sc_manager", "service_engineer"]),
    canAccessAMCStatus: hasRoleAccess(["call_center", "service_advisor", "sc_manager"]),
    canAccessPickupAddress: hasRoleAccess(["call_center", "service_advisor"]),
    canAccessVehicleInfo: hasRoleAccess(["call_center", "service_advisor"]),
    canAccessBillingSection: hasRoleAccess(["service_advisor", "sc_manager"]),
    canAccessBusinessName: hasRoleAccess(["service_advisor", "sc_manager"]),
    canAccessServiceStatus: hasRoleAccess(["call_center", "service_advisor", "sc_manager", "service_engineer"]),
    canViewCostEstimation: hasRoleAccess(["service_advisor", "sc_manager"]) || isInventoryManager,
    canAssignServiceCenter: hasRoleAccess(["call_center", "service_advisor", "sc_manager"]),
  };
}

