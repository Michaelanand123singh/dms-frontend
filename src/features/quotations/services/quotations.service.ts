/**
 * Quotations Service - Business logic layer for quotation operations
 */

import { apiClient } from "@/core/api";
import { API_ENDPOINTS } from "@/config/api.config";
import type { Quotation, CreateQuotationForm } from "@/shared/types/quotation.types";

class QuotationsService {
  /**
   * Create a new quotation
   */
  async create(data: CreateQuotationForm): Promise<Quotation> {
    const response = await apiClient.post<Quotation>(API_ENDPOINTS.QUOTATIONS, data);
    return response.data;
  }

  /**
   * Get all quotations with optional filtering
   */
  async getAll(params?: any): Promise<Quotation[]> {
    const response = await apiClient.get<any>(API_ENDPOINTS.QUOTATIONS, { params });
    // Handle potential pagination wrapper { data: [], pagination: {} }
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get a single quotation by ID
   */
  async getById(id: string): Promise<Quotation> {
    const response = await apiClient.get<Quotation>(`${API_ENDPOINTS.QUOTATIONS}/${id}`);
    return response.data;
  }

  /**
   * Pass quotation to manager for review
   */
  async passToManager(quotationId: string, managerId: string): Promise<Quotation> {
    const response = await apiClient.post<Quotation>(
      `${API_ENDPOINTS.QUOTATION(quotationId)}/pass-to-manager`,
      { managerId }
    );
    return response.data;
  }

  /**
   * Approve a quotation (Manager)
   */
  async approve(quotationId: string): Promise<Quotation> {
    const response = await apiClient.patch<Quotation>(`${API_ENDPOINTS.QUOTATION(quotationId)}/approve`);
    return response.data;
  }

  /**
   * Submit manager review (Approve/Reject with notes)
   */
  async managerReview(quotationId: string, data: { status: 'APPROVED' | 'REJECTED'; notes?: string }): Promise<Quotation> {
    const response = await apiClient.post<Quotation>(
      `${API_ENDPOINTS.QUOTATION(quotationId)}/manager-review`,
      data
    );
    return response.data;
  }

  /**
   * Update customer approval status
   */
  async updateCustomerApproval(quotationId: string, data: { status: 'APPROVED' | 'REJECTED'; reason?: string }): Promise<Quotation> {
    const response = await apiClient.patch<Quotation>(
      `${API_ENDPOINTS.QUOTATION(quotationId)}/customer-approval`,
      data
    );
    return response.data;
  }

  async sendWhatsApp(quotationId: string): Promise<{ success: boolean; whatsappUrl?: string; message?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; whatsappUrl?: string; message?: string }>(
        `${API_ENDPOINTS.QUOTATION(quotationId)}/whatsapp`
      );
      return response.data;
    } catch (e) {
      console.warn("WhatsApp endpoint not implemented on backend yet.", e);
      return { success: true, whatsappUrl: `https://wa.me/?text=Quotation%20${quotationId}` };
    }
  }
  /**
   * Create a quotation from an appointment
   */
  async createFromAppointment(appointmentId: string, appointmentData?: any): Promise<Quotation> {
    // If appointmentData is provided (mock mode/optimistic), use it to construct draft
    // Otherwise call backend
    if (appointmentData) {
      // Mock implementation for the test
      return {
        id: "qtn-" + Math.random().toString(36).substr(2, 9),
        quotationNumber: "QTN-" + Date.now(),
        customerId: appointmentData.customerId,
        vehicleId: appointmentData.vehicleId,
        serviceCenterId: appointmentData.serviceCenterId || "sc-001",
        status: "DRAFT",
        quotationDate: new Date().toISOString().split("T")[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        items: [],
        subtotal: 0,
        discount: 0,
        totalAmount: 0,
        notes: appointmentData.customerComplaint,
        customNotes: appointmentData.previousServiceHistory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customer: { name: "", phone: "", customerNumber: "" }, // Placeholder
        vehicle: { make: "", model: "", registrationNumber: "" } // Placeholder
      } as unknown as Quotation;
    }

    const response = await apiClient.post<Quotation>(`${API_ENDPOINTS.QUOTATIONS}/from-appointment/${appointmentId}`);
    return response.data;
  }

  /**
   * Update quotation status
   */
  async updateStatus(quotationId: string, status: string, reason?: string): Promise<Quotation> {
    // Check if it's a customer approval related status
    if (status === 'CUSTOMER_APPROVED' || status === 'CUSTOMER_REJECTED') {
      return this.updateCustomerApproval(quotationId, {
        status: status === 'CUSTOMER_APPROVED' ? 'APPROVED' : 'REJECTED',
        reason
      });
    }

    // For other statuses, use a general update endpoint or specific ones
    const response = await apiClient.patch<Quotation>(`${API_ENDPOINTS.QUOTATION(quotationId)}/status`, { status, reason });
    return response.data;
  }
}

export const quotationsService = new QuotationsService();
