/**
 * Invoice Modal Component
 * Displays invoice in a modal with download and print options
 */

import { Download, Printer, X } from "lucide-react";
import { Modal } from "../../../components/shared/FormElements";
import { Button } from "../../../components/shared/Button";
import type { ServiceCenterInvoice } from "@/shared/types";
import { downloadInvoice, printInvoice } from "../../utils/invoice.utils";

export interface InvoiceModalProps {
  isOpen: boolean;
  invoice: ServiceCenterInvoice | null;
  onClose: () => void;
}

export function InvoiceModal({ isOpen, invoice, onClose }: InvoiceModalProps) {
  if (!isOpen || !invoice) return null;

  const handleDownload = () => {
    downloadInvoice(invoice);
  };

  const handlePrint = () => {
    printInvoice(invoice);
  };

  return (
    <Modal
      title={`Invoice ${invoice.id}`}
      subtitle={`Job Card: ${invoice.jobCardId}`}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <div className="p-6">
        {/* Invoice Header */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invoice #{invoice.id}</h2>
              <p className="text-sm text-gray-600 mt-1">Job Card: {invoice.jobCardId}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                invoice.status === "Paid"
                  ? "bg-green-100 text-green-700"
                  : invoice.status === "Partially Paid"
                  ? "bg-yellow-100 text-yellow-700"
                  : invoice.status === "Unpaid"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Customer & Vehicle Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer</h3>
            <p className="text-gray-900">{invoice.customerName}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Vehicle</h3>
            <p className="text-gray-900">{invoice.vehicle}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Date</h3>
            <p className="text-gray-900">{invoice.date}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Due Date</h3>
            <p className="text-gray-900">{invoice.dueDate}</p>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Quantity</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.items?.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.qty}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.price}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                    {item.price}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Total Amount:
                </td>
                <td className="px-4 py-3 text-right text-lg font-bold text-gray-900">
                  {invoice.amount}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Paid Amount:
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-green-700">
                  {invoice.paidAmount}
                </td>
              </tr>
              {invoice.balance && invoice.balance !== "₹0" && (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Balance:
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-red-700">
                    {invoice.balance}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} icon={X}>
            Close
          </Button>
          <Button variant="primary" onClick={handleDownload} icon={Download}>
            Download PDF
          </Button>
          <Button variant="primary" onClick={handlePrint} icon={Printer}>
            Print
          </Button>
        </div>
      </div>
    </Modal>
  );
}

