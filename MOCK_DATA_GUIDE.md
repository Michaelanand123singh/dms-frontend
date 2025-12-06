# Dynamic Mock Data Guide

## Overview

This guide explains the dynamic mock data system that has been created to demonstrate the complete workflow from customer arrival to final delivery without manually filling forms.

## Mock Data Created

### 1. **Appointment 1: With Pickup/Drop Service**
- **Customer:** Rajesh Kumar
- **Vehicle:** Honda City (2020)
- **Status:** In Progress (Customer Arrived)
- **Pickup/Drop:** ✅ Selected
- **Pickup Address:** 123 Main St, Pune, Maharashtra 411001
- **Drop Address:** 123 Main St, Pune, Maharashtra 411001
- **Service Type:** Routine Maintenance
- **Complaint:** "Vehicle making unusual noise. Need oil change and general inspection."

**What to Test:**
- When you click "Customer Arrived" on this appointment, it will:
  1. Check for pickup/drop service (✅ found)
  2. Create pickup/drop charges (₹500)
  3. Send charges to customer via WhatsApp
  4. Show 3 action buttons: Create Quotation, Pass to Manager, Generate Check-in Slip

---

### 2. **Appointment 2: Without Pickup/Drop Service**
- **Customer:** Priya Sharma
- **Vehicle:** Maruti Swift (2019)
- **Status:** In Progress (Customer Arrived)
- **Pickup/Drop:** ❌ Not selected (Customer comes with vehicle)
- **Service Type:** AC Repair
- **Complaint:** "AC not cooling properly. Need AC gas refill and cleaning."

**What to Test:**
- When you click "Customer Arrived" on this appointment, it will:
  1. Check for pickup/drop service (❌ not found)
  2. Skip charges creation
  3. Show 3 action buttons: Create Quotation, Pass to Manager, Generate Check-in Slip

---

### 3. **Quotation 1: From Appointment 1**
- **Quotation Number:** QT-SC001-YYYYMM-1001 (dynamic)
- **Status:** sent_to_customer (awaiting approval)
- **Total Amount:** ₹4,130
- **Items:**
  - Engine Oil 5W-30 (2 units) - ₹3,000
  - Oil Filter (1 unit) - ₹500
- **Notes:** Includes pickup and drop service charges

**What to Test:**
- Navigate to Quotations page
- You'll see this quotation in "Sent to Customer" status
- You can approve it to create a job card

---

### 4. **Quotation 2: From Appointment 2 (APPROVED)**
- **Quotation Number:** QT-SC001-YYYYMM-1002 (dynamic)
- **Status:** customer_approved ✅
- **Total Amount:** ₹3,304
- **Items:**
  - AC Gas R134a (1 unit) - ₹1,800
  - AC Cleaning Service - ₹1,000
- **Approved At:** 1 hour ago (dynamic)

**What to Test:**
- Navigate to Quotations page
- You'll see this quotation in "Customer Approved" status
- A job card has already been created from this quotation
- Job card is sent to manager for technician assignment

---

### 5. **Job Card 1: From Approved Quotation 2**
- **Job Card Number:** SC001-YYYY-MM-1001 (dynamic)
- **Status:** Created
- **Customer:** Priya Sharma
- **Vehicle:** Maruti Swift
- **Service Type:** AC Repair
- **Submitted to Manager:** ✅ Yes
- **Parts:**
  - AC Gas R134a
  - AC Cleaning Service

**What to Test:**
- Navigate to Job Cards page
- You'll see this job card in "Created" status
- It shows "Submitted to Manager" flag
- Manager can assign technician and monitor parts

---

### 6. **Pickup/Drop Charges 1: For Appointment 1**
- **Charge ID:** PDC-1001
- **Amount:** ₹500
- **Status:** pending (sent to customer)
- **Appointment:** Linked to Appointment 1

**What to Test:**
- When Appointment 1 customer arrives, charges are created
- Charges are sent to customer via WhatsApp
- Charges are stored in localStorage key: `"pickupDropCharges"`

---

## How It Works

### Automatic Initialization

The mock data is automatically initialized when you first load the appointments page:

1. **First Load:** 
   - Checks if mock data has been initialized
   - If not, initializes all mock data
   - Sets flag: `workflowMockDataInitialized = true`

2. **Subsequent Loads:**
   - Skips initialization (data already exists)
   - Uses existing data from localStorage

### Data Interconnection

All mock data is interconnected:

