"use client";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { useState, useEffect } from "react";
import {
  Search,
  PlusCircle,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  FileText,
  Calendar,
  User,
  Car,
  DollarSign,
  MapPin,
  Phone,
  X,
  Calculator,
  Send,
  Loader2,
} from "lucide-react";
import type { ServiceRequest, RequestStatus, Urgency, ServiceLocation } from "@/shared/types";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api.config";
import { defaultServiceRequests } from "@/__mocks__/data/service-requests.mock";

type FilterType = "all" | "pending" | "approved" | "rejected";

interface CreateServiceRequestForm {
  customerName: string;
  phone: string;
  vehicleId: string;
  vehicleRegistration: string;
  vehicleMake: string;
  vehicleModel: string;
  serviceType: string;
  description: string;
  location: ServiceLocation;
  homeAddress?: string;
  preferredDate: string;
  preferredTime: string;
  estimatedCost: string;
  urgency: Urgency;
}

interface RejectionReason {
  id: string;
  label: string;
}

const REJECTION_REASONS: RejectionReason[] = [
  { id: "parts_unavailable", label: "Parts not available" },
  { id: "out_of_area", label: "Out of serviceable area (home service)" },
  { id: "not_economical", label: "Not economical to repair" },
  { id: "capacity_full", label: "Capacity full (suggest alternative date)" },
  { id: "invalid_request", label: "Invalid service request" },
  { id: "other", label: "Other" },
];

const SERVICE_TYPES = [
  "Routine Maintenance",
  "Repair",
  "Inspection",
  "Warranty",
  "AC Service",
  "Battery Replacement",
  "Tire Service",
  "Other",
];

