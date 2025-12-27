import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/store/toastStore";
// import { localStorage as safeStorage } from "@/shared/lib/localStorage"; // Removed
import type { JobCard, JobCardStatus, Engineer } from "@/shared/types";
import { staffService } from "@/features/workshop/services/staff.service";
// import { jobCardPartsRequestService } from "@/features/inventory/services/jobCardPartsRequest.service"; // Removed
import type { JobCardPart2Item } from "@/shared/types/job-card.types";
import { jobCardService } from "@/features/job-cards/services/jobCard.service";
import { partsIssueService } from "@/features/inventory/services/parts-issue.service"; // Added
// Import utils
import { generateInvoiceNumber, populateInvoiceFromJobCard } from "@/shared/utils/invoice.utils";
import type { ServiceCenterInvoice } from "@/shared/types/invoice.types";
import { getServiceCenterContext } from "@/shared/lib/serviceCenter";

const SERVICE_CENTER_CODE_MAP_LOCAL: Record<string, string> = {
    "1": "SC001",
    "2": "SC002",
    "3": "SC003",
};

export function useJobCardActions(
    jobCards: JobCard[],
    setJobCards: React.Dispatch<React.SetStateAction<JobCard[]>>,
    userInfo: any
) {
    const router = useRouter();
    const { showSuccess, showError, showWarning } = useToastStore();

    // Engineers State
    const [engineers, setEngineers] = useState<Engineer[]>([]);

    useEffect(() => {
        const fetchEngineers = async () => {
            try {
                const data = await staffService.getEngineers();
                setEngineers(data);
            } catch (error) {
                console.error("Failed to fetch engineers:", error);
            }
        };
        fetchEngineers();
    }, []);

    // Modal & Selection States
    const [selectedJob, setSelectedJob] = useState<JobCard | null>(null);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [showAssignEngineerModal, setShowAssignEngineerModal] = useState<boolean>(false);
    const [showStatusUpdateModal, setShowStatusUpdateModal] = useState<boolean>(false);
    const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
    const [showPartsRequestModal, setShowPartsRequestModal] = useState<boolean>(false);

    // Action States
    const [loading, setLoading] = useState<boolean>(false);
    const [assigningJobId, setAssigningJobId] = useState<string | null>(null);
    const [updatingStatusJobId, setUpdatingStatusJobId] = useState<string | null>(null);
    const [newStatus, setNewStatus] = useState<JobCardStatus>("ASSIGNED");
    const [selectedEngineer, setSelectedEngineer] = useState<string>("");

    // Technician Specific States
    const [selectedJobCardForRequest, setSelectedJobCardForRequest] = useState<string>("");
    const [partsRequestsData, setPartsRequestsData] = useState<Record<string, any>>({});
    const [workCompletion, setWorkCompletion] = useState<Record<string, boolean>>({});

    // --- Actions ---

    const handleJobCardCreated = (newJobCard: JobCard) => {
        // Removed localStorage update
        setJobCards((prev) => [newJobCard, ...prev]);
        setShowCreateModal(false);
    };

    const assignEngineer = async (jobId: string, engineerId: string) => {
        try {
            setLoading(true);
            const engineer = engineers.find((e) => e.id.toString() === engineerId);
            if (!engineer) {
                throw new Error("Engineer not found");
            }

            await jobCardService.assignEngineer(jobId, engineerId, engineer.name);

            setJobCards((prev) =>
                prev.map((job) =>
                    job.id === jobId
                        ? { ...job, status: "ASSIGNED" as JobCardStatus, assignedEngineer: engineer.name }
                        : job
                )
            );

            setShowAssignEngineerModal(false);
            setAssigningJobId(null);
            setSelectedEngineer("");
            showSuccess("Engineer assigned successfully.");
        } catch (error) {
            console.error("Error assigning engineer:", error);
            showError("Failed to assign engineer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (jobId: string, status: JobCardStatus) => {
        if (!userInfo?.id) {
            showError("You must be logged in to update status.");
            return;
        }

        try {
            setLoading(true);

            // Use jobCardService API
            await jobCardService.updateStatus(jobId, status);

            const updatedJobCards = jobCards.map((job) =>
                job.id === jobId
                    ? {
                        ...job,
                        status,
                        // Optimistic update of timestamps - backend will handle authoritative values
                        startTime: status === "IN_PROGRESS" ? (job.startTime || new Date().toISOString()) : job.startTime,
                        completedAt: status === "COMPLETED" ? new Date().toISOString() : job.completedAt,
                    }
                    : job
            );
            setJobCards(updatedJobCards);


            // Update lead status logic (legacy) - Removed localStorage logic.
            // Backend should handle lead updates on status change if relevant.

            setShowStatusUpdateModal(false);
            setUpdatingStatusJobId(null);
            showSuccess(`Job status updated to ${status}`);
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

    const handlePartRequestSubmit = async (assignedJobCards: JobCard[], jobId?: string, items?: JobCardPart2Item[]) => {
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

        // Removed partsWithDetails map that relied on unknown logic.

        try {
            setLoading(true);

            // Replaced jobCardPartsRequestService.createRequestFromJobCard with stub or API
            // Using partsIssueService.create as placeholder
            const payload = {
                serviceCenterId: "unknown", // Need context
                items: items.map(i => ({ partId: i.partCode || "unknown", quantity: i.qty })),
                notes: "From Job Card Action"
            };

            // await partsIssueService.create(payload); // Potentially incorrect payload for Central API

            console.warn("Backend API not fully integrated for Job Card Parts Request. Stubbing success.");

            // Mock success
            setPartsRequestsData((prev) => {
                const updated = { ...prev };
                // updated[jobCardId] = request; 
                return updated;
            });

            showSuccess(`Part request submitted for Job Card: ${selectedJobCard.jobCardNumber || selectedJobCard.id} (Stubbed)`);
        } catch (error) {
            console.error("Failed to submit parts request:", error);
            showError("Failed to submit parts request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleServiceManagerPartApproval = async (isTechnician: boolean) => {
        /*
         const jobCardId = isTechnician ? selectedJobCardForRequest : selectedJob?.id;
         const currentRequest = jobCardId ? partsRequestsData[jobCardId] : null;
 
         if (!currentRequest) {
             showWarning("No active parts request found for this job card.");
             return;
         }
 
         try {
             setLoading(true);
             // Replaced jobCardPartsRequestService with API calls
             console.warn("Service Manager Approval Stubbed (API not integrated)");
             showSuccess("Parts request approved by SC Manager. (Stubbed)");
         } catch (error) {
             console.error("Failed to approve request:", error);
             showError("Failed to approve request. Please try again.");
         } finally {
             setLoading(false);
         }
         */
        console.warn("Service Manager Approval Stubbed");
        showSuccess("Parts request approved (Stubbed)");
    };

    const handleInventoryManagerPartsApproval = async (isTechnician: boolean) => {
        /*
        const jobCardId = isTechnician ? selectedJobCardForRequest : selectedJob?.id;
        const currentRequest = jobCardId ? partsRequestsData[jobCardId] : null;

        if (!currentRequest) {
            showWarning("No active parts request found for this job card.");
            return;
        }

        try {
            setLoading(true);
             console.warn("Inventory Manager Approval Stubbed (API not integrated)");
            showSuccess("Parts assigned to engineer by Inventory Manager. (Stubbed)");
        } catch (error) {
            console.error("Failed to assign parts:", error);
            showError("Failed to assign parts. Please try again.");
        } finally {
            setLoading(false);
        }
        */
        console.warn("Inventory Manager Approval Stubbed");
        showSuccess("Parts assigned (Stubbed)");
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

        const updatedJobCards = jobCards.map((job) =>
            job.id === targetJobId
                ? { ...job, status: "COMPLETED" as JobCardStatus, completedAt: new Date().toLocaleString() }
                : job
        );
        setJobCards(updatedJobCards);
        // safeStorage.setItem("jobCards", updatedJobCards); // Removed

        showSuccess("Work completion notified to manager.");
    };

    const handleSubmitToManager = async (job?: JobCard) => {
        const targetJob = job || selectedJob;
        if (!targetJob) {
            showWarning("Please select a job card to submit.");
            return;
        }

        try {
            setLoading(true);
            const managerId = "sc-manager-001"; // Default Manager ID

            await jobCardService.passToManager(targetJob.id, managerId);

            const updatedJobCards = jobCards.map((j) =>
                j.id === targetJob.id
                    ? { ...j, status: "CREATED" as JobCardStatus, passedToManager: true, passedToManagerAt: new Date().toISOString() }
                    : j
            );
            setJobCards(updatedJobCards);
            // safeStorage.setItem("jobCards", updatedJobCards); // Removed

            showSuccess("Job card submitted to manager successfully.");
        } catch (error) {
            console.error("Failed to submit to manager:", error);
            showError("Failed to submit job card to manager.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInvoice = (jobCard?: JobCard) => {
        // handleCreateInvoice signature in previous code was () => void, but also referenced jobCard.
        // Let's support both or just simplify.
        const targetJob = jobCard || selectedJob;

        if (!targetJob) {
            showWarning("Please select a job card to create invoice.");
            return;
        }

        if (targetJob.status !== "COMPLETED") {
            showWarning("Job card must be completed before creating invoice.");
            return;
        }

        router.push(`/sc/invoices?createFromJobCard=${targetJob.id}`);
    };

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
        // safeStorage.setItem("jobCards", updatedJobCards); // Removed

        showSuccess("Invoice sent to customer successfully.");
    };

    // Stub fetchPartsRequests
    const openPartsRequestModal = (jobId: string) => {
        setSelectedJobCardForRequest(jobId);
        setShowPartsRequestModal(true);
        // fetchPartsRequests(jobId);
    };

    const submitPartRequest = async (requestedItems: { partId: string; quantity: number }[]) => {
        console.warn("Submit Part Request Stubbed");
        setShowPartsRequestModal(false);
        showSuccess("Request Submitted (Stub)");
    };


    return {
        // States
        selectedJob, setSelectedJob,
        showDetails, setShowDetails,
        showCreateModal, setShowCreateModal,
        showAssignEngineerModal, setShowAssignEngineerModal,
        showStatusUpdateModal, setShowStatusUpdateModal,
        showMobileFilters, setShowMobileFilters,
        showPartsRequestModal, setShowPartsRequestModal,
        loading,
        assigningJobId, setAssigningJobId,
        updatingStatusJobId, setUpdatingStatusJobId,
        newStatus, setNewStatus,
        selectedEngineer, setSelectedEngineer,
        selectedJobCardForRequest, setSelectedJobCardForRequest,
        partsRequestsData, setPartsRequestsData,
        workCompletion,
        engineers,

        // Actions
        handleJobCardCreated,
        assignEngineer,
        updateStatus,
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

        // Parts Request
        openPartsRequestModal,
        submitPartRequest,
        markWorkCompleted: (jobId: string, completed: boolean) => { }
    };
}
