/**
 * Job Card Service - Business logic layer for job card operations
 */

import { apiClient } from "@/core/api";
import { API_ENDPOINTS } from "@/config/api.config";
import type { JobCard } from "@/shared/types/job-card.types";

class JobCardService {
  async getAll(params?: any): Promise<JobCard[]> {
    const response = await apiClient.get<JobCard[]>(API_ENDPOINTS.JOB_CARDS, { params });
    return response.data;
  }

  async getById(id: string): Promise<JobCard | null> {
    try {
      const response = await apiClient.get<JobCard>(`${API_ENDPOINTS.JOB_CARDS}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Job card ${id} not found`, error);
      return null;
    }
  }

  async create(jobCard: Partial<JobCard>): Promise<JobCard> {
    const response = await apiClient.post<JobCard>(API_ENDPOINTS.JOB_CARDS, jobCard);
    return response.data;
  }

  async update(jobCardId: string, jobCard: Partial<JobCard>): Promise<JobCard> {
    const response = await apiClient.patch<JobCard>(
      `${API_ENDPOINTS.JOB_CARDS}/${jobCardId}`,
      jobCard
    );
    return response.data;
  }

  async createFromQuotation(quotationId: string, engineerId?: string): Promise<JobCard> {
    const response = await apiClient.post<JobCard>(`${API_ENDPOINTS.JOB_CARD(quotationId)}/from-quotation`, {
      engineerId,
    });
    return response.data;
  }

  async assignEngineer(jobCardId: string, engineerId: string, engineerName: string): Promise<JobCard> {
    const response = await apiClient.post<JobCard>(`${API_ENDPOINTS.JOB_CARD(jobCardId)}/assign-engineer`, {
      engineerId,
    });
    return response.data;
  }

  async updateStatus(jobCardId: string, status: string): Promise<JobCard> {
    const response = await apiClient.patch<JobCard>(`${API_ENDPOINTS.JOB_CARD(jobCardId)}/status`, {
      status,
    });
    return response.data;
  }

  async passToManager(jobCardId: string, managerId: string): Promise<JobCard> {
    const response = await apiClient.post<JobCard>(
      `${API_ENDPOINTS.JOB_CARD(jobCardId)}/pass-to-manager`,
      { managerId }
    );
    return response.data;
  }

  async managerReview(
    jobCardId: string,
    data: { status: "APPROVED" | "REJECTED"; notes?: string }
  ): Promise<JobCard> {
    const response = await apiClient.post<JobCard>(
      `${API_ENDPOINTS.JOB_CARD(jobCardId)}/manager-review`,
      data
    );
    return response.data;
  }

  async convertToActual(jobCardId: string): Promise<JobCard> {
    const response = await apiClient.post<JobCard>(
      `${API_ENDPOINTS.JOB_CARD(jobCardId)}/convert-to-actual`,
      {}
    );
    return response.data;
  }
}

export const jobCardService = new JobCardService();

