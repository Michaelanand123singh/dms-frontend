/**
 * Approvals Form Schema
 * Defines form structure for approval actions
 */

export interface ApprovalFormData {
  notes: string;
  assignedEngineer?: string;
}

export function getInitialApprovalFormData(): ApprovalFormData {
  return {
    notes: "",
    assignedEngineer: "",
  };
}

