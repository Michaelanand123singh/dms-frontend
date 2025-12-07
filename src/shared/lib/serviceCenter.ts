import { safeStorage } from "@/shared/lib/localStorage";
import { defaultServiceCenters } from "@/__mocks__/data/service-centers.mock";

export interface ServiceCenterContext {
  serviceCenterId: string | number | null;
  serviceCenterName: string | null;
  userRole: string | null;
}

const DEFAULT_CENTER_MAP: Record<string, string> = {
  service_advisor: "1",
  sc_manager: "1",
  service_engineer: "1",
};

export const getServiceCenterContext = (): ServiceCenterContext => {
  const storedUserInfo = safeStorage.getItem<any>("userInfo", null);
  const storedUserRole = safeStorage.getItem<any>("userRole", null);
  const userRole = typeof storedUserRole === "string" ? storedUserRole : null;
  const explicitCenterId =
    typeof storedUserInfo?.serviceCenterId === "number"
      ? String(storedUserInfo.serviceCenterId)
      : typeof storedUserInfo?.serviceCenter === "number"
      ? String(storedUserInfo.serviceCenter)
      : defaultServiceCenters.find((center) => center.name === storedUserInfo?.serviceCenter)?.id
      ? String(
          defaultServiceCenters.find((center) => center.name === storedUserInfo?.serviceCenter)?.id
        )
      : null;
  const fallbackCenter =
    explicitCenterId || (userRole ? DEFAULT_CENTER_MAP[userRole] ?? null : null);

  return {
    serviceCenterId: fallbackCenter,
    serviceCenterName: storedUserInfo?.serviceCenter ?? null,
    userRole,
  };
};

export const shouldFilterByServiceCenter = (context: ServiceCenterContext): boolean => {
  return Boolean(context.userRole && context.userRole !== "call_center" && context.serviceCenterId);
};

export const filterByServiceCenter = <T extends { serviceCenterId?: number | string }>(
  items: T[],
  context: ServiceCenterContext
): T[] => {
  if (!shouldFilterByServiceCenter(context)) return items;
  
  const contextId = context.serviceCenterId;
  if (!contextId) return items;
  
  // Convert context ID to string for comparison
  const contextIdStr = String(contextId);
  
  return items.filter((item) => {
    if (item.serviceCenterId === null || item.serviceCenterId === undefined) return false;
    
    // Convert item ID to string for comparison
    const itemIdStr = String(item.serviceCenterId);
    
    // Direct string comparison
    if (itemIdStr === contextIdStr) return true;
    
    // Handle numeric comparison: if both can be parsed as numbers, compare them
    const itemNum = parseInt(itemIdStr, 10);
    const contextNum = parseInt(contextIdStr, 10);
    if (!isNaN(itemNum) && !isNaN(contextNum) && itemNum === contextNum) {
      return true;
    }
    
    return false;
  });
};

