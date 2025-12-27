/**
 * Admin Approval Service
 * Migrated to use Backend APIs directly, replacing localStorage mock.
 */

import { apiClient } from "@/core/api/client";
import { centralInventoryRepository } from '@/core/repositories/central-inventory.repository';
import type { PartsIssue, PartsIssueFormData } from "@/shared/types/central-inventory.types";

class AdminApprovalService {

  /**
   * Create a parts issue request
   */
  async createPartsIssueRequest(formData: PartsIssueFormData, requestedBy: string): Promise<PartsIssue> {
    const { issue } = await centralInventoryRepository.createPartsIssue(formData, requestedBy);
    return issue;
  }

  /**
   * Get pending approvals from backend
   */
  async getPendingApprovals(): Promise<PartsIssue[]> {
    try {
      const response = await apiClient.get<any>('/parts-issues', { params: { status: 'PENDING_APPROVAL', limit: 100 } });

      // Handle pagination structure
      let data = response.data;
      if (data && typeof data === 'object' && 'data' in data) {
        data = data.data;
      }

      const list = Array.isArray(data) ? data : [];
      return list.map(this.mapBackendIssueToFrontend);
    } catch (e) {
      console.error("Failed to fetch pending approvals", e);
      return [];
    }
  }

  /**
   * Get all issues
   */
  async getAllIssues(): Promise<PartsIssue[]> {
    return centralInventoryRepository.getAllPartsIssues();
  }

  /**
   * Get issue by ID
   */
  async getIssueById(id: string): Promise<PartsIssue | null> {
    try {
      const response = await apiClient.get<any>(`/parts-issues/${id}`);
      return this.mapBackendIssueToFrontend(response.data);
    } catch (e) {
      return null;
    }
  }

  /**
   * Approve parts issue
   */
  async approvePartsIssue(issueId: string, approvedBy: string, notes?: string): Promise<PartsIssue> {
    const issue = await this.getIssueById(issueId);
    if (!issue) throw new Error("Issue not found");

    // Auto-approve all requested items
    const approvedItems = issue.items.map(item => ({
      itemId: item.id, // ID from fetching issue
      approvedQty: item.quantity
    }));

    const response = await apiClient.patch<any>(`/parts-issues/${issueId}/approve`, {
      approvedItems
    });
    return this.mapBackendIssueToFrontend(response.data);
  }

  /**
   * Reject parts issue
   */
  async rejectPartsIssue(issueId: string, rejectedBy: string, rejectionReason: string): Promise<PartsIssue> {
    const response = await apiClient.patch<any>(`/parts-issues/${issueId}/reject`, {
      reason: rejectionReason
    });
    return this.mapBackendIssueToFrontend(response.data);
  }

  /**
   * Resend to admin (Not supported by backend yet)
   */
  async resendToAdmin(issueId: string): Promise<PartsIssue> {
    console.warn("Resend not supported by backend. Please create a new request.");
    const issue = await this.getIssueById(issueId);
    return issue!;
  }

  /**
   * Issue/Dispatch parts
   */
  async issueApprovedParts(issueId: string, issuedBy: string): Promise<PartsIssue> {
    const response = await apiClient.patch<any>(`/parts-issues/${issueId}/dispatch`, {
      transportDetails: { dispatchedBy: issuedBy }
    });
    return this.mapBackendIssueToFrontend(response.data);
  }

  /**
   * Map backend entity to PartsIssue
   */
  private mapBackendIssueToFrontend(backendIssue: any): PartsIssue {
    const statusMap: Record<string, any> = {
      'PENDING_APPROVAL': 'pending_admin_approval',
      'APPROVED': 'admin_approved',
      'REJECTED': 'admin_rejected',
      'DISPATCHED': 'issued',
      'COMPLETED': 'received'
    };

    return {
      ...backendIssue,
      status: statusMap[backendIssue.status] || backendIssue.status?.toLowerCase(),
      items: backendIssue.items?.map((item: any) => ({
        id: item.id,
        partId: item.centralInventoryPartId || item.partId,
        partName: item.centralInventoryPart?.partName || item.partName || "Unknown Part",
        partNumber: item.centralInventoryPart?.partNumber || item.partNumber || "",
        hsnCode: item.centralInventoryPart?.hsnCode || "",
        fromStock: item.centralInventoryPartId || item.fromStock,
        quantity: item.requestedQty || item.quantity,
        unitPrice: item.centralInventoryPart?.unitPrice || 0,
        totalPrice: (item.centralInventoryPart?.unitPrice || 0) * (item.requestedQty || item.quantity),
      })) || []
    };
  }
}

export const adminApprovalService = new AdminApprovalService();
