"use client";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  Loader2,
  UserCheck,
  X,
  Clock,
  User,
  Wrench,
  AlertCircle,
  Package,
  FileText,
  Eye,
  Edit,
  Car,
  Calendar,
} from "lucide-react";
import { jobCardPartsRequestService } from "@/features/inventory/services/jobCardPartsRequest.service";
import { useToastStore } from "@/store/toastStore";
import type { JobCardPart2Item } from "@/shared/types/job-card.types";
import { SERVICE_TYPE_OPTIONS } from "@/shared/constants/service-types";
import {
  filterByServiceCenter,
  getServiceCenterContext,
  shouldFilterByServiceCenter,
} from "@/shared/lib/serviceCenter";
import { generateInvoiceNumber, populateInvoiceFromJobCard } from "@/shared/utils/invoice.utils";
import { useRole } from "@/shared/hooks";
import type { JobCard, JobCardStatus, Priority, KanbanColumn, ServiceLocation } from "@/shared/types";
import {
  defaultJobCards,
  serviceEngineerJobCards,
  engineers as engineersList,
  type Engineer,
} from "@/__mocks__/data/job-cards.mock";
import type { ServiceCenterInvoice } from "@/shared/types/invoice.types";
import { useJobCards } from "@/features/job-cards/hooks/useJobCards";
import JobCardFilters from "./components/JobCardFilters";

