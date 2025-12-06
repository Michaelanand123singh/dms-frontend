# Job Card Process Flow - Complete Documentation

## Overview
The job card system manages the complete service workflow from customer appointment to service completion across multiple user roles. This document outlines the process flow for each panel.

---

## 🔄 Complete Job Card Lifecycle

### **Status Flow:**
```
Created → Assigned → In Progress → Parts Pending → Completed → Invoiced
```

---

## 📋 Panel-Specific Processes

### **1. CALL CENTER PANEL**

#### **Responsibilities:**
- Create customer appointments
- Assign appointments to service centers
- View appointment status

#### **Process:**
1. **Customer Creation/Selection**
   - Search or create customer in `/sc/customer-find`
   - Select or add vehicle
   - Fill customer details (name, phone, address, customer type)

2. **Appointment Scheduling**
   - Select service type
   - Choose date and time
   - Assign to service center (nearest or specific)
   - Add customer complaint/issue description
   - Set estimated cost and time
   - **Result:** Appointment created with status "Confirmed" or "Pending"

3. **Appointment Visibility**
   - Appointment appears in assigned service center's appointments page
   - Service center can see appointment with `serviceCenterId` filter

**Note:** Call Center does NOT create job cards directly. Job cards are created by Service Advisors when customers arrive.

---

### **2. SERVICE ADVISOR PANEL**

#### **Responsibilities:**
- View assigned appointments
- Mark customer arrival
- Create job cards
- Fill service intake form
- Generate check-in slips
- Convert to quotations

#### **Process Flow:**

##### **Step 1: View Appointments**
- Navigate to `/sc/appointments`
- See appointments filtered by assigned service center
- Appointments show: Customer name, vehicle, service type, date/time, status

##### **Step 2: Customer Arrival**
- Click on appointment to view details
- Click **"Customer Arrived"** button
- **System Actions:**
  - Creates temporary job card automatically
  - Updates appointment status to "In Progress"
  - Generates job card number (format: `SC001-2025-11-0001`)
  - Pre-fills PART 1 data from customer/vehicle records
  - Button disappears automatically after arrival is recorded

##### **Step 3: Arrival Mode Selection**
After customer arrival, advisor selects arrival mode:

**A. Vehicle Present:**
- Customer arrived with vehicle
- **System Actions:**
  - Generates check-in slip immediately
  - Confirms vehicle is at service center
  - Shows check-in slip modal with slip number
  - Advisor can proceed to service intake

**B. Vehicle Absent:**
- Vehicle not present (pickup/drop service)
- **Requirements:**
  - Pickup/drop address must be provided in appointment
- **System Actions:**
  - Marks vehicle as absent
  - Shows "Generate Check-in Slip (Vehicle Picked Up)" button
  - Check-in slip generated when vehicle is picked up
  - Advisor can proceed after pickup

##### **Step 4: Service Intake Form**
Service Advisor fills comprehensive service intake form:

**PART 1 Fields (Auto-populated from customer/vehicle data):**
- Full Name, Mobile Number, Customer Type
- Vehicle Brand, Model, Registration, VIN
- Variant/Battery Capacity, Warranty Status
- Customer Address
- Estimated Delivery Date

**Additional Fields:**
- Customer Feedback/Concerns (required)
- Technician Observation
- Insurance Details (Start Date, End Date, Company Name)
- Serial Numbers (Battery, MCU, VCU, Other Parts - if applicable)

**Documentation Upload:**
- Customer ID Proof
- Vehicle RC Copy
- Warranty Card/Service Book
- Photos/Videos

**Service Details:**
- Service Type (required)
- Previous Service History
- Estimated Service Time
- Estimated Cost
- Odometer Reading

**Operational Details:**
- Estimated Delivery Date
- Assigned Service Advisor
- Assigned Technician
- Pickup/Drop Required (with addresses if needed)
- Preferred Communication Mode

**Billing & Payment:**
- Payment Method
- GST Requirement
- Business Name for Invoice (if GST required)

##### **Step 5: Save Draft or Convert to Quotation**

**Option A: Save as Draft**
- Click **"Save as Draft"** button
- Job card saved with status "Created"
- Can be edited later from appointments page
- PART 1 and PART 2A data saved to job card

**Option B: Convert to Estimation/Quotation**
- Click **"Convert into Estimation/Quotation"** button
- **System Actions:**
  - Validates all required fields
  - Updates job card with PART 1 and PART 2A data
  - Navigates to `/sc/quotations` page
  - Passes job card ID, customer ID, service center ID
  - Service intake form data available for quotation creation

##### **Step 6: Job Card Created**
- Job card visible in `/sc/job-cards` page
- Status: "Created" or "In Progress"
- Contains structured data:
  - **PART 1:** Customer & Vehicle Information
  - **PART 2:** Parts & Work Items (empty initially, filled in quotation)
  - **PART 2A:** Warranty/Insurance details (if applicable)

---

### **3. SERVICE MANAGER PANEL**

#### **Responsibilities:**
- View all job cards in service center
- Assign engineers to job cards
- Approve part requests from technicians
- Create manager-driven quotations
- Update job card status

