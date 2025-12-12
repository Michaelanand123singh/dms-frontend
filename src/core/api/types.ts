/**
 * Core API Types
 * Shared types for API requests and responses
 */

export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success: boolean;
}

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * API Request Configuration
 */
export interface ApiRequestConfig {
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
    timeout?: number;
    signal?: AbortSignal;
    url?: string; // For mock client compatibility
    method?: HttpMethod; // For mock client compatibility
    body?: unknown; // For mock client compatibility
}

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API Endpoint Type
 */
export interface ApiEndpoint {
    method: HttpMethod;
    path: string;
}
