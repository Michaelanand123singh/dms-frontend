/**
 * Hook for sharing quotation via WhatsApp
 */

import { useState, useCallback } from "react";
import { quotationsService } from "@/features/quotations/services/quotations.service";
import type { Quotation } from "@/shared/types/quotation.types";

export function useWhatsAppQuotationShare() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareQuotation = useCallback(
    async (quotationId: string): Promise<{ success: boolean; whatsappUrl?: string; message?: string }> => {
      setLoading(true);
      setError(null);

      try {
        const result = await quotationsService.sendWhatsApp(quotationId);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to send quotation via WhatsApp";
        setError(errorMessage);
        console.error("Error sharing quotation via WhatsApp:", err);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const generateWhatsAppUrl = useCallback((quotation: Quotation): string => {
    const message = encodeURIComponent(
      `Quotation ${quotation.quotationNumber}\n` +
        `Total: ₹${quotation.totalAmount.toLocaleString("en-IN")}\n\n` +
        `View and confirm: ${typeof window !== "undefined" ? window.location.origin : ""}/sc/quotations/${quotation.id}/confirm`
    );
    return `https://wa.me/?text=${message}`;
  }, []);

  return {
    shareQuotation,
    generateWhatsAppUrl,
    loading,
    error,
  };
}

