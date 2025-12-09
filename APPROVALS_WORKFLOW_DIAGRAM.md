# Approvals System - Workflow Diagrams

## Overview

This document provides visual representations of the three approval workflows in the system.

---

## 1. Quotation Approval Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUOTATION APPROVAL WORKFLOW                   │
└─────────────────────────────────────────────────────────────────┘

Service Advisor                    Manager                    Customer
     │                               │                           │
     │ 1. Create Quotation           │                           │
     │    (status: draft)            │                           │
     ├───────────────────────────────>│                           │
     │                               │                           │
     │ 2. Send to Manager            │                           │
     │    (status: sent_to_manager)  │                           │
     ├───────────────────────────────>│                           │
     │                               │                           │
     │                               │ 3. Review Quotation        │
     │                               │    (GET /quotations/pending)│
     │                               │                           │
     │                               │ 4a. Approve               │
     │                               │    (POST /approve)         │
     │                               │    status: manager_approved│
     │<──────────────────────────────┤                           │
     │                               │                           │
     │                               │ 4b. Reject                │
     │                               │    (POST /reject)          │
     │                               │    status: manager_rejected│
     │<──────────────────────────────┤                           │
     │                               │                           │
     │ 5. If Approved:               │                           │
     │    Send to Customer            │                           │
     │    (status: sent_to_customer) │                           │
     ├───────────────────────────────────────────────────────────>│
     │                               │                           │
     │                               │                           6. Customer Reviews
     │                               │                           │
     │                               │                           7a. Customer Approves
     │                               │                              (status: customer_approved)
     │<───────────────────────────────────────────────────────────┤
     │                               │                           │
     │                               │                           7b. Customer Rejects
     │                               │                              (status: customer_rejected)
     │<───────────────────────────────────────────────────────────┤
     │                               │                           │
     │ 8. Create Job Card            │                           │
     │    (if customer approved)      │                           │
     │                               │                           │
```

### Quotation States

```
┌─────────┐
│  draft  │
└────┬────┘
     │
     │ send_to_manager
     ▼
┌──────────────────┐
│ sent_to_manager  │◄─── PENDING APPROVAL
└────┬─────────────┘
     │
     ├─── approve ────► ┌──────────────────┐
     │                   │ manager_approved  │
     │                   └────┬──────────────┘
     │                        │
     │                        │ send_to_customer
     │                        ▼
     │                   ┌──────────────────┐
     │                   │ sent_to_customer │
     │                   └────┬──────────────┘
     │                        │
     │                        ├─── approve ────► ┌──────────────────┐
     │                        │                  │ customer_approved │
     │                        │                  └───────────────────┘
     │                        │
     │                        └─── reject ────► ┌──────────────────┐
     │                                           │ customer_rejected │
     │                                           └───────────────────┘
     │
     └─── reject ────► ┌──────────────────┐
                       │ manager_rejected  │
                       └───────────────────┘
```

---

## 2. Service Intake Request Approval Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│              SERVICE INTAKE REQUEST APPROVAL WORKFLOW            │
└─────────────────────────────────────────────────────────────────┘

Service Advisor                    Manager                    Customer
     │                               │                           │
     │ 1. Create Appointment         │                           │
     │                               │                           │
     │ 2. Fill Service Intake Form   │                           │
     │    - Vehicle Information       │                           │
     │    - Service Details          │                           │
     │    - Documentation            │                           │
     │                               │                           │
     │ 3. Submit to Manager           │                           │
     │    (status: pending)           │                           │
     ├───────────────────────────────>│                           │
     │                               │                           │
     │                               │ 4. Review Request         │
     │                               │    (GET /service-intake-  │
     │                               │     requests/pending)      │
     │                               │                           │
     │                               │ 5a. Approve               │
     │                               │    (POST /approve)        │
     │                               │    status: approved       │
     │<───────────────────────────────┤                           │
     │                               │                           │
     │                               │ 5b. Reject                │
     │                               │    (POST /reject)         │
     │                               │    status: rejected       │
     │                               │    (with reason)          │
     │<───────────────────────────────┤                           │
     │                               │                           │
     │ 6. If Approved:                │                           │
     │    - Create Job Card          │                           │
     │    - Proceed with Service      │                           │
     │                               │                           │
```

### Service Intake Request States

```
┌──────────┐
│ pending  │◄─── PENDING APPROVAL
└────┬─────┘
     │
     ├─── approve ────► ┌───────────┐
     │                  │ approved  │
     │                  └───────────┘
     │
     └─── reject ────► ┌───────────┐
                       │ rejected  │
                       └───────────┘
```

