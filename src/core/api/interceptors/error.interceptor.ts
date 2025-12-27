/**
 * API Error Interface
 */
export interface ApiError {
    message: string;
    statusCode: number;
    timestamp?: string;
    path?: string;
    errors?: string[];
}

/**
 * Error Interceptor for API Client
 */
export const errorInterceptor = (error: any): Promise<never> => {
    const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred',
        statusCode: error.response?.status || 500,
        timestamp: error.response?.data?.timestamp,
        path: error.response?.data?.path,
        errors: error.response?.data?.errors,
    };

    // Log error for debugging
    console.error('[API Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: apiError.statusCode,
        message: apiError.message,
        errors: apiError.errors,
    });

    // Handle specific error codes
    if (apiError.statusCode === 401) {
        // Unauthorized - redirect to login
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    } else if (apiError.statusCode === 403) {
        // Forbidden - show permission denied message
        console.warn('Permission denied:', apiError.message);
    } else if (apiError.statusCode >= 500) {
        // Server error - show generic error message
        console.error('Server error:', apiError.message);
    }

    return Promise.reject(apiError);
};

/**
 * Success Interceptor for API Client
 */
export const successInterceptor = (response: any) => {
    // Log successful requests in development
    if (process.env.NODE_ENV === 'development') {
        console.log('[API Success]', {
            url: response.config?.url,
            method: response.config?.method,
            status: response.status,
        });
    }
    return response;
};
