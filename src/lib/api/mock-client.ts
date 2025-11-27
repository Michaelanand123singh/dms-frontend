/**
 * Mock API Client - Returns mock data with simulated network delay
 */

import type { ApiClient, ApiRequestConfig, ApiResponse } from "./types";
import { ApiError } from "./errors";

interface MockResponse {
  url: string;
  method: string;
  response: (config: ApiRequestConfig) => Promise<unknown>;
}

class MockApiClient implements ApiClient {
  private mockResponses: Map<string, MockResponse> = new Map();
  private defaultDelay: number = 300;

  constructor() {
    // Mock responses will be registered by mock repositories
  }

  registerMock(url: string, method: string, handler: (config: ApiRequestConfig) => Promise<unknown>): void {
    const key = `${method}:${url}`;
    this.mockResponses.set(key, { url, method, response: handler });
  }

  private findMockHandler(url: string, method: string): MockResponse | null {
    // Normalize URL (remove query params and base URL)
    const normalizedUrl = url.split("?")[0].replace(/^https?:\/\/[^/]+/, "");
    
    // Try exact match first
    const exactKey = `${method}:${normalizedUrl}`;
    if (this.mockResponses.has(exactKey)) {
      return this.mockResponses.get(exactKey)!;
    }

    // Try pattern matching (for dynamic routes)
    for (const [key, mock] of this.mockResponses.entries()) {
      const [mockMethod, mockUrl] = key.split(":", 2);
      if (mockMethod !== method) continue;

      // Simple pattern matching: replace :id with actual value
      const pattern = mockUrl.replace(/:[^/]+/g, "[^/]+");
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(normalizedUrl)) {
        return mock;
      }
    }

    return null;
  }

  private async simulateDelay(ms: number = this.defaultDelay): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async request<T>(url: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    const method = config.method || "GET";
    
    // Simulate network delay
    await this.simulateDelay();

    // Add URL to config for handler access
    const configWithUrl = { ...config, url };

    const handler = this.findMockHandler(url, method);
    
    if (!handler) {
      // Return 404 for unregistered endpoints
      throw new ApiError(`Mock endpoint not found: ${method} ${url}`, 404, "NOT_FOUND");
    }

    try {
      const data = await handler.response(configWithUrl);
      
      return {
        data: data as T,
        status: 200,
        statusText: "OK",
        headers: new Headers({
          "content-type": "application/json",
        }),
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

export const mockApiClient = new MockApiClient();

