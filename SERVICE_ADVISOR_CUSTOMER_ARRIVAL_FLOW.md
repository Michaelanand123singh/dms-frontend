# Service Advisor - Customer Arrival Flow

## Overview
This document outlines the complete workflow for Service Advisors when a customer arrives at the service center.

---

## Flow Diagram

```
Customer Arrives
    ↓
Service Advisor Views Appointment
    ↓
Click "Customer Arrived" Button
    ↓
System Actions:
  • Updates Appointment Status → "In Progress"
  • Auto-creates Temporary Job Card
  • Generates Job Card Number (SC001-YYYY-MM-####)
  • Pre-fills PART 1 data from customer/vehicle records
    ↓
Arrival Mode Selection:
  • Vehicle Present → Check-in slip generated immediately
  • Vehicle Absent → Check-in slip generated when vehicle picked up
    ↓
Service Intake Form (PART 1) - Auto-populated + Manual Entry
    ↓
Next Steps:
  • Create Quotation
  • Generate Check-in Slip
  • Save as Draft (optional)
```

---

## Detailed Step-by-Step Flow

### **STEP 1: View Appointments**
**Location:** `/sc/appointments`

- Service Advisor logs in and navigates to Appointments page
- Appointments are filtered by assigned service center
- Each appointment shows:
  - Customer name and phone
  - Vehicle details
  - Service type
  - Date and time
  - Status (Pending, Confirmed, In Progress, etc.)

---

### **STEP 2: Customer Arrival - Initial Action**

**When customer arrives:**

1. **Service Advisor clicks on the appointment** to view details
2. **In the Appointment Detail Modal**, Service Advisor sees:
   - Customer information (name, phone, address)
   - Vehicle details (make, model, registration)
   - Service details (type, complaint, estimated cost/time)
   - Appointment status

3. **Service Advisor clicks "Customer Arrived" button**
   - Button appears only when:
     - User role is `service_advisor`
     - Appointment status is NOT "In Progress" or "Sent to Manager"
     - Customer arrival status is not already "arrived"

---

### **STEP 3: System Automatic Actions**

When "Customer Arrived" is clicked, the system automatically:

#### **3.1 Update Appointment Status**
- Changes appointment status from `"Confirmed"` or `"Pending"` → `"In Progress"`
- Stores updated appointment in `localStorage` key: `"appointments"`
- Sets customer arrival timestamp

#### **3.2 Create Temporary Job Card**
- **Auto-creates a temporary job card** with:
  - **Job Card Number:** Format `SC001-YYYY-MM-####` (e.g., `SC001-2024-01-0001`)
  - **Status:** `"Created"`
  - **Is Temporary:** `true` flag
  - **Source Appointment ID:** Links back to original appointment
  - **Customer Arrival Timestamp:** Records exact arrival time

#### **3.3 Pre-fill PART 1 Data**
The job card's PART 1 section is automatically populated from:
- **Customer Data:**
  - Full Name
  - Mobile Number (Primary)
  - Customer Type
  - Customer Address
  
- **Vehicle Data:**
  - Vehicle Brand
  - Vehicle Model
  - Registration Number
  - VIN/Chassis Number
  - Variant/Battery Capacity
  - Warranty Status

- **Appointment Data:**
  - Customer Feedback/Concerns
  - Estimated Delivery Date
  - Service Type

#### **3.4 Handle Pickup/Drop Service** (if applicable)
If appointment has pickup/drop service:
- Creates pickup/drop charges (default ₹500)
- Sends charges to customer via WhatsApp
- Stores charges in `localStorage` key: `"pickupDropCharges"`

---

### **STEP 4: Service Intake Form (PART 1)**

After customer arrival, Service Advisor can fill the **Service Intake Form**:

#### **Auto-populated Fields:**
- Full Name
- Mobile Number (Primary)
- Customer Type
- Vehicle Brand
- Vehicle Model
- Registration Number
- VIN/Chassis Number
- Variant/Battery Capacity
- Warranty Status
- Customer Address

#### **Manual Input Fields (Required):**
- **Customer Feedback/Concerns** ⚠️ (Required)
- Estimated Delivery Date

#### **Manual Input Fields (Optional):**
- Technician Observation
- Insurance Start Date
- Insurance End Date
- Insurance Company Name
- Serial Numbers (if applicable):
  - Battery Serial Number
  - MCU Serial Number
  - VCU Serial Number
  - Other Part Serial Number

#### **Documentation Upload (Optional):**
- Customer ID Proof
- Vehicle RC Copy
- Warranty Card/Service Book
- Photos/Videos

#### **Draft Saving:**
- Service intake can be saved as draft
- Stored in job card with `draftIntake: true` property
- Status remains "Created"
- Can be resumed later

---

### **STEP 5: Arrival Mode Selection**

Service Advisor selects arrival mode:

#### **Option A: Vehicle Present**
- Vehicle is physically at the service center
- **Check-in slip can be generated immediately**
- Check-in slip includes:
  - Slip number (auto-generated)
  - Customer details
  - Vehicle details
  - Check-in date and time
  - Service center information
  - Expected service date

#### **Option B: Vehicle Absent**
- Vehicle will be picked up later
- Check-in slip generated when vehicle is picked up
- Pickup/drop charges apply (if applicable)

---

### **STEP 6: Next Actions Available**

After customer arrival and service intake, Service Advisor can:

#### **6.1 Create Quotation**
- Click "Create Quotation" button
- System navigates to `/sc/quotations?fromAppointment=true`
- Appointment data is passed via `localStorage` key: `"pendingQuotationFromAppointment"`
- Quotation page pre-fills with:
  - Customer information
  - Vehicle information
  - Job card reference
  - Service details

