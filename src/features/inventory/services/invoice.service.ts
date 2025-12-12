/**
 * Invoice Service for Central Inventory
 */

import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { centralInventoryRepository } from "@/__mocks__/repositories/central-inventory.repository";
import type { PartsIssue } from "@/shared/types/central-inventory.types";
import type { Invoice, InvoiceFormData } from "@/shared/types/invoice.types";

const STORAGE_KEY = "centralInventoryInvoices";

class InvoiceService {
  /**
   * Create invoice from parts issue
   */
  async createInvoice(
    partsIssue: PartsIssue,
    formData: InvoiceFormData
  ): Promise<Invoice> {
    // Generate invoice number
    const allInvoices = this.getAllInvoices();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
      allInvoices.length + 1
    ).padStart(4, "0")}`;

    // Calculate totals
    const subtotal = partsIssue.totalAmount;
    const tax = 0; // Can be added later
    const discount = 0; // Can be added later
    const totalAmount = subtotal + (tax || 0) - (discount || 0);

    // Create invoice items from parts issue items
    const invoiceItems = partsIssue.items.map((item) => ({
      id: `inv-item-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      partId: item.partId,
      partName: item.partName,
      partNumber: item.partNumber,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));

    const invoice: Invoice = {
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      invoiceNumber,
      serviceCenterId: partsIssue.serviceCenterId,
      serviceCenterName: partsIssue.serviceCenterName,
      partsIssueId: partsIssue.id,
      partsIssueNumber: partsIssue.issueNumber,
      purchaseOrderId: formData.purchaseOrderId || partsIssue.purchaseOrderId,
      purchaseOrderNumber: partsIssue.purchaseOrderId
        ? await this.getPurchaseOrderNumber(partsIssue.purchaseOrderId)
        : undefined,
      issuedBy: partsIssue.issuedBy,
      issuedAt: partsIssue.issuedAt,
      status: formData.paymentScreenshot ? "paid" : "sent",
      items: invoiceItems,
      subtotal,
      tax,
      discount,
      totalAmount,
      paymentScreenshot: formData.paymentScreenshot,
      paymentMethod: formData.paymentMethod,
      paymentReference: formData.paymentReference,
      paidAt: formData.paymentScreenshot ? new Date().toISOString() : undefined,
      paidBy: formData.paymentScreenshot ? partsIssue.issuedBy : undefined,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      createdBy: partsIssue.issuedBy,
    };

    // Save invoice
    const invoices = this.getAllInvoices();
    invoices.unshift(invoice);
    safeStorage.setItem(STORAGE_KEY, invoices);

    return invoice;
  }

  /**
   * Get all invoices
   */
  getAllInvoices(): Invoice[] {
    return safeStorage.getItem<Invoice[]>(STORAGE_KEY, []);
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string): Promise<Invoice | null> {
    const invoices = this.getAllInvoices();
    return invoices.find((inv) => inv.id === id) || null;
  }

  /**
   * Get invoices by service center
   */
  async getInvoicesByServiceCenter(
    serviceCenterId: string
  ): Promise<Invoice[]> {
    const invoices = this.getAllInvoices();
    return invoices.filter((inv) => inv.serviceCenterId === serviceCenterId);
  }

  /**
   * Get invoice by parts issue ID
   */
  async getInvoiceByPartsIssue(
    partsIssueId: string
  ): Promise<Invoice | null> {
    const invoices = this.getAllInvoices();
    return invoices.find((inv) => inv.partsIssueId === partsIssueId) || null;
  }

  /**
   * Update invoice payment
   */
  async updateInvoicePayment(
    invoiceId: string,
    paymentScreenshot: string,
    paymentMethod?: string,
    paymentReference?: string
  ): Promise<Invoice> {
    const invoice = await this.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    invoice.status = "paid";
    invoice.paymentScreenshot = paymentScreenshot;
    invoice.paymentMethod = paymentMethod;
    invoice.paymentReference = paymentReference;
    invoice.paidAt = new Date().toISOString();
    invoice.paidBy = invoice.issuedBy;

    // Update storage
    const invoices = this.getAllInvoices();
    const index = invoices.findIndex((inv) => inv.id === invoiceId);
    if (index >= 0) {
      invoices[index] = invoice;
      safeStorage.setItem(STORAGE_KEY, invoices);
    }

    return invoice;
  }

  /**
   * Helper to get purchase order number
   */
  private async getPurchaseOrderNumber(
    purchaseOrderId: string
  ): Promise<string | undefined> {
    try {
      const po = await centralInventoryRepository.getPurchaseOrderById(
        purchaseOrderId
      );
      return po?.poNumber;
    } catch {
      return undefined;
    }
  }
}

export const invoiceService = new InvoiceService();