```
Appointment 1 → Quotation 1 → (awaiting approval)
Appointment 2 → Quotation 2 → Job Card 1 (approved & created)
Appointment 1 → Pickup/Drop Charges 1
```

### Dynamic Dates

All dates are generated dynamically:
- **Today's Date:** Used for appointments and current status
- **Future Dates:** Used for delivery dates (tomorrow)
- **Past Dates:** Used for quotations created yesterday
- **Timestamps:** Used for approval times (1 hour ago, etc.)

### Dynamic IDs

All IDs are generated dynamically:
- **Job Card Numbers:** `SC001-YYYY-MM-####` format
- **Quotation Numbers:** `QT-SC001-YYYYMM-####` format
- **Sequence Numbers:** Auto-incremented based on existing data

---

## Testing the Workflow

### Scenario 1: Pickup/Drop Service Flow

1. **Go to Appointments Page**
   - Find "Rajesh Kumar" appointment (Status: In Progress)
   - Click on the appointment

2. **Customer Arrived**
   - Click "Customer Arrived" button
   - System will:
     - ✅ Detect pickup/drop service
     - ✅ Create charges (₹500)
     - ✅ Send WhatsApp message
     - Show 3 action buttons

3. **Create Quotation**
   - Click "Create Quotation/Estimation"
   - Navigate to Quotations page
   - Fill quotation form (pre-filled with appointment data)
   - Send to customer

4. **Customer Approval**
   - In Quotations page, click "Customer Approved"
   - System will:
     - ✅ Create job card
     - ✅ Send to manager
     - Show success message

### Scenario 2: Customer Comes with Vehicle Flow

1. **Go to Appointments Page**
   - Find "Priya Sharma" appointment (Status: In Progress)
   - Click on the appointment

2. **Customer Arrived**
   - Click "Customer Arrived" button
   - System will:
     - ❌ No pickup/drop service detected
     - Skip charges creation
     - Show 3 action buttons

3. **Generate Check-in Slip**
   - Click "Generate Check-in Slip"
   - Check-in slip will be generated
   - Can view/print the slip

4. **View Job Card**
   - Go to Job Cards page
   - Find job card for Priya Sharma
   - Status: Created (sent to manager)
   - Manager can assign technician

---

## Resetting Mock Data

To reset and re-initialize mock data:

1. **Clear localStorage:**
   ```javascript
   localStorage.removeItem("workflowMockDataInitialized");
   localStorage.removeItem("appointments");
   localStorage.removeItem("quotations");
   localStorage.removeItem("jobCards");
   localStorage.removeItem("pickupDropCharges");
   ```

2. **Refresh the page**
   - Mock data will be re-initialized automatically

---

## File Location

- **Mock Data File:** `src/__mocks__/data/workflow-mock-data.ts`
- **Initialization:** `src/app/(service-center)/sc/appointments/page.tsx` (line ~766)

---

## Data Structure

### Appointment Structure
```typescript
{
  id: number,
  customerName: string,
  vehicle: string,
  phone: string,
  serviceType: string,
  date: string,
  time: string,
  status: "In Progress",
  pickupDropRequired: boolean,
  pickupAddress?: string,
  dropAddress?: string,
  // ... other fields
}
```

### Quotation Structure
```typescript
{
  id: string,
  quotationNumber: string,
  status: "sent_to_customer" | "customer_approved",
  totalAmount: number,
  items: QuotationItem[],
  // ... other fields
}
```

### Job Card Structure
```typescript
{
  id: string,
  jobCardNumber: string,
  status: "Created",
  submittedToManager: true,
  quotationId: string,
  sourceAppointmentId: number,
  part1: JobCardPart1,
  part2: JobCardPart2Item[],
  // ... other fields
}
```

---

## Notes

- All mock data uses **real customer data** from `customers.mock.ts`
- All dates are **dynamic** (based on current date)
- All IDs are **unique** and **sequential**
- Data is **interconnected** (appointments → quotations → job cards)
- Mock data is **non-destructive** (only adds if doesn't exist)

---

## Troubleshooting

### Mock data not appearing?
1. Clear localStorage and refresh
2. Check browser console for initialization messages
3. Verify `workflowMockDataInitialized` flag in localStorage

### Dates showing incorrectly?
- Dates are generated dynamically based on current date
- If you need specific dates, modify `getDate()` function in mock data file

### IDs conflicting?
- IDs are checked before insertion
- Existing data won't be overwritten
- New data will be added with unique IDs

---

**Last Updated:** 2025-01-XX
**Version:** 1.0

