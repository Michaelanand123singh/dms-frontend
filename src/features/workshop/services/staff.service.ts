/**
 * Staff Service - Manages workshop staff and engineers
 * Migrated to use backend API
 */

import { userRepository } from '@/core/repositories/user.repository';
import type { Engineer } from '@/shared/types/workshop.types';
import type { User } from '@/shared/types/user.types';

class StaffService {
    /**
     * Map User to Engineer interface with default workshop values
     */
    private mapUserToEngineer(user: User): Engineer {
        return {
            id: parseInt(user.id) || 0, // Engineer expects number
            name: user.name,
            status: 'Available', // Default status
            currentJobs: 0, // These would need to come from job card queries
            completedToday: 0,
            utilization: 0,
            skills: [], // Could be extended in backend
            workload: 'Low',
        };
    }

    /**
     * Get all engineers/service engineers
     */
    async getEngineers(serviceCenterId?: string): Promise<Engineer[]> {
        const users = await userRepository.getByRole('service_engineer', serviceCenterId);
        return users.map(user => this.mapUserToEngineer(user));
    }

    /**
     * Get engineer by ID
     */
    async getEngineerById(id: string): Promise<Engineer | null> {
        try {
            const user = await userRepository.getById(id);
            if (user.role === 'service_engineer') {
                return this.mapUserToEngineer(user);
            }
            return null;
        } catch {
            return null;
        }
    }

    /**
     * Get all staff (all roles)
     */
    async getAllStaff(serviceCenterId?: string): Promise<User[]> {
        const params = serviceCenterId ? { serviceCenterId } : undefined;
        return userRepository.getAll(params);
    }
}

export const staffService = new StaffService();

