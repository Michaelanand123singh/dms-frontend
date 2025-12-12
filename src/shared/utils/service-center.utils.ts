/**
 * Service Center utilities for code mapping and normalization
 */

/**
 * Service Center Code Mapping
 * Maps service center IDs to their codes (e.g., "sc-001" -> "SC001")
 */
export const SERVICE_CENTER_CODE_MAP: Record<string, string> = {
  "1": "SC001",
  "2": "SC002",
  "3": "SC003",
  "sc-001": "SC001",
  "sc-002": "SC002",
  "sc-003": "SC003",
};

/**
 * Normalize service center ID to standard format (sc-XXX)
 * @param id - Service center ID (string, number, or null)
 * @returns Normalized service center ID string (e.g., "sc-001")
 */
export function normalizeServiceCenterId(id?: string | number | null): string {
  if (!id) return "sc-001";
  const raw = id.toString();
  if (raw.startsWith("sc-")) {
    return raw;
  }
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "sc-001";
  return `sc-${digits.padStart(3, "0")}`;
}

/**
 * Get service center code from ID
 * @param id - Service center ID (string, number, or null)
 * @returns Service center code (e.g., "SC001")
 */
export function getServiceCenterCode(id?: string | number | null): string {
  const normalized = normalizeServiceCenterId(id);
  return SERVICE_CENTER_CODE_MAP[normalized] || "SC001";
}

