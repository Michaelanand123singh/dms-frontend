import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../client';

// Mock fetch
global.fetch = vi.fn();

it('canary test', () => {
    expect(true).toBe(true);
});

describe('ApiClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // @ts-ignore - access private cache to clear it
        apiClient.cache.clear();
    });

    it('should make a GET request and return data', async () => {
        const mockData = { id: 1, name: 'Test' };
        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ data: mockData }),
        });

        const response = await apiClient.get('/test');

        expect(response.data).toEqual(mockData);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should cache GET requests', async () => {
        const mockData = { id: 1, name: 'Test' };
        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ data: mockData }),
        });

        // First call
        await apiClient.get('/test');
        // Second call
        await apiClient.get('/test');

        expect(fetch).toHaveBeenCalledTimes(1); // Should hit cache second time
    });

    it('should retry on failure', async () => {
        (fetch as any)
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: 'success' }),
            });

        const response = await apiClient.get('/retry-test', { retries: 1 });

        expect(response.data).toBe('success');
        expect(fetch).toHaveBeenCalledTimes(2);
    });
});
