"use client";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { ArrowLeft, ClipboardList, Calendar, User, Car } from "lucide-react";
import type { JobCard } from "@/shared/types";
import { defaultJobCards } from "@/__mocks__/data/job-cards.mock";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";

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
    const stored = safeStorage.getItem<JobCard[]>("jobCards", []);
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

const formatDate = (date?: string) => {
  if (!date) return "—";
  try {
    // Handle ISO date strings
    if (date.includes("T") || date.includes("-")) {
      return new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return date;
  } catch {
    return date;
  }
};

export default function AdvisorJobCardDetailPage({ params, searchParams }: AdvisorJobCardPageProps) {
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

  const isTemporaryView = (resolvedSearchParams?.temp === "true") || jobCard?.isTemporary;

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


  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 md:mb-2">Job Card Details</h1>
            <p className="text-gray-500 text-sm md:text-base">{formatDate(jobCard.createdAt)} • {jobCard.status}</p>
          </div>
          {isTemporaryView && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700">
              Temporary job card (official copy generated after quotation approval)
            </div>
          )}
          <Link
            href="/sc/job-cards"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-indigo-400"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>

        {/* PART 1: CUSTOMER & VEHICLE INFORMATION */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
            Customer & Vehicle Information
          </h3>
          
          {/* TOP RIGHT: Job Card Number */}
          <div className="mb-4 flex justify-end">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold text-sm">
              Job Card: {jobCard.jobCardNumber || jobCard.id}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT SIDE */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Customer & Vehicle Details</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part1?.fullName || jobCard.customerName || "—"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number (Primary)
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part1?.mobilePrimary || "—"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Type
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part1?.customerType || jobCard.customerType || "—"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Brand
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part1?.vehicleBrand || jobCard.vehicleMake || jobCard.vehicle.split(" ")[0] || "—"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Model
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part1?.vehicleModel || jobCard.vehicleModel || jobCard.vehicle || "—"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part1?.registrationNumber || jobCard.registration || "—"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VIN / Chassis Number
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part1?.vinChassisNumber || "—"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variant / Battery Capacity
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part1?.variantBatteryCapacity || "—"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warranty Status
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part1?.warrantyStatus || jobCard.warrantyStatus || "—"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Delivery Date
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part1?.estimatedDeliveryDate ? formatDate(jobCard.part1.estimatedDeliveryDate) : formatDate(jobCard.createdAt)}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Address & Additional Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Address
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 min-h-[80px]">
                  {jobCard.part1?.customerAddress || "—"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Feedback / Concerns
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 min-h-[100px]">
                  {jobCard.part1?.customerFeedback || jobCard.description || "—"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technician Observation
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 min-h-[80px]">
                  {jobCard.part1?.technicianObservation || "—"}
            </div>
          </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Start Date
                  </label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                    {jobCard.part1?.insuranceStartDate ? formatDate(jobCard.part1.insuranceStartDate) : "—"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance End Date
                  </label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                    {jobCard.part1?.insuranceEndDate ? formatDate(jobCard.part1.insuranceEndDate) : "—"}
                  </div>
            </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Company Name
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part1?.insuranceCompanyName || "—"}
            </div>
          </div>

              {/* MANDATORY SERIAL DATA */}
              {(jobCard.part1?.batterySerialNumber || jobCard.part1?.mcuSerialNumber || jobCard.part1?.vcuSerialNumber || jobCard.part1?.otherPartSerialNumber) && (
                <div className="border-t pt-4 mt-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Serial Numbers (if applicable)</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {jobCard.part1.batterySerialNumber && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Battery Serial Number
                        </label>
                        <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900">
                          {jobCard.part1.batterySerialNumber}
                        </div>
                      </div>
                    )}
                    {jobCard.part1.mcuSerialNumber && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          MCU Serial Number
                        </label>
                        <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900">
                          {jobCard.part1.mcuSerialNumber}
                        </div>
                      </div>
                    )}
                    {jobCard.part1.vcuSerialNumber && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          VCU Serial Number
                        </label>
                        <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900">
                          {jobCard.part1.vcuSerialNumber}
                        </div>
                      </div>
                    )}
                    {jobCard.part1.otherPartSerialNumber && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Other Part Serial Number
                        </label>
                        <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900">
                          {jobCard.part1.otherPartSerialNumber}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PART 2: PARTS & WORK ITEMS LIST */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
            Parts & Work Items List
          </h3>

          {/* PART 2 Items Table */}
          {jobCard.part2 && jobCard.part2.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">SR NO</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Warranty Tag</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Part Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Part Code</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">QTY</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Amount</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Technician</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Labour Code</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobCard.part2.map((item) => (
                      <tr key={`${item.srNo}-${item.partCode}`} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-700 font-medium">{item.srNo}</td>
                        <td className="px-3 py-2 text-gray-700">{item.partWarrantyTag || "-"}</td>
                        <td className="px-3 py-2 text-gray-700">{item.partName}</td>
                        <td className="px-3 py-2 text-gray-700 font-mono text-xs">{item.partCode}</td>
                        <td className="px-3 py-2 text-gray-700">{item.qty}</td>
                        <td className="px-3 py-2 text-gray-700">₹{item.amount.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2 text-gray-700">{item.technician || "-"}</td>
                        <td className="px-3 py-2 text-gray-700">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.itemType === "work_item" 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {item.labourCode}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.itemType === "part"
                              ? "bg-green-100 text-green-700"
                              : "bg-purple-100 text-purple-700"
                          }`}>
                            {item.itemType === "part" ? "Part" : "Work Item"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-300 p-8 text-center text-gray-500">
              <p>No items added yet. Add items using the form above.</p>
            </div>
          )}
        </div>

        {/* PART 2A — WARRANTY / INSURANCE CASE DETAILS (only if applicable) */}
        {jobCard.part2A && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2A</span>
              Warranty / Insurance Case Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Evidence</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video Evidence</label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                    {jobCard.part2A.videoEvidence || "No"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VIN Image</label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                    {jobCard.part2A.vinImage || "No"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ODO Meter Image</label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                    {jobCard.part2A.odoImage || "No"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images of Damaged Parts</label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                    {jobCard.part2A.damageImages || "No"}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Issue Details</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description of Issue</label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 min-h-[80px]">
                    {jobCard.part2A.issueDescription || "—"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Observations</label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                    {jobCard.part2A.numberOfObservations || "—"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symptom</label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                    {jobCard.part2A.symptom || "—"}
                  </div>
          </div>
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Defect Part</label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                    {jobCard.part2A.defectPart || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PART 3 — PART REQUISITION & ISSUE DETAILS (if available) */}
        {jobCard.part3 && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Part Requisition & Issue Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part3.customerType || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Brand</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part3.vehicleBrand || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part3.vehicleModel || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part3.registrationNumber || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VIN / Chassis Number</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part3.vinChassisNumber || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Card Number</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part3.jobCardNumber || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part Code</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part3.partCode || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part3.partName || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">QTY</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part3.qty}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue QTY</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part3.issueQty}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return QTY</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part3.returnQty}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Tag Number</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part3.warrantyTagNumber || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Part Number</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900">
                  {jobCard.part3.returnPartNumber || "—"}
                </div>
              </div>
              {jobCard.part3.approvalDetails && (
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approval Mail / Details</label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 min-h-[80px]">
                    {jobCard.part3.approvalDetails}
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

