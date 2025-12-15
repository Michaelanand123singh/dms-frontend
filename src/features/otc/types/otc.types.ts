/**
 * OTC (Over The Counter) Orders Type Definitions
 */

export interface OTCPart {
  id: number;
  name: string;
  hsnCode: string;
  price: number;
  stock: number;
  category: string;
}

export interface CartItem extends OTCPart {
  quantity: number;
}

export interface CustomerInfo {
  phone: string;
  name: string;
  vehicleNumber: string;
  vin: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  tax: number;
  total: number;
}

