/**
 * Customer Service - Business logic layer for customer operations
 */

import { apiClient, mockApiClient, ApiError } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { customerRepository } from "@/__mocks__/repositories/customer.repository";
import { API_CONFIG } from "@/config/api.config";
import type { CustomerWithVehicles, NewCustomerForm, CustomerSearchType } from "@/shared/types";
import type { ApiRequestConfig } from "@/lib/api/types";

class CustomerService {
  private useMock: boolean;

  constructor() {
    this.useMock = API_CONFIG.USE_MOCK;
    this.setupMockEndpoints();
  }

  private setupMockEndpoints(): void {
    if (!this.useMock) return;

    // Register mock endpoints
    mockApiClient.registerMock(API_ENDPOINTS.CUSTOMERS, "GET", async () => {
      return customerRepository.getAll();
    });

    mockApiClient.registerMock(API_ENDPOINTS.CUSTOMER_SEARCH, "GET", async (config: ApiRequestConfig) => {
      const params = config.params as { query?: string; type?: CustomerSearchType };
      if (!params?.query) {
        return [];
      }
      return customerRepository.search(params.query, params.type || "name");
    });

    mockApiClient.registerMock(API_ENDPOINTS.CUSTOMER_RECENT, "GET", async (config: ApiRequestConfig) => {
      const params = config.params as { limit?: number };
      return customerRepository.getRecent(params?.limit || 10);
    });

    mockApiClient.registerMock(API_ENDPOINTS.CUSTOMERS, "POST", async (config: ApiRequestConfig) => {
      const data = config.body as NewCustomerForm;
      return customerRepository.create(data);
    });

    // Dynamic route for get by ID - register for each possible ID pattern
    // The mock client will handle pattern matching
    const registerDynamicRoute = (method: string, handler: (id: string, config: ApiRequestConfig) => Promise<unknown>) => {
      // Register a pattern that matches /customers/{id}
      mockApiClient.registerMock("/customers/:id", method, async (config: ApiRequestConfig) => {
        // Extract ID from URL
        const url = config.url || "";
        const match = url.match(/\/customers\/([^/?]+)/);
        const id = match ? match[1] : "";
        if (!id) {
          throw new ApiError("Customer ID is required", 400, "VALIDATION_ERROR");
        }
        return handler(id, config);
      });
    };

    registerDynamicRoute("GET", async (id) => {
      const customer = await customerRepository.getById(id);
      if (!customer) {
        throw new ApiError("Customer not found", 404, "NOT_FOUND");
      }
      return customer;
    });

    registerDynamicRoute("PUT", async (id, config) => {
      const data = config.body as Partial<CustomerWithVehicles>;
      return customerRepository.update(id, data);
    });

    registerDynamicRoute("DELETE", async (id) => {
      // In mock, we can just return success
      return { success: true };
    });
  }

  async getAll(): Promise<CustomerWithVehicles[]> {
    // Use repository directly when in mock mode
    if (this.useMock) {
      return customerRepository.getAll();
    }
    const response = await apiClient.get<CustomerWithVehicles[]>(API_ENDPOINTS.CUSTOMERS);
    return response.data;
  }

  async getById(id: number | string): Promise<CustomerWithVehicles> {
    // Use repository directly when in mock mode
    if (this.useMock) {
      const customer = await customerRepository.getById(id);
      if (!customer) {
        throw new Error("Customer not found");
      }
      return customer;
    }
    const response = await apiClient.get<CustomerWithVehicles>(API_ENDPOINTS.CUSTOMER(String(id)));
    return response.data;
  }

  async search(query: string, type: CustomerSearchType = "auto"): Promise<CustomerWithVehicles[]> {
    // Use repository directly when in mock mode
    if (this.useMock) {
      return customerRepository.search(query, type);
    }
    const response = await apiClient.get<CustomerWithVehicles[]>(API_ENDPOINTS.CUSTOMER_SEARCH, {
      params: { query, type },
    });
    return response.data;
  }

  async getRecent(limit: number = 10): Promise<CustomerWithVehicles[]> {
    // Use repository directly when in mock mode
    if (this.useMock) {
      return customerRepository.getRecent(limit);
    }
    const response = await apiClient.get<CustomerWithVehicles[]>(API_ENDPOINTS.CUSTOMER_RECENT, {
      params: { limit },
    });
    return response.data;
  }

  async create(data: NewCustomerForm): Promise<CustomerWithVehicles> {
    // Use repository directly when in mock mode
    if (this.useMock) {
      const customer = await customerRepository.create(data);
      // Add to recent
      if (customer.id) {
        await customerRepository.addToRecent(customer.id);
      }
      return customer;
    }
    const response = await apiClient.post<CustomerWithVehicles>(API_ENDPOINTS.CUSTOMERS, data);
    
    // Add to recent if using mock
    if (this.useMock && response.data.id) {
      await customerRepository.addToRecent(response.data.id);
    }
    
    return response.data;
  }

  async update(id: number | string, data: Partial<CustomerWithVehicles>): Promise<CustomerWithVehicles> {
    // Use repository directly when in mock mode
    if (this.useMock) {
      return customerRepository.update(id, data);
    }
    const response = await apiClient.put<CustomerWithVehicles>(API_ENDPOINTS.CUSTOMER(String(id)), data);
    return response.data;
  }

  async delete(id: number | string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CUSTOMER(String(id)));
  }
}

export const customerService = new CustomerService();

