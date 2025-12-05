/**
 * Parts Issue Type Definitions
 */

export interface PartsIssue {
  id: string;
  jobCardId: string;
  parts: Array<{
    partId: string;
    partName: string;
    partNumber: string;
    quantity: number;
  }>;
  status: "pending" | "issued" | "rejected";
  issuedAt?: string;
  createdAt: string;
}

export interface PartsIssueRequest {
  jobCardId: string;
  parts: Array<{
    partId: string;
    partName: string;
    partNumber: string;
    quantity: number;
  }>;
}

export interface PartsIssueResponse {
  success: boolean;
  issueId: string;
  message?: string;
}

