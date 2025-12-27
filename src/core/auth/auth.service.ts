/**
 * Authentication Service
 * Handles login, logout, and token management
 */

import { apiClient } from '../api/client';
import { useAuthStore } from '@/store/authStore';
import Cookies from 'js-cookie';
import type { UserInfo } from '@/shared/types/auth.types';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: UserInfo;
}

class AuthService {
    /**
     * Login with email and password
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            console.log('[Auth Service] Attempting login with:', credentials.email);

            const response = await apiClient.post<any>('/auth/login', credentials);

            console.log('[Auth Service] Raw API response:', response);
            console.log('[Auth Service] Response data:', response.data);

            // Check if response has the expected structure
            if (!response.data) {
                console.error('[Auth Service] No data in response:', response);
                throw new Error('Invalid response structure: missing data field');
            }

            if (!response.data.access_token) {
                console.error('[Auth Service] No access_token in response.data:', response.data);
                throw new Error('Invalid response: missing access_token');
            }

            if (!response.data.user) {
                console.error('[Auth Service] No user in response.data:', response.data);
                throw new Error('Invalid response: missing user data');
            }

            // Map Backend User Extended Details to Frontend UserInfo
            const backendUser = response.data.user;
            const user: UserInfo = {
                id: backendUser.id,
                email: backendUser.email,
                name: backendUser.name || 'Unknown User',
                role: backendUser.role,
                serviceCenter: backendUser.serviceCenterId, // Map ID to serviceCenter property
                initials: backendUser.name
                    ? backendUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
                    : '??'
            };

            console.log('[Auth Service] Mapped user:', user);

            // Store the real token
            Cookies.set('auth_token', response.data.access_token, { expires: 7 });
            console.log('[Auth Service] Token stored in cookie');

            const loginResponse: LoginResponse = {
                access_token: response.data.access_token,
                user
            };

            // Update auth store
            const { setAuth } = useAuthStore.getState();
            setAuth(user.role, user);
            console.log('[Auth Service] Auth store updated');

            return loginResponse;
        } catch (error: any) {
            console.error('[Auth Service] Login failed:', error);
            console.error('[Auth Service] Error details:', {
                message: error.message,
                code: error.code,
                status: error.status,
                response: error.response
            });
            throw error;
        }
    }

    /**
     * Logout and clear authentication
     */
    logout() {
        const { clearAuth } = useAuthStore.getState();
        clearAuth();
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const token = Cookies.get('auth_token');
        return !!token && token !== 'mock_token';
    }

    /**
     * Get current auth token
     */
    getToken(): string | undefined {
        return Cookies.get('auth_token');
    }
}

export const authService = new AuthService();
