import { apiClient } from "@/core/api";
import { API_ENDPOINTS } from "@/config/api.config";

export interface CreatePartsIssueDto {
    jobCardId: string;
    items: {
        partId: string;
        quantity: number;
        isWarranty?: boolean;
        serialNumber?: string;
    }[];
    notes?: string;
}

export interface PartsIssue {
    id: string;
    jobCardId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED';
    items: {
        id: string;
        partId: string;
        quantity: number;
        isWarranty: boolean;
        serialNumber?: string;
    }[];
    requestedBy: string;
    requestedAt: string;
    approvedBy?: string;
    approvedAt?: string;
}

class PartsIssueService {
    async create(data: CreatePartsIssueDto): Promise<PartsIssue> {
        const response = await apiClient.post<PartsIssue>(API_ENDPOINTS.PARTS_ISSUES || '/parts-issues', data);
        return response.data;
    }

    async getAll(params?: any): Promise<PartsIssue[]> {
        const response = await apiClient.get<PartsIssue[]>(API_ENDPOINTS.PARTS_ISSUES || '/parts-issues', { params });
        return response.data;
    }

    async getById(id: string): Promise<PartsIssue> {
        const response = await apiClient.get<PartsIssue>(`${API_ENDPOINTS.PARTS_ISSUES || '/parts-issues'}/${id}`);
        return response.data;
    }

    async approve(id: string, approvedItems: any[]): Promise<PartsIssue> {
        const response = await apiClient.patch<PartsIssue>(`${API_ENDPOINTS.PARTS_ISSUES || '/parts-issues'}/${id}/approve`, { approvedItems });
        return response.data;
    }

    async dispatch(id: string, transportDetails: any): Promise<PartsIssue> {
        const response = await apiClient.patch<PartsIssue>(`${API_ENDPOINTS.PARTS_ISSUES || '/parts-issues'}/${id}/dispatch`, { transportDetails });
        return response.data;
    }

    async receive(id: string, receivedItems: any[]): Promise<PartsIssue> {
        const response = await apiClient.patch<PartsIssue>(`${API_ENDPOINTS.PARTS_ISSUES || '/parts-issues'}/${id}/receive`, { receivedItems });
        return response.data;
    }
}

export const partsIssueService = new PartsIssueService();
