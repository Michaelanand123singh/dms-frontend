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
        const response = await apiClient.post<any>('/auth/login', credentials);

        if (response.data && response.data.access_token) {
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

            // Store the real token
            Cookies.set('auth_token', response.data.access_token, { expires: 7 });

            const loginResponse: LoginResponse = {
                access_token: response.data.access_token,
                user
            };

            // Update auth store
            const { setAuth } = useAuthStore.getState();
            setAuth(user.role, user);

            return loginResponse;
        }

        throw new Error('Login failed: Invalid response from server');
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
