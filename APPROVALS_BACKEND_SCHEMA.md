# Approvals System - Backend Schema & API Documentation

## Overview

The Approvals System manages three types of approval workflows:
1. **Quotation Approvals** - Manager approval for quotations sent by service advisors
2. **Service Intake Request Approvals** - Manager approval for service intake requests from appointments
3. **Job Card Approvals** - Manager approval for job cards submitted by service advisors

---

## Database Schemas

### 1. Quotations Table

```sql
CREATE TABLE quotations (
    id VARCHAR(255) PRIMARY KEY,
    quotation_number VARCHAR(100) UNIQUE NOT NULL,
    service_center_id VARCHAR(255) NOT NULL,
    customer_id VARCHAR(255) NOT NULL,
    vehicle_id VARCHAR(255),
    service_advisor_id VARCHAR(255),
    document_type ENUM('Quotation', 'Proforma Invoice') DEFAULT 'Quotation',
    quotation_date DATE NOT NULL,
    valid_until DATE,
    
    -- Insurance Information
    has_insurance BOOLEAN DEFAULT FALSE,
    insurer_id VARCHAR(255),
    
    -- Financial Details
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(12, 2) DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    pre_gst_amount DECIMAL(12, 2) NOT NULL,
    cgst_amount DECIMAL(12, 2) DEFAULT 0,
    sgst_amount DECIMAL(12, 2) DEFAULT 0,
    igst_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    
    -- Notes & Additional Info
    notes TEXT,
    battery_serial_number VARCHAR(255),
    custom_notes TEXT,
    note_template_id VARCHAR(255),
    
    -- Status & Workflow
    status ENUM(
        'draft',
        'sent_to_customer',
        'customer_approved',
        'customer_rejected',
        'sent_to_manager',
        'manager_approved',
        'manager_rejected',
        'no_response_lead',
        'manager_quote'
    ) DEFAULT 'draft',
    
    -- Manager Workflow
    passed_to_manager BOOLEAN DEFAULT FALSE,
    passed_to_manager_at TIMESTAMP NULL,
    manager_id VARCHAR(255),
    sent_to_manager BOOLEAN DEFAULT FALSE,
    sent_to_manager_at TIMESTAMP NULL,
    manager_approved BOOLEAN DEFAULT FALSE,
    manager_approved_at TIMESTAMP NULL,
    manager_rejected BOOLEAN DEFAULT FALSE,
    manager_rejected_at TIMESTAMP NULL,
    manager_rejection_reason TEXT,
    
    -- Customer Workflow
    sent_to_customer BOOLEAN DEFAULT FALSE,
    sent_to_customer_at TIMESTAMP NULL,
    customer_approved BOOLEAN DEFAULT FALSE,
    customer_approved_at TIMESTAMP NULL,
    customer_rejected BOOLEAN DEFAULT FALSE,
    customer_rejected_at TIMESTAMP NULL,
    customer_rejection_reason TEXT,
    
    -- Communication
    whatsapp_sent BOOLEAN DEFAULT FALSE,
    whatsapp_sent_at TIMESTAMP NULL,
    
    -- Vehicle Location
    vehicle_location ENUM('with_customer', 'at_workshop'),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (service_center_id) REFERENCES service_centers(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (service_advisor_id) REFERENCES users(id),
    FOREIGN KEY (manager_id) REFERENCES users(id),
    FOREIGN KEY (insurer_id) REFERENCES insurers(id),
    
    -- Indexes
    INDEX idx_service_center (service_center_id),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_quotation_number (quotation_number),
    INDEX idx_created_at (created_at)
);
```

### 2. Quotation Items Table

```sql
CREATE TABLE quotation_items (
    id VARCHAR(255) PRIMARY KEY,
    quotation_id VARCHAR(255) NOT NULL,
    serial_number INT NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100),
    hsn_sac_code VARCHAR(50),
    quantity INT NOT NULL DEFAULT 1,
    rate DECIMAL(10, 2) NOT NULL,
    gst_percent DECIMAL(5, 2) DEFAULT 0,
    amount DECIMAL(10, 2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    INDEX idx_quotation (quotation_id)
);
```

### 3. Service Intake Requests Table

