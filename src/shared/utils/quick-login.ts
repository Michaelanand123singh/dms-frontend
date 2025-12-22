/**
 * Quick Login Helper for Testing
 * 
 * This file can be used to quickly login during development.
 * 
 * Usage:
 * 1. Import this file in your component or page
 * 2. Call quickLogin() to login as admin
 * 3. Or use the browser console method below
 * 
 * Browser Console Method:
 * Open your browser console and paste:
 * 
 * ```javascript
 * fetch('http://localhost:3001/api/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email: 'admin@dms.com', password: 'admin123' })
 * })
 * .then(r => r.json())
 * .then(data => {
 *   document.cookie = `auth_token=${data.accessToken}; path=/; max-age=${7*24*60*60}`;
 *   localStorage.setItem('dms-auth-storage', JSON.stringify({
 *     state: {
 *       userRole: data.user.role,
 *       userInfo: data.user,
 *       isAuthenticated: true,
 *       isLoading: false
 *     },
 *     version: 0
 *   }));
 *   location.reload();
 * });
 * ```
 */

import { authService } from '@/core/auth/auth.service';

export const TEST_CREDENTIALS = {
    ADMIN: {
        email: 'admin@dms.com',
        password: 'admin123',
    },
    MANAGER: {
        email: 'manager@sc001.com',
        password: 'admin123',
    },
    ENGINEER: {
        email: 'engineer@sc001.com',
        password: 'admin123',
    },
    ADVISOR: {
        email: 'advisor@sc001.com',
        password: 'admin123',
    },
    CALL_CENTER: {
        email: 'callcenter@sc001.com',
        password: 'admin123',
    },
    INVENTORY_MANAGER: {
        email: 'inventory@sc001.com',
        password: 'admin123',
    },
    CENTRAL_INVENTORY_MANAGER: {
        email: 'central-inventory@dms.com',
        password: 'admin123',
    },
};

type UserRole = keyof typeof TEST_CREDENTIALS;

/**
 * Quick login as admin for testing
 */
export async function quickLogin(role: UserRole = 'ADMIN') {
    try {
        const credentials = TEST_CREDENTIALS[role];
        console.log(`Logging in as ${credentials.email}...`);

        const result = await authService.login(credentials);
        console.log('Login successful!', result.user);

        // Reload to apply auth state
        if (typeof window !== 'undefined') {
            window.location.reload();
        }

        return result;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

// Make available in window for easy console access
if (typeof window !== 'undefined') {
    (window as any).quickLogin = quickLogin;
    (window as any).TEST_CREDENTIALS = TEST_CREDENTIALS;
}