#### **Process Flow:**

##### **Step 1: View Job Cards**
- Navigate to `/sc/job-cards`
- See all job cards filtered by service center
- View in Kanban or List view
- Filter by status: All, Created, Assigned, In Progress, Completed, Drafts

##### **Step 2: Assign Engineer**
- Select job card with status "Created"
- Click **"Assign Engineer"** button
- Select engineer from available list
- **System Actions:**
  - Updates job card status to "Assigned"
  - Sets `assignedEngineer` field
  - Engineer can now see and work on job card

##### **Step 3: Part Request Approval Workflow**
When technician submits part request:

1. **Technician Submits Part Request**
   - Technician enters parts (comma-separated)
   - Clicks "Submit Part Request"
   - Status: "pending"

2. **Technician Notifies Manager**
   - Technician clicks "Notify Manager"
   - Manager sees notification

3. **Manager Approves Parts**
   - Manager clicks "Approve Parts (Manager)"
   - Status changes to "service_manager_approved"
   - Now visible to Inventory Manager

4. **Inventory Manager Approves**
   - Inventory Manager clicks "Approve Parts (Inventory)"
   - Status changes to "inventory_manager_approved"
   - Parts can be issued

##### **Step 4: Manager-Driven Quotation**
- Manager sees "Manager-Driven Quotation" panel
- Checks two boxes:
  - ✅ Technician cleared
  - ✅ Parts approved
- Clicks **"Create Manager Quote"** button
- **System Actions:**
  - Navigates to `/sc/quotations` page
  - Passes job card ID
  - Manager can create quotation directly

##### **Step 5: Update Job Card Status**
- Manager can update status through workflow:
  - Created → Assigned
  - Assigned → In Progress
  - In Progress → Parts Pending / Completed
  - Parts Pending → In Progress / Completed
  - Completed → Invoiced

---

### **4. TECHNICIAN (SERVICE ENGINEER) PANEL**

#### **Responsibilities:**
- View assigned job cards
- Submit part requests
- Notify manager about part needs
- Mark work completion

#### **Process Flow:**

##### **Step 1: View Assigned Job Cards**
- Navigate to `/sc/job-cards`
- See job cards where `assignedEngineer` matches technician name
- Filter by status to see active work

##### **Step 2: Submit Part Request**
- Select assigned job card
- See "Technician–Manager–Inventory Collaboration" panel
- Enter parts needed (comma-separated): `Brake pads, Engine oil, Filter`
- Click **"Submit Part Request"**
- **System Actions:**
  - Part request created with status "pending"
  - Parts stored in `partRequests` state
  - Request visible to manager

##### **Step 3: Notify Manager**
- After submitting part request
- Click **"Notify Manager"** button
- **System Actions:**
  - Sets `technicianNotified: true`
  - Manager sees notification
  - Manager can approve parts

##### **Step 4: Work Completion**
- After completing service work
- Click **"Notify Work Completion"** button
- **System Actions:**
  - Sets `workCompletion[jobCardId] = true`
  - Manager sees work is complete
  - Job card can be moved to "Completed" status

##### **Step 5: View Job Card Details**
- Click **"View"** button on any job card
- See complete job card layout:
  - PART 1: Customer & Vehicle Information
  - PART 2: Parts & Work Items table
  - PART 2A: Warranty details (if applicable)
  - PART 3: Part requisition details (if applicable)

---

### **5. INVENTORY MANAGER PANEL**

#### **Responsibilities:**
- View part requests
- Approve parts after service manager approval
- Issue parts for job cards

#### **Process Flow:**

##### **Step 1: View Part Requests**
- Navigate to `/sc/job-cards` (or dedicated approvals page)
- See job cards with part requests

##### **Step 2: Approve Parts**
- Find job card with status "service_manager_approved"
- Click **"Approve Parts (Inventory)"** button
- **System Actions:**
  - Status changes to "inventory_manager_approved"
  - Parts can be issued
  - Technician notified

##### **Step 3: Part Issuance**
- Parts are issued based on approved request
- PART 3 data can be populated:
  - Part Code, Part Name
  - QTY, Issue QTY, Return QTY
  - Warranty Tag Number
  - Return Part Number
  - Approval Details

---

## 🔄 Cross-Panel Workflows

### **Workflow 1: Appointment → Job Card → Quotation**

```
1. Call Center creates appointment
   ↓
2. Service Advisor marks customer arrival
   → Job Card created (status: "Created")
   ↓
3. Service Advisor fills service intake form
   → Job Card updated with PART 1 and PART 2A
   ↓
4. Service Advisor converts to quotation
   → Navigates to quotations page
   → Quotation created with job card reference
   ↓
5. Customer approves quotation
   → Job Card status: "In Progress"
   → Service work begins
```

### **Workflow 2: Part Request → Approval → Issuance**

```
1. Technician submits part request
   → Status: "pending"
   ↓
2. Technician notifies manager
   → Manager sees notification
   ↓
3. Service Manager approves
   → Status: "service_manager_approved"
   ↓
4. Inventory Manager approves
   → Status: "inventory_manager_approved"
   ↓
5. Parts issued
   → PART 3 data populated
   → Job card updated
```

