# Schema Relationships & Parameter Passing Analysis

## Overview
This document provides a comprehensive analysis of how database schemas are linked together and what parameters are passed during various business processes in the DMS system.

---

## 1. Core Entity Relationships

### 1.1 Service Centers → Users (One-to-Many)
**Relationship:**
- `users.service_center_id` → `service_centers.id`
- One service center can have multiple users
- Users belong to one service center (nullable for admin users)

**Parameters Passed:**
- When creating a user: `serviceCenterId` (VARCHAR(255))
- When querying users: Filter by `serviceCenterId`

---

### 1.2 Customers → Vehicles (One-to-Many)
**Relationship:**
- `vehicles.customer_id` → `customers.id` (ON DELETE CASCADE)
- One customer can have multiple vehicles
- Vehicle must belong to exactly one customer

**Parameters Passed:**
- When creating a vehicle: `customerId` (VARCHAR(255)) - **REQUIRED**
- When querying vehicles: Filter by `customerId`
- **Important:** Customer details (name, email, phone, address) are NOT stored in vehicles table - retrieved via JOIN

**Data Flow:**
```
Frontend sends: {
  customerId: "cust-001",
  registrationNumber: "MH-12-AB-1234",
  vin: "TATA1234567890123",
  vehicleMake: "Tata",
  vehicleModel: "Nexon EV Max",
  ...
}
↓
Backend validates customerId exists
↓
Backend creates vehicle record with customer_id reference
↓
When retrieving vehicle: JOIN with customers table to get customer details
```

---

### 1.3 Customers → Appointments (One-to-Many)
**Relationship:**
- `appointments.customer_id` → `customers.id`
- One customer can have multiple appointments

**Parameters Passed:**
- When creating appointment: `customerId` (VARCHAR(255)) - **REQUIRED**
- Optional: `vehicleId` (VARCHAR(255)) - links to vehicles table

**Request Example:**
```json
{
  "customerId": "cust-001",
  "vehicleId": "veh-001",  // Optional
  "serviceCenterId": "sc-001",
  "appointmentDate": "2025-01-20",
  "appointmentTime": "10:00:00",
  "serviceType": "Routine Maintenance",
  "location": "Station"
}
```

---

### 1.4 Appointments → Service Intake Requests (One-to-One)
**Relationship:**
- `service_intake_requests.appointment_id` → `appointments.id`
- One appointment can have one service intake request

**Parameters Passed:**
- When creating service intake request: `appointmentId` (INT) - **REQUIRED**
- `serviceCenterId` (VARCHAR(255)) - **REQUIRED**
- `submittedBy` (VARCHAR(255)) - User ID who submitted

**Request Example:**
```json
{
  "appointmentId": 1001,
  "serviceCenterId": "sc-001",
  "serviceIntakeForm": {
    "vehicleBrand": "Tata",
    "vehicleModel": "Nexon EV Max",
    "registrationNumber": "MH-12-AB-1234",
    "vinChassisNumber": "TATA1234567890123",
    "serviceType": "Routine Maintenance",
    "customerComplaintIssue": "Vehicle making unusual noise",
    "estimatedCost": "₹3,500",
    "estimatedServiceTime": "2 hours",
    "arrivalMode": "vehicle_present",
    "checkInNotes": "Vehicle checked in"
  },
  "documentation": {
    "customerIdProof": { "urls": ["https://..."] },
    "vehicleRCCopy": { "urls": ["https://..."] },
    "warrantyCardServiceBook": { "urls": ["https://..."] },
    "photosVideos": { "urls": ["https://..."] }
  }
}
```

---

### 1.5 Service Intake Requests → Service Intake Forms (One-to-One)
**Relationship:**
- `service_intake_forms.service_intake_request_id` → `service_intake_requests.id` (ON DELETE CASCADE)
- One service intake request has one form

**Parameters Passed:**
- All form fields are stored in `service_intake_forms` table
- Optional: `jobCardId` (VARCHAR(255)) - Links to job card if created

