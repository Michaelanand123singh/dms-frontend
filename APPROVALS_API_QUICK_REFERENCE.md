# Approvals API - Quick Reference Guide

## Base URL
```
/api/v1/approvals
```

## Authentication
All endpoints require:
```
Authorization: Bearer <token>
```

---

## Endpoint Summary

### Quotation Approvals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quotations/pending` | Get pending quotation approvals |
| GET | `/quotations/{id}` | Get quotation details |
| POST | `/quotations/{id}/approve` | Approve quotation |
| POST | `/quotations/{id}/reject` | Reject quotation |

### Service Intake Request Approvals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/service-intake-requests/pending` | Get pending service intake requests |
| GET | `/service-intake-requests/{id}` | Get service intake request details |
| POST | `/service-intake-requests/{id}/approve` | Approve service intake request |
| POST | `/service-intake-requests/{id}/reject` | Reject service intake request |

### Job Card Approvals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/job-cards/pending` | Get pending job card approvals |
| GET | `/job-cards/{id}` | Get job card details |
| POST | `/job-cards/{id}/approve` | Approve job card |
| POST | `/job-cards/{id}/reject` | Reject job card |

### Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/summary` | Get all pending approvals count |

---

## Request/Response Examples

### 1. Get Pending Quotations

**Request:**
```http
GET /api/v1/approvals/quotations/pending?serviceCenterId=sc-001&page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quotations": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### 2. Approve Quotation

**Request:**
```http
POST /api/v1/approvals/quotations/QT-001/approve
Authorization: Bearer <token>
Content-Type: application/json

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
    "managerApprovedAt": "2025-01-15T11:00:00Z"
  }
}
```

### 3. Reject Service Intake Request

**Request:**
```http
POST /api/v1/approvals/service-intake-requests/SIR-001/reject
Authorization: Bearer <token>
Content-Type: application/json

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
    "rejectionReason": "Incomplete documentation"
  }
}
```

### 4. Get Summary

**Request:**
```http
GET /api/v1/approvals/summary?serviceCenterId=sc-001
Authorization: Bearer <token>
```

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

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (already approved/rejected) |
| 500 | Internal Server Error |

---

## Query Parameters

### Common Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `serviceCenterId` | string | Filter by service center | `sc-001` |
| `page` | number | Page number | `1` |
| `limit` | number | Items per page | `20` |
| `search` | string | Search query | `"John Doe"` |
| `status` | string | Filter by status | `pending` |
| `fromDate` | date | Filter from date | `2025-01-01` |
| `toDate` | date | Filter to date | `2025-01-31` |

---

## Validation Rules

### Quotation Approval
- ✅ Status must be `sent_to_manager`
- ✅ `managerId` is required
- ✅ Quotation must exist

### Service Intake Request Approval
- ✅ Status must be `pending`
- ✅ `managerId` is required
- ✅ Request must exist

### Job Card Approval
- ✅ `submittedToManager` must be `true`
- ✅ Status must be `Created`
- ✅ `managerId` is required
- ✅ Job card must exist

### Rejection
- ✅ `rejectionReason` is required (min 10 characters)
- ✅ `managerId` is required

---

## Error Responses

### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "managerId": ["Manager ID is required"],
      "rejectionReason": ["Rejection reason must be at least 10 characters"]
    }
  }
}
```

### Already Approved
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_APPROVED",
    "message": "This quotation has already been approved",
    "details": {
      "approvedAt": "2025-01-15T10:00:00Z",
      "approvedBy": "user-002"
    }
  }
}
```

### Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Quotation not found",
    "details": {
      "id": "QT-999"
    }
  }
}
```

---

## Database Status Values

### Quotation Status
- `draft`
- `sent_to_customer`
- `customer_approved`
- `customer_rejected`
- `sent_to_manager` ⭐ (pending approval)
- `manager_approved`
- `manager_rejected`
- `no_response_lead`
- `manager_quote`

### Service Intake Request Status
- `pending` ⭐ (pending approval)
- `approved`
- `rejected`

### Job Card Status
- `Created` ⭐ (can be pending approval)
- `Assigned`
- `In Progress`
- `Parts Pending`
- `Completed`
- `Invoiced`

**Note:** Job cards with `submittedToManager: true` and `status: "Created"` are pending approval.

---

## Implementation Checklist

### Backend Implementation

- [ ] Create database tables (see `APPROVALS_BACKEND_SCHEMA.md`)
- [ ] Implement repository layer for each entity
- [ ] Implement service layer with business logic
- [ ] Implement controller layer with API endpoints
- [ ] Add authentication middleware
- [ ] Add authorization checks (manager role, service center access)
- [ ] Implement validation
- [ ] Add error handling
- [ ] Implement pagination
- [ ] Add search functionality
- [ ] Implement filtering
- [ ] Add audit logging
- [ ] Implement notifications
- [ ] Add database indexes
- [ ] Write unit tests
- [ ] Write integration tests

### Frontend Integration

- [ ] Create API service functions
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Implement real-time updates (WebSocket/polling)
- [ ] Add search functionality
- [ ] Implement filters
- [ ] Add pagination UI
- [ ] Create approval/rejection modals
- [ ] Add success/error notifications
- [ ] Implement service center filtering

---

## Testing Examples

### cURL Examples

#### Get Pending Quotations
```bash
curl -X GET \
  'https://api.example.com/api/v1/approvals/quotations/pending?serviceCenterId=sc-001' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

#### Approve Quotation
```bash
curl -X POST \
  'https://api.example.com/api/v1/approvals/quotations/QT-001/approve' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "managerId": "user-002",
    "notes": "Approved"
  }'
```

#### Reject Job Card
```bash
curl -X POST \
  'https://api.example.com/api/v1/approvals/job-cards/JC-001/reject' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "managerId": "user-002",
    "rejectionReason": "Missing required parts information"
  }'
```

---

## Performance Considerations

1. **Indexes:** Ensure indexes on:
   - `status` + `service_center_id`
   - `submitted_to_manager` + `status`
   - `created_at` for sorting

2. **Caching:** Cache pending counts for dashboard (TTL: 30 seconds)

3. **Pagination:** Default limit: 20, max: 100

4. **Query Optimization:** Use eager loading for related data

5. **Rate Limiting:** 100 requests per minute per user

---

## Security Considerations

1. **Authentication:** All endpoints require valid JWT token
2. **Authorization:** Verify user has manager role
3. **Service Center Access:** Users can only access their assigned service centers
4. **Input Validation:** Sanitize all inputs
5. **SQL Injection:** Use parameterized queries
6. **XSS Protection:** Escape output data
7. **Audit Trail:** Log all approval actions

---

## Notification Triggers

| Action | Recipients |
|--------|------------|
| Quotation Approved | Service Advisor, Customer (if applicable) |
| Quotation Rejected | Service Advisor |
| Service Intake Approved | Service Advisor, Customer |
| Service Intake Rejected | Service Advisor |
| Job Card Approved | Service Advisor |
| Job Card Rejected | Service Advisor |

---

## Related Documentation

- `APPROVALS_BACKEND_SCHEMA.md` - Complete database schema
- `APPROVALS_WORKFLOW_DIAGRAM.md` - Workflow diagrams
- Main API documentation for other endpoints




