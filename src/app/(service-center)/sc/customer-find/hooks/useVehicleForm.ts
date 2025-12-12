/**
 * Hook for managing vehicle form state, validation, and submission
 * Preserves prefilled customer info + manual vehicle entry pattern
 */

import { useState, useCallback } from "react";
import { customerService } from "@/features/customers/services/customer.service";
import { validateVIN } from "@/shared/utils/validation";
import { initialVehicleForm } from "../constants/form.constants";
import type { NewVehicleForm, Vehicle, CustomerWithVehicles } from "@/shared/types";

export interface UseVehicleFormReturn {
  newVehicleForm: Partial<NewVehicleForm>;
  setNewVehicleForm: React.Dispatch<React.SetStateAction<Partial<NewVehicleForm>>>;
  vehicleFormState: string;
  setVehicleFormState: React.Dispatch<React.SetStateAction<string>>;
  vehicleFormCity: string;
  setVehicleFormCity: React.Dispatch<React.SetStateAction<string>>;
  hasInsurance: boolean;
  setHasInsurance: React.Dispatch<React.SetStateAction<boolean>>;
  validationError: string;
  setValidationError: React.Dispatch<React.SetStateAction<string>>;
  resetVehicleForm: () => void;
  validateVehicleForm: () => { error: string | null };
  handleSaveVehicle: (
    selectedCustomer: CustomerWithVehicles,
    showToast: (message: string, type: "success" | "error") => void,
    setSelectedCustomer: (customer: CustomerWithVehicles) => void,
    setSelectedVehicle: (vehicle: Vehicle | null) => void,
    closeVehicleForm: () => void,
    shouldOpenAppointmentAfterVehicleAdd: boolean,
    initializeAppointmentForm: (customer: CustomerWithVehicles, vehicle: Vehicle) => void,
    setShowScheduleAppointment: (show: boolean) => void,
    setShowVehicleDetails: (show: boolean) => void,
    setShouldOpenAppointmentAfterVehicleAdd: (should: boolean) => void
  ) => Promise<Vehicle | null>;
}

/**
 * Hook to manage vehicle form state and operations
 * Supports prefilled customer info (read-only) + manual vehicle entry
 * @param initialData - Optional initial form data (for prefilled values)
 * @returns Vehicle form state and handlers
 */
