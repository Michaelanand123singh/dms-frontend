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
 * Legacy format for backward compatibility
 */
export interface ServiceCenterInvoiceItem {
  name: string;
  qty: number;
  price: string;
  // Extended GST fields (optional for backward compatibility)
  hsnSacCode?: string;
  unitPrice?: number;
  quantity?: number;
  taxableAmount?: number;
  gstRate?: number; // percentage
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalAmount?: number;
}

/**
 * Enhanced Service Center Invoice Item with full GST support
 */
export interface EnhancedServiceCenterInvoiceItem {
  name: string;
  hsnSacCode?: string;
  unitPrice: number;
  quantity: number;
  taxableAmount: number;
  gstRate: number; // percentage (e.g., 18 for 18%)
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

/**
 * Service Center Details for Invoice
 */
export interface ServiceCenterInvoiceDetails {
  name: string;
  address: string;
  city?: string;
  state: string;
  pincode?: string;
  gstNumber: string;
  panNumber: string;
  phone?: string;
  email?: string;
}

/**
 * Customer Details for Invoice
 */
export interface CustomerInvoiceDetails {
  name: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone: string;
  email?: string;
  gstNumber?: string;
  panNumber?: string;
}

/**
 * Bank Details for Invoice
 */
export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
}

/**
 * Service Center Invoice (for service center invoices page)
 * Extended with GST and tax support while maintaining backward compatibility
 */
export interface ServiceCenterInvoice {
  id: string;
  invoiceNumber?: string; // Proper sequential numbering (e.g., INV-SC001-2025-0001)
  jobCardId?: string;
  customerId?: string;
  vehicleId?: string;
  customerName: string;
  vehicle: string;
  date: string;
  dueDate: string;
  amount: string; // Legacy field - grand total as string
  paidAmount: string;
  balance: string;
  status: PaymentStatus;
  paymentMethod?: string | null;
  serviceCenterId?: string;
  serviceCenterName?: string;
  items: ServiceCenterInvoiceItem[]; // Legacy items array
  
  // Extended GST and tax fields
  serviceCenterDetails?: ServiceCenterInvoiceDetails;
  customerDetails?: CustomerInvoiceDetails;
  billingAddress?: string;
  shippingAddress?: string;
  placeOfSupply?: string; // State name
  subtotal?: number; // Total before tax
  totalTaxableAmount?: number;
  totalCgst?: number;
  totalSgst?: number;
  totalIgst?: number;
  totalTax?: number; // Sum of all taxes
  discount?: number;
  roundOff?: number;
  grandTotal?: number; // Final amount after all calculations
  amountInWords?: string;
  termsAndConditions?: string[];
  bankDetails?: BankDetails;
  createdBy?: string;
  approvedBy?: string;
  
  // Enhanced items array (optional, for new invoices)
  enhancedItems?: EnhancedServiceCenterInvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  partId: string;
  partName: string;
  partNumber: string;
  hsnCode: string; // HSN Code
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
