"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Eye, Edit, Search, Filter, PlusCircle, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

import type { JobCard, JobCardStatus, Priority, ServiceLocation } from "@/shared/types";
import { defaultJobCards, availableParts } from "@/__mocks__/data/job-cards.mock";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { getServiceCenterContext } from "@/shared/lib/serviceCenter";
import { SERVICE_TYPE_OPTIONS } from "@/shared/constants/service-types";

const STATUS_OPTIONS: ("All" | JobCardStatus)[] = [
  "All",
  "Created",
  "Assigned",
  "In Progress",
  "Parts Pending",
  "Completed",
  "Invoiced",
];

const STATUS_CLASSES: Record<JobCardStatus, string> = {
  Created: "border-gray-200 bg-gray-50 text-gray-700",
  Assigned: "border-blue-200 bg-blue-50 text-blue-700",
  "In Progress": "border-yellow-200 bg-yellow-50 text-yellow-700",
  "Parts Pending": "border-orange-200 bg-orange-50 text-orange-700",
  Completed: "border-green-200 bg-green-50 text-green-700",
  Invoiced: "border-purple-200 bg-purple-50 text-purple-700",
};

const PRIORITY_CLASSES: Record<string, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-600 text-white",
  Normal: "bg-blue-600 text-white",
  Low: "bg-gray-600 text-white",
};

type CreateJobCardForm = {
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
};

const SERVICE_CENTER_CODE_MAP: Record<string, string> = {
  "1": "SC001",
  "2": "SC002",
  "3": "SC003",
};

const INITIAL_CREATE_FORM: CreateJobCardForm = {
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
};

