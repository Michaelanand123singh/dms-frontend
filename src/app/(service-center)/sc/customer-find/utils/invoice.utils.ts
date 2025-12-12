/**
 * Invoice utilities for customer find page
 */

import type { ServiceCenterInvoice } from "@/shared/types";

/**
 * Generate invoice HTML for printing/downloading
 * @param invoice - Invoice data
 * @returns HTML string for invoice
 */
export function generateInvoiceHTML(invoice: ServiceCenterInvoice): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice ${invoice.id}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #000;
          }
          .header {
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .invoice-number {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
          }
          .status-paid {
            background-color: #d1fae5;
            color: #065f46;
          }
          .status-unpaid {
            background-color: #fef3c7;
            color: #92400e;
          }
          .status-overdue {
            background-color: #fee2e2;
            color: #991b1b;
          }
          .customer-info {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .items-table th,
          .items-table td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
          }
          .items-table th {
            background-color: #f9fafb;
            font-weight: bold;
          }
          .items-table td:last-child,
          .items-table th:last-child {
            text-align: right;
          }
          .total-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #000;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            font-weight: bold;
            margin: 10px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="invoice-number">Invoice ${invoice.id}</div>
          <div>Date: ${invoice.date}</div>
          <div>Due Date: ${invoice.dueDate}</div>
          <span class="status-badge status-${invoice.status.toLowerCase()}">
            ${invoice.status}
          </span>
        </div>

        <div class="customer-info">
          <h3 style="margin-top: 0; margin-bottom: 10px;">Customer Information</h3>
          <p><strong>Name:</strong> ${invoice.customerName}</p>
          <p><strong>Vehicle:</strong> ${invoice.vehicle}</p>
          ${invoice.jobCardId ? `<p><strong>Job Card:</strong> ${invoice.jobCardId}</p>` : ""}
        </div>

        <h3>Items</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item) => `
              <tr>
                <td>${item.name}</td>
                <td style="text-align: center;">${item.qty}</td>
                <td style="text-align: right;">${item.price}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Total Amount:</span>
            <span>${invoice.amount}</span>
          </div>
          ${invoice.status !== "Paid" ? `
            <div class="total-row" style="color: #dc2626; font-size: 14px;">
              <span>Outstanding:</span>
              <span>${invoice.balance}</span>
            </div>
          ` : ""}
          ${invoice.paymentMethod ? `
            <div style="margin-top: 10px; font-size: 14px;">
              <strong>Payment Method:</strong> ${invoice.paymentMethod}
            </div>
          ` : ""}
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Download invoice as PDF by opening print dialog
 * @param invoice - Invoice data
 */
export function downloadInvoice(invoice: ServiceCenterInvoice): void {
  if (typeof window === "undefined") return;

  const invoiceHTML = generateInvoiceHTML(invoice);

  // Open a new window with the invoice content
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    // Wait for content to load, then trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 250);
  } else {
    alert("Please allow popups to download the invoice");
  }
}

/**
 * Print invoice directly
 * @param invoice - Invoice data
 */
export function printInvoice(invoice: ServiceCenterInvoice): void {
  if (typeof window === "undefined") return;
  
  const invoiceHTML = generateInvoiceHTML(invoice);
  
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

