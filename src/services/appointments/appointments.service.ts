/**
 * Appointments Service - Business logic layer for appointment operations
 */

import { apiClient, mockApiClient, ApiError } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { API_CONFIG } from "@/config/api.config";
import type { ApiRequestConfig } from "@/lib/api/types";

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

