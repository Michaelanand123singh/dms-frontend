/**
 * Mock data for Appointments
 */

export interface Appointment {
  id: number;
  customerName: string;
  vehicle: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  duration: string;
  status: "Confirmed" | "Pending" | "Cancelled";
}

/**
 * Default appointments data
 * In production, this would be fetched from an API
 */
export const defaultAppointments: Appointment[] = [
  {
    id: 1,
    customerName: "Rajesh Kumar",
    vehicle: "Honda City",
    phone: "9876543210",
    serviceType: "Routine Maintenance",
    date: "2025-01-20",
    time: "10:00 AM",
    duration: "2 hours",
    status: "Confirmed",
  },
  {
    id: 2,
    customerName: "Priya Sharma",
    vehicle: "Maruti Swift",
    phone: "9876543211",
    serviceType: "AC Repair",
    date: "2025-01-20",
    time: "2:00 PM",
    duration: "3 hours",
    status: "Confirmed",
  },
];

/**
 * Available service types for appointments
 */
export const serviceTypes = [
  "Routine Maintenance",
  "AC Repair",
  "Oil Change",
  "Battery Replacement",
  "Tire Service",
  "Brake Service",
  "Other",
] as const;

export type ServiceType = typeof serviceTypes[number];

