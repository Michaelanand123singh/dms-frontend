/**
 * User Type Definitions
 */

import type { UserRole } from './auth.types';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
    serviceCenterId?: string;
    createdAt?: string;
}

export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phone?: string;
    serviceCenterId?: string;
}
