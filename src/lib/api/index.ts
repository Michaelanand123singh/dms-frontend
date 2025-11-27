/**
 * API Client Module - Main export
 */

export { apiClient, realApiClient, mockApiClient } from "./client";
export { ApiError, getErrorMessage } from "./errors";
export type { ApiClient, ApiRequestConfig, ApiResponse } from "./types";