---

### 1.6 Service Intake Forms → Service Intake Documentation (One-to-Many)
**Relationship:**
- `service_intake_documentation.service_intake_form_id` → `service_intake_forms.id` (ON DELETE CASCADE)
- One form can have multiple documentation files

**Parameters Passed:**
- `serviceIntakeFormId` (VARCHAR(255)) - **REQUIRED**
- `documentType` (ENUM): 'customer_id_proof', 'vehicle_rc_copy', 'warranty_card_service_book', 'photos_videos'
- `fileName` (VARCHAR(255))
- `fileUrl` (TEXT) - **REQUIRED**
- `fileSize` (BIGINT)
- `mimeType` (VARCHAR(100))

---

## 2. Quotation Workflow Relationships

### 2.1 Customers → Quotations (One-to-Many)
**Relationship:**
- `quotations.customer_id` → `customers.id`
- One customer can have multiple quotations

**Parameters Passed:**
- `customerId` (VARCHAR(255)) - **REQUIRED**
- `vehicleId` (VARCHAR(255)) - Optional, links to vehicles table
- `serviceCenterId` (VARCHAR(255)) - **REQUIRED**
- `serviceAdvisorId` (VARCHAR(255)) - Optional, links to users table

**Request Example:**
```json
{
  "customerId": "cust-001",
  "vehicleId": "veh-001",
  "serviceCenterId": "sc-001",
  "serviceAdvisorId": "user-001",
  "documentType": "Quotation",
  "quotationDate": "2025-01-15",
  "validUntilDays": 30,
  "hasInsurance": false,
  "items": [
    {
      "serialNumber": 1,
      "partName": "Engine Oil",
      "partNumber": "EO-001",
      "hsnSacCode": "2710",
      "quantity": 2,
      "rate": 1500,
      "gstPercent": 18,
      "amount": 3000
    }
  ],
  "discount": 0,
  "notes": "Complete service",
  "vehicleLocation": "with_customer"
}
```

---

### 2.2 Quotations → Quotation Items (One-to-Many)
**Relationship:**
- `quotation_items.quotation_id` → `quotations.id` (ON DELETE CASCADE)
- One quotation can have multiple items

**Parameters Passed:**
- `quotationId` (VARCHAR(255)) - **REQUIRED**
- `serialNumber` (INT) - **REQUIRED**
- `partName` (VARCHAR(255)) - **REQUIRED**
- `partNumber` (VARCHAR(100))
- `hsnSacCode` (VARCHAR(50))
- `quantity` (INT) - Default: 1
- `rate` (DECIMAL(10, 2)) - **REQUIRED**
- `gstPercent` (DECIMAL(5, 2)) - Default: 0
- `amount` (DECIMAL(10, 2)) - **REQUIRED**

---

### 2.3 Quotations → Insurers (Many-to-One)
**Relationship:**
- `quotations.insurer_id` → `insurers.id`
- Multiple quotations can reference one insurer
- Optional relationship (only if `hasInsurance = TRUE`)

**Parameters Passed:**
- `insurerId` (VARCHAR(255)) - Only if `hasInsurance = TRUE`

---

### 2.4 Quotations → Job Cards (One-to-One)
**Relationship:**
- `job_cards.quotation_id` → `quotations.id`
- One quotation can create one job card
- Job card creation is triggered when quotation status = `customer_approved`

**Parameters Passed When Creating Job Card from Quotation:**
```json
{
  "quotationId": "qtn-001",  // Links to quotations table
  "engineerId": "user-003"    // Optional, assigned engineer
}
```

**Data Flow:**
```
1. Quotation created with status = 'draft'
2. Quotation sent to customer (status = 'sent_to_customer')
3. Customer approves (status = 'customer_approved')
4. Service advisor creates job card from approved quotation
5. Job card created with quotation_id reference
6. Job card inherits:
   - customerId from quotation
   - vehicleId from quotation
   - serviceCenterId from quotation
   - items from quotation_items (converted to job_card_part2)
   - totalAmount as estimatedCost
```

