/**
 * API Client
 * Centralized HTTP client for all API requests
 */

import { ApiResponse, ApiRequestConfig, HttpMethod } from './types';
import {
    authRequestInterceptor,
    loggingRequestInterceptor,
    errorResponseInterceptor,
    loggingResponseInterceptor,
    unauthorizedResponseInterceptor
} from './interceptors';
import { errorInterceptor, successInterceptor } from './interceptors/error.interceptor';
import { handleApiError } from './error-handler';
import { ApiError } from './errors';

import { API_CONFIG } from '@/config/api.config';

// Base API URL
const API_BASE_URL = API_CONFIG.BASE_URL;

class ApiClient {
    private baseURL: string;
    private cache = new Map<string, { data: any; expiry: number }>();
    private defaultTimeout = API_CONFIG.TIMEOUT || 30000;

    constructor(baseURL: string = API_BASE_URL) {
        if (!baseURL) {
            throw new Error(
                'API_BASE_URL is not configured. Please set NEXT_PUBLIC_API_URL in your .env file'
            );
        }
        this.baseURL = baseURL;
    }

    /**
     * Build full URL with query parameters
     */
    /**
     * Build full URL with query parameters
     */
    private buildUrl(path: string, params?: Record<string, any>): string {
        // Ensure baseURL doesn't have a trailing slash
        const cleanBaseUrl = this.baseURL.replace(/\/$/, '');
        // Ensure path starts with a slash
        const cleanPath = path.startsWith('/') ? path : `/${path}`;

        // Construct full URL string first to preserve Base URL path segments (like /api)
        const url = new URL(cleanBaseUrl + cleanPath);

        if (params) {
            Object.keys(params).forEach(key => {
                const value = params[key];
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return url.toString();
    }

    /**
     * Apply request interceptors
     */
    private async applyRequestInterceptors(config: RequestInit, url: string): Promise<RequestInit> {
        let modifiedConfig = config;

        // Apply interceptors in order
        modifiedConfig = authRequestInterceptor(modifiedConfig, url);
        modifiedConfig = loggingRequestInterceptor(modifiedConfig, url);

        return modifiedConfig;
    }

    /**
     * Apply response interceptors
     */
    private async applyResponseInterceptors(response: Response): Promise<Response> {
        let modifiedResponse = response;

        // Apply interceptors in order
        modifiedResponse = await loggingResponseInterceptor(modifiedResponse);
        modifiedResponse = await errorResponseInterceptor(modifiedResponse);

        return modifiedResponse;
    }

    /**
     * Execute fetch with timeout
     */
    private async requestWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: options.signal || controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    /**
     * Core request method with retry and caching
     */
    private async request<T = any>(
        method: HttpMethod,
        path: string,
        data?: any,
        config?: ApiRequestConfig
    ): Promise<ApiResponse<T>> {
        const url = this.buildUrl(path, config?.params);
        const cacheKey = `${method}:${url}`;

        // Check cache for GET requests
        if (method === 'GET' && config?.cache !== false) {
            const cached = this.cache.get(cacheKey);
            if (cached && cached.expiry > Date.now()) {
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[API Cache] Hit for ${url}`);
                }
                return {
                    data: cached.data,
                    success: true,
                };
            }
        }

        let attempts = 0;
        const maxRetries = config?.retries ?? API_CONFIG.RETRY_ATTEMPTS;

        while (attempts <= maxRetries) {
            try {
                // Build request config
                let requestConfig: RequestInit = {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...config?.headers,
                    },
                };

                // Add body for non-GET requests
                if (data && method !== 'GET') {
                    requestConfig.body = JSON.stringify(data);
                }

                // Apply request interceptors
                requestConfig = await this.applyRequestInterceptors(requestConfig, url);

                // Make request with timeout
                let response = await this.requestWithTimeout(
                    url,
                    requestConfig,
                    config?.timeout ?? this.defaultTimeout
                );

                // Apply response interceptors
                response = await this.applyResponseInterceptors(response);

                // Check content type
                const contentType = response.headers.get('content-type');
                let responseData: any;

                if (contentType && contentType.includes('application/json')) {
                    try {
                        responseData = await response.json();
                    } catch (e) {
                        // JSON parsing failed even with correct header
                        throw new Error('Invalid JSON response');
                    }
                } else {
                    // Handle non-JSON response (likely an error page)
                    const text = await response.text();

                    // If response is not ok, throw error with text content
                    if (!response.ok) {
                        throw {
                            response: {
                                status: response.status,
                                data: { message: text.substring(0, 500) } // Truncate long HTML
                            }
                        };
                    }

                    // If it is 200 OK but text/html, it might be an issue or just text response
                    try {
                        // Try parsing as JSON anyway just in case header is missing/wrong
                        responseData = JSON.parse(text);
                    } catch {
                        // Fallback to text
                        responseData = { message: text };
                    }
                }

                const result = {
                    data: responseData.data || responseData,
                    message: responseData.message,
                    success: true,
                };

                // Cache successful GET results
                if (method === 'GET' && config?.cache !== false) {
                    const ttl = config?.ttl ?? 60000; // 1 minute default TTL
                    this.cache.set(cacheKey, {
                        data: result.data,
                        expiry: Date.now() + ttl,
                    });
                }

                return result;
            } catch (error: any) {
                attempts++;

                // Retry logic for 5xx errors or network errors
                const isRetryable = (error.status >= 500 || !error.status) && attempts <= maxRetries;
                if (isRetryable) {
                    const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempts - 1);
                    if (process.env.NODE_ENV === 'development') {
                        console.warn(`[API Retry] Attempt ${attempts} failed for ${url}. Retrying in ${delay}ms...`);
                    }
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                // Handle unauthorized errors
                try {
                    unauthorizedResponseInterceptor(error);
                } catch (e) {
                    // Error was handled by interceptor or re-thrown
                }

                // Parse and throw error
                const errorInfo = handleApiError(error);
                throw new ApiError(errorInfo.message, errorInfo.status, errorInfo.code, errorInfo.errors);
            }
        }

        throw new Error('Maximum retry attempts exceeded');
    }

    /**
     * GET request
     */
    async get<T = any>(path: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('GET', path, undefined, config);
    }

    /**
     * POST request
     */
    async post<T = any>(path: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('POST', path, data, config);
    }

    /**
     * PUT request
     */
    async put<T = any>(path: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('PUT', path, data, config);
    }

    /**
     * PATCH request
     */
    async patch<T = any>(path: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('PATCH', path, data, config);
    }

    /**
     * DELETE request
     */
    async delete<T = any>(path: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('DELETE', path, undefined, config);
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export default ApiClient;