export default function AdvisorJobCardsPage() {
  const [jobCards, setJobCards] = useState<JobCard[]>(() => {
    if (typeof window === "undefined") {
      return defaultJobCards;
    }
    const stored = safeStorage.getItem<JobCard[]>("jobCards", []);
    return stored.length > 0 ? stored : defaultJobCards;
  });

  const [statusFilter, setStatusFilter] = useState<"All" | JobCardStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const stored = safeStorage.getItem<JobCard[]>("jobCards", []);
    if (stored.length > 0) {
      setJobCards((current) => {
        const existingIds = new Set(current.map((job) => job.id));
        const newJobs = stored.filter((card) => !existingIds.has(card.id));
        return [...newJobs, ...current];
      });
    }
  }, []);

  const filteredJobs = useMemo(() => {
    return jobCards.filter((job) => {
      if (statusFilter !== "All" && job.status !== statusFilter) {
        return false;
      }
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      return (
        job.customerName.toLowerCase().includes(term) ||
        job.vehicle.toLowerCase().includes(term) ||
        job.registration.toLowerCase().includes(term) ||
        job.jobCardNumber.toLowerCase().includes(term)
      );
    });
  }, [jobCards, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<JobCardStatus, number> = {
      Created: 0,
      Assigned: 0,
      "In Progress": 0,
      "Parts Pending": 0,
      Completed: 0,
      Invoiced: 0,
    };
    jobCards.forEach((job) => {
      counts[job.status] = (counts[job.status] || 0) + 1;
    });
    return counts;
  }, [jobCards]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateJobCardForm>({ ...INITIAL_CREATE_FORM });
  const [creatingJobCard, setCreatingJobCard] = useState(false);
  const serviceCenterContext = useMemo(() => getServiceCenterContext(), []);

  const resetCreateForm = () => {
    setCreateForm({ ...INITIAL_CREATE_FORM });
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

  const togglePartSelection = (partName: string) => {
    setCreateForm((prev) => ({
      ...prev,
      selectedParts: prev.selectedParts.includes(partName)
        ? prev.selectedParts.filter((part) => part !== partName)
        : [...prev.selectedParts, partName],
    }));
  };

  const createJobCard = async (formData: CreateJobCardForm) => {
    try {
      setCreatingJobCard(true);
      const serviceCenterId = String(serviceCenterContext.serviceCenterId ?? "1");
      const serviceCenterCode =
        SERVICE_CENTER_CODE_MAP[serviceCenterId] || "SC001";
      const jobCardNumber = generateJobCardNumber(serviceCenterCode);
      const newJobCard: JobCard = {
        id: `JC-${Date.now()}`,
        jobCardNumber,
        serviceCenterId,
        serviceCenterCode,
        customerId: formData.customerId || `customer-${Date.now()}`,
        customerName: formData.customerName,
        vehicleId: formData.vehicleId,
        vehicle: `${formData.vehicleMake} ${formData.vehicleModel}`.trim() ||
          formData.vehicleRegistration ||
          formData.vehicleMake,
        registration: formData.vehicleRegistration,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        serviceType: formData.serviceType,
        description: formData.description,
        status: "Created",
        priority: formData.priority,
        assignedEngineer: null,
        estimatedCost: formData.estimatedCost
          ? `₹${parseFloat(formData.estimatedCost).toLocaleString("en-IN")}`
          : "₹0",
        estimatedTime: formData.estimatedTime,
        createdAt: new Date().toISOString(),
        parts: formData.selectedParts,
        location: formData.location,
        serviceCenterName:
          serviceCenterContext.serviceCenterName || "Service Center",
      };
      const existingJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
      const updatedStored = [newJobCard, ...existingJobCards];
      safeStorage.setItem("jobCards", updatedStored);
      setJobCards((prev) => [newJobCard, ...prev]);
      resetCreateForm();
      setShowCreateModal(false);
      alert("Job card created successfully.");
    } catch (error) {
      console.error("Error creating job card:", error);
      alert("Failed to create job card. Please try again.");
    } finally {
      setCreatingJobCard(false);
    }
  };

  const handleCreateSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!createForm.customerName || !createForm.serviceType || !createForm.description) {
      alert("Please fill in all required fields.");
      return;
    }
    createJobCard(createForm);
  };
  const router = useRouter();

  const handleCreateJobCard = () => {
    setShowCreateModal(true);
  };

  const handleView = (jobId: string) => {
    router.push(`/sc/job-cards/${jobId}`);
  };

  const handleEdit = (jobId: string) => {
    router.push(`/sc/job-cards/${jobId}?action=edit`);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-600">Service Advisor</p>
            <h1 className="text-3xl font-semibold text-gray-900">Job Cards</h1>
            <p className="text-sm text-gray-500">Browse all job cards and take action directly from this dashboard.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-indigo-300">
              Export List
            </button>
            <button
              onClick={handleCreateJobCard}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Create Job Card
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center">
          <label className="relative flex flex-1 items-center">
            <Search size={16} className="absolute left-3 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Search by job card, customer, vehicle..."
            />
          </label>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <Filter size={16} />
            <select
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "All" | JobCardStatus)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {STATUS_OPTIONS.slice(1).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status as "All" | JobCardStatus)}
              className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                statusFilter === status
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-indigo-400"
              }`}
            >
              {status} ({statusCounts[status as JobCardStatus] ?? 0})
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              No job cards match the current filters. Try another term or reset the filters.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <article key={job.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase text-gray-400">Job Card</p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-gray-900">{job.jobCardNumber}</h2>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[job.status]}`}>
                        {job.status}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${PRIORITY_CLASSES[job.priority] ?? "bg-blue-600 text-white"}`}>
                        {job.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{job.customerName} · {job.vehicle}</p>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => handleView(job.id)}
                      className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 font-semibold text-gray-600 hover:border-indigo-400"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(job.id)}
                      className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 font-semibold text-white hover:bg-indigo-700"
                    >
                      <Edit size={14} /> Edit
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase text-gray-500">Service Type</p>
                    <p className="text-base font-semibold text-gray-900">{job.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-500">Assigned Engineer</p>
                    <p className="text-base font-semibold text-gray-900">{job.assignedEngineer ?? "Unassigned"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-500">Estimated Time</p>
                    <p className="text-base font-semibold text-gray-900">{job.estimatedTime || "TBD"}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500 sm:grid-cols-3">
                  <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                  {job.startTime && <span>Started: {job.startTime}</span>}
                  {job.completedAt && <span>Completed: {job.completedAt}</span>}
                </div>
              </article>
            ))
          )}
        </div>
        </div>
      </div>
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create Job Card</h2>
              <button
                type="button"
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
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, customerName: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                    placeholder="Enter or search customer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration</label>
                  <input
                    type="text"
                    value={createForm.vehicleRegistration}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, vehicleRegistration: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="PB10AB1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Make</label>
                  <input
                    type="text"
                    value={createForm.vehicleMake}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, vehicleMake: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Honda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    value={createForm.vehicleModel}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, vehicleModel: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createForm.serviceType}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, serviceType: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  >
                    <option value="">Select Service Type</option>
                    {SERVICE_TYPE_OPTIONS.map((type) => (
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
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        location: e.target.value as ServiceLocation,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  >
                    <option value="Station">Station</option>
                    <option value="Home Service">Home Service</option>
                  </select>
                </div>
                {createForm.location === "Home Service" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Home Address</label>
                    <textarea
                      value={createForm.homeAddress}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, homeAddress: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      rows={2}
                      placeholder="Enter pick-up or service address"
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
                      const formatted = e.target.value.replace(/[^0-9]/g, "");
                      setCreateForm((prev) => ({ ...prev, estimatedCost: formatted }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="3500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
                  <input
                    type="text"
                    value={createForm.estimatedTime}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, estimatedTime: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="2 hours"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, priority: e.target.value as Priority }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  rows={4}
                  placeholder="Describe the service needed..."
                  required
                />
              </div>

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
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
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
                        className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1"
                      >
                        {part}
                        <button
                          type="button"
                          onClick={() => togglePartSelection(part)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
                  disabled={creatingJobCard}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingJobCard}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {creatingJobCard ? (
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
    </>
  );
}