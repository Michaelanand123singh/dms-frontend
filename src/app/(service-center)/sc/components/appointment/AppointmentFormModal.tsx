/**
 * Appointment Form Modal Component
 * Wrapper around shared AppointmentForm component
 */

import { Modal } from "../shared";
import { AppointmentForm } from "./AppointmentForm";
import { CustomerInfoCard } from "../shared";
import type { CustomerWithVehicles, Vehicle } from "@/shared/types";
import type { AppointmentForm as AppointmentFormType } from "./types";

export interface AppointmentFormModalProps {
  isOpen: boolean;
  customer: CustomerWithVehicles | null;
  vehicle: Vehicle | null;
  initialFormData?: Partial<AppointmentFormType>;
  onClose: () => void;
  onSubmit: (form: AppointmentFormType) => void;
  canAccessCustomerType: boolean;
  canAccessVehicleInfo: boolean;
  existingAppointments?: any[];
  onCustomerArrived?: (form: AppointmentFormType) => void;
  appointmentStatus?: string;
  customerArrived?: boolean;
  onCreateQuotation?: (form: AppointmentFormType) => void;
}

export function AppointmentFormModal({
  isOpen,
  customer,
  vehicle,
  initialFormData,
  onClose,
  onSubmit,
  canAccessCustomerType,
  canAccessVehicleInfo,
  existingAppointments = [],
  onCustomerArrived,
  appointmentStatus,
  customerArrived,
  onCreateQuotation,
}: AppointmentFormModalProps) {
  // Allow modal to open even without customer for edit mode
  if (!isOpen) return null;

  const isEditMode = !!initialFormData?.customerName;

  return (
    <Modal 
      title={isEditMode ? "Edit Appointment" : "Schedule Appointment"} 
      onClose={onClose} 
      maxWidth="max-w-3xl"
    >
      <div className="p-6 space-y-6">
        {customer && canAccessCustomerType && (
          <CustomerInfoCard customer={customer} title="Customer Information (Pre-filled)" />
        )}

        <AppointmentForm
          initialData={initialFormData}
          onSubmit={onSubmit}
          onCancel={onClose}
          mode={isEditMode ? "edit" : "create"}
          customerInfo={customer || undefined}
          vehicleInfo={vehicle || undefined}
          existingAppointments={existingAppointments}
          onCustomerArrived={onCustomerArrived}
          appointmentStatus={appointmentStatus}
          customerArrived={customerArrived}
          onCreateQuotation={onCreateQuotation}
        />
      </div>
    </Modal>
  );
}

