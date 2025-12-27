"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardList, ArrowLeft } from "lucide-react";
import type { JobCard } from "@/shared/types";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import JobCardFormModal from "../../components/job-cards/JobCardFormModal";
import { jobCardToFormInitialValues } from "../utils/jobCardToForm.util";

interface AdvisorJobCardPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    temp?: string;
  }>;
}

const fetchJobCard = async (id: string): Promise<JobCard | undefined> => {
  if (typeof window === "undefined") return undefined;

  try {
    // Import the job card service
    const { jobCardService } = await import("@/features/job-cards/services/jobCard.service");

    // Fetch job card directly by ID from API
    const jobCard = await jobCardService.getById(id);

    if (jobCard) {
      console.log("Found job card from API:", jobCard);
      return jobCard;
    }

    // Fallback to localStorage if not found in API
    const { migrateAllJobCards } = require("../utils/migrateJobCards.util");
    const stored = migrateAllJobCards();

    const found = stored.find((card: JobCard) =>
      card.id === id || card.jobCardNumber === id
    );

    if (found) {
      console.log("Found job card from localStorage:", found);
    }

    return found;
  } catch (error) {
    console.error("Error fetching job card:", error);
    return undefined;
  }
};

export default function AdvisorJobCardDetailPage({ params, searchParams }: AdvisorJobCardPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams || Promise.resolve({ temp: undefined }));

  const [jobCard, setJobCard] = useState<JobCard | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Use async IIFE to handle the promise
      (async () => {
        const found = await fetchJobCard(resolvedParams.id);
        setJobCard(found);
        setLoading(false);
      })();

      // Also listen for storage changes in case job card is updated in another tab
      const handleStorageChange = async (e: StorageEvent) => {
        if (e.key === "jobCards") {
          const updated = await fetchJobCard(resolvedParams.id);
          setJobCard(updated);
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [resolvedParams.id]);


  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9fb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job card...</p>
        </div>
      </div>
    );
  }

  if (!jobCard) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="rounded-2xl border border-red-200 bg-white px-8 py-6 text-center">
          <ClipboardList className="mx-auto text-red-600" size={32} />
          <p className="mt-4 text-lg font-semibold text-gray-900">Job card not found</p>
          <p className="text-sm text-gray-500">The job card you requested does not exist or may have been removed.</p>
          <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800" href="/sc/job-cards">
            <ArrowLeft size={16} />
            Back to job cards
          </Link>
        </div>
      </div>
    );
  }

  // Render as a full page instead of modal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/sc/job-cards")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Job Cards</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {jobCard.jobCardNumber || "Job Card Details"}
              </h1>
              <p className="text-sm text-gray-500">
                {jobCard.customerName} • {jobCard.registration}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${jobCard.status === "CREATED" ? "bg-blue-100 text-blue-700" :
              jobCard.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
                jobCard.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  "bg-gray-100 text-gray-700"
              }`}>
              {jobCard.status}
            </span>
          </div>
        </div>
      </div>

      {/* Job Card Form Content */}
      <div className="max-w-7xl mx-auto py-6 px-6">
        <JobCardFormModal
          open={true}
          mode="edit"
          jobCardId={jobCard.id}
          initialValues={jobCardToFormInitialValues(jobCard)}
          onClose={() => router.push("/sc/job-cards")}
          onCreated={() => { }} // Not used in edit mode
          onUpdated={(updatedJobCard) => {
            // Update local state
            setJobCard(updatedJobCard);
            // Navigate back to list
            router.push("/sc/job-cards");
          }}
          onError={(error) => {
            console.error("Error updating job card:", error);
          }}
          isFullPage={true}
        />
      </div>
    </div>
  );
}
