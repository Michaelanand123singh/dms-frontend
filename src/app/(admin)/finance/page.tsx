"use client";

import { useState } from "react";
import { invoiceData, serviceCentersList, type Invoice } from "@/__mocks__/data";
import { Eye, FileText, BarChart3, Calendar, X, Building, DollarSign, Check, Download, Printer } from "lucide-react";

// Types - Invoice imported from mock data

interface DetailedInvoice extends Invoice {
  location: string;
  paymentTerms: string;
  amountBreakdown: {
    laborCost: string;
    partsCost: string;
    tax: string;
    total: string;
  };
  paymentDate: string | null;
}

interface ReportFormData {
  reportType: string;
  fromDate: string;
  toDate: string;
  selectedServiceCenters: string[];
  paymentStatus: string;
  exportFormat: string;
}

// Helper function to get detailed invoice data
const getDetailedInvoiceData = (invoice: Invoice): DetailedInvoice => {
  // Service center locations mapping
  const scLocations: Record<string, string> = {
    "Delhi Central Hub": "Connaught Place, New Delhi",
    "Mumbai Metroplex": "Bandra Kurla Complex, Mumbai",
    "Bangalore Innovation Center": "Whitefield, Bangalore",
    "Pune Elite Care": "Hinjawadi, Pune",
    "Hyderabad Excellence": "HITEC City, Hyderabad",
  };

  // Calculate amount breakdown (simplified calculation)
  const totalAmount = parseInt(invoice.amount.replace(/[₹,]/g, ""));
  const laborCost = Math.round(totalAmount * 0.5);
  const partsCost = Math.round(totalAmount * 0.35);
  const tax = totalAmount - laborCost - partsCost;

  // Payment date (if paid, set to a date after issue date)
  const paymentDate = invoice.paymentStatus === "Paid" 
    ? new Date(new Date(invoice.dateIssued).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : null;

  return {
    ...invoice,
    location: scLocations[invoice.scName] || "Location not specified",
    paymentTerms: "Net 7 days",
    amountBreakdown: {
      laborCost: `₹${laborCost.toLocaleString("en-IN")}`,
      partsCost: `₹${partsCost.toLocaleString("en-IN")}`,
      tax: `₹${tax.toLocaleString("en-IN")}`,
      total: invoice.amount,
    },
    paymentDate: paymentDate,
  };
};

// All data imported from __mocks__/data

export default function FinancePage() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Report form state
  const [reportType, setReportType] = useState("");
  const [fromDate, setFromDate] = useState("2024-10-01");
  const [toDate, setToDate] = useState("2024-11-12");
  const [selectedServiceCenters, setSelectedServiceCenters] = useState<string[]>(["All Service Centers"]);
  const [paymentStatus, setPaymentStatus] = useState("All Status");
  const [exportFormat, setExportFormat] = useState("PDF");

  // Calculate summary statistics
  const totalPaid = invoiceData.filter((inv) => inv.paymentStatus === "Paid");
  const pending = invoiceData.filter((inv) => inv.paymentStatus === "Pending");
  const overdue = invoiceData.filter((inv) => inv.paymentStatus === "Overdue");

  // Calculate amounts (simplified - in real app, parse amounts properly)
  const totalPaidAmount = "₹61.7K";
  const pendingAmount = "₹28.4K";
  const overdueAmount = "₹16.5K";
  const todayRevenue = "₹19.1K";

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  const handleGenerateReport = () => {
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
  };

  const handleServiceCenterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedServiceCenters(options);
  };

  const handleExportReport = () => {
    // Handle report export
    // TODO: Implement report export functionality
    // Exporting report with: reportType, fromDate, toDate, selectedServiceCenters, paymentStatus, exportFormat
    // Close modal after export
    handleCloseReportModal();
  };

  const getStatusBadgeClass = (status: Invoice["paymentStatus"]): string => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-orange-100 text-orange-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9fb] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Finance Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage invoices, payments, and financial reports across all service
            centers.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Paid Card */}
          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                TOTAL PAID
              </p>
            </div>
            <div className="mb-2">
              <p className="text-2xl font-bold text-green-600">{totalPaidAmount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {totalPaid.length} invoices
              </p>
            </div>
          </div>

          {/* Pending Card */}
          <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-6">
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                PENDING
              </p>
            </div>
            <div className="mb-2">
              <p className="text-2xl font-bold text-orange-600">
                {pendingAmount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {pending.length} invoices
              </p>
            </div>
          </div>

          {/* Overdue Card */}
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                OVERDUE
              </p>
            </div>
            <div className="mb-2">
              <p className="text-2xl font-bold text-red-600">{overdueAmount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {overdue.length} invoices
              </p>
            </div>
          </div>

          {/* Today's Revenue Card */}
          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                TODAYS REVENUE
              </p>
            </div>
            <div className="mb-2">
              <p className="text-2xl font-bold text-blue-600">{todayRevenue}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                As of {new Date().toISOString().split("T")[0]}
              </p>
            </div>
          </div>
        </div>

        {/* All Invoices Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">All Invoices</h2>
            <button
              onClick={handleGenerateReport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium"
            >
              <BarChart3 size={16} />
              Generate Report
            </button>
          </div>

          {/* Invoice Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    INVOICE ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SC NAME
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    CUSTOMER NAME
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    AMOUNT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    DATE ISSUED
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    DUE DATE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    PAYMENT STATUS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoiceData.length > 0 ? (
                  invoiceData.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                          {invoice.id}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-gray-900">{invoice.scName}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-gray-900">
                          {invoice.customerName}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-gray-900 font-medium">
                          {invoice.amount}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-gray-900">{invoice.dateIssued}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-gray-900">{invoice.dueDate}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            invoice.paymentStatus
                          )}`}
                        >
                          {invoice.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(invoice)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">
                Configure and export your report
              </h2>
              <button
                onClick={handleCloseReportModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Report Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                  required
                >
                  <option value="">-- Select Report Type --</option>
                  <option value="sales">Sales Report</option>
                  <option value="revenue">Revenue Report</option>
                  <option value="tax">Tax Report</option>
                  <option value="outstanding">Outstanding Report</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    From Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10 text-black"
                    />
                    <Calendar
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    To Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10 text-black"
                    />
                    <Calendar
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>
              </div>

              {/* Service Center */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Service Center
                </label>
                <select
                  multiple
                  value={selectedServiceCenters}
                  onChange={handleServiceCenterChange}
                  size={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                >
                  {serviceCentersList.map((center) => (
                    <option
                      key={center}
                      value={center}
                      className={
                        selectedServiceCenters.includes(center)
                          ? "bg-blue-100 text-black"
                          : "text-black"
                      }
                    >
                      {center}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-black">
                  Hold Ctrl/Cmd to select multiple
                </p>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                >
                  <option value="All Status">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Export Format <span className="text-red-500">*</span>
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                  required
                >
                  <option value="PDF">PDF</option>
                  <option value="Excel">Excel</option>
                  <option value="CSV">CSV</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={handleCloseReportModal}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExportReport}
                disabled={!reportType || !exportFormat}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {showModal && selectedInvoice && (() => {
        const detailedInvoice = getDetailedInvoiceData(selectedInvoice);
        return (
          <div key={selectedInvoice.id} className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-black">
                    Invoice {detailedInvoice.id}
                  </h2>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                      detailedInvoice.paymentStatus === "Paid"
                        ? "bg-green-100 text-black"
                        : detailedInvoice.paymentStatus === "Pending"
                        ? "bg-orange-100 text-black"
                        : "bg-red-100 text-black"
                    }`}
                  >
                    {detailedInvoice.paymentStatus}
                  </span>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Invoice Details and Service Center Row */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Invoice Details Section */}
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="text-blue-600" size={20} />
                      <h3 className="text-lg font-semibold text-blue-600">
                        Invoice Details
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase block mb-1">
                          Invoice ID
                        </label>
                        <p className="text-base text-black font-bold">
                          {detailedInvoice.id}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase block mb-1">
                          Date Issued
                        </label>
                        <p className="text-base text-black">
                          {detailedInvoice.dateIssued}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase block mb-1">
                          Due Date
                        </label>
                        <p className="text-base text-black">
                          {detailedInvoice.dueDate}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase block mb-1">
                          Payment Terms
                        </label>
                        <p className="text-base text-black">
                          {detailedInvoice.paymentTerms}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Service Center Section */}
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-4">
                      <Building className="text-blue-600" size={20} />
                      <h3 className="text-lg font-semibold text-blue-600">
                        Service Center
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase block mb-1">
                          SC Name
                        </label>
                        <p className="text-base text-black font-bold">
                          {detailedInvoice.scName}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase block mb-1">
                          Location
                        </label>
                        <p className="text-base text-black">
                          {detailedInvoice.location}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase block mb-1">
                          Customer
                        </label>
                        <p className="text-base text-black font-bold">
                          {detailedInvoice.customerName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Breakdown Section */}
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="text-blue-600" size={20} />
                    <h3 className="text-lg font-semibold text-blue-600">
                      Amount Breakdown
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-base text-black">Labor Cost:</span>
                      <span className="text-base text-black font-medium">
                        {detailedInvoice.amountBreakdown.laborCost}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base text-black">Parts Cost:</span>
                      <span className="text-base text-black font-medium">
                        {detailedInvoice.amountBreakdown.partsCost}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base text-black">Tax (GST):</span>
                      <span className="text-base text-black font-medium">
                        {detailedInvoice.amountBreakdown.tax}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-base text-black font-bold">
                          Total Amount:
                        </span>
                        <span className="text-base text-green-600 font-bold">
                          {detailedInvoice.amountBreakdown.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Status Section */}
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="text-blue-600" size={20} />
                    <h3 className="text-lg font-semibold text-blue-600">
                      Payment Status
                    </h3>
                  </div>
                  <div
                    className={`rounded-lg p-4 ${
                      detailedInvoice.paymentStatus === "Paid"
                        ? "bg-green-100"
                        : detailedInvoice.paymentStatus === "Pending"
                        ? "bg-orange-100"
                        : "bg-red-100"
                    }`}
                  >
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-black">
                          Status:{" "}
                        </span>
                        <span className="text-sm font-bold text-black">
                          {detailedInvoice.paymentStatus}
                        </span>
                      </div>
                      {detailedInvoice.paymentDate && (
                        <div className="flex items-center gap-2">
                          <Check
                            className="text-green-600"
                            size={16}
                          />
                          <span className="text-sm text-black">
                            Paid on {detailedInvoice.paymentDate}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-black">
                          Amount Paid:{" "}
                        </span>
                        <span className="text-sm font-bold text-black">
                          {detailedInvoice.amountBreakdown.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer - Action Buttons */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // TODO: Implement PDF download
                      window.open(`/api/invoices/${detailedInvoice.id}/pdf`, "_blank");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition font-medium flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition font-medium flex items-center gap-2"
                  >
                    <Printer size={16} />
                    Print
                  </button>
                </div>
                <button
                  onClick={() => {
                    // TODO: Implement credit note creation
                    alert("Credit note creation feature coming soon");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-red-600 hover:bg-red-50 transition font-medium flex items-center gap-2"
                >
                  <FileText size={16} />
                  Create Credit Note
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