**Frontend Implementation:**
```typescript
// From JobCardFormModal.tsx
const newJobCard: JobCard = {
  customerId: selectedQuotation.customerId,
  vehicleId: selectedQuotation.vehicleId,
  serviceCenterId: selectedQuotation.serviceCenterId,
  quotationId: selectedQuotation.id,  // Link to quotation
  serviceType: selectedQuotation.items?.[0]?.partName || "General Service",
  description: selectedQuotation.notes || selectedQuotation.customNotes,
  estimatedCost: `₹${selectedQuotation.totalAmount.toLocaleString("en-IN")}`,
  part2: selectedQuotation.items?.map(item => ({
    srNo: item.serialNumber,
    partName: item.partName,
    partCode: item.partNumber,
    qty: item.quantity,
    amount: item.amount,
    itemType: "part"
  })) || [],
  // ... other fields
};
```

---

## 3. Job Card Relationships

### 3.1 Job Cards → Customers (Many-to-One)
**Relationship:**
- `job_cards.customer_id` → `customers.id`
- Multiple job cards can belong to one customer

**Parameters Passed:**
- `customerId` (VARCHAR(255)) - **REQUIRED**
- `customerName` (VARCHAR(255)) - Denormalized for quick access

---

### 3.2 Job Cards → Vehicles (Many-to-One)
**Relationship:**
- `job_cards.vehicle_id` → `vehicles.id`
- Multiple job cards can belong to one vehicle
- Optional (can be null for check-in only cases)

**Parameters Passed:**
- `vehicleId` (VARCHAR(255)) - Optional
- Denormalized fields: `vehicle`, `registration`, `vehicleMake`, `vehicleModel`

---

### 3.3 Job Cards → Service Centers (Many-to-One)
**Relationship:**
- `job_cards.service_center_id` → `service_centers(id)`
- Multiple job cards belong to one service center

**Parameters Passed:**
- `serviceCenterId` (VARCHAR(255)) - **REQUIRED**
- Denormalized: `serviceCenterCode`, `serviceCenterName`

---

### 3.4 Job Cards → Appointments (Many-to-One)
**Relationship:**
- `job_cards.source_appointment_id` → `appointments.id`
- Optional relationship (only if job card created from appointment)

**Parameters Passed:**
- `sourceAppointmentId` (INT) - Optional

---

### 3.5 Job Cards → Users (Assigned Engineer) (Many-to-One)
**Relationship:**
- `job_cards.assigned_engineer` → `users.id`
- Multiple job cards can be assigned to one engineer

**Parameters Passed:**
```json
{
  "jobCardId": "jc-001",
  "engineerId": "user-003",
  "engineerName": "Technician Name"
}
```

---

### 3.6 Job Cards → Job Card Part 1 (One-to-One)
**Relationship:**
- `job_card_part1.job_card_id` → `job_cards.id` (ON DELETE CASCADE)
- UNIQUE constraint ensures one-to-one relationship

**Parameters Passed:**
```json
{
  "jobCardId": "jc-001",
  "fullName": "Rajesh Kumar",
  "mobilePrimary": "9876543210",
  "customerType": "B2C",
  "customerAddress": "123 Main Street",
  "vehicleBrand": "Tata",
  "vehicleModel": "Nexon EV Max",
  "registrationNumber": "MH-12-AB-1234",
  "vinChassisNumber": "TATA1234567890123",
  "variantBatteryCapacity": "40.5 kWh",
  "warrantyStatus": "Active",
  "customerFeedback": "Vehicle making unusual noise",
  "technicianObservation": "",
  "insuranceStartDate": "2023-06-15",
  "insuranceEndDate": "2024-06-14",
  "insuranceCompanyName": "HDFC Ergo",
  "batterySerialNumber": "BAT123456",
  "mcuSerialNumber": "MCU123456",
  "vcuSerialNumber": "VCU123456"
}
```

---

