"use client";
import { useState } from "react";
import {
  Wrench,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  BarChart3,
  UserPlus,
  Filter,
  X,
  Search,
} from "lucide-react";
import type { Engineer, WorkshopStats, ActiveJob, EngineerStatus, Workload, Priority } from "@/shared/types";

export default function Workshop() {
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedJobForAction, setSelectedJobForAction] = useState<ActiveJob | null>(null);
  const [selectedEngineerForAssign, setSelectedEngineerForAssign] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Mock data
  const engineers: Engineer[] = [
    {
      id: 1,
      name: "Engineer 1",
      status: "Busy",
      currentJobs: 2,
      completedToday: 3,
      utilization: 85,
      skills: ["Engine", "AC", "General"],
      workload: "High",
    },
    {
      id: 2,
      name: "Engineer 2",
      status: "Available",
      currentJobs: 1,
      completedToday: 2,
      utilization: 65,
      skills: ["Brakes", "Suspension"],
      workload: "Medium",
    },
    {
      id: 3,
      name: "Engineer 3",
      status: "Available",
      currentJobs: 0,
      completedToday: 1,
      utilization: 45,
      skills: ["General", "Oil Change"],
      workload: "Low",
    },
  ];

  const workshopStats: WorkshopStats = {
    totalBays: 6,
    occupiedBays: 4,
    availableBays: 2,
    activeJobs: 8,
    completedToday: 12,
    averageServiceTime: "2.5 hours",
    utilizationRate: 78,
  };

  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([
    {
      id: "JC-2025-001",
      customer: "Rajesh Kumar",
      vehicle: "Honda City",
      serviceType: "Routine Maintenance",
      engineer: "Engineer 1",
      startTime: "10:00 AM",
      estimatedCompletion: "12:00 PM",
      status: "In Progress",
      priority: "Normal",
    },
    {
      id: "JC-2025-002",
      customer: "Priya Sharma",
      vehicle: "Maruti Swift",
      serviceType: "Repair",
      engineer: "Engineer 2",
      startTime: "11:00 AM",
      estimatedCompletion: "2:00 PM",
      status: "In Progress",
      priority: "High",
    },
  ]);

  // Filter active jobs based on filters
  const filteredActiveJobs = activeJobs.filter((job) => {
    const matchesStatus = filterStatus === "all" || job.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesPriority = filterPriority === "all" || job.priority.toLowerCase() === filterPriority.toLowerCase();
    const matchesSearch = searchQuery === "" || 
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleAssignEngineer = () => {
    if (!selectedJobForAction || !selectedEngineerForAssign) {
      alert("Please select a job and engineer");
      return;
    }
    const updatedJobs = activeJobs.map((job) =>
      job.id === selectedJobForAction.id
        ? { ...job, engineer: engineers.find((e) => e.id.toString() === selectedEngineerForAssign)?.name || job.engineer }
        : job
    );
    setActiveJobs(updatedJobs);
    setShowAssignModal(false);
    setSelectedJobForAction(null);
    setSelectedEngineerForAssign("");
    alert("Engineer assigned successfully!");
  };

  const handleCompleteJob = () => {
    if (!selectedJobForAction) {
      alert("Please select a job to complete");
      return;
    }
    const updatedJobs = activeJobs.filter((job) => job.id !== selectedJobForAction.id);
    setActiveJobs(updatedJobs);
    setShowCompleteModal(false);
    setSelectedJobForAction(null);
    alert("Job marked as completed!");
  };

  const getStatusColor = (status: EngineerStatus): string => {
    return status === "Available"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };

  const getWorkloadColor = (workload: Workload): string => {
    const colors: Record<Workload, string> = {
      Low: "bg-green-500",
      Medium: "bg-yellow-500",
      High: "bg-red-500",
    };
    return colors[workload] || colors.Medium;
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Workshop Management</h1>
          <p className="text-gray-500">Monitor workshop operations and engineer assignments</p>
        </div>

        {/* Workshop Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Wrench size={24} />
              </div>
              <span className="text-sm text-gray-500">Capacity</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {workshopStats.occupiedBays}/{workshopStats.totalBays}
            </h2>
            <p className="text-sm text-gray-600">Bays Occupied</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <CheckCircle size={24} />
              </div>
              <span className="text-sm text-gray-500">Today</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {workshopStats.completedToday}
            </h2>
            <p className="text-sm text-gray-600">Jobs Completed</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <Clock size={24} />
              </div>
              <span className="text-sm text-gray-500">Average</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {workshopStats.averageServiceTime}
            </h2>
            <p className="text-sm text-gray-600">Service Time</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                <TrendingUp size={24} />
              </div>
              <span className="text-sm text-gray-500">Utilization</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {workshopStats.utilizationRate}%
            </h2>
            <p className="text-sm text-gray-600">Workshop Capacity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Engineers List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Jobs */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Wrench className="text-blue-600" size={24} />
                Active Jobs
              </h2>
              <div className="space-y-4">
                {filteredActiveJobs.length > 0 ? (
                  filteredActiveJobs.map((job) => (
                    <div
                      key={job.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">{job.id}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {job.customer} • {job.vehicle}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            job.priority === "High"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {job.priority}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Service Type</p>
                          <p className="font-medium text-gray-800">{job.serviceType}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Engineer</p>
                          <p className="font-medium text-gray-800">{job.engineer}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Started</p>
                          <p className="font-medium text-gray-800">{job.startTime}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Est. Completion</p>
                          <p className="font-medium text-gray-800">{job.estimatedCompletion}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No active jobs found matching the filters.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Engineer Performance */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="text-purple-600" size={24} />
                Engineer Performance
              </h2>
              <div className="space-y-4">
                {engineers.map((engineer) => (
                  <div
                    key={engineer.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => setSelectedEngineer(engineer)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {engineer.name.split(" ")[1] || "E"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{engineer.name}</p>
                          <p className="text-xs text-gray-600">{engineer.skills.join(", ")}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          engineer.status
                        )}`}
                      >
                        {engineer.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Current Jobs</p>
                        <p className="font-semibold text-gray-800">{engineer.currentJobs}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Completed Today</p>
                        <p className="font-semibold text-gray-800">{engineer.completedToday}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Utilization</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getWorkloadColor(
                                engineer.workload
                              )}`}
                              style={{ width: `${engineer.utilization}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {engineer.utilization}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Capacity & Quick Actions */}
          <div className="space-y-6">
            {/* Capacity Overview */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="text-green-600" size={24} />
                Capacity Overview
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Bays</span>
                    <span className="font-semibold text-gray-800">
                      {workshopStats.totalBays}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {Array.from({ length: workshopStats.totalBays }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 h-8 rounded ${
                          idx < workshopStats.occupiedBays
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                        title={
                          idx < workshopStats.occupiedBays ? "Occupied" : "Available"
                        }
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Available Bays</span>
                    <span className="font-semibold text-green-600">
                      {workshopStats.availableBays}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Occupied Bays</span>
                    <span className="font-semibold text-red-600">
                      {workshopStats.occupiedBays}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (activeJobs.length === 0) {
                      alert("No active jobs available");
                      return;
                    }
                    setShowAssignModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition text-left flex items-center gap-2"
                >
                  <UserPlus size={20} />
                  Assign Engineer
                </button>
                <button
                  onClick={() => {
                    if (activeJobs.length === 0) {
                      alert("No active jobs available");
                      return;
                    }
                    setShowCompleteModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition text-left flex items-center gap-2"
                >
                  <CheckCircle size={20} />
                  Complete Job
                </button>
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition text-left flex items-center gap-2"
                >
                  <Filter size={20} />
                  Filter Jobs
                </button>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="text-orange-600" size={24} />
                Alerts
              </h2>
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-800">
                    High workload detected
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Engineer 1 has 2 active jobs
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800">
                    Parts pending
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    JC-2025-003 waiting for parts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Engineer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Assign Engineer</h2>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedJobForAction(null);
                  setSelectedEngineerForAssign("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Job</label>
                <select
                  value={selectedJobForAction?.id || ""}
                  onChange={(e) => {
                    const job = activeJobs.find((j) => j.id === e.target.value);
                    setSelectedJobForAction(job || null);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Select Job --</option>
                  {activeJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.id} - {job.customer} ({job.vehicle})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Engineer</label>
                <select
                  value={selectedEngineerForAssign}
                  onChange={(e) => setSelectedEngineerForAssign(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Select Engineer --</option>
                  {engineers
                    .filter((e) => e.status === "Available")
                    .map((engineer) => (
                      <option key={engineer.id} value={engineer.id.toString()}>
                        {engineer.name} ({engineer.skills.join(", ")})
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedJobForAction(null);
                    setSelectedEngineerForAssign("");
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignEngineer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Job Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Complete Job</h2>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedJobForAction(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Job to Complete</label>
                <select
                  value={selectedJobForAction?.id || ""}
                  onChange={(e) => {
                    const job = activeJobs.find((j) => j.id === e.target.value);
                    setSelectedJobForAction(job || null);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">-- Select Job --</option>
                  {activeJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.id} - {job.customer} ({job.vehicle})
                    </option>
                  ))}
                </select>
              </div>
              {selectedJobForAction && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Customer: <span className="font-medium">{selectedJobForAction.customer}</span></p>
                  <p className="text-sm text-gray-600 mb-1">Vehicle: <span className="font-medium">{selectedJobForAction.vehicle}</span></p>
                  <p className="text-sm text-gray-600">Service: <span className="font-medium">{selectedJobForAction.serviceType}</span></p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    setSelectedJobForAction(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteJob}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Complete Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Jobs Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Filter Jobs</h2>
              <button
                onClick={() => {
                  setShowFilterModal(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by job ID, customer, or vehicle..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="in progress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="on hold">On Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setFilterStatus("all");
                    setFilterPriority("all");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

