"use client";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  PlusCircle,
  Search,
  Filter,
  Clock,
  User,
  Wrench,
  CheckCircle,
  AlertCircle,
  Package,
  FileText,
  Eye,
  Edit,
  X,
  Car,
  Calendar,
  MapPin,
  Loader2,
  UserCheck,
  ArrowRight,
  Calculator,
  Send,
} from "lucide-react";
import { useRole } from "@/shared/hooks";
import type { JobCard, JobCardStatus, Priority, KanbanColumn, ServiceLocation } from "@/shared/types";
import {
  defaultJobCards,
  engineers as engineersList,
  type Engineer,
} from "@/__mocks__/data/job-cards.mock";
import { SERVICE_TYPE_OPTIONS } from "@/shared/constants/service-types";
import {
  filterByServiceCenter,
  getServiceCenterContext,
  shouldFilterByServiceCenter,
} from "@/shared/lib/serviceCenter";

import JobCardFormModal from "../components/job-cards/JobCardFormModal";
import type { JobCard as JobCardType } from "@/shared/types";

const SERVICE_TYPES = SERVICE_TYPE_OPTIONS;
const SERVICE_CENTER_CODE_MAP: Record<string, string> = {
  "1": "SC001",
  "2": "SC002",
  "3": "SC003",
};

type ViewType = "kanban" | "list";
type FilterType = "all" | "created" | "assigned" | "in_progress" | "completed" | "draft";