### 3.7 Job Cards → Job Card Part 2 (One-to-Many)
**Relationship:**
- `job_card_part2.job_card_id` → `job_cards.id` (ON DELETE CASCADE)
- One job card can have multiple part 2 items (parts/work items)

**Parameters Passed:**
```json
{
  "jobCardId": "jc-001",
  "part2": [
    {
      "srNo": 1,
      "partWarrantyTag": "",
      "partName": "Engine Oil",
      "partCode": "EO-001",
      "qty": 2,
      "amount": 3000,
      "technician": "user-003",
      "labourCode": "LAB-001",
      "itemType": "part"
    },
    {
      "srNo": 2,
      "partName": "Oil Filter Replacement",
      "partCode": "",
      "qty": 1,
      "amount": 500,
      "technician": "user-003",
      "labourCode": "LAB-002",
      "itemType": "work_item"
    }
  ]
}
```

**Data Source:**
- When created from quotation: Items come from `quotation_items` table
- When created manually: Items entered by service advisor

---

### 3.8 Job Cards → Job Card Part 2A (One-to-One)
**Relationship:**
- `job_card_part2a.job_card_id` → `job_cards.id` (ON DELETE CASCADE)
- UNIQUE constraint ensures one-to-one relationship

**Parameters Passed:**
```json
{
  "jobCardId": "jc-001",
  "videoEvidence": "Yes",  // ENUM: 'Yes', 'No', ''
  "vinImage": "Yes",
  "odoImage": "Yes",
  "damageImages": "Yes",
  "issueDescription": "Vehicle making unusual noise from engine",
  "numberOfObservations": "3",
  "symptom": "Loud knocking sound when accelerating",
  "defectPart": "Engine mount"
}
```

**Note:** File URLs are stored separately in file storage system, not in database. Only indicators (Yes/No) are stored.

---

### 3.9 Job Cards → Job Card Part 3 (One-to-Many)
**Relationship:**
- `job_card_part3.job_card_id` → `job_cards.id` (ON DELETE CASCADE)
- One job card can have multiple part 3 entries (parts with warranty/return details)

**Parameters Passed:**
```json
{
  "jobCardId": "jc-001",
  "part3": [
    {
      "customerType": "B2C",
      "vehicleBrand": "Tata",
      "vehicleModel": "Nexon EV Max",
      "registrationNumber": "MH-12-AB-1234",
      "vinChassisNumber": "TATA1234567890123",
      "partCode": "EO-001",
      "partName": "Engine Oil",
      "qty": 2,
      "issueQty": 0,
      "returnQty": 0,
      "warrantyTagNumber": "WT-123456",
      "returnPartNumber": "",
      "approvalDetails": "Approved by service manager"
    }
  ]
}
```

---

## 4. Parts & Inventory Relationships

### 4.1 Parts Master → Inventory Items (One-to-Many)
**Relationship:**
- `inventory_items.part_id` → `parts_master.id`
- One part master can have inventory in multiple service centers

**Parameters Passed:**
- `partId` (VARCHAR(255)) - **REQUIRED**
- `serviceCenterId` (VARCHAR(255)) - **REQUIRED**
- UNIQUE constraint on `(part_id, service_center_id)`

---

### 4.2 Job Cards → Parts Issues (One-to-Many)
**Relationship:**
- `parts_issues.job_card_id` → `job_cards.id`
- One job card can request multiple parts

**Parameters Passed:**
```json
{
  "jobCardId": "jc-001",
  "parts": [
    {
      "partId": "part-001",
      "partName": "Engine Oil",
      "partNumber": "EO-001",
      "quantity": 2
    }
  ]
}
```

**Workflow:**
1. Service advisor/engineer requests parts from job card
2. Parts request created with status = 'pending'
3. Service manager approves (status = 'service_manager_approved')
4. Inventory manager approves and issues (status = 'issued')
5. Parts issued to job card

---

### 4.3 Parts Master → Parts Orders (One-to-Many)
**Relationship:**
- `parts_orders.part_id` → `parts_master.id`
- One part can have multiple orders

