"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Eye, UserCheck, FileText, ShieldCheck, ShieldX } from "lucide-react";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import type { Quotation } from "@/shared/types";

export default function Approvals() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  // Load quotations from localStorage
  useEffect(() => {
    const loadQuotations = () => {
      const storedQuotations = safeStorage.getItem<Quotation[]>("quotations", []);
      // Filter only quotations sent to manager (these are quotations that customer has approved)
      const pendingApprovals = storedQuotations.filter(
        (q) => q.status === "sent_to_manager"
      );
      setQuotations(pendingApprovals);
    };

    loadQuotations();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadQuotations();
    };

    window.addEventListener("storage", handleStorageChange);
    // Also check periodically for same-tab updates
    const interval = setInterval(loadQuotations, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleApprove = (quotationId: string): void => {
    if (!confirm("Approve this quotation? This will allow job card creation.")) {
      return;
    }

    const updatedQuotations = quotations.map((q) =>
      q.id === quotationId
        ? {
            ...q,
            status: "manager_approved" as const,
            managerApproved: true,
            managerApprovedAt: new Date().toISOString(),
          }
        : q
    );

    // Update all quotations in localStorage
    const allQuotations = safeStorage.getItem<Quotation[]>("quotations", []);
    const updatedAllQuotations = allQuotations.map((q) =>
      q.id === quotationId
        ? {
            ...q,
            status: "manager_approved" as const,
            managerApproved: true,
            managerApprovedAt: new Date().toISOString(),
          }
        : q
    );
    safeStorage.setItem("quotations", updatedAllQuotations);
    setQuotations(updatedQuotations.filter((q) => q.status === "sent_to_manager"));
    alert("Quotation approved by manager!");
  };

  const handleReject = (quotationId: string): void => {
    if (!confirm("Reject this quotation? This will notify the service advisor.")) {
      return;
    }

    const updatedQuotations = quotations.map((q) =>
      q.id === quotationId
        ? {
            ...q,
            status: "manager_rejected" as const,
            managerRejected: true,
            managerRejectedAt: new Date().toISOString(),
          }
        : q
    );

    // Update all quotations in localStorage
    const allQuotations = safeStorage.getItem<Quotation[]>("quotations", []);
    const updatedAllQuotations = allQuotations.map((q) =>
      q.id === quotationId
        ? {
            ...q,
            status: "manager_rejected" as const,
            managerRejected: true,
            managerRejectedAt: new Date().toISOString(),
          }
        : q
    );
    safeStorage.setItem("quotations", updatedAllQuotations);
    setQuotations(updatedQuotations.filter((q) => q.status === "sent_to_manager"));
    alert("Quotation rejected!");
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Approvals</h1>
          <p className="text-gray-500">Review and approve pending requests</p>
        </div>

        <div className="space-y-4">
          {quotations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Pending Approvals</h3>
              <p className="text-gray-500">There are no quotations pending your approval at this time.</p>
            </div>
          ) : (
            quotations.map((quotation) => (
              <div key={quotation.id} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="text-blue-600" size={20} />
                      <span className="font-semibold text-lg">{quotation.quotationNumber}</span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Pending Approval
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-gray-700">
                        <span className="font-semibold">Customer:</span>{" "}
                        {quotation.customer?.firstName || ""} {quotation.customer?.lastName || ""}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Vehicle:</span>{" "}
                        {quotation.vehicle?.make || ""} {quotation.vehicle?.model || ""} ({quotation.vehicle?.registration || ""})
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Total Amount:</span>{" "}
                        <span className="text-green-600 font-bold">₹{quotation.totalAmount.toLocaleString("en-IN")}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Date: {new Date(quotation.quotationDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    {/* Customer Approval Status */}
                    {quotation.customerApproved && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <UserCheck className="text-green-600" size={18} />
                          <span className="font-semibold text-green-700">Approved by Customer</span>
                        </div>
                        {quotation.customerApprovedAt && (
                          <p className="text-sm text-green-600 ml-6">
                            Approved on: {new Date(quotation.customerApprovedAt).toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                    )}

                    {quotation.customerRejected && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="text-red-600" size={18} />
                          <span className="font-semibold text-red-700">Rejected by Customer</span>
                        </div>
                        {quotation.customerRejectedAt && (
                          <p className="text-sm text-red-600 ml-6">
                            Rejected on: {new Date(quotation.customerRejectedAt).toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleApprove(quotation.id)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-medium"
                    >
                      <ShieldCheck size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(quotation.id)}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium"
                    >
                      <ShieldX size={18} />
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        // Open quotation view modal or navigate to quotations page
                        window.location.href = `/sc/quotations?view=${quotation.id}`;
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                    >
                      <Eye size={18} />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

