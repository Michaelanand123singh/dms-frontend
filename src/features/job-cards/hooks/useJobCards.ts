import { useQuery } from '@tanstack/react-query';
import { useRole } from '@/shared/hooks';
import type { JobCard } from '@/shared/types';
import {
    defaultJobCards,
    serviceEngineerJobCards,
} from '@/__mocks__/data/job-cards.mock';

export function useJobCards() {
    const { userRole, userInfo } = useRole();
    const isTechnician = userRole === 'service_engineer';

    return useQuery({
        queryKey: ['jobCards', userRole, isTechnician ? userInfo?.name : 'all'],
        queryFn: async () => {
            // Dynamically import the migration utility
            // This ensures code splitting and avoids issues if the util assumes browser env immediately
            const { migrateAllJobCards } = await import('@/app/(service-center)/sc/job-cards/utils/migrateJobCards.util');
            const storedJobCards = migrateAllJobCards();

            if (storedJobCards.length > 0) {
                if (isTechnician) {
                    // Merge service engineer job cards with stored cards, avoiding duplicates
                    // logic copied from page.tsx
                    const existingIds = new Set(storedJobCards.map((j: JobCard) => j.id));
                    const newEngineerCards = serviceEngineerJobCards.filter((j: JobCard) => !existingIds.has(j.id));
                    const engineerName = userInfo?.name || "Service Engineer";
                    const updatedEngineerCards = newEngineerCards.map((card) => ({
                        ...card,
                        assignedEngineer: engineerName,
                    }));
                    return [...storedJobCards, ...updatedEngineerCards];
                }
                return storedJobCards;
            }

            // No stored data - use default or service engineer mock data
            if (isTechnician) {
                const engineerName = userInfo?.name || "Service Engineer";
                return serviceEngineerJobCards.map((card) => ({
                    ...card,
                    assignedEngineer: engineerName,
                }));
            }

            return defaultJobCards;
        },
        staleTime: 60 * 1000, // 1 minute
    });
}
