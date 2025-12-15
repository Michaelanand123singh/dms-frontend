/**
 * Invoice PDF Component
 * Renders invoice in the exact format matching the provided PDF template
 */

import React from "react";
import { MessageCircle } from "lucide-react";
import type { ServiceCenterInvoice, EnhancedServiceCenterInvoiceItem } from "@/shared/types/invoice.types";

interface InvoicePDFProps {
  invoice: ServiceCenterInvoice;
  onClose?: () => void;
  showActions?: boolean;
  onSendToCustomer?: () => void;
}

export default function InvoicePDF({ invoice, onClose, showActions = true, onSendToCustomer }: InvoicePDFProps) {
  const invoiceRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In production, this would use a PDF library like jsPDF or html2pdf
    // For now, we'll use the browser's print to PDF functionality
    window.print();
  };

  // Use enhanced items if available, otherwise fall back to legacy items
  const items: EnhancedServiceCenterInvoiceItem[] = invoice.enhancedItems || [];
  const hasEnhancedItems = items.length > 0;

  // Calculate totals from enhanced items if available
  const subtotal = invoice.subtotal ?? (hasEnhancedItems ? items.reduce((sum, item) => sum + item.taxableAmount, 0) : 0);
  const totalCgst = invoice.totalCgst ?? (hasEnhancedItems ? items.reduce((sum, item) => sum + item.cgstAmount, 0) : 0);
  const totalSgst = invoice.totalSgst ?? (hasEnhancedItems ? items.reduce((sum, item) => sum + item.sgstAmount, 0) : 0);
  const totalIgst = invoice.totalIgst ?? (hasEnhancedItems ? items.reduce((sum, item) => sum + item.igstAmount, 0) : 0);
  const totalTax = invoice.totalTax ?? (totalCgst + totalSgst + totalIgst);
  const discount = invoice.discount ?? 0;
  const roundOff = invoice.roundOff ?? 0;
  const grandTotal = invoice.grandTotal ?? (subtotal + totalTax - discount + roundOff);

  const serviceCenter = invoice.serviceCenterDetails;
  const customer = invoice.customerDetails;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header with Actions */}
        {showActions && (
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-[101] no-print">
            <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm inline-flex items-center gap-2"
              >
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm inline-flex items-center gap-2"
              >
                Download PDF
              </button>
              {onSendToCustomer && (
                <button
                  onClick={onSendToCustomer}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm inline-flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  Send to Customer
                </button>
              )}
              {onClose && (
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <span className="text-2xl">×</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Invoice Content */}
        <div ref={invoiceRef} className="p-8 bg-white">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              .no-print {
                display: none !important;
              }
              body {
                background: white !important;
              }
              @page {
                margin: 1cm;
                size: A4;
              }
            }
          `}} />

          {/* Header Section */}
          <div className="border-b-2 border-gray-800 pb-4 mb-6">
            <div className="flex justify-between items-start">
              {/* Service Center Details */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {serviceCenter?.name || invoice.serviceCenterName || "Service Center"}
                </h1>
                <div className="text-sm text-gray-700 space-y-1">
                  {serviceCenter?.address && <p>{serviceCenter.address}</p>}
                  {(serviceCenter?.city || serviceCenter?.state || serviceCenter?.pincode) && (
                    <p>
                      {serviceCenter.city && `${serviceCenter.city}, `}
                      {serviceCenter.state}
                      {serviceCenter.pincode && ` - ${serviceCenter.pincode}`}
                    </p>
                  )}
                  {serviceCenter?.phone && <p>Phone: {serviceCenter.phone}</p>}
                  {serviceCenter?.email && <p>Email: {serviceCenter.email}</p>}
                  {serviceCenter?.gstNumber && <p>GSTIN: {serviceCenter.gstNumber}</p>}
                  {serviceCenter?.panNumber && <p>PAN: {serviceCenter.panNumber}</p>}
                </div>
              </div>

              {/* Invoice Details */}
              <div className="text-right">
                <h2 className="text-3xl font-bold text-blue-600 mb-2">TAX INVOICE</h2>
                <div className="text-sm space-y-1">
                  <p><strong>Invoice No:</strong> {invoice.invoiceNumber || invoice.id}</p>
                  <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString("en-IN")}</p>
                  <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString("en-IN")}</p>
                  {invoice.placeOfSupply && (
                    <p><strong>Place of Supply:</strong> {invoice.placeOfSupply}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                Bill To:
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold">{customer?.name || invoice.customerName}</p>
                {customer?.address && <p>{customer.address}</p>}
                {(customer?.city || customer?.state || customer?.pincode) && (
                  <p>
                    {customer.city && `${customer.city}, `}
                    {customer.state}
                    {customer.pincode && ` - ${customer.pincode}`}
                  </p>
                )}
                {customer?.phone && <p>Phone: {customer.phone}</p>}
                {customer?.email && <p>Email: {customer.email}</p>}
                {customer?.gstNumber && <p>GSTIN: {customer.gstNumber}</p>}
                {customer?.panNumber && <p>PAN: {customer.panNumber}</p>}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                Vehicle Details:
              </h3>
              <div className="text-sm text-gray-700">
                <p>{invoice.vehicle}</p>
                {invoice.jobCardId && (
                  <p className="mt-2"><strong>Job Card:</strong> {invoice.jobCardId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-800 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-800 px-3 py-2 text-left">Sr. No.</th>
                  <th className="border border-gray-800 px-3 py-2 text-left">HSN/SAC</th>
                  <th className="border border-gray-800 px-3 py-2 text-left">Description</th>
                  <th className="border border-gray-800 px-3 py-2 text-center">Qty</th>
                  <th className="border border-gray-800 px-3 py-2 text-right">Rate</th>
                  <th className="border border-gray-800 px-3 py-2 text-right">Amount</th>
                  <th className="border border-gray-800 px-3 py-2 text-center">GST %</th>
                  {totalIgst > 0 ? (
                    <th className="border border-gray-800 px-3 py-2 text-right">IGST</th>
                  ) : (
                    <>
                      <th className="border border-gray-800 px-3 py-2 text-right">CGST</th>
                      <th className="border border-gray-800 px-3 py-2 text-right">SGST</th>
                    </>
                  )}
                  <th className="border border-gray-800 px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {hasEnhancedItems ? (
                  items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-800 px-3 py-2">{index + 1}</td>
                      <td className="border border-gray-800 px-3 py-2">{item.hsnSacCode || "-"}</td>
                      <td className="border border-gray-800 px-3 py-2">{item.name}</td>
                      <td className="border border-gray-800 px-3 py-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-800 px-3 py-2 text-right">
                        ₹{item.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border border-gray-800 px-3 py-2 text-right">
                        ₹{item.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border border-gray-800 px-3 py-2 text-center">{item.gstRate}%</td>
                      {totalIgst > 0 ? (
                        <td className="border border-gray-800 px-3 py-2 text-right">
                          ₹{item.igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      ) : (
                        <>
                          <td className="border border-gray-800 px-3 py-2 text-right">
                            ₹{item.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="border border-gray-800 px-3 py-2 text-right">
                            ₹{item.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                        </>
                      )}
                      <td className="border border-gray-800 px-3 py-2 text-right font-semibold">
                        ₹{item.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  // Fallback to legacy items
                  invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-800 px-3 py-2">{index + 1}</td>
                      <td className="border border-gray-800 px-3 py-2">-</td>
                      <td className="border border-gray-800 px-3 py-2">{item.name}</td>
                      <td className="border border-gray-800 px-3 py-2 text-center">{item.qty}</td>
                      <td className="border border-gray-800 px-3 py-2 text-right">-</td>
                      <td className="border border-gray-800 px-3 py-2 text-right">{item.price}</td>
                      <td className="border border-gray-800 px-3 py-2 text-center">-</td>
                      <td className="border border-gray-800 px-3 py-2 text-right">-</td>
                      <td className="border border-gray-800 px-3 py-2 text-right">-</td>
                      <td className="border border-gray-800 px-3 py-2 text-right">{item.price}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mb-6">
            <div className="w-full max-w-md">
              <table className="w-full border-collapse border border-gray-800 text-sm">
                <tbody>
                  <tr>
                    <td className="border border-gray-800 px-3 py-2 text-right font-semibold">Subtotal:</td>
                    <td className="border border-gray-800 px-3 py-2 text-right">
                      ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  {totalCgst > 0 && (
                    <tr>
                      <td className="border border-gray-800 px-3 py-2 text-right">CGST:</td>
                      <td className="border border-gray-800 px-3 py-2 text-right">
                        ₹{totalCgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {totalSgst > 0 && (
                    <tr>
                      <td className="border border-gray-800 px-3 py-2 text-right">SGST:</td>
                      <td className="border border-gray-800 px-3 py-2 text-right">
                        ₹{totalSgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {totalIgst > 0 && (
                    <tr>
                      <td className="border border-gray-800 px-3 py-2 text-right">IGST:</td>
                      <td className="border border-gray-800 px-3 py-2 text-right">
                        ₹{totalIgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {discount > 0 && (
                    <tr>
                      <td className="border border-gray-800 px-3 py-2 text-right">Discount:</td>
                      <td className="border border-gray-800 px-3 py-2 text-right">
                        -₹{discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {roundOff !== 0 && (
                    <tr>
                      <td className="border border-gray-800 px-3 py-2 text-right">Round Off:</td>
                      <td className="border border-gray-800 px-3 py-2 text-right">
                        ₹{roundOff.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-gray-100">
                    <td className="border border-gray-800 px-3 py-2 text-right font-bold text-lg">Grand Total:</td>
                    <td className="border border-gray-800 px-3 py-2 text-right font-bold text-lg">
                      ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount in Words */}
          {invoice.amountInWords && (
            <div className="mb-6 p-3 bg-gray-50 border border-gray-300 rounded">
              <p className="text-sm">
                <strong>Amount in Words:</strong> {invoice.amountInWords}
              </p>
            </div>
          )}

          {/* Terms and Conditions */}
          {invoice.termsAndConditions && invoice.termsAndConditions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {invoice.termsAndConditions.map((term, index) => (
                  <li key={index}>{term}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Bank Details */}
          {invoice.bankDetails && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Bank Details:</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Bank Name:</strong> {invoice.bankDetails.bankName}</p>
                <p><strong>Account Number:</strong> {invoice.bankDetails.accountNumber}</p>
                <p><strong>IFSC Code:</strong> {invoice.bankDetails.ifscCode}</p>
                <p><strong>Branch:</strong> {invoice.bankDetails.branch}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-700 mb-4">Customer Signature</p>
                <div className="border-b border-gray-400 h-16"></div>
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-4">Authorized Signatory</p>
                <div className="border-b border-gray-400 h-16"></div>
                {serviceCenter && (
                  <p className="text-xs text-gray-600 mt-2">
                    For {serviceCenter.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

