/**
 * Central Issue Service - Simplified version using backend API
 * Migrated from mock repository
 * Note: adminApproval.service.ts handles the complex workflow logic
 */

import { apiClient } from '@/core/api/client';
import type { PartsIssue, PartsIssueFormData } from '@/shared/types/central-inventory.types';

class CentralIssueService {
  /**
   * Create parts issue (simple version - backend handles stock updates)
   */
  async createPartsIssue(
    formData: PartsIssueFormData,
    issuedBy: string
  ): Promise<{ issue: PartsIssue; stockUpdates: any[] }> {
    // Backend endpoint would handle creating the issue and updating stock
    const response = await apiClient.post<{ issue: PartsIssue; stockUpdates: any[] }>(
      '/parts-issues',
      {
        ...formData,
        issuedBy,
      }
    );
    return response.data;
  }

  /**
   * Get all parts issues
   */
  async getAllPartsIssues(): Promise<PartsIssue[]> {
    const response = await apiClient.get<PartsIssue[]>('/parts-issues');
    return response.data;
  }

  /**
   * Get parts issue by ID
   */
  async getPartsIssueById(id: string): Promise<PartsIssue> {
    const response = await apiClient.get<PartsIssue>(`/parts-issues/${id}`);
    return response.data;
  }
}

export const centralIssueService = new CentralIssueService();
