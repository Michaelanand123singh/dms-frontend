/**
 * Invoice Type Definitions for Central Inventory
 */

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

/**
 * Payment Status for Service Center Invoices
 */
export type PaymentStatus = "Paid" | "Unpaid" | "Overdue" | "Partially Paid";

/**
 * Invoice Statistics
 */
export interface InvoiceStats {
  total: number;
  paid: number;
  unpaid: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
}

/**
 * Service Center Invoice Item (simplified structure)
 */
export interface ServiceCenterInvoiceItem {
  name: string;
  qty: number;
  price: string;
}

/**
 * Service Center Invoice (for service center invoices page)
 */
export interface ServiceCenterInvoice {
  id: string;
  jobCardId?: string;
  customerId?: string;
  vehicleId?: string;
  customerName: string;
  vehicle: string;
  date: string;
  dueDate: string;
  amount: string;
  paidAmount: string;
  balance: string;
  status: PaymentStatus;
  paymentMethod?: string | null;
  serviceCenterId?: string;
  serviceCenterName?: string;
  items: ServiceCenterInvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  partId: string;
  partName: string;
  partNumber: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  serviceCenterId: string;
  serviceCenterName: string;
  partsIssueId: string;
  partsIssueNumber: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  issuedBy: string;
  issuedAt: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  totalAmount: number;
  paymentScreenshot?: string; // Base64 or URL
  paymentMethod?: string;
  paymentReference?: string;
  paidAt?: string;
  paidBy?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface InvoiceFormData {
  partsIssueId: string;
  purchaseOrderId?: string;
  paymentScreenshot?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
}
