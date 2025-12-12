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
import { handleApiError } from './error-handler';

// Base API URL - should be configured via environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    /**
     * Build full URL with query parameters
     */
    private buildUrl(path: string, params?: Record<string, any>): string {
        const url = new URL(path.startsWith('/') ? path : `/${path}`, this.baseURL);

        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null) {
                    url.searchParams.append(key, String(params[key]));
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
     * Core request method
     */
    private async request<T = any>(
        method: HttpMethod,
        path: string,
        data?: any,
        config?: ApiRequestConfig
    ): Promise<ApiResponse<T>> {
        try {
            const url = this.buildUrl(path, config?.params);

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

            // Make request
            let response = await fetch(url, requestConfig);

            // Apply response interceptors
            response = await this.applyResponseInterceptors(response);

            // Parse response
            const responseData = await response.json();

            return {
                data: responseData.data || responseData,
                message: responseData.message,
                success: true,
            };
        } catch (error: any) {
            // Handle unauthorized errors
            try {
                unauthorizedResponseInterceptor(error);
            } catch (e) {
                // Error was handled by interceptor
            }

            // Parse and throw error
            const apiError = handleApiError(error);
            throw apiError;
        }
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
