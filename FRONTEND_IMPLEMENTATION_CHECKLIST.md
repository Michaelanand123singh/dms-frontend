# Frontend Implementation Checklist - Workflow Changes

Based on MOM - Workflow Discussion requirements

## ✅ COMPLETED

### 1. Quotation Types Updated
- ✅ Added `vehicleLocation?: "with_customer" | "at_workshop"` to Quotation interface
- ✅ Added approval workflow fields (sentToCustomer, customerApproved, managerApproved, etc.)
- ✅ Updated status types to include new workflow states
- ✅ Updated CreateQuotationForm to include vehicleLocation

### 2. Quotation Form - Vehicle Location Field
- ✅ Added Vehicle Location dropdown field (appears after vehicle selection)
- ✅ Options: "Vehicle with Customer" / "Vehicle at Workshop"
- ✅ Marked as required field

---

## 🔄 IN PROGRESS / TO COMPLETE

### 3. Quotation Approval Workflow UI

#### Status: Partially Implemented
- ✅ Added handler functions for approval workflow
- ⚠️ Need to update ViewQuotationModal to show approval buttons

#### Required Changes in `ViewQuotationModal`:

**Location:** `dms-frontend/src/app/(service-center)/sc/quotations/page.tsx`

**Replace the Action Buttons section (around line 1431-1447) with:**

```typescript
{/* Approval Status Display */}
<div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 no-print">
  <h3 className="text-sm font-semibold text-gray-700 mb-3">Approval Status</h3>
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      {quotation.sentToCustomer ? (
        <CheckCircle className="text-green-600" size={16} />
      ) : (
        <Clock className="text-gray-400" size={16} />
      )}
      <span className="text-sm text-gray-700">
        Sent to Customer: {quotation.sentToCustomer ? "Yes" : "No"}
        {quotation.sentToCustomerAt && ` (${new Date(quotation.sentToCustomerAt).toLocaleString()})`}
      </span>
    </div>
    {quotation.customerApproved !== undefined && (
      <div className="flex items-center gap-2">
        {quotation.customerApproved ? (
          <UserCheck className="text-green-600" size={16} />
        ) : (
          <UserX className="text-red-600" size={16} />
        )}
        <span className="text-sm text-gray-700">
          Customer: {quotation.customerApproved ? "Approved" : "Rejected"}
          {quotation.customerApprovedAt && ` (${new Date(quotation.customerApprovedAt).toLocaleString()})`}
        </span>
      </div>
    )}
    {quotation.sentToManager && (
      <div className="flex items-center gap-2">
        <ArrowRight className="text-blue-600" size={16} />
        <span className="text-sm text-gray-700">
          Sent to Manager: {quotation.sentToManagerAt && new Date(quotation.sentToManagerAt).toLocaleString()}
        </span>
      </div>
    )}
    {quotation.managerApproved !== undefined && (
      <div className="flex items-center gap-2">
        {quotation.managerApproved ? (
          <ShieldCheck className="text-green-600" size={16} />
        ) : (
          <ShieldX className="text-red-600" size={16} />
        )}
        <span className="text-sm text-gray-700">
          Manager: {quotation.managerApproved ? "Approved" : "Rejected"}
          {quotation.managerApprovedAt && ` (${new Date(quotation.managerApprovedAt).toLocaleString()})`}
        </span>
      </div>
    )}
  </div>
</div>

{/* Action Buttons */}
<div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end no-print">
  <button
    onClick={onClose}
    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
  >
    Close
  </button>
  
  {/* Service Advisor Actions */}
  {isServiceAdvisor && (
    <>
      {quotation.status === "draft" && (
        <button
          onClick={() => onSendToCustomer(quotation.id)}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium inline-flex items-center gap-2"
        >
          <MessageCircle size={18} />
          Send to Customer (WhatsApp)
        </button>
      )}
      {quotation.status === "sent_to_customer" && (
        <>
          <button
            onClick={() => onCustomerRejection(quotation.id)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium inline-flex items-center gap-2"
          >
            <UserX size={18} />
            Customer Rejected
          </button>
          <button
            onClick={() => onCustomerApproval(quotation.id)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium inline-flex items-center gap-2"
          >
            <UserCheck size={18} />
            Customer Approved
          </button>
        </>
      )}
      {quotation.status === "customer_approved" && (
        <button
          onClick={() => onSendToManager(quotation.id)}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium inline-flex items-center gap-2"
        >
          <ArrowRight size={18} />
          Send to Manager
        </button>
      )}
    </>
  )}

  {/* Service Manager Actions */}
  {isServiceManager && (
    <>
      {quotation.status === "sent_to_manager" && (
        <>
          <button
            onClick={() => onManagerRejection(quotation.id)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium inline-flex items-center gap-2"
          >
            <ShieldX size={18} />
            Reject
          </button>
          <button
            onClick={() => onManagerApproval(quotation.id)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium inline-flex items-center gap-2"
          >
            <ShieldCheck size={18} />
            Approve
          </button>
        </>
      )}
    </>
  )}
</div>
```