import JobCardFormModal from "../components/job-cards/JobCardFormModal";
import JobCardList from "./components/JobCardList";
import JobCardKanban from "./components/JobCardKanban";
import PartsRequestModal from "./components/PartsRequestModal";
import AssignEngineerModal from "./components/AssignEngineerModal";
import StatusUpdateModal from "./components/StatusUpdateModal";
import JobCardActions from "./components/JobCardActions";
import JobCardDetailsModal from "./components/JobCardDetailsModal";
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
  const { showSuccess, showError, showWarning } = useToastStore();
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
  const { userRole, userInfo, isLoading: isRoleLoading } = useRole();
  const isCallCenter = userRole === "call_center";
  const isServiceAdvisor = userRole === "service_advisor";
  const isServiceManager = userRole === "sc_manager";
  const isInventoryManager = userRole === "inventory_manager";
  const isTechnician = userRole === "service_engineer";
  const [selectedJobCardForRequest, setSelectedJobCardForRequest] = useState<string>("");
  const [partsRequestsData, setPartsRequestsData] = useState<Record<string, any>>({});
  const [workCompletion, setWorkCompletion] = useState<Record<string, boolean>>({});
  const [technicianApproved, setTechnicianApproved] = useState<boolean>(false);
  const [partsApproved, setPartsApproved] = useState<boolean>(false);
  const currentWorkCompletion = selectedJob ? workCompletion[selectedJob.id] : false;

  // Use mock data from __mocks__ folder
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const { data: fetchedJobCards, isLoading: isQueryLoading } = useJobCards();
  const [isClient, setIsClient] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync Query Data to Local State
  useEffect(() => {
    if (fetchedJobCards) {
      setJobCards(fetchedJobCards);
      setIsInitialized(true);
    }
  }, [fetchedJobCards]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const serviceCenterContext = useMemo(() => getServiceCenterContext(), []);

  // Role-based job card filtering
  const visibleJobCards = useMemo(() => {
    let filtered = filterByServiceCenter(jobCards, serviceCenterContext);

    // Technician only sees job cards assigned to them
    if (isTechnician) {
      const engineerName = userInfo?.name || "Service Engineer";
      filtered = filtered.filter(
        (job) => job.assignedEngineer === engineerName || job.assignedEngineer === "Service Engineer"
      );
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

  // Job cards assigned to the current technician (includes Assigned and In Progress status)
  const assignedJobCards = useMemo(() => {
    if (!isTechnician) return [];
    const engineerName = userInfo?.name || "Service Engineer";
    return visibleJobCards.filter(
      (job) =>
        (job.assignedEngineer === engineerName || job.assignedEngineer === "Service Engineer") &&
        (job.status === "Assigned" || job.status === "In Progress" || job.status === "Parts Pending")
    );
  }, [visibleJobCards, isTechnician, userInfo]);

  // Service Engineer specific state
  const [activeTab, setActiveTab] = useState<"assigned" | "in_progress" | "completed">("assigned");
  const [showPartsRequestModal, setShowPartsRequestModal] = useState<boolean>(false);

  // Service Engineer job categories
  const assignedJobs = useMemo(() =>
    isTechnician ? assignedJobCards.filter((job) => job.status === "Assigned") : [],
    [assignedJobCards, isTechnician]
  );

  const inProgressJobs = useMemo(() =>
    isTechnician ? assignedJobCards.filter((job) => job.status === "In Progress") : [],
    [assignedJobCards, isTechnician]
  );

  const completedJobs = useMemo(() =>
    isTechnician ? assignedJobCards.filter((job) => job.status === "Completed") : [],
    [assignedJobCards, isTechnician]
  );

  // Load parts requests for service engineers
  useEffect(() => {
    if (!isClient || !isTechnician) return;
    const loadPartsRequests = async () => {
      try {
        const allRequests = await jobCardPartsRequestService.getAll();
        const requestsMap: Record<string, any> = {};
        allRequests.forEach((request) => {
          if (request.jobCardId) {
            requestsMap[request.jobCardId] = request;
          }
          const matchingJob = assignedJobCards.find(
            (job) => job.id === request.jobCardId || job.jobCardNumber === request.jobCardId
          );
          if (matchingJob) {
            if (matchingJob.id) requestsMap[matchingJob.id] = request;
            if (matchingJob.jobCardNumber) requestsMap[matchingJob.jobCardNumber] = request;
          }
        });
        setPartsRequestsData((prev) => ({ ...prev, ...requestsMap }));
      } catch (error) {
        console.error("Failed to load parts requests:", error);
      }
    };
    if (assignedJobCards.length > 0) {
      loadPartsRequests();
    }
  }, [assignedJobCards, isClient, isTechnician]);


  const handlePartRequestSubmit = async (jobId?: string, items?: JobCardPart2Item[]) => {
    const jobCardId = jobId || selectedJobCardForRequest;
    if (!jobCardId) {
      showWarning("Select a job card before submitting a part request.");
      return;
    }

    const selectedJobCard = assignedJobCards.find((job: JobCard) => job.id === jobCardId || job.jobCardNumber === jobCardId);
    if (!selectedJobCard) {
      showError("Selected job card not found.");
      return;
    }

    if (!items || items.length === 0) {
      showWarning("Please add at least one item to the list before submitting.");
      return;
    }

    const partsWithDetails = items.map((item) => ({
      partId: item.partCode || `unknown-${item.partName.replace(/\s+/g, "-").toLowerCase()}`,
      partName: item.partName,
      quantity: item.qty,
      serialNumber: item.isWarranty && item.serialNumber ? item.serialNumber : undefined,
      isWarranty: item.isWarranty || false,
    }));

    try {
      setLoading(true);

      // Create the parts request using the service
      const requestedBy = userInfo?.name || "Service Engineer";

      const request = await jobCardPartsRequestService.createRequestFromJobCard(
        selectedJobCard,
        partsWithDetails,
        requestedBy
      );

      // Update local state - store with multiple keys for reliable lookup
      setPartsRequestsData((prev) => {
        const updated = { ...prev };
        updated[jobCardId] = request;
        if (selectedJobCard.id) updated[selectedJobCard.id] = request;
        if (selectedJobCard.jobCardNumber) updated[selectedJobCard.jobCardNumber] = request;
        if (request.jobCardId) updated[request.jobCardId] = request;
        return updated;
      });

      showSuccess(`Part request submitted for Job Card: ${selectedJobCard.jobCardNumber || selectedJobCard.id}\nItems: ${partsWithDetails.length}`);
    } catch (error) {
      console.error("Failed to submit parts request:", error);
      showError("Failed to submit parts request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceManagerPartApproval = async () => {
    const jobCardId = isTechnician ? selectedJobCardForRequest : selectedJob?.id;
    const currentRequest = jobCardId ? partsRequestsData[jobCardId] : null;

    if (!currentRequest) {
      showWarning("No active parts request found for this job card.");
      return;
    }

    try {
      setLoading(true);
      const request = await jobCardPartsRequestService.approveByScManager(
        currentRequest.id,
        userInfo?.name || "SC Manager"
      );

      // Update local state
      setPartsRequestsData((prev) => ({
        ...prev,
        [jobCardId || ""]: request,
      }));

      showSuccess("Parts request approved by SC Manager.");
    } catch (error) {
      console.error("Failed to approve request:", error);
      showError("Failed to approve request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryManagerPartsApproval = async () => {
    const jobCardId = isTechnician ? selectedJobCardForRequest : selectedJob?.id;
    const currentRequest = jobCardId ? partsRequestsData[jobCardId] : null;

    if (!currentRequest) {
      showWarning("No active parts request found for this job card.");
      return;
    }

    try {
      setLoading(true);
      const engineerName = currentRequest.requestedBy || "Service Engineer";
      const request = await jobCardPartsRequestService.assignPartsByInventoryManager(
        currentRequest.id,
        userInfo?.name || "Inventory Manager",
        engineerName
      );

      // Update local state
      setPartsRequestsData((prev) => ({
        ...prev,
        [jobCardId || ""]: request,
      }));

      showSuccess("Parts assigned to engineer by Inventory Manager.");
    } catch (error) {
      console.error("Failed to assign parts:", error);
      showError("Failed to assign parts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWorkCompletionNotification = (jobId?: string) => {
    const targetJobId = jobId || selectedJob?.id || selectedJobCardForRequest;
    if (!targetJobId) return;

    const targetJob = jobCards.find((job) => job.id === targetJobId);
    if (!targetJob) return;

    setWorkCompletion((prev) => ({
      ...prev,
      [targetJobId]: true,
    }));

    // Update job card status to Completed
    const updatedJobCards = jobCards.map((job) =>
      job.id === targetJobId
        ? { ...job, status: "Completed" as JobCardStatus, completedAt: new Date().toLocaleString() }
        : job
    );
    setJobCards(updatedJobCards);
    safeStorage.setItem("jobCards", updatedJobCards);

    showSuccess("Work completion notified to manager.");
  };

  // Service Advisor: Submit job card to manager with required parts
  const handleSubmitToManager = () => {
    if (!selectedJob) {
      showWarning("Please select a job card to submit.");
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

    showSuccess("Job card submitted to manager successfully.");
  };

  // Service Manager: Create invoice and send to advisor
  const handleCreateInvoice = () => {
    if (!selectedJob) {
      showWarning("Please select a job card to create invoice.");
      return;
    }

    if (selectedJob.status !== "Completed") {
      showWarning("Job card must be completed before creating invoice.");
      return;
    }

    try {
      // Get service center context
      const serviceCenterContext = getServiceCenterContext();
      const serviceCenterId = String(serviceCenterContext.serviceCenterId ?? "1");
      const serviceCenterCode = SERVICE_CENTER_CODE_MAP[serviceCenterId] || "SC001";

      // Determine service center state
      let serviceCenterState = "Delhi";
      if (serviceCenterId === "2" || serviceCenterId === "sc-002") {
        serviceCenterState = "Maharashtra";
      } else if (serviceCenterId === "3" || serviceCenterId === "sc-003") {
        serviceCenterState = "Karnataka";
      }

      // Create service center object for invoice generation
      const serviceCenter = {
        id: serviceCenterId,
        code: serviceCenterCode,
        name: serviceCenterContext.serviceCenterName || selectedJob.serviceCenterName || "Service Center",
        state: serviceCenterState,
        address: "123 Service Center Address", // Should come from service center config
        city: serviceCenterState === "Delhi" ? "New Delhi" : serviceCenterState === "Maharashtra" ? "Mumbai" : "Bangalore",
        pincode: "110001",
        gstNumber: "29ABCDE1234F1Z5", // Should come from service center config
        panNumber: "ABCDE1234F", // Should come from service center config
      };

      // Populate invoice from job card
      const invoiceData = populateInvoiceFromJobCard(selectedJob, serviceCenter);

      // Get existing invoices to generate proper invoice number
      const existingInvoices = safeStorage.getItem<ServiceCenterInvoice[]>("invoices", []);
      const currentYear = new Date().getFullYear();
      const invoiceNumber = generateInvoiceNumber(serviceCenterCode, currentYear, existingInvoices);

      // Create complete invoice
      const newInvoice: ServiceCenterInvoice = {
        ...invoiceData,
        id: invoiceNumber,
        invoiceNumber: invoiceNumber,
        customerName: invoiceData.customerName || "",
        vehicle: invoiceData.vehicle || "",
        date: invoiceData.date || new Date().toISOString().split("T")[0],
        dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        amount: invoiceData.amount || invoiceData.grandTotal?.toString() || "0",
        paidAmount: invoiceData.paidAmount || "0",
        balance: invoiceData.balance || invoiceData.amount || invoiceData.grandTotal?.toString() || "0",
        items: invoiceData.items || [],
        jobCardId: selectedJob.id,
        status: "Unpaid",
        createdBy: userInfo?.name || "System",
      };

      // Save invoice
      existingInvoices.push(newInvoice);
      safeStorage.setItem("invoices", existingInvoices);

      // Update job card with invoice information
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

      // Update lead status to converted when service is invoiced (completed)
      if (selectedJob.id) {
        const existingLeads = safeStorage.getItem<any[]>("leads", []);
        const leadIndex = existingLeads.findIndex((l) => l.jobCardId === selectedJob.id);

        if (leadIndex !== -1) {
          const lead = existingLeads[leadIndex];
          const updatedNotes = lead.notes
            ? `${lead.notes}\nService completed and invoiced on ${new Date().toLocaleString()}. Invoice: ${invoiceNumber}`
            : `Service completed and invoiced on ${new Date().toLocaleString()}. Invoice: ${invoiceNumber}`;

          existingLeads[leadIndex] = {
            ...lead,
            status: "converted" as const,
            notes: updatedNotes,
            updatedAt: new Date().toISOString(),
          };
          safeStorage.setItem("leads", existingLeads);
        }
      }

      // Navigate to invoices page with the new invoice
      router.push(`/sc/invoices?invoiceId=${invoiceNumber}`);

      showSuccess(`Invoice ${invoiceNumber} created successfully! Redirecting to invoice page...`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      showError("Failed to create invoice. Please try again.");
    }
  };

  // Service Advisor: Send invoice to customer
  const handleSendInvoiceToCustomer = () => {
    if (!selectedJob || !selectedJob.invoiceNumber) {
      showWarning("No invoice found for this job card.");
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

    showSuccess("Invoice sent to customer successfully.");
  };



  const handleJobCardCreated = (newJobCard: JobCardType) => {
    const storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
    safeStorage.setItem("jobCards", [newJobCard, ...storedJobCards]);
    setJobCards((prev) => [newJobCard, ...prev]);
    setShowCreateModal(false);
  };

  const handleJobCardError = (message: string) => {
    showError(message);
  };


  // API Functions


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

      const updatedJobCards = jobCards.map((job) =>
        job.id === jobId
          ? {
            ...job,
            status,
            startTime: status === "In Progress" ? (typeof window !== "undefined" ? new Date().toLocaleString() : new Date().toISOString()) : job.startTime,
            completedAt: status === "Completed" ? (typeof window !== "undefined" ? new Date().toLocaleString() : new Date().toISOString()) : job.completedAt,
          }
          : job
      );
      setJobCards(updatedJobCards);
      safeStorage.setItem("jobCards", updatedJobCards);

      // Update lead status to converted when service is completed or invoiced
      if ((status === "Completed" || status === "Invoiced") && jobId) {
        const existingLeads = safeStorage.getItem<any[]>("leads", []);
        const leadIndex = existingLeads.findIndex((l) => l.jobCardId === jobId);

        if (leadIndex !== -1) {
          const lead = existingLeads[leadIndex];
          const completionNote = status === "Invoiced"
            ? `Service completed and invoiced on ${new Date().toLocaleString()}`
            : `Service completed on ${new Date().toLocaleString()}`;
          const updatedNotes = lead.notes
            ? `${lead.notes}\n${completionNote}`
            : completionNote;

          existingLeads[leadIndex] = {
            ...lead,
            status: "converted" as const,
            notes: updatedNotes,
            updatedAt: new Date().toISOString(),
          };
          safeStorage.setItem("leads", existingLeads);
        }
      }

      setShowStatusUpdateModal(false);
      setUpdatingStatusJobId(null);
    } catch (error) {
      console.error("Error updating status:", error);
      showError("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEngineer = () => {
    if (!assigningJobId || !selectedEngineer) {
      showWarning("Please select an engineer.");
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
      showWarning("Please select a job card before creating the manager quote.");
      return;
    }
    const params = new URLSearchParams({
      action: "create",
      jobCardId: selectedJob.id,
    });
    router.push(`/sc/quotations?${params.toString()}`);
  };



  const getStatusColor = (status: JobCardStatus): string => {
    const colors: Record<JobCardStatus, string> = {
      arrival_pending: "bg-gray-100 text-gray-700 border-gray-300",
      job_card_pending_vehicle: "bg-blue-50 text-blue-700 border-blue-200",
      job_card_active: "bg-yellow-100 text-yellow-700 border-yellow-300",
      check_in_only: "bg-indigo-50 text-indigo-700 border-indigo-200",
      no_response_lead: "bg-red-100 text-red-700 border-red-200",
      manager_quote: "bg-purple-50 text-purple-700 border-purple-200",
      "Awaiting Quotation Approval": "bg-amber-100 text-amber-700 border-amber-300",
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
    if (filter === "created" && job.status !== "Created" && job.status !== "Awaiting Quotation Approval") return false;
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
      "Awaiting Quotation Approval": ["Created"], // Can transition to Created if quotation rejected/cancelled, or to Created after approval
      Created: ["Assigned"],
      Assigned: ["In Progress"],
      "In Progress": ["Parts Pending", "Completed"],
      "Parts Pending": ["In Progress", "Completed"],
      Completed: ["Invoiced"],
      Invoiced: [],
    };
    return workflow[currentStatus] || [];
  };

  // Show loading state for all users until client-side initialization is complete
  // This prevents flash of wrong content during page reload
  if (!isClient || isRoleLoading || !isInitialized) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Early return for Service Engineer to prevent flash of other content
  // Must check BEFORE any other conditional rendering
  if (isTechnician) {

    const currentJobs = activeTab === "assigned" ? assignedJobs :
      activeTab === "in_progress" ? inProgressJobs :
        completedJobs;

    const selectedJobCard = selectedJobCardForRequest
      ? assignedJobCards.find(
        (job: JobCard) => job.id === selectedJobCardForRequest || job.jobCardNumber === selectedJobCardForRequest
      )
      : null;

    const activeRequest = selectedJobCardForRequest && selectedJobCard
      ? (partsRequestsData[selectedJobCardForRequest] ||
        partsRequestsData[selectedJobCard.id || ""] ||
        partsRequestsData[selectedJobCard.jobCardNumber || ""] ||
        null)
      : null;

    const handleJobCardClick = (job: JobCard) => {
      setSelectedJobCardForRequest(job.id);
      setShowPartsRequestModal(true);
    };

    const getJobsByStatusForTechnician = (status: JobCardStatus): JobCard[] => {
      return currentJobs.filter((job) => job.status === status);
    };

    return (
      <div className="bg-[#f9f9fb] min-h-screen p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">My Jobs</h1>
            <p className="text-gray-500">Manage your assigned job cards and parts requests</p>
          </div>

          {/* View Toggle */}
          <div className="mb-6 flex justify-end">
            <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-300">
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
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("assigned")}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition ${activeTab === "assigned"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Assigned ({assignedJobs.length})
              </button>
              <button
                onClick={() => setActiveTab("in_progress")}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition ${activeTab === "in_progress"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                In Progress ({inProgressJobs.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition ${activeTab === "completed"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Completed ({completedJobs.length})
              </button>
            </div>

            {/* Kanban View */}
            {view === "kanban" && (
              <JobCardKanban
                kanbanColumns={kanbanColumns}
                activeTab={activeTab}
                getJobsByStatus={getJobsByStatusForTechnician}
                partsRequestsData={partsRequestsData}
                onJobClick={handleJobCardClick}
                getPriorityColor={getPriorityColor}
              />
            )}

            {/* List View */}
            {view === "list" && (
              <JobCardList
                currentJobs={currentJobs}
                activeTab={activeTab}
                partsRequestsData={partsRequestsData}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
                onJobClick={handleJobCardClick}
                isTechnician={true}
                userInfo={userInfo}
                getNextStatus={getNextStatus}
                onUpdateStatus={(jobId) => {
                  setUpdatingStatusJobId(jobId);
                  const currentStatus = visibleJobCards.find(j => j.id === jobId)?.status || "Assigned";
                  setNewStatus(getNextStatus(currentStatus)[0]);
                  setShowStatusUpdateModal(true);
                }}
              />
            )}
          </div>

          {/* Parts Request Modal */}
          <PartsRequestModal
            open={showPartsRequestModal}
            onClose={() => setShowPartsRequestModal(false)}
            selectedJobCard={assignedJobCards.find(job => job.id === selectedJobCardForRequest || job.jobCardNumber === selectedJobCardForRequest) || null}
            activeRequest={selectedJobCardForRequest ? partsRequestsData[selectedJobCardForRequest] : null}
            loading={loading}
            onSubmit={async (jobId, items) => {
              await handlePartRequestSubmit(jobId, items);
              setShowPartsRequestModal(false);
            }}
            onNotifyWorkCompletion={(jobId) => {
              handleWorkCompletionNotification(jobId);
              setShowPartsRequestModal(false);
            }}
            isClient={isClient}
          />
        </div>
      </div>
    );
  }

  // Show loading state until initialized to prevent flash for non-technician roles
  if (!isInitialized || isRoleLoading || typeof window === "undefined") {
    return (
      <div className="bg-[#f9f9fb] min-h-screen p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={32} />
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
        <JobCardFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showMobileFilters={showMobileFilters}
          setShowMobileFilters={setShowMobileFilters}
          filter={filter}
          setFilter={setFilter}
          filterOptions={filterOptions}
          filterLabelMap={filterLabelMap}
          view={view}
        />

        <JobCardActions
          isServiceAdvisor={isServiceAdvisor}
          isServiceManager={isServiceManager}
          selectedJob={selectedJob}
          technicianApproved={technicianApproved}
          setTechnicianApproved={setTechnicianApproved}
          partsApproved={partsApproved}
          setPartsApproved={setPartsApproved}
          handleSubmitToManager={handleSubmitToManager}
          handleManagerQuoteAction={handleManagerQuoteAction}
          handleCreateInvoice={handleCreateInvoice}
          handleSendInvoiceToCustomer={handleSendInvoiceToCustomer}
          visibleJobCards={visibleJobCards}
        />

        {/* Manager/Advisor Collaboration Panel - Not for Service Engineers */}
        {jobForPanel && !isTechnician && (
          <div className="mb-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Job Card Details</h3>
                <p className="text-xs text-gray-500">
                  View and manage job card information and approvals.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Kanban View */}
        {view === "kanban" && (
          <JobCardKanban
            kanbanColumns={kanbanColumns}
            getJobsByStatus={getJobsByStatus}
            partsRequestsData={partsRequestsData}
            onJobClick={(job) => router.push(`/sc/job-cards/${job.id}`)}
            getPriorityColor={getPriorityColor}
          />
        )}

        {/* List View */}
        {view === "list" && (
          <JobCardList
            currentJobs={filteredJobs}
            partsRequestsData={partsRequestsData}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            onJobClick={(job) => router.push(`/sc/job-cards/${job.id}`)}
            isServiceAdvisor={isServiceAdvisor}
            isServiceManager={isServiceManager}
            onView={(jobId) => router.push(`/sc/job-cards/${jobId}`)}
            onEdit={(jobId) => router.push(`/sc/job-cards/${jobId}?edit=true`)}
            onEditDraft={handleEditDraft}
            onAssignEngineer={(jobId) => {
              setAssigningJobId(jobId);
              setShowAssignEngineerModal(true);
            }}
            onUpdateStatus={(jobId, initialStatus) => {
              setUpdatingStatusJobId(jobId);
              setNewStatus(getNextStatus(initialStatus)[0]);
              setShowStatusUpdateModal(true);
            }}
            getNextStatus={getNextStatus}
            hasQuotation={(jobId) => {
              if (typeof window === "undefined") return false;
              const quotations = safeStorage.getItem<any[]>("quotations", []);
              return quotations.some((q) => q.jobCardId === jobId);
            }}
            onCreateQuotation={(job) => {
              safeStorage.setItem("pendingQuotationFromJobCard", {
                jobCardId: job.id,
                jobCardNumber: job.jobCardNumber,
                customerName: job.customerName,
                customerId: job.customerId,
                vehicleId: job.vehicleId,
                serviceCenterId: job.serviceCenterId,
                serviceCenterName: job.serviceCenterName,
                jobCardData: job,
              });
              router.push(`/sc/quotations?fromJobCard=true&jobCardId=${job.id}`);
            }}
          />
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
      <JobCardDetailsModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        job={selectedJob}
        getStatusColor={getStatusColor}
        getPriorityColor={getPriorityColor}
        getNextStatus={getNextStatus}
        onAssignEngineer={(jobId) => {
          setShowDetails(false);
          setAssigningJobId(jobId);
          setShowAssignEngineerModal(true);
        }}
        onUpdateStatus={(jobId, initialStatus) => {
          setShowDetails(false);
          setUpdatingStatusJobId(jobId);
          setNewStatus(getNextStatus(initialStatus)[0]);
          setShowStatusUpdateModal(true);
        }}
      />

      {/* Create Job Card Modal - Using the updated JobCardFormModal component */}
      <JobCardFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleJobCardCreated}
        onError={handleJobCardError}
      />

      {/* Assign Engineer Modal */}
      <AssignEngineerModal
        open={showAssignEngineerModal && !!assigningJobId}
        onClose={() => {
          setShowAssignEngineerModal(false);
          setAssigningJobId(null);
          setSelectedEngineer("");
        }}
        engineers={engineers}
        selectedEngineer={selectedEngineer}
        onSelectEngineer={setSelectedEngineer}
        onSubmit={handleAssignEngineer}
        loading={loading}
      />

      {/* Update Status Modal */}
      <StatusUpdateModal
        open={showStatusUpdateModal && !!updatingStatusJobId}
        onClose={() => {
          setShowStatusUpdateModal(false);
          setUpdatingStatusJobId(null);
        }}
        currentStatus={visibleJobCards.find((j) => j.id === updatingStatusJobId)?.status || "Created"}
        newStatus={newStatus}
        onStatusChange={setNewStatus}
        onSubmit={handleStatusUpdate}
        loading={loading}
        getNextStatus={getNextStatus}
      />
    </div>
  );
}
