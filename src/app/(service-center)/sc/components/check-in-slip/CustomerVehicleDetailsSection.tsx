"use client";
import { FormInput, FormSelect, FormTextarea } from "../shared";
import type { CheckInSlipFormData } from "@/shared/types/check-in-slip.types";
import type { CustomerWithVehicles, Vehicle } from "@/shared/types";

interface CustomerVehicleDetailsSectionProps {
  formData: CheckInSlipFormData;
  onUpdate: (updates: Partial<CheckInSlipFormData>) => void;
  customerType?: "B2C" | "B2B";
  dateOfPurchase?: string;
  customer?: CustomerWithVehicles | null;
  vehicle?: Vehicle | null;
  appointmentData?: any;
}

export function CustomerVehicleDetailsSection({
  formData,
  onUpdate,
  customerType,
  dateOfPurchase,
  customer,
  vehicle,
  appointmentData,
}: CustomerVehicleDetailsSectionProps) {
  // Get customer and vehicle information
  const customerName = customer?.name || appointmentData?.customerName || "";
  const primaryPhone = customer?.phone || appointmentData?.phone || "";
  const vehicleBrand = vehicle?.vehicleMake || appointmentData?.vehicleBrand || "";
  const vehicleModel = vehicle?.vehicleModel || appointmentData?.vehicleModel || "";
  const registrationNumber = vehicle?.registration || appointmentData?.registrationNumber || "";
  const vinChassisNumber = vehicle?.vin || appointmentData?.vinChassisNumber || "";

  return (
    <div className="bg-green-50 p-5 rounded-xl border border-green-200">
      <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-green-600 rounded"></span>
        1. Customer & Vehicle Details
      </h4>
      
      {/* Pre-filled Customer & Vehicle Information (Read-only) */}
      {(customerName || primaryPhone || vehicleBrand || vehicleModel || registrationNumber || vinChassisNumber) && (
        <div className="mb-6 bg-white p-4 rounded-lg border border-green-300">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Customer & Vehicle Information</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerName && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Customer Full Name</label>
                <div className="text-sm font-medium text-gray-900">{customerName}</div>
              </div>
            )}
            {primaryPhone && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Primary Phone Number</label>
                <div className="text-sm font-medium text-gray-900">{primaryPhone}</div>
              </div>
            )}
            {vehicleBrand && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Vehicle Brand</label>
                <div className="text-sm font-medium text-gray-900">{vehicleBrand}</div>
              </div>
            )}
            {vehicleModel && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Vehicle Model</label>
                <div className="text-sm font-medium text-gray-900">{vehicleModel}</div>
              </div>
            )}
            {registrationNumber && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Registration Number</label>
                <div className="text-sm font-medium text-gray-900">{registrationNumber}</div>
              </div>
            )}
            {vinChassisNumber && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">VIN / Chassis Number</label>
                <div className="text-sm font-medium text-gray-900">{vinChassisNumber}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editable Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Customer Type"
          value={formData.customerType || customerType || ""}
          onChange={(e) => onUpdate({ customerType: e.target.value as "B2C" | "B2B" })}
          placeholder="Select customer type"
          options={[
            { value: "", label: "Select customer type" },
            { value: "B2C", label: "B2C (Individual)" },
            { value: "B2B", label: "B2B (Business)" },
          ]}
        />
        <FormInput
          label="Date of Vehicle Delivery"
          type="date"
          value={formData.dateOfVehicleDelivery || dateOfPurchase || ""}
          onChange={(e) => onUpdate({ dateOfVehicleDelivery: e.target.value })}
        />
        <FormInput
          label="Extended Delivery Date (if delayed)"
          type="date"
          value={formData.extendedDeliveryDate || ""}
          onChange={(e) => onUpdate({ extendedDeliveryDate: e.target.value })}
        />
        <FormInput
          label="Battery Serial Number"
          value={formData.batterySerialNumber || ""}
          onChange={(e) => onUpdate({ batterySerialNumber: e.target.value })}
          placeholder="Enter battery serial number"
        />
        <FormInput
          label="MCU Serial Number"
          value={formData.mcuSerialNumber || ""}
          onChange={(e) => onUpdate({ mcuSerialNumber: e.target.value })}
          placeholder="Enter MCU serial number"
        />
        <FormInput
          label="VCU Serial Number"
          value={formData.vcuSerialNumber || ""}
          onChange={(e) => onUpdate({ vcuSerialNumber: e.target.value })}
          placeholder="Enter VCU serial number"
        />
        <FormInput
          label="Other Part Serial Number"
          value={formData.otherPartSerialNumber || ""}
          onChange={(e) => onUpdate({ otherPartSerialNumber: e.target.value })}
          placeholder="Enter other part serial number"
        />
      </div>
      <div className="mt-4">
        <FormTextarea
          label="Customer Feedback / Concerns"
          value={formData.customerFeedback || ""}
          onChange={(e) => onUpdate({ customerFeedback: e.target.value })}
          placeholder="Enter customer feedback and concerns"
          rows={3}
        />
      </div>
      <div className="mt-4">
        <FormTextarea
          label="Technical Observation"
          value={formData.technicalObservation || ""}
          onChange={(e) => onUpdate({ technicalObservation: e.target.value })}
          placeholder="Enter initial technician notes"
          rows={3}
        />
      </div>
    </div>
  );
}

