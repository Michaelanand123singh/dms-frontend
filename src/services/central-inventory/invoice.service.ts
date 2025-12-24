/**
 * Invoice Service - Simplified version using backend API
 * Migrated from mock repository
 */

import { apiClient } from '@/core/api/client';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  supplierId: string;
  supplierName: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  taxAmount: number;
  status: 'Draft' | 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  items: InvoiceItem[];
  notes?: string;
  createdAt?: string;
}

export interface InvoiceItem {
  id?: string;
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate?: number;
  taxAmount?: number;
}

class InvoiceService {
  /**
   * Get all invoices
   */
  async getAllInvoices(): Promise<Invoice[]> {
    const response = await apiClient.get<Invoice[]>('/invoices');
    return response.data;
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(`/invoices/${id}`);
    return response.data;
  }

  /**
   * Create invoice
   */
  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    const response = await apiClient.post<Invoice>('/invoices', data);
    return response.data;
  }

  /**
   * Update invoice
   */
  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const response = await apiClient.patch<Invoice>(`/invoices/${id}`, data);
    return response.data;
  }
}

export const invoiceService = new InvoiceService();
