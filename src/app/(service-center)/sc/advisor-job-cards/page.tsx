"use client";
import { useEffect, useMemo, useState } from "react";
import { Eye, Edit, Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

import type { JobCard, JobCardStatus } from "@/shared/types";
import { defaultJobCards } from "@/__mocks__/data/job-cards.mock";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";

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
  const router = useRouter();

  const handleView = (jobId: string) => {
    router.push(`/sc/job-cards/${jobId}`);
  };

  const handleEdit = (jobId: string) => {
    router.push(`/sc/job-cards/${jobId}?action=edit`);
  };

  return (
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
            <button className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
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
  );
}