"use client";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { Suspense, useState, useEffect, useMemo } from "react";
import { useRole } from "@/shared/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  PlusCircle,
  Printer,
  Mail,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import type { Invoice, PaymentStatus, InvoiceStats, InvoiceItem } from "@/shared/types";
import { defaultInvoices } from "@/__mocks__/data/invoices.mock";
import { filterByServiceCenter, getServiceCenterContext } from "@/shared/lib/serviceCenter";

type FilterType = "all" | "paid" | "unpaid" | "overdue";

function InvoicesContent() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: "",
    vehicle: "",
    jobCardId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    items: [{ name: "", qty: 1, price: "" }] as InvoiceItem[],
    paymentMethod: "" as "Cash" | "Card" | "UPI" | "Online" | "Cheque" | "",
    gstRequirement: false,
    businessNameForInvoice: "",
  });
  const { userRole } = useRole();
  const isServiceAdvisor = userRole === "service_advisor";
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceIdFromParams = searchParams?.get("invoiceId");
  const [handledInvoiceId, setHandledInvoiceId] = useState<string | null>(null);

  // Use mock data from __mocks__ folder
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const storedInvoices = typeof window !== "undefined" ? safeStorage.getItem<Invoice[]>("serviceHistoryInvoices", []) : [];
    const base = typeof window !== "undefined" ? safeStorage.getItem<Invoice[]>("invoices", []) : [];
    if (base.length > 0 || storedInvoices.length > 0) {
      const existingIds = new Set<string>();
      const merged: Invoice[] = [];
      [...defaultInvoices, ...base, ...storedInvoices].forEach((inv) => {
        if (!existingIds.has(inv.id)) {
          existingIds.add(inv.id);
          merged.push(inv);
        }
      });
      return merged;
    }
    return [...defaultInvoices, ...storedInvoices];
  });

  useEffect(() => {
    if (!invoiceIdFromParams || handledInvoiceId === invoiceIdFromParams) {
      return;
    }

    const invoice = invoices.find((inv) => inv.id === invoiceIdFromParams);
    if (!invoice) {
      requestAnimationFrame(() => {
        setHandledInvoiceId(invoiceIdFromParams);
      });
      return;
    }

    requestAnimationFrame(() => {
      setSelectedInvoice(invoice);
      setShowDetails(true);
      setHandledInvoiceId(invoiceIdFromParams);
    });

  }, [invoiceIdFromParams, handledInvoiceId, invoices, router]);

  const serviceCenterContext = useMemo(() => getServiceCenterContext(), []);
  const visibleInvoices = useMemo(
    () => filterByServiceCenter(invoices, serviceCenterContext),
    [invoices, serviceCenterContext]
  );

  const filteredInvoices = visibleInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.vehicle.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "all") return matchesSearch;
    return matchesSearch && invoice.status.toLowerCase() === filter;
  });

  const getStatusColor = (status: PaymentStatus): string => {
    const colors: Record<PaymentStatus, string> = {
      Paid: "bg-green-100 text-green-700 border-green-300",
      Unpaid: "bg-yellow-100 text-yellow-700 border-yellow-300",
      Overdue: "bg-red-100 text-red-700 border-red-300",
      "Partially Paid": "bg-blue-100 text-blue-700 border-blue-300",
    };
    return colors[status] || colors.Unpaid;
  };

  const stats: InvoiceStats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "Paid").length,
    unpaid: invoices.filter((i) => i.status === "Unpaid").length,
    overdue: invoices.filter((i) => i.status === "Overdue").length,
    totalAmount: invoices.reduce(
      (sum, inv) => sum + parseFloat(inv.amount.replace("₹", "").replace(",", "")),
      0
    ),
    paidAmount: invoices.reduce(
      (sum, inv) => sum + parseFloat(inv.paidAmount.replace("₹", "").replace(",", "")),
      0
    ),
  };

  const handleRecordPayment = (invoiceId: string): void => {
    const method = prompt("Enter payment method (Cash/Card/UPI/Online):");
    if (method) {
      setInvoices(
        invoices.map((inv) =>
          inv.id === invoiceId
            ? {
                ...inv,
                status: "Paid" as PaymentStatus,
                paidAmount: inv.amount,
                balance: "₹0",
                paymentMethod: method as "Cash" | "Card" | "UPI" | "Online" | "Cheque",
              }
            : inv
        )
      );
      alert("Payment recorded successfully!");
    }
  };

  const handleAddInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { name: "", qty: 1, price: "" }],
    });
  };

  const handleRemoveInvoiceItem = (index: number) => {
    if (invoiceForm.items.length > 1) {
      setInvoiceForm({
        ...invoiceForm,
        items: invoiceForm.items.filter((_, i) => i !== index),
      });
    }
  };

  const handleUpdateInvoiceItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...invoiceForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setInvoiceForm({ ...invoiceForm, items: updatedItems });
  };

  const handleGenerateInvoice = () => {
    // Validate form
    if (!invoiceForm.customerName || !invoiceForm.vehicle || !invoiceForm.date || !invoiceForm.dueDate) {
      alert("Please fill in all required fields.");
      return;
    }

    if (invoiceForm.items.some((item) => !item.name || !item.price)) {
      alert("Please fill in all item details.");
      return;
    }

    // Calculate total amount
    const totalAmount = invoiceForm.items.reduce((sum, item) => {
      const price = parseFloat(item.price.replace("₹", "").replace(",", "")) || 0;
      return sum + price * item.qty;
    }, 0);

    // Generate invoice ID
    const newId = `INV-2025-${String(invoices.length + 1).padStart(3, "0")}`;

    // Create new invoice
    const contextServiceCenterId = String(serviceCenterContext.serviceCenterId ?? "1");
    const contextServiceCenterName = serviceCenterContext.serviceCenterName ?? "Service Center";

    const newInvoice: Invoice = {
      id: newId,
      jobCardId: invoiceForm.jobCardId || undefined,
      customerName: invoiceForm.customerName,
      vehicle: invoiceForm.vehicle,
      date: invoiceForm.date,
      dueDate: invoiceForm.dueDate,
      amount: `₹${totalAmount.toLocaleString("en-IN")}`,
      paidAmount: "₹0",
      balance: `₹${totalAmount.toLocaleString("en-IN")}`,
      status: "Unpaid",
      paymentMethod: invoiceForm.paymentMethod || null,
      serviceCenterId: contextServiceCenterId,
      serviceCenterName: contextServiceCenterName,
      items: invoiceForm.items,
    };

    // Add to invoices list
    setInvoices([...invoices, newInvoice]);

    // Store in localStorage
    const storedInvoices = safeStorage.getItem<unknown[]>("invoices", []);
    storedInvoices.push(newInvoice);
    safeStorage.setItem("invoices", storedInvoices);

    // Reset form and close modal
    setInvoiceForm({
      customerName: "",
      vehicle: "",
      jobCardId: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: "",
      items: [{ name: "", qty: 1, price: "" }],
      paymentMethod: "",
      gstRequirement: false,
      businessNameForInvoice: "",
    });
    setShowGenerateModal(false);

    alert(`Invoice generated successfully! Invoice ID: ${newId}`);
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Invoices</h1>
            <p className="text-gray-500">Manage invoices and track payments</p>
          </div>
          <button
            onClick={() => {
              setShowGenerateModal(true);
              setInvoiceForm({
                customerName: "",
                vehicle: "",
                jobCardId: "",
                date: new Date().toISOString().split("T")[0],
                dueDate: "",
                items: [{ name: "", qty: 1, price: "" }],
                paymentMethod: "",
                gstRequirement: false,
                businessNameForInvoice: "",
              });
            }}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Generate Invoice
          </button>
        </div>

        {!isServiceAdvisor && (
          <>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <FileText size={24} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{stats.total}</h2>
            <p className="text-sm text-gray-600">Total Invoices</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <CheckCircle size={24} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{stats.paid}</h2>
            <p className="text-sm text-gray-600">Paid</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                <Clock size={24} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{stats.unpaid}</h2>
            <p className="text-sm text-gray-600">Unpaid</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-red-100 text-red-600">
                <XCircle size={24} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{stats.overdue}</h2>
            <p className="text-sm text-gray-600">Overdue</p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Total Invoice Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{stats.totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{stats.paidAmount.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{(stats.totalAmount - stats.paidAmount).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by invoice number, customer, vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "paid", "unpaid", "overdue"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
          </>
        )}

        {isServiceAdvisor ? (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search invoice number, customer, vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {(["all", "paid", "unpaid", "overdue"] as FilterType[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      filter === status
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filteredInvoices.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Invoice</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Vehicle</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-right">Balance</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredInvoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-800">{invoice.id}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{invoice.customerName}</div>
                            <div className="text-xs text-gray-500">{invoice.jobCardId ? `Job Card: ${invoice.jobCardId}` : "—"}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-800">{invoice.vehicle}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600">
                              {invoice.date}
                              <span className="text-xs text-gray-400 block">Due: {invoice.dueDate}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">{invoice.amount}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{invoice.status !== "Paid" ? invoice.balance : "₹0"}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowDetails(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <FileText className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Invoices Found</h3>
                <p className="text-gray-500">No invoices match the current filter criteria.</p>
              </div>
            )}
          </>
        ) : (
          <>
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {invoice.id}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                    {invoice.jobCardId && (
                      <span className="text-xs text-gray-500">
                        Job Card: {invoice.jobCardId}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-medium text-gray-800">{invoice.customerName}</p>
                      <p className="text-xs text-gray-500">{invoice.vehicle}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dates</p>
                      <p className="font-medium text-gray-800">
                        {invoice.date} (Due: {invoice.dueDate})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-600">Amount: </span>
                      <span className="font-semibold text-gray-800">{invoice.amount}</span>
                    </div>
                    {invoice.status !== "Paid" && (
                      <div>
                        <span className="text-gray-600">Balance: </span>
                        <span className="font-semibold text-red-600">{invoice.balance}</span>
                      </div>
                    )}
                    {invoice.paymentMethod && (
                      <div>
                        <span className="text-gray-600">Payment: </span>
                        <span className="font-medium text-gray-800">{invoice.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:items-end">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowDetails(true);
                      }}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition inline-flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition inline-flex items-center gap-2">
                      <Download size={16} />
                      Download
                    </button>
                    <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition inline-flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </button>
                  </div>
                  {invoice.status !== "Paid" && (
                    <button
                      onClick={() => handleRecordPayment(invoice.id)}
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
                    >
                      Record Payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Invoices Found</h3>
            <p className="text-gray-500">No invoices match the current filter criteria.</p>
          </div>
            )}
          </>
        )}
      </div>

      {/* Invoice Details Modal */}
      {showDetails && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Invoice Details</h2>
              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Printer size={20} />
                </button>
                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Download size={20} />
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-600">Invoice Number</p>
                    <p className="text-xl font-bold text-gray-800">{selectedInvoice.id}</p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(
                      selectedInvoice.status
                    )}`}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Date: {selectedInvoice.date} • Due Date: {selectedInvoice.dueDate}
                </p>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedInvoice.customerName}</p>
                  <p className="text-sm text-gray-700">{selectedInvoice.vehicle}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                          Item
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm text-gray-800">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-center text-gray-700">
                            {item.qty}
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-medium text-gray-800">
                            {item.price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">{selectedInvoice.amount}</span>
                </div>
                {selectedInvoice.status !== "Paid" && (
                  <div className="flex justify-between text-sm text-red-600 mt-2">
                    <span>Outstanding</span>
                    <span>{selectedInvoice.balance}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Close
                </button>
                {selectedInvoice.status !== "Paid" && (
                  <button
                    onClick={() => {
                      handleRecordPayment(selectedInvoice.id);
                      setShowDetails(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
                  >
                    Record Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-4xl mx-2 max-h-[90vh] overflow-y-auto p-4 md:p-6 z-[101]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Generate Invoice</h2>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setInvoiceForm({
                    customerName: "",
                    vehicle: "",
                    jobCardId: "",
                    date: new Date().toISOString().split("T")[0],
                    dueDate: "",
                    items: [{ name: "", qty: 1, price: "" }],
                    paymentMethod: "",
                    gstRequirement: false,
                    businessNameForInvoice: "",
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={invoiceForm.customerName}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                      placeholder="Enter customer name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={invoiceForm.vehicle}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, vehicle: e.target.value })}
                      placeholder="e.g., Honda City 2020"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Card ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={invoiceForm.jobCardId}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, jobCardId: e.target.value })}
                      placeholder="JC-2025-001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Dates */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={invoiceForm.date}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                      min={invoiceForm.date}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Billing & Payment Section */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                  <FileText className="text-indigo-600" size={20} />
                  Billing & Payment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={invoiceForm.paymentMethod}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value as "Cash" | "Card" | "UPI" | "Online" | "Cheque" | "" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option value="">Select payment method</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Online">Online</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer h-full">
                      <input
                        type="checkbox"
                        checked={invoiceForm.gstRequirement}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, gstRequirement: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">GST Requirement</span>
                    </label>
                  </div>
                  {invoiceForm.gstRequirement && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name for Invoice
                      </label>
                      <input
                        type="text"
                        value={invoiceForm.businessNameForInvoice}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, businessNameForInvoice: e.target.value })}
                        placeholder="Enter business name for invoice"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Items */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Invoice Items</h3>
                  <button
                    onClick={handleAddInvoiceItem}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition inline-flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {invoiceForm.items.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Item Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateInvoiceItem(index, "name", e.target.value)}
                          placeholder="e.g., Engine Oil"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleUpdateInvoiceItem(index, "qty", parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.price}
                          onChange={(e) => handleUpdateInvoiceItem(index, "price", e.target.value)}
                          placeholder="₹2,500"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        {invoiceForm.items.length > 1 && (
                          <button
                            onClick={() => handleRemoveInvoiceItem(index)}
                            className="w-full p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowGenerateModal(false);
                    setInvoiceForm({
                      customerName: "",
                      vehicle: "",
                      jobCardId: "",
                      date: new Date().toISOString().split("T")[0],
                      dueDate: "",
                      items: [{ name: "", qty: 1, price: "" }],
                      paymentMethod: "",
                      gstRequirement: false,
                      businessNameForInvoice: "",
                    });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateInvoice}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
                >
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Invoices() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading invoices...</div>}>
      <InvoicesContent />
    </Suspense>
  );
}

