/**
 * Appointments Service - Business logic layer for appointment operations
 */

import { apiClient, mockApiClient, ApiError } from "@/core/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { API_CONFIG } from "@/config/api.config";
import type { ApiRequestConfig } from "@/core/api";

class AppointmentsService {
  private useMock: boolean;

  constructor() {
    this.useMock = API_CONFIG.USE_MOCK;
    this.setupMockEndpoints();
  }

  private setupMockEndpoints(): void {
    if (!this.useMock) return;

    mockApiClient.registerMock("/appointments/:id/link-quotation", "POST", async (config: ApiRequestConfig) => {
      const url = config.url || "";
      const match = url.match(/\/appointments\/([^/?]+)\/link-quotation/);
      const appointmentId = match ? match[1] : "";
      if (!appointmentId) {
        throw new ApiError("Appointment ID is required", 400, "VALIDATION_ERROR");
      }
      const body = config.body as { quotationId: string };
      return {
        success: true,
        appointmentId,
        quotationId: body.quotationId,
      };
    });
  }

  async getAll(params?: any): Promise<any[]> {
    if (this.useMock) {
      // Return mock data logic if needed, or empty array
      return [];
    }
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get(`${API_ENDPOINTS.APPOINTMENTS}${queryString}`);
    return response.data;
  }

  async getById(id: string): Promise<any> {
    if (this.useMock) {
      return null;
    }
    const response = await apiClient.get(API_ENDPOINTS.APPOINTMENT(id));
    return response.data;
  }

  async create(data: any): Promise<any> {
    if (this.useMock) {
      return { id: Date.now(), ...data };
    }
    const response = await apiClient.post(API_ENDPOINTS.APPOINTMENTS, data);
    return response.data;
  }

  async update(id: string, data: any): Promise<any> {
    if (this.useMock) {
      return { id, ...data };
    }
    const response = await apiClient.patch(API_ENDPOINTS.APPOINTMENT(id), data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    if (this.useMock) {
      return;
    }
    await apiClient.delete(API_ENDPOINTS.APPOINTMENT(id));
  }

  async linkQuotation(appointmentId: string, quotationId: string): Promise<void> {
    if (this.useMock) {
      // Mock implementation - just return success
      return;
    }
    await apiClient.post(`${API_ENDPOINTS.APPOINTMENT(appointmentId)}/link-quotation`, {
      quotationId,
    });
  }
}

export const appointmentsService = new AppointmentsService();

