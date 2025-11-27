/**
 * Real API Client - Makes actual HTTP requests to backend
 */

import { API_CONFIG } from "@/config/api.config";
import { safeStorage } from "@/shared/lib/localStorage";
import type { ApiClient, ApiRequestConfig, ApiResponse } from "./types";
import { ApiError } from "./errors";

class RealApiClient implements ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL?: string, timeout?: number) {
    this.baseURL = baseURL || API_CONFIG.BASE_URL;
    this.defaultTimeout = timeout || API_CONFIG.TIMEOUT;
  }

  private async getAuthToken(): Promise<string | null> {
    // Get token from localStorage or context
    const token = safeStorage.getItem<string | null>("authToken", null);
    return token;
  }

  private buildURL(url: string, params?: Record<string, string | number | boolean>): string {
    const fullURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;
    
    if (!params || Object.keys(params).length === 0) {
      return fullURL;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    const separator = fullURL.includes("?") ? "&" : "?";
    return `${fullURL}${separator}${searchParams.toString()}`;
  }

  private async buildHeaders(customHeaders?: Record<string, string>): Promise<Headers> {
    const headers = new Headers({
      "Content-Type": "application/json",
      ...customHeaders,
    });

    const token = await this.getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  }

  private async requestWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError("Request timeout", 408, "TIMEOUT");
      }
      throw error;
    }
  }

  async request<T>(url: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      headers: customHeaders,
      body,
      params,
      timeout = this.defaultTimeout,
    } = config;

    try {
      const fullURL = this.buildURL(url, params);
      const headers = await this.buildHeaders(customHeaders);

      const requestOptions: RequestInit = {
        method,
        headers,
      };

      if (body && method !== "GET" && method !== "DELETE") {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await this.requestWithTimeout(fullURL, requestOptions, timeout);

      if (!response.ok) {
        let errorDetails: unknown;
        try {
          errorDetails = await response.json();
        } catch {
          errorDetails = await response.text();
        }
        throw ApiError.fromResponse(response, errorDetails);
      }

      let data: T;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = (await response.text()) as T;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.fromError(error as Error);
    }
  }

  async get<T>(url: string, config?: Omit<ApiRequestConfig, "method" | "body">): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  async post<T>(url: string, data?: unknown, config?: Omit<ApiRequestConfig, "method">): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "POST", body: data });
  }

  async put<T>(url: string, data?: unknown, config?: Omit<ApiRequestConfig, "method">): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "PUT", body: data });
  }

  async patch<T>(url: string, data?: unknown, config?: Omit<ApiRequestConfig, "method">): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "PATCH", body: data });
  }

  async delete<T>(url: string, config?: Omit<ApiRequestConfig, "method" | "body">): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }
}

export const realApiClient = new RealApiClient();

