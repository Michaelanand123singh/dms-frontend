/**
 * Appointment Form Modal Component
 * Wrapper around shared AppointmentForm component
 */

import { Modal, FormInput } from "../shared";
import { AppointmentForm } from "./AppointmentForm";
import { CustomerInfoCard } from "../shared";
import { Car } from "lucide-react";
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
}: AppointmentFormModalProps) {
  if (!isOpen || !customer) return null;

  return (
    <Modal title="Schedule Appointment" onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6 space-y-6">
        {canAccessCustomerType && (
          <CustomerInfoCard customer={customer} title="Customer Information (Pre-filled)" />
        )}

        {/* Vehicle Information - Right after Customer Details */}
        {vehicle && canAccessVehicleInfo && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Car className="text-indigo-600" size={20} />
              Vehicle Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Vehicle Brand" value={vehicle.vehicleMake} onChange={() => {}} readOnly />
              <FormInput label="Vehicle Model" value={vehicle.vehicleModel} onChange={() => {}} readOnly />
              <FormInput label="Registration Number" value={vehicle.registration || ""} onChange={() => {}} readOnly />
              <FormInput label="VIN / Chassis Number" value={vehicle.vin} onChange={() => {}} readOnly className="font-mono" />
              <FormInput
                label="Year of Manufacture"
                value={vehicle.vehicleYear?.toString() || ""}
                onChange={() => {}}
                readOnly
              />
              {vehicle.vehicleColor && (
                <FormInput label="Vehicle Color" value={vehicle.vehicleColor} onChange={() => {}} readOnly />
              )}
              {vehicle.variant && (
                <FormInput label="Variant / Battery Capacity" value={vehicle.variant} onChange={() => {}} readOnly />
              )}
              {vehicle.motorNumber && (
                <FormInput label="Motor Number" value={vehicle.motorNumber} onChange={() => {}} readOnly />
              )}
              {vehicle.chargerSerialNumber && (
                <FormInput
                  label="Charger Serial Number"
                  value={vehicle.chargerSerialNumber}
                  onChange={() => {}}
                  readOnly
                />
              )}
            </div>
          </div>
        )}

        <AppointmentForm
          initialData={initialFormData}
          onSubmit={onSubmit}
          onCancel={onClose}
          mode="create"
          customerInfo={customer}
          vehicleInfo={vehicle || undefined}
          existingAppointments={existingAppointments}
        />
      </div>
    </Modal>
  );
}

