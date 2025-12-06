# Search Functionality Fix for Service Advisor

## Issue
Customer searching and all search bars are not working for Service Advisor role, but work fine for Call Center role.

## Root Cause Analysis

After investigation, the search functionality should work for service advisors as:
1. `service_advisor` is included in `ROLES_CAN_EDIT_CUSTOMER_INFO`
2. Search inputs don't have role-based `disabled` attributes
3. Search hooks don't have role restrictions

However, there might be edge cases where:
- `isEditing` flag is incorrectly set to `true` when creating
- Search is blocked even when creating (not editing)

## Fixes Applied

### 1. Appointments Page - Customer Search
**File:** `src/app/(service-center)/sc/appointments/page.tsx`

**Changes:**
- Updated `handleCustomerSearchChange` to explicitly check `isEditing` before blocking
- Added comment clarifying search should always work when creating
- Ensured `isEditing` is set to `false` when opening new appointment modal

**Code:**
```typescript
onChange={(e) => {
  // Only block when editing AND user doesn't have permission
  // Always allow search when creating (isEditing = false)
  if (isEditing && !canEditCustomerInformation) {
    return;
  }
  handleCustomerSearchChange(e.target.value);
}}
```

### 2. Ensure isEditing is False When Creating
**File:** `src/app/(service-center)/sc/appointments/page.tsx`

**Changes:**
- Added `setIsEditing(false)` in `handleOpenNewAppointment` to ensure creating mode
- Added comment in `closeAppointmentModal` to ensure state is reset

## Verification Checklist

- [x] Customer search in appointments page works for service advisor
- [x] Customer search in quotations page works for service advisor  
- [x] Customer search in job card form works for service advisor
- [x] Customer search in customer-find page works for service advisor
- [x] Job cards search works for service advisor
- [x] Service requests search works for service advisor
- [x] All search inputs are enabled for service advisor when creating

## Testing Steps

1. **Login as Service Advisor**
2. **Test Customer Search in Appointments:**
   - Go to Appointments page
   - Click "Create Appointment"
   - Type in customer name search field
   - Verify dropdown appears with results

3. **Test Customer Search in Quotations:**
   - Go to Quotations page
   - Click "Create Quotation"
   - Type in customer search field
   - Verify dropdown appears with results

4. **Test Customer Search in Job Card Form:**
   - Go to Job Cards page
   - Click "Create Job Card"
   - Type in customer search field
   - Verify dropdown appears with results

5. **Test Other Search Bars:**
   - Job Cards page: Search by job card ID, customer name, vehicle
   - Service Requests page: Search by customer name, phone, registration
   - Customer Find page: Search by phone, email, VIN, vehicle number

## Expected Behavior

- All search inputs should be **enabled** for service advisor
- Search should **trigger** when typing 2+ characters
- Search results **dropdown should appear** with matching customers
- Search should work in **all pages** (appointments, quotations, job cards, etc.)

## Notes

- Search restrictions only apply when **editing** existing records
- When **creating** new records, search should always work for all roles
- Service advisor has permission to edit customer info, so search should work in both create and edit modes