```sql
CREATE TABLE service_intake_requests (
    id VARCHAR(255) PRIMARY KEY,
    appointment_id INT NOT NULL,
    service_center_id VARCHAR(255) NOT NULL,
    
    -- Status & Workflow
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP NOT NULL,
    submitted_by VARCHAR(255),
    approved_at TIMESTAMP NULL,
    approved_by VARCHAR(255),
    rejected_at TIMESTAMP NULL,
    rejected_by VARCHAR(255),
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (service_center_id) REFERENCES service_centers(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (rejected_by) REFERENCES users(id),
    
    INDEX idx_appointment (appointment_id),
    INDEX idx_service_center (service_center_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
);
```

### 4. Service Intake Forms Table

```sql
CREATE TABLE service_intake_forms (
    id VARCHAR(255) PRIMARY KEY,
    service_intake_request_id VARCHAR(255) NOT NULL,
    
    -- Vehicle Information
    vehicle_brand VARCHAR(100),
    vehicle_model VARCHAR(100),
    registration_number VARCHAR(50),
    vin_chassis_number VARCHAR(100),
    variant_battery_capacity VARCHAR(50),
    motor_number VARCHAR(100),
    charger_serial_number VARCHAR(100),
    date_of_purchase DATE,
    warranty_status VARCHAR(50),
    odometer_reading VARCHAR(50),
    
    -- Insurance Information
    insurance_start_date DATE,
    insurance_end_date DATE,
    insurance_company_name VARCHAR(255),
    
    -- Service Details
    service_type VARCHAR(100),
    customer_complaint_issue TEXT,
    previous_service_history TEXT,
    estimated_service_time VARCHAR(50),
    estimated_cost VARCHAR(50),
    estimated_delivery_date DATE,
    
    -- Operational Details
    assigned_service_advisor VARCHAR(255),
    assigned_technician VARCHAR(255),
    pickup_drop_required BOOLEAN DEFAULT FALSE,
    pickup_address TEXT,
    drop_address TEXT,
    preferred_communication_mode ENUM('Phone', 'Email', 'SMS', 'WhatsApp', ''),
    payment_method ENUM('Cash', 'Card', 'UPI', 'Online', 'Cheque', ''),
    
    -- Billing
    gst_requirement BOOLEAN DEFAULT FALSE,
    business_name_for_invoice VARCHAR(255),
    
    -- Check-in Information
    arrival_mode ENUM('vehicle_present', 'vehicle_absent', 'check_in_only', ''),
    check_in_notes TEXT,
    check_in_slip_number VARCHAR(100),
    check_in_date DATE,
    check_in_time TIME,
    
    -- Job Card Link
    job_card_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (service_intake_request_id) REFERENCES service_intake_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (job_card_id) REFERENCES job_cards(id),
    INDEX idx_request (service_intake_request_id)
);
```

### 5. Service Intake Documentation Table

```sql
CREATE TABLE service_intake_documentation (
    id VARCHAR(255) PRIMARY KEY,
    service_intake_form_id VARCHAR(255) NOT NULL,
    document_type ENUM(
        'customer_id_proof',
        'vehicle_rc_copy',
        'warranty_card_service_book',
        'photos_videos'
    ) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (service_intake_form_id) REFERENCES service_intake_forms(id) ON DELETE CASCADE,
    INDEX idx_form (service_intake_form_id),
    INDEX idx_document_type (document_type)
);
```

### 6. Job Cards Table