---

## 3. Job Card Approval Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                   JOB CARD APPROVAL WORKFLOW                    │
└─────────────────────────────────────────────────────────────────┘

Service Advisor                    Manager                    Technician
     │                               │                           │
     │ 1. Create Job Card            │                           │
     │    (status: Created)          │                           │
     │    (submittedToManager: false)│                           │
     │                               │                           │
     │ 2. Fill Job Card Details      │                           │
     │    - Part 1: Customer & Vehicle│                         │
     │    - Part 2: Parts & Work Items│                         │
     │    - Part 2A: Warranty/Insurance (if applicable)│         │
     │                               │                           │
     │ 3. Submit to Manager          │                           │
     │    (submittedToManager: true) │                           │
     ├───────────────────────────────>│                           │
     │                               │                           │
     │                               │ 4. Review Job Card        │
     │                               │    (GET /job-cards/pending)│
     │                               │                           │
     │                               │ 5a. Approve               │
     │                               │    (POST /approve)        │
     │                               │    submittedToManager: false│
     │<───────────────────────────────┤                           │
     │                               │                           │
     │                               │ 5b. Reject                │
     │                               │    (POST /reject)         │
     │                               │    submittedToManager: false│
     │                               │    (with reason)          │
     │<───────────────────────────────┤                           │
     │                               │                           │
     │ 6. If Approved:                │                           │
     │    Assign Technician          │                           │
     │    (status: Assigned)          │                           │
     ├───────────────────────────────────────────────────────────>│
     │                               │                           │
     │                               │                           7. Technician Starts Work
     │                               │                              (status: In Progress)
     │                               │                           │
     │                               │                           8. Complete Work
     │                               │                              (status: Completed)
     │                               │                           │
```

### Job Card States

```
┌─────────────────────────────────────────────────────────────┐
│                    JOB CARD STATES                           │
└─────────────────────────────────────────────────────────────┘

┌──────────┐
│ Created  │
│ (submittedToManager: false)                                  │
└────┬─────┘
     │
     │ submit_to_manager
     ▼
┌──────────────────────────────────┐
│ Created                          │◄─── PENDING APPROVAL
│ (submittedToManager: true)        │
└────┬─────────────────────────────┘
     │
     ├─── approve ────► ┌───────────┐
     │                  │ Created   │
     │                  │ (submittedToManager: false)│
     │                  └────┬──────┘
     │                       │
     │                       │ assign_technician
     │                       ▼
     │                  ┌───────────┐
     │                  │ Assigned  │
     │                  └────┬──────┘
     │                       │
     │                       │ start_work
     │                       ▼
     │                  ┌──────────────┐
     │                  │ In Progress  │
     │                  └────┬─────────┘
     │                       │
     │                       │ complete_work
     │                       ▼
     │                  ┌───────────┐
     │                  │ Completed │
     │                  └───────────┘
     │
     └─── reject ────► ┌───────────┐
                       │ Created   │
                       │ (submittedToManager: false)│
                       │ (with rejection reason)   │
                       └───────────┘
```

---

## 4. Combined Approval Dashboard Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPROVALS DASHBOARD                          │
└─────────────────────────────────────────────────────────────────┘

Manager Login
     │
     ▼
┌─────────────────────┐
│ Approvals Dashboard │
│                     │
│ ┌─────────────────┐ │
│ │ Quotations      │ │───► GET /approvals/quotations/pending
│ │ Pending: 5       │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Service Intake  │ │───► GET /approvals/service-intake-requests/pending
│ │ Pending: 3       │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Job Cards       │ │───► GET /approvals/job-cards/pending
│ │ Pending: 2       │ │
│ └─────────────────┘ │
│                     │
│ Total Pending: 10   │
└─────────────────────┘
     │
     ├─── View Quotation Details ────► GET /quotations/{id}
     │
     ├─── View Service Intake Details ────► GET /service-intake-requests/{id}
     │
     ├─── View Job Card Details ────► GET /job-cards/{id}
     │
     ├─── Approve/Reject ────► POST /{resource}/{id}/approve or /reject
     │
     └─── Search & Filter ────► Query parameters on list endpoints
```

---

## 5. Data Flow Diagram

