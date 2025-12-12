/**
 * Form utilities for appointment forms and other form initialization
 */

import { INITIAL_APPOINTMENT_FORM } from "@/app/(service-center)/sc/components/appointment/types";
import type { AppointmentForm } from "@/app/(service-center)/sc/components/appointment/types";
import { getCurrentDate, getCurrentTime } from "./date";

/**
 * Get initial appointment form with date/time defaults
 * Preserves prefilled/manual entry pattern by allowing initialData override
 * @param initialData - Optional partial form data to override defaults
 * @returns AppointmentForm with current date/time set
 */
export function getInitialAppointmentForm(
  initialData?: Partial<AppointmentForm>
): AppointmentForm {
  return {
    ...INITIAL_APPOINTMENT_FORM,
    date: getCurrentDate(),
    time: getCurrentTime(),
    ...initialData, // Prefilled values override defaults
  };
}

/**
 * Reset form to initial state while preserving prefilled data pattern
 * @param initialForm - Base form structure
 * @param initialData - Optional prefilled data
 * @returns Reset form with initial data merged
 */
export function resetForm<T extends Record<string, any>>(
  initialForm: T,
  initialData?: Partial<T>
): T {
  return {
    ...initialForm,
    ...initialData,
  };
}

