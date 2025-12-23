/**
 * Search utilities for customer page
 */

import type { CustomerSearchType } from "@/shared/types";

/**
 * Auto-detect search type based on input query
 * @param query - Search query string
 * @returns Detected search type
 */
export function detectSearchType(query: string): CustomerSearchType {
  const trimmed = query.trim();

  // Check for customer number pattern (CUST-YYYY-XXXX) - allow partial matches
  if (/^CUST-/i.test(trimmed)) {
    return "customerNumber";
  }

  // Check for VIN (typically 17 alphanumeric characters) - allow partial matches
  if (/^[A-HJ-NPR-Z0-9]{8,}$/i.test(trimmed)) {
    return "vin";
  }

  // Check for vehicle registration (typically 2 letters, 2 digits, 2 letters, 4 digits) - allow partial matches
  if (/^[A-Z]{2}\d{2}/i.test(trimmed) || /^[A-Z]{2}\d{2}[A-Z]{2}/i.test(trimmed)) {
    return "vehicleNumber";
  }

  // Check for email - allow partial matches (contains @)
  if (trimmed.includes("@")) {
    return "email";
  }

  // Check for phone - allow partial numbers (3+ digits)
  const cleanedPhone = trimmed.replace(/[\s-+().]/g, "").replace(/^91/, "");
  if (/^\d{3,}$/.test(cleanedPhone)) {
    return "phone";
  }

  // Default to name search
  return "name";
}

/**
 * Get human-readable label for search type
 * @param type - Search type or null
 * @returns Label string or empty string
 */
export function getSearchTypeLabel(type: CustomerSearchType | null): string {
  if (!type) return "";
  const labels: Record<CustomerSearchType, string> = {
    phone: "Phone Number",
    email: "Email ID",
    customerNumber: "Customer ID",
    vin: "VIN Number",
    vehicleNumber: "Vehicle Number",
    name: "Name",
    auto: "Auto-detect",
  };
  return labels[type];
}

