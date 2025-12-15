/**
 * View Invoice Modal Component
 * Displays invoice details with print, download, and WhatsApp sharing options
 */

import React from "react";
import { Printer, Download, MessageCircle, X } from "lucide-react";
import InvoicePDF from "../../../../../components/invoice/InvoicePDF";
import type { ServiceCenterInvoice } from "@/shared/types/invoice.types";
import { generateInvoiceHTML } from "@/shared/utils/invoicePDF.utils";

interface ViewInvoiceModalProps {
  invoice: ServiceCenterInvoice;
  onClose: () => void;
  onSendToCustomer?: () => void;
}

export default function ViewInvoiceModal({
  invoice,
  onClose,
  onSendToCustomer,
}: ViewInvoiceModalProps) {
  const handlePrint = () => {
    const invoiceHTML = generateInvoiceHTML(invoice);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 2000);
      }, 500);
    }
  };

  const handleDownloadPDF = () => {
    const invoiceHTML = generateInvoiceHTML(invoice);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 2000);
      }, 500);
    }
  };

  return (
    <InvoicePDF
      invoice={invoice}
      onClose={onClose}
      showActions={true}
    />
  );
}

