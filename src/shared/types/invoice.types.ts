/**
 * Invoice Type Definitions
 */

export type PaymentStatus = "Paid" | "Unpaid" | "Overdue" | "Partially Paid";
export type PaymentMethod = "Cash" | "Card" | "UPI" | "Online" | "Cheque" | null;

export interface InvoiceItem {
  name: string;
  qty: number;
  price: string;
}

export interface Invoice {
  id: string;
  jobCardId?: string;
  customerName: string;
  vehicle: string;
  date: string;
  dueDate: string;
  amount: string;
  paidAmount: string;
  balance: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  items: InvoiceItem[];
  customerId?: string;
  vehicleId?: string;
  serviceCenterId?: string | number;
  serviceCenterName?: string;
}

export interface InvoiceStats {
  total: number;
  paid: number;
  unpaid: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
}

