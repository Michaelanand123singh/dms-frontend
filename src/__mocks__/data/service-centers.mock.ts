/**
 * Mock data for Service Centers
 */

export interface ServiceCenterStaff {
  id: number;
  name: string;
  role: string;
  email: string;
  status: string;
}

export interface ServiceCenterData {
  id: number;
  name: string;
  location: string;
  staff: number;
  jobs: number;
  revenue: string;
  status: "Active" | "Inactive";
  rating: number;
  staffMembers: ServiceCenterStaff[];
  serviceCenterId?: string;
  code?: string;
}

export const defaultServiceCenters: ServiceCenterData[] = [
  {
    id: 1,
    name: "Delhi Central Hub",
    location: "Connaught Place, New Delhi",
    staff: 3,
    jobs: 12,
    revenue: "₹12.4L",
    status: "Active",
    rating: 4.9,
    serviceCenterId: "sc-001",
    code: "SC001",
    staffMembers: [
      {
        id: 1,
        name: "Delhi Manager",
        role: "SC Manager",
        email: "delhi@service.com",
        status: "Active",
      },
      {
        id: 2,
        name: "Technician Raj",
        role: "Technician",
        email: "raj@service.com",
        status: "Active",
      },
      {
        id: 3,
        name: "Technician Priya",
        role: "Technician",
        email: "priya@service.com",
        status: "Active",
      },
    ],
  },
  {
    id: 2,
    name: "Mumbai Metroplex",
    location: "Bandra West, Mumbai",
    staff: 3,
    jobs: 18,
    revenue: "₹18.9L",
    status: "Active",
    rating: 4.8,
    serviceCenterId: "sc-002",
    code: "SC002",
    staffMembers: [
      {
        id: 1,
        name: "Mumbai Manager",
        role: "SC Manager",
        email: "mumbai@service.com",
        status: "Active",
      },
      {
        id: 2,
        name: "Technician Amit",
        role: "Technician",
        email: "amit@service.com",
        status: "Active",
      },
      {
        id: 3,
        name: "Technician Sneha",
        role: "Technician",
        email: "sneha@service.com",
        status: "Active",
      },
    ],
  },
  {
    id: 3,
    name: "Bangalore Innovation Center",
    location: "Koramangala, Bangalore",
    staff: 2,
    jobs: 15,
    revenue: "₹15.6L",
    status: "Active",
    rating: 4.9,
    serviceCenterId: "sc-003",
    code: "SC003",
    staffMembers: [
      {
        id: 1,
        name: "Bangalore Manager",
        role: "SC Manager",
        email: "bangalore@service.com",
        status: "Active",
      },
      {
        id: 2,
        name: "Technician Vikram",
        role: "Technician",
        email: "vikram@service.com",
        status: "Active",
      },
    ],
  },
];

export const staticServiceCenters = [
  { id: 1, name: "Delhi Central Hub", location: "Connaught Place, New Delhi" },
  { id: 2, name: "Mumbai Metroplex", location: "Bandra West, Mumbai" },
  { id: 3, name: "Bangalore Innovation Center", location: "Koramangala, Bangalore" },
];

export const serviceCentersList = [
  "All Service Centers",
  "Delhi Central Hub",
  "Mumbai Metroplex",
  "Bangalore Innovation Center",
];

export const serviceCenterUsers = [
  {
    name: "Service Center Manager",
    email: "service-manager@service.com",
    role: "Service Manager",
    serviceCenterId: "sc-001",
  },
  {
    name: "Inventory Manager",
    email: "inventory@service.com",
    role: "Inventory Manager",
    serviceCenterId: "sc-001",
  },
  {
    name: "Service Advisor",
    email: "advisor@service.com",
    role: "Service Advisor",
    serviceCenterId: "sc-001",
  },
  {
    name: "Service Technician",
    email: "technician@service.com",
    role: "Service Technician",
    serviceCenterId: "sc-001",
  },
];

export const defaultInventory = [
  { partName: "Engine Oil", hsnCode: "EO-001", category: "Lubricants" },
  { partName: "Brake Pads", hsnCode: "BP-002", category: "Brakes" },
  { partName: "Air Filter", hsnCode: "AF-003", category: "Filters" },
];

/**
 * Available service types for service centers
 */
export const availableServiceTypes = [
  "Routine Maintenance",
  "Repair",
  "Inspection",
  "Warranty",
  "AC Service",
  "Battery Replacement",
  "Tire Service",
  "Body Work",
  "Paint",
  "Engine Overhaul",
] as const;

