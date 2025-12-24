
// Mock data for Service Centers - Placeholder for now until full migration
// This file serves to satisfy existing imports.

export const defaultServiceCenters = [
    {
        id: 1,
        name: "Downtown Service Hub",
        location: "123 Main St, Cityville",
        staff: 12,
        jobs: 45,
        revenue: "₹45.2L",
        status: "Active" as const,
        rating: 4.8,
    },
    // ... add more if needed or fetch from API
];

export const staticServiceCenters = [
    {
        id: 1,
        name: "Downtown Service Hub",
        location: "123 Main St, Cityville",
        staff: 12,
        jobs: 45,
        revenue: "₹45.2L",
        status: "Active" as const,
        rating: 4.8,
    },
];

export const availableServiceTypes = [
    "Periodic Maintenance Service",
    "Running Repairs",
    "Accidental Repairs",
    "Car Spa & Cleaning",
    "Wheel Care",
    "Denting & Painting",
    "Insurance Claims",
    "EV Service"
];

// Re-export specific mock data used by other components if any
export const serviceCenters = defaultServiceCenters;
