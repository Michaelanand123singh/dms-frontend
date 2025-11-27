"use client";

import { useState } from "react";
import { approvalData, detailedServiceRequests, detailedWarrantyClaims, type DetailedRequest } from "@/__mocks__/data";
import { Eye, X, Check, FileText, User, Building, Paperclip, Menu, ChevronDown } from "lucide-react";

// Types - DetailedRequest imported from mock data

interface ApprovalItem {
  id: string;
  type: string;
  submittedBy: string;
  submittedByInitial: string;
  scLocation: string;
  amount: string;
  dateSubmitted: string;
  status: string;
}

interface ApprovalData {
  serviceRequests: ApprovalItem[];
  warrantyClaims: ApprovalItem[];
  inventoryTransfers: ApprovalItem[];
  stockAdjustments: ApprovalItem[];
  discountRequests: ApprovalItem[];
}

type TabType = "serviceRequests" | "warrantyClaims" | "inventoryTransfers" | "stockAdjustments" | "discountRequests";

// All data imported from __mocks__/data

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("serviceRequests");
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DetailedRequest | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Calculate total pending approvals
  const totalPending =
    approvalData.serviceRequests.length +
    approvalData.warrantyClaims.length +
    approvalData.inventoryTransfers.length +
    approvalData.stockAdjustments.length +
    approvalData.discountRequests.length;

  // Get current tab data
  const getCurrentTabData = (): ApprovalItem[] => {
    switch (activeTab) {
      case "serviceRequests":
        return approvalData.serviceRequests;
      case "warrantyClaims":
        return approvalData.warrantyClaims;
      case "inventoryTransfers":
        return approvalData.inventoryTransfers;
      case "stockAdjustments":
        return approvalData.stockAdjustments;
      case "discountRequests":
        return approvalData.discountRequests;
      default:
        return [];
    }
  };

  // Get count for each tab
  const getTabCount = (tab: TabType): number => {
    switch (tab) {
      case "serviceRequests":
        return approvalData.serviceRequests.length;
      case "warrantyClaims":
        return approvalData.warrantyClaims.length;
      case "inventoryTransfers":
        return approvalData.inventoryTransfers.length;
      case "stockAdjustments":
        return approvalData.stockAdjustments.length;
      case "discountRequests":
        return approvalData.discountRequests.length;
      default:
        return 0;
    }
  };

  const currentData = getCurrentTabData();

  const handleView = (requestId: string) => {
    // Show modal for service requests
    if (activeTab === "serviceRequests" && detailedServiceRequests[requestId]) {
      setSelectedRequest(detailedServiceRequests[requestId]);
      setShowModal(true);
    }
    // Show modal for warranty claims
    else if (activeTab === "warrantyClaims" && detailedWarrantyClaims[requestId]) {
      setSelectedRequest(detailedWarrantyClaims[requestId]);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  const handleApprove = () => {
    // Handle approve action
    // TODO: Implement API call to approve request
    handleCloseModal();
  };

  const handleReject = () => {
    // Handle reject action
    // TODO: Implement API call to reject request
    handleCloseModal();
  };

  const handleDownload = (url: string) => {
    // Handle download action
    // TODO: Implement download functionality
    window.open(url, "_blank");
  };

  // Tab labels for mobile dropdown
  const tabLabels: Record<TabType, string> = {
    serviceRequests: "Service Requests (>₹5,000)",
    warrantyClaims: "Warranty Claims",
    inventoryTransfers: "Inventory Transfers",
    stockAdjustments: "Stock Adjustments (>5 units)",
    discountRequests: "Discount Requests"
  };

  return (
    <div className="min-h-screen bg-[#f9f9fb] p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                Pending Approvals
              </h1>
              <button 
                className="sm:hidden p-2 text-gray-600"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu size={24} />
              </button>
            </div>
            <span className="bg-blue-500 text-white px-3 py-1 rounded-lg text-base sm:text-lg font-semibold w-fit">
              {totalPending}
            </span>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Review and approve or reject pending requests from service centers.
          </p>
        </div>

        {/* Mobile Dropdown for Tabs */}
        <div className="block sm:hidden mb-4">
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabType)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="serviceRequests">
                Service Requests (&gt;₹5,000) ({getTabCount("serviceRequests")})
              </option>
              <option value="warrantyClaims">
                Warranty Claims ({getTabCount("warrantyClaims")})
              </option>
              <option value="inventoryTransfers">
                Inventory Transfers ({getTabCount("inventoryTransfers")})
              </option>
              <option value="stockAdjustments">
                Stock Adjustments (&gt;5 units) ({getTabCount("stockAdjustments")})
              </option>
              <option value="discountRequests">
                Discount Requests ({getTabCount("discountRequests")})
              </option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Filter Tabs - Desktop */}
        <div className="hidden sm:flex flex-wrap gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab("serviceRequests")}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm sm:text-base ${
              activeTab === "serviceRequests"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Service Requests (&gt;₹5,000)
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                activeTab === "serviceRequests"
                  ? "bg-white text-blue-600"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {getTabCount("serviceRequests")}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("warrantyClaims")}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm sm:text-base ${
              activeTab === "warrantyClaims"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Warranty Claims
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                activeTab === "warrantyClaims"
                  ? "bg-white text-blue-600"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {getTabCount("warrantyClaims")}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("inventoryTransfers")}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm sm:text-base ${
              activeTab === "inventoryTransfers"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Inventory Transfers
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                activeTab === "inventoryTransfers"
                  ? "bg-white text-blue-600"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {getTabCount("inventoryTransfers")}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("stockAdjustments")}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm sm:text-base ${
              activeTab === "stockAdjustments"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Stock Adjustments (&gt;5 units)
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                activeTab === "stockAdjustments"
                  ? "bg-white text-blue-600"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {getTabCount("stockAdjustments")}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("discountRequests")}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm sm:text-base ${
              activeTab === "discountRequests"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Discount Requests
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                activeTab === "discountRequests"
                  ? "bg-white text-blue-600"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {getTabCount("discountRequests")}
            </span>
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    REQUEST ID
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    TYPE
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SUBMITTED BY
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SC LOCATION
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    AMOUNT/QUANTITY
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    DATE SUBMITTED
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.length > 0 ? (
                  currentData.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                        <span className="text-blue-600 font-medium text-sm sm:text-base">
                          {request.id}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                        <span className="text-gray-900 text-sm sm:text-base">{request.type}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                            {request.submittedByInitial}
                          </div>
                          <span className="text-gray-900 text-sm sm:text-base">
                            {request.submittedBy}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                        <span className="text-gray-900 text-sm sm:text-base">
                          {request.scLocation}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                        <span className="text-gray-900 text-sm sm:text-base">{request.amount}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                        <span className="text-gray-900 text-sm sm:text-base">
                          {request.dateSubmitted}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {request.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleView(request.id)}
                          className="bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
                        >
                          <Eye size={14} className="sm:w-4 sm:h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500 text-sm sm:text-base"
                    >
                      No pending requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">{tabLabels[activeTab]}</h2>
          {currentData.length > 0 ? (
            currentData.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-blue-600 font-medium text-base">{request.id}</span>
                      <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {request.status}
                      </span>
                    </div>
                    <span className="text-gray-900 font-medium text-sm">{request.type}</span>
                  </div>

                  {/* Submitted By */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                      {request.submittedByInitial}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium text-sm">{request.submittedBy}</p>
                      <p className="text-gray-600 text-xs">{request.scLocation}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs">Amount/Quantity</p>
                      <p className="text-gray-900 font-medium">{request.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Date Submitted</p>
                      <p className="text-gray-900">{request.dateSubmitted}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleView(request.id)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No pending requests found</p>
            </div>
          )}
        </div>
      </div>

      {/* Service Request Detail Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <div className="flex flex-col gap-1 sm:gap-2">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black">
                  {selectedRequest.type} - {selectedRequest.id}
                </h2>
                <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-md text-xs font-medium bg-orange-500 text-white w-fit">
                  Pending Approval
                </span>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Request Information */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <FileText className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
                  <h3 className="text-base sm:text-lg font-semibold text-blue-600">
                    Request Information
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase">
                      DESCRIPTION
                    </label>
                    <p className="text-sm sm:text-base text-gray-800 mt-1">
                      {selectedRequest.description}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase">
                      AMOUNT
                    </label>
                    <p className="text-sm sm:text-base font-semibold text-blue-600 mt-1">
                      {selectedRequest.amount}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase">
                      DATE SUBMITTED
                    </label>
                    <p className="text-sm sm:text-base text-gray-800 mt-1">
                      {selectedRequest.dateSubmitted}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase">
                      PRIORITY
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedRequest.priority === "High"
                            ? "bg-red-100 text-red-800"
                            : selectedRequest.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {selectedRequest.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submitted By */}
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <User className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
                  <h3 className="text-base sm:text-lg font-semibold text-blue-600">
                    Submitted By
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                      {selectedRequest.submittedByInitial}
                    </div>
                    <div className="flex-1">
                      <p className="text-base sm:text-lg font-semibold text-gray-800">
                        {selectedRequest.submittedBy}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {selectedRequest.submittedByRole}
                      </p>
                      <a
                        href={`mailto:${selectedRequest.submittedByEmail}`}
                        className="text-xs sm:text-sm text-blue-600 hover:underline mt-1 block"
                      >
                        {selectedRequest.submittedByEmail}
                      </a>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {selectedRequest.submittedByPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SC Location */}
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Building className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
                  <h3 className="text-base sm:text-lg font-semibold text-blue-600">
                    SC Location
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase">
                        SERVICE CENTER
                      </label>
                      <p className="text-sm sm:text-base font-semibold text-gray-800 mt-1">
                        {selectedRequest.scLocation}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase">
                        MANAGER
                      </label>
                      <p className="text-sm sm:text-base text-gray-800 mt-1">
                        {selectedRequest.scManager}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supporting Documents */}
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Paperclip className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <h3 className="text-base sm:text-lg font-semibold text-blue-600">
                    Supporting Documents
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {selectedRequest.supportingDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <FileText className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base text-gray-800 break-words">{doc.name}</span>
                      </div>
                      <button
                        onClick={() => handleDownload(doc.url)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition text-xs sm:text-sm font-medium w-full sm:w-auto"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm sm:text-base order-3 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
              >
                <X size={16} className="sm:w-4 sm:h-4" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 text-sm sm:text-base order-2 sm:order-3"
              >
                <Check size={16} className="sm:w-4 sm:h-4" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

