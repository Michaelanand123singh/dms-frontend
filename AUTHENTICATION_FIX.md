# Authentication Issue Fix - "Cannot POST /customers"

## Problem Summary

The frontend was unable to create customers (and likely perform other API operations) due to **authentication failure**. The error "Cannot POST /customers" with 404/401 status was caused by the backend rejecting requests without valid JWT tokens.

## Root Cause

1. **Mock Token Usage**: The `authStore.ts` was setting `'mock_token'` as the authentication token
2. **Token Rejection**: The auth interceptor was explicitly filtering out `'mock_token'`
3. **Backend Protection**: All customer endpoints require JWT authentication via `@UseGuards(JwtAuthGuard)`
4. **No Auth Header**: Requests were sent without the `Authorization` header, causing 401 Unauthorized

## Solution

### Option 1: Quick Console Login (RECOMMENDED FOR TESTING)

Open your browser console (F12) while on the DMS frontend and paste this:

```javascript
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@dms.com', password: 'admin123' })
})
.then(r => r.json())
.then(data => {
  document.cookie = `auth_token=${data.accessToken}; path=/; max-age=${7*24*60*60}`;
  localStorage.setItem('dms-auth-storage', JSON.stringify({
    state: {
      userRole: data.user.role,
      userInfo: data.user,
      isAuthenticated: true,
      isLoading: false
    },
    version: 0
  }));
  console.log('✅ Logged in successfully as:', data.user.name);
  location.reload();
});
```

### Option 2: Use the Quick Login Utility

Import and call the `quickLogin` function in any component:

```typescript
import { quickLogin } from '@/utils/quick-login';

// In your component or effect
quickLogin('ADMIN'); // or 'MANAGER' or 'ENGINEER'
```

### Option 3: Use the Auth Service Directly

```typescript
import { authService } from '@/core/auth/auth.service';

await authService.login({
  email: 'admin@dms.com',
  password: 'admin123'
});
```

## Test Credentials

All passwords are: `admin123`

| Role | Email | Name |
|------|-------|------|
| Admin | admin@dms.com | System Administrator |
| SC Manager | manager@sc001.com | Mumbai Manager |
| Engineer | engineer@sc001.com | Lead Mechanic |

## Changes Made

### 1. ✅ Fixed Auth Interceptor
**File**: `src/core/api/interceptors.ts`
- Removed the check that excluded `'mock_token'`
- Now allows any token to be sent (backend will validate)

### 2. ✅ Created Auth Service
**File**: `src/core/auth/auth.service.ts`
- New service for handling real login/logout
- Properly stores JWT tokens from backend
- Updates authStore with real user data

### 3. ✅ Created Quick Login Utility
**File**: `src/utils/quick-login.ts`
- Helper for quick testing login
- Predefined test credentials
- Available in browser console as `window.quickLogin()`

## How to Verify the Fix

1. **Login** using one of the methods above
2. **Check Console** - you should see successful login message
3. **Try Creating a Customer** - it should now work!
4. **Check Network Tab** - requests should have `Authorization: Bearer <token>` header

## Next Steps

### Immediate (For Development):
- ✅ Use console login to authenticate quickly
- ✅ Test customer creation, job card operations, etc.

### For Production:
- [ ] Build a proper Login page/component
- [ ] Implement token refresh logic
- [ ] Add proper error handling for expired tokens
- [ ] Create logout functionality in UI
- [ ] Add "Remember Me" functionality
- [ ] Implement proper session management

## Troubleshooting

### Still getting 401?
1. Check if token is in cookies: Open Dev Tools → Application → Cookies → `auth_token`
2. Check localStorage: `dms-auth-storage` should have user info
3. Verify backend is running on `http://localhost:3001`

### Token expires?
- Tokens expire based on backend JWT settings
- Re-run the login script to get a new token
- Implement refresh token flow for production

### Different error?
- Check browser console for detailed error logs
- Verify API_BASE_URL in `.env.local`
- Ensure backend database is seeded with users

## Technical Details

### JWT Token Flow
1. User submits credentials to `/api/auth/login`
2. Backend validates and returns `{ accessToken, user }`
3. Frontend stores token in cookies (`auth_token`)
4. `authRequestInterceptor` adds `Authorization: Bearer <token>` to all requests
5. Backend validates token and allows/denies access

### Auth States
- **Authenticated**: Valid JWT token in cookies
- **Unauthenticated**: No token or expired token
- **Mock**: Old system with `'mock_token'` (now deprecated)

## Files Modified

1. `src/core/api/interceptors.ts` - Removed mock token filter
2. `src/core/auth/auth.service.ts` - NEW
3. `src/utils/quick-login.ts` - NEW
4. `src/features/job-cards/services/jobCard.service.ts` - Fixed type issues
5. `src/shared/utils/normalization.utils.ts` - Fixed type signatures

---

**Status**: ✅ **RESOLVED**

You can now use the API with proper authentication!