**Parameters Passed:**
```json
{
  "serviceCenterId": "sc-001",
  "partId": "part-001",
  "requiredQty": 10,
  "urgency": "high",
  "notes": "Urgent requirement"
}
```

---

## 5. Invoice Relationships

### 5.1 Job Cards → Invoices (One-to-One)
**Relationship:**
- `invoices.job_card_id` → `job_cards.id`
- One job card can have one invoice

**Parameters Passed:**
```json
{
  "jobCardId": "jc-001",
  "serviceCenterId": "sc-001",
  "customerId": "cust-001",
  "vehicleId": "veh-001",
  "invoiceDate": "2025-01-20",
  "dueDate": "2025-01-27",
  "items": [
    {
      "itemName": "Engine Oil",
      "quantity": 2,
      "unitPrice": 1500,
      "totalPrice": 3000
    }
  ],
  "subtotal": 3000,
  "discount": 0,
  "cgstAmount": 270,
  "sgstAmount": 270,
  "totalAmount": 3540
}
```

**Data Flow:**
```
Job Card (status = 'Completed')
↓
Invoice created from job card
↓
Invoice items populated from job_card_part2 items
↓
Invoice sent to customer
↓
Payment received
↓
Job Card status updated to 'Invoiced'
```

---

### 5.2 Invoices → Invoice Items (One-to-Many)
**Relationship:**
- `invoice_items.invoice_id` → `invoices.id` (ON DELETE CASCADE)
- One invoice can have multiple items

**Parameters Passed:**
- `invoiceId` (VARCHAR(255)) - **REQUIRED**
- `itemName` (VARCHAR(255)) - **REQUIRED**
- `quantity` (INT) - Default: 1
- `unitPrice` (DECIMAL(10, 2)) - **REQUIRED**
- `totalPrice` (DECIMAL(10, 2)) - **REQUIRED**

---

## 6. Complete Workflow: Quotation → Job Card → Invoice

### 6.1 Quotation Creation Flow
```
1. Customer/Vehicle selected
   ↓ Parameters: customerId, vehicleId, serviceCenterId
   
2. Quotation created
   ↓ Parameters: quotation data + items array
   ↓ Status: 'draft'
   
3. Quotation sent to customer
   ↓ Status: 'sent_to_customer'
   ↓ WhatsApp sent (optional)
   
4. Customer approves/rejects
   ↓ Status: 'customer_approved' or 'customer_rejected'
```

### 6.2 Job Card Creation from Approved Quotation
```
1. Fetch approved quotations
   ↓ Query: SELECT * FROM quotations WHERE status = 'customer_approved'
   
2. Service advisor selects quotation
   ↓ Parameters: quotationId
   
3. Job card created
   ↓ Parameters:
     - customerId: from quotation.customer_id
     - vehicleId: from quotation.vehicle_id
     - serviceCenterId: from quotation.service_center_id
     - quotationId: quotation.id
     - part2: converted from quotation_items
     - estimatedCost: from quotation.total_amount
   
4. Job card part 1 populated
   ↓ Parameters: Customer + Vehicle data from JOIN queries
   
5. Job card part 2A populated (Warranty/Insurance)
   ↓ Parameters: Form data (videoEvidence, vinImage, etc.)
   
6. Job card saved
   ↓ Status: 'Created'
```

### 6.3 Job Card Execution Flow
```
1. Engineer assigned
   ↓ Parameters: jobCardId, engineerId, engineerName
   ↓ Status: 'Assigned'
   
2. Work started
   ↓ Status: 'In Progress'
   
3. Parts requested (if needed)
   ↓ Parameters: jobCardId, parts array
   ↓ Creates parts_issues records
   
4. Parts approved and issued
   ↓ Parameters: partsIssueId, issuedBy
   ↓ Status: 'issued'
   
5. Work completed
   ↓ Status: 'Completed'
```

