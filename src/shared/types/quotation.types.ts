export interface QuotationItem {
  id?: string;
  serialNumber: number;
  partName: string;
  partNumber?: string;
  hsnSacCode?: string;
  quantity: number;
  rate: number;
  gstPercent: number;
  amount: number;
}

export interface Insurer {
  id: string;
  name: string;
  address?: string;
  gstNumber?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface NoteTemplate {
  id: string;
  name: string;
  content: string;
  category?: string;
  isActive: boolean;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  serviceCenterId: string;
  customerId: string;
  vehicleId?: string;
  serviceAdvisorId?: string;
  appointmentId?: string | number; // Link to source appointment
  documentType: "Quotation" | "Proforma Invoice" | "Check-in Slip";
  quotationDate: string;
  validUntil?: string;
  hasInsurance: boolean;
  insurerId?: string;
  subtotal: number;
  discount: number;
  discountPercent: number;
  preGstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  notes?: string;
  batterySerialNumber?: string;
  customNotes?: string;
  noteTemplateId?: string;
  status:
    | "draft"
    | "sent_to_customer"
    | "customer_approved"
    | "customer_rejected"
    | "sent_to_manager"
    | "manager_approved"
    | "manager_rejected"
    | "no_response_lead"
    | "manager_quote";
  passedToManager: boolean;
  passedToManagerAt?: string;
  managerId?: string;
  // Vehicle Location
  vehicleLocation?: "with_customer" | "at_workshop";
  // Approval Workflow
  sentToCustomer?: boolean;
  sentToCustomerAt?: string;
  customerApproved?: boolean;
  customerApprovedAt?: string;
  customerRejected?: boolean;
  customerRejectedAt?: string;
  sentToManager?: boolean;
  sentToManagerAt?: string;
  managerApproved?: boolean;
  managerApprovedAt?: string;
  managerRejected?: boolean;
  managerRejectedAt?: string;
  whatsappSent?: boolean;
  whatsappSentAt?: string;
  createdAt: string;
  updatedAt: string;
  items: QuotationItem[];
  customer?: {
    id: string;
    firstName: string;
    lastName?: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    registration: string;
    vin: string;
  };
  insurer?: Insurer;
  serviceCenter?: {
    id: string;
    name: string;
    code: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone?: string;
    gstNumber?: string;
    panNumber?: string;
  };
}

export interface CreateQuotationForm {
  customerId: string;
  vehicleId?: string;
  documentType: "Quotation" | "Proforma Invoice" | "Check-in Slip";
  quotationDate: string;
  validUntil?: string;
  validUntilDays: number; // 15, 30, or custom
  hasInsurance: boolean;
  insurerId?: string;
  items: QuotationItem[];
  discount: number;
  notes?: string;
  batterySerialNumber?: string;
  customNotes?: string;
  noteTemplateId?: string;
  vehicleLocation?: "with_customer" | "at_workshop";
}

export type QuotationStatus =
  | "draft"
  | "sent_to_customer"
  | "customer_approved"
  | "customer_rejected"
  | "sent_to_manager"
  | "manager_approved"
  | "manager_rejected"
  | "no_response_lead"
  | "manager_quote";
export type QuotationFilterType =
  | "all"
  | "draft"
  | "sent_to_customer"
  | "customer_approved"
  | "customer_rejected"
  | "sent_to_manager"
  | "manager_approved"
  | "manager_rejected"
  | "no_response_lead"
  | "manager_quote";