```sql
CREATE TABLE job_cards (
    id VARCHAR(255) PRIMARY KEY,
    job_card_number VARCHAR(100) UNIQUE NOT NULL,
    service_center_id VARCHAR(255) NOT NULL,
    service_center_code VARCHAR(50),
    service_center_name VARCHAR(255),
    
    -- Customer & Vehicle
    customer_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    vehicle_id VARCHAR(255),
    vehicle VARCHAR(255),
    registration VARCHAR(50),
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    customer_type ENUM('B2C', 'B2B'),
    
    -- Service Details
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM(
        'arrival_pending',
        'job_card_pending_vehicle',
        'job_card_active',
        'check_in_only',
        'no_response_lead',
        'manager_quote',
        'Created',
        'Assigned',
        'In Progress',
        'Parts Pending',
        'Completed',
        'Invoiced'
    ) DEFAULT 'Created',
    priority ENUM('Low', 'Normal', 'High', 'Critical') DEFAULT 'Normal',
    
    -- Assignment
    assigned_engineer VARCHAR(255),
    
    -- Estimates
    estimated_cost VARCHAR(50),
    estimated_time VARCHAR(50),
    start_time TIMESTAMP NULL,
    
    -- Location
    location ENUM('Station', 'Home Service') DEFAULT 'Station',
    
    -- Workflow
    quotation_id VARCHAR(255),
    workflow_state VARCHAR(50),
    arrival_mode ENUM('vehicle_present', 'vehicle_absent', 'check_in_only'),
    
    -- Approval Workflow
    submitted_to_manager BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP NULL,
    manager_approved BOOLEAN DEFAULT FALSE,
    manager_approved_at TIMESTAMP NULL,
    manager_rejected BOOLEAN DEFAULT FALSE,
    manager_rejected_at TIMESTAMP NULL,
    manager_rejection_reason TEXT,
    
    -- Dual Approval
    dual_approval JSON, -- { technicianApproved, serviceManagerApproved, inventoryApproved }
    
    -- Parts
    part_request_status ENUM('pending', 'service_manager_approved', 'inventory_manager_approved', 'n/a'),
    parts_pending BOOLEAN DEFAULT FALSE,
    
    -- Insurance (Legacy)
    has_insurance BOOLEAN DEFAULT FALSE,
    insurer_name VARCHAR(255),
    insurer_address TEXT,
    insurer_gst_number VARCHAR(50),
    
    -- Warranty (Legacy)
    warranty_status VARCHAR(50),
    warranty_details TEXT,
    
    -- Source
    source_appointment_id INT,
    is_temporary BOOLEAN DEFAULT FALSE,
    customer_arrival_timestamp TIMESTAMP NULL,
    
    -- Invoice Workflow
    invoice_number VARCHAR(100),
    invoice_created_at TIMESTAMP NULL,
    invoice_sent_to_advisor BOOLEAN DEFAULT FALSE,
    invoice_sent_to_customer BOOLEAN DEFAULT FALSE,
    invoice_sent_at TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (service_center_id) REFERENCES service_centers(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (assigned_engineer) REFERENCES users(id),
    FOREIGN KEY (quotation_id) REFERENCES quotations(id),
    FOREIGN KEY (source_appointment_id) REFERENCES appointments(id),
    
    INDEX idx_service_center (service_center_id),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_job_card_number (job_card_number),
    INDEX idx_submitted_to_manager (submitted_to_manager),
    INDEX idx_created_at (created_at)
);
```

### 7. Job Card Part 1 (Customer & Vehicle Information)

```sql
CREATE TABLE job_card_part1 (
    id VARCHAR(255) PRIMARY KEY,
    job_card_id VARCHAR(255) NOT NULL,
    
    -- Customer Information
    full_name VARCHAR(255) NOT NULL,
    mobile_primary VARCHAR(20) NOT NULL,
    customer_type ENUM('B2C', 'B2B', ''),
    customer_address TEXT,
    
    -- Vehicle Information
    vehicle_brand VARCHAR(100),
    vehicle_model VARCHAR(100),
    registration_number VARCHAR(50),
    vin_chassis_number VARCHAR(100),
    variant_battery_capacity VARCHAR(50),
    warranty_status VARCHAR(50),
    estimated_delivery_date DATE,
    
    -- Feedback & Observations
    customer_feedback TEXT,
    technician_observation TEXT,
    
    -- Insurance
    insurance_start_date DATE,
    insurance_end_date DATE,
    insurance_company_name VARCHAR(255),
    
    -- Serial Numbers
    battery_serial_number VARCHAR(100),
    mcu_serial_number VARCHAR(100),
    vcu_serial_number VARCHAR(100),
    other_part_serial_number VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_card_id) REFERENCES job_cards(id) ON DELETE CASCADE,
    UNIQUE KEY unique_job_card (job_card_id),
    INDEX idx_job_card (job_card_id)
);
```

### 8. Job Card Part 2 (Parts & Work Items)

```sql
CREATE TABLE job_card_part2 (
    id VARCHAR(255) PRIMARY KEY,
    job_card_id VARCHAR(255) NOT NULL,
    sr_no INT NOT NULL,
    part_warranty_tag VARCHAR(255),
    part_name VARCHAR(255) NOT NULL,
    part_code VARCHAR(100),
    qty INT NOT NULL DEFAULT 1,
    amount DECIMAL(10, 2) DEFAULT 0,
    technician VARCHAR(255),
    labour_code VARCHAR(255),
    item_type ENUM('part', 'work_item'),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_card_id) REFERENCES job_cards(id) ON DELETE CASCADE,
    INDEX idx_job_card (job_card_id),
    INDEX idx_sr_no (sr_no)
);
```