### 6.4 Invoice Creation Flow
```
1. Job card completed
   ↓ Status: 'Completed'
   
2. Invoice created
   ↓ Parameters:
     - jobCardId: job_card.id
     - customerId: from job_card.customer_id
     - vehicleId: from job_card.vehicle_id
     - items: from job_card_part2
     - amounts: calculated from part2 items
   
3. Invoice sent to customer
   ↓ Parameters: invoiceId
   ↓ sentToCustomer: TRUE
   
4. Payment received
   ↓ Parameters: invoiceId, paymentMethod, paidAmount, paymentDate
   ↓ paymentStatus: 'Paid'
   
5. Job card updated
   ↓ Status: 'Invoiced'
```

---

## 7. Key Parameter Passing Patterns

### 7.1 ID-Based References
Most relationships use ID references:
- `customer_id`, `vehicle_id`, `service_center_id`, `quotation_id`, `job_card_id`, etc.
- These are VARCHAR(255) UUIDs or custom IDs

### 7.2 Denormalized Fields
Some tables store denormalized data for performance:
- `job_cards.customer_name` (also in customers table)
- `job_cards.vehicle`, `registration`, `vehicle_make`, `vehicle_model` (also in vehicles table)
- `job_cards.service_center_code`, `service_center_name` (also in service_centers table)

### 7.3 Status-Based Workflows
Many entities use status fields to control workflow:
- `quotations.status`: 'draft' → 'sent_to_customer' → 'customer_approved'
- `job_cards.status`: 'Created' → 'Assigned' → 'In Progress' → 'Completed' → 'Invoiced'
- `service_intake_requests.status`: 'pending' → 'approved' → 'rejected'

### 7.4 Timestamp Tracking
Workflow timestamps track state changes:
- `customer_approved_at`, `manager_approved_at`, `submitted_at`, `approved_at`, etc.
- Used for audit trails and reporting

---

## 8. API Endpoint Parameter Mapping

### 8.1 POST /job-cards (Create from Quotation)
**Request Body:**
```json
{
  "serviceCenterId": "sc-001",        // From quotation
  "customerId": "cust-001",            // From quotation
  "vehicleId": "veh-001",              // From quotation
  "quotationId": "qtn-001",            // Link to quotation
  "serviceType": "Routine Maintenance", // From quotation.items[0].partName
  "description": "Regular service",     // From quotation.notes
  "priority": "Normal",
  "location": "Station",
  "part1": { ... },                     // Populated from customer + vehicle JOIN
  "part2": [ ... ],                     // Converted from quotation_items
  "part2A": { ... }                     // Form input (Warranty/Insurance)
}
```

**Backend Processing:**
1. Validate `quotationId` exists and status = 'customer_approved'
2. Fetch quotation with JOIN to customers and vehicles
3. Create job_card record
4. Create job_card_part1 record
5. Create job_card_part2 records (from quotation_items)
6. Create job_card_part2a record (from request)
7. Return created job card

---

### 8.2 POST /job-cards/:id/from-quotation
**Request Body:**
```json
{
  "engineerId": "user-003"  // Optional
}
```

**Backend Processing:**
1. Fetch quotation by `quotationId` from job_card
2. Populate all job card fields from quotation
3. Assign engineer if provided
4. Return job card

---

## 9. Database Query Patterns

### 9.1 Fetching Job Card with Related Data
```sql
SELECT 
  jc.*,
  c.name AS customer_name,
  c.phone AS customer_phone,
  c.email AS customer_email,
  v.registration_number,
  v.vin,
  v.vehicle_make,
  v.vehicle_model,
  q.quotation_number,
  q.total_amount AS quotation_total
FROM job_cards jc
LEFT JOIN customers c ON jc.customer_id = c.id
LEFT JOIN vehicles v ON jc.vehicle_id = v.id
LEFT JOIN quotations q ON jc.quotation_id = q.id
WHERE jc.id = ?
```

