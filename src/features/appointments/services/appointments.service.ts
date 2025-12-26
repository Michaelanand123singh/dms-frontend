/**
 * Appointments Service - Business logic layer for appointment operations
 */

import { apiClient } from "@/core/api";
import { API_ENDPOINTS } from "@/config/api.config";

class AppointmentsService {

  async getAll(params?: any): Promise<any[]> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get(`${API_ENDPOINTS.APPOINTMENTS}${queryString}`);
    return response.data;
  }

  async getById(id: string): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.APPOINTMENT(id));
    return response.data;
  }

  async create(data: any): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.APPOINTMENTS, data);
    return response.data;
  }

  async update(id: string, data: any): Promise<any> {
    const response = await apiClient.patch(API_ENDPOINTS.APPOINTMENT(id), data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.APPOINTMENT(id));
  }

  async linkQuotation(appointmentId: string, quotationId: string): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.APPOINTMENT(appointmentId)}/link-quotation`, {
      quotationId,
    });
  }
}

export const appointmentsService = new AppointmentsService();

