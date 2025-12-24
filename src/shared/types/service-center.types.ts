import { UserInfo } from './auth.types';

export interface ServiceCenter {
    id: string;
    name: string;
    code: string;
    address?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    phone?: string;
    email?: string;

    // Operational Config
    capacity?: number;
    technicianCount?: number;
    serviceRadius?: number; // Prisma Decimal returns as string usually in JSON unless configured
    homeServiceEnabled: boolean;
    maxAppointmentsPerDay?: number;

    // Financial Setup
    invoicePrefix?: string;
    bankName?: string;
    bankAccount?: string;
    bankIFSC?: string;
    gstNumber?: string;
    panNumber?: string;

    // Service Capabilities
    serviceTypes: string[];

    // Status
    status: string; // "Active" | "Inactive"

    createdAt: string;
    updatedAt: string;

    // Relations (optional/included)
    // Relations (optional/included)
    users?: UserInfo[];
    _count?: {
        users: number;
        jobCards: number;
    };
}

export interface CreateServiceCenterDTO {
    name: string;
    code: string;
    address: string;
    city?: string;
    state?: string;
    pinCode?: string;
    phone: string;
    email?: string;

    capacity?: number;
    technicianCount?: number;
    serviceRadius?: number;
    homeServiceEnabled?: boolean;
    maxAppointmentsPerDay?: number;

    invoicePrefix?: string;
    bankName?: string;
    bankAccount?: string;
    bankIFSC?: string;
    gstNumber?: string;
    panNumber?: string;

    serviceTypes?: string[];
    status?: string;
}

export interface UpdateServiceCenterDTO extends Partial<CreateServiceCenterDTO> { }
