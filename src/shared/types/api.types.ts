/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Pagination response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Error response (deprecated - use ApiError class from @/lib/api)
 * @deprecated Use ApiError from @/lib/api instead
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