```
┌──────────────┐
│   Frontend   │
│  (React App) │
└──────┬───────┘
       │
       │ HTTP Requests
       │ (REST API)
       ▼
┌─────────────────────────────────────┐
│         Backend API Layer           │
│  ┌──────────────────────────────┐   │
│  │  Approvals Controller       │   │
│  │  - Quotation Approvals      │   │
│  │  - Service Intake Approvals │   │
│  │  - Job Card Approvals       │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│  ┌──────────▼──────────────────┐   │
│  │  Business Logic Layer       │   │
│  │  - Validation               │   │
│  │  - Workflow Management       │   │
│  │  - Notification Service      │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│  ┌──────────▼──────────────────┐   │
│  │  Data Access Layer          │   │
│  │  - Repository Pattern       │   │
│  │  - Query Builders           │   │
│  └──────────┬──────────────────┘   │
└─────────────┼───────────────────────┘
              │
              │ SQL Queries
              ▼
┌─────────────────────────────────────┐
│         Database Layer               │
│  ┌──────────────────────────────┐   │
│  │  - quotations               │   │
│  │  - quotation_items           │   │
│  │  - service_intake_requests   │   │
│  │  - service_intake_forms      │   │
│  │  - service_intake_documentation│ │
│  │  - job_cards                 │   │
│  │  - job_card_part1             │   │
│  │  - job_card_part2             │   │
│  │  - job_card_part2a            │   │
│  │  - job_card_part3             │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
              │
              │ File Storage
              ▼
┌─────────────────────────────────────┐
│      File Storage Service           │
│  (S3 / Azure Blob / etc.)           │
│  - Documentation files               │
│  - Photos/Videos                    │
└─────────────────────────────────────┘
```

---

## 6. Approval Decision Tree

```
                    Approval Request Received
                            │
                            ▼
                    ┌───────────────┐
                    │ Check Status  │
                    └───────┬───────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
    Already Approved   Already Rejected   Pending
            │               │               │
            ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │ Return    │   │ Return    │   │ Proceed   │
    │ Error     │   │ Error     │   │ with      │
    └───────────┘   └───────────┘   │ Approval  │
                                    └─────┬─────┘
                                          │
                          ┌───────────────┼───────────────┐
                          │               │               │
                    Manager Action    Validate User    Check Permissions
                          │               │               │
                          ▼               ▼               ▼
                    ┌───────────┐   ┌───────────┐   ┌───────────┐
                    │ Approve   │   │ Authorized│   │ Has Access│
                    │ or Reject │   │ User?     │   │ to SC?    │
                    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
                          │               │               │
                          └───────────────┼───────────────┘
                                          │
                                          ▼
                                  ┌───────────────┐
                                  │ Update Status │
                                  │ in Database   │
                                  └───────┬───────┘
                                          │
                                          ▼
                                  ┌───────────────┐
                                  │ Send          │
                                  │ Notifications │
                                  └───────┬───────┘
                                          │
                                          ▼
                                  ┌───────────────┐
                                  │ Return        │
                                  │ Success       │
                                  └───────────────┘
```

---

## 7. Notification Flow

```
                    Approval Action Taken
                            │
                            ▼
                    ┌───────────────┐
                    │ Determine     │
                    │ Recipients    │
                    └───────┬───────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
    Quotation         Service Intake    Job Card
    Approval          Approval          Approval
            │               │               │
            ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │ Notify     │   │ Notify     │   │ Notify     │
    │ Service    │   │ Service    │   │ Service    │
    │ Advisor    │   │ Advisor    │   │ Advisor    │
    │            │   │            │   │            │
    │ Notify     │   │ Notify     │   │            │
    │ Customer   │   │ Customer   │   │            │
    │ (if sent)  │   │            │   │            │
    └───────────┘   └───────────┘   └───────────┘
            │               │               │
            └───────────────┼───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Notification  │
                    │ Service       │
                    │ (Email/SMS/   │
                    │  WhatsApp)    │
                    └───────────────┘
```

---

## Key Points

1. **Quotation Approvals:**
   - Two-stage approval (Manager → Customer)
   - Manager approval is required before sending to customer
   - Customer approval triggers job card creation

2. **Service Intake Request Approvals:**
   - Single-stage approval (Manager only)
   - Approval allows service to proceed
   - Can create job card after approval

3. **Job Card Approvals:**
   - Single-stage approval (Manager only)
   - Approval enables technician assignment
   - Rejection requires reason for service advisor feedback

4. **Common Patterns:**
   - All approvals require manager authentication
   - All rejections require a reason
   - All approvals trigger notifications
   - Service center filtering applies to all queries




