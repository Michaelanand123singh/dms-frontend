# Data Flow Common Issues - Quick Reference

## 🔴 Critical Issues (Must Fix)

### 1. Invalid ID Generation
**Pattern Found:** `customer-${appointment.id}` or `customer-${Date.now()}`
**Locations:**
- `appointments/page.tsx:1263`
- `JobCardFormModal.tsx:886`
**Impact:** Creates records with invalid foreign keys
**Fix:** Require valid IDs, throw error if missing

---

### 2. ID Type Inconsistencies
**Pattern Found:** Mixed `string | number` for IDs
**Locations:** All entity types
**Examples:**
- `appointment.id: number | string`
- `appointment.serviceCenterId?: number | string`
- `jobCard.sourceAppointmentId?: number` (should be string)
**Impact:** Type coercion errors, data loss
**Fix:** Standardize all IDs to `string`

---

### 3. Missing Foreign Key Validation
**Pattern Found:** Direct ID assignment without validation
**Locations:**
- Quotation creation
- Job card creation
- Invoice creation
**Impact:** Orphaned records, broken relationships
**Fix:** Validate all foreign keys before creating records

---

## 🟡 Medium Priority Issues

### 4. Customer Name Construction
**Pattern Found:** `firstName + " " + (lastName || "")`
**Location:** `quotations/page.tsx:775`
**Issue:** Adds extra space if lastName is empty: "John "
**Fix:** `[firstName, lastName].filter(Boolean).join(" ")`

---

### 5. Vehicle Data String Parsing
**Pattern Found:** Regex parsing of vehicle string
**Location:** `appointments/page.tsx:1203`
**Issue:** Fragile, breaks if format differs
**Fix:** Use `vehicleId` to fetch actual vehicle data

---

### 6. Service Center ID Hardcoded Fallback
**Pattern Found:** `|| "sc-001"`
**Locations:** Multiple files
**Issue:** Hardcoded fallback may not exist
**Fix:** Validate service center exists, throw error if missing

---

## 🟢 Low Priority Issues

### 7. Optional Chaining with `||` Instead of `??`
**Pattern Found:** `data?.field || defaultValue`
**Issue:** Incorrect fallback for falsy values (0, false, "")
**Fix:** Use `data?.field ?? defaultValue`

---

### 8. Array Mapping Without Validation
**Pattern Found:** `items?.map(...) || []`
**Issue:** Hides errors, fails silently
**Fix:** Validate array first, handle errors per item

---

## 📊 Data Flow Issues by Entity

### Appointment → Job Card
- ❌ ID type mismatch (number → string)
- ❌ Invalid fallback IDs
- ❌ Missing vehicle validation
- ⚠️ Vehicle string parsing

### Appointment → Quotation
- ❌ No ID validation
- ❌ Type mismatch

### Quotation → Job Card
- ❌ Customer name construction
- ❌ Vehicle fallback to "Unknown"
- ⚠️ Missing field transfers

### Job Card → Invoice
- ⚠️ Missing customer/vehicle details from part1

---

## 🔄 Common Patterns Across All Flows

### Pattern 1: ID Type Conversion
```typescript
// Found in 15+ locations
someId?.toString() || fallbackId
```
**Issue:** May convert `null` to `"null"` string
**Fix:** `String(someId ?? fallbackId)`

### Pattern 2: Optional Chaining with Fallback
```typescript
// Found in 20+ locations
data?.field || defaultValue
```
**Issue:** Incorrect fallback for falsy values
**Fix:** `data?.field ?? defaultValue`

### Pattern 3: Array Mapping
```typescript
// Found in 10+ locations
items?.map(item => transform(item)) || []
```
**Issue:** Hides errors
**Fix:** `(items || []).map(...).filter(Boolean)`

---

## 📋 Quick Fix Checklist

- [ ] Replace all `number | string` ID types with `string`
- [ ] Remove all invalid ID fallbacks (`customer-${id}`, etc.)
- [ ] Add foreign key validation before creating records
- [ ] Fix customer name construction (use array join)
- [ ] Replace vehicle string parsing with ID-based lookup
- [ ] Remove hardcoded service center fallbacks
- [ ] Replace `||` with `??` for optional chaining
- [ ] Add array validation before mapping

---

## 🎯 Priority Fix Order

1. **Week 1:** Fix ID type inconsistencies and invalid fallbacks
2. **Week 2:** Add foreign key validation
3. **Week 3:** Fix customer name and vehicle data issues
4. **Week 4:** Replace `||` with `??` and improve error handling


