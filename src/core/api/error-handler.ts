/**
 * Centralized API Error Handler
 * Handles all API errors consistently across the application
 */

import { ApiError } from './types';

export class ApiErrorHandler extends Error {
    public code?: string;
    public status?: number;
    public errors?: Record<string, string[]>;

    constructor(error: ApiError) {
        super(error.message);
        this.name = 'ApiError';
        this.code = error.code;
        this.status = error.status;
        this.errors = error.errors;
    }
}

/**
 * Parse error response from API
 */
export function parseApiError(error: any): ApiError {
    // Handle network errors
    if (!error.response) {
        return {
            message: 'Network error. Please check your connection.',
            code: 'NETWORK_ERROR',
            status: 0,
        };
    }

    const { status, data } = error.response;

    // Handle different error formats
    if (data?.message) {
        return {
            message: data.message,
            code: data.code || `HTTP_${status}`,
            status,
            errors: data.errors,
        };
    }

    // Default error messages based on status code
    const defaultMessages: Record<number, string> = {
        400: 'Bad request. Please check your input.',
        401: 'Unauthorized. Please log in again.',
        403: 'Forbidden. You do not have permission to perform this action.',
        404: 'Resource not found.',
        409: 'Conflict. The resource already exists.',
        422: 'Validation error. Please check your input.',
        500: 'Internal server error. Please try again later.',
        502: 'Bad gateway. The server is temporarily unavailable.',
        503: 'Service unavailable. Please try again later.',
    };

    return {
        message: defaultMessages[status] || 'An unexpected error occurred.',
        code: `HTTP_${status}`,
        status,
    };
}

/**
 * Handle API error and optionally show toast
 */
export function handleApiError(error: any, showToast?: (message: string, type: 'error') => void): ApiError {
    const apiError = parseApiError(error);

    // Show toast notification if function provided
    if (showToast) {
        showToast(apiError.message, 'error');
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', apiError);
    }

    return apiError;
}
