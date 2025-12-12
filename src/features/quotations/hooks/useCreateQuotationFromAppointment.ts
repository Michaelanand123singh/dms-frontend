/**
 * Hook for creating quotation from appointment
 */

import { useState, useCallback } from "react";
import { quotationsService } from "@/features/quotations/services/quotations.service";
import { appointmentsService } from "@/features/appointments/services/appointments.service";
import type { Quotation, CreateQuotationForm } from "@/shared/types/quotation.types";
import type { Appointment } from "@/shared/types/appointment.types";

export function useCreateQuotationFromAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuotation = useCallback(
    async (appointment: Appointment, quotationData?: Partial<CreateQuotationForm>): Promise<Quotation | null> => {
      setLoading(true);
      setError(null);

      try {
        const formData: CreateQuotationForm = {
          customerId: appointment.customerId,
          vehicleId: appointment.vehicleId,
          documentType: "Quotation",
          quotationDate: new Date().toISOString().split("T")[0],
          validUntilDays: 30,
          hasInsurance: false,
          items: [],
          discount: 0,
          notes: appointment.customerComplaintIssue || "",
          customNotes: appointment.previousServiceHistory || "",
          ...quotationData,
        };

        const quotation = await quotationsService.createFromAppointment(String(appointment.id), appointment);
        
        // Link quotation to appointment
        await appointmentsService.linkQuotation(String(appointment.id), quotation.id);

        return quotation;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create quotation";
        setError(errorMessage);
        console.error("Error creating quotation from appointment:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createQuotation,
    loading,
    error,
  };
}

