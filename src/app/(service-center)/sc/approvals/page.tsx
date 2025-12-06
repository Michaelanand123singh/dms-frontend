"use client";
import { useState, useEffect, useMemo } from "react";
import { CheckCircle, XCircle, Clock, Eye, UserCheck, FileText, ShieldCheck, ShieldX, X, Car, User, Phone, Calendar, Wrench, AlertCircle, Search, ClipboardList } from "lucide-react";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import type { Quotation } from "@/shared/types";
import type { JobCard } from "@/shared/types/job-card.types";
import { getServiceCenterContext, filterByServiceCenter, shouldFilterByServiceCenter } from "@/shared/lib/serviceCenter";

// Service Intake Request types (matching appointments page)
interface DocumentationFiles {
  files: File[];
  urls: string[];
}

interface ServiceIntakeForm {
  customerIdProof: DocumentationFiles;
  vehicleRCCopy: DocumentationFiles;
  warrantyCardServiceBook: DocumentationFiles;
  photosVideos: DocumentationFiles;
  vehicleBrand: string;
  vehicleModel: string;
  registrationNumber: string;
  vinChassisNumber: string;
  variantBatteryCapacity: string;
  motorNumber: string;
  chargerSerialNumber: string;
  dateOfPurchase: string;
  warrantyStatus: string;
  insuranceStartDate: string;
  insuranceEndDate: string;
  insuranceCompanyName: string;
  serviceType: string;
  customerComplaintIssue: string;
  previousServiceHistory: string;
  estimatedServiceTime: string;
  estimatedCost: string;
  odometerReading: string;
  estimatedDeliveryDate: string;
  assignedServiceAdvisor: string;
  assignedTechnician: string;
  pickupDropRequired: boolean;
  pickupAddress: string;
  dropAddress: string;
  preferredCommunicationMode: "Phone" | "Email" | "SMS" | "WhatsApp" | "";
  paymentMethod: "Cash" | "Card" | "UPI" | "Online" | "Cheque" | "";
  gstRequirement: boolean;
  businessNameForInvoice: string;
  jobCardId?: string;
  arrivalMode?: "vehicle_present" | "vehicle_absent" | "";
  checkInNotes?: string;
  checkInSlipNumber?: string;
  checkInDate?: string;
  checkInTime?: string;
}

interface AppointmentRecord {
  id: number;
  customerName: string;
  vehicle: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  status: string;
  [key: string]: any;
}

interface ServiceIntakeRequest {
  id: string;
  appointmentId: number;
  appointment: AppointmentRecord;
  serviceIntakeForm: ServiceIntakeForm;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  submittedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  serviceCenterId?: number | string;
  serviceCenterName?: string;
}