#### **6.2 Generate Check-in Slip**
- Click "Generate Check-in Slip" button
- Requires job card to exist (`currentJobCardId` must be set)
- Generates check-in slip with:
  - Slip number (format: `CIS-{serviceCenterCode}-{YYYYMMDD}-{####}`)
  - Customer name, phone, email
  - Vehicle make, model, registration, VIN
  - Check-in date and time
  - Service center details
  - Expected service date
  - Service type
  - Notes/observations

#### **6.3 Save as Draft**
- Service intake form can be saved as draft
- Allows Service Advisor to complete later
- Job card status remains "Created"
- Can be resumed from appointments page

---

## Data Storage

### **localStorage Keys Used:**

1. **`"appointments"`**
   - Stores appointment records
   - Updated when customer arrives (status → "In Progress")

2. **`"jobCards"`**
   - Stores job card records
   - Temporary job card created on customer arrival
   - Structure includes:
     - `part1`: Service intake data
     - `part2`: Parts/work items (empty initially)
     - `part2A`: Documentation evidence (optional)
     - `part3`: Final inspection (empty initially)

3. **`"pickupDropCharges"`** (if applicable)
   - Stores pickup/drop service charges

4. **`"pendingQuotationFromAppointment"`**
   - Temporary storage for quotation creation
   - Contains appointment data, customer ID, job card ID

---

## Status Flow

```
Appointment Status Flow:
  "Pending" / "Confirmed"
    ↓ (Customer Arrived)
  "In Progress"
    ↓ (Quotation Created)
  "Quotation Created"
    ↓ (Sent to Manager)
  "Sent to Manager"
```

```
Job Card Status Flow:
  Created (Temporary)
    ↓ (Service Intake Complete)
  Created (Permanent)
    ↓ (Quotation Approved)
  Assigned
    ↓ (Manager Approval)
  In Progress
    ↓ (Work Complete)
  Completed
    ↓ (Invoice Generated)
  Invoiced
```

---

## Key Code Locations

### **Main Files:**

1. **`src/app/(service-center)/sc/appointments/page.tsx`**
   - Main appointments page component
   - Handles customer arrival logic
   - `handleCustomerArrived()` function
   - `convertAppointmentToJobCard()` function

2. **`src/app/(service-center)/sc/components/appointments/AppointmentDetailModal.tsx`**
   - Appointment detail modal component
   - "Customer Arrived" button UI
   - Customer arrival confirmation display

3. **`src/app/(service-center)/sc/components/appointment/AppointmentForm.tsx`**
   - Service intake form component
   - PART 1 data collection
   - Draft saving functionality

4. **`src/app/(service-center)/sc/components/check-in-slip/CheckInSlip.tsx`**
   - Check-in slip generation component
   - Slip number generation logic

---

## Important Notes

1. **Job Card Auto-Creation:**
   - Job card is automatically created when customer arrives
   - It's marked as temporary (`isTemporary: true`) until quotation is created
   - Job card number follows format: `{ServiceCenterCode}-{YYYY}-{MM}-{####}`

2. **Service Intake Form:**
   - PART 1 is mandatory before creating quotation
   - Customer Feedback/Concerns is required field
   - Can be saved as draft and completed later

3. **Check-in Slip:**
   - Can only be generated after job card exists
   - Requires `currentJobCardId` to be set
   - Includes all customer and vehicle details

4. **Quotation Creation:**
   - Can be created directly from appointment after customer arrival
   - Navigates to quotations page with pre-filled data
   - Links to job card via `jobCardId`

5. **Pickup/Drop Service:**
   - If appointment has pickup/drop service, charges are created automatically
   - Charges sent to customer via WhatsApp
   - Default charge: ₹500 (configurable)

---

## User Interface Flow

### **Before Customer Arrival:**
```
Appointment Card
  └─ Status: "Confirmed"
  └─ Click to view details
      └─ Appointment Detail Modal
          └─ "Customer Arrived" button (visible)
          └─ "Customer Not Arrived" button (visible)
```

### **After Customer Arrival:**
```
Appointment Card
  └─ Status: "In Progress"
  └─ Click to view details
      └─ Appointment Detail Modal
          └─ ✅ "Customer Arrived" confirmation (green banner)
          └─ Job Card Number displayed
          └─ Action Buttons:
              ├─ "Create Quotation" button
              └─ "Generate Check-in Slip" button
```

---

## Error Handling

1. **If job card creation fails:**
   - Error toast displayed
   - Appointment status still updated to "In Progress"
   - Service Advisor can retry job card creation

2. **If check-in slip generation fails:**
   - Error toast: "Please wait for job card to be created first"
   - Requires job card to exist before generating slip

3. **If quotation creation fails:**
   - Error toast displayed
   - Service Advisor can retry from appointments page

---

## Summary

**When a customer arrives:**

1. ✅ Service Advisor clicks "Customer Arrived"
2. ✅ System updates appointment status to "In Progress"
3. ✅ System auto-creates temporary job card with PART 1 pre-filled
4. ✅ Service Advisor completes Service Intake Form (PART 1)
5. ✅ Service Advisor can:
   - Generate Check-in Slip
   - Create Quotation
   - Save as Draft (to complete later)

**The flow ensures:**
- No data loss (auto-save on customer arrival)
- Seamless transition from appointment to job card
- Pre-filled data reduces manual entry
- Clear next steps for Service Advisor