### **Workflow 3: Manager-Driven Quotation**

```
1. Technician completes work
   → Clicks "Notify Work Completion"
   ↓
2. Service Manager reviews
   → Checks "Technician cleared"
   → Checks "Parts approved"
   ↓
3. Service Manager creates quote
   → Navigates to quotations page
   → Creates quotation directly
   → Bypasses advisor approval step
```

---

## 📊 Job Card Data Structure

### **PART 1: Customer & Vehicle Information**
- Customer details (name, phone, type, address)
- Vehicle details (brand, model, registration, VIN)
- Warranty and insurance information
- Serial numbers (if applicable)
- Customer feedback and technician observations

### **PART 2: Parts & Work Items List**
- Table with columns:
  - SR NO (auto-generated)
  - Part Warranty Tag
  - Part Name
  - Part Code
  - QTY
  - Amount
  - Technician
  - Labour Code
  - Type (Part/Work Item)

### **PART 2A: Warranty/Insurance Case Details**
- Evidence (Video, VIN Image, ODO Image, Damage Images)
- Issue Description
- Number of Observations
- Symptom
- Defect Part

### **PART 3: Part Requisition & Issue Details**
- Customer and vehicle information
- Job Card Number
- Part details (code, name, quantities)
- Warranty Tag Number
- Return Part Number
- Approval Details

---

## 🔑 Key Features

### **1. Automatic Job Card Creation**
- Job card created automatically when customer arrives
- Job card number auto-generated: `SC001-2025-11-0001`
- Format: `{ServiceCenterCode}-{Year}-{Month}-{Sequence}`

### **2. Structured Data Storage**
- All data stored in structured format (PART 1, PART 2, PART 2A, PART 3)
- Backward compatible with legacy fields
- JSON extraction format available

### **3. Role-Based Access**
- Each role sees relevant job cards based on:
  - Service center assignment
  - Engineer assignment
  - Status filters

### **4. Real-Time Updates**
- Storage event listeners for cross-tab updates
- Automatic data reloading
- Status synchronization

### **5. Check-in Slip Generation**
- Automatic generation based on arrival mode
- Vehicle Present: Immediate slip
- Vehicle Absent: Slip on pickup
- Slip number format: `CHK-{ServiceCenterCode}-{Date}-{Sequence}`

---

## 🎯 Status Transitions

### **Available Statuses:**
- `Created` - Job card created, awaiting assignment
- `Assigned` - Engineer assigned, work not started
- `In Progress` - Work in progress
- `Parts Pending` - Waiting for parts
- `Completed` - Work completed
- `Invoiced` - Invoice generated

### **Status Update Rules:**
- Created → Assigned (by Manager)
- Assigned → In Progress (by Manager/Technician)
- In Progress → Parts Pending (if parts needed)
- In Progress → Completed (work done)
- Parts Pending → In Progress (parts received)
- Parts Pending → Completed (work done)
- Completed → Invoiced (invoice generated)

---

## 📝 Important Notes

1. **Job Card Creation:**
   - Always created from appointments (Service Advisor)
   - Can also be created directly from job cards page (any role with access)
   - Temporary job cards created on customer arrival
   - Official job card after quotation approval

2. **Data Flow:**
   - Appointment → Job Card (PART 1, PART 2A)
   - Job Card → Quotation (adds PART 2)
   - Quotation → Job Card (updates status, adds parts)

3. **Part Requests:**
   - Stored in component state (should be moved to localStorage/backend)
   - Three-stage approval: Technician → Manager → Inventory
   - Each stage updates status

4. **Service Center Filtering:**
   - All job cards filtered by `serviceCenterId`
   - Users only see job cards for their assigned service center
   - Call center sees all appointments but not job cards

5. **Job Card Numbering:**
   - Unique per service center per month
   - Format: `SC001-2025-11-0001`
   - Auto-increments sequence number

---

## 🔍 Troubleshooting

### **Job Card Not Found:**
- Check if job card exists in localStorage
- Verify job card ID format matches
- Check service center filtering
- Ensure job card was saved after creation

### **Part Request Not Visible:**
- Check approval status chain
- Verify technician notified manager
- Check if manager approved before inventory approval

### **Status Not Updating:**
- Check if user has permission to update status
- Verify status transition is allowed
- Check localStorage is being updated

---

## 📱 Navigation Paths

- **Call Center:** `/sc/customer-find` → Create Appointment
- **Service Advisor:** `/sc/appointments` → Customer Arrival → Service Intake → Quotation
- **Service Manager:** `/sc/job-cards` → Assign Engineer → Approve Parts → Create Quote
- **Technician:** `/sc/job-cards` → View Assigned → Part Request → Work Completion
- **Inventory Manager:** `/sc/job-cards` → Approve Parts → Issue Parts

---

This document provides a complete overview of the job card process across all panels. Each role has specific responsibilities and workflows that contribute to the complete service lifecycle.