export default function ServiceRequests() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [showEstimateModal, setShowEstimateModal] = useState<boolean>(false);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [rejectionComments, setRejectionComments] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [estimatingRequestId, setEstimatingRequestId] = useState<string | null>(null);
  const [estimateAmount, setEstimateAmount] = useState<string>("");

  const [createForm, setCreateForm] = useState<CreateServiceRequestForm>({
    customerName: "",
    phone: "",
    vehicleId: "",
    vehicleRegistration: "",
    vehicleMake: "",
    vehicleModel: "",
    serviceType: "",
    description: "",
    location: "Station",
    homeAddress: "",
    preferredDate: "",
    preferredTime: "",
    estimatedCost: "",
    urgency: "Normal",
  });

  // Use mock data from __mocks__ folder
  const [requests, setRequests] = useState<ServiceRequest[]>(() => {
    if (typeof window !== "undefined") {
      const storedRequests = safeStorage.getItem<ServiceRequest[]>("serviceRequests", []);
      if (storedRequests.length > 0) {
        return storedRequests;
      }
    }
    return defaultServiceRequests;
  });

  // Filter and search requests
  const filteredRequests = requests.filter((req) => {
    // Status filter
    if (filter === "pending" && req.status !== "Pending Approval") return false;
    if (filter === "approved" && req.status !== "Approved") return false;
    if (filter === "rejected" && req.status !== "Rejected") return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        req.id.toLowerCase().includes(query) ||
        req.customerName.toLowerCase().includes(query) ||
        req.phone.includes(query) ||
        req.registration.toLowerCase().includes(query) ||
        req.vehicle.toLowerCase().includes(query) ||
        req.serviceType.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // API Functions - TODO: Implement when backend is ready
  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      // const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.SERVICE_REQUESTS}`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // const data = await response.json();
      // setRequests(data);
    } catch (error) {
      console.error("Error fetching service requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const createServiceRequest = async (formData: CreateServiceRequestForm) => {
    try {
      setLoading(true);
      // const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.SERVICE_REQUESTS}`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(formData),
      // });
      // const newRequest = await response.json();
      
      // For now, add to local state
      const newRequest: ServiceRequest = {
        id: `SR-2025-${String(requests.length + 1).padStart(3, "0")}`,
        customerName: formData.customerName,
        phone: formData.phone,
        vehicle: `${formData.vehicleMake} ${formData.vehicleModel}`,
        registration: formData.vehicleRegistration,
        serviceType: formData.serviceType,
        description: formData.description,
        location: formData.location,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        estimatedCost: formData.estimatedCost || "To be estimated",
        status: "Pending Approval",
        urgency: formData.urgency,
        createdAt: new Date().toLocaleString(),
        createdBy: "Current User", // TODO: Get from auth context
      };
      
      setRequests([newRequest, ...requests]);
      setShowCreateModal(false);
      resetCreateForm();
    } catch (error) {
      console.error("Error creating service request:", error);
      alert("Failed to create service request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const approveServiceRequest = async (id: string) => {
    try {
      setLoading(true);
      const request = requests.find((r) => r.id === id);
      if (!request) return;

      // TODO: When backend is ready, use this API call:
      // const response = await fetch(
      //   `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SERVICE_REQUEST(id)}/approve`,
      //   {
      //     method: "POST",
      //     headers: { Authorization: `Bearer ${token}` },
      //   }
      // );
      // const data = await response.json();
      // The backend should automatically create a job card on approval
      
      // For now, create job card manually in local state
      // In production, this should be done by the backend
      const jobCardData = {
        id: `JC-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
        customerName: request.customerName,
        vehicle: request.vehicle,
        registration: request.registration,
        serviceType: request.serviceType,
        description: request.description,
        status: "Created" as const,
        priority: request.urgency === "Critical" ? "Critical" as const : 
                 request.urgency === "High" ? "High" as const :
                 request.urgency === "Medium" ? "Normal" as const : "Normal" as const,
        assignedEngineer: null,
        estimatedCost: request.estimatedCost,
        estimatedTime: "To be determined",
        createdAt: new Date().toLocaleString(),
        parts: [],
        location: request.location,
      };

      // Store in localStorage to sync with job cards page
      // In production, this would be handled by the backend
      const existingJobCards = safeStorage.getItem<unknown[]>("jobCards", []);
      existingJobCards.push(jobCardData);
      safeStorage.setItem("jobCards", existingJobCards);
      
      // Update local state
      setRequests(
        requests.map((req) =>
          req.id === id ? { ...req, status: "Approved" as RequestStatus } : req
        )
      );
      setShowDetails(false);
      alert(`Service request approved! Job card ${jobCardData.id} has been created.`);
      
      // Optionally redirect to job cards page
      // window.location.href = "/sc/job-cards";
    } catch (error) {
      console.error("Error approving service request:", error);
      alert("Failed to approve service request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const rejectServiceRequest = async (id: string, reason: string, comments: string) => {
    try {
      setLoading(true);
      // const response = await fetch(
      //   `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SERVICE_REQUEST(id)}/reject`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //     },
      //     body: JSON.stringify({ reason, comments }),
      //   }
      // );
      
      // Update local state
      const reasonLabel = REJECTION_REASONS.find((r) => r.id === reason)?.label || reason;
      setRequests(
        requests.map((req) =>
          req.id === id
            ? {
                ...req,
                status: "Rejected" as RequestStatus,
                rejectionReason: `${reasonLabel}${comments ? `: ${comments}` : ""}`,
              }
            : req
        )
      );
      setShowRejectModal(false);
      setRejectingRequestId(null);
      setRejectionReason("");
      setRejectionComments("");
      setShowDetails(false);
    } catch (error) {
      console.error("Error rejecting service request:", error);
      alert("Failed to reject service request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addEstimate = async (id: string, amount: string) => {
    try {
      setLoading(true);
      // const response = await fetch(
      //   `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SERVICE_REQUEST(id)}/estimate`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //     },
      //     body: JSON.stringify({ estimatedCost: parseFloat(amount.replace(/[₹,]/g, "")) }),
      //   }
      // );
      
      // Update local state
      setRequests(
        requests.map((req) =>
          req.id === id ? { ...req, estimatedCost: `₹${parseFloat(amount.replace(/[₹,]/g, "")).toLocaleString("en-IN")}` } : req
        )
      );
      setShowEstimateModal(false);
      setEstimatingRequestId(null);
      setEstimateAmount("");
    } catch (error) {
      console.error("Error adding estimate:", error);
      alert("Failed to add estimate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      customerName: "",
      phone: "",
      vehicleId: "",
      vehicleRegistration: "",
      vehicleMake: "",
      vehicleModel: "",
      serviceType: "",
      description: "",
      location: "Station",
      homeAddress: "",
      preferredDate: "",
      preferredTime: "",
      estimatedCost: "",
      urgency: "Normal",
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.customerName || !createForm.phone || !createForm.serviceType) {
      alert("Please fill in all required fields.");
      return;
    }
    createServiceRequest(createForm);
  };

  const handleRejectClick = (id: string) => {
    setRejectingRequestId(id);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectingRequestId) return;
    if (!rejectionReason) {
      alert("Please select a rejection reason.");
      return;
    }
    rejectServiceRequest(rejectingRequestId, rejectionReason, rejectionComments);
  };

  const handleEstimateClick = (id: string) => {
    setEstimatingRequestId(id);
    setShowEstimateModal(true);
  };

  const handleEstimateSubmit = () => {
    if (!estimatingRequestId || !estimateAmount) {
      alert("Please enter an estimate amount.");
      return;
    }
    addEstimate(estimatingRequestId, estimateAmount);
  };


  const getStatusColor = (status: RequestStatus): string => {
    switch (status) {
      case "Pending Approval":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Approved":
        return "bg-green-100 text-green-700 border-green-300";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getUrgencyColor = (urgency: Urgency): string => {
    switch (urgency) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-orange-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Service Requests</h1>
            <p className="text-gray-500">Manage customer service requests and approvals</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Create Service Request
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by customer name, phone, registration, or request ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "pending", "approved", "rejected"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left Section */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {request.id}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                    <span
                      className={`w-3 h-3 rounded-full ${getUrgencyColor(
                        request.urgency
                      )}`}
                      title={request.urgency}
                    ></span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User size={18} className="text-gray-400" />
                      <span className="font-medium">{request.customerName}</span>
                      <span className="text-gray-500">• {request.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Car size={18} className="text-gray-400" />
                      <span>{request.vehicle}</span>
                      <span className="text-gray-500">• {request.registration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FileText size={18} className="text-gray-400" />
                      <span className="font-medium">{request.serviceType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={18} className="text-gray-400" />
                      <span>
                        {request.preferredDate} at {request.preferredTime}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-2">{request.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      Location: <span className="font-medium text-gray-700">{request.location}</span>
                    </span>
                    <span className="text-gray-500">
                      Estimated: <span className="font-medium text-gray-700">{request.estimatedCost}</span>
                    </span>
                    <span className="text-gray-500">
                      Created: <span className="font-medium text-gray-700">{request.createdAt}</span>
                    </span>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col gap-2 lg:items-end">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetails(true);
                      }}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition inline-flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                    {request.status === "Pending Approval" && (
                      <>
                        {request.estimatedCost === "To be estimated" && (
                          <button
                            onClick={() => handleEstimateClick(request.id)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition inline-flex items-center gap-2"
                          >
                            <Calculator size={16} />
                            Add Estimate
                          </button>
                        )}
                        <button
                          onClick={() => approveServiceRequest(request.id)}
                          disabled={loading}
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition inline-flex items-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(request.id)}
                          disabled={loading}
                          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition inline-flex items-center gap-2 disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Service Requests Found</h3>
            <p className="text-gray-500">No requests match the current filter criteria.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Service Request Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Request ID</p>
                  <p className="font-semibold">{selectedRequest.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">{selectedRequest.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-semibold">{selectedRequest.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{selectedRequest.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-semibold">{selectedRequest.vehicle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Registration</p>
                  <p className="font-semibold">{selectedRequest.registration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="font-semibold">{selectedRequest.serviceType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{selectedRequest.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Preferred Date</p>
                  <p className="font-semibold">{selectedRequest.preferredDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Preferred Time</p>
                  <p className="font-semibold">{selectedRequest.preferredTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Cost</p>
                  <p className="font-semibold text-green-600">{selectedRequest.estimatedCost}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Urgency</p>
                  <p className="font-semibold">{selectedRequest.urgency}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="bg-gray-50 p-3 rounded-lg">{selectedRequest.description}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Close
              </button>
              {selectedRequest.status === "Pending Approval" && (
                <>
                  {selectedRequest.estimatedCost === "To be estimated" && (
                    <button
                      onClick={() => {
                        setShowDetails(false);
                        handleEstimateClick(selectedRequest.id);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition inline-flex items-center gap-2"
                    >
                      <Calculator size={16} />
                      Add Estimate
                    </button>
                  )}
                  <button
                    onClick={() => {
                      approveServiceRequest(selectedRequest.id);
                    }}
                    disabled={loading}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      handleRejectClick(selectedRequest.id);
                    }}
                    disabled={loading}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                  >
                    Reject Request
                  </button>
                </>
              )}
              {selectedRequest.rejectionReason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-700">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Service Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create Service Request</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.customerName}
                    onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Registration
                  </label>
                  <input
                    type="text"
                    value={createForm.vehicleRegistration}
                    onChange={(e) => setCreateForm({ ...createForm, vehicleRegistration: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="PB10AB1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Make
                  </label>
                  <input
                    type="text"
                    value={createForm.vehicleMake}
                    onChange={(e) => setCreateForm({ ...createForm, vehicleMake: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Honda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    value={createForm.vehicleModel}
                    onChange={(e) => setCreateForm({ ...createForm, vehicleModel: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createForm.serviceType}
                    onChange={(e) => setCreateForm({ ...createForm, serviceType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select Service Type</option>
                    {SERVICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value as ServiceLocation })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="Station">Station</option>
                    <option value="Home Service">Home Service</option>
                  </select>
                </div>
                {createForm.location === "Home Service" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Home Address
                    </label>
                    <textarea
                      value={createForm.homeAddress}
                      onChange={(e) => setCreateForm({ ...createForm, homeAddress: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      rows={2}
                      placeholder="Enter complete address"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={createForm.preferredDate}
                    onChange={(e) => setCreateForm({ ...createForm, preferredDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    value={createForm.preferredTime}
                    onChange={(e) => setCreateForm({ ...createForm, preferredTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="text"
                    value={createForm.estimatedCost}
                    onChange={(e) => setCreateForm({ ...createForm, estimatedCost: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="3500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={createForm.urgency}
                    onChange={(e) => setCreateForm({ ...createForm, urgency: e.target.value as Urgency })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={4}
                  placeholder="Describe the service required..."
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      Create Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Request Modal */}
      {showRejectModal && rejectingRequestId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Reject Service Request</h2>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingRequestId(null);
                  setRejectionReason("");
                  setRejectionComments("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                >
                  <option value="">Select a reason</option>
                  {REJECTION_REASONS.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments
                </label>
                <textarea
                  value={rejectionComments}
                  onChange={(e) => setRejectionComments(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  rows={3}
                  placeholder="Add any additional comments..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingRequestId(null);
                  setRejectionReason("");
                  setRejectionComments("");
                }}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={loading || !rejectionReason}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    Reject Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Estimate Modal */}
      {showEstimateModal && estimatingRequestId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add Estimate</h2>
              <button
                onClick={() => {
                  setShowEstimateModal(false);
                  setEstimatingRequestId(null);
                  setEstimateAmount("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Cost (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={estimateAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setEstimateAmount(value);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="3500"
                  required
                />
                {estimateAmount && (
                  <p className="text-sm text-gray-500 mt-1">
                    ₹{parseFloat(estimateAmount || "0").toLocaleString("en-IN")}
                  </p>
                )}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> For repairs over ₹5,000, this request will be forwarded to Admin for approval.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowEstimateModal(false);
                  setEstimatingRequestId(null);
                  setEstimateAmount("");
                }}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEstimateSubmit}
                disabled={loading || !estimateAmount}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Calculator size={16} />
                    Add Estimate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

