import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import type { UserRole, UserInfo } from '@/shared/types/auth.types';

interface AuthState {
    userRole: UserRole;
    userInfo: UserInfo | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Actions
    setAuth: (role: UserRole, user: UserInfo) => void;
    clearAuth: () => void;
    setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            userRole: 'admin', // Default role as per current implementation
            userInfo: null,
            isLoading: false,
            isAuthenticated: false,

            setAuth: (role, user) => {
                // Sync with Cookie for Middleware
                Cookies.set('auth_role', role, { expires: 7 });
                Cookies.set('auth_token', 'mock_token', { expires: 7 });

                set({
                    userRole: role,
                    userInfo: user,
                    isAuthenticated: !!user && role !== 'admin'
                });
            },

            clearAuth: () => {
                Cookies.remove('auth_role');
                Cookies.remove('auth_token');

                set({
                    userRole: 'admin',
                    userInfo: null,
                    isAuthenticated: false
                });
            },

            setLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: 'dms-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