export function useVehicleForm(
  initialData?: Partial<NewVehicleForm>
): UseVehicleFormReturn {
  const [newVehicleForm, setNewVehicleForm] = useState<Partial<NewVehicleForm>>(() => ({
    ...initialVehicleForm,
    ...initialData, // Prefilled values override defaults
  }));
  const [vehicleFormState, setVehicleFormState] = useState<string>("");
  const [vehicleFormCity, setVehicleFormCity] = useState<string>("");
  const [hasInsurance, setHasInsurance] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");

  const resetVehicleForm = useCallback(() => {
    setNewVehicleForm({ ...initialVehicleForm });
    setVehicleFormState("");
    setVehicleFormCity("");
    setHasInsurance(false);
    setValidationError("");
  }, []);

  const validateVehicleForm = useCallback(() => {
    // Validate form
    if (!newVehicleForm.vehicleBrand || !newVehicleForm.vehicleModel) {
      return { error: "Vehicle Brand and Vehicle Model are required" };
    }

    if (!newVehicleForm.registrationNumber) {
      return { error: "Registration Number is required" };
    }

    if (!newVehicleForm.vin) {
      return { error: "VIN / Chassis Number is required" };
    }

    if (!validateVIN(newVehicleForm.vin)) {
      return {
        error: "Invalid VIN format. VIN must be exactly 17 alphanumeric characters (excluding I, O, Q)",
      };
    }

    // Validate insurance dates if provided and hasInsurance is checked
    if (hasInsurance && newVehicleForm.insuranceStartDate && newVehicleForm.insuranceEndDate) {
      const startDate = new Date(newVehicleForm.insuranceStartDate);
      const endDate = new Date(newVehicleForm.insuranceEndDate);
      if (endDate <= startDate) {
        return { error: "Insurance end date must be after start date" };
      }
    }

    return { error: null };
  }, [newVehicleForm, hasInsurance]);

  const handleSaveVehicle = useCallback(
    async (
      selectedCustomer: CustomerWithVehicles,
      showToast: (message: string, type: "success" | "error") => void,
      setSelectedCustomer: (customer: CustomerWithVehicles) => void,
      setSelectedVehicle: (vehicle: Vehicle | null) => void,
      closeVehicleForm: () => void,
      shouldOpenAppointmentAfterVehicleAdd: boolean,
      initializeAppointmentForm: (customer: CustomerWithVehicles, vehicle: Vehicle) => void,
      setShowScheduleAppointment: (show: boolean) => void,
      setShowVehicleDetails: (show: boolean) => void,
      setShouldOpenAppointmentAfterVehicleAdd: (should: boolean) => void
    ): Promise<Vehicle | null> => {
      const { error } = validateVehicleForm();
      if (error) {
        setValidationError(error);
        return null;
      }

      setValidationError("");

      // Create a new vehicle object
      const newVehicle: Vehicle = {
        id: Date.now(), // Temporary ID
        customerId: selectedCustomer.id,
        customerNumber: selectedCustomer.customerNumber,
        phone: selectedCustomer.phone,
        registration: newVehicleForm.registrationNumber || "",
        vin: newVehicleForm.vin || "",
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email || "",
        customerAddress: selectedCustomer.address || "",
        vehicleMake: newVehicleForm.vehicleBrand || "",
        vehicleModel: newVehicleForm.vehicleModel || "",
        vehicleYear: newVehicleForm.purchaseDate
          ? new Date(newVehicleForm.purchaseDate).getFullYear()
          : new Date().getFullYear(),
        vehicleColor: newVehicleForm.vehicleColor || "",
        lastServiceDate: "",
        totalServices: 0,
        totalSpent: "₹0",
        currentStatus: "Available",
        activeJobCardId: null,
        // Additional vehicle details
        variant: newVehicleForm.variant || undefined,
        motorNumber: newVehicleForm.motorNumber || undefined,
        chargerSerialNumber: newVehicleForm.chargerSerialNumber || undefined,
        purchaseDate: newVehicleForm.purchaseDate || undefined,
        warrantyStatus: newVehicleForm.warrantyStatus || undefined,
        insuranceStartDate: hasInsurance ? newVehicleForm.insuranceStartDate || undefined : undefined,
        insuranceEndDate: hasInsurance ? newVehicleForm.insuranceEndDate || undefined : undefined,
        insuranceCompanyName: hasInsurance ? newVehicleForm.insuranceCompanyName || undefined : undefined,
      };

      // Add vehicle to customer's vehicles array
      const updatedVehicles = [...(selectedCustomer.vehicles || []), newVehicle];
      const updatedCustomer: CustomerWithVehicles = {
        ...selectedCustomer,
        vehicles: updatedVehicles,
        totalVehicles: updatedVehicles.length,
      };

      // Persist the vehicle to the repository
      try {
        await customerService.update(selectedCustomer.id, {
          vehicles: updatedVehicles,
          totalVehicles: updatedVehicles.length,
        });
      } catch (error) {
        console.error("Failed to save vehicle:", error);
        setValidationError("Failed to save vehicle. Please try again.");
        return null;
      }

      // Update selected customer
      setSelectedCustomer(updatedCustomer);
      setSelectedVehicle(newVehicle);

      showToast(
        `Vehicle added successfully! Brand: ${newVehicleForm.vehicleBrand} | Model: ${newVehicleForm.vehicleModel} | Registration: ${newVehicleForm.registrationNumber}`,
        "success"
      );

      // Close popup and reset form
      closeVehicleForm();

      // If we should open appointment after adding vehicle, do it now
      if (shouldOpenAppointmentAfterVehicleAdd) {
        initializeAppointmentForm(updatedCustomer, newVehicle);
        setShowVehicleDetails(false); // Ensure vehicle details modal is closed
        setShowScheduleAppointment(true);
        setShouldOpenAppointmentAfterVehicleAdd(false);
      }

      return newVehicle;
    },
    [newVehicleForm, hasInsurance, validateVehicleForm]
  );

  return {
    newVehicleForm,
    setNewVehicleForm,
    vehicleFormState,
    setVehicleFormState,
    vehicleFormCity,
    setVehicleFormCity,
    hasInsurance,
    setHasInsurance,
    validationError,
    setValidationError,
    resetVehicleForm,
    validateVehicleForm,
    handleSaveVehicle,
  };
}

