"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, X, Search, UserPlus, Car, FileText, CheckCircle } from "lucide-react";

import { getServiceCenterContext } from "@/shared/lib/serviceCenter";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { createPartsRequestFromJobCard } from "@/shared/utils/jobCardPartsRequest.util";
import { customerService } from "@/features/customers/services/customer.service";
import { jobCardService } from "@/features/job-cards/services/jobCard.service";
import CheckInSlip, { generateCheckInSlipNumber, type CheckInSlipData } from "@/components/check-in-slip/CheckInSlip";
import { getServiceCenterCode } from "@/shared/utils/service-center.utils";
import { JobCard } from "@/shared/types/job-card.types";
import { Quotation } from "@/shared/types/quotation.types";
import { CustomerWithVehicles, Vehicle } from "@/shared/types/vehicle.types";

// New Hooks, Utils and Sections
import { useJobCardForm } from "@/features/job-cards/hooks/useJobCardForm";
import { jobCardAdapter } from "@/features/job-cards/utils/jobCardAdapter";
import { useHydratedJobCard } from "@/shared/hooks/useHydratedJobCard";
import { CustomerVehicleSection } from "./sections/CustomerVehicleSection";
import { Part2ItemsSection } from "./sections/Part2ItemsSection";
import { DocumentationSection } from "./sections/DocumentationSection";
import { CheckInSection } from "./sections/CheckInSection";
import { CreateJobCardForm } from "@/features/job-cards/types/job-card.types";

interface JobCardFormModalProps {
  open: boolean;
  initialValues?: Partial<CreateJobCardForm>;
  jobCardId?: string;
  mode?: "create" | "edit";
  onClose: () => void;
  onCreated: (jobCard: JobCard) => void;
  onUpdated?: (jobCard: JobCard) => void;
  onError?: (message: string) => void;
}

