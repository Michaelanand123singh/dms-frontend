/**
 * Mock data for Leads
 */

export interface Lead {
  id: string;
  serviceCenterId?: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string;
  vehicleDetails?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  inquiryType: string;
  serviceType?: string;
  source?: string;
  status: "new" | "in_discussion" | "job_card_in_progress" | "converted" | "lost";
  convertedTo?: "appointment" | "quotation" | "job_card";
  convertedId?: string;
  quotationId?: string; // Link to quotation
  jobCardId?: string; // Link to job card
  notes?: string;
  followUpDate?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export const defaultLeads: Lead[] = [
  {
    id: "lead-001",
    serviceCenterId: "sc-001",
    customerName: "Amit Patel",
    phone: "9876543210",
    email: "amit@example.com",
    vehicleMake: "Honda",
    vehicleModel: "City",
    inquiryType: "Service",
    serviceType: "Routine Maintenance",
    source: "walk_in",
    status: "new",
    notes: "Interested in regular service package",
    followUpDate: "2025-01-20",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "lead-002",
    serviceCenterId: "sc-001",
    customerName: "Priya Sharma",
    phone: "9876543211",
    email: "priya@example.com",
    vehicleMake: "Maruti",
    vehicleModel: "Swift",
    inquiryType: "Service",
    serviceType: "AC Service",
    source: "phone",
    status: "in_discussion",
    notes: "Called for AC service inquiry",
    followUpDate: "2025-01-18",
    createdAt: "2025-01-14T14:00:00Z",
    updatedAt: "2025-01-15T09:00:00Z",
  },
  {
    id: "lead-003",
    serviceCenterId: "sc-001",
    customerName: "Rohit Singh",
    phone: "9876543212",
    vehicleMake: "Hyundai",
    vehicleModel: "i20",
    inquiryType: "Service",
    serviceType: "Battery Replacement",
    source: "referral",
    status: "converted",
    notes: "Referred by existing customer",
    followUpDate: "2025-01-17",
    createdAt: "2025-01-13T11:00:00Z",
    updatedAt: "2025-01-14T16:00:00Z",
  },
];




