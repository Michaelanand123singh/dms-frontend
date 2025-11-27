/**
 * API Client Types
 */

export interface ApiRequestConfig {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retry?: boolean;
  url?: string; // URL is added by mock client for handler access
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface ApiClient {
  request<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  get<T>(url: string, config?: Omit<ApiRequestConfig, "method" | "body">): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: unknown, config?: Omit<ApiRequestConfig, "method">): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: unknown, config?: Omit<ApiRequestConfig, "method">): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: unknown, config?: Omit<ApiRequestConfig, "method">): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: Omit<ApiRequestConfig, "method" | "body">): Promise<ApiResponse<T>>;
}

