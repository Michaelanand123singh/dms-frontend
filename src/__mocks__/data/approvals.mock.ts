/**
 * Mock data for Approvals
 */

export interface DetailedRequest {
  id: string;
  type: string;
  description: string;
  amount: string;
  dateSubmitted: string;
  priority: "High" | "Medium" | "Low";
  status: string;
  submittedBy: string;
  submittedByInitial: string;
  submittedByRole: string;
  submittedByEmail: string;
  submittedByPhone: string;
  scLocation: string;
  scManager: string;
  supportingDocuments: Array<{ name: string; url: string }>;
}

export interface ApprovalItem {
  id: string;
  type: string;
  submittedBy: string;
  submittedByInitial: string;
  scLocation: string;
  amount: string;
  dateSubmitted: string;
  status: string;
}

export interface ApprovalData {
  serviceRequests: ApprovalItem[];
  warrantyClaims: ApprovalItem[];
  inventoryTransfers: ApprovalItem[];
  stockAdjustments: ApprovalItem[];
  discountRequests: ApprovalItem[];
}

export const detailedWarrantyClaims: Record<string, DetailedRequest> = {
  "WC-001": {
    id: "WC-001",
    type: "Warranty Claim",
    description: "Engine Warranty Claim - Manufacturing defect",
    amount: "₹15,000",
    dateSubmitted: "2024-11-08",
    priority: "High",
    status: "Pending",
    submittedBy: "Pune Manager",
    submittedByInitial: "P",
    submittedByRole: "SC Manager",
    submittedByEmail: "pune@service.com",
    submittedByPhone: "+91-9876-543-213",
    scLocation: "Pune Elite Care",
    scManager: "Pune Manager",
    supportingDocuments: [
      { name: "warranty_certificate.pdf", url: "#" },
      { name: "defect_report.pdf", url: "#" },
    ],
  },
  "WC-002": {
    id: "WC-002",
    type: "Warranty Claim",
    description: "Transmission Warranty Claim - Gearbox failure",
    amount: "₹9,500",
    dateSubmitted: "2024-11-09",
    priority: "Medium",
    status: "Pending",
    submittedBy: "Mumbai Manager",
    submittedByInitial: "M",
    submittedByRole: "SC Manager",
    submittedByEmail: "mumbai@service.com",
    submittedByPhone: "+91-9876-543-211",
    scLocation: "Mumbai Metroplex",
    scManager: "Mumbai Manager",
    supportingDocuments: [
      { name: "warranty_certificate.pdf", url: "#" },
      { name: "defect_report.pdf", url: "#" },
    ],
  },
};

export const detailedServiceRequests: Record<string, DetailedRequest> = {
  "SR-001": {
    id: "SR-001",
    type: "Service Request",
    description: "Engine Overhaul - Complete engine rebuild required",
    amount: "₹12,000",
    dateSubmitted: "2024-11-10",
    priority: "High",
    status: "Pending",
    submittedBy: "Delhi Manager",
    submittedByInitial: "D",
    submittedByRole: "SC Manager",
    submittedByEmail: "delhi@service.com",
    submittedByPhone: "+91-9876-543-210",
    scLocation: "Delhi Central Hub",
    scManager: "Delhi Manager",
    supportingDocuments: [
      { name: "engine_inspection_report.pdf", url: "#" },
      { name: "cost_estimate.pdf", url: "#" },
    ],
  },
  "SR-002": {
    id: "SR-002",
    type: "Service Request",
    description: "Transmission Repair - Gear shifting issues",
    amount: "₹8,500",
    dateSubmitted: "2024-11-09",
    priority: "Medium",
    status: "Pending",
    submittedBy: "Mumbai Manager",
    submittedByInitial: "M",
    submittedByRole: "SC Manager",
    submittedByEmail: "mumbai@service.com",
    submittedByPhone: "+91-9876-543-211",
    scLocation: "Mumbai Metroplex",
    scManager: "Mumbai Manager",
    supportingDocuments: [
      { name: "transmission_diagnosis.pdf", url: "#" },
      { name: "repair_estimate.pdf", url: "#" },
    ],
  },
  "SR-003": {
    id: "SR-003",
    type: "Service Request",
    description: "Brake System Overhaul - Complete brake replacement",
    amount: "₹6,200",
    dateSubmitted: "2024-11-11",
    priority: "High",
    status: "Pending",
    submittedBy: "Bangalore Manager",
    submittedByInitial: "B",
    submittedByRole: "SC Manager",
    submittedByEmail: "bangalore@service.com",
    submittedByPhone: "+91-9876-543-212",
    scLocation: "Bangalore Innovation Center",
    scManager: "Bangalore Manager",
    supportingDocuments: [
      { name: "brake_inspection.pdf", url: "#" },
      { name: "parts_quote.pdf", url: "#" },
    ],
  },
};

