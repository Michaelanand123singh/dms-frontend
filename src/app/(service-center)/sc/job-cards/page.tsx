"use client";
import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
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
} from "lucide-react";
import type { JobCard, JobCardStatus, Priority, KanbanColumn, ServiceLocation } from "@/shared/types";

type ViewType = "kanban" | "list";
type FilterType = "all" | "created" | "assigned" | "in_progress" | "completed";

export default function JobCards() {
  const [view, setView] = useState<ViewType>("kanban");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedJob, setSelectedJob] = useState<JobCard | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newJobCard, setNewJobCard] = useState<Partial<JobCard>>({
    customerName: "",
    vehicle: "",
    registration: "",
    serviceType: "",
    description: "",
    status: "Created",
    priority: "Normal",
    assignedEngineer: null,
    estimatedCost: "",
    estimatedTime: "",
    parts: [],
    location: "Station",
  });

  // Mock job cards data
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
    {
      id: "JC-2025-004",
      customerName: "Suresh Kumar",
      vehicle: "Toyota Innova 2020",
      registration: "KA03EF3456",
      serviceType: "Repair",
      description: "AC repair and gas refill",
      status: "Completed",
      priority: "High",
      assignedEngineer: "Engineer 1",
      estimatedCost: "₹5,500",
      estimatedTime: "4 hours",
      completedAt: "2025-01-15 16:30",
      createdAt: "2025-01-15 12:00",
      parts: ["AC Gas", "AC Filter"],
      location: "Home Service",
    },
  ]);

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
    if (filter === "all") return true;
    return job.status.toLowerCase().replace(" ", "_") === filter;
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

  const handleStatusChange = (jobId: string, newStatus: JobCardStatus): void => {
    setJobCards(
      jobCards.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
  };

  const generateJobCardId = (): string => {
    const year = new Date().getFullYear();
    const count = jobCards.length + 1;
    return `JC-${year}-${String(count).padStart(3, "0")}`;
  };

  const handleCreateJobCard = (): void => {
    if (
      !newJobCard.customerName ||
      !newJobCard.vehicle ||
      !newJobCard.registration ||
      !newJobCard.serviceType ||
      !newJobCard.description ||
      !newJobCard.estimatedCost ||
      !newJobCard.estimatedTime
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const jobCard: JobCard = {
      id: generateJobCardId(),
      customerName: newJobCard.customerName!,
      vehicle: newJobCard.vehicle!,
      registration: newJobCard.registration!,
      serviceType: newJobCard.serviceType!,
      description: newJobCard.description!,
      status: newJobCard.status || "Created",
      priority: newJobCard.priority || "Normal",
      assignedEngineer: newJobCard.assignedEngineer || null,
      estimatedCost: newJobCard.estimatedCost!,
      estimatedTime: newJobCard.estimatedTime!,
      createdAt: new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().split(" ")[0].slice(0, 5),
      parts: newJobCard.parts || [],
      location: newJobCard.location || "Station",
    };

    setJobCards([...jobCards, jobCard]);
    setShowCreateModal(false);
    setNewJobCard({
      customerName: "",
      vehicle: "",
      registration: "",
      serviceType: "",
      description: "",
      status: "Created",
      priority: "Normal",
      assignedEngineer: null,
      estimatedCost: "",
      estimatedTime: "",
      parts: [],
      location: "Station",
    });
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

        {/* Kanban View - 3 cards per row */}
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
                      <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-blue-200 transition inline-flex items-center gap-1 md:gap-2 justify-center">
                        <Edit size={14} />
                        Edit
                      </button>
                    </div>
                    {job.status === "Created" && (
                      <button
                        onClick={() => handleStatusChange(job.id, "Assigned")}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:opacity-90 transition w-full"
                      >
                        Assign Engineer
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

      {/* Create Job Card Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-[100] p-2 sm:p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-2xl mx-2 max-h-[90vh] overflow-y-auto p-4 md:p-6 z-[101]">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Create New Job Card</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 md:space-y-6">
              {/* Customer & Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newJobCard.customerName}
                    onChange={(e) => setNewJobCard({ ...newJobCard, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm md:text-base"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newJobCard.vehicle}
                    onChange={(e) => setNewJobCard({ ...newJobCard, vehicle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm md:text-base"
                    placeholder="e.g., Honda City 2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newJobCard.registration}
                    onChange={(e) => setNewJobCard({ ...newJobCard, registration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm md:text-base"
                    placeholder="e.g., PB10AB1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newJobCard.serviceType}
                    onChange={(e) => setNewJobCard({ ...newJobCard, serviceType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm md:text-base"
                    placeholder="e.g., Routine Maintenance"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newJobCard.description}
                  onChange={(e) => setNewJobCard({ ...newJobCard, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm md:text-base"
                  placeholder="Enter service description"
                />
              </div>

              {/* Priority, Location, Estimates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newJobCard.priority}
                    onChange={(e) => setNewJobCard({ ...newJobCard, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm md:text-base"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={newJobCard.location}
                    onChange={(e) => setNewJobCard({ ...newJobCard, location: e.target.value as ServiceLocation })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm md:text-base"
                  >
                    <option value="Station">Station</option>
                    <option value="Home Service">Home Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Cost <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newJobCard.estimatedCost}
                    onChange={(e) => setNewJobCard({ ...newJobCard, estimatedCost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm md:text-base"
                    placeholder="e.g., ₹3,500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newJobCard.estimatedTime}
                    onChange={(e) => setNewJobCard({ ...newJobCard, estimatedTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm md:text-base"
                    placeholder="e.g., 2 hours"
                  />
                </div>
              </div>

              {/* Parts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Parts (comma-separated)
                </label>
                <input
                  type="text"
                  value={newJobCard.parts?.join(", ") || ""}
                  onChange={(e) => {
                    const parts = e.target.value.split(",").map((p) => p.trim()).filter((p) => p);
                    setNewJobCard({ ...newJobCard, parts });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm md:text-base"
                  placeholder="e.g., Engine Oil, Air Filter"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-3 md:pt-4 border-t">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium hover:bg-gray-200 transition text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateJobCard}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium hover:opacity-90 transition text-sm md:text-base"
                >
                  Create Job Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <p className="text-xs md:text-sm text-gray-700 break-words">
                      <strong>Location:</strong> {selectedJob.location}
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
                {selectedJob.status === "Created" && (
                  <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium hover:opacity-90 transition text-sm md:text-base">
                    Assign Engineer
                  </button>
                )}
                {selectedJob.status === "In Progress" && (
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium hover:opacity-90 transition text-sm md:text-base">
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}