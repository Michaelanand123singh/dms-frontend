"use client";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { useState, useEffect, useMemo, useRef } from "react";
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
  serviceEngineerJobCards,
  engineers as engineersList,
  type Engineer,
} from "@/__mocks__/data/job-cards.mock";
import { jobCardPartsRequestService } from "@/features/inventory/services/jobCardPartsRequest.service";
import { partsMasterService } from "@/features/inventory/services/partsMaster.service";
import { parseJobCardLinesToPart2, jobCardPart2ToJSON } from "@/shared/utils/jobCardData.util";
import type { JobCardPart2Item } from "@/shared/types/job-card.types";
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
  const { userRole, userInfo, isLoading: isRoleLoading } = useRole();
  const isCallCenter = userRole === "call_center";
  const isServiceAdvisor = userRole === "service_advisor";
  const isServiceManager = userRole === "sc_manager";
  const isInventoryManager = userRole === "inventory_manager";
  const isTechnician = userRole === "service_engineer";
  const [technicianApproved, setTechnicianApproved] = useState<boolean>(false);
  const [partsApproved, setPartsApproved] = useState<boolean>(false);
  const [partRequestInput, setPartRequestInput] = useState<string>("");
  const [selectedJobCardForRequest, setSelectedJobCardForRequest] = useState<string>("");
  const [partsRequestsData, setPartsRequestsData] = useState<Record<string, any>>({});
  const [part2ItemsList, setPart2ItemsList] = useState<JobCardPart2Item[]>([]);
  const [newItemForm, setNewItemForm] = useState<{
    partWarrantyTag: string;
    partName: string;
    partCode: string;
    qty: number;
    amount: number;
    technician: string;
    itemType: "part" | "work_item";
    labourCode: string;
    serialNumber: string;
    isWarranty: boolean;
  }>({
    partWarrantyTag: "",
    partName: "",
    partCode: "",
    qty: 1,
    amount: 0,
    technician: "",
    itemType: "part",
    labourCode: "Auto Select With Part",
    serialNumber: "",
    isWarranty: false,
  });
  const [allParts, setAllParts] = useState<any[]>([]);
  const [partSearchResults, setPartSearchResults] = useState<any[]>([]);
  const [showPartDropdown, setShowPartDropdown] = useState<boolean>(false);
  const partSearchRef = useRef<HTMLDivElement>(null);
  const [workCompletion, setWorkCompletion] = useState<Record<string, boolean>>({});
  const currentWorkCompletion = selectedJob ? workCompletion[selectedJob.id] : false;

  // Use mock data from __mocks__ folder
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize on client side only to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
      // Load job cards after role is determined
      const loadJobCards = () => {
        const storedJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
        if (storedJobCards.length > 0) {
          // For service engineers, merge stored cards with service engineer mock data
          if (isTechnician) {
            // Merge service engineer job cards with stored cards, avoiding duplicates
            const existingIds = new Set(storedJobCards.map((j) => j.id));
            const newEngineerCards = serviceEngineerJobCards.filter((j) => !existingIds.has(j.id));
            // Update assignedEngineer to match current user if available
            const engineerName = userInfo?.name || "Service Engineer";
            const updatedEngineerCards = newEngineerCards.map((card) => ({
              ...card,
              assignedEngineer: engineerName,
            }));
            setJobCards([...storedJobCards, ...updatedEngineerCards]);
          } else {
            setJobCards(storedJobCards);
          }
        } else {
          // No stored data - use default or service engineer mock data
          if (isTechnician) {
            // Use service engineer job cards and update assignedEngineer to match current user
            const engineerName = userInfo?.name || "Service Engineer";
            const updatedEngineerCards = serviceEngineerJobCards.map((card) => ({
              ...card,
              assignedEngineer: engineerName,
            }));
            setJobCards(updatedEngineerCards);
          } else {
            setJobCards(defaultJobCards);
          }
        }
        setIsInitialized(true);
      };
      
      // Small delay to ensure role is loaded first
      const timer = setTimeout(loadJobCards, 0);
      return () => clearTimeout(timer);
    }
  }, [isTechnician, userInfo]);
  
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

  // Load parts when parts request modal opens
  useEffect(() => {
    if (showPartsRequestModal) {
      const loadParts = async () => {
        try {
          const parts = await partsMasterService.getAll();
          setAllParts(parts);
        } catch (error) {
          console.error("Failed to load parts:", error);
        }
      };
      loadParts();
    }
  }, [showPartsRequestModal]);

  // Search parts as user types
  useEffect(() => {
    if (newItemForm.partName.trim().length > 0) {
      const query = newItemForm.partName.toLowerCase();
      const filtered = allParts.filter(
        (part) =>
          part.partName?.toLowerCase().includes(query) ||
          part.partNumber?.toLowerCase().includes(query) ||
          part.partId?.toLowerCase().includes(query)
      );
      setPartSearchResults(filtered.slice(0, 10)); // Limit to 10 results
      setShowPartDropdown(true);
    } else {
      setPartSearchResults([]);
      setShowPartDropdown(false);
    }
  }, [newItemForm.partName, allParts]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (partSearchRef.current && !partSearchRef.current.contains(event.target as Node)) {
        setShowPartDropdown(false);
      }
    };

    if (showPartDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPartDropdown]);

  const handlePartSelect = (part: any) => {
    // Extract part code - prefer partId, then partNumber, then extract from partName
    let partCode = part.partId || part.partNumber || "";
    if (!partCode && part.partName) {
      const codeMatch = part.partName.match(/^([A-Z0-9_-]+)/i);
      if (codeMatch) {
        partCode = codeMatch[1];
      }
    }
    
    // Generate warranty tag - use partId if available, otherwise generate from part code
    let warrantyTag = "";
    if (part.partId) {
      // Use partId as warranty tag (e.g., "RQL251113259818" format)
      warrantyTag = part.partId;
    } else if (partCode) {
      // Generate warranty tag from part code (e.g., "RQL" + partCode)
      warrantyTag = `RQL${partCode.replace(/[^0-9]/g, "").slice(-12)}` || partCode;
    } else {
      // Generate a unique warranty tag
      warrantyTag = `RQL${Date.now().toString().slice(-12)}`;
    }
    
    setNewItemForm({
      partWarrantyTag: warrantyTag,
      partName: part.partName || "",
      partCode: partCode,
      qty: 1,
      amount: part.price || 0,
      technician: "",
      itemType: "part",
      labourCode: "Auto Select With Part",
      serialNumber: "",
      isWarranty: false,
    });
    setShowPartDropdown(false);
    setPartSearchResults([]);
  };

  const handlePartRequestSubmit = async (jobId?: string) => {
    const jobCardId = jobId || selectedJobCardForRequest;
    if (!jobCardId) {
      alert("Select a job card before submitting a part request.");
      return;
    }

    const selectedJobCard = assignedJobCards.find((job: JobCard) => job.id === jobCardId || job.jobCardNumber === jobCardId);
    if (!selectedJobCard) {
      alert("Selected job card not found.");
      return;
    }

    // Use PART 2 items list if available, otherwise fall back to text input
    let partsWithDetails: Array<{ partId: string; partName: string; quantity: number; serialNumber?: string; isWarranty?: boolean }> = [];
    
    // Check if job card is a warranty case
    const isWarrantyCase = selectedJobCard.warrantyStatus && 
      (selectedJobCard.warrantyStatus.toLowerCase().includes("warranty") || 
       selectedJobCard.warrantyStatus.toLowerCase() !== "no warranty");
    
    if (part2ItemsList.length > 0) {
      // Convert PART 2 items to parts request format
      // Include serial numbers for warranty parts
      partsWithDetails = part2ItemsList.map((item) => {
        return {
          partId: item.partCode || `unknown-${item.partName.replace(/\s+/g, "-").toLowerCase()}`,
          partName: item.partName,
          quantity: item.qty,
          serialNumber: item.isWarranty && item.serialNumber ? item.serialNumber : undefined,
          isWarranty: item.isWarranty || false,
        };
      });
    } else {
      // Fallback to text input parsing
      const partNames = partRequestInput
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      if (partNames.length === 0) {
        alert("Please add at least one item to the list before submitting.");
        return;
      }
      partsWithDetails = partNames
        .map((partName) => {
          if (!partName) return null;
          return {
            partId: `unknown-${partName.replace(/\s+/g, "-").toLowerCase()}`,
            partName: partName,
            quantity: 1,
          };
        })
        .filter((p) => p !== null) as Array<{ partId: string; partName: string; quantity: number }>;
    }

    if (partsWithDetails.length === 0) {
      alert("Please add at least one item to the list before submitting.");
      return;
    }

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
      
      // Reset form
      setPartRequestInput("");
      setPart2ItemsList([]);
      setNewItemForm({
        partWarrantyTag: "",
        partName: "",
        partCode: "",
        qty: 1,
        amount: 0,
        technician: "",
        itemType: "part",
        labourCode: "Auto Select With Part",
        serialNumber: "",
        isWarranty: false,
      });
      setShowPartDropdown(false);
      setPartSearchResults([]);
      
      alert(`Part request submitted for Job Card: ${selectedJobCard.jobCardNumber || selectedJobCard.id}\nItems: ${partsWithDetails.length}\nRequest sent to SC Manager and Inventory Manager.`);
    } catch (error) {
      console.error("Failed to submit parts request:", error);
      alert("Failed to submit parts request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemForm.partName.trim()) {
      alert("Please enter a part name.");
      return;
    }

    // Validate warranty part serial number
    if (newItemForm.isWarranty && !newItemForm.serialNumber?.trim()) {
      alert("Please enter the part serial number for warranty parts.");
      return;
    }

    const newItem: JobCardPart2Item = {
      srNo: part2ItemsList.length + 1,
      partWarrantyTag: newItemForm.partWarrantyTag,
      partName: newItemForm.partName,
      partCode: newItemForm.partCode || (newItemForm.partName.match(/^([A-Z0-9_-]+)/i)?.[1] || ""),
      qty: newItemForm.qty || 1,
      amount: newItemForm.amount || 0,
      technician: newItemForm.technician,
      labourCode: newItemForm.itemType === "work_item" 
        ? (newItemForm.labourCode || "R & R")
        : "Auto Select With Part",
      itemType: newItemForm.itemType,
      serialNumber: newItemForm.isWarranty ? newItemForm.serialNumber : undefined,
      isWarranty: newItemForm.isWarranty,
    };

    setPart2ItemsList([...part2ItemsList, newItem]);
    
    // Reset form
    setNewItemForm({
      partWarrantyTag: "",
      partName: "",
      partCode: "",
      qty: 1,
      amount: 0,
      technician: "",
      itemType: "part",
      labourCode: "Auto Select With Part",
      serialNumber: "",
      isWarranty: false,
    });
  };

  const handleRemoveItem = (index: number) => {
    const updated = part2ItemsList.filter((_, i) => i !== index);
    // Re-number SR NO
    const renumbered = updated.map((item, i) => ({ ...item, srNo: i + 1 }));
    setPart2ItemsList(renumbered);
  };

  const handleTechnicianNotifyManager = async () => {
    if (!selectedJobCardForRequest) {
      alert("Select a job card from the dropdown before notifying manager.");
      return;
    }

    try {
      setLoading(true);
      const selectedJobCard = visibleJobCards.find((job) => job.id === selectedJobCardForRequest || job.jobCardNumber === selectedJobCardForRequest);
      if (!selectedJobCard) {
        alert("Selected job card not found.");
        return;
      }

      const partNames = partRequestInput
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      if (partNames.length === 0) {
        alert("Please enter at least one part.");
        return;
      }

      // Create parts with details
      const partsWithDetails = partNames
        .map((partName) => {
          if (!partName) return null;
          return {
            partId: `unknown-${partName.replace(/\s+/g, "-").toLowerCase()}`,
            partName: partName,
            quantity: 1,
          };
        })
        .filter((p) => p !== null);

      // Create the parts request using the service
      const requestedBy = userInfo?.name || "Service Engineer";
      
      const request = await jobCardPartsRequestService.createRequestFromJobCard(
        selectedJobCard,
        partsWithDetails,
        requestedBy
      );

      // Update local state
      setPartsRequestsData((prev) => ({
        ...prev,
        [selectedJobCardForRequest]: request,
      }));
      
      setPartRequestInput("");
      alert(`Part request submitted for Job Card: ${selectedJobCard.jobCardNumber || selectedJobCard.id}\nParts: ${partNames.join(", ")}\nRequest sent to SC Manager and Inventory Manager.`);
    } catch (error) {
      console.error("Failed to submit parts request:", error);
      alert("Failed to submit parts request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceManagerPartApproval = async () => {
    const jobCardId = isTechnician ? selectedJobCardForRequest : selectedJob?.id;
    const currentRequest = jobCardId ? partsRequestsData[jobCardId] : null;
    
    if (!currentRequest) {
      alert("No active parts request found for this job card.");
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
      
      alert("Parts request approved by SC Manager.");
    } catch (error) {
      console.error("Failed to approve request:", error);
      alert("Failed to approve request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryManagerPartsApproval = async () => {
    const jobCardId = isTechnician ? selectedJobCardForRequest : selectedJob?.id;
    const currentRequest = jobCardId ? partsRequestsData[jobCardId] : null;
    
    if (!currentRequest) {
      alert("No active parts request found for this job card.");
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
      
      alert("Parts assigned to engineer by Inventory Manager.");
    } catch (error) {
      console.error("Failed to assign parts:", error);
      alert("Failed to assign parts. Please try again.");
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
              startTime: status === "In Progress" ? (typeof window !== "undefined" ? new Date().toLocaleString() : new Date().toISOString()) : job.startTime,
              completedAt: status === "Completed" ? (typeof window !== "undefined" ? new Date().toLocaleString() : new Date().toISOString()) : job.completedAt,
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
      setPartRequestInput("");
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
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-medium transition ${
                  view === "kanban"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-medium transition ${
                  view === "list"
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
                className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                  activeTab === "assigned"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Assigned ({assignedJobs.length})
              </button>
              <button
                onClick={() => setActiveTab("in_progress")}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                  activeTab === "in_progress"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                In Progress ({inProgressJobs.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                  activeTab === "completed"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Completed ({completedJobs.length})
              </button>
            </div>

            {/* Kanban View */}
            {view === "kanban" && (
              <div className="p-6">
                <div className="w-full overflow-x-auto pb-6">
                  <div className="inline-flex gap-4 min-w-max">
                    {kanbanColumns
                      .filter((col) => 
                        activeTab === "assigned" ? col.status === "Assigned" :
                        activeTab === "in_progress" ? col.status === "In Progress" :
                        activeTab === "completed" ? col.status === "Completed" : false
                      )
                      .map((column) => {
                        const columnJobs = getJobsByStatusForTechnician(column.status);
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
                              {columnJobs.map((job) => {
                                const jobCardId = job.id || job.jobCardNumber;
                                const request = partsRequestsData[jobCardId] || partsRequestsData[job.id] || partsRequestsData[job.jobCardNumber || ""];
                                const hasRequest = request && !request.inventoryManagerAssigned;
                                
                                return (
                                  <div
                                    key={job.id}
                                    className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group"
                                    onClick={() => handleJobCardClick(job)}
                                  >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-sm mb-1 truncate group-hover:text-blue-600 transition-colors">
                                          {job.jobCardNumber || job.id}
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

                                    {/* Service Type */}
                                    <div className="mb-3">
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                                        <Wrench size={10} />
                                        {job.serviceType}
                                      </span>
                                    </div>

                                    {/* Parts Request Status Badge */}
                                    {hasRequest && (
                                      <div className="mt-2">
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                          Parts Request Pending
                                        </span>
                                      </div>
                                    )}
                                    {request?.inventoryManagerAssigned && (
                                      <div className="mt-2">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                          ✓ Parts Assigned
                                        </span>
                                      </div>
                                    )}

                                    {/* Click hint */}
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                      <p className="text-xs text-blue-600 font-medium">Click to request parts</p>
                                    </div>
                                  </div>
                                );
                              })}

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
              <div className="p-6">
                {currentJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-500">No {activeTab.replace("_", " ")} jobs found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentJobs.map((job) => {
                      const jobCardId = job.id || job.jobCardNumber;
                      const request = partsRequestsData[jobCardId] || partsRequestsData[job.id] || partsRequestsData[job.jobCardNumber || ""];
                      const hasRequest = request && !request.inventoryManagerAssigned;
                      
                      return (
                        <div
                          key={job.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                          onClick={() => handleJobCardClick(job)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {job.jobCardNumber || job.id}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                  {job.status}
                                </span>
                                {hasRequest && (
                                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                    Parts Request Pending
                                  </span>
                                )}
                                {request?.inventoryManagerAssigned && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                    ✓ Parts Assigned
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <p><span className="font-medium">Customer:</span> {job.customerName}</p>
                                <p><span className="font-medium">Vehicle:</span> {job.vehicle} ({job.registration})</p>
                                <p><span className="font-medium">Service:</span> {job.serviceType}</p>
                                <p><span className="font-medium">Priority:</span> {job.priority}</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-blue-600 font-medium">Click to request parts</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Parts Request Modal */}
          {showPartsRequestModal && selectedJobCard && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 z-[10000] relative">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Parts Request</h2>
                  <button
                    onClick={() => {
                      setShowPartsRequestModal(false);
                      setSelectedJobCardForRequest("");
                      setPartRequestInput("");
                      setPart2ItemsList([]);
                      setNewItemForm({
                        partWarrantyTag: "",
                        partName: "",
                        partCode: "",
                        qty: 1,
                        amount: 0,
                        technician: "",
                        itemType: "part",
                        labourCode: "Auto Select With Part",
                        serialNumber: "",
                        isWarranty: false,
                      });
                      setShowPartDropdown(false);
                      setPartSearchResults([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Job Card Information */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Job Card Information</label>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <p><span className="font-medium text-gray-700">Job Card:</span> <span className="text-gray-900">{selectedJobCard.jobCardNumber || selectedJobCard.id}</span></p>
                    <p><span className="font-medium text-gray-700">Customer:</span> <span className="text-gray-900">{selectedJobCard.customerName}</span></p>
                    <p><span className="font-medium text-gray-700">Vehicle:</span> <span className="text-gray-900">{selectedJobCard.vehicle} ({selectedJobCard.registration})</span></p>
                  </div>
                </div>

                {/* Add Item Form */}
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">Add Item to Request</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="relative" ref={partSearchRef}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Part Name *</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={newItemForm.partName}
                            onChange={(e) => setNewItemForm({ ...newItemForm, partName: e.target.value })}
                            onFocus={() => {
                              if (newItemForm.partName.trim().length > 0 && partSearchResults.length > 0) {
                                setShowPartDropdown(true);
                              }
                            }}
                            placeholder="Type to search parts..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          {showPartDropdown && partSearchResults.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {partSearchResults.map((part, index) => (
                                <div
                                  key={part.id || index}
                                  onClick={() => handlePartSelect(part)}
                                  className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-indigo-50 cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 truncate">{part.partName}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        {part.partNumber && (
                                          <span className="text-xs text-gray-600 font-mono">{part.partNumber}</span>
                                        )}
                                        {part.partId && part.partId !== part.partNumber && (
                                          <span className="text-xs text-gray-500 font-mono">({part.partId})</span>
                                        )}
                                        {part.price && (
                                          <span className="text-xs text-green-600 font-medium">₹{part.price.toLocaleString("en-IN")}</span>
                                        )}
                                      </div>
                                    </div>
                                    <Package size={16} className="text-indigo-600 shrink-0 ml-2" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Part Code</label>
                        <input
                          type="text"
                          value={newItemForm.partCode}
                          onChange={(e) => setNewItemForm({ ...newItemForm, partCode: e.target.value })}
                          placeholder="e.g., 2W0000000027_011"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Part Warranty Tag</label>
                        <input
                          type="text"
                          value={newItemForm.partWarrantyTag}
                          onChange={(e) => setNewItemForm({ ...newItemForm, partWarrantyTag: e.target.value })}
                          placeholder="e.g., RQL251113259818"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      {newItemForm.itemType === "part" && (
                        <>
                          <div>
                            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                              <input
                                type="checkbox"
                                checked={newItemForm.isWarranty}
                                onChange={(e) => setNewItemForm({ ...newItemForm, isWarranty: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <span>Warranty Part</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              Check if this part fits in vehicle and is a warranty case
                            </p>
                          </div>
                          {newItemForm.isWarranty && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Part Serial Number *
                              </label>
                              <input
                                type="text"
                                value={newItemForm.serialNumber}
                                onChange={(e) => setNewItemForm({ ...newItemForm, serialNumber: e.target.value })}
                                placeholder="Enter part serial number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Serial number is required for warranty parts
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Item Type *</label>
                        <select
                          value={newItemForm.itemType}
                          onChange={(e) => {
                            const itemType = e.target.value as "part" | "work_item";
                            setNewItemForm({
                              ...newItemForm,
                              itemType,
                              labourCode: itemType === "work_item" ? "R & R" : "Auto Select With Part",
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="part">Part</option>
                          <option value="work_item">Work Item</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                        <input
                          type="number"
                          min="1"
                          value={newItemForm.qty}
                          onChange={(e) => setNewItemForm({ ...newItemForm, qty: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Amount (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newItemForm.amount}
                          onChange={(e) => setNewItemForm({ ...newItemForm, amount: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Technician</label>
                        <input
                          type="text"
                          value={newItemForm.technician}
                          onChange={(e) => setNewItemForm({ ...newItemForm, technician: e.target.value })}
                          placeholder="Technician name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      {newItemForm.itemType === "work_item" && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Labour Code</label>
                          <input
                            type="text"
                            value={newItemForm.labourCode}
                            onChange={(e) => setNewItemForm({ ...newItemForm, labourCode: e.target.value })}
                            placeholder="e.g., R & R"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                    >
                      <PlusCircle size={16} className="inline mr-2" />
                      Add to List
                    </button>
                  </div>
                </div>

                {/* Items List Table */}
                {part2ItemsList.length > 0 && (
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">
                      Items Added ({part2ItemsList.length})
                    </label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-indigo-50 border-b border-gray-200">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">SR NO</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">PART WARRANTY TAG</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">PART NAME</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">PART CODE</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">QTY</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">AMOUNT</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">WARRANTY</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">SERIAL NUMBER</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">TECHNICIAN</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">LABOUR CODE</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-700">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {part2ItemsList.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-700 font-medium">{item.srNo}</td>
                                <td className="px-3 py-2 text-gray-700">{item.partWarrantyTag || "-"}</td>
                                <td className="px-3 py-2 text-gray-700">{item.partName}</td>
                                <td className="px-3 py-2 text-gray-700 font-mono text-xs">{item.partCode || "-"}</td>
                                <td className="px-3 py-2 text-gray-700">{item.qty}</td>
                                <td className="px-3 py-2 text-gray-700">₹{item.amount.toLocaleString("en-IN")}</td>
                                <td className="px-3 py-2">
                                  {item.isWarranty ? (
                                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 font-semibold">
                                      Yes
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">No</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-gray-700 font-mono text-xs">
                                  {item.isWarranty && item.serialNumber ? item.serialNumber : "-"}
                                </td>
                                <td className="px-3 py-2 text-gray-700">{item.technician || "-"}</td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    item.itemType === "work_item" 
                                      ? "bg-blue-100 text-blue-700" 
                                      : "bg-gray-100 text-gray-600"
                                  }`}>
                                    {item.labourCode}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="text-red-600 hover:text-red-700 p-1 rounded transition"
                                    title="Remove item"
                                  >
                                    <X size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={async () => {
                      await handlePartRequestSubmit(selectedJobCardForRequest);
                      setShowPartsRequestModal(false);
                    }}
                    disabled={loading || part2ItemsList.length === 0}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting..." : `Submit Parts Request (${part2ItemsList.length} items)`}
                  </button>
                  {part2ItemsList.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Add at least one item to the list before submitting
                    </p>
                  )}
                </div>

                {/* Parts Request Status */}
                {activeRequest && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Parts Request Status</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Requested Parts:</span>{" "}
                          {activeRequest.parts && Array.isArray(activeRequest.parts)
                            ? activeRequest.parts.map((p: any) => (typeof p === 'string' ? p : p.partName || '')).join(", ")
                            : "—"}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Requested At:</span>{" "}
                          {isClient && activeRequest.requestedAt
                            ? new Date(activeRequest.requestedAt).toLocaleString()
                            : activeRequest.requestedAt
                            ? new Date(activeRequest.requestedAt).toISOString()
                            : "—"}
                        </p>
                      </div>

                      {/* SC Manager Approval */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700 min-w-[120px]">SC Manager:</span>
                        <span className={`px-3 py-1.5 rounded text-xs font-semibold ${
                          activeRequest.scManagerApproved
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}>
                          {activeRequest.scManagerApproved ? "✓ Approved" : "Pending"}
                        </span>
                        {activeRequest.scManagerApproved && activeRequest.scManagerApprovedBy && (
                          <span className="text-xs text-gray-500">
                            by {activeRequest.scManagerApprovedBy}
                          </span>
                        )}
                      </div>

                      {/* Inventory Manager Status */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700 min-w-[120px]">Inventory Manager:</span>
                        <span className={`px-3 py-1.5 rounded text-xs font-semibold ${
                          activeRequest.inventoryManagerAssigned
                            ? "bg-green-500 text-white"
                            : activeRequest.scManagerApproved
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-400 text-white"
                        }`}>
                          {activeRequest.inventoryManagerAssigned
                            ? "✓ Parts Assigned"
                            : activeRequest.scManagerApproved
                            ? "Pending"
                            : "Waiting for SC Approval"}
                        </span>
                      </div>

                      {/* Work Completion Button */}
                      {activeRequest.inventoryManagerAssigned && (
                        <button
                          type="button"
                          onClick={() => {
                            handleWorkCompletionNotification(selectedJobCardForRequest);
                            setShowPartsRequestModal(false);
                          }}
                          className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                        >
                          Notify Work Completion
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-2 sm:p-4">
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
