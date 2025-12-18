"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardList, ArrowLeft } from "lucide-react";
import type { JobCard } from "@/shared/types";
import { defaultJobCards } from "@/__mocks__/data/job-cards.mock";
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

const fetchJobCard = (id: string): JobCard | undefined => {
  if (typeof window !== "undefined") {
    try {
      // Migrate existing job cards before fetching
      const { migrateAllJobCards } = require("../utils/migrateJobCards.util");
      const stored = migrateAllJobCards();
      const merged = [...stored, ...defaultJobCards];
      
      // Debug logging (remove in production)
      if (process.env.NODE_ENV === "development") {
        console.log("Looking for job card with ID:", id);
        console.log("Stored job cards:", stored.length);
        console.log("Available IDs:", merged.map(c => ({ id: c.id, jobCardNumber: c.jobCardNumber })));
      }
      
      // Try multiple lookup strategies
      const found = merged.find((card) => {
        // Exact match on id
        if (card.id === id) return true;
        // Exact match on jobCardNumber
        if (card.jobCardNumber === id) return true;
        return false;
      });
      
      if (found && process.env.NODE_ENV === "development") {
        console.log("Found job card:", found);
      }
      
      return found;
    } catch (error) {
      console.error("Error fetching job card:", error);
      // Fallback to default job cards
      return defaultJobCards.find((card) => card.id === id || card.jobCardNumber === id);
    }
  }
  return defaultJobCards.find((card) => card.id === id || card.jobCardNumber === id);
};

export default function AdvisorJobCardDetailPage({ params, searchParams }: AdvisorJobCardPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams || Promise.resolve({ temp: undefined }));
  
  const [jobCard, setJobCard] = useState<JobCard | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const found = fetchJobCard(resolvedParams.id);
      setJobCard(found);
      setLoading(false);
      
      // Also listen for storage changes in case job card is updated in another tab
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "jobCards") {
          const updated = fetchJobCard(resolvedParams.id);
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

  // Always show the form modal for editing job cards
  return (
    <JobCardFormModal
      open={true}
      mode="edit"
      jobCardId={jobCard.id}
      initialValues={jobCardToFormInitialValues(jobCard)}
      onClose={() => router.push("/sc/job-cards")}
      onCreated={() => {}} // Not used in edit mode
      onUpdated={(updatedJobCard) => {
        // Update local state
        setJobCard(updatedJobCard);
        // Redirect to updated job card
        router.push(`/sc/job-cards/${updatedJobCard.id}`);
      }}
      onError={(error) => {
        console.error("Error updating job card:", error);
      }}
    />
  );
}