**Also update ViewQuotationModal function signature:**
```typescript
function ViewQuotationModal({ 
  quotation, 
  onClose, 
  onSendToCustomer,
  onCustomerApproval,
  onCustomerRejection,
  onSendToManager,
  onManagerApproval,
  onManagerRejection,
  userInfo,
  userRole,
  isServiceAdvisor,
  isServiceManager,
}: any) {
```

**Add Vehicle Location display in Customer & Vehicle Details section:**
```typescript
{quotation.vehicleLocation && (
  <div>
    <p className="text-sm font-semibold text-gray-700 mb-1">Vehicle Location</p>
    <p className="text-gray-900">
      {quotation.vehicleLocation === "with_customer" ? "Vehicle with Customer" : "Vehicle at Workshop"}
    </p>
  </div>
)}
```

---

## 📋 PENDING IMPLEMENTATION

### 4. Leads Management UI

**Create new page:** `dms-frontend/src/app/(service-center)/sc/leads/page.tsx`

**Features needed:**
- List of leads with status (new, in_discussion, converted, lost)
- Create new lead
- Convert lead to appointment/quotation
- Lead details modal
- Search and filter leads

**Lead Interface:**
```typescript
interface Lead {
  id: string;
  customerId?: string;
  customerName: string;
  phone: string;
  vehicleDetails?: string;
  inquiryType: string;
  status: "new" | "in_discussion" | "converted" | "lost";
  convertedTo?: "appointment" | "quotation";
  convertedId?: string;
  notes?: string;
  assignedTo?: string;
  serviceCenterId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 5. Job Card Creation UI

**Update:** `dms-frontend/src/app/(service-center)/sc/job-cards/page.tsx`

**Features needed:**
- Job card number generation (format: SC-YYYY-MM-####)
- Create job card from approved quotation
- Job card form with all required fields
- Technician assignment
- Multi-center support for job card numbering

**Job Card Interface updates:**
```typescript
interface JobCard {
  id: string;
  jobCardNumber: string; // Format: SC001-2025-11-0001
  serviceCenterId: string;
  customerId: string;
  vehicleId?: string;
  quotationId?: string;
  // ... other fields
}
```

### 6. Make Document Uploads Optional

**Files to update:**
- `dms-frontend/src/app/(service-center)/sc/appointments/page.tsx`
- `dms-frontend/src/app/(service-center)/sc/customer-find/page.tsx`

**Changes:**
- Remove `required` attribute from document upload fields
- Add "Required" indicator (optional badge)
- Update validation to not require documents

### 7. Check-in Slip Generation

**Create new component:** `dms-frontend/src/components/check-in-slip/CheckInSlip.tsx`

**Features:**
- Generate check-in slip PDF
- Print functionality
- Include customer, vehicle, and service center details
- Check-in timestamp

### 8. Remove "Service Request" Terminology

**Files to update:**
- All files found in grep search (17 files)
- Replace "Service Request" with "Appointment"
- Update menu items, labels, and UI text

**Key files:**
- `dms-frontend/src/config/menu.config.ts`
- `dms-frontend/src/app/(service-center)/sc/service-requests/page.tsx` (may need to redirect to appointments)
- `dms-frontend/src/shared/types/service-request.types.ts` (update or deprecate)

### 9. Update Status Badge Colors

**File:** `dms-frontend/src/app/(service-center)/sc/quotations/page.tsx`

**Update getStatusBadgeClass function to handle new statuses:**
```typescript
const getStatusBadgeClass = (status: QuotationStatus) => {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-700 border-gray-300";
    case "sent_to_customer":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "customer_approved":
      return "bg-green-100 text-green-700 border-green-300";
    case "customer_rejected":
      return "bg-red-100 text-red-700 border-red-300";
    case "sent_to_manager":
      return "bg-purple-100 text-purple-700 border-purple-300";
    case "manager_approved":
      return "bg-green-100 text-green-700 border-green-300";
    case "manager_rejected":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};
```

---

## 🎯 PRIORITY ORDER

1. **HIGH PRIORITY:**
   - Complete Quotation Approval Workflow UI (Update ViewQuotationModal)
   - Remove "Service Request" terminology
   - Make document uploads optional

2. **MEDIUM PRIORITY:**
   - Create Leads Management UI
   - Update Job Card Creation UI
   - Check-in Slip Generation

3. **LOW PRIORITY:**
   - Status badge color updates
   - UI polish and refinements

---

## 📝 NOTES

- All handler functions for approval workflow are already implemented
- Vehicle location field is already added to the form
- Need to ensure all imports are added (MessageCircle, UserCheck, UserX, Shield, ShieldCheck, ShieldX)
- WhatsApp sharing uses deep link: `https://wa.me/{phone}?text={message}`

---

**Last Updated:** Based on MOM - November 30, 2025