export default function JobCards() {
  const router = useRouter();
  const [view, setView] = useState<ViewType>("list");
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<JobCard | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showAssignEngineerModal, setShowAssignEngineerModal] = useState<boolean>(false);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [assigningJobId, setAssigningJobId] = useState<string | null>(null);
  const [updatingStatusJobId, setUpdatingStatusJobId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<JobCardStatus>("Assigned");
  const [selectedEngineer, setSelectedEngineer] = useState<string>("");
  const jobForPanel = Boolean(selectedJob);
  const { userRole, userInfo } = useRole();
  const isCallCenter = userRole === "call_center";
  const isServiceAdvisor = userRole === "service_advisor";
  const isServiceManager = userRole === "sc_manager";
  const isInventoryManager = userRole === "inventory_manager" || userRole === "sc_staff";
  const isTechnician = userRole === "service_engineer";
  const [technicianApproved, setTechnicianApproved] = useState<boolean>(false);
  const [partsApproved, setPartsApproved] = useState<boolean>(false);
  const [partRequestInput, setPartRequestInput] = useState<string>("");
  const [partRequests, setPartRequests] = useState<Record<string, { parts: string[]; status: "pending" | "service_manager_approved" | "inventory_manager_approved"; technicianNotified: boolean }>>({});
  const activeRequest = selectedJob ? partRequests[selectedJob.id] : null;
  const [workCompletion, setWorkCompletion] = useState<Record<string, boolean>>({});
  const currentWorkCompletion = selectedJob ? workCompletion[selectedJob.id] : false;

  // Use mock data from __mocks__ folder
  const [jobCards, setJobCards] = useState<JobCard[]>(() => {
    if (typeof window !== "undefined") {
      const storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
      if (storedJobCards.length > 0) {
        return storedJobCards;
      }
    }
    return defaultJobCards;
  });
  const serviceCenterContext = useMemo(() => getServiceCenterContext(), []);
  
  // Role-based job card filtering
  const visibleJobCards = useMemo(() => {
    let filtered = filterByServiceCenter(jobCards, serviceCenterContext);
    
    // Technician only sees job cards assigned to them
    if (isTechnician && userInfo?.name) {
      filtered = filtered.filter((job) => job.assignedEngineer === userInfo.name);
    }
    
    // Service Advisor sees job cards they created or are assigned to their service center
    if (isServiceAdvisor) {
      // Can see all job cards in their service center
      // Additional filtering can be added if needed
    }
    
    return filtered;
  }, [jobCards, serviceCenterContext, isTechnician, isServiceAdvisor, userInfo]);
  
  const shouldFilterJobCards = shouldFilterByServiceCenter(serviceCenterContext);

  const [engineers] = useState<Engineer[]>(engineersList);

  const handlePartRequestSubmit = () => {
    if (!selectedJob) {
      alert("Select a job card before submitting a part request.");
      return;
    }
    const parts = partRequestInput
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length === 0) {
      alert("Please enter at least one part.");
      return;
    }
    
    // Store part request
    setPartRequests((prev) => ({
      ...prev,
      [selectedJob.id]: {
        parts,
        status: "pending",
        technicianNotified: false,
      },
    }));
    
    // Update job card with additional part requests
    const updatedJobCards = jobCards.map((job) =>
      job.id === selectedJob.id
        ? {
            ...job,
            partRequests: [...(job.partRequests || []), ...parts],
            partRequestStatus: "pending" as const,
          }
        : job
    );
    setJobCards(updatedJobCards);
    safeStorage.setItem("jobCards", updatedJobCards);
    
    setPartRequestInput("");
    alert("Additional part request submitted. Manager will be notified for approval.");
  };

  const handleTechnicianNotifyManager = () => {
    if (!selectedJob) return;
    setPartRequests((prev) => {
      const existing = prev[selectedJob.id];
      if (!existing) return prev;
      return {
        ...prev,
        [selectedJob.id]: { ...existing, technicianNotified: true },
      };
    });
    alert("Manager notified about part request.");
  };

  const handleServiceManagerPartApproval = () => {
    if (!selectedJob) return;
    setPartRequests((prev) => {
      const existing = prev[selectedJob.id];
      if (!existing) return prev;
      return {
        ...prev,
        [selectedJob.id]: {
          ...existing,
          status: "service_manager_approved",
        },
      };
    });
    alert("Part request approved by manager.");
  };

  const handleInventoryManagerPartsApproval = () => {
    if (!selectedJob) return;
    setPartRequests((prev) => {
      const existing = prev[selectedJob.id];
      if (!existing) return prev;
      return {
      ...prev,
        [selectedJob.id]: {
          ...existing,
          status: "inventory_manager_approved",
        },
      };
    });
    alert("Inventory manager approved the parts.");
  };

  const handleWorkCompletionNotification = () => {
    if (!selectedJob) return;
    setWorkCompletion((prev) => ({
      ...prev,
      [selectedJob.id]: true,
    }));
    
    // Update job card status to Completed
    const updatedJobCards = jobCards.map((job) =>
      job.id === selectedJob.id
        ? { ...job, status: "Completed" as JobCardStatus, completedAt: new Date().toLocaleString() }
        : job
    );
    setJobCards(updatedJobCards);
    safeStorage.setItem("jobCards", updatedJobCards);
    
    alert("Work completion notified to manager.");
  };

  // Service Advisor: Submit job card to manager with required parts
  const handleSubmitToManager = () => {
    if (!selectedJob) {
      alert("Please select a job card to submit.");
      return;
    }
    
    // Update job card status to indicate it's submitted to manager
    const updatedJobCards = jobCards.map((job) =>
      job.id === selectedJob.id
        ? { ...job, status: "Created" as JobCardStatus, submittedToManager: true, submittedAt: new Date().toLocaleString() }
        : job
    );
    setJobCards(updatedJobCards);
    safeStorage.setItem("jobCards", updatedJobCards);
    
    alert("Job card submitted to manager successfully.");
  };

  // Service Manager: Create invoice and send to advisor
  const handleCreateInvoice = () => {
    if (!selectedJob) {
      alert("Please select a job card to create invoice.");
      return;
    }
    
    if (selectedJob.status !== "Completed") {
      alert("Job card must be completed before creating invoice.");
      return;
    }
    
    // Update job card with invoice information
    const invoiceNumber = `INV-${selectedJob.jobCardNumber || selectedJob.id}-${Date.now()}`;
    const updatedJobCards = jobCards.map((job) =>
      job.id === selectedJob.id
        ? {
            ...job,
            status: "Invoiced" as JobCardStatus,
            invoiceNumber,
            invoiceCreatedAt: new Date().toLocaleString(),
            invoiceSentToAdvisor: false,
          }
        : job
    );
    setJobCards(updatedJobCards);
    safeStorage.setItem("jobCards", updatedJobCards);
    
    alert(`Invoice ${invoiceNumber} created and sent to service advisor.`);
  };

  // Service Advisor: Send invoice to customer
  const handleSendInvoiceToCustomer = () => {
    if (!selectedJob || !selectedJob.invoiceNumber) {
      alert("No invoice found for this job card.");
      return;
    }
    
    const updatedJobCards = jobCards.map((job) =>
      job.id === selectedJob.id
        ? {
            ...job,
            invoiceSentToCustomer: true,
            invoiceSentAt: new Date().toLocaleString(),
          }
        : job
    );
    setJobCards(updatedJobCards);
    safeStorage.setItem("jobCards", updatedJobCards);
    
    alert("Invoice sent to customer successfully.");
  };

  const generateJobCardNumber = (serviceCenterCode: string = "SC001") => {
    const storedCards = safeStorage.getItem<JobCard[]>("jobCards", []);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const currentMonthCards = storedCards.filter((card) => {
      if (!card.jobCardNumber) return false;
      const parts = card.jobCardNumber.split("-");
      return (
        parts[0] === serviceCenterCode &&
        parts[1] === String(year) &&
        parts[2] === month
      );
    });
    const sequenceNumbers = currentMonthCards
      .map((card) => {
        const parts = card.jobCardNumber?.split("-");
        return parts && parts[3] ? parseInt(parts[3], 10) : 0;
      })
      .filter((num) => !isNaN(num));
    const nextSequence = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) + 1 : 1;
    return `${serviceCenterCode}-${year}-${month}-${String(nextSequence).padStart(4, "0")}`;
  };

  const handleJobCardCreated = (newJobCard: JobCardType) => {
      const storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
      safeStorage.setItem("jobCards", [newJobCard, ...storedJobCards]);
      setJobCards((prev) => [newJobCard, ...prev]);
      setShowCreateModal(false);
  };

  const handleJobCardError = (message: string) => {
    alert(message);
  };


  // API Functions
  const fetchJobCards = async () => {
    try {
      setLoading(true);
      // const response = await fetch(`${API_CONFIG.BASE_URL}/service-center/job-cards`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // const data = await response.json();
      // setJobCards(data);
    } catch (error) {
      console.error("Error fetching job cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const assignEngineer = async (jobId: string, engineerId: string) => {
    try {
      setLoading(true);
      // const response = await fetch(
      //   `${API_CONFIG.BASE_URL}/service-center/job-cards/${jobId}/assign-engineer`,
      //   {
      //     method: "PATCH",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //     },
      //     body: JSON.stringify({ engineerId }),
      //   }
      // );

      const engineer = engineers.find((e) => e.id === engineerId);
      setJobCards(
        jobCards.map((job) =>
          job.id === jobId
            ? { ...job, status: "Assigned" as JobCardStatus, assignedEngineer: engineer?.name || null }
            : job
        )
      );
      setShowAssignEngineerModal(false);
      setAssigningJobId(null);
      setSelectedEngineer("");
    } catch (error) {
      console.error("Error assigning engineer:", error);
      alert("Failed to assign engineer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (jobId: string, status: JobCardStatus) => {
    try {
      setLoading(true);
      // const response = await fetch(
      //   `${API_CONFIG.BASE_URL}/service-center/job-cards/${jobId}/status`,
      //   {
      //     method: "PATCH",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //     },
      //     body: JSON.stringify({ status }),
      //   }
      // );

      setJobCards(
        jobCards.map((job) =>
          job.id === jobId
            ? {
              ...job,
              status,
              startTime: status === "In Progress" ? new Date().toLocaleString() : job.startTime,
              completedAt: status === "Completed" ? new Date().toLocaleString() : job.completedAt,
            }
            : job
        )
      );
      setShowStatusUpdateModal(false);
      setUpdatingStatusJobId(null);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEngineer = () => {
    if (!assigningJobId || !selectedEngineer) {
      alert("Please select an engineer.");
      return;
    }
    assignEngineer(assigningJobId, selectedEngineer);
  };

  const handleStatusUpdate = () => {
    if (!updatingStatusJobId || !newStatus) {
      return;
    }
    updateStatus(updatingStatusJobId, newStatus);
  };

  const handleManagerQuoteAction = () => {
    if (!selectedJob) {
      alert("Please select a job card before creating the manager quote.");
      return;
    }
    const params = new URLSearchParams({
      action: "create",
      jobCardId: selectedJob.id,
    });
    router.push(`/sc/quotations?${params.toString()}`);
  };

  useEffect(() => {
    fetchJobCards();

    // Load job cards from localStorage (created from service requests)
    const storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
    if (storedJobCards.length > 0) {
      try {
        if (Array.isArray(storedJobCards) && storedJobCards.length > 0) {
          // Merge with existing job cards, avoiding duplicates
          setJobCards((prev) => {
            const existingIds = new Set(prev.map((j) => j.id));
            const newCards = storedJobCards.filter((j) => !existingIds.has(j.id));
            return [...newCards, ...prev];
          });
        }
      } catch (error) {
        console.error("Error loading job cards from localStorage:", error);
      }
    }
  }, []);

  const getStatusColor = (status: JobCardStatus): string => {
    const colors: Record<JobCardStatus, string> = {
      arrival_pending: "bg-gray-100 text-gray-700 border-gray-300",
      job_card_pending_vehicle: "bg-blue-50 text-blue-700 border-blue-200",
      job_card_active: "bg-yellow-100 text-yellow-700 border-yellow-300",
      check_in_only: "bg-indigo-50 text-indigo-700 border-indigo-200",
      no_response_lead: "bg-red-100 text-red-700 border-red-200",
      manager_quote: "bg-purple-50 text-purple-700 border-purple-200",
      Created: "bg-gray-100 text-gray-700 border-gray-300",
      Assigned: "bg-blue-100 text-blue-700 border-blue-300",
      "In Progress": "bg-yellow-100 text-yellow-700 border-yellow-300",
      "Parts Pending": "bg-orange-100 text-orange-700 border-orange-300",
      Completed: "bg-green-100 text-green-700 border-green-300",
      Invoiced: "bg-purple-100 text-purple-700 border-purple-300",
    };
    return colors[status] || colors.Created;
  };

  const getPriorityColor = (priority: Priority): string => {
    const colors: Record<Priority, string> = {
      Low: "bg-gray-500",
      Normal: "bg-blue-500",
      High: "bg-orange-500",
      Critical: "bg-red-500",
    };
    return colors[priority] || colors.Normal;
  };

  const filteredJobs = visibleJobCards.filter((job) => {
    // Status filter
    if (filter === "draft" && !(job.draftIntake && job.status === "Created")) return false;
    if (filter === "created" && job.status !== "Created") return false;
    if (filter === "assigned" && job.status !== "Assigned") return false;
    if (filter === "in_progress" && job.status !== "In Progress") return false;
    if (filter === "completed" && job.status !== "Completed") return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.id.toLowerCase().includes(query) ||
        job.customerName.toLowerCase().includes(query) ||
        job.registration.toLowerCase().includes(query) ||
        job.vehicle.toLowerCase().includes(query) ||
        job.serviceType.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const draftCount = useMemo(
    () => visibleJobCards.filter((card) => card.draftIntake && card.status === "Created").length,
    [visibleJobCards]
  );

  const filterLabelMap: Record<FilterType, string> = {
    all: "All",
    created: "Created",
    assigned: "Assigned",
    in_progress: "In Progress",
    completed: "Completed",
    draft: "Drafts",
  };

  const filterOptions: FilterType[] = ["all", "created", "assigned", "in_progress", "completed", "draft"];

  const kanbanColumns: KanbanColumn[] = [
    { id: "created", title: "Created", status: "Created" },
    { id: "assigned", title: "Assigned", status: "Assigned" },
    { id: "in_progress", title: "In Progress", status: "In Progress" },
    { id: "parts_pending", title: "Parts Pending", status: "Parts Pending" },
    { id: "completed", title: "Completed", status: "Completed" },
  ];

  const getJobsByStatus = (status: JobCardStatus): JobCard[] => {
    return filteredJobs.filter((job) => job.status === status);
  };

  const handleEditDraft = (job: JobCard) => {
    if (!job.sourceAppointmentId) {
      router.push(`/sc/job-cards/${job.id}`);
      return;
    }
    router.push(`/sc/appointments?draft=${job.sourceAppointmentId}&jobCard=${job.id}`);
  };

  const getNextStatus = (currentStatus: JobCardStatus): JobCardStatus[] => {
    const workflow: Record<JobCardStatus, JobCardStatus[]> = {
      arrival_pending: ["job_card_pending_vehicle"],
      job_card_pending_vehicle: ["job_card_active"],
      job_card_active: ["check_in_only", "manager_quote"],
      check_in_only: ["manager_quote"],
      no_response_lead: [],
      manager_quote: ["Assigned"],
      Created: ["Assigned"],
      Assigned: ["In Progress"],
      "In Progress": ["Parts Pending", "Completed"],
      "Parts Pending": ["In Progress", "Completed"],
      Completed: ["Invoiced"],
      Invoiced: [],
    };
    return workflow[currentStatus] || [];
  };

  // Block Call Center access - show only vehicle status view
  if (isCallCenter) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">Vehicle Status</h1>
            <p className="text-gray-500 mb-4">View vehicle service status only</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Service Status Overview</h2>
            <div className="space-y-4">
              {visibleJobCards.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">{job.vehicle}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Customer: {job.customerName}</p>
                    <p>Service Type: {job.serviceType}</p>
                    {job.assignedEngineer && <p>Assigned Engineer: {job.assignedEngineer}</p>}
                  </div>
                </div>
              ))}
              {visibleJobCards.length === 0 && (
                <p className="text-gray-500 text-center py-8">No vehicles in service</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className={`pt-4 pb-6 md:pt-6 md:pb-10 overflow-x-hidden ${view === "kanban" ? "px-0" : "px-4 sm:px-6"}`}>
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-4 ${view === "kanban" ? "px-4 sm:px-6" : ""}`}>
          <div className="text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 md:mb-2">Job Cards</h1>
            <p className="text-gray-500 text-sm md:text-base">
              {isTechnician ? "Your Assigned Job Cards" : isServiceAdvisor ? "Create and manage job cards" : "Manage and track service job cards"}
            </p>
          </div>
          <div className="flex flex-col xs:flex-row gap-3 justify-center md:justify-start">
            <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-300 self-center">
              <button
                onClick={() => setView("kanban")}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-medium transition ${view === "kanban"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-medium transition ${view === "list"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                List
              </button>
            </div>
            {/* Only Service Advisor can create job cards from this page */}
            {isServiceAdvisor && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2 justify-center text-sm sm:text-base"
            >
              <Plus size={18} />
              <span>Create Job Card</span>
            </button>
            )}
          </div>
        </div>

        <div className={`flex flex-wrap gap-2 mb-3 ${view === "kanban" ? "px-4 sm:px-6" : ""}`}>
          <button
            type="button"
            onClick={() => setFilter("draft")}
            className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition ${filter === "draft"
              ? "border-yellow-400 bg-yellow-400 text-white"
              : "border-gray-200 bg-white text-gray-600 hover:border-yellow-400"
              }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Filters */}
        <div className={`bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 mb-4 md:mb-6 ${view === "kanban" ? "mx-4 sm:mx-6" : ""}`}>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by job card ID, customer name, vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm md:text-base"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition inline-flex items-center gap-2 w-full justify-center"
            >
              <Filter size={16} />
              Filters
            </button>

            {/* Desktop Filters */}
            <div className="hidden md:flex flex-wrap gap-2">
              {filterOptions.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition ${filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {filterLabelMap[f]}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Filters Dropdown */}
          {showMobileFilters && (
            <div className="mt-4 md:hidden grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filterOptions.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setShowMobileFilters(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {filterLabelMap[f]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Service Advisor: Submit to Manager Panel */}
        {isServiceAdvisor && selectedJob && selectedJob.status === "Created" && !selectedJob.submittedToManager && (
          <div className="mb-4 bg-gradient-to-r from-blue-50 to-white rounded-xl p-4 shadow-sm border border-blue-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-800">Submit Job Card to Manager</p>
                <p className="text-xs text-blue-600 mt-1">
                  Review the job card details and required parts, then submit to manager for approval and technician assignment.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSubmitToManager}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition bg-blue-600 text-white shadow-md hover:bg-blue-700"
              >
                Submit to Manager
              </button>
            </div>
          </div>
        )}

        {/* Service Manager: Manager-Driven Quotation & Monitoring Panel */}
        {isServiceManager && (
          <>
          <div className="mb-4 bg-gradient-to-r from-indigo-50 to-white rounded-xl p-4 shadow-sm border border-indigo-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-indigo-800">Manager-Driven Quotation</p>
                <p className="text-xs text-indigo-600 mt-1">
                  Confirm technician + inventory approvals before creating the manager quote or passing it back to the advisor.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-indigo-700">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={technicianApproved}
                    onChange={(e) => setTechnicianApproved(e.target.checked)}
                    className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Technician cleared
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={partsApproved}
                    onChange={(e) => setPartsApproved(e.target.checked)}
                    className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Parts approved
                </label>
              </div>
              <button
                type="button"
                onClick={handleManagerQuoteAction}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  technicianApproved && partsApproved
                    ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                    : "bg-indigo-200 text-indigo-600 cursor-not-allowed"
                }`}
                disabled={!(technicianApproved && partsApproved)}
              >
                Create Manager Quote
                </button>
              </div>
            </div>

            {/* Service Manager: Create Invoice Panel */}
            {selectedJob && selectedJob.status === "Completed" && !selectedJob.invoiceNumber && (
              <div className="mb-4 bg-gradient-to-r from-green-50 to-white rounded-xl p-4 shadow-sm border border-green-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-green-800">Create Final Invoice</p>
                    <p className="text-xs text-green-600 mt-1">
                      Job card is completed. Create invoice and send to service advisor for customer delivery.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateInvoice}
                    className="px-4 py-2 rounded-lg font-semibold text-sm transition bg-green-600 text-white shadow-md hover:bg-green-700"
                  >
                    Create Invoice
                  </button>
                </div>
              </div>
            )}

            {/* Service Manager: Monitor Assigned Job Cards */}
            <div className="mb-4 bg-gradient-to-r from-purple-50 to-white rounded-xl p-4 shadow-sm border border-purple-100">
              <div>
                <p className="text-sm font-semibold text-purple-800 mb-2">Monitor Assigned Job Cards</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <p className="text-purple-600 font-medium">Assigned</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {visibleJobCards.filter((j) => j.status === "Assigned").length}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <p className="text-purple-600 font-medium">In Progress</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {visibleJobCards.filter((j) => j.status === "In Progress").length}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <p className="text-purple-600 font-medium">Parts Pending</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {visibleJobCards.filter((j) => j.status === "Parts Pending").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Service Advisor: Send Invoice to Customer */}
        {isServiceAdvisor && selectedJob && selectedJob.invoiceNumber && !selectedJob.invoiceSentToCustomer && (
          <div className="mb-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl p-4 shadow-sm border border-yellow-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-yellow-800">Send Invoice to Customer</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Invoice {selectedJob.invoiceNumber} is ready. Send to customer at vehicle receiving time.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSendInvoiceToCustomer}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition bg-yellow-600 text-white shadow-md hover:bg-yellow-700"
              >
                Send Invoice to Customer
              </button>
            </div>
          </div>
        )}

        {jobForPanel && (
          <div className="mb-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Technician–Manager–Inventory Collaboration</h3>
                <p className="text-xs text-gray-500">
                  Create part requests, notify the manager, and capture approvals before sending a quotation.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                {currentWorkCompletion && (
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full">Work completion notified</span>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {isTechnician && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Request Additional Parts (not in job card)
                  </label>
                  <input
                    type="text"
                    value={partRequestInput}
                    onChange={(e) => setPartRequestInput(e.target.value)}
                    placeholder="Brake pads, Engine oil, Filter (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500">
                    Request parts that are not already defined in the job card. These will be sent to manager for approval.
                  </p>
                  <button
                    type="button"
                    onClick={handlePartRequestSubmit}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-indigo-700 transition"
                  >
                    Submit Part Request
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Current Request Status</p>
                <p className="text-xs text-gray-500">{activeRequest?.status ?? "No active request"}</p>
                <p className="text-xs text-gray-500">
                  Parts: {(activeRequest?.parts || []).join(", ") || "—"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              {/* Technician: Notify Manager about part requests */}
              {isTechnician && (
                <>
              <button
                type="button"
                onClick={handleTechnicianNotifyManager}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-700 transition"
                disabled={!activeRequest}
              >
                Notify Manager
              </button>
                  <button
                    type="button"
                    onClick={handleWorkCompletionNotification}
                    className="px-3 py-2 rounded-lg border border-green-300 text-green-700 hover:border-green-400 hover:text-green-800 transition"
                  >
                    Notify Work Completion
                  </button>
                </>
              )}
              {/* Service Manager: Approve parts and query inventory */}
              {isServiceManager && (
                <>
                <button
                  type="button"
                  onClick={handleServiceManagerPartApproval}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-700 transition"
                  disabled={!activeRequest}
                >
                  Approve Parts (Manager)
                </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Query inventory manager about parts
                      alert("Part request sent to inventory manager for approval.");
                    }}
                    className="px-3 py-2 rounded-lg border border-purple-300 text-purple-700 hover:border-purple-400 hover:text-purple-800 transition"
                    disabled={activeRequest?.status !== "pending" && activeRequest?.status !== "service_manager_approved"}
                  >
                    Query Inventory Manager
                  </button>
                </>
              )}
              {/* Inventory Manager: Approve parts */}
              {isInventoryManager && (
                <button
                  type="button"
                  onClick={handleInventoryManagerPartsApproval}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-700 transition"
                  disabled={activeRequest?.status !== "service_manager_approved"}
                >
                  Approve Parts (Inventory)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Kanban View */}
        {view === "kanban" && (
          <div className="w-full max-w-full overflow-x-hidden px-4 sm:px-6">
            <div className="w-full overflow-x-auto pb-6">
              <div className="inline-flex gap-4 min-w-max">
                {kanbanColumns.map((column) => {
                  const columnJobs = getJobsByStatus(column.status);
                  const columnColorMap: Record<string, { bg: string; border: string; text: string }> = {
                    created: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
                    assigned: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
                    in_progress: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
                    parts_pending: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
                    completed: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
                  };
                  const columnColor = columnColorMap[column.id] || columnColorMap.created;

                  return (
                    <div
                      key={column.id}
                      className={`shrink-0 w-72 sm:w-80 ${columnColor.bg} rounded-lg border-2 ${columnColor.border} shadow-sm`}
                    >
                      {/* Column Header */}
                      <div className={`sticky top-0 ${columnColor.bg} rounded-t-lg border-b-2 ${columnColor.border} px-4 py-3 z-10`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-bold ${columnColor.text} text-base`}>
                              {column.title}
                            </h3>
                          </div>
                          <span className={`${columnColor.text} bg-white/80 px-2.5 py-1 rounded-full text-xs font-bold min-w-[24px] text-center`}>
                            {columnJobs.length}
                          </span>
                        </div>
                      </div>

                      {/* Column Body - Scrollable */}
                      <div className="px-3 py-3 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
                        {columnJobs.map((job) => (
                          <div
                            key={job.id}
                            className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group"
                            onClick={() => {
                              router.push(`/sc/job-cards/${job.id}`);
                            }}
                          >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm mb-1 truncate group-hover:text-blue-600 transition-colors">
                                  {job.id}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {job.customerName}
                                </p>
                              </div>
                              <span
                                className={`w-3 h-3 rounded-full flex-shrink-0 ml-2 ${getPriorityColor(
                                  job.priority
                                )} shadow-sm`}
                                title={job.priority}
                              ></span>
                            </div>

                            {/* Vehicle Info */}
                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 pb-3 border-b border-gray-100">
                              <Car size={14} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate font-medium">{job.vehicle}</span>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-gray-700 mb-3 line-clamp-2 break-words leading-relaxed">
                              {job.description}
                            </p>

                            {/* Service Type */}
                            <div className="mb-3">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                                <Wrench size={10} />
                                {job.serviceType}
                              </span>
                            </div>

                            {/* Footer Info */}
                            <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                              <span className="text-gray-600 flex items-center gap-1">
                                <Clock size={12} className="text-gray-400" />
                                <span className="font-medium">{job.estimatedTime}</span>
                              </span>
                              <span className="font-bold text-gray-900">
                                {job.estimatedCost}
                              </span>
                            </div>

                            {/* Assigned Engineer */}
                            {job.assignedEngineer && (
                              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <User size={12} className="text-gray-400" />
                                  <span className="font-medium truncate">{job.assignedEngineer}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Empty State */}
                        {columnJobs.length === 0 && (
                          <div className="text-center py-12 text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <FileText size={20} className="text-gray-300" />
                              </div>
                              <p className="text-sm font-medium">No jobs</p>
                              <p className="text-xs">Jobs will appear here</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="space-y-3 md:space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold">
                        {job.id}
                      </span>
                      <span
                        className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                      <span
                        className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${getPriorityColor(
                          job.priority
                        )}`}
                        title={job.priority}
                      ></span>
                    </div>

                    <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 gap-3 md:gap-4 mb-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-sm md:text-base truncate">{job.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Car size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm md:text-base truncate">{job.vehicle}</span>
                        <span className="text-gray-500 text-xs md:text-sm hidden sm:inline">• {job.registration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Wrench size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm md:text-base truncate">{job.serviceType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm md:text-base truncate">{job.createdAt}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2 break-words">{job.description}</p>

                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 md:gap-4 text-xs md:text-sm">
                      {job.assignedEngineer && (
                        <span className="text-gray-500 truncate">
                          Engineer: <span className="font-medium text-gray-700">{job.assignedEngineer}</span>
                        </span>
                      )}
                      <span className="text-gray-500">
                        Estimated: <span className="font-medium text-gray-700">{job.estimatedCost}</span>
                      </span>
                      <span className="text-gray-500">
                        Time: <span className="font-medium text-gray-700">{job.estimatedTime}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:items-end">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          router.push(`/sc/job-cards/${job.id}`);
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-200 transition inline-flex items-center gap-1 md:gap-2 justify-center"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      {/* Service Advisor: Edit Draft */}
                      {isServiceAdvisor && job.draftIntake && job.sourceAppointmentId && (
                        <button
                          onClick={() => handleEditDraft(job)}
                          className="flex-1 border border-yellow-400 text-yellow-700 px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-yellow-100 transition inline-flex items-center gap-1 md:gap-2 justify-center"
                        >
                          <Edit size={14} />
                          Edit Draft
                        </button>
                      )}
                      {/* Service Manager: Edit Job Card */}
                      {isServiceManager && (
                        <button
                          onClick={() => {
                            router.push(`/sc/job-cards/${job.id}?edit=true`);
                          }}
                          className="flex-1 border border-blue-400 text-blue-700 px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-blue-100 transition inline-flex items-center gap-1 md:gap-2 justify-center"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                      )}
                    </div>
                    {/* Service Manager: Assign Engineer */}
                    {isServiceManager && job.status === "Created" && (
                      <button
                        onClick={() => {
                          setAssigningJobId(job.id);
                          setShowAssignEngineerModal(true);
                        }}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:opacity-90 transition w-full"
                      >
                        Assign Engineer
                      </button>
                    )}
                    {/* Service Manager: Update Status */}
                    {isServiceManager && getNextStatus(job.status).length > 0 && (
                      <button
                        onClick={() => {
                          setUpdatingStatusJobId(job.id);
                          setNewStatus(getNextStatus(job.status)[0]);
                          setShowStatusUpdateModal(true);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:opacity-90 transition w-full"
                      >
                        Update Status
                      </button>
                    )}
                    {/* Technician: Update Status (only for assigned job cards) */}
                    {isTechnician && job.assignedEngineer === userInfo?.name && getNextStatus(job.status).length > 0 && (
                      <button
                        onClick={() => {
                          setUpdatingStatusJobId(job.id);
                          setNewStatus(getNextStatus(job.status)[0]);
                          setShowStatusUpdateModal(true);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:opacity-90 transition w-full"
                      >
                        Update Status
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredJobs.length === 0 && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-6 md:p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-3 md:mb-4" size={48} />
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-1 md:mb-2">No Job Cards Found</h3>
            <p className="text-gray-500 text-sm md:text-base">No job cards match the current filter criteria.</p>
          </div>
        )}
      </div>

      {/* Job Card Details Modal */}
      {showDetails && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-2xl mx-2 max-h-[90vh] overflow-y-auto p-4 md:p-6 z-[101]">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Job Card Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 md:space-y-6">
              {/* Status and Priority */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 md:px-4 md:py-2 rounded-lg font-semibold text-sm md:text-base">
                  {selectedJob.id}
                </span>
                <span
                  className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium border ${getStatusColor(
                    selectedJob.status
                  )}`}
                >
                  {selectedJob.status}
                </span>
                <span
                  className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium text-white ${getPriorityColor(
                    selectedJob.priority
                  )}`}
                >
                  {selectedJob.priority} Priority
                </span>
              </div>

              {/* Customer & Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-blue-50 p-3 md:p-4 rounded-xl">
                  <h3 className="font-semibold text-blue-800 mb-1 md:mb-2 text-sm md:text-base">Customer Information</h3>
                  <p className="text-xs md:text-sm text-gray-700 break-words">{selectedJob.customerName}</p>
                </div>
                <div className="bg-green-50 p-3 md:p-4 rounded-xl">
                  <h3 className="font-semibold text-green-800 mb-1 md:mb-2 text-sm md:text-base">Vehicle Information</h3>
                  <p className="text-xs md:text-sm text-gray-700 break-words">{selectedJob.vehicle}</p>
                  <p className="text-xs text-gray-600 mt-1 break-words">{selectedJob.registration}</p>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">Service Details</h3>
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-700 mb-1 md:mb-2 break-words">
                    <strong>Type:</strong> {selectedJob.serviceType}
                  </p>
                  <p className="text-xs md:text-sm text-gray-700 break-words">
                    <strong>Description:</strong> {selectedJob.description}
                  </p>
                  <p className="text-xs md:text-sm text-gray-700 mt-2 break-words">
                    <strong>Location:</strong> {selectedJob.location}
                  </p>
                </div>
              </div>

              {/* Parts & Estimates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">Required Parts</h3>
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    {selectedJob.parts.length > 0 ? (
                      <ul className="space-y-1">
                        {selectedJob.parts.map((part, idx) => (
                          <li key={idx} className="text-xs md:text-sm text-gray-700 flex items-center gap-1 md:gap-2 break-words">
                            <Package size={12} className="text-gray-400 flex-shrink-0" />
                            {part}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs md:text-sm text-gray-500">No parts required</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">Estimates</h3>
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg space-y-1 md:space-y-2">
                    <p className="text-xs md:text-sm text-gray-700 break-words">
                      <strong>Cost:</strong> {selectedJob.estimatedCost}
                    </p>
                    <p className="text-xs md:text-sm text-gray-700 break-words">
                      <strong>Time:</strong> {selectedJob.estimatedTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Engineer Assignment */}
              {selectedJob.assignedEngineer && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">Assigned Engineer</h3>
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <p className="text-xs md:text-sm text-gray-700 flex items-center gap-1 md:gap-2 break-words">
                      <User size={14} className="text-gray-400 flex-shrink-0" />
                      {selectedJob.assignedEngineer}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-3 md:pt-4 border-t">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium hover:bg-gray-200 transition text-sm md:text-base"
                >
                  Close
                </button>
                {selectedJob.status === "Created" && !selectedJob.assignedEngineer && (
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      setAssigningJobId(selectedJob.id);
                      setShowAssignEngineerModal(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium hover:opacity-90 transition text-sm md:text-base"
                  >
                    Assign Engineer
                  </button>
                )}
                {getNextStatus(selectedJob.status).length > 0 && (
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      setUpdatingStatusJobId(selectedJob.id);
                      setNewStatus(getNextStatus(selectedJob.status)[0]);
                      setShowStatusUpdateModal(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium hover:opacity-90 transition text-sm md:text-base"
                  >
                    Update Status
                  </button>
                )}
                {selectedJob.status === "Completed" && (
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium hover:opacity-90 transition text-sm md:text-base">
                    Generate Invoice
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Job Card Modal - Using the updated JobCardFormModal component */}
      <JobCardFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleJobCardCreated}
        onError={handleJobCardError}
      />

      {/* Assign Engineer Modal */}
      {showAssignEngineerModal && assigningJobId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Assign Engineer</h2>
              <button
                onClick={() => {
                  setShowAssignEngineerModal(false);
                  setAssigningJobId(null);
                  setSelectedEngineer("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Engineer <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {engineers.map((engineer) => (
                    <label
                      key={engineer.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${selectedEngineer === engineer.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      <input
                        type="radio"
                        name="engineer"
                        value={engineer.id}
                        checked={selectedEngineer === engineer.id}
                        onChange={(e) => setSelectedEngineer(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-700">{engineer.name}</p>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${engineer.status === "Available"
                              ? "bg-green-100 text-green-700"
                              : engineer.status === "Busy"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            {engineer.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Current Jobs: {engineer.currentJobs} • Skills: {engineer.skills.join(", ")}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowAssignEngineerModal(false);
                  setAssigningJobId(null);
                  setSelectedEngineer("");
                }}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignEngineer}
                disabled={loading || !selectedEngineer}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserCheck size={16} />
                    Assign Engineer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusUpdateModal && updatingStatusJobId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Update Status</h2>
              <button
                onClick={() => {
                  setShowStatusUpdateModal(false);
                  setUpdatingStatusJobId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status <span className="text-red-500">*</span>
                </label>
                {updatingStatusJobId && (
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as JobCardStatus)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {getNextStatus(
                      visibleJobCards.find((j) => j.id === updatingStatusJobId)?.status || "Created"
                    ).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowStatusUpdateModal(false);
                  setUpdatingStatusJobId(null);
                }}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Update Status
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
