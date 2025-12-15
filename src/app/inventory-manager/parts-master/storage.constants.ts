/**
 * LocalStorage Constants for Parts Master
 * Centralized storage keys for parts master operations
 */

export const PARTS_MASTER_STORAGE_KEYS = {
  PARTS_MASTER: "partsMaster",
} as const;

export type PartsMasterStorageKey = typeof PARTS_MASTER_STORAGE_KEYS[keyof typeof PARTS_MASTER_STORAGE_KEYS];

