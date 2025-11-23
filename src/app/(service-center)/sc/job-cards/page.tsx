"use client";
import { useState, useEffect } from "react";
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
import type { JobCard, JobCardStatus, Priority, KanbanColumn, ServiceLocation } from "@/shared/types";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api.config";

type ViewType = "kanban" | "list";
type FilterType = "all" | "created" | "assigned" | "in_progress" | "completed";

interface CreateJobCardForm {
  vehicleId: string;
  customerId: string;
  customerName: string;
  vehicleRegistration: string;
  vehicleMake: string;
  vehicleModel: string;
  serviceType: string;
  description: string;
  location: ServiceLocation;
  homeAddress?: string;
  estimatedCost: string;
  estimatedTime: string;
  priority: Priority;
  selectedParts: string[];
  assignedEngineerId: string;
}

interface Engineer {
  id: string;
  name: string;
  status: "Available" | "Busy" | "On Leave";
  currentJobs: number;
  skills: string[];
}

interface Part {
  id: string;
  name: string;
  sku: string;
  category: string;
  availableQty: number;
  unitPrice: string;
}

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

export default function JobCards() {
  const [view, setView] = useState<ViewType>("kanban");
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

  // Mock data - TODO: Replace with API calls
  const [jobCards, setJobCards] = useState<JobCard[]>([
    {
      id: "JC-2025-001",
      customerName: "Rajesh Kumar",
      vehicle: "Honda City 2020",
      registration: "PB10AB1234",
      serviceType: "Routine Maintenance",
      description: "Regular service - oil change, filter replacement",
      status: "In Progress",
      priority: "Normal",
      assignedEngineer: "Engineer 1",
      estimatedCost: "₹3,500",
      estimatedTime: "2 hours",
      startTime: "2025-01-15 10:00",
      createdAt: "2025-01-15 09:30",
      parts: ["Engine Oil", "Air Filter"],
      location: "Station",
    },
    {
      id: "JC-2025-002",
      customerName: "Priya Sharma",
      vehicle: "Maruti Swift 2019",
      registration: "MH01XY5678",
      serviceType: "Repair",
      description: "Brake pads replacement",
      status: "Assigned",
      priority: "High",
      assignedEngineer: "Engineer 2",
      estimatedCost: "₹4,200",
      estimatedTime: "3 hours",
      createdAt: "2025-01-15 11:15",
      parts: ["Brake Pads", "Brake Fluid"],
      location: "Station",
    },
    {
      id: "JC-2025-003",
      customerName: "Amit Patel",
      vehicle: "Hyundai i20 2021",
      registration: "DL05CD9012",
      serviceType: "Inspection",
      description: "Pre-purchase inspection",
      status: "Created",
      priority: "Normal",
      assignedEngineer: null,
      estimatedCost: "₹1,500",
      estimatedTime: "1 hour",
      createdAt: "2025-01-15 14:20",
      parts: [],
      location: "Station",
    },
  ]);

  const [engineers] = useState<Engineer[]>([
    {
      id: "eng-1",
      name: "Engineer 1",
      status: "Available",
      currentJobs: 1,
      skills: ["Engine", "AC", "General"],
    },
    {
      id: "eng-2",
      name: "Engineer 2",
      status: "Busy",
      currentJobs: 2,
      skills: ["Brakes", "Suspension"],
    },
    {
      id: "eng-3",
      name: "Engineer 3",
      status: "Available",
      currentJobs: 0,
      skills: ["Electrical", "Battery"],
    },
  ]);

  const [availableParts] = useState<Part[]>([
    { id: "part-1", name: "Engine Oil 5W-30", sku: "EO-001", category: "Lubricants", availableQty: 45, unitPrice: "₹450" },
    { id: "part-2", name: "Brake Pads - Front", sku: "BP-002", category: "Brakes", availableQty: 8, unitPrice: "₹1,200" },
    { id: "part-3", name: "Air Filter", sku: "AF-003", category: "Filters", availableQty: 25, unitPrice: "₹350" },
    { id: "part-4", name: "AC Gas R134a", sku: "AC-004", category: "AC Parts", availableQty: 12, unitPrice: "₹800" },
    { id: "part-5", name: "Spark Plugs Set", sku: "SP-005", category: "Engine", availableQty: 25, unitPrice: "₹600" },
  ]);

  const [createForm, setCreateForm] = useState<CreateJobCardForm>({
    vehicleId: "",
    customerId: "",
    customerName: "",
    vehicleRegistration: "",
    vehicleMake: "",
    vehicleModel: "",
    serviceType: "",
    description: "",
    location: "Station",
    homeAddress: "",
    estimatedCost: "",
    estimatedTime: "",
    priority: "Normal",
    selectedParts: [],
    assignedEngineerId: "",
  });

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

  const createJobCard = async (formData: CreateJobCardForm) => {
    try {
      setLoading(true);
      // const response = await fetch(`${API_CONFIG.BASE_URL}/service-center/job-cards`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     vehicleId: formData.vehicleId,
      //     customerId: formData.customerId,
      //     serviceType: formData.serviceType,
      //     description: formData.description,
      //     estimatedCost: parseFloat(formData.estimatedCost.replace(/[₹,]/g, "")),
      //     priority: formData.priority.toLowerCase(),
      //   }),
      // });
      // const newJobCard = await response.json();
      
      // For now, add to local state
      const newJobCard: JobCard = {
        id: `JC-2025-${String(jobCards.length + 1).padStart(3, "0")}`,
        customerName: formData.customerName,
        vehicle: `${formData.vehicleMake} ${formData.vehicleModel}`,
        registration: formData.vehicleRegistration,
        serviceType: formData.serviceType,
        description: formData.description,
        status: "Created",
        priority: formData.priority,
        assignedEngineer: null,
        estimatedCost: `₹${parseFloat(formData.estimatedCost || "0").toLocaleString("en-IN")}`,
        estimatedTime: formData.estimatedTime,
        createdAt: new Date().toLocaleString(),
        parts: formData.selectedParts,
        location: formData.location,
      };
      
      // Also save to localStorage for persistence
      const existingJobCards = JSON.parse(localStorage.getItem("jobCards") || "[]");
      existingJobCards.push(newJobCard);
      localStorage.setItem("jobCards", JSON.stringify(existingJobCards));
      
      setJobCards([newJobCard, ...jobCards]);
      setShowCreateModal(false);
      resetCreateForm();
    } catch (error) {
      console.error("Error creating job card:", error);
      alert("Failed to create job card. Please try again.");
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

  const resetCreateForm = () => {
    setCreateForm({
      vehicleId: "",
      customerId: "",
      customerName: "",
      vehicleRegistration: "",
      vehicleMake: "",
      vehicleModel: "",
      serviceType: "",
      description: "",
      location: "Station",
      homeAddress: "",
      estimatedCost: "",
      estimatedTime: "",
      priority: "Normal",
      selectedParts: [],
      assignedEngineerId: "",
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.customerName || !createForm.serviceType || !createForm.description) {
      alert("Please fill in all required fields.");
      return;
    }
    createJobCard(createForm);
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

  const togglePartSelection = (partName: string) => {
    setCreateForm({
      ...createForm,
      selectedParts: createForm.selectedParts.includes(partName)
        ? createForm.selectedParts.filter((p) => p !== partName)
        : [...createForm.selectedParts, partName],
    });
  };

  useEffect(() => {
    fetchJobCards();
    
    // Load job cards from localStorage (created from service requests)
    const storedJobCards = localStorage.getItem("jobCards");
    if (storedJobCards) {
      try {
        const parsed = JSON.parse(storedJobCards);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with existing job cards, avoiding duplicates
          setJobCards((prev) => {
            const existingIds = new Set(prev.map((j) => j.id));
            const newCards = parsed.filter((j: JobCard) => !existingIds.has(j.id));
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

  const filteredJobs = jobCards.filter((job) => {
    // Status filter
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

  const getNextStatus = (currentStatus: JobCardStatus): JobCardStatus[] => {
    const workflow: Record<JobCardStatus, JobCardStatus[]> = {
      Created: ["Assigned"],
      Assigned: ["In Progress"],
      "In Progress": ["Parts Pending", "Completed"],
      "Parts Pending": ["In Progress", "Completed"],
      Completed: ["Invoiced"],
      Invoiced: [],
    };
    return workflow[currentStatus] || [];
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-4 pb-6 md:pt-6 md:pb-10 px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 md:mb-2">Job Cards</h1>
            <p className="text-gray-500 text-sm md:text-base">Manage and track service job cards</p>
          </div>
          <div className="flex flex-col xs:flex-row gap-3 justify-center md:justify-start">
            <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-300 self-center">
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2 justify-center text-sm sm:text-base"
            >
              <Plus size={18} />
              <span>Create Job Card</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 mb-4 md:mb-6">
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
              {(["all", "created", "assigned", "in_progress", "completed"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1).replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mobile Filters Dropdown */}
          {showMobileFilters && (
            <div className="mt-4 md:hidden grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(["all", "created", "assigned", "in_progress", "completed"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setShowMobileFilters(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1).replace("_", " ")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Kanban View */}
        {view === "kanban" && (
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
              {kanbanColumns.map((column) => {
                const columnJobs = getJobsByStatus(column.status);
                return (
                  <div
                    key={column.id}
                    className="bg-white rounded-xl shadow-md p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-700 text-sm md:text-base">
                        {column.title}
                      </h3>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                        {columnJobs.length}
                      </span>
                    </div>
                    <div className="space-y-3 max-h-[400px] md:max-h-[500px] overflow-y-auto">
                      {columnJobs.map((job) => (
                        <div
                          key={job.id}
                          className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200 hover:shadow-md transition cursor-pointer"
                          onClick={() => {
                            setSelectedJob(job);
                            setShowDetails(true);
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-sm truncate">
                                {job.id}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {job.customerName}
                              </p>
                            </div>
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ml-2 ${getPriorityColor(
                                job.priority
                              )}`}
                              title={job.priority}
                            ></span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                            <Car size={12} />
                            <span className="truncate">{job.vehicle}</span>
                          </div>
                          <p className="text-xs text-gray-700 mb-2 line-clamp-2 break-words">
                            {job.description}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 flex items-center">
                              <Clock size={10} className="inline mr-1" />
                              {job.estimatedTime}
                            </span>
                            <span className="font-medium text-gray-800">
                              {job.estimatedCost}
                            </span>
                          </div>
                          {job.assignedEngineer && (
                            <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-600">
                              <User size={10} />
                              <span className="truncate">{job.assignedEngineer}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {columnJobs.length === 0 && (
                        <div className="text-center py-6 md:py-8 text-gray-400 text-xs md:text-sm">
                          No jobs
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                          setSelectedJob(job);
                          setShowDetails(true);
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-200 transition inline-flex items-center gap-1 md:gap-2 justify-center"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                    {job.status === "Created" && (
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
                    {getNextStatus(job.status).length > 0 && (
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

      {/* Create Job Card Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create Job Card</h2>
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
                    placeholder="Search vehicle to auto-fill"
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
                  <div className="md:col-span-2">
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
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="text"
                    value={createForm.estimatedCost}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setCreateForm({ ...createForm, estimatedCost: value });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="3500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    value={createForm.estimatedTime}
                    onChange={(e) => setCreateForm({ ...createForm, estimatedTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="2 hours"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as Priority })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
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
              
              {/* Parts Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Parts
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {availableParts.length === 0 ? (
                    <p className="text-sm text-gray-500">No parts available</p>
                  ) : (
                    <div className="space-y-2">
                      {availableParts.map((part) => (
                        <label
                          key={part.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={createForm.selectedParts.includes(part.name)}
                            onChange={() => togglePartSelection(part.name)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">{part.name}</p>
                            <p className="text-xs text-gray-500">
                              {part.sku} • Qty: {part.availableQty} • {part.unitPrice}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {createForm.selectedParts.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {createForm.selectedParts.map((part) => (
                      <span
                        key={part}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1"
                      >
                        {part}
                        <button
                          type="button"
                          onClick={() => togglePartSelection(part)}
                          className="hover:text-blue-900"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                      Create Job Card
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                        selectedEngineer === engineer.id
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
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              engineer.status === "Available"
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
                      jobCards.find((j) => j.id === updatingStatusJobId)?.status || "Created"
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
