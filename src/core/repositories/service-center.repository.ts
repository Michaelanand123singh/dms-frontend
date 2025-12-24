import { BaseRepository } from './base.repository';
import type { ServiceCenter } from '@/shared/types/service-center.types';
import { apiClient } from '@/core/api/client';

class ServiceCenterRepository extends BaseRepository<ServiceCenter> {
    protected endpoint = '/service-centers';

    // Override update to use PATCH since backend uses PATCH
    async update(id: string, data: Partial<ServiceCenter>): Promise<ServiceCenter> {
        const response = await apiClient.patch<ServiceCenter>(`${this.endpoint}/${id}`, data);
        return response.data;
    }
}

export const serviceCenterRepository = new ServiceCenterRepository();
