import { JobCard } from "../types/job-card.types";
import { Appointment } from "../types/appointment.types";

/**
 * Strips redundant master data from a Job Card to keep it normalized.
 * Returns only the "Process Data" and the Reference IDs.
 */
export const normalizeJobCard = (jobCard: JobCard): Partial<JobCard> => {
    const {
        customerName,
        vehicle,
        registration,
        vehicleMake,
        vehicleModel,
        customerEmail,
        customerWhatsappNumber,
        customerAlternateMobile,
        // Keep everything else as process data
        ...normalized
    } = jobCard;

    return normalized;
};

/**
 * Strips redundant master data from an Appointment.
 */
export const normalizeAppointment = (appointment: Appointment): Partial<Appointment> => {
    const {
        customerName,
        vehicle,
        phone,
        ...normalized
    } = appointment;

    return normalized;
};

/**
 * Migration utility to normalize existing localStorage data
 */
export const migrateToNormalizedStore = (key: string, normalizer: (item: any) => any) => {
    if (typeof window === 'undefined') return;

    const rawData = localStorage.getItem(key);
    if (!rawData) return;

    try {
        const data = JSON.parse(rawData);
        if (Array.isArray(data)) {
            const normalizedData = data.map(normalizer);
            localStorage.setItem(key, JSON.stringify(normalizedData));
            console.log(`[Normalization] Successfully migrated ${key}`);
        }
    } catch (error) {
        console.error(`[Normalization] Failed to migrate ${key}:`, error);
    }
};
