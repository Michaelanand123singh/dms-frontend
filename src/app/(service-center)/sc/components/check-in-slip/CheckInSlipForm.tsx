"use client";
import { useState, useEffect } from "react";
import type { CheckInSlipFormData } from "@/shared/types/check-in-slip.types";
import type { CustomerWithVehicles, Vehicle } from "@/shared/types";
import {
  CustomerVehicleDetailsSection,
  VehicleConditionSection,
  MirrorLooseItemsSection,
  ServiceConsentSection,
  WarrantyDefectSection,
  SymptomDefectSection,
} from "./index";

interface CheckInSlipFormProps {
  formData: CheckInSlipFormData;
  onUpdate: (updates: Partial<CheckInSlipFormData>) => void;
  customer?: CustomerWithVehicles | null;
  vehicle?: Vehicle | null;
  appointmentData?: any;
  defaultServiceAdvisor?: string;
}

export function CheckInSlipForm({
  formData,
  onUpdate,
  customer,
  vehicle,
  appointmentData,
  defaultServiceAdvisor,
}: CheckInSlipFormProps) {
  // Auto-populate from appointment/customer/vehicle data
  useEffect(() => {
    if (appointmentData || customer || vehicle) {
      const updates: Partial<CheckInSlipFormData> = {};

      // From appointment data
      if (appointmentData) {
        if (appointmentData.customerType && !formData.customerType) {
          updates.customerType = appointmentData.customerType;
        }
        if (appointmentData.dateOfPurchase && !formData.dateOfVehicleDelivery) {
          updates.dateOfVehicleDelivery = appointmentData.dateOfPurchase;
        }
        if (appointmentData.customerComplaintIssue && !formData.customerFeedback) {
          updates.customerFeedback = appointmentData.customerComplaintIssue;
        }
        if (appointmentData.technicianObservation && !formData.technicalObservation) {
          updates.technicalObservation = appointmentData.technicianObservation;
        }
        if (appointmentData.batterySerialNumber && !formData.batterySerialNumber) {
          updates.batterySerialNumber = appointmentData.batterySerialNumber;
        }
        if (appointmentData.mcuSerialNumber && !formData.mcuSerialNumber) {
          updates.mcuSerialNumber = appointmentData.mcuSerialNumber;
        }
        if (appointmentData.vcuSerialNumber && !formData.vcuSerialNumber) {
          updates.vcuSerialNumber = appointmentData.vcuSerialNumber;
        }
        if (appointmentData.otherPartSerialNumber && !formData.otherPartSerialNumber) {
          updates.otherPartSerialNumber = appointmentData.otherPartSerialNumber;
        }
        if (appointmentData.assignedServiceAdvisor && !formData.serviceAdvisor) {
          updates.serviceAdvisor = appointmentData.assignedServiceAdvisor;
        }
      }

      // From customer
      if (customer) {
        if (customer.customerType && !formData.customerType) {
          updates.customerType = customer.customerType;
        }
      }

      // From vehicle
      if (vehicle) {
        if (vehicle.purchaseDate && !formData.dateOfVehicleDelivery) {
          updates.dateOfVehicleDelivery = vehicle.purchaseDate;
        }
      }

      if (Object.keys(updates).length > 0) {
        onUpdate(updates);
      }
    }
  }, [appointmentData, customer, vehicle]); // Only run on mount or when these change

  return (
    <div className="space-y-6">
      <CustomerVehicleDetailsSection
        formData={formData}
        onUpdate={onUpdate}
        customerType={customer?.customerType || appointmentData?.customerType}
        dateOfPurchase={vehicle?.purchaseDate || appointmentData?.dateOfPurchase}
        customer={customer}
        vehicle={vehicle}
        appointmentData={appointmentData}
      />

      <VehicleConditionSection formData={formData} onUpdate={onUpdate} />

      <MirrorLooseItemsSection formData={formData} onUpdate={onUpdate} />

      <ServiceConsentSection
        formData={formData}
        onUpdate={onUpdate}
        defaultServiceAdvisor={defaultServiceAdvisor || appointmentData?.assignedServiceAdvisor}
      />

      <WarrantyDefectSection
        formData={formData}
        onUpdate={onUpdate}
        registrationNumber={vehicle?.registration || appointmentData?.registrationNumber}
      />

      <SymptomDefectSection formData={formData} onUpdate={onUpdate} />
    </div>
  );
}


