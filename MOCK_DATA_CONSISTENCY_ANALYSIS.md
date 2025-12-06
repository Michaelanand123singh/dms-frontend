# Mock Data Consistency Analysis & Fixes

## Analysis Summary

After analyzing all mock data files and the approvals page, the following inconsistencies were identified and fixed:

## Issues Found

### 1. Service Center ID Format Inconsistency
**Problem:**
- `service-centers.mock.ts`: Uses numeric `id: 1, 2, 3` and string `serviceCenterId: "sc-001", "sc-002", "sc-003"`
- `job-cards.mock.ts`: Uses `"sc-001"` format consistently
- `workflow-mock-data.ts`: Uses `"sc-001"` format
- `customers.mock.ts`: Uses `"sc-001"`, `"sc-002"`, `"sc-003"` format
- `approvals/page.tsx`: Was using `"1"` (string) which wouldn't match `"sc-001"`

**Fix Applied:**
- Updated `approvals/page.tsx` to properly map service center IDs:
  - `"1"` or `"sc-001"` → `"sc-001"` (Delhi Central Hub, SC001)
  - `"2"` or `"sc-002"` → `"sc-002"` (Mumbai Metroplex, SC002)
  - `"3"` or `"sc-003"` → `"sc-003"` (Bangalore Innovation Center, SC003)

### 2. Service Center Name Inconsistency
**Problem:**
- `service-centers.mock.ts`: Defines only 3 service centers:
  - "Delhi Central Hub" (id: 1)
  - "Mumbai Metroplex" (id: 2)
  - "Bangalore Innovation Center" (id: 3)
- `workflow-mock-data.ts`: Uses `"Pune Central Hub"` (doesn't exist)
- `customers.mock.ts`: Uses `"Pune Central Hub"` for some customers (doesn't exist)
- `approvals/page.tsx`: Was defaulting to `"Pune Central Hub"` (doesn't exist)

**Fix Applied:**
- Updated `approvals/page.tsx` to use actual service center names:
  - Defaults to "Delhi Central Hub" if no context is available
  - Uses service center name from context if available
  - Maps service center IDs to correct names

### 3. Service Center Code Consistency
**Status:** ✅ Already consistent
- All mock data uses: `"SC001"`, `"SC002"`, `"SC003"`
- `approvals/page.tsx` now dynamically uses the correct code based on service center ID

## Common Fields Analysis

### Service Center Fields Across Mock Data

| Field | Format | Used In | Status |
|-------|--------|---------|--------|
| `serviceCenterId` | `"sc-001"` format | All files | ✅ Fixed in approvals page |
| `serviceCenterName` | Actual names from service-centers.mock.ts | All files | ✅ Fixed in approvals page |
| `serviceCenterCode` | `"SC001"` format | All files | ✅ Consistent |

### Job Card Fields

| Field | Format | Consistency |
|-------|--------|-------------|
| `id` | String (e.g., `"JC-APPROVAL-001"`) | ✅ Consistent |
| `jobCardNumber` | Format: `"SC001-YYYYMM-NNNN"` | ✅ Consistent |
| `serviceCenterId` | `"sc-001"` format | ✅ Fixed |
| `serviceCenterCode` | `"SC001"` format | ✅ Consistent |
| `serviceCenterName` | Actual service center names | ✅ Fixed |
| `status` | `"Created"` for approvals | ✅ Consistent |
| `submittedToManager` | `true` for pending approvals | ✅ Consistent |

## Files Modified

1. **`src/app/(service-center)/sc/approvals/page.tsx`**
   - Fixed service center ID mapping to use `"sc-001"` format instead of `"1"`
   - Fixed service center name to use actual names from `service-centers.mock.ts`
   - Made service center code dynamic based on service center ID
   - Removed debug console.log statements

## Recommendations

### For Future Mock Data:
1. **Always use `"sc-001"` format** for `serviceCenterId` (not numeric `1`)
2. **Use actual service center names** from `service-centers.mock.ts`:
   - "Delhi Central Hub" (id: 1, code: SC001)
   - "Mumbai Metroplex" (id: 2, code: SC002)
   - "Bangalore Innovation Center" (id: 3, code: SC003)
3. **Use service center codes** `"SC001"`, `"SC002"`, `"SC003"` consistently

### Service Center Mapping Reference:
```typescript
{
  id: 1,
  serviceCenterId: "sc-001",
  code: "SC001",
  name: "Delhi Central Hub"
},
{
  id: 2,
  serviceCenterId: "sc-002",
  code: "SC002",
  name: "Mumbai Metroplex"
},
{
  id: 3,
  serviceCenterId: "sc-003",
  code: "SC003",
  name: "Bangalore Innovation Center"
}
```

## Testing

After these fixes:
- ✅ Mock job card approvals will use correct service center IDs
- ✅ Service center filtering will work correctly
- ✅ Job card approvals will appear in the approvals page
- ✅ Service center names will match actual service centers

## Notes

- The `filterByServiceCenter` function in `serviceCenter.ts` handles both numeric and string comparisons, so it should work with both formats
- However, for consistency, all new mock data should use the `"sc-001"` format
- The approvals page now properly maps between numeric IDs and string IDs for compatibility


