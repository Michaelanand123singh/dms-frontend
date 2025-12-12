/**
 * Hook for managing service history with feedback ratings
 */

import { useState, useCallback } from "react";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { formatVehicleString } from "@/app/(service-center)/sc/components/shared/vehicle-utils";
import type { ServiceHistoryItem, CustomerWithVehicles, Vehicle } from "@/shared/types";
import type { Appointment } from "@/app/(service-center)/sc/components/appointment/types";

export interface UseServiceHistoryReturn {
  serviceHistory: ServiceHistoryItem[];
  editingFeedbackRating: number | string | null;
  setServiceHistory: React.Dispatch<React.SetStateAction<ServiceHistoryItem[]>>;
  setEditingFeedbackRating: React.Dispatch<React.SetStateAction<number | string | null>>;
  enrichServiceHistoryWithFeedbackRatings: (
    serviceHistory: ServiceHistoryItem[],
    vehicle: Vehicle,
    customer: CustomerWithVehicles | null
  ) => ServiceHistoryItem[];
  handleUpdateFeedbackRating: (
    service: ServiceHistoryItem,
    newRating: number,
    selectedCustomer: CustomerWithVehicles | null,
    selectedVehicle: Vehicle | null,
    showToast: (message: string, type: "success" | "error") => void
  ) => void;
}

/**
 * Hook to manage service history and feedback ratings
 * @param initialHistory - Initial service history array
 * @returns Service history state and management functions
 */
export function useServiceHistory(
  initialHistory: ServiceHistoryItem[] = []
): UseServiceHistoryReturn {
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryItem[]>(initialHistory);
  const [editingFeedbackRating, setEditingFeedbackRating] = useState<number | string | null>(null);

  const enrichServiceHistoryWithFeedbackRatings = useCallback(
    (
      serviceHistory: ServiceHistoryItem[],
      vehicle: Vehicle,
      customer: CustomerWithVehicles | null
    ): ServiceHistoryItem[] => {
      if (!customer || typeof window === "undefined") return serviceHistory;

      try {
        const appointments = safeStorage.getItem<Appointment[]>("appointments", []);
        const vehicleString = formatVehicleString(vehicle);

        // Match appointments to service history items by date and vehicle
        return serviceHistory.map((service) => {
          // Find matching appointment by date and vehicle
          const matchingAppointment = appointments.find((apt) => {
            const appointmentDate = apt.date?.split("T")[0] || apt.date;
            const serviceDate = service.date;
            const vehicleMatches =
              apt.vehicle === vehicleString ||
              apt.vehicle?.includes(vehicle.vehicleMake) ||
              apt.vehicle?.includes(vehicle.vehicleModel);

            return (
              appointmentDate === serviceDate &&
              vehicleMatches &&
              apt.customerName === customer.name &&
              apt.feedbackRating !== undefined &&
              apt.feedbackRating !== null
            );
          });

          if (matchingAppointment?.feedbackRating) {
            return {
              ...service,
              feedbackRating: matchingAppointment.feedbackRating,
            };
          }

          return service;
        });
      } catch (error) {
        console.error("Error enriching service history with feedback ratings:", error);
        return serviceHistory;
      }
    },
    []
  );

  const handleUpdateFeedbackRating = useCallback(
    (
      service: ServiceHistoryItem,
      newRating: number,
      selectedCustomer: CustomerWithVehicles | null,
      selectedVehicle: Vehicle | null,
      showToast: (message: string, type: "success" | "error") => void
    ) => {
      if (!selectedCustomer || !selectedVehicle || typeof window === "undefined") return;

      try {
        const appointments = safeStorage.getItem<Appointment[]>("appointments", []);
        const vehicleString = formatVehicleString(selectedVehicle);

        // Find matching appointment by date and vehicle
        const matchingAppointmentIndex = appointments.findIndex((apt) => {
          const appointmentDate = apt.date?.split("T")[0] || apt.date;
          const serviceDate = service.date;
          const vehicleMatches =
            apt.vehicle === vehicleString ||
            apt.vehicle?.includes(selectedVehicle.vehicleMake) ||
            apt.vehicle?.includes(selectedVehicle.vehicleModel);

          return (
            appointmentDate === serviceDate &&
            vehicleMatches &&
            apt.customerName === selectedCustomer.name
          );
        });

        if (matchingAppointmentIndex !== -1) {
          // Update the appointment's feedback rating
          const updatedAppointments = [...appointments];
          updatedAppointments[matchingAppointmentIndex] = {
            ...updatedAppointments[matchingAppointmentIndex],
            feedbackRating: newRating,
          };
          safeStorage.setItem("appointments", updatedAppointments);

          // Update the service history display
          setServiceHistory((prev) =>
            prev.map((s) => (s.id === service.id ? { ...s, feedbackRating: newRating } : s))
          );

          showToast(`Feedback rating updated to ${newRating} stars`, "success");
        } else {
          // If no matching appointment found, still update the display
          setServiceHistory((prev) =>
            prev.map((s) => (s.id === service.id ? { ...s, feedbackRating: newRating } : s))
          );
          showToast(`Feedback rating updated to ${newRating} stars`, "success");
        }

        setEditingFeedbackRating(null);
      } catch (error) {
        console.error("Error updating feedback rating:", error);
        showToast("Failed to update feedback rating", "error");
      }
    },
    []
  );

  return {
    serviceHistory,
    editingFeedbackRating,
    setServiceHistory,
    setEditingFeedbackRating,
    enrichServiceHistoryWithFeedbackRatings,
    handleUpdateFeedbackRating,
  };
}

