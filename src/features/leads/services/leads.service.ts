/**
 * Leads Service - Business logic layer for lead management operations
 */

import { apiClient } from "@/core/api";
import { API_ENDPOINTS } from "@/config/api.config";

export interface Lead {
    id: string;
    leadNumber: string;
    customerName: string;
    phone: string;
    email?: string;
    vehicleModel?: string;
    vehicleRegistration?: string;
    serviceType?: string;
    source: 'WEBSITE' | 'PHONE' | 'WALK_IN' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'OTHER';
    status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
    notes?: string;
    serviceCenterId: string;
    assignedToId?: string;
    convertedToQuotationId?: string;
    convertedToJobCardId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLeadData {
    customerName: string;
    phone: string;
    email?: string;
    vehicleModel?: string;
    vehicleRegistration?: string;
    serviceType?: string;
    source?: Lead['source'];
    notes?: string;
    serviceCenterId: string;
    assignedTo?: string;
}

class LeadsService {
    async getAll(params?: any): Promise<Lead[]> {
        const response = await apiClient.get<Lead[]>(API_ENDPOINTS.LEADS, { params });
        return response.data;
    }

    async getById(id: string): Promise<Lead> {
        const response = await apiClient.get<Lead>(`${API_ENDPOINTS.LEADS}/${id}`);
        return response.data;
    }

    async create(data: CreateLeadData): Promise<Lead> {
        const response = await apiClient.post<Lead>(API_ENDPOINTS.LEADS, data);
        return response.data;
    }

    async update(id: string, data: Partial<CreateLeadData>): Promise<Lead> {
        const response = await apiClient.patch<Lead>(`${API_ENDPOINTS.LEADS}/${id}`, data);
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await apiClient.delete(`${API_ENDPOINTS.LEADS}/${id}`);
    }

    async convertToQuotation(leadId: string, quotationId: string): Promise<Lead> {
        const response = await apiClient.post<Lead>(
            `${API_ENDPOINTS.LEADS}/${leadId}/convert-to-quotation`,
            { quotationId }
        );
        return response.data;
    }

    async convertToJobCard(leadId: string, jobCardId: string): Promise<Lead> {
        const response = await apiClient.post<Lead>(
            `${API_ENDPOINTS.LEADS}/${leadId}/convert-to-job-card`,
            { jobCardId }
        );
        return response.data;
    }
}

export const leadsService = new LeadsService();
