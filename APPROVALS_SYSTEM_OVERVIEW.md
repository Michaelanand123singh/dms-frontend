# Approvals System - Complete Overview

## Introduction

This document provides a complete overview of the Approvals System for the DMS (Dealership Management System). The system manages three types of approval workflows that require manager intervention before proceeding with service operations.

---

## System Components

### 1. **Quotation Approvals**
Service advisors create quotations for customers. Quotations exceeding certain thresholds or requiring special authorization must be approved by managers before being sent to customers.

**Key Features:**
- Manager reviews quotation details, items, and pricing
- Manager can approve or reject with reason
- Approved quotations can be sent to customers
- Customer approval triggers job card creation

### 2. **Service Intake Request Approvals**
When service advisors complete service intake forms from appointments, these requests may require manager approval before proceeding with service.

**Key Features:**
- Manager reviews complete service intake information
- Includes vehicle details, customer complaints, documentation
- Approval allows service to proceed
- Rejection requires reason for service advisor feedback

### 3. **Job Card Approvals**
Service advisors create job cards with parts and work items. These job cards require manager approval before technicians can be assigned.

**Key Features:**
- Manager reviews job card details (Part 1, Part 2, Part 2A, Part 3)
- Includes customer information, vehicle details, parts list
- Approval enables technician assignment
- Rejection requires reason for correction

---

## Documentation Structure

This system is documented across multiple files:

### 1. **APPROVALS_BACKEND_SCHEMA.md**
Complete database schema and API documentation including:
- All database tables with full column definitions
- Foreign key relationships
- Indexes for performance
- Complete API endpoint specifications
- Request/response formats
- Error handling
- Business rules

**Use this for:** Database design, API implementation, backend development

### 2. **APPROVALS_WORKFLOW_DIAGRAM.md**
Visual representations of approval workflows including:
- Sequence diagrams for each approval type
- State transition diagrams
- Data flow diagrams
- Decision trees
- Notification flows

**Use this for:** Understanding business logic, system design, frontend development

### 3. **APPROVALS_API_QUICK_REFERENCE.md**
Quick reference guide for API implementation including:
- Endpoint summary table
- Request/response examples
- Status codes
- Query parameters
- Validation rules
- Testing examples
- Implementation checklist

**Use this for:** Quick API lookup, testing, integration

### 4. **APPROVALS_SYSTEM_OVERVIEW.md** (This file)
High-level overview and navigation guide

**Use this for:** Getting started, understanding the big picture

---

## Key Entities

### Quotation
- Represents a cost estimate for service
- Contains line items with parts and labor
- Has approval workflow: Manager → Customer
- Links to customer, vehicle, service center

### Service Intake Request
- Created from appointment service intake form
- Contains vehicle information, service details, documentation
- Single approval stage: Manager
- Links to appointment, service center

### Job Card
- Represents a service job
- Structured in parts: Part 1 (Customer/Vehicle), Part 2 (Parts/Work), Part 2A (Warranty), Part 3 (Requisition)
- Single approval stage: Manager
- Links to customer, vehicle, quotation, service center

---

## Approval Workflow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    APPROVAL WORKFLOWS                       │
└─────────────────────────────────────────────────────────────┘

1. QUOTATION APPROVAL
   Service Advisor → Manager → Customer
   Status: draft → sent_to_manager → manager_approved → sent_to_customer → customer_approved

2. SERVICE INTAKE REQUEST APPROVAL
   Service Advisor → Manager
   Status: pending → approved/rejected

3. JOB CARD APPROVAL
   Service Advisor → Manager → Technician Assignment
   Status: Created (submittedToManager: true) → Created (submittedToManager: false) → Assigned