### 9. Job Card Part 2A (Warranty/Insurance Case Details)

```sql
CREATE TABLE job_card_part2a (
    id VARCHAR(255) PRIMARY KEY,
    job_card_id VARCHAR(255) NOT NULL,
    video_evidence ENUM('Yes', 'No', ''),
    vin_image ENUM('Yes', 'No', ''),
    odo_image ENUM('Yes', 'No', ''),
    damage_images ENUM('Yes', 'No', ''),
    issue_description TEXT,
    number_of_observations VARCHAR(50),
    symptom TEXT,
    defect_part VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_card_id) REFERENCES job_cards(id) ON DELETE CASCADE,
    UNIQUE KEY unique_job_card (job_card_id),
    INDEX idx_job_card (job_card_id)
);
```

### 10. Job Card Part 3 (Part Requisition & Issue Details)

```sql
CREATE TABLE job_card_part3 (
    id VARCHAR(255) PRIMARY KEY,
    job_card_id VARCHAR(255) NOT NULL,
    customer_type ENUM('B2C', 'B2B', ''),
    vehicle_brand VARCHAR(100),
    vehicle_model VARCHAR(100),
    registration_number VARCHAR(50),
    vin_chassis_number VARCHAR(100),
    part_code VARCHAR(100),
    part_name VARCHAR(255),
    qty INT NOT NULL,
    issue_qty INT DEFAULT 0,
    return_qty INT DEFAULT 0,
    warranty_tag_number VARCHAR(255),
    return_part_number VARCHAR(255),
    approval_details TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_card_id) REFERENCES job_cards(id) ON DELETE CASCADE,
    INDEX idx_job_card (job_card_id)
);
```

---

## API Endpoints

### Base URL
```
/api/v1/approvals
```

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

---

## 1. Quotation Approvals

### 1.1 Get Pending Quotation Approvals

**GET** `/quotations/pending`

**Query Parameters:**
- `serviceCenterId` (optional): Filter by service center
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by customer name, vehicle, quotation number

