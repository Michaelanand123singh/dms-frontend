/**
 * Shared Identity Types for Data Normalization
 * These interfaces define the "System of Record" for core entities.
 */

export interface CustomerIdentity {
    id: string;
    name: string;
    phone: string;
    email?: string;
    customerNumber?: string;
}

export interface VehicleIdentity {
    id: string;
    registration: string;
    vin: string;
    make: string;
    model: string;
    year?: number;
    color?: string;
}

/**
 * Normalized Reference Type
 * Used by process objects (JobCards, Appointments) to point to master data
 */
export interface MasterDataRefs {
    customerId: string;
    vehicleId?: string;
}