### 9.2 Fetching Approved Quotations for Job Card Creation
```sql
SELECT 
  q.*,
  c.name AS customer_name,
  c.phone AS customer_phone,
  v.registration_number,
  v.vin,
  v.vehicle_make,
  v.vehicle_model,
  COUNT(qi.id) AS item_count,
  SUM(qi.amount) AS total_amount
FROM quotations q
INNER JOIN customers c ON q.customer_id = c.id
LEFT JOIN vehicles v ON q.vehicle_id = v.id
LEFT JOIN quotation_items qi ON q.id = qi.quotation_id
WHERE q.status = 'customer_approved'
  AND q.service_center_id = ?
GROUP BY q.id
ORDER BY q.customer_approved_at DESC
```

### 9.3 Fetching Job Card with All Parts
```sql
SELECT 
  jc.*,
  jc_part1.*,
  jc_part2.*,
  jc_part2a.*,
  jc_part3.*
FROM job_cards jc
LEFT JOIN job_card_part1 jc_part1 ON jc.id = jc_part1.job_card_id
LEFT JOIN job_card_part2 jc_part2 ON jc.id = jc_part2.job_card_id
LEFT JOIN job_card_part2a jc_part2a ON jc.id = jc_part2a.job_card_id
LEFT JOIN job_card_part3 jc_part3 ON jc.id = jc_part3.job_card_id
WHERE jc.id = ?
```

---

## 10. Summary of Key Relationships

| Parent Entity | Child Entity | Relationship Type | Foreign Key | Cascade Delete |
|--------------|--------------|-------------------|-------------|----------------|
| service_centers | users | One-to-Many | users.service_center_id | No |
| customers | vehicles | One-to-Many | vehicles.customer_id | Yes |
| customers | appointments | One-to-Many | appointments.customer_id | No |
| customers | quotations | One-to-Many | quotations.customer_id | No |
| customers | job_cards | One-to-Many | job_cards.customer_id | No |
| vehicles | quotations | One-to-Many | quotations.vehicle_id | No |
| vehicles | job_cards | One-to-Many | job_cards.vehicle_id | No |
| appointments | service_intake_requests | One-to-One | service_intake_requests.appointment_id | No |
| service_intake_requests | service_intake_forms | One-to-One | service_intake_forms.service_intake_request_id | Yes |
| service_intake_forms | service_intake_documentation | One-to-Many | service_intake_documentation.service_intake_form_id | Yes |
| quotations | quotation_items | One-to-Many | quotation_items.quotation_id | Yes |
| quotations | job_cards | One-to-One | job_cards.quotation_id | No |
| job_cards | job_card_part1 | One-to-One | job_card_part1.job_card_id | Yes |
| job_cards | job_card_part2 | One-to-Many | job_card_part2.job_card_id | Yes |
| job_cards | job_card_part2a | One-to-One | job_card_part2a.job_card_id | Yes |
| job_cards | job_card_part3 | One-to-Many | job_card_part3.job_card_id | Yes |
| job_cards | parts_issues | One-to-Many | parts_issues.job_card_id | No |
| job_cards | invoices | One-to-One | invoices.job_card_id | No |
| invoices | invoice_items | One-to-Many | invoice_items.invoice_id | Yes |
| parts_master | inventory_items | One-to-Many | inventory_items.part_id | No |
| parts_master | parts_orders | One-to-Many | parts_orders.part_id | No |

---

## 11. Critical Business Rules

1. **Job Card Creation**: Can only be created from quotations with status = 'customer_approved'
2. **Vehicle Ownership**: Vehicle must belong to a customer (customer_id is REQUIRED)
3. **Quotation Items**: Must have at least one item to create a quotation
4. **Job Card Parts**: Part 2 items can come from quotation items or be manually added
5. **Invoice Creation**: Can only be created when job card status = 'Completed'
6. **Parts Request**: Can only be created when job card exists and parts are needed
7. **Cascade Deletes**: Deleting a customer cascades to vehicles, but NOT to job cards or quotations (preserves history)

---

This analysis provides a complete picture of how all schemas are interconnected and what parameters flow through each business process.