**Response:**
```json
{
  "success": true,
  "data": {
    "quotations": [
      {
        "id": "QT-001",
        "quotationNumber": "QT-SC001-202501-0001",
        "serviceCenterId": "sc-001",
        "customerId": "cust-001",
        "vehicleId": "veh-001",
        "serviceAdvisorId": "user-001",
        "documentType": "Quotation",
        "quotationDate": "2025-01-15",
        "validUntil": "2025-02-12",
        "hasInsurance": true,
        "insurerId": "ins-001",
        "subtotal": 12000,
        "discount": 1200,
        "discountPercent": 10,
        "preGstAmount": 10800,
        "cgstAmount": 972,
        "sgstAmount": 972,
        "igstAmount": 0,
        "totalAmount": 12744,
        "notes": "Complete battery diagnostics",
        "status": "sent_to_manager",
        "sentToManager": true,
        "sentToManagerAt": "2025-01-15T10:00:00Z",
        "createdAt": "2025-01-15T08:00:00Z",
        "updatedAt": "2025-01-15T10:00:00Z",
        "items": [
          {
            "id": "item-001",
            "serialNumber": 1,
            "partName": "Battery Diagnostic Service",
            "partNumber": "BAT-DIAG-001",
            "hsnSacCode": "998314",
            "quantity": 1,
            "rate": 5000,
            "gstPercent": 18,
            "amount": 5000
          }
        ],
        "customer": {
          "id": "cust-001",
          "firstName": "Vikram",
          "lastName": "Singh",
          "phone": "9876543214",
          "email": "vikram.singh@example.com"
        },
        "vehicle": {
          "id": "veh-001",
          "make": "MG",
          "model": "ZS EV",
          "registration": "KA-05-EF-3456",
          "vin": "MG1234567890123456"
        },
        "insurer": {
          "id": "ins-001",
          "name": "HDFC Ergo",
          "gstNumber": "27AAACH1234R1Z5"
        },
        "serviceCenter": {
          "id": "sc-001",
          "name": "Delhi Central Hub",
          "code": "SC001"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### 1.2 Approve Quotation

**POST** `/quotations/{quotationId}/approve`

**Request Body:**
```json
{
  "managerId": "user-002",
  "notes": "Approved for job card creation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quotation approved successfully",
  "data": {
    "id": "QT-001",
    "status": "manager_approved",
    "managerApproved": true,
    "managerApprovedAt": "2025-01-15T11:00:00Z",
    "managerId": "user-002"
  }
}
```

### 1.3 Reject Quotation

**POST** `/quotations/{quotationId}/reject`

**Request Body:**
```json
{
  "managerId": "user-002",
  "rejectionReason": "Cost estimate too high, needs revision"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quotation rejected successfully",
  "data": {
    "id": "QT-001",
    "status": "manager_rejected",
    "managerRejected": true,
    "managerRejectedAt": "2025-01-15T11:00:00Z",
    "managerRejectionReason": "Cost estimate too high, needs revision"
  }
}
```

### 1.4 Get Quotation Details

**GET** `/quotations/{quotationId}`

**Response:**
```json
{
  "success": true,
  "data": {
    // Full quotation object with all details
  }
}
```

---

## 2. Service Intake Request Approvals

### 2.1 Get Pending Service Intake Requests

**GET** `/service-intake-requests/pending`

**Query Parameters:**
- `serviceCenterId` (optional): Filter by service center
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by customer name, vehicle, phone

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "SIR-001",
        "appointmentId": 1001,
        "appointment": {
          "id": 1001,
          "customerName": "Amit Patel",
          "vehicle": "Mahindra XUV400",
          "phone": "9876543212",
          "serviceType": "Battery Service",
          "date": "2025-01-15",
          "time": "10:00 AM",
          "status": "confirmed"
        },
        "serviceIntakeForm": {
          "vehicleBrand": "Mahindra",
          "vehicleModel": "XUV400",
          "registrationNumber": "DL-01-AB-5678",
          "vinChassisNumber": "MAH1234567890123",
          "serviceType": "Battery Service",
          "customerComplaintIssue": "Battery not holding charge",
          "estimatedCost": "₹8,500",
          "estimatedServiceTime": "4 hours"
        },
        "status": "pending",
        "submittedAt": "2025-01-15T09:00:00Z",
        "submittedBy": "Service Advisor",
        "serviceCenterId": "sc-001",
        "serviceCenterName": "Delhi Central Hub"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

### 2.2 Get Service Intake Request Details

**GET** `/service-intake-requests/{requestId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "SIR-001",
    "appointmentId": 1001,
    "appointment": { /* full appointment object */ },
    "serviceIntakeForm": {
      "vehicleBrand": "Mahindra",
      "vehicleModel": "XUV400",
      "registrationNumber": "DL-01-AB-5678",
      "vinChassisNumber": "MAH1234567890123",
      "variantBatteryCapacity": "39.4 kWh",
      "motorNumber": "MOT-001-2024",
      "chargerSerialNumber": "CHG-001-2024",
      "dateOfPurchase": "2023-06-15",
      "warrantyStatus": "Active",
      "insuranceStartDate": "2023-06-20",
      "insuranceEndDate": "2024-06-19",
      "insuranceCompanyName": "HDFC Ergo",
      "serviceType": "Battery Service",
      "customerComplaintIssue": "Battery not holding charge properly",
      "previousServiceHistory": "Last service done 3 months ago",
      "estimatedServiceTime": "4 hours",
      "estimatedCost": "₹8,500",
      "odometerReading": "15,000 km",
      "estimatedDeliveryDate": "2025-01-17",
      "assignedServiceAdvisor": "Ravi Kumar",
      "pickupDropRequired": true,
      "pickupAddress": "123 Sector 5, Noida",
      "dropAddress": "123 Sector 5, Noida",
      "preferredCommunicationMode": "WhatsApp",
      "paymentMethod": "UPI",
      "gstRequirement": false,
      "arrivalMode": "vehicle_present",
      "checkInNotes": "Vehicle checked in",
      "checkInSlipNumber": "CHK-001",
      "checkInDate": "2025-01-15",
      "checkInTime": "09:45 AM"
    },
    "documentation": {
      "customerIdProof": {
        "files": [],
        "urls": ["https://storage.example.com/docs/id-proof-001.pdf"]
      },
      "vehicleRCCopy": {
        "files": [],
        "urls": ["https://storage.example.com/docs/rc-001.pdf"]
      },
      "warrantyCardServiceBook": {
        "files": [],
        "urls": []
      },
      "photosVideos": {
        "files": [],
        "urls": ["https://storage.example.com/photos/photo-001.jpg"]
      }
    },
    "status": "pending",
    "submittedAt": "2025-01-15T09:00:00Z",
    "submittedBy": "Service Advisor",
    "serviceCenterId": "sc-001",
    "serviceCenterName": "Delhi Central Hub"
  }
}
```

### 2.3 Approve Service Intake Request

**POST** `/service-intake-requests/{requestId}/approve`

**Request Body:**
```json
{
  "managerId": "user-002",
  "notes": "Approved for service"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service intake request approved successfully",
  "data": {
    "id": "SIR-001",
    "status": "approved",
    "approvedAt": "2025-01-15T11:00:00Z",
    "approvedBy": "user-002"
  }
}
```

### 2.4 Reject Service Intake Request

**POST** `/service-intake-requests/{requestId}/reject`

**Request Body:**
```json
{
  "managerId": "user-002",
  "rejectionReason": "Incomplete documentation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service intake request rejected successfully",
  "data": {
    "id": "SIR-001",
    "status": "rejected",
    "rejectedAt": "2025-01-15T11:00:00Z",
    "rejectedBy": "user-002",
    "rejectionReason": "Incomplete documentation"
  }
}
```

---

## 3. Job Card Approvals

### 3.1 Get Pending Job Card Approvals

**GET** `/job-cards/pending`

**Query Parameters:**
- `serviceCenterId` (optional): Filter by service center
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by customer name, vehicle, job card number

**Response:**
```json
{
  "success": true,
  "data": {
    "jobCards": [
      {
        "id": "JC-APPROVAL-001",
        "jobCardNumber": "SC001-202501-APPROVAL-001",
        "serviceCenterId": "sc-001",
        "serviceCenterCode": "SC001",
        "serviceCenterName": "Delhi Central Hub",
        "customerId": "cust-001",
        "customerName": "Rajesh Kumar",
        "vehicleId": "veh-001",
        "vehicle": "Tata Nexon EV Max",
        "registration": "MH-12-AB-1234",
        "vehicleMake": "Tata",
        "vehicleModel": "Nexon EV Max",
        "customerType": "B2C",
        "serviceType": "Routine Maintenance",
        "description": "Regular service - oil change, filter replacement",
        "status": "Created",
        "priority": "Normal",
        "assignedEngineer": null,
        "estimatedCost": "₹3,500",
        "estimatedTime": "2 hours",
        "createdAt": "2025-01-15T10:00:00Z",
        "parts": ["Engine Oil", "Air Filter", "Battery Check"],
        "location": "Station",
        "submittedToManager": true,
        "submittedAt": "2025-01-15T10:00:00Z",
        "part1": {
          "fullName": "Rajesh Kumar",
          "mobilePrimary": "9876543210",
          "customerType": "B2C",
          "vehicleBrand": "Tata",
          "vehicleModel": "Nexon EV Max",
          "registrationNumber": "MH-12-AB-1234",
          "vinChassisNumber": "TATA1234567890123",
          "variantBatteryCapacity": "40.5 kWh",
          "warrantyStatus": "Active",
          "estimatedDeliveryDate": "2025-01-16",
          "customerAddress": "123 Main Street, Pune",
          "customerFeedback": "Vehicle making unusual noise"
        },
        "part2": [
          {
            "srNo": 1,
            "partWarrantyTag": "Engine Oil Change",
            "partName": "Engine Oil",
            "partCode": "EO-001",
            "qty": 1,
            "amount": 1500,
            "technician": "",
            "labourCode": "Auto Select With Part",
            "itemType": "part"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

### 3.2 Get Job Card Details

**GET** `/job-cards/{jobCardId}`

**Response:**
```json
{
  "success": true,
  "data": {
    // Full job card object with part1, part2, part2A, part3
  }
}
```

### 3.3 Approve Job Card

**POST** `/job-cards/{jobCardId}/approve`

**Request Body:**
```json
{
  "managerId": "user-002",
  "notes": "Approved for technician assignment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job card approved successfully",
  "data": {
    "id": "JC-APPROVAL-001",
    "submittedToManager": false,
    "status": "Created",
    "managerApproved": true,
    "managerApprovedAt": "2025-01-15T11:00:00Z"
  }
}
```

### 3.4 Reject Job Card

**POST** `/job-cards/{jobCardId}/reject`

**Request Body:**
```json
{
  "managerId": "user-002",
  "rejectionReason": "Missing required parts information"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job card rejected successfully",
  "data": {
    "id": "JC-APPROVAL-001",
    "submittedToManager": false,
    "status": "Created",
    "managerRejected": true,
    "managerRejectedAt": "2025-01-15T11:00:00Z",
    "managerRejectionReason": "Missing required parts information"
  }
}
```

---

## 4. Combined Approvals Dashboard

### 4.1 Get All Pending Approvals Summary

**GET** `/summary`

**Query Parameters:**
- `serviceCenterId` (optional): Filter by service center

**Response:**
```json
{
  "success": true,
  "data": {
    "quotations": {
      "count": 5,
      "pending": 5
    },
    "serviceIntakeRequests": {
      "count": 3,
      "pending": 3
    },
    "jobCards": {
      "count": 2,
      "pending": 2
    },
    "totalPending": 10
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Missing or invalid authentication token
- `FORBIDDEN` (403): User doesn't have permission to perform action
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `ALREADY_APPROVED` (400): Resource already approved/rejected
- `INTERNAL_ERROR` (500): Server error

---

## Workflow States

### Quotation Workflow
```
draft → sent_to_manager → manager_approved / manager_rejected
     ↓
sent_to_customer → customer_approved / customer_rejected
```

### Service Intake Request Workflow
```
pending → approved / rejected
```

### Job Card Workflow
```
Created (submittedToManager: true) → Approved (submittedToManager: false) → Assigned → In Progress → Completed
```

---

## Business Rules

1. **Quotation Approvals:**
   - Only quotations with status `sent_to_manager` can be approved/rejected
   - Manager approval allows job card creation
   - Manager rejection requires a reason

2. **Service Intake Request Approvals:**
   - Only requests with status `pending` can be approved/rejected
   - Approval allows service to proceed
   - Rejection requires a reason

3. **Job Card Approvals:**
   - Only job cards with `submittedToManager: true` and `status: "Created"` can be approved/rejected
   - Approval allows technician assignment
   - Rejection requires a reason

4. **Service Center Filtering:**
   - Managers can only see approvals for their assigned service center(s)
   - Super admins can see all approvals

5. **Audit Trail:**
   - All approval/rejection actions must be logged with:
     - User ID
     - Timestamp
     - Action (approve/reject)
     - Reason (if rejection)

---

## Notification Requirements

When approvals are made, the system should send notifications:

1. **Quotation Approval:**
   - Notify service advisor
   - If customer approved, notify customer

2. **Service Intake Request Approval:**
   - Notify service advisor
   - Notify customer (if applicable)

3. **Job Card Approval:**
   - Notify service advisor
   - Job card becomes available for technician assignment

---

## File Storage

Documentation files for service intake requests should be stored in:
- Cloud storage (S3, Azure Blob, etc.)
- URLs stored in database
- Files accessible via signed URLs for security

---

## Indexes for Performance

Ensure the following indexes are created:

```sql
-- Quotations
CREATE INDEX idx_quotations_status_service_center ON quotations(status, service_center_id);
CREATE INDEX idx_quotations_sent_to_manager ON quotations(sent_to_manager, status) WHERE sent_to_manager = TRUE;

-- Service Intake Requests
CREATE INDEX idx_sir_status_service_center ON service_intake_requests(status, service_center_id);
CREATE INDEX idx_sir_pending ON service_intake_requests(status) WHERE status = 'pending';

-- Job Cards
CREATE INDEX idx_job_cards_submitted_manager ON job_cards(submitted_to_manager, status) WHERE submitted_to_manager = TRUE;
CREATE INDEX idx_job_cards_status_service_center ON job_cards(status, service_center_id);
```

---

## Additional Considerations

1. **Pagination:** All list endpoints should support pagination
2. **Filtering:** Support filtering by date range, service center, status
3. **Search:** Full-text search on customer names, vehicle details, IDs
4. **Sorting:** Default sort by submission date (newest first)
5. **Caching:** Consider caching pending approvals count for dashboard
6. **Rate Limiting:** Implement rate limiting on approval endpoints
7. **Concurrency:** Handle concurrent approval attempts (optimistic locking)




