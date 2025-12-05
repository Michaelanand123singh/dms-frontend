/**
 * Quotations Service - Business logic layer for quotation operations
 */

import { apiClient, mockApiClient, ApiError } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api.config";
import { API_CONFIG } from "@/config/api.config";
import type { Quotation, CreateQuotationForm, QuotationStatus } from "@/shared/types/quotation.types";
import type { Appointment } from "@/shared/types/appointment.types";
import type { ApiRequestConfig } from "@/lib/api/types";

class QuotationsService {
  private useMock: boolean;

  constructor() {
    this.useMock = API_CONFIG.USE_MOCK;
    this.setupMockEndpoints();
  }

  private setupMockEndpoints(): void {
    if (!this.useMock) return;

    // Register mock endpoints
    mockApiClient.registerMock(API_ENDPOINTS.QUOTATIONS, "GET", async () => {
      return [];
    });

    mockApiClient.registerMock(API_ENDPOINTS.QUOTATIONS, "POST", async (config: ApiRequestConfig) => {
      const data = config.body as CreateQuotationForm;
      return {
        id: `qtn_${Date.now()}`,
        quotationNumber: `QTN-${Date.now()}`,
        ...data,
        subtotal: 0,
        discountPercent: 0,
        preGstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalAmount: 0,
        status: "draft",
        passedToManager: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    mockApiClient.registerMock("/service-center/quotations/:id/from-appointment", "POST", async (config: ApiRequestConfig) => {
      const url = config.url || "";
      const match = url.match(/\/service-center\/quotations\/([^/?]+)\/from-appointment/);
      const appointmentId = match ? match[1] : "";
      if (!appointmentId) {
        throw new ApiError("Appointment ID is required", 400, "VALIDATION_ERROR");
      }
      return {
        id: `qtn_${Date.now()}`,
        quotationNumber: `QTN-${Date.now()}`,
        status: "draft",
        passedToManager: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
      };
    });

    mockApiClient.registerMock("/service-center/quotations/:id/status", "PATCH", async (config: ApiRequestConfig) => {
      const url = config.url || "";
      const match = url.match(/\/service-center\/quotations\/([^/?]+)\/status/);
      const quotationId = match ? match[1] : "";
      if (!quotationId) {
        throw new ApiError("Quotation ID is required", 400, "VALIDATION_ERROR");
      }
      const body = config.body as { status: QuotationStatus; reason?: string };
      return {
        id: quotationId,
        status: body.status,
        updatedAt: new Date().toISOString(),
      };
    });

    mockApiClient.registerMock("/service-center/quotations/:id/whatsapp", "POST", async (config: ApiRequestConfig) => {
      const url = config.url || "";
      const match = url.match(/\/service-center\/quotations\/([^/?]+)\/whatsapp/);
      const quotationId = match ? match[1] : "";
      if (!quotationId) {
        throw new ApiError("Quotation ID is required", 400, "VALIDATION_ERROR");
      }
      return {
        success: true,
        whatsappUrl: `https://wa.me/?text=Quotation%20${quotationId}`,
      };
    });
  }

  async createFromAppointment(appointmentId: string, appointment: Appointment): Promise<Quotation> {
    if (this.useMock) {
      return {
        id: `qtn_${Date.now()}`,
        quotationNumber: `QTN-${Date.now()}`,
        serviceCenterId: String(appointment.serviceCenterId || ""),
        customerId: appointment.customerId,
        vehicleId: appointment.vehicleId,
        documentType: "Quotation",
        quotationDate: new Date().toISOString().split("T")[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        hasInsurance: false,
        subtotal: 0,
        discount: 0,
        discountPercent: 0,
        preGstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalAmount: 0,
        notes: appointment.customerComplaintIssue || "",
        customNotes: appointment.previousServiceHistory || "",
        status: "draft",
        passedToManager: false,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const response = await apiClient.post<Quotation>(
      `${API_ENDPOINTS.QUOTATION(appointmentId)}/from-appointment`,
      appointment
    );
    return response.data;
  }

  async updateStatus(quotationId: string, status: QuotationStatus, reason?: string): Promise<Quotation> {
    if (this.useMock) {
      return {
        id: quotationId,
        quotationNumber: `QTN-${quotationId}`,
        serviceCenterId: "",
        customerId: "",
        documentType: "Quotation",
        quotationDate: new Date().toISOString().split("T")[0],
        hasInsurance: false,
        subtotal: 0,
        discount: 0,
        discountPercent: 0,
        preGstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalAmount: 0,
        status,
        passedToManager: false,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const response = await apiClient.patch<Quotation>(API_ENDPOINTS.QUOTATION_STATUS(quotationId), {
      status,
      reason,
    });
    return response.data;
  }

  async sendWhatsApp(quotationId: string): Promise<{ success: boolean; whatsappUrl?: string; message?: string }> {
    if (this.useMock) {
      return {
        success: true,
        whatsappUrl: `https://wa.me/?text=Quotation%20${quotationId}`,
      };
    }
    const response = await apiClient.post<{ success: boolean; whatsappUrl?: string; message?: string }>(
      `${API_ENDPOINTS.QUOTATION(quotationId)}/whatsapp`
    );
    return response.data;
  }
}

export const quotationsService = new QuotationsService();

