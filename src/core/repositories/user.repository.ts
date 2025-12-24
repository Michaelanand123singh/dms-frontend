import { BaseRepository } from './base.repository';
import type { User } from '@/shared/types/user.types';
import { apiClient } from '@/core/api/client';

class UserRepository extends BaseRepository<User> {
    protected endpoint = '/users';

    /**
     * Get current user profile
     */
    async getProfile(): Promise<User> {
        const response = await apiClient.get<User>(`${this.endpoint}/me`);
        return response.data;
    }

    /**
     * Get users by role (e.g., engineers, advisors)
     */
    async getByRole(role: string, serviceCenterId?: string): Promise<User[]> {
        const params: Record<string, any> = { role };
        if (serviceCenterId) {
            params.serviceCenterId = serviceCenterId;
        }
        const response = await this.getAll(params);
        return response;
    }
}

export const userRepository = new UserRepository();
