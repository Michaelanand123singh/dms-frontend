"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useCustomerSearch } from "@/app/(service-center)/sc/components/customers";
import { Modal, CustomerInfoCard, formatVehicleString } from "../shared";
import { Appointment, AppointmentForm, INITIAL_APPOINTMENT_FORM } from "./types";
import type { CustomerWithVehicles, Vehicle } from "@/shared/types";
import { AppointmentForm as SharedAppointmentForm } from "./AppointmentForm";

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: AppointmentForm) => void;
  existingAppointments?: Appointment[];
  initialForm?: AppointmentForm;
  mode?: "create" | "edit";
  fixedCustomer?: CustomerWithVehicles;
  fixedVehicle?: Vehicle;
  allowCustomerSelection?: boolean;
}

export const AppointmentModal = ({
  open,
  onClose,
  onSubmit,
  existingAppointments = [],
  initialForm,
  mode = "create",
  fixedCustomer,
  fixedVehicle,
  allowCustomerSelection = true,
}: AppointmentModalProps) => {
  // Compute initial form value when modal opens
  const initialFormValue = useMemo(() => {
    if (!open) return null;
    const baseForm = {
      ...INITIAL_APPOINTMENT_FORM,
      ...initialForm,
    };
    if (fixedVehicle) {
      baseForm.vehicle = formatVehicleString(fixedVehicle);
    }
    return baseForm;
  }, [open, initialForm, fixedVehicle]);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithVehicles | null>(fixedCustomer || null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(fixedVehicle || null);
  const prevOpenRef = useRef(open);

  const customerSearch = useCustomerSearch();
  const customerSearchResults: CustomerWithVehicles[] = customerSearch.results;

  // Reset when modal opens
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      if (fixedCustomer) {
        setSelectedCustomer(fixedCustomer);
      }
      if (fixedVehicle) {
        setSelectedVehicle(fixedVehicle);
      }
    }
    prevOpenRef.current = open;
  }, [open, fixedCustomer, fixedVehicle]);

  if (!open) return null;

  return (
    <Modal
      title={mode === "edit" ? "Edit Appointment" : "Schedule Appointment"}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 p-6">
        {selectedCustomer && (
          <CustomerInfoCard customer={selectedCustomer} title="Customer Information (Pre-filled)" />
        )}

        <SharedAppointmentForm
          initialData={initialFormValue || undefined}
          onSubmit={onSubmit}
          onCancel={onClose}
          mode={mode}
          customerInfo={selectedCustomer}
          vehicleInfo={selectedVehicle || undefined}
          existingAppointments={existingAppointments}
          showCustomerSelection={allowCustomerSelection && !selectedCustomer}
          onCustomerSelect={(customer) => {
            setSelectedCustomer(customer);
          }}
          customerSearchResults={customerSearchResults}
          customerSearchLoading={customerSearch.loading}
          onVehicleChange={(vehicle) => {
            setSelectedVehicle(vehicle);
          }}
        />
      </div>
    </Modal>
  );
};

