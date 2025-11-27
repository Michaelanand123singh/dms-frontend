/**
 * API Client Factory - Returns appropriate client based on environment
 */

import { realApiClient } from "./real-client";
import { mockApiClient } from "./mock-client";
import type { ApiClient } from "./types";

/**
 * Determines which API client to use based on environment variable
 * NEXT_PUBLIC_USE_MOCK_API=true -> uses mock client
 * NEXT_PUBLIC_USE_MOCK_API=false or undefined -> uses real client
 */
function getApiClient(): ApiClient {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
  return useMock ? mockApiClient : realApiClient;
}

// Export the active API client
export const apiClient = getApiClient();

// Export both clients for direct access if needed
export { realApiClient, mockApiClient };

// Re-export types (ApiError is a class, exported from errors.ts)
export type { ApiClient, ApiRequestConfig, ApiResponse } from "./types";
export { ApiError, getErrorMessage } from "./errors";