```

---

## Database Tables Overview

### Core Tables
1. **quotations** - Main quotation records
2. **quotation_items** - Line items in quotations
3. **service_intake_requests** - Service intake request records
4. **service_intake_forms** - Detailed form data
5. **service_intake_documentation** - Uploaded files
6. **job_cards** - Main job card records
7. **job_card_part1** - Customer & vehicle information
8. **job_card_part2** - Parts & work items
9. **job_card_part2a** - Warranty/insurance details
10. **job_card_part3** - Part requisition details

### Related Tables (Referenced)
- **service_centers** - Service center information
- **customers** - Customer information
- **vehicles** - Vehicle information
- **users** - User accounts (managers, advisors, technicians)
- **appointments** - Appointment records
- **insurers** - Insurance company information

---

## API Endpoints Overview

### Base Path
```
/api/v1/approvals
```

### Quotation Endpoints
- `GET /quotations/pending` - List pending quotations
- `GET /quotations/{id}` - Get quotation details
- `POST /quotations/{id}/approve` - Approve quotation
- `POST /quotations/{id}/reject` - Reject quotation

### Service Intake Request Endpoints
- `GET /service-intake-requests/pending` - List pending requests
- `GET /service-intake-requests/{id}` - Get request details
- `POST /service-intake-requests/{id}/approve` - Approve request
- `POST /service-intake-requests/{id}/reject` - Reject request

### Job Card Endpoints
- `GET /job-cards/pending` - List pending job cards
- `GET /job-cards/{id}` - Get job card details
- `POST /job-cards/{id}/approve` - Approve job card
- `POST /job-cards/{id}/reject` - Reject job card

### Summary Endpoint
- `GET /summary` - Get pending approvals count

---

## Key Business Rules

### 1. Quotation Approvals
- ✅ Only quotations with `status = 'sent_to_manager'` can be approved/rejected
- ✅ Manager approval is required before sending to customer
- ✅ Rejection requires a reason
- ✅ Approved quotations can create job cards

### 2. Service Intake Request Approvals
- ✅ Only requests with `status = 'pending'` can be approved/rejected
- ✅ Rejection requires a reason
- ✅ Approval allows service to proceed

### 3. Job Card Approvals
- ✅ Only job cards with `submittedToManager = true` and `status = 'Created'` can be approved/rejected
- ✅ Rejection requires a reason
- ✅ Approval enables technician assignment

### 4. Access Control
- ✅ Managers can only see approvals for their assigned service center(s)
- ✅ Super admins can see all approvals
- ✅ All actions require authentication

### 5. Audit Trail
- ✅ All approval/rejection actions are logged with:
  - User ID
  - Timestamp
  - Action type
  - Reason (if rejection)

---

## Implementation Phases

### Phase 1: Database Setup
1. Create all database tables
2. Set up foreign key relationships
3. Create indexes
4. Set up audit logging tables

### Phase 2: Backend API
1. Implement repository layer
2. Implement service layer with business logic
3. Implement controller layer
4. Add authentication/authorization
5. Add validation
6. Add error handling

### Phase 3: Frontend Integration
1. Create API service functions
2. Implement approval UI components
3. Add search and filtering
4. Add real-time updates
5. Add notifications

### Phase 4: Testing & Optimization
1. Unit tests
2. Integration tests
3. Performance optimization
4. Security audit

---

## Technology Stack Recommendations

### Backend
- **Framework:** Node.js/Express, Python/Django, Java/Spring Boot, or .NET Core
- **Database:** PostgreSQL or MySQL
- **ORM:** TypeORM, Sequelize, Prisma, or Django ORM
- **Authentication:** JWT tokens
- **File Storage:** AWS S3, Azure Blob Storage, or similar

### Frontend
- **Framework:** React (already in use)
- **State Management:** React Query or SWR for API calls
- **UI Components:** Tailwind CSS (already in use)
- **Real-time:** WebSocket or polling

---

## Security Considerations

1. **Authentication:** All endpoints require valid JWT token
2. **Authorization:** Role-based access control (Manager role required)
3. **Service Center Isolation:** Users can only access their assigned service centers
4. **Input Validation:** All inputs must be validated and sanitized
5. **SQL Injection Prevention:** Use parameterized queries
6. **XSS Protection:** Escape all output data
7. **Audit Logging:** Log all approval actions for compliance
8. **Rate Limiting:** Prevent abuse with rate limiting

---

## Performance Considerations

1. **Database Indexes:** Critical indexes on status, service_center_id, dates
2. **Pagination:** All list endpoints support pagination
3. **Caching:** Cache pending counts for dashboard
4. **Query Optimization:** Use eager loading for related data
5. **Connection Pooling:** Use connection pooling for database

---

## Notification Requirements

### Quotation Approvals
- **Approved:** Notify service advisor, notify customer (if applicable)
- **Rejected:** Notify service advisor with reason

### Service Intake Request Approvals
- **Approved:** Notify service advisor, notify customer
- **Rejected:** Notify service advisor with reason

### Job Card Approvals
- **Approved:** Notify service advisor
- **Rejected:** Notify service advisor with reason

**Notification Channels:** Email, SMS, WhatsApp, In-app notifications

---

## Testing Strategy

### Unit Tests
- Repository methods
- Service layer business logic
- Validation functions
- Utility functions

### Integration Tests
- API endpoint testing
- Database operations
- Authentication/authorization
- Workflow completion

### E2E Tests
- Complete approval workflows
- User interactions
- Notification delivery

---

## Monitoring & Logging

### Metrics to Track
- Pending approvals count
- Average approval time
- Approval/rejection ratio
- API response times
- Error rates

### Logs to Maintain
- All approval actions
- Authentication attempts
- API errors
- Database queries (in development)

---

## Future Enhancements

1. **Bulk Approvals:** Approve multiple items at once
2. **Approval Delegation:** Managers can delegate approvals
3. **Approval Rules Engine:** Automatic approval based on rules
4. **Mobile App:** Mobile notifications and approvals
5. **Analytics Dashboard:** Approval metrics and insights
6. **Workflow Customization:** Configurable approval workflows per service center

---

## Getting Started

### For Backend Developers
1. Read `APPROVALS_BACKEND_SCHEMA.md` for database design
2. Review `APPROVALS_WORKFLOW_DIAGRAM.md` for business logic
3. Use `APPROVALS_API_QUICK_REFERENCE.md` for API implementation
4. Set up database tables
5. Implement API endpoints
6. Add tests

### For Frontend Developers
1. Review `APPROVALS_WORKFLOW_DIAGRAM.md` for UI flow
2. Use `APPROVALS_API_QUICK_REFERENCE.md` for API integration
3. Review existing approvals page (`src/app/(service-center)/sc/approvals/page.tsx`)
4. Implement API service functions
5. Update UI components
6. Add real-time updates

### For Project Managers
1. Review this overview document
2. Understand the three approval workflows
3. Review business rules
4. Plan implementation phases
5. Set up monitoring

---

## Support & Questions

For questions or clarifications:
1. Review the detailed documentation files
2. Check the workflow diagrams
3. Review the existing frontend implementation
4. Consult with the development team

---

## Document Version

- **Version:** 1.0
- **Last Updated:** January 2025
- **Author:** DMS Development Team

---

## Related Documentation

- Frontend Implementation: `src/app/(service-center)/sc/approvals/page.tsx`
- Type Definitions: `src/shared/types/quotation.types.ts`, `src/shared/types/job-card.types.ts`
- Service Center Context: `src/shared/lib/serviceCenter.ts`