export default function Approvals() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [serviceIntakeRequests, setServiceIntakeRequests] = useState<ServiceIntakeRequest[]>([]);
  const [jobCardApprovals, setJobCardApprovals] = useState<JobCard[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceIntakeRequest | null>(null);
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showJobCardModal, setShowJobCardModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Service center context for filtering
  const serviceCenterContext = useMemo(() => getServiceCenterContext(), []);
  const shouldFilter = shouldFilterByServiceCenter(serviceCenterContext);

  // Load quotations and service intake requests from localStorage
  useEffect(() => {
    const loadData = () => {
      // Load quotations
      const storedQuotations = safeStorage.getItem<Quotation[]>("quotations", []);
      let pendingApprovals = storedQuotations.filter(
        (q) => q.status === "sent_to_manager"
      );
      
      // Filter by service center if needed
      if (shouldFilter) {
        pendingApprovals = filterByServiceCenter(pendingApprovals, serviceCenterContext);
      }
      
      setQuotations(pendingApprovals);
      
      // Load service intake requests
      const storedRequests = safeStorage.getItem<ServiceIntakeRequest[]>("serviceIntakeRequests", []);
      let pendingRequests = storedRequests.filter(
        (r) => r.status === "pending"
      );
      
      // Filter by service center if needed
      if (shouldFilter) {
        pendingRequests = filterByServiceCenter(pendingRequests, serviceCenterContext);
      }
      
      setServiceIntakeRequests(pendingRequests);
      
      // Load job cards submitted to manager
      let storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
      
      // Check if we have any pending job card approvals
      const hasPendingApprovals = storedJobCards.some(jc => jc.submittedToManager === true && jc.status === "Created");
      
      // Initialize mock job card approvals if none exist (for testing)
      if (!hasPendingApprovals) {
        // Get service center info - use actual service center from context or default to first one
        // Service centers: 1="Delhi Central Hub" (sc-001), 2="Mumbai Metroplex" (sc-002), 3="Bangalore Innovation Center" (sc-003)
        let serviceCenterId: string;
        let serviceCenterCode: string;
        let serviceCenterName: string;
        
        if (serviceCenterContext.serviceCenterId) {
          const contextId = String(serviceCenterContext.serviceCenterId);
          // Map numeric IDs to sc-xxx format
          if (contextId === "1" || contextId === "sc-001") {
            serviceCenterId = "sc-001";
            serviceCenterCode = "SC001";
            serviceCenterName = serviceCenterContext.serviceCenterName || "Delhi Central Hub";
          } else if (contextId === "2" || contextId === "sc-002") {
            serviceCenterId = "sc-002";
            serviceCenterCode = "SC002";
            serviceCenterName = serviceCenterContext.serviceCenterName || "Mumbai Metroplex";
          } else if (contextId === "3" || contextId === "sc-003") {
            serviceCenterId = "sc-003";
            serviceCenterCode = "SC003";
            serviceCenterName = serviceCenterContext.serviceCenterName || "Bangalore Innovation Center";
          } else {
            // Default to first service center
            serviceCenterId = "sc-001";
            serviceCenterCode = "SC001";
            serviceCenterName = "Delhi Central Hub";
          }
        } else {
          // Default to first service center
          serviceCenterId = "sc-001";
          serviceCenterCode = "SC001";
          serviceCenterName = "Delhi Central Hub";
        }
        
        const mockJobCardApprovals: JobCard[] = [
          {
            id: "JC-APPROVAL-001",
            jobCardNumber: `${serviceCenterCode}-202501-APPROVAL-001`,
            serviceCenterId: serviceCenterId,
            serviceCenterCode: serviceCenterCode,
            serviceCenterName: serviceCenterName,
            customerId: "cust-mock-001",
            customerName: "Rajesh Kumar",
            vehicleId: "veh-mock-001",
            vehicle: "Tata Nexon EV Max",
            registration: "MH-12-AB-1234",
            vehicleMake: "Tata",
            vehicleModel: "Nexon EV Max",
            customerType: "B2C",
            serviceType: "Routine Maintenance",
            description: "Regular service - oil change, filter replacement, battery check",
            status: "Created",
            priority: "Normal",
            assignedEngineer: null,
            estimatedCost: "₹3,500",
            estimatedTime: "2 hours",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toLocaleString(), // 1 hour ago
            parts: ["Engine Oil", "Air Filter", "Battery Check"],
            location: "Station",
            submittedToManager: true,
            submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            part1: {
              fullName: "Rajesh Kumar",
              mobilePrimary: "9876543210",
              customerType: "B2C",
              vehicleBrand: "Tata",
              vehicleModel: "Nexon EV Max",
              registrationNumber: "MH-12-AB-1234",
              vinChassisNumber: "TATA1234567890123",
              variantBatteryCapacity: "40.5 kWh",
              warrantyStatus: "Active",
              estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              customerAddress: "123 Main Street, Pune, Maharashtra 411001",
              jobCardNumber: `${serviceCenterCode}-202501-APPROVAL-001`,
              customerFeedback: "Vehicle making unusual noise, needs inspection",
              technicianObservation: "",
              insuranceStartDate: "",
              insuranceEndDate: "",
              insuranceCompanyName: "",
              batterySerialNumber: "",
              mcuSerialNumber: "",
              vcuSerialNumber: "",
              otherPartSerialNumber: "",
            },
            part2: [
              {
                srNo: 1,
                partWarrantyTag: "Engine Oil Change",
                partName: "Engine Oil",
                partCode: "EO-001",
                qty: 1,
                amount: 1500,
                technician: "",
                labourCode: "Auto Select With Part",
                itemType: "part",
              },
              {
                srNo: 2,
                partWarrantyTag: "Air Filter Replacement",
                partName: "Air Filter",
                partCode: "AF-002",
                qty: 1,
                amount: 800,
                technician: "",
                labourCode: "Auto Select With Part",
                itemType: "part",
              },
            ],
          },
          {
            id: "JC-APPROVAL-002",
            jobCardNumber: `${serviceCenterCode}-202501-APPROVAL-002`,
            serviceCenterId: serviceCenterId,
            serviceCenterCode: serviceCenterCode,
            serviceCenterName: serviceCenterName,
            customerId: "cust-mock-002",
            customerName: "Priya Sharma",
            vehicleId: "veh-mock-002",
            vehicle: "Honda City VX",
            registration: "MH-12-CD-5678",
            vehicleMake: "Honda",
            vehicleModel: "City VX",
            customerType: "B2C",
            serviceType: "Repair",
            description: "Brake pads replacement - front and rear, brake fluid top-up",
            status: "Created",
            priority: "High",
            assignedEngineer: null,
            estimatedCost: "₹4,200",
            estimatedTime: "3 hours",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(), // 2 hours ago
            parts: ["Brake Pads Front", "Brake Pads Rear", "Brake Fluid"],
            location: "Station",
            submittedToManager: true,
            submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            part1: {
              fullName: "Priya Sharma",
              mobilePrimary: "9876543211",
              customerType: "B2C",
              vehicleBrand: "Honda",
              vehicleModel: "City VX",
              registrationNumber: "MH-12-CD-5678",
              vinChassisNumber: "HONDA9876543210987",
              variantBatteryCapacity: "N/A",
              warrantyStatus: "Active",
              estimatedDeliveryDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split("T")[0],
              customerAddress: "456 Park Avenue, Pune, Maharashtra 411002",
              jobCardNumber: `${serviceCenterCode}-202501-APPROVAL-002`,
              customerFeedback: "Brake pedal feels soft, needs immediate attention",
              technicianObservation: "",
              insuranceStartDate: "",
              insuranceEndDate: "",
              insuranceCompanyName: "",
              batterySerialNumber: "",
              mcuSerialNumber: "",
              vcuSerialNumber: "",
              otherPartSerialNumber: "",
            },
            part2: [
              {
                srNo: 1,
                partWarrantyTag: "Front Brake Pads",
                partName: "Brake Pads Front",
                partCode: "BP-F-001",
                qty: 1,
                amount: 2500,
                technician: "",
                labourCode: "Auto Select With Part",
                itemType: "part",
              },
              {
                srNo: 2,
                partWarrantyTag: "Rear Brake Pads",
                partName: "Brake Pads Rear",
                partCode: "BP-R-001",
                qty: 1,
                amount: 1500,
                technician: "",
                labourCode: "Auto Select With Part",
                itemType: "part",
              },
              {
                srNo: 3,
                partWarrantyTag: "Brake Fluid",
                partName: "Brake Fluid",
                partCode: "BF-001",
                qty: 1,
                amount: 200,
                technician: "",
                labourCode: "Auto Select With Part",
                itemType: "part",
              },
            ],
          },
        ];
        
        // Add mock approvals if they don't exist
        const existingIds = new Set(storedJobCards.map(jc => jc.id));
        const newApprovals = mockJobCardApprovals.filter(jc => !existingIds.has(jc.id));
        if (newApprovals.length > 0) {
          storedJobCards = [...storedJobCards, ...newApprovals];
          safeStorage.setItem("jobCards", storedJobCards);
        }
      }
      
      // Reload from localStorage to ensure we have the latest data
      storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
      
      let pendingJobCards = storedJobCards.filter(
        (jc) => jc.submittedToManager === true && jc.status === "Created"
      );
      
      // Filter by service center if needed
      if (shouldFilter) {
        pendingJobCards = filterByServiceCenter(pendingJobCards, serviceCenterContext);
      }
      
      setJobCardApprovals(pendingJobCards);
    };

    loadData();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorageChange);
    // Also check periodically for same-tab updates
    const interval = setInterval(loadData, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [shouldFilter, serviceCenterContext]);
  
  // Filter requests and quotations by search query
  const filteredServiceIntakeRequests = useMemo(() => {
    if (!searchQuery.trim()) return serviceIntakeRequests;
    
    const query = searchQuery.toLowerCase();
    return serviceIntakeRequests.filter((request) => {
      const customerName = request.appointment.customerName?.toLowerCase() || "";
      const vehicle = request.appointment.vehicle?.toLowerCase() || "";
      const phone = request.appointment.phone?.toLowerCase() || "";
      const serviceType = request.serviceIntakeForm.serviceType?.toLowerCase() || request.appointment.serviceType?.toLowerCase() || "";
      const complaint = request.serviceIntakeForm.customerComplaintIssue?.toLowerCase() || request.appointment.customerComplaintIssue?.toLowerCase() || "";
      const requestId = request.id?.toLowerCase() || "";
      
      return customerName.includes(query) || 
             vehicle.includes(query) || 
             phone.includes(query) || 
             serviceType.includes(query) || 
             complaint.includes(query) ||
             requestId.includes(query);
    });
  }, [serviceIntakeRequests, searchQuery]);
  
  const filteredQuotations = useMemo(() => {
    if (!searchQuery.trim()) return quotations;
    
    const query = searchQuery.toLowerCase();
    return quotations.filter((quotation) => {
      const customerName = `${quotation.customer?.firstName || ""} ${quotation.customer?.lastName || ""}`.toLowerCase();
      const vehicle = `${quotation.vehicle?.make || ""} ${quotation.vehicle?.model || ""}`.toLowerCase();
      const quotationNumber = quotation.quotationNumber?.toLowerCase() || "";
      
      return customerName.includes(query) || 
             vehicle.includes(query) || 
             quotationNumber.includes(query);
    });
  }, [quotations, searchQuery]);
  
  const filteredJobCardApprovals = useMemo(() => {
    if (!searchQuery.trim()) return jobCardApprovals;
    
    const query = searchQuery.toLowerCase();
    return jobCardApprovals.filter((jobCard) => {
      const customerName = jobCard.customerName?.toLowerCase() || "";
      const vehicle = jobCard.vehicle?.toLowerCase() || "";
      const registration = jobCard.registration?.toLowerCase() || "";
      const jobCardNumber = jobCard.jobCardNumber?.toLowerCase() || jobCard.id?.toLowerCase() || "";
      const serviceType = jobCard.serviceType?.toLowerCase() || "";
      const description = jobCard.description?.toLowerCase() || "";
      
      return customerName.includes(query) || 
             vehicle.includes(query) || 
             registration.includes(query) ||
             jobCardNumber.includes(query) ||
             serviceType.includes(query) ||
             description.includes(query);
    });
  }, [jobCardApprovals, searchQuery]);

  const handleApprove = (quotationId: string): void => {
    if (!confirm("Approve this quotation? This will allow job card creation.")) {
      return;
    }

    const updatedQuotations = quotations.map((q) =>
      q.id === quotationId
        ? {
            ...q,
            status: "manager_approved" as const,
            managerApproved: true,
            managerApprovedAt: new Date().toISOString(),
          }
        : q
    );

    // Update all quotations in localStorage
    const allQuotations = safeStorage.getItem<Quotation[]>("quotations", []);
    const updatedAllQuotations = allQuotations.map((q) =>
      q.id === quotationId
        ? {
            ...q,
            status: "manager_approved" as const,
            managerApproved: true,
            managerApprovedAt: new Date().toISOString(),
          }
        : q
    );
    safeStorage.setItem("quotations", updatedAllQuotations);
    setQuotations(updatedQuotations.filter((q) => q.status === "sent_to_manager"));
    alert("Quotation approved by manager!");
  };

  const handleReject = (quotationId: string): void => {
    if (!confirm("Reject this quotation? This will notify the service advisor.")) {
      return;
    }

    const updatedQuotations = quotations.map((q) =>
      q.id === quotationId
        ? {
            ...q,
            status: "manager_rejected" as const,
            managerRejected: true,
            managerRejectedAt: new Date().toISOString(),
          }
        : q
    );

    // Update all quotations in localStorage
    const allQuotations = safeStorage.getItem<Quotation[]>("quotations", []);
    const updatedAllQuotations = allQuotations.map((q) =>
      q.id === quotationId
        ? {
            ...q,
            status: "manager_rejected" as const,
            managerRejected: true,
            managerRejectedAt: new Date().toISOString(),
          }
        : q
    );
    safeStorage.setItem("quotations", updatedAllQuotations);
    setQuotations(updatedQuotations.filter((q) => q.status === "sent_to_manager"));
    alert("Quotation rejected!");
  };

  const handleApproveServiceIntake = (requestId: string): void => {
    if (!confirm("Approve this service intake request?")) {
      return;
    }

    const allRequests = safeStorage.getItem<ServiceIntakeRequest[]>("serviceIntakeRequests", []);
    const updatedRequests = allRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "approved" as const,
            approvedAt: new Date().toISOString(),
            approvedBy: "Service Manager",
          }
        : r
    );
    safeStorage.setItem("serviceIntakeRequests", updatedRequests);
    setServiceIntakeRequests(updatedRequests.filter((r) => r.status === "pending"));
    setShowRequestModal(false);
    setSelectedRequest(null);
    alert("Service intake request approved!");
  };

  const handleRejectServiceIntake = (requestId: string): void => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) {
      return;
    }

    const allRequests = safeStorage.getItem<ServiceIntakeRequest[]>("serviceIntakeRequests", []);
    const updatedRequests = allRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "rejected" as const,
            rejectedAt: new Date().toISOString(),
            rejectedBy: "Service Manager",
            rejectionReason: reason,
          }
        : r
    );
    safeStorage.setItem("serviceIntakeRequests", updatedRequests);
    setServiceIntakeRequests(updatedRequests.filter((r) => r.status === "pending"));
    setShowRequestModal(false);
    setSelectedRequest(null);
    alert("Service intake request rejected!");
  };

  const handleApproveJobCard = (jobCardId: string): void => {
    if (!confirm("Approve this job card? This will allow technician assignment and parts monitoring.")) {
      return;
    }

    const allJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
    const updatedJobCards = allJobCards.map((jc) =>
      jc.id === jobCardId
        ? {
            ...jc,
            submittedToManager: false,
            status: "Created" as const,
            // Job card is approved and ready for technician assignment
          }
        : jc
    );
    safeStorage.setItem("jobCards", updatedJobCards);
    setJobCardApprovals(updatedJobCards.filter((jc) => jc.submittedToManager === true && jc.status === "Created"));
    setShowJobCardModal(false);
    setSelectedJobCard(null);
    alert("Job card approved! You can now assign a technician.");
  };

  const handleRejectJobCard = (jobCardId: string): void => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) {
      return;
    }

    const allJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
    const updatedJobCards = allJobCards.map((jc) =>
      jc.id === jobCardId
        ? {
            ...jc,
            submittedToManager: false,
            status: "Created" as const,
            // In production, you might want to add a rejectionReason field
          }
        : jc
    );
    safeStorage.setItem("jobCards", updatedJobCards);
    setJobCardApprovals(updatedJobCards.filter((jc) => jc.submittedToManager === true && jc.status === "Created"));
    setShowJobCardModal(false);
    setSelectedJobCard(null);
    alert(`Job card rejected. Reason: ${reason}`);
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Approvals</h1>
          <p className="text-gray-500">Review and approve pending requests</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by customer name, vehicle, phone, service type, or request ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Job Card Approvals Section */}
          {filteredJobCardApprovals.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Job Card Approvals {filteredJobCardApprovals.length > 0 && `(${filteredJobCardApprovals.length})`}
              </h2>
              <div className="space-y-4">
                {filteredJobCardApprovals.map((jobCard) => (
                  <div key={jobCard.id} className="bg-white rounded-2xl shadow-md p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <ClipboardList className="text-indigo-600" size={20} />
                          <span className="font-semibold text-lg">{jobCard.jobCardNumber || jobCard.id}</span>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            Pending Approval
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-gray-700">
                            <span className="font-semibold">Customer:</span> {jobCard.customerName}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-semibold">Vehicle:</span> {jobCard.vehicle} {jobCard.registration && `(${jobCard.registration})`}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-semibold">Service Type:</span> {jobCard.serviceType}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-semibold">Description:</span> {jobCard.description || "N/A"}
                          </p>
                          {jobCard.parts && jobCard.parts.length > 0 && (
                            <p className="text-gray-700">
                              <span className="font-semibold">Required Parts:</span> {jobCard.parts.join(", ")}
                            </p>
                          )}
                          {jobCard.estimatedCost && (
                            <p className="text-gray-700">
                              <span className="font-semibold">Estimated Cost:</span>{" "}
                              <span className="text-green-600 font-bold">{jobCard.estimatedCost}</span>
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Submitted: {jobCard.submittedAt ? new Date(jobCard.submittedAt).toLocaleString("en-IN") : "N/A"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setSelectedJobCard(jobCard);
                            setShowJobCardModal(true);
                          }}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                        >
                          <Eye size={18} />
                          View Details
                        </button>
                        <button
                          onClick={() => handleApproveJobCard(jobCard.id)}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-medium"
                        >
                          <ShieldCheck size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectJobCard(jobCard.id)}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium"
                        >
                          <ShieldX size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Intake Requests Section */}
          {filteredServiceIntakeRequests.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Service Intake Requests {filteredServiceIntakeRequests.length > 0 && `(${filteredServiceIntakeRequests.length})`}
              </h2>
              <div className="space-y-4">
                {filteredServiceIntakeRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-2xl shadow-md p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Wrench className="text-purple-600" size={20} />
                          <span className="font-semibold text-lg">Service Intake Request</span>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            Pending Approval
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-gray-700">
                            <span className="font-semibold">Customer:</span> {request.appointment.customerName}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-semibold">Vehicle:</span> {request.appointment.vehicle}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-semibold">Service Type:</span> {request.serviceIntakeForm.serviceType || request.appointment.serviceType}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-semibold">Complaint:</span> {request.serviceIntakeForm.customerComplaintIssue || request.appointment.customerComplaintIssue || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Submitted: {new Date(request.submittedAt).toLocaleString("en-IN")}
                            {request.submittedBy && ` by ${request.submittedBy}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRequestModal(true);
                          }}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                        >
                          <Eye size={18} />
                          View Details
                        </button>
                        <button
                          onClick={() => handleApproveServiceIntake(request.id)}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-medium"
                        >
                          <ShieldCheck size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectServiceIntake(request.id)}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium"
                        >
                          <ShieldX size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quotations Section */}
          <div className={filteredServiceIntakeRequests.length > 0 ? "mt-8" : ""}>
            {filteredServiceIntakeRequests.length > 0 && (
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Quotation Approvals {filteredQuotations.length > 0 && `(${filteredQuotations.length})`}
              </h2>
            )}
            {filteredQuotations.length === 0 && filteredServiceIntakeRequests.length === 0 && filteredJobCardApprovals.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Pending Approvals</h3>
                <p className="text-gray-500">
                  {searchQuery.trim() 
                    ? "No requests match your search criteria." 
                    : "There are no requests pending your approval at this time."}
                </p>
            </div>
            ) : filteredQuotations.length > 0 ? (
            filteredQuotations.map((quotation) => (
              <div key={quotation.id} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="text-blue-600" size={20} />
                      <span className="font-semibold text-lg">{quotation.quotationNumber}</span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Pending Approval
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-gray-700">
                        <span className="font-semibold">Customer:</span>{" "}
                        {quotation.customer?.firstName || ""} {quotation.customer?.lastName || ""}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Vehicle:</span>{" "}
                        {quotation.vehicle?.make || ""} {quotation.vehicle?.model || ""} ({quotation.vehicle?.registration || ""})
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Total Amount:</span>{" "}
                        <span className="text-green-600 font-bold">₹{quotation.totalAmount.toLocaleString("en-IN")}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Date: {new Date(quotation.quotationDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    {/* Customer Approval Status */}
                    {quotation.customerApproved && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <UserCheck className="text-green-600" size={18} />
                          <span className="font-semibold text-green-700">Approved by Customer</span>
                        </div>
                        {quotation.customerApprovedAt && (
                          <p className="text-sm text-green-600 ml-6">
                            Approved on: {new Date(quotation.customerApprovedAt).toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                    )}

                    {quotation.customerRejected && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="text-red-600" size={18} />
                          <span className="font-semibold text-red-700">Rejected by Customer</span>
                        </div>
                        {quotation.customerRejectedAt && (
                          <p className="text-sm text-red-600 ml-6">
                            Rejected on: {new Date(quotation.customerRejectedAt).toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleApprove(quotation.id)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-medium"
                    >
                      <ShieldCheck size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(quotation.id)}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium"
                    >
                      <ShieldX size={18} />
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        // Open quotation view modal or navigate to quotations page
                        window.location.href = `/sc/quotations?view=${quotation.id}`;
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                    >
                      <Eye size={18} />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
            ) : null}
          </div>
        </div>

        {/* Service Intake Request Detail Modal */}
        {showRequestModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Service Intake Request Details</h2>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedRequest(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Appointment Information */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="text-blue-600" size={20} />
                    Appointment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                      <p className="font-medium text-gray-800">{selectedRequest.appointment.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <p className="font-medium text-gray-800">{selectedRequest.appointment.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Vehicle</p>
                      <p className="font-medium text-gray-800">{selectedRequest.appointment.vehicle}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Appointment Date</p>
                      <p className="font-medium text-gray-800">{selectedRequest.appointment.date} at {selectedRequest.appointment.time}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Car className="text-blue-600" size={20} />
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Vehicle Brand</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.vehicleBrand || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Vehicle Model</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.vehicleModel || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Registration Number</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.registrationNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">VIN/Chassis Number</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.vinChassisNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Variant/Battery Capacity</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.variantBatteryCapacity || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Motor Number</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.motorNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Charger Serial Number</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.chargerSerialNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date of Purchase</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.dateOfPurchase || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Warranty Status</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.warrantyStatus || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Odometer Reading</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.odometerReading || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Wrench className="text-purple-600" size={20} />
                    Service Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Service Type</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.serviceType || selectedRequest.appointment.serviceType || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Customer Complaint/Issue</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.customerComplaintIssue || selectedRequest.appointment.customerComplaintIssue || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Previous Service History</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.previousServiceHistory || selectedRequest.appointment.previousServiceHistory || "N/A"}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Estimated Service Time</p>
                        <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.estimatedServiceTime || selectedRequest.appointment.estimatedServiceTime || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
                        <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.estimatedCost || selectedRequest.appointment.estimatedCost || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Estimated Delivery Date</p>
                        <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.estimatedDeliveryDate || selectedRequest.appointment.estimatedDeliveryDate || "N/A"}</p>
                      </div>
                    </div>
                    {selectedRequest.serviceIntakeForm.checkInNotes && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Check-in Notes</p>
                        <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.checkInNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Insurance Information */}
                {(selectedRequest.serviceIntakeForm.insuranceStartDate || selectedRequest.serviceIntakeForm.insuranceEndDate || selectedRequest.serviceIntakeForm.insuranceCompanyName) && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Insurance Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Insurance Company</p>
                        <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.insuranceCompanyName || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Start Date</p>
                        <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.insuranceStartDate || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">End Date</p>
                        <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.insuranceEndDate || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Operational Details */}
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Operational Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Assigned Service Advisor</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.assignedServiceAdvisor || selectedRequest.appointment.assignedServiceAdvisor || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Assigned Technician</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.assignedTechnician || selectedRequest.appointment.assignedTechnician || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pickup/Drop Required</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.pickupDropRequired || selectedRequest.appointment.pickupDropRequired ? "Yes" : "No"}</p>
                    </div>
                    {selectedRequest.serviceIntakeForm.pickupDropRequired && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Pickup Address</p>
                          <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.pickupAddress || selectedRequest.appointment.pickupAddress || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Drop Address</p>
                          <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.dropAddress || selectedRequest.appointment.dropAddress || "N/A"}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Preferred Communication</p>
                      <p className="font-medium text-gray-800">{selectedRequest.serviceIntakeForm.preferredCommunicationMode || selectedRequest.appointment.preferredCommunicationMode || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Documentation Status */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Documentation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Customer ID Proof</p>
                      <p className="font-medium text-gray-800">
                        {selectedRequest.serviceIntakeForm.customerIdProof?.files?.length > 0 
                          ? `${selectedRequest.serviceIntakeForm.customerIdProof.files.length} file(s)` 
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Vehicle RC Copy</p>
                      <p className="font-medium text-gray-800">
                        {selectedRequest.serviceIntakeForm.vehicleRCCopy?.files?.length > 0 
                          ? `${selectedRequest.serviceIntakeForm.vehicleRCCopy.files.length} file(s)` 
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Warranty Card/Service Book</p>
                      <p className="font-medium text-gray-800">
                        {selectedRequest.serviceIntakeForm.warrantyCardServiceBook?.files?.length > 0 
                          ? `${selectedRequest.serviceIntakeForm.warrantyCardServiceBook.files.length} file(s)` 
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Photos/Videos</p>
                      <p className="font-medium text-gray-800">
                        {selectedRequest.serviceIntakeForm.photosVideos?.files?.length > 0 
                          ? `${selectedRequest.serviceIntakeForm.photosVideos.files.length} file(s)` 
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedRequest(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleRejectServiceIntake(selectedRequest.id)}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <ShieldX size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveServiceIntake(selectedRequest.id)}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={18} />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Job Card Approval Detail Modal */}
        {showJobCardModal && selectedJobCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Job Card Approval Details</h2>
                <button
                  onClick={() => {
                    setShowJobCardModal(false);
                    setSelectedJobCard(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Job Card Information */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ClipboardList className="text-indigo-600" size={20} />
                    Job Card Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Job Card Number</p>
                      <p className="font-medium text-gray-800">{selectedJobCard.jobCardNumber || selectedJobCard.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Status</p>
                      <p className="font-medium text-gray-800">{selectedJobCard.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Priority</p>
                      <p className="font-medium text-gray-800">{selectedJobCard.priority}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Service Center</p>
                      <p className="font-medium text-gray-800">{selectedJobCard.serviceCenterName || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Customer & Vehicle Information */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="text-blue-600" size={20} />
                    Customer & Vehicle Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                      <p className="font-medium text-gray-800">{selectedJobCard.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Customer Type</p>
                      <p className="font-medium text-gray-800">{selectedJobCard.customerType || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Vehicle</p>
                      <p className="font-medium text-gray-800">{selectedJobCard.vehicle}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Registration</p>
                      <p className="font-medium text-gray-800">{selectedJobCard.registration || "N/A"}</p>
                    </div>
                    {selectedJobCard.part1 && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">VIN/Chassis Number</p>
                          <p className="font-medium text-gray-800">{selectedJobCard.part1.vinChassisNumber || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Variant/Battery Capacity</p>
                          <p className="font-medium text-gray-800">{selectedJobCard.part1.variantBatteryCapacity || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Warranty Status</p>
                          <p className="font-medium text-gray-800">{selectedJobCard.part1.warrantyStatus || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Customer Address</p>
                          <p className="font-medium text-gray-800">{selectedJobCard.part1.customerAddress || "N/A"}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Service Details */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Wrench className="text-purple-600" size={20} />
                    Service Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Service Type</p>
                      <p className="font-medium text-gray-800">{selectedJobCard.serviceType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="font-medium text-gray-800">{selectedJobCard.description || "N/A"}</p>
                    </div>
                    {selectedJobCard.part1 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Customer Feedback</p>
                        <p className="font-medium text-gray-800">{selectedJobCard.part1.customerFeedback || "N/A"}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
                        <p className="font-medium text-gray-800">{selectedJobCard.estimatedCost || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Estimated Time</p>
                        <p className="font-medium text-gray-800">{selectedJobCard.estimatedTime || "N/A"}</p>
                      </div>
                      {selectedJobCard.part1 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Estimated Delivery Date</p>
                          <p className="font-medium text-gray-800">{selectedJobCard.part1.estimatedDeliveryDate || "N/A"}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parts & Work Items */}
                {selectedJobCard.part2 && selectedJobCard.part2.length > 0 && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Parts & Work Items</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Sr No</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Part/Work Item</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Part Code</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Qty</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedJobCard.part2.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm text-gray-800">{item.srNo}</td>
                              <td className="px-4 py-2 text-sm text-gray-800">{item.partName}</td>
                              <td className="px-4 py-2 text-sm text-gray-800">{item.partCode || "N/A"}</td>
                              <td className="px-4 py-2 text-sm text-center text-gray-800">{item.qty}</td>
                              <td className="px-4 py-2 text-sm text-right text-gray-800">₹{item.amount.toLocaleString("en-IN")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Required Parts (Legacy) */}
                {selectedJobCard.parts && selectedJobCard.parts.length > 0 && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Required Parts</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJobCard.parts.map((part, idx) => (
                        <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowJobCardModal(false);
                      setSelectedJobCard(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleRejectJobCard(selectedJobCard.id)}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <ShieldX size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveJobCard(selectedJobCard.id)}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={18} />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

