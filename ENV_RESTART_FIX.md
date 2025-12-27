# Environment Variable Not Loading - Fix

## 🔴 Problem

Frontend is still hitting `http://localhost:3001/api` even after updating `.env` file with the cloud API URL.

## 🎯 Root Cause

**Next.js loads environment variables at startup time**, not dynamically. The dev server has been running for 12+ minutes and was started before you updated the `.env` file.

## ✅ Solution

**Restart the dev server** to load the new environment variables.

### Steps:

1. **Stop the current dev server**:
   - In your terminal running `npm run dev`, press `Ctrl+C`
   - Or close the terminal window

2. **Verify .env file has correct URL**:
   ```bash
   # Check your .env file contains:
   NEXT_PUBLIC_API_URL=https://dms-backend-um2e.onrender.com/api
   ```

3. **Restart the dev server**:
   ```bash
   npm run dev
   ```

4. **Verify the new URL is loaded**:
   - Open browser console
   - Try to login
   - Check Network tab - requests should now go to `https://dms-backend-um2e.onrender.com/api`

---

## 🔍 Why This Happens

Next.js environment variables prefixed with `NEXT_PUBLIC_` are:
- ✅ Embedded into the JavaScript bundle at build time
- ❌ NOT read dynamically at runtime
- ❌ NOT hot-reloaded when changed

This means:
- Changing `.env` while dev server is running = **No effect**
- Must restart dev server to pick up changes

---

## 📋 Quick Verification

After restarting, run this in browser console:

```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

Should output:
```
API URL: https://dms-backend-um2e.onrender.com/api
```

---

## 🚨 Common Mistakes

1. **Editing wrong .env file**
   - ❌ `.env.example` (this is just a template)
   - ✅ `.env` or `.env.local` (actual config)

2. **Not restarting dev server**
   - Environment changes require restart
   - Hot reload doesn't apply to env vars

3. **Missing NEXT_PUBLIC_ prefix**
   - Client-side env vars MUST start with `NEXT_PUBLIC_`
   - Without it, variable won't be available in browser

---

## ✅ Final Checklist

- [ ] `.env` file exists in project root
- [ ] Contains: `NEXT_PUBLIC_API_URL=https://dms-backend-um2e.onrender.com/api`
- [ ] Dev server restarted (Ctrl+C then `npm run dev`)
- [ ] Browser console shows correct API URL
- [ ] Network requests go to Render backend
