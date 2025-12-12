/**
 * Hook for managing invoice display and actions
 */

import { useState, useCallback } from "react";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import type { ServiceHistoryItem, CustomerWithVehicles, Vehicle, Invoice, ServiceCenterInvoice } from "@/shared/types";

export interface UseInvoiceReturn {
  selectedInvoice: ServiceCenterInvoice | null;
  showInvoiceModal: boolean;
  setSelectedInvoice: React.Dispatch<React.SetStateAction<ServiceCenterInvoice | null>>;
  setShowInvoiceModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleOpenServiceInvoice: (service: ServiceHistoryItem, selectedCustomer: CustomerWithVehicles | null, selectedVehicle: Vehicle | null) => void;
}

/**
 * Hook to manage invoice modal state and actions
 * @returns Invoice state and handlers
 */
export function useInvoice(): UseInvoiceReturn {
  const [selectedInvoice, setSelectedInvoice] = useState<ServiceCenterInvoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  const handleOpenServiceInvoice = useCallback(
    (service: ServiceHistoryItem, selectedCustomer: CustomerWithVehicles | null, selectedVehicle: Vehicle | null) => {
      if (!service.invoice || typeof window === "undefined") return;
      const invoiceUrl = new URL("/sc/invoices", window.location.origin);

      const vehicleDescription = selectedVehicle
        ? `${selectedVehicle.vehicleMake} ${selectedVehicle.vehicleModel}${
            selectedVehicle.registration ? ` (${selectedVehicle.registration})` : ""
          }`
        : "Vehicle";

      const customerName = selectedCustomer?.name || "Customer";

      const serviceInvoice: ServiceCenterInvoice = {
        id: service.invoice,
        jobCardId: service.jobCardId,
        customerName,
        vehicle: vehicleDescription,
        date: service.date,
        dueDate: service.date,
        amount: service.total,
        paidAmount: service.total,
        balance: "₹0",
        status: "Paid" as const,
        paymentMethod: undefined,
        items: [
          {
            name: "Labor",
            qty: 1,
            price: service.labor,
          },
          {
            name: "Parts",
            qty: 1,
            price: service.partsCost,
          },
        ],
      };

      const existingInvoices = safeStorage.getItem<Invoice[]>("serviceHistoryInvoices", []);
      const filtered = existingInvoices.filter((item) => item.id !== serviceInvoice.id);
      safeStorage.setItem("serviceHistoryInvoices", [...filtered, serviceInvoice]);

      invoiceUrl.searchParams.set("invoiceId", service.invoice);
      window.open(invoiceUrl.toString(), "_blank");
    },
    []
  );

  return {
    selectedInvoice,
    showInvoiceModal,
    setSelectedInvoice,
    setShowInvoiceModal,
    handleOpenServiceInvoice,
  };
}

