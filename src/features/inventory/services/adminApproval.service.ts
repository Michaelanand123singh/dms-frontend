/**
 * Admin Approval Service for Parts Issue Requests
 */

import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { centralInventoryRepository } from "@/__mocks__/repositories/central-inventory.repository";
import type { PartsIssue, PartsIssueFormData } from "@/shared/types/central-inventory.types";

const STORAGE_KEY = "partsIssueRequests";

class AdminApprovalService {
  /**
   * Create a parts issue request (pending admin approval)
   */
  async createPartsIssueRequest(
    formData: PartsIssueFormData,
    requestedBy: string
  ): Promise<PartsIssue> {
    // Generate issue number
    const allRequests = this.getAllRequests();
    const issueNumber = `PI-${new Date().getFullYear()}-${String(
      allRequests.length + 1
    ).padStart(3, "0")}`;

    // Calculate total amount
    const stock = await centralInventoryRepository.getAllStock();
    const totalAmount = formData.items.reduce((sum, item) => {
      const stockItem = stock.find((s) => s.id === item.fromStock);
      if (!stockItem) return sum;
      return sum + stockItem.unitPrice * item.quantity;
    }, 0);

    // Get service center info
    const serviceCenters = await centralInventoryRepository.getAllServiceCenters();
    const serviceCenter = serviceCenters.find((sc) => sc.id === formData.serviceCenterId);
    if (!serviceCenter) {
      throw new Error("Service center not found");
    }

    // Create issue items
    const issueItems = formData.items.map((item) => {
      const stockItem = stock.find((s) => s.id === item.fromStock);
      if (!stockItem) {
        throw new Error(`Stock not found for item: ${item.partId}`);
      }

      return {
        id: `pii-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        partId: item.partId,
        partName: stockItem.partName,
        partNumber: stockItem.partNumber,
        hsnCode: stockItem.hsnCode,
        quantity: item.quantity,
        unitPrice: stockItem.unitPrice,
        totalPrice: stockItem.unitPrice * item.quantity,
        fromStock: item.fromStock,
      };
    });

    const issue: PartsIssue = {
      id: `pi-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      issueNumber,
      serviceCenterId: formData.serviceCenterId,
      serviceCenterName: serviceCenter.name,
      issuedBy: requestedBy,
      issuedAt: new Date().toISOString(),
      status: "pending_admin_approval",
      items: issueItems,
      totalAmount,
      purchaseOrderId: formData.purchaseOrderId,
      notes: formData.notes,
      transportDetails: formData.transportDetails,
      sentToAdmin: true,
      sentToAdminAt: new Date().toISOString(),
    };

    const requests = this.getAllRequests();
    requests.unshift(issue);
    safeStorage.setItem(STORAGE_KEY, requests);
    
    // Debug: Log the saved request
    console.log("Parts issue request created and saved:", {
      id: issue.id,
      issueNumber: issue.issueNumber,
      status: issue.status,
      sentToAdmin: issue.sentToAdmin,
      totalRequests: requests.length
    });

    return issue;
  }

  /**
   * Get all requests (from storage)
   */
  private getAllRequests(): PartsIssue[] {
    return safeStorage.getItem<PartsIssue[]>(STORAGE_KEY, []);
  }

  /**
   * Get all pending admin approval requests
   */
  async getPendingApprovals(): Promise<PartsIssue[]> {
    const all = await this.getAllIssues();
    const storageRequests = this.getAllRequests();
    
    // Debug: Log what we're finding
    console.log("Fetching pending approvals:", {
      totalIssues: all.length,
      storageRequests: storageRequests.length,
      storageRequestsWithStatus: storageRequests.filter(r => r.status === "pending_admin_approval").length
    });
    
    const pending = all.filter(
      (issue) =>
        issue.status === "pending_admin_approval" &&
        issue.sentToAdmin &&
        !issue.adminApproved &&
        !issue.adminRejected
    );
    
    console.log("Pending approvals found:", pending.length);
    
    return pending;
  }

  /**
   * Get all issues (combine storage and repository)
   */
  async getAllIssues(): Promise<PartsIssue[]> {
    const storageRequests = this.getAllRequests();
    const repositoryIssues = await centralInventoryRepository.getAllPartsIssues();
    
    // Prioritize storage requests (pending approvals) over repository issues
    // Merge and deduplicate by ID, but storage requests take precedence
    const allIssues: PartsIssue[] = [...storageRequests];
    
    // Add repository issues that aren't already in storage
    repositoryIssues.forEach((repoIssue) => {
      const exists = allIssues.find((issue) => issue.id === repoIssue.id);
      if (!exists) {
        allIssues.push(repoIssue);
      }
    });
    
    return allIssues;
  }

  /**
   * Get issue by ID
   */
  async getIssueById(id: string): Promise<PartsIssue | null> {
    const all = await this.getAllIssues();
    return all.find((issue) => issue.id === id) || null;
  }

  /**
   * Approve parts issue request by admin
   */
  async approvePartsIssue(
    issueId: string,
    approvedBy: string,
    notes?: string
  ): Promise<PartsIssue> {
    const issue = await this.getIssueById(issueId);
    if (!issue) {
      throw new Error("Issue request not found");
    }

    if (issue.status !== "pending_admin_approval") {
      throw new Error("Issue is not pending admin approval");
    }

    // Update issue status - just approve, don't issue yet
    // Central inventory manager will issue the parts after approval
    issue.adminApproved = true;
    issue.adminApprovedBy = approvedBy;
    issue.adminApprovedAt = new Date().toISOString();
    issue.status = "admin_approved";
    if (notes) {
      issue.notes = issue.notes ? `${issue.notes}\nAdmin Notes: ${notes}` : notes;
    }

    // Update storage - don't issue parts yet, just mark as approved
    const requests = this.getAllRequests();
    const index = requests.findIndex((r) => r.id === issueId);
    if (index >= 0) {
      requests[index] = issue;
      safeStorage.setItem(STORAGE_KEY, requests);
    }

    return issue;
  }

  /**
   * Reject parts issue request by admin
   */
  async rejectPartsIssue(
    issueId: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<PartsIssue> {
    const issue = await this.getIssueById(issueId);
    if (!issue) {
      throw new Error("Issue request not found");
    }

    if (issue.status !== "pending_admin_approval") {
      throw new Error("Issue is not pending admin approval");
    }

    issue.adminRejected = true;
    issue.adminRejectedBy = rejectedBy;
    issue.adminRejectedAt = new Date().toISOString();
    issue.adminRejectionReason = rejectionReason;
    issue.status = "admin_rejected";

    // Update storage
    const requests = this.getAllRequests();
    const index = requests.findIndex((r) => r.id === issueId);
    if (index >= 0) {
      requests[index] = issue;
      safeStorage.setItem(STORAGE_KEY, requests);
    }

    return issue;
  }

  /**
   * Resend request to admin (if no response)
   */
  async resendToAdmin(issueId: string): Promise<PartsIssue> {
    const issue = await this.getIssueById(issueId);
    if (!issue) {
      throw new Error("Issue request not found");
    }

    if (issue.adminApproved || issue.adminRejected) {
      throw new Error("Issue has already been responded to");
    }

    issue.sentToAdmin = true;
    issue.sentToAdminAt = new Date().toISOString();
    issue.status = "pending_admin_approval";

    // Update storage
    const requests = this.getAllRequests();
    const index = requests.findIndex((r) => r.id === issueId);
    if (index >= 0) {
      requests[index] = issue;
      safeStorage.setItem(STORAGE_KEY, requests);
    }

    return issue;
  }

  /**
   * Issue parts for an approved request (called by central inventory manager)
   */
  async issueApprovedParts(
    issueId: string,
    issuedBy: string
  ): Promise<PartsIssue> {
    const issue = await this.getIssueById(issueId);
    if (!issue) {
      throw new Error("Issue request not found");
    }

    if (issue.status === "issued") {
      throw new Error("Parts have already been issued for this request");
    }

    if (!issue.adminApproved || issue.status !== "admin_approved") {
      throw new Error("Issue must be approved by admin before parts can be issued");
    }

    // Now actually issue the parts (decrease stock)
    const formData: PartsIssueFormData = {
      serviceCenterId: issue.serviceCenterId,
      purchaseOrderId: issue.purchaseOrderId,
      items: issue.items.map((item) => ({
        partId: item.partId,
        quantity: item.quantity,
        fromStock: item.fromStock,
      })),
      notes: issue.notes,
      transportDetails: issue.transportDetails,
    };

    // Issue parts (this will decrease stock)
    const result = await centralInventoryRepository.createPartsIssue(
      formData,
      issuedBy
    );

    // Update the original request with the issued status
    issue.status = "issued";
    issue.issueNumber = result.issue.issueNumber;
    issue.issuedBy = issuedBy;
    issue.issuedAt = new Date().toISOString();

    // Update storage
    const requests = this.getAllRequests();
    const index = requests.findIndex((r) => r.id === issueId);
    if (index >= 0) {
      requests[index] = issue;
      safeStorage.setItem(STORAGE_KEY, requests);
    }

    return issue;
  }
}

export const adminApprovalService = new AdminApprovalService();