export const approvalData: ApprovalData = {
  serviceRequests: [
    {
      id: "SR-001",
      type: "Service Request",
      submittedBy: "Delhi Manager",
      submittedByInitial: "D",
      scLocation: "Delhi Central Hub",
      amount: "₹12,000",
      dateSubmitted: "2024-11-10",
      status: "Pending",
    },
    {
      id: "SR-002",
      type: "Service Request",
      submittedBy: "Mumbai Manager",
      submittedByInitial: "M",
      scLocation: "Mumbai Metroplex",
      amount: "₹8,500",
      dateSubmitted: "2024-11-09",
      status: "Pending",
    },
    {
      id: "SR-003",
      type: "Service Request",
      submittedBy: "Bangalore Manager",
      submittedByInitial: "B",
      scLocation: "Bangalore Innovation Center",
      amount: "₹6,200",
      dateSubmitted: "2024-11-11",
      status: "Pending",
    },
  ],
  warrantyClaims: [
    {
      id: "WC-001",
      type: "Warranty Claim",
      submittedBy: "Delhi Manager",
      submittedByInitial: "D",
      scLocation: "Delhi Central Hub",
      amount: "₹15,000",
      dateSubmitted: "2024-11-10",
      status: "Pending",
    },
    {
      id: "WC-002",
      type: "Warranty Claim",
      submittedBy: "Mumbai Manager",
      submittedByInitial: "M",
      scLocation: "Mumbai Metroplex",
      amount: "₹9,500",
      dateSubmitted: "2024-11-09",
      status: "Pending",
    },
  ],
  inventoryTransfers: [
    {
      id: "IT-001",
      type: "Inventory Transfer",
      submittedBy: "Delhi Manager",
      submittedByInitial: "D",
      scLocation: "Delhi Central Hub",
      amount: "50 units",
      dateSubmitted: "2024-11-11",
      status: "Pending",
    },
    {
      id: "IT-002",
      type: "Inventory Transfer",
      submittedBy: "Bangalore Manager",
      submittedByInitial: "B",
      scLocation: "Bangalore Innovation Center",
      amount: "30 units",
      dateSubmitted: "2024-11-09",
      status: "Pending",
    },
  ],
  stockAdjustments: [
    {
      id: "SA-001",
      type: "Stock Adjustment",
      submittedBy: "Mumbai Manager",
      submittedByInitial: "M",
      scLocation: "Mumbai Metroplex",
      amount: "10 units",
      dateSubmitted: "2024-11-10",
      status: "Pending",
    },
    {
      id: "SA-002",
      type: "Stock Adjustment",
      submittedBy: "Delhi Manager",
      submittedByInitial: "D",
      scLocation: "Delhi Central Hub",
      amount: "8 units",
      dateSubmitted: "2024-11-11",
      status: "Pending",
    },
  ],
  discountRequests: [
    {
      id: "DR-001",
      type: "Discount Request",
      submittedBy: "Bangalore Manager",
      submittedByInitial: "B",
      scLocation: "Bangalore Innovation Center",
      amount: "15%",
      dateSubmitted: "2024-11-10",
      status: "Pending",
    },
    {
      id: "DR-002",
      type: "Discount Request",
      submittedBy: "Pune Manager",
      submittedByInitial: "P",
      scLocation: "Pune Elite Care",
      amount: "10%",
      dateSubmitted: "2024-11-09",
      status: "Pending",
    },
  ],
};

