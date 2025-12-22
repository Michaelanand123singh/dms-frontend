/**
 * API Request/Response Interceptors
 * Handles authentication, logging, and error transformation
 */

import Cookies from 'js-cookie';
import { safeStorage } from '@/shared/lib/localStorage';
import { ApiErrorHandler, parseApiError } from './error-handler';

export interface RequestInterceptor {
    onRequest?: (config: RequestInit, url: string) => RequestInit | Promise<RequestInit>;
    onRequestError?: (error: any) => any;
}

export interface ResponseInterceptor {
    onResponse?: (response: Response) => Response | Promise<Response>;
    onResponseError?: (error: any) => any;
}

/**
 * Add authentication token to request headers
 */
export function authRequestInterceptor(config: RequestInit, url: string): RequestInit {
    // Get token from cookies (primary) or localStorage (fallback)
    const token = Cookies.get('auth_token') || safeStorage.getItem<string | null>('authToken', null);

    if (token) {
        const headers = new Headers(config.headers);
        headers.set('Authorization', `Bearer ${token}`);

        return {
            ...config,
            headers,
        };
    }

    return config;
}

/**
 * Log requests in development mode
 */
export function loggingRequestInterceptor(config: RequestInit, url: string): RequestInit {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[API Request] ${config.method || 'GET'} ${url}`, config);
    }
    return config;
}

/**
 * Handle response and check for errors
 */
export async function errorResponseInterceptor(response: Response): Promise<Response> {
    if (!response.ok) {
        let errorData = {};
        try {
            errorData = await response.clone().json();
        } catch (e) {
            // response might be text or empty
        }

        throw new ApiErrorHandler(parseApiError({
            response: {
                status: response.status,
                data: errorData,
            },
        }));
    }
    return response;
}

/**
 * Log responses in development mode
 */
export async function loggingResponseInterceptor(response: Response): Promise<Response> {
    if (process.env.NODE_ENV === 'development') {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json().catch(() => null);
        console.log(`[API Response] ${response.status} ${response.url}`, data);
    }
    return response;
}

/**
 * Handle 401 Unauthorized - redirect to login
 */
export function unauthorizedResponseInterceptor(error: any): any {
    if (error.status === 401) {
        // Clear auth token
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            // Redirect to login page
            window.location.href = '/login';
        }
    }
    throw error;
}
