/**
 * Core API Module
 * Exports all API functionality including client, errors, and interceptors
 */

// API Client
export { apiClient } from './client';
export { mockApiClient } from './mock-client';

// Error Handling
export { ApiError, getErrorMessage } from './errors';
export { handleApiError } from './error-handler';

// Interceptors
export * from './interceptors';

// Types
export type { ApiResponse, ApiError as ApiErrorType, ApiRequestConfig, HttpMethod, ApiEndpoint } from './types';
