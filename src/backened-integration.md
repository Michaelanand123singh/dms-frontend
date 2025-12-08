# DMS Backend Integration Documentation

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Data Relationships](#data-relationships)
6. [Business Logic & Workflows](#business-logic--workflows)
7. [Authentication & Authorization](#authentication--authorization)
8. [File Storage](#file-storage)
9. [Notifications](#notifications)
10. [Integration Checklist](#integration-checklist)

---

## Overview

This document provides comprehensive backend integration documentation for the DMS (Dealer Management System) frontend. It includes complete database schemas, API endpoint specifications, data relationships, business rules, and integration requirements.

### System Modules

1. **Authentication & Authorization**
2. **Service Centers Management**
3. **Users & Roles Management**
4. **Customers Management**
5. **Vehicles Management**
6. **Appointments Management**
7. **Service Intake Requests**
8. **Quotations Management**
9. **Job Cards Management**
10. **Inventory Management**
11. **Parts Management**
12. **Invoices Management**
13. **Leads Management**
14. **Complaints Management**
15. **Reports & Analytics**
16. **Approvals System**

---

## System Architecture

### Technology Stack Recommendations

- **Backend Framework**: Node.js (Express/NestJS) or Python (Django/FastAPI) or Java (Spring Boot)
- **Database**: PostgreSQL or MySQL
- **File Storage**: AWS S3, Azure Blob Storage, or Google Cloud Storage
- **Authentication**: JWT tokens with refresh tokens
- **Real-time**: WebSockets or Server-Sent Events (SSE)
- **Caching**: Redis (optional)
- **Message Queue**: RabbitMQ or AWS SQS (for notifications)

### API Structure

```
Base URL: https://api.yourdomain.com/api/v1

Authentication: Bearer Token
Content-Type: application/json
```

---

## Database Schema

### Core Tables

#### 1. service_centers

```sql
CREATE TABLE service_centers (
    id VARCHAR(255) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., "SC001"
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    gst_number VARCHAR(50),
    pan_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_city (city),
    INDEX idx_state (state)
);
```

#### 2. users

```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt/argon2 hash (never plain text)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role ENUM(
        'admin',
        'sc_manager',
        'service_inventory_manager',
        'service_advisor',
        'service_engineer',
        'inventory_manager',
        'call_center'
    ) NOT NULL,
    service_center_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    last_login_ip VARCHAR(45) NULL,
    last_login_device TEXT NULL,
    
    -- Password Security
    password_changed_at TIMESTAMP NULL,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expires TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    
    -- Multi-Factor Authentication (Optional)
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255) NULL, -- Encrypted TOTP secret
    mfa_backup_codes TEXT NULL, -- Encrypted JSON array
    
    -- Session Management
    max_concurrent_sessions INT DEFAULT 5,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (service_center_id) REFERENCES service_centers(id),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_service_center (service_center_id),
    INDEX idx_email_active (email, is_active),
    INDEX idx_locked (locked_until) WHERE locked_until IS NOT NULL
);
```

**Security Notes:**
- `password_hash`: Always use bcrypt (12+ rounds) or argon2. Never store plain text passwords.
- `failed_login_attempts`: Incremented on failed login, reset on success.
- `locked_until`: Account locked after 5 failed attempts. Lock duration: 15min, 30min, 1hr, 24hr (incremental).
- `mfa_secret` and `mfa_backup_codes`: Should be encrypted at rest.
- `password_reset_token`: Generate secure random token (32 chars), expire after 1 hour.

#### 3. customers

```sql
CREATE TABLE customers (
    id VARCHAR(255) PRIMARY KEY,
    customer_number VARCHAR(50) UNIQUE NOT NULL, -- Auto-generated: CUST-YYYY-MM-####
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    whatsapp_number VARCHAR(20), -- Dedicated WhatsApp number (can be same as phone)
    alternate_mobile VARCHAR(20),
    email VARCHAR(255),
    address TEXT, -- Full address (House/Flat, Street, Area, City, State, Pincode)
    city VARCHAR(255), -- Extracted from cityState or separate field
    state VARCHAR(255), -- Extracted from cityState or separate field
    pincode VARCHAR(20),
    customer_type ENUM('B2C', 'B2B') DEFAULT 'B2C',
    service_type ENUM('walk-in', 'home-service') DEFAULT 'walk-in',
    address_type ENUM('home', 'work') DEFAULT 'home',
    work_address TEXT,
    pickup_drop_required BOOLEAN DEFAULT FALSE,
    pickup_address TEXT,
    drop_address TEXT,
    service_center_id VARCHAR(255), -- Primary service center affiliation
    external_id VARCHAR(255), -- For external system integration
    total_vehicles INT DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    last_service_date DATE NULL,
    last_service_center_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (service_center_id) REFERENCES service_centers(id),
    FOREIGN KEY (last_service_center_id) REFERENCES service_centers(id),
    INDEX idx_customer_number (customer_number),
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_service_center (service_center_id),
    INDEX idx_city_state (city, state)
);
```

**Backend API Note:** 
- Frontend sends `cityState` as combined string (e.g., "Pune, Maharashtra")
- Backend should parse and split into `city` and `state` fields when saving
- When returning data, backend can combine `city` and `state` back to `cityState` for frontend compatibility
- Alternatively, backend can return both formats: `{ city: "Pune", state: "Maharashtra", cityState: "Pune, Maharashtra" }`

#### 4. vehicles

```sql
CREATE TABLE vehicles (
    id VARCHAR(255) PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    vin VARCHAR(100) NOT NULL UNIQUE, -- 17 alphanumeric characters (excluding I, O, Q)
    chassis_number VARCHAR(100) NOT NULL UNIQUE, -- Same as VIN or separate chassis number
    -- Vehicle-specific information only (customer details retrieved via JOIN)
    vehicle_make VARCHAR(100) NOT NULL, -- Maps from frontend: vehicleBrand
    vehicle_model VARCHAR(100) NOT NULL, -- Maps from frontend: vehicleModel
    vehicle_year INT, -- Optional, can be derived from purchase_date
    vehicle_color VARCHAR(50), -- Optional, not always captured in form
    variant_battery_capacity VARCHAR(50), -- Maps from frontend: variant
    motor_number VARCHAR(100), -- Maps from frontend: motorNumber
    charger_serial_number VARCHAR(100), -- Maps from frontend: chargerSerialNumber
    purchase_date DATE, -- Maps from frontend: purchaseDate
    warranty_status VARCHAR(50), -- Maps from frontend: warrantyStatus (Active/Expired/Not Applicable)
    -- Insurance information (vehicle-specific)
    insurance_start_date DATE, -- Maps from frontend: insuranceStartDate
    insurance_end_date DATE, -- Maps from frontend: insuranceEndDate
    insurance_company_name VARCHAR(255), -- Maps from frontend: insuranceCompanyName
    -- Service tracking
    last_service_date DATE,
    total_services INT DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    current_status ENUM('Available', 'Active Job Card') DEFAULT 'Available',
    active_job_card_id VARCHAR(255),
    next_service_date DATE,
    last_service_center_id VARCHAR(255),
    external_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (active_job_card_id) REFERENCES job_cards(id),
    FOREIGN KEY (last_service_center_id) REFERENCES service_centers(id),
    INDEX idx_customer (customer_id),
    INDEX idx_registration (registration_number),
    INDEX idx_vin (vin),
    INDEX idx_chassis (chassis_number),
    INDEX idx_status (current_status),
    -- Composite index for common queries
    INDEX idx_customer_status (customer_id, current_status),
    INDEX idx_make_model (vehicle_make, vehicle_model)
);
```

**Important Notes:**
1. **Customer Details:** Customer details (name, email, address, phone) are accessed via JOIN with the `customers` table using `customer_id`. This follows database normalization principles and eliminates data redundancy.

2. **Vehicle Creation Flow:**
   - When frontend sends `NewVehicleForm` with customer fields (customerName, customerPhone, etc.), backend should:
     a. First check if customer exists (by phone or customer_id)
     b. If new customer, create customer record first
     c. Then create vehicle with `customer_id` reference
   - Frontend `NewVehicleForm` includes customer fields for convenience, but backend should only store vehicle-specific data in vehicles table

3. **Field Mappings:**
   - Frontend `vehicleBrand` → Database `vehicle_make`
   - Frontend `vehicleModel` → Database `vehicle_model`
   - Frontend `variant` → Database `variant_battery_capacity`
   - Frontend `registrationNumber` → Database `registration_number`
   - Frontend `vin` → Database `vin` (and `chassis_number` if same)
   - Frontend `purchaseDate` → Database `purchase_date`
   - Frontend `warrantyStatus` → Database `warranty_status`
   - Frontend `motorNumber` → Database `motor_number`
   - Frontend `chargerSerialNumber` → Database `charger_serial_number`
   - Frontend `insuranceStartDate` → Database `insurance_start_date`
   - Frontend `insuranceEndDate` → Database `insurance_end_date`
   - Frontend `insuranceCompanyName` → Database `insurance_company_name`

#### 5. appointments

```sql
CREATE TABLE appointments (
    id VARCHAR(255) PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    vehicle_id VARCHAR(255),
    service_center_id VARCHAR(255) NOT NULL,
    service_type VARCHAR(100),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration VARCHAR(50),
    status ENUM('Confirmed', 'Pending', 'Cancelled', 'In Progress', 'Completed') DEFAULT 'Pending',
    customer_complaint_issue TEXT,
    previous_service_history TEXT,
    estimated_cost VARCHAR(50),
    estimated_time VARCHAR(50),
    location ENUM('Station', 'Home Service') DEFAULT 'Station',
    pickup_drop_required BOOLEAN DEFAULT FALSE,
    pickup_address TEXT,
    drop_address TEXT,
    assigned_service_advisor VARCHAR(255),
    assigned_technician VARCHAR(255),
    customer_arrival_timestamp TIMESTAMP NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (service_center_id) REFERENCES service_centers(id),
    FOREIGN KEY (assigned_service_advisor) REFERENCES users(id),
    FOREIGN KEY (assigned_technician) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_customer (customer_id),
    INDEX idx_service_center (service_center_id),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status),
    INDEX idx_assigned_advisor (assigned_service_advisor),
    INDEX idx_assigned_technician (assigned_technician)
);
```

#### 6. service_intake_requests

```sql
CREATE TABLE service_intake_requests (
    id VARCHAR(255) PRIMARY KEY,
    appointment_id VARCHAR(255) NOT NULL,
    service_center_id VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP NOT NULL,
    submitted_by VARCHAR(255),
    approved_at TIMESTAMP NULL,
    approved_by VARCHAR(255),
    rejected_at TIMESTAMP NULL,
    rejected_by VARCHAR(255),
    rejection_reason TEXT,
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

#### 7. service_intake_forms

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
    preferred_communication_mode ENUM('Phone', 'Email', 'SMS', 'WhatsApp', '') DEFAULT '',
    payment_method ENUM('Cash', 'Card', 'UPI', 'Online', 'Cheque', '') DEFAULT '',
    
    -- Billing
    gst_requirement BOOLEAN DEFAULT FALSE,
    business_name_for_invoice VARCHAR(255),
    
    -- Check-in Information
    arrival_mode ENUM('vehicle_present', 'vehicle_absent', 'check_in_only', '') DEFAULT '',
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
    FOREIGN KEY (assigned_service_advisor) REFERENCES users(id),
    FOREIGN KEY (assigned_technician) REFERENCES users(id),
    INDEX idx_request (service_intake_request_id),
    INDEX idx_assigned_advisor (assigned_service_advisor),
    INDEX idx_assigned_technician (assigned_technician)
);
```

#### 8. service_intake_documentation

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

#### 9. quotations

```sql
CREATE TABLE quotations (
    id VARCHAR(255) PRIMARY KEY,
    quotation_number VARCHAR(100) UNIQUE NOT NULL, -- Format: QT-SC001-YYYYMM-####
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
    INDEX idx_created_at (created_at),
    INDEX idx_sent_to_manager (sent_to_manager, status) WHERE sent_to_manager = TRUE
);
```

#### 10. quotation_items

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

#### 11. job_cards

```sql
CREATE TABLE job_cards (
    id VARCHAR(255) PRIMARY KEY,
    job_card_number VARCHAR(100) UNIQUE NOT NULL, -- Format: SC001-YYYY-MM-####
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
    dual_approval JSON, -- { technicianApproved, serviceManagerApproved, inventoryApproved }
    
    -- Approval Workflow
    submitted_to_manager BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP NULL,
    manager_approved BOOLEAN DEFAULT FALSE,
    manager_approved_at TIMESTAMP NULL,
    manager_rejected BOOLEAN DEFAULT FALSE,
    manager_rejected_at TIMESTAMP NULL,
    manager_rejection_reason TEXT,
    
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
    source_appointment_id VARCHAR(255),
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
    INDEX idx_submitted_to_manager (submitted_to_manager, status) WHERE submitted_to_manager = TRUE,
    INDEX idx_created_at (created_at)
);
```

#### 12. job_card_part1

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

#### 13. job_card_part2

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
    FOREIGN KEY (technician) REFERENCES users(id),
    INDEX idx_job_card (job_card_id),
    INDEX idx_sr_no (sr_no),
    INDEX idx_technician (technician)
);
```

#### 14. job_card_part2a

```sql
CREATE TABLE job_card_part2a (
    id VARCHAR(255) PRIMARY KEY,
    job_card_id VARCHAR(255) NOT NULL,
    video_evidence ENUM('Yes', 'No', '') DEFAULT '',
    vin_image ENUM('Yes', 'No', '') DEFAULT '',
    odo_image ENUM('Yes', 'No', '') DEFAULT '',
    damage_images ENUM('Yes', 'No', '') DEFAULT '',
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

**Note:** File URLs for video evidence, VIN image, odometer image, and damage images are stored in the `job_card_part2a_documentation` table (see below).

#### 15. job_card_part2a_documentation

```sql
CREATE TABLE job_card_part2a_documentation (
    id VARCHAR(255) PRIMARY KEY,
    job_card_part2a_id VARCHAR(255) NOT NULL,
    document_type ENUM(
        'video_evidence',
        'vin_image',
        'odo_image',
        'damage_images'
    ) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_card_part2a_id) REFERENCES job_card_part2a(id) ON DELETE CASCADE,
    INDEX idx_part2a (job_card_part2a_id),
    INDEX idx_document_type (document_type)
);
```

#### 16. job_card_part3

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

#### 17. parts_master

```sql
CREATE TABLE parts_master (
    id VARCHAR(255) PRIMARY KEY,
    part_id VARCHAR(100) UNIQUE NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'piece',
    hsn_code VARCHAR(50),
    gst_percent DECIMAL(5, 2) DEFAULT 0,
    supplier VARCHAR(255),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_part_id (part_id),
    INDEX idx_part_number (part_number),
    INDEX idx_category (category),
    INDEX idx_stock (stock_quantity, min_stock_level)
);
```

#### 18. inventory_items

```sql
CREATE TABLE inventory_items (
    id VARCHAR(255) PRIMARY KEY,
    part_id VARCHAR(255) NOT NULL,
    service_center_id VARCHAR(255) NOT NULL,
    current_qty INT DEFAULT 0,
    min_stock INT DEFAULT 0,
    unit_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    supplier VARCHAR(255),
    location VARCHAR(255),
    status ENUM('In Stock', 'Low Stock', 'Out of Stock') DEFAULT 'In Stock',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (part_id) REFERENCES parts_master(id),
    FOREIGN KEY (service_center_id) REFERENCES service_centers(id),
    UNIQUE KEY unique_part_service_center (part_id, service_center_id),
    INDEX idx_service_center (service_center_id),
    INDEX idx_status (status)
);
```

#### 19. parts_orders

```sql
CREATE TABLE parts_orders (
    id VARCHAR(255) PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    service_center_id VARCHAR(255) NOT NULL,
    part_id VARCHAR(255) NOT NULL,
    required_qty INT NOT NULL,
    urgency ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('pending', 'ordered', 'received', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    ordered_by VARCHAR(255),
    ordered_at TIMESTAMP NULL,
    received_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (service_center_id) REFERENCES service_centers(id),
    FOREIGN KEY (part_id) REFERENCES parts_master(id),
    FOREIGN KEY (ordered_by) REFERENCES users(id),
    INDEX idx_service_center (service_center_id),
    INDEX idx_status (status),
    INDEX idx_ordered_at (ordered_at)
);
```

#### 20. parts_issues

```sql
CREATE TABLE parts_issues (
    id VARCHAR(255) PRIMARY KEY,
    job_card_id VARCHAR(255) NOT NULL,
    part_id VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    status ENUM('pending', 'issued', 'rejected') DEFAULT 'pending',
    issued_by VARCHAR(255),
    issued_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_card_id) REFERENCES job_cards(id),
    FOREIGN KEY (part_id) REFERENCES parts_master(id),
    FOREIGN KEY (issued_by) REFERENCES users(id),
    INDEX idx_job_card (job_card_id),
    INDEX idx_status (status)
);
```

#### 21. invoices

```sql
CREATE TABLE invoices (
    id VARCHAR(255) PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    job_card_id VARCHAR(255),
    service_center_id VARCHAR(255) NOT NULL,
    customer_id VARCHAR(255) NOT NULL,
    vehicle_id VARCHAR(255),
    customer_name VARCHAR(255) NOT NULL,
    vehicle VARCHAR(255),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    
    -- Financial Details
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(12, 2) DEFAULT 0,
    cgst_amount DECIMAL(12, 2) DEFAULT 0,
    sgst_amount DECIMAL(12, 2) DEFAULT 0,
    igst_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    balance DECIMAL(12, 2) NOT NULL,
    
    -- Payment
    payment_status ENUM('Paid', 'Unpaid', 'Overdue', 'Partially Paid') DEFAULT 'Unpaid',
    payment_method ENUM('Cash', 'Card', 'UPI', 'Online', 'Cheque') NULL,
    payment_date DATE NULL,
    
    -- Communication
    sent_to_customer BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_card_id) REFERENCES job_cards(id),
    FOREIGN KEY (service_center_id) REFERENCES service_centers(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_job_card (job_card_id),
    INDEX idx_customer (customer_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_invoice_date (invoice_date)
);
```

#### 22. invoice_items

```sql
CREATE TABLE invoice_items (
    id VARCHAR(255) PRIMARY KEY,
    invoice_id VARCHAR(255) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_invoice (invoice_id)
);
```

#### 23. insurers

```sql
CREATE TABLE insurers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    gst_number VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
);
```

#### 24. leads

```sql
CREATE TABLE leads (
    id VARCHAR(255) PRIMARY KEY,
    lead_number VARCHAR(100) UNIQUE NOT NULL,
    service_center_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    inquiry_type VARCHAR(100),
    status ENUM('new', 'contacted', 'in_discussion', 'qualified', 'converted', 'lost') DEFAULT 'new',
    converted_to ENUM('appointment', 'quotation') NULL,
    converted_id VARCHAR(255) NULL,
    notes TEXT,
    assigned_to VARCHAR(255),
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (service_center_id) REFERENCES service_centers(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_service_center (service_center_id),
    INDEX idx_status (status),
    INDEX idx_phone (phone)
);
```

#### 25. complaints

```sql
CREATE TABLE complaints (
    id VARCHAR(255) PRIMARY KEY,
    complaint_number VARCHAR(100) UNIQUE NOT NULL,
    service_center_id VARCHAR(255) NOT NULL,
    customer_id VARCHAR(255) NOT NULL,
    vehicle_id VARCHAR(255),
    job_card_id VARCHAR(255),
    complaint_type VARCHAR(100),
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('Low', 'Normal', 'High', 'Critical') DEFAULT 'Normal',
    assigned_to VARCHAR(255),
    resolution TEXT,
    resolved_at TIMESTAMP NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (service_center_id) REFERENCES service_centers(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (job_card_id) REFERENCES job_cards(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_service_center (service_center_id),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
);
```

#### 26. audit_logs

```sql
CREATE TABLE audit_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
);
```

#### 27. notifications

```sql
CREATE TABLE notifications (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);
```

#### 28. login_attempts

```sql
CREATE TABLE login_attempts (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100), -- 'invalid_password', 'account_locked', 'account_inactive'
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_ip (ip_address),
    INDEX idx_attempted_at (attempted_at),
    INDEX idx_email_attempted (email, attempted_at)
);
```

#### 29. refresh_tokens

```sql
CREATE TABLE refresh_tokens (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    device_fingerprint VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_token (token),
    INDEX idx_expires (expires_at),
    INDEX idx_user_active (user_id, revoked, expires_at)
);
```

#### 30. user_sessions

```sql
CREATE TABLE user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    refresh_token_id VARCHAR(255) NOT NULL,
    device_fingerprint VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    location JSON, -- { country, city, region }
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (refresh_token_id) REFERENCES refresh_tokens(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_active (user_id, is_active),
    INDEX idx_expires (expires_at)
);
```

#### 31. device_fingerprints

```sql
CREATE TABLE device_fingerprints (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    fingerprint_hash VARCHAR(255) NOT NULL UNIQUE,
    device_name VARCHAR(255),
    device_type ENUM('desktop', 'mobile', 'tablet') NOT NULL,
    browser_name VARCHAR(100),
    browser_version VARCHAR(50),
    os_name VARCHAR(100),
    os_version VARCHAR(50),
    is_trusted BOOLEAN DEFAULT FALSE,
    trust_expires_at TIMESTAMP NULL,
    first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_fingerprint (fingerprint_hash),
    INDEX idx_trusted (user_id, is_trusted, trust_expires_at)
);
```

#### 32. login_anomalies

```sql
CREATE TABLE login_anomalies (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    anomaly_type ENUM(
        'unusual_location',
        'unusual_time',
        'unusual_device',
        'rapid_succession',
        'multiple_failures',
        'suspicious_ip'
    ) NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    details JSON,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_severity (severity, resolved),
    INDEX idx_detected (detected_at)
);
```

#### 33. security_events

```sql
CREATE TABLE security_events (
    id VARCHAR(255) PRIMARY KEY,
    event_type ENUM(
        'LOGIN_SUCCESS',
        'LOGIN_FAILURE',
        'LOGIN_LOCKED',
        'PASSWORD_RESET_REQUESTED',
        'PASSWORD_RESET_COMPLETED',
        'PASSWORD_CHANGED',
        'TOKEN_REFRESHED',
        'TOKEN_REVOKED',
        'SESSION_CREATED',
        'SESSION_TERMINATED',
        'MFA_ENABLED',
        'MFA_DISABLED',
        'MFA_VERIFIED',
        'ANOMALY_DETECTED',
        'IP_BLOCKED',
        'ACCOUNT_LOCKED',
        'ACCOUNT_UNLOCKED'
    ) NOT NULL,
    user_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    location JSON,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_event_type (event_type),
    INDEX idx_user (user_id),
    INDEX idx_severity (severity),
    INDEX idx_created (created_at),
    INDEX idx_user_event (user_id, event_type, created_at)
);
```

---

## API Endpoints

### Base URL Structure

```
/api/v1/{module}/{resource}
```

### Authentication

All endpoints (except login/register) require Bearer token authentication:

```
Authorization: Bearer <access_token>
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
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

**Paginated Response:**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

### 1. Authentication Endpoints

#### POST /auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user-001",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "sc_manager",
      "serviceCenterId": "sc-001"
    }
  }
}
```

#### POST /auth/refresh
**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST /auth/logout
**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

---

### 2. Service Centers Endpoints

#### GET /service-centers
**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by name, code, city
- `isActive` (optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "sc-001",
        "code": "SC001",
        "name": "Delhi Central Hub",
        "address": "123 Connaught Place",
        "city": "New Delhi",
        "state": "Delhi",
        "pincode": "110001",
        "phone": "+91-11-12345678",
        "email": "delhi@example.com",
        "gstNumber": "07AAACH1234R1Z5",
        "isActive": true
      }
    ],
    "pagination": { ... }
  }
}
```

#### GET /service-centers/:id
#### POST /service-centers
#### PUT /service-centers/:id
#### DELETE /service-centers/:id

---

### 3. Users Endpoints

#### GET /users
**Query Parameters:**
- `role` (optional): Filter by role
- `serviceCenterId` (optional): Filter by service center
- `isActive` (optional): Filter by active status

#### GET /users/:id
#### POST /users
#### PUT /users/:id
#### DELETE /users/:id

---

### 4. Customers Endpoints

#### GET /customers
**Query Parameters:**
- `page`, `limit`, `search`
- `customerType` (optional): B2C or B2B
- `serviceCenterId` (optional): Filter by service center

#### GET /customers/search
**Query Parameters:**
- `query`: Search query
- `type`: Search type (phone, name, customerNumber, email, vin, vehicleNumber, auto)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cust-001",
      "customerNumber": "CUST-2025-01-0001",
      "name": "Rajesh Kumar",
      "phone": "9876543210",
      "whatsappNumber": "9876543210",
      "email": "rajesh@example.com",
      "address": "123 Main Street",
      "cityState": "Pune, Maharashtra",
      "pincode": "411001",
      "customerType": "B2C",
      "totalVehicles": 1,
      "vehicles": [ ... ]
    }
  ]
}
```

#### GET /customers/recent
**Query Parameters:**
- `limit` (optional): Number of recent customers (default: 10)

#### GET /customers/:id
#### POST /customers
**Request:**
```json
{
  "name": "Rajesh Kumar",
  "phone": "9876543210",
  "whatsappNumber": "9876543210",
  "email": "rajesh@example.com",
  "address": "123 Main Street",
  "cityState": "Pune, Maharashtra",
  "pincode": "411001",
  "customerType": "B2C",
  "serviceType": "walk-in",
  "serviceCenterId": "sc-001"
}
```

#### PUT /customers/:id
#### DELETE /customers/:id

---

### 5. Vehicles Endpoints

#### GET /vehicles
**Query Parameters:**
- `customerId` (optional): Filter by customer
- `serviceCenterId` (optional): Filter by service center
- `status` (optional): Available or Active Job Card

#### GET /vehicles/search
**Query Parameters:**
- `query`: Search query
- `type`: Search type (phone, registration, vin)

#### GET /vehicles/:id
#### POST /vehicles
**Request:**
```json
{
  "customerId": "cust-001",
  "registration": "MH-12-AB-1234",
  "vin": "TATA1234567890123",
  "vehicleMake": "Tata",
  "vehicleModel": "Nexon EV Max",
  "vehicleYear": 2023,
  "vehicleColor": "Blue",
  "variantBatteryCapacity": "40.5 kWh",
  "purchaseDate": "2023-06-15",
  "warrantyStatus": "Active"
}
```

#### PUT /vehicles/:id
#### DELETE /vehicles/:id

---

### 6. Appointments Endpoints

#### GET /appointments
**Query Parameters:**
- `serviceCenterId` (optional): Filter by service center
- `status` (optional): Filter by status
- `date` (optional): Filter by date
- `customerId` (optional): Filter by customer

#### GET /appointments/:id
#### POST /appointments
**Request:**
```json
{
  "customerId": "cust-001",
  "vehicleId": "veh-001",
  "serviceCenterId": "sc-001",
  "serviceType": "Routine Maintenance",
  "appointmentDate": "2025-01-20",
  "appointmentTime": "10:00:00",
  "duration": "2 hours",
  "status": "Confirmed",
  "customerComplaintIssue": "Vehicle making unusual noise",
  "location": "Station",
  "estimatedCost": "₹3,500",
  "estimatedTime": "2 hours"
}
```

#### PUT /appointments/:id
#### PATCH /appointments/:id/arrival
**Request:**
```json
{
  "arrivalMode": "vehicle_present",
  "checkInNotes": "Vehicle checked in"
}
```

#### DELETE /appointments/:id

---

### 7. Service Intake Requests Endpoints

#### GET /service-intake-requests
#### GET /service-intake-requests/pending
#### GET /service-intake-requests/:id
#### POST /service-intake-requests
**Request:**
```json
{
  "appointmentId": "appt-001",
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
    "customerIdProof": { "urls": [] },
    "vehicleRCCopy": { "urls": [] },
    "warrantyCardServiceBook": { "urls": [] },
    "photosVideos": { "urls": [] }
  }
}
```

#### POST /service-intake-requests/:id/approve
#### POST /service-intake-requests/:id/reject
**Request:**
```json
{
  "rejectionReason": "Incomplete documentation"
}
```

---

### 8. Quotations Endpoints

#### GET /quotations
**Query Parameters:**
- `status` (optional): Filter by status
- `serviceCenterId` (optional): Filter by service center
- `customerId` (optional): Filter by customer
- `search` (optional): Search by quotation number, customer name

#### GET /quotations/pending
#### GET /quotations/:id
#### POST /quotations
**Request:**
```json
{
  "customerId": "cust-001",
  "vehicleId": "veh-001",
  "serviceCenterId": "sc-001",
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

#### POST /quotations/:id/from-appointment
#### PATCH /quotations/:id/status
**Request:**
```json
{
  "status": "sent_to_customer",
  "reason": "Optional reason"
}
```

#### POST /quotations/:id/approve
**Request:**
```json
{
  "managerId": "user-002",
  "notes": "Approved for job card creation"
}
```

#### POST /quotations/:id/reject
**Request:**
```json
{
  "managerId": "user-002",
  "rejectionReason": "Cost estimate too high"
}
```

#### POST /quotations/:id/whatsapp

---

### 9. Job Cards Endpoints

#### GET /job-cards
**Query Parameters:**
- `status` (optional): Filter by status
- `serviceCenterId` (optional): Filter by service center
- `assignedEngineer` (optional): Filter by assigned engineer
- `customerId` (optional): Filter by customer

#### GET /job-cards/pending
#### GET /job-cards/:id
#### POST /job-cards
**Request:**
```json
{
  "serviceCenterId": "sc-001",
  "customerId": "cust-001",
  "vehicleId": "veh-001",
  "quotationId": "qtn-001",
  "serviceType": "Routine Maintenance",
  "description": "Regular service",
  "priority": "Normal",
  "location": "Station",
  "part1": {
    "fullName": "Rajesh Kumar",
    "mobilePrimary": "9876543210",
    "customerType": "B2C",
    "vehicleBrand": "Tata",
    "vehicleModel": "Nexon EV Max",
    "registrationNumber": "MH-12-AB-1234",
    "vinChassisNumber": "TATA1234567890123",
    "customerFeedback": "Vehicle making unusual noise"
  },
  "part2": [
    {
      "srNo": 1,
      "partName": "Engine Oil",
      "partCode": "EO-001",
      "qty": 2,
      "amount": 3000,
      "itemType": "part"
    }
  ]
}
```

#### POST /job-cards/:id/from-quotation
**Request:**
```json
{
  "engineerId": "user-003"
}
```

#### PATCH /job-cards/:id/assign-engineer
**Request:**
```json
{
  "engineerId": "user-003",
  "engineerName": "Technician Name"
}
```

#### POST /job-cards/:id/approve
#### POST /job-cards/:id/reject
#### PATCH /job-cards/:id/status
**Request:**
```json
{
  "status": "In Progress"
}
```

#### POST /job-cards/:id/complete

---

### 10. Inventory Endpoints

#### GET /inventory
**Query Parameters:**
- `serviceCenterId` (optional): Filter by service center
- `status` (optional): Filter by stock status
- `search` (optional): Search by part name, part number

#### GET /inventory/:id
#### POST /inventory
#### PUT /inventory/:id
#### DELETE /inventory/:id

---

### 11. Parts Master Endpoints

#### GET /parts-master
**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search by part name, part number

#### GET /parts-master/:id
#### POST /parts-master
#### PUT /parts-master/:id
#### DELETE /parts-master/:id

---

### 12. Parts Orders Endpoints

#### GET /parts-orders
#### GET /parts-orders/:id
#### POST /parts-orders
**Request:**
```json
{
  "serviceCenterId": "sc-001",
  "partId": "part-001",
  "requiredQty": 10,
  "urgency": "high",
  "notes": "Urgent requirement"
}
```

#### PATCH /parts-orders/:id/status
**Request:**
```json
{
  "status": "ordered"
}
```

---

### 13. Parts Issues Endpoints

#### GET /parts-issues
**Query Parameters:**
- `jobCardId` (optional): Filter by job card
- `status` (optional): Filter by status

#### GET /parts-issues/:id
#### POST /parts-issues
**Request:**
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

#### PATCH /parts-issues/:id/issue
#### PATCH /parts-issues/:id/reject

---

### 14. Invoices Endpoints

#### GET /invoices
**Query Parameters:**
- `serviceCenterId` (optional): Filter by service center
- `customerId` (optional): Filter by customer
- `paymentStatus` (optional): Filter by payment status
- `dateFrom`, `dateTo` (optional): Date range filter

#### GET /invoices/:id
#### POST /invoices
**Request:**
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

#### PATCH /invoices/:id/payment
**Request:**
```json
{
  "paymentMethod": "UPI",
  "paidAmount": 3540,
  "paymentDate": "2025-01-20"
}
```

#### POST /invoices/:id/send

---

### 15. Leads Endpoints

#### GET /leads
**Query Parameters:**
- `status` (optional): Filter by status
- `serviceCenterId` (optional): Filter by service center
- `assignedTo` (optional): Filter by assigned user

#### GET /leads/:id
#### POST /leads
#### PUT /leads/:id
#### POST /leads/:id/convert
**Request:**
```json
{
  "convertTo": "appointment",
  "targetId": "appointment-id"
}
```

---

### 16. Complaints Endpoints

#### GET /complaints
#### GET /complaints/:id
#### POST /complaints
#### PUT /complaints/:id
#### PATCH /complaints/:id/resolve
**Request:**
```json
{
  "resolution": "Issue resolved by replacing faulty part",
  "status": "resolved"
}
```

---

### 17. Approvals Endpoints

See `APPROVALS_BACKEND_SCHEMA.md` for complete approvals API documentation.

#### GET /approvals/summary
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

## Data Relationships

### Entity Relationship Diagram

```
service_centers (1) ──< (N) users
service_centers (1) ──< 