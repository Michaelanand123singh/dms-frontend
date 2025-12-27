"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Plus, Search, Filter, CheckCircle, Loader2, UserCheck, X, Clock, User,
  Wrench, AlertCircle, Package, FileText, Eye, Edit, Car, Calendar
} from "lucide-react";
import dynamic from "next/dynamic";


// Components
import JobCardFilters from "./components/JobCardFilters";
import JobCardList from "./components/JobCardList";
import JobCardKanban from "./components/JobCardKanban";
import JobCardActions from "./components/JobCardActions";

// Hooks
import { useJobCardView } from "@/features/job-cards/hooks/useJobCardView";
import { useJobCardActions } from "@/features/job-cards/hooks/useJobCardActions";

// Constants & Types
import { SERVICE_TYPE_OPTIONS } from "@/shared/constants/service-types";
import type { JobCard, JobCardStatus, JobCardFilterType } from "@/shared/types/job-card.types";

// Lazy load modals to improve initial load
const JobCardDetailsModal = dynamic(() => import("./components/JobCardDetailsModal"), {
  loading: () => <p>Loading details...</p>
});
const PartsRequestModal = dynamic(() => import("./components/PartsRequestModal"));
const AssignEngineerModal = dynamic(() => import("./components/AssignEngineerModal"));
const StatusUpdateModal = dynamic(() => import("./components/StatusUpdateModal"));

const SERVICE_TYPES = SERVICE_TYPE_OPTIONS;

// Import JobCardTable component
const JobCardTable = dynamic(() => import("./components/JobCardTable"), {
  loading: () => <p>Loading table...</p>
});

const getStatusColor = (status: JobCardStatus): string => {
  const colors: Record<JobCardStatus, string> = {
    ARRIVAL_PENDING: "bg-gray-100 text-gray-700 border-gray-300",
    JOB_CARD_PENDING_VEHICLE: "bg-blue-50 text-blue-700 border-blue-200",
    JOB_CARD_ACTIVE: "bg-yellow-100 text-yellow-700 border-yellow-300",
    CHECK_IN_ONLY: "bg-indigo-50 text-indigo-700 border-indigo-200",
    NO_RESPONSE_LEAD: "bg-red-100 text-red-700 border-red-200",
    MANAGER_QUOTE: "bg-purple-50 text-purple-700 border-purple-200",
    AWAITING_QUOTATION_APPROVAL: "bg-amber-100 text-amber-700 border-amber-300",
    CREATED: "bg-gray-100 text-gray-700 border-gray-300",
    ASSIGNED: "bg-blue-100 text-blue-700 border-blue-300",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700 border-yellow-300",
    PARTS_PENDING: "bg-orange-100 text-orange-700 border-orange-300",
    COMPLETED: "bg-green-100 text-green-700 border-green-300",
    INVOICED: "bg-purple-100 text-purple-700 border-purple-300",
  };
  return colors[status] || colors.CREATED;
};

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    LOW: "bg-gray-500",
    NORMAL: "bg-blue-500",
    HIGH: "bg-orange-500",
    CRITICAL: "bg-red-500",
  };
  return colors[priority] || "bg-gray-500";
};