export default function JobCardFormModal({
  open,
  initialValues,
  jobCardId,
  mode = "create",
  onClose,
  onCreated,
  onUpdated,
  onError,
}: JobCardFormModalProps) {
  const serviceCenterContext = useMemo(() => getServiceCenterContext(), []);
  const serviceCenterId = String(serviceCenterContext.serviceCenterId ?? "sc-001");
  const serviceCenterCode = getServiceCenterCode(serviceCenterId);

  const {
    form,
    setForm,
    updateFormField,
    isSubmitting,
    setIsSubmitting,
    resetForm,
    handleSelectQuotation,
    handleSelectCustomer,
  } = useJobCardForm({
    initialValues,
    serviceCenterId,
    onError,
  });

  const [previewJobCardNumber, setPreviewJobCardNumber] = useState<string>("");
  const [existingJobCard, setExistingJobCard] = useState<JobCard | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showCheckInSlip, setShowCheckInSlip] = useState(false);
  const [checkInSlipData, setCheckInSlipData] = useState<CheckInSlipData | null>(null);

  // Load existing job card if editing
  useEffect(() => {
    if (open && mode === "edit" && jobCardId) {
      const { migrateAllJobCards } = require("../../job-cards/utils/migrateJobCards.util");
      const jc = migrateAllJobCards().find((item: any) => item.id === jobCardId);
      if (jc) {
        setExistingJobCard(jc);
        setPreviewJobCardNumber(jc.jobCardNumber);
      }
    }
  }, [open, mode, jobCardId]);

  // Use hydration hook for live data
  const { jobCard: hydratedCard } = useHydratedJobCard(existingJobCard);

  // Update form with hydrated data when it becomes available
  useEffect(() => {
    if (hydratedCard && mode === "edit") {
      const mappedFormData = jobCardAdapter.mapJobCardToForm(hydratedCard);
      setForm((prev: CreateJobCardForm) => ({
        ...prev,
        ...mappedFormData
      }));
    }
  }, [hydratedCard, mode, setForm]);

  // Unified Search Logic (Quotations + Customers)
  useEffect(() => {
    if (!searchQuery.trim() || !open) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      try {
        setSearching(true);
        const query = searchQuery.toLowerCase();

        // 1. Search Approved Quotations
        const allQuotations = safeStorage.getItem<Quotation[]>("quotations", []);
        const approvedQuotations = allQuotations.filter(
          q => q.status === "customer_approved" || q.customerApproved === true
        );

        const quotationResults = approvedQuotations
          .filter(q => q.quotationNumber?.toLowerCase().includes(query))
          .map(async q => {
            try {
              const customer = await customerService.getById(q.customerId);
              const vehicle = customer.vehicles?.find(v => v.id.toString() === q.vehicleId);
              return { type: 'quotation' as const, quotation: q, customer, vehicle };
            } catch {
              return null;
            }
          });

        // 2. Search Customers Directly (Express Mode)
        const customerSearchResults = await customerService.search(searchQuery, "auto");
        const directCustomerResults = customerSearchResults.map(c => ({
          type: 'customer' as const,
          customer: c,
          vehicle: c.vehicles?.[0]
        }));

        const resolvedQuotationResults = (await Promise.all(quotationResults)).filter(Boolean);

        const combined = [
          ...resolvedQuotationResults,
          ...directCustomerResults
        ];

        setSearchResults(combined);
        setShowSearchResults(combined.length > 0);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.description) {
      onError?.("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { migrateAllJobCards } = require("../../job-cards/utils/migrateJobCards.util");
      const existingJobCards = migrateAllJobCards();
      const existingJobCard = mode === "edit" ? existingJobCards.find((jc: any) => jc.id === jobCardId) : null;

      const jobCardToSave = jobCardAdapter.mapFormToJobCard(
        form,
        serviceCenterId,
        serviceCenterCode,
        existingJobCard
      );

      if (mode === "edit") {
        await jobCardService.update(jobCardId!, jobCardToSave);
        onUpdated?.(jobCardToSave);
      } else {
        await jobCardService.create(jobCardToSave);
        onCreated(jobCardToSave);
      }

      // Create Parts Request if parts selected
      if (form.selectedParts && form.selectedParts.length > 0) {
        const requestedBy = `${serviceCenterContext.serviceCenterName || "Service Center"} - Advisor`;
        await createPartsRequestFromJobCard(jobCardToSave, requestedBy);
      }

      onClose();
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      onError?.("Failed to save job card.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateCheckInSlip = () => {
    if (!form.customerId) {
      onError?.("Please select a customer first.");
      return;
    }

    const slipNumber = generateCheckInSlipNumber(serviceCenterCode);
    const now = new Date();

    setCheckInSlipData({
      slipNumber,
      customerName: form.fullName || form.customerName,
      phone: form.mobilePrimary,
      email: form.email,
      vehicleMake: form.vehicleMake,
      vehicleModel: form.vehicleModel,
      registrationNumber: form.vehicleRegistration,
      vin: form.vinChassisNumber,
      checkInDate: now.toISOString().split('T')[0],
      checkInTime: now.toTimeString().slice(0, 5),
      serviceCenterName: serviceCenterContext.serviceCenterName || "Service Center",
      serviceCenterAddress: "",
      serviceCenterCity: "",
      serviceCenterState: "",
      serviceCenterPincode: "",
      serviceType: form.description || "General Service",
      notes: form.description,
    });
    setShowCheckInSlip(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl search-container">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FileText className="text-blue-600" size={28} />
              {mode === "edit" ? "Edit Job Card" : "Create New Job Card"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === "edit" ? "Modify existing job card details" : "Create a formal service record for the vehicle"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="jobCardForm" onSubmit={handleSubmit} className="space-y-8">
            {/* Search Section (Only for Create Mode) */}
            {mode === "create" && (
              <div className="relative mb-8">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-lg shadow-sm"
                    placeholder="Search by Customer Name, Phone, VIN, or Quotation Number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 size={24} className="animate-spin text-blue-500" />
                    </div>
                  )}
                </div>

                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (result.type === 'quotation') {
                            handleSelectQuotation(result.quotation, result.customer, result.vehicle);
                          } else {
                            handleSelectCustomer(result.customer, result.vehicle);
                          }
                          setSearchQuery("");
                          setShowSearchResults(false);
                        }}
                        className="w-full text-left p-4 hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${result.type === 'quotation' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {result.type === 'quotation' ? <FileText size={20} /> : <UserPlus size={20} />}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {result.customer.name} {result.type === 'quotation' && <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded ml-2">Quote Approved</span>}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                              <span>{result.customer.phone}</span>
                              {result.vehicle && (
                                <span className="flex items-center gap-1"><Car size={14} /> {result.vehicle.registration}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {result.type === 'quotation' && (
                          <div className="text-right">
                            <div className="text-xs font-mono text-gray-400 group-hover:text-blue-400">{result.quotation.quotationNumber}</div>
                            <div className="text-sm font-semibold text-blue-600">Apply Approved Quotation</div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sections */}
            <CustomerVehicleSection
              form={form}
              updateField={updateFormField}
              previewJobCardNumber={previewJobCardNumber}
            />

            <Part2ItemsSection
              form={form}
              updateField={updateFormField}
              onError={onError}
            />

            <DocumentationSection
              form={form}
              updateField={updateFormField}
            />

            <CheckInSection
              form={form}
              updateField={updateFormField}
            />
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleGenerateCheckInSlip}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <FileText size={20} className="text-blue-600" />
              Generate Check-in Slip
            </button>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 text-gray-600 font-bold hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="jobCardForm"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  {mode === "edit" ? "Update Job Card" : "Create Job Card"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showCheckInSlip && checkInSlipData && (
        <CheckInSlip
          onClose={() => setShowCheckInSlip(false)}
          data={checkInSlipData}
        />
      )}
    </div>
  );
}
