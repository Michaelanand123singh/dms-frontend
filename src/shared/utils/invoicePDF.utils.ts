/**
 * Invoice PDF HTML Generator
 * Generates HTML matching the exact PDF format for printing/downloading
 */

import type { ServiceCenterInvoice, EnhancedServiceCenterInvoiceItem } from "@/shared/types/invoice.types";

/**
 * Generate invoice HTML for printing/downloading as PDF
 * @param invoice - Invoice data
 * @returns HTML string for invoice
 */
export function generateInvoiceHTML(invoice: ServiceCenterInvoice): string {
  const serviceCenter = invoice.serviceCenterDetails;
  const customer = invoice.customerDetails;

  // Use enhanced items if available, otherwise fall back to legacy items
  const items: EnhancedServiceCenterInvoiceItem[] = invoice.enhancedItems || [];
  const hasEnhancedItems = items.length > 0;

  // Calculate totals
  const subtotal = invoice.subtotal ?? (hasEnhancedItems ? items.reduce((sum, item) => sum + item.taxableAmount, 0) : 0);
  const totalCgst = invoice.totalCgst ?? (hasEnhancedItems ? items.reduce((sum, item) => sum + item.cgstAmount, 0) : 0);
  const totalSgst = invoice.totalSgst ?? (hasEnhancedItems ? items.reduce((sum, item) => sum + item.sgstAmount, 0) : 0);
  const totalIgst = invoice.totalIgst ?? (hasEnhancedItems ? items.reduce((sum, item) => sum + item.igstAmount, 0) : 0);
  const totalTax = invoice.totalTax ?? (totalCgst + totalSgst + totalIgst);
  const discount = invoice.discount ?? 0;
  const roundOff = invoice.roundOff ?? 0;
  const grandTotal = invoice.grandTotal ?? (subtotal + totalTax - discount + roundOff);

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Generate items table rows
  const itemsRows = hasEnhancedItems
    ? items
        .map(
          (item, index) => `
      <tr>
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: center;">${index + 1}</td>
        <td style="border: 1px solid #1f2937; padding: 8px;">${item.hsnSacCode || "-"}</td>
        <td style="border: 1px solid #1f2937; padding: 8px;">${item.name}</td>
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: right;">₹${item.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: right;">₹${item.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: center;">${item.gstRate}%</td>
        ${
          totalIgst > 0
            ? `<td style="border: 1px solid #1f2937; padding: 8px; text-align: right;">₹${item.igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>`
            : `
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: right;">₹${item.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: right;">₹${item.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        `
        }
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: right; font-weight: bold;">₹${item.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
    `
        )
        .join("")
    : invoice.items
        .map(
          (item, index) => `
      <tr>
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: center;">${index + 1}</td>
        <td style="border: 1px solid #1f2937; padding: 8px;">-</td>
        <td style="border: 1px solid #1f2937; padding: 8px;">${item.name}</td>
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: center;">${item.qty}</td>
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: right;">-</td>
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: right;">${item.price}</td>
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: center;">-</td>
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: right;">-</td>
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: right;">-</td>
        <td style="border: 1px solid #1f2937; padding: 8px; text-align: right;">${item.price}</td>
      </tr>
    `
        )
        .join("");

  const tableHeaders = totalIgst > 0
    ? `
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: left;">Sr. No.</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: left;">HSN/SAC</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: left;">Description</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: center;">Qty</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: right;">Rate</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: right;">Amount</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: center;">GST %</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: right;">IGST</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: right;">Total</th>
    `
    : `
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: left;">Sr. No.</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: left;">HSN/SAC</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: left;">Description</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: center;">Qty</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: right;">Rate</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: right;">Amount</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: center;">GST %</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: right;">CGST</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: right;">SGST</th>
      <th style="border: 1px solid #1f2937; padding: 10px; background-color: #f3f4f6; text-align: right;">Total</th>
    `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber || invoice.id}</title>
        <meta charset="UTF-8">
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none !important; }
            @page {
              margin: 1cm;
              size: A4;
            }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #1f2937;
            line-height: 1.6;
          }
          .header {
            border-bottom: 2px solid #1f2937;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .company-info {
            flex: 1;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #111827;
          }
          .invoice-details {
            text-align: right;
          }
          .invoice-type {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 12px;
          }
          .details-section {
            margin: 24px 0;
          }
          .section-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #e5e7eb;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 13px;
          }
          th, td {
            border: 1px solid #1f2937;
            padding: 8px;
          }
          th {
            background-color: #f3f4f6;
            font-weight: 600;
          }
          .totals-table {
            max-width: 400px;
            margin-left: auto;
            margin-top: 20px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }
          .totals-total {
            border-top: 2px solid #1f2937;
            padding-top: 12px;
            margin-top: 12px;
            font-size: 18px;
            font-weight: bold;
          }
          .amount-words {
            margin-top: 20px;
            padding: 12px;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            font-size: 14px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 30px;
          }
          .signature-box {
            border-bottom: 1px solid #9ca3af;
            height: 60px;
            margin-top: 40px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-content">
            <div class="company-info">
              <div class="company-name">${serviceCenter?.name || invoice.serviceCenterName || "Service Center"}</div>
              <div style="font-size: 14px; color: #374151; margin-top: 8px;">
                ${serviceCenter?.address ? `<p>${serviceCenter.address}</p>` : ""}
                ${serviceCenter?.city || serviceCenter?.state || serviceCenter?.pincode
                  ? `<p>${serviceCenter.city ? `${serviceCenter.city}, ` : ""}${serviceCenter.state || ""}${serviceCenter.pincode ? ` - ${serviceCenter.pincode}` : ""}</p>`
                  : ""}
                ${serviceCenter?.phone ? `<p>Phone: ${serviceCenter.phone}</p>` : ""}
                ${serviceCenter?.email ? `<p>Email: ${serviceCenter.email}</p>` : ""}
                ${serviceCenter?.gstNumber ? `<p>GSTIN: ${serviceCenter.gstNumber}</p>` : ""}
                ${serviceCenter?.panNumber ? `<p>PAN: ${serviceCenter.panNumber}</p>` : ""}
              </div>
            </div>
            <div class="invoice-details">
              <div class="invoice-type">TAX INVOICE</div>
              <div style="font-size: 14px; text-align: right;">
                <p><strong>Invoice No:</strong> ${invoice.invoiceNumber || invoice.id}</p>
                <p><strong>Date:</strong> ${formatDate(invoice.date)}</p>
                <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
                ${invoice.placeOfSupply ? `<p><strong>Place of Supply:</strong> ${invoice.placeOfSupply}</p>` : ""}
              </div>
            </div>
          </div>
        </div>

        <div class="details-section">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div>
              <div class="section-title">Bill To:</div>
              <div style="font-size: 14px; color: #374151;">
                <p style="font-weight: 600; margin-bottom: 4px;">${customer?.name || invoice.customerName}</p>
                ${customer?.address ? `<p>${customer.address}</p>` : ""}
                ${customer?.city || customer?.state || customer?.pincode
                  ? `<p>${customer.city ? `${customer.city}, ` : ""}${customer.state || ""}${customer.pincode ? ` - ${customer.pincode}` : ""}</p>`
                  : ""}
                ${customer?.phone ? `<p>Phone: ${customer.phone}</p>` : ""}
                ${customer?.email ? `<p>Email: ${customer.email}</p>` : ""}
                ${customer?.gstNumber ? `<p>GSTIN: ${customer.gstNumber}</p>` : ""}
                ${customer?.panNumber ? `<p>PAN: ${customer.panNumber}</p>` : ""}
              </div>
            </div>
            <div>
              <div class="section-title">Vehicle Details:</div>
              <div style="font-size: 14px; color: #374151;">
                <p>${invoice.vehicle}</p>
                ${invoice.jobCardId ? `<p style="margin-top: 8px;"><strong>Job Card:</strong> ${invoice.jobCardId}</p>` : ""}
              </div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              ${tableHeaders}
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="totals-table">
          <table>
            <tbody>
              <tr>
                <td style="text-align: right; font-weight: 600;">Subtotal:</td>
                <td style="text-align: right;">₹${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              ${totalCgst > 0
                ? `
              <tr>
                <td style="text-align: right;">CGST:</td>
                <td style="text-align: right;">₹${totalCgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              `
                : ""}
              ${totalSgst > 0
                ? `
              <tr>
                <td style="text-align: right;">SGST:</td>
                <td style="text-align: right;">₹${totalSgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              `
                : ""}
              ${totalIgst > 0
                ? `
              <tr>
                <td style="text-align: right;">IGST:</td>
                <td style="text-align: right;">₹${totalIgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              `
                : ""}
              ${discount > 0
                ? `
              <tr>
                <td style="text-align: right;">Discount:</td>
                <td style="text-align: right;">-₹${discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              `
                : ""}
              ${roundOff !== 0
                ? `
              <tr>
                <td style="text-align: right;">Round Off:</td>
                <td style="text-align: right;">₹${roundOff.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              `
                : ""}
              <tr style="background-color: #f3f4f6;">
                <td style="text-align: right; font-weight: bold; font-size: 16px;">Grand Total:</td>
                <td style="text-align: right; font-weight: bold; font-size: 16px;">₹${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>

        ${invoice.amountInWords
          ? `
        <div class="amount-words">
          <strong>Amount in Words:</strong> ${invoice.amountInWords}
        </div>
        `
          : ""}

        ${invoice.termsAndConditions && invoice.termsAndConditions.length > 0
          ? `
        <div class="details-section">
          <div class="section-title">Terms & Conditions:</div>
          <ul style="font-size: 13px; color: #374151; padding-left: 20px;">
            ${invoice.termsAndConditions.map((term) => `<li style="margin-bottom: 4px;">${term}</li>`).join("")}
          </ul>
        </div>
        `
          : ""}

        ${invoice.bankDetails
          ? `
        <div class="details-section">
          <div class="section-title">Bank Details:</div>
          <div style="font-size: 14px; color: #374151;">
            <p><strong>Bank Name:</strong> ${invoice.bankDetails.bankName}</p>
            <p><strong>Account Number:</strong> ${invoice.bankDetails.accountNumber}</p>
            <p><strong>IFSC Code:</strong> ${invoice.bankDetails.ifscCode}</p>
            <p><strong>Branch:</strong> ${invoice.bankDetails.branch}</p>
          </div>
        </div>
        `
          : ""}

        <div class="footer">
          <div class="signature-section">
            <div>
              <p style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">Customer Signature</p>
              <div class="signature-box"></div>
            </div>
            <div>
              <p style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">Authorized Signatory</p>
              <div class="signature-box"></div>
              ${serviceCenter ? `<p style="font-size: 11px; color: #9ca3af; margin-top: 8px;">For ${serviceCenter.name}</p>` : ""}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}