export default function JobCards() {
  const router = useRouter();

  // 1. View & Data Hook
  const {
    view, setView,
    filter, setFilter,
    searchQuery, setSearchQuery,
    visibleJobCards,
    filteredJobs,
    draftCount,
    kanbanColumns,
    getJobsByStatus,
    isLoading,
    jobCards,
    setJobCards,
    userRole,
    userInfo,
    isTechnician
  } = useJobCardView();

  // 2. Actions Hook
  // Pass jobCards/setJobCards to allow optimistic updates from actions
  const {
    selectedJob, setSelectedJob,
    showDetails, setShowDetails,
    showCreateModal, setShowCreateModal,
    showAssignEngineerModal, setShowAssignEngineerModal,
    showStatusUpdateModal, setShowStatusUpdateModal,
    showMobileFilters, setShowMobileFilters,
    showPartsRequestModal, setShowPartsRequestModal,
    loading: actionLoading,
    assigningJobId, setAssigningJobId,
    updatingStatusJobId, setUpdatingStatusJobId,
    newStatus, setNewStatus,
    selectedEngineer, setSelectedEngineer,
    selectedJobCardForRequest, setSelectedJobCardForRequest,
    partsRequestsData, setPartsRequestsData,
    workCompletion,
    engineers,

    handleJobCardCreated,
    handleAssignEngineer,
    handleStatusUpdate,
    handleManagerQuoteAction,
    handlePartRequestSubmit,
    handleServiceManagerPartApproval,
    handleInventoryManagerPartsApproval,
    handleWorkCompletionNotification,
    handleSubmitToManager,
    handleCreateInvoice,
    handleSendInvoiceToCustomer,
    updateStatus // Ensure this is exported from hook
  } = useJobCardActions(jobCards, setJobCards, userInfo);

  const isCallCenter = userRole === "call_center";
  const isServiceAdvisor = userRole === "service_advisor";
  const isServiceManager = userRole === "sc_manager";
  const isInventoryManager = userRole === "inventory_manager";

  // Service Engineer specific logic
  const [activeTab, setActiveTab] = useState<"assigned" | "in_progress" | "completed">("assigned");

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const jobForPanel = Boolean(selectedJob);

  // Derived state for Technician view
  const assignedJobCards = visibleJobCards; // For technician, visible cards are already filtered
  const assignedJobs = isTechnician ? visibleJobCards.filter((job) => job.status === "ASSIGNED") : [];
  const inProgressJobs = isTechnician ? visibleJobCards.filter((job) => job.status === "IN_PROGRESS") : [];
  const completedJobs = isTechnician ? visibleJobCards.filter((job) => job.status === "COMPLETED") : [];

  const handleEditDraft = (job: JobCard) => {
    if (!job.sourceAppointmentId) {
      router.push(`/sc/job-cards/${job.id}`);
      return;
    }
    router.push(`/sc/appointments?draft=${job.sourceAppointmentId}&jobCard=${job.id}`);
  };

  const [technicianApproved, setTechnicianApproved] = useState<boolean>(false);
  const [partsApproved, setPartsApproved] = useState<boolean>(false);

  const filterLabelMap: Record<JobCardFilterType, string> = {
    all: "All",
    created: "Created",
    assigned: "Assigned",
    in_progress: "In Progress",
    completed: "Completed",
    draft: "Drafts",
  };

  const filterOptions: JobCardFilterType[] = ["all", "created", "assigned", "in_progress", "completed", "draft"];

  const handleJobCardError = (message: string) => {
    console.error(message);
    // You might want to use toast here if available
  };

  // ... (skipping some existing functions) ...

  if (isLoading || !isClient) {
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


  const getNextStatus = (currentStatus: JobCardStatus): JobCardStatus[] => {
    const workflow: Record<JobCardStatus, JobCardStatus[]> = {
      ARRIVAL_PENDING: ["JOB_CARD_PENDING_VEHICLE"],
      JOB_CARD_PENDING_VEHICLE: ["JOB_CARD_ACTIVE"],
      JOB_CARD_ACTIVE: ["CHECK_IN_ONLY", "MANAGER_QUOTE"],
      CHECK_IN_ONLY: ["MANAGER_QUOTE"],
      NO_RESPONSE_LEAD: [],
      MANAGER_QUOTE: ["ASSIGNED"],
      AWAITING_QUOTATION_APPROVAL: ["CREATED"],
      CREATED: ["ASSIGNED"],
      ASSIGNED: ["IN_PROGRESS"],
      IN_PROGRESS: ["PARTS_PENDING", "COMPLETED"],
      PARTS_PENDING: ["IN_PROGRESS", "COMPLETED"],
      COMPLETED: ["INVOICED"],
      INVOICED: [],
    };
    return workflow[currentStatus] || [];
  };


  // Early return for Service Engineer (Technician) View
  if (isTechnician) {
    const currentJobs = activeTab === "assigned" ? assignedJobs :
      activeTab === "in_progress" ? inProgressJobs :
        completedJobs;

    const selectedJobCard = selectedJobCardForRequest
      ? visibleJobCards.find(
        (job) => job.id === selectedJobCardForRequest || job.jobCardNumber === selectedJobCardForRequest
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
                onUpdateStatus={(jobId, status) => updateStatus(jobId, status)}
                isTechnician={true}
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
                onUpdateStatus={(jobId, status) => {
                  if (status) {
                    updateStatus(jobId, status as JobCardStatus);
                  } else {
                    setUpdatingStatusJobId(jobId);
                    const currentStatus = visibleJobCards.find(j => j.id === jobId)?.status || "ASSIGNED";
                    setNewStatus(getNextStatus(currentStatus)[0]);
                    setShowStatusUpdateModal(true);
                  }
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
            loading={actionLoading}
            onSubmit={async (jobId, items) => {
              await handlePartRequestSubmit(visibleJobCards, jobId, items);
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
              <button
                onClick={() => setView("table")}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-medium transition ${view === "table"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                Table
              </button>
            </div>
            {/* Only Service Advisor can create job cards from this page */}
            {isServiceAdvisor && (
              <button
                onClick={() => router.push("/sc/job-cards/create")}
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
            onEdit={(jobId) => router.push(`/sc/job-cards/${jobId}/edit`)}
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
              const job = filteredJobs.find(j => j.id === jobId);
              return !!job?.quotationId;
            }}
            onCreateQuotation={(job) => {
              router.push(`/sc/quotations?fromJobCard=true&jobCardId=${job.id}`);
            }}
            onPassToManager={handleSubmitToManager}
          />
        )}

        {/* Table View */}
        {view === "table" && (
          <JobCardTable
            currentJobs={filteredJobs}
            partsRequestsData={partsRequestsData}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            onJobClick={(job) => router.push(`/sc/job-cards/${job.id}`)}
            isServiceAdvisor={isServiceAdvisor}
            isServiceManager={isServiceManager}
            onView={(jobId) => router.push(`/sc/job-cards/${jobId}`)}
            onEdit={(jobId) => router.push(`/sc/job-cards/${jobId}/edit`)}
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
              const job = filteredJobs.find(j => j.id === jobId);
              return !!job?.quotationId;
            }}
            onCreateQuotation={(job) => {
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
        loading={actionLoading}
      />

      {/* Update Status Modal */}
      <StatusUpdateModal
        open={showStatusUpdateModal && !!updatingStatusJobId}
        onClose={() => {
          setShowStatusUpdateModal(false);
          setUpdatingStatusJobId(null);
        }}
        currentStatus={visibleJobCards.find((j) => j.id === updatingStatusJobId)?.status || "CREATED"}
        newStatus={newStatus}
        onStatusChange={setNewStatus}
        onSubmit={handleStatusUpdate}
        loading={actionLoading}
        getNextStatus={getNextStatus}
      />
    </div>
  );
}
