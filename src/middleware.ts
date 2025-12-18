import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hasAccess } from './shared/constants/routes';
import type { UserRole } from './shared/types/auth.types';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public paths
    if (pathname === '/' || pathname.startsWith('/_next') || pathname.includes('/api/') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // Get role from cookie
    const roleCookie = request.cookies.get('auth_role')?.value;
    const tokenCookie = request.cookies.get('auth_token')?.value;

    // If no auth, redirect to login
    if (!roleCookie || !tokenCookie) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    const role = roleCookie as UserRole;

    // Check role-based access
    if (!hasAccess(role, pathname)) {
        // Redirect to their default dashboard if they try to access unauthorized path
        const url = request.nextUrl.clone();

        // This is a bit simplified, ideally we'd use getRedirectPath but that's a client function usually
        if (role === 'admin' || role === 'super_admin') {
            url.pathname = '/dashboard';
        } else if (['sc_manager', 'service_engineer', 'service_advisor', 'call_center'].includes(role)) {
            url.pathname = '/sc/dashboard';
        } else if (role === 'inventory_manager') {
            url.pathname = '/inventory-manager/dashboard';
        } else if (role === 'central_inventory_manager') {
            url.pathname = '/central-inventory/dashboard';
        } else {
            url.pathname = '/';
        }

        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
