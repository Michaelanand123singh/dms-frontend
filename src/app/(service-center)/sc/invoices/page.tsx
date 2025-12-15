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
import type { ServiceCenterInvoice, PaymentStatus, InvoiceStats, ServiceCenterInvoiceItem, EnhancedServiceCenterInvoiceItem } from "@/shared/types";
import { defaultInvoices } from "@/__mocks__/data/invoices.mock";
import { filterByServiceCenter, getServiceCenterContext } from "@/shared/lib/serviceCenter";
import { generateInvoiceNumber, calculateGST, convertNumberToWords, populateInvoiceFromJobCard, validateInvoiceData } from "@/shared/utils/invoice.utils";
import { generateInvoiceHTML } from "@/shared/utils/invoicePDF.utils";
import type { JobCard } from "@/shared/types/job-card.types";
import InvoicePDF from "../../../../components/invoice/InvoicePDF";

type FilterType = "all" | "paid" | "unpaid" | "overdue";

function InvoicesContent() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = useState<ServiceCenterInvoice | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: "",
    vehicle: "",
    jobCardId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    items: [{ name: "", qty: 1, price: "", hsnSacCode: "", gstRate: 18 }] as Array<ServiceCenterInvoiceItem & { hsnSacCode?: string; gstRate?: number }>,
    paymentMethod: "" as "Cash" | "Card" | "UPI" | "Online" | "Cheque" | "",
    gstRequirement: false,
    businessNameForInvoice: "",
    customerGstNumber: "",
    customerPanNumber: "",
    customerAddress: "",
    customerState: "",
    placeOfSupply: "",
    discount: 0,
  });
  const { userRole } = useRole();
  const isServiceAdvisor = userRole === "service_advisor";
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceIdFromParams = searchParams?.get("invoiceId");
  const [handledInvoiceId, setHandledInvoiceId] = useState<string | null>(null);

  // Use mock data from __mocks__ folder
  const [invoices, setInvoices] = useState<ServiceCenterInvoice[]>(() => {
    const storedInvoices = typeof window !== "undefined" ? safeStorage.getItem<ServiceCenterInvoice[]>("serviceHistoryInvoices", []) : [];
    const base = typeof window !== "undefined" ? safeStorage.getItem<ServiceCenterInvoice[]>("invoices", []) : [];
    if (base.length > 0 || storedInvoices.length > 0) {
      const existingIds = new Set<string>();
      const merged: ServiceCenterInvoice[] = [];
      [...(defaultInvoices as unknown as ServiceCenterInvoice[]), ...base, ...storedInvoices].forEach((inv) => {
        if (!existingIds.has(inv.id)) {
          existingIds.add(inv.id);
          merged.push(inv);
        }
      });
      return merged;
    }
    return [...(defaultInvoices as unknown as ServiceCenterInvoice[]), ...storedInvoices];
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
      (invoice.invoiceNumber || invoice.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.vehicle.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "all") return matchesSearch;
    const statusLower = invoice.status.toLowerCase();
    return matchesSearch && (statusLower === filter || (filter === "paid" && statusLower === "paid") || (filter === "unpaid" && statusLower === "unpaid") || (filter === "overdue" && statusLower === "overdue"));
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
                paymentMethod: method as "Cash" | "Card" | "UPI" | "Online" | "Cheque" | null,
              }
            : inv
        )
      );
      alert("Payment recorded successfully!");
    }
  };

  const formatInvoiceWhatsAppMessage = (invoice: ServiceCenterInvoice): string => {
    const customerName = invoice.customerName;
    const vehicleInfo = invoice.vehicle;
    const invoiceNumber = invoice.invoiceNumber || invoice.id;
    const invoiceDate = new Date(invoice.date).toLocaleDateString("en-IN");
    const dueDate = new Date(invoice.dueDate).toLocaleDateString("en-IN");
    
    // Format items summary
    const itemsSummary = invoice.enhancedItems && invoice.enhancedItems.length > 0
      ? invoice.enhancedItems.slice(0, 5).map((item, idx) => 
          `${idx + 1}. ${item.name} (Qty: ${item.quantity}) - ₹${item.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
        ).join("\n")
      : invoice.items.slice(0, 5).map((item, idx) => 
          `${idx + 1}. ${item.name} (Qty: ${item.qty}) - ${item.price}`
        ).join("\n");
    
    const remainingCount = invoice.enhancedItems 
      ? Math.max(0, invoice.enhancedItems.length - 5)
      : Math.max(0, invoice.items.length - 5);
    
    const grandTotal = invoice.grandTotal ?? (parseFloat(invoice.amount.replace("₹", "").replace(/,/g, "")) || 0);
    const subtotal = invoice.subtotal ?? 0;
    const totalTax = invoice.totalTax ?? 0;
    
    const serviceCenter = invoice.serviceCenterDetails;
    
    return `Hello ${customerName}! 👋

📄 *Invoice ${invoiceNumber}*

📅 Invoice Date: ${invoiceDate}
⏰ Due Date: ${dueDate}
🚗 Vehicle: ${vehicleInfo}

📋 *Items Summary:*
${itemsSummary}
${remainingCount > 0 ? `... and ${remainingCount} more item${remainingCount > 1 ? "s" : ""}\n` : ""}

💰 *Pricing:*
Subtotal: ₹${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
${totalTax > 0 ? `Tax: ₹${totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n` : ""}${invoice.discount && invoice.discount > 0 ? `Discount: -₹${invoice.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n` : ""}*Grand Total: ₹${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}*

📄 A detailed invoice PDF has been generated. Please review it.

💳 Please make payment before the due date.

📞 Contact: ${serviceCenter?.phone || "N/A"}
🏢 ${serviceCenter?.name || invoice.serviceCenterName || "Service Center"}`;
  };

  const handleSendInvoiceToCustomer = async (invoice: ServiceCenterInvoice) => {
    try {
      // Generate invoice HTML for PDF
      const invoiceHTML = generateInvoiceHTML(invoice);
      
      // Print invoice (opens print dialog for PDF generation)
      const printInvoice = () => {
        try {
          const printWindow = window.open("", "_blank");
          if (!printWindow) {
            alert("Please allow popups to generate PDF. The invoice details will be shown in the message.");
            return false;
          }

          printWindow.document.write(invoiceHTML);
          printWindow.document.close();

          setTimeout(() => {
            try {
              printWindow.focus();
              printWindow.print();
              setTimeout(() => {
                if (!printWindow.closed) {
                  printWindow.close();
                }
              }, 2000);
            } catch (printError) {
              console.error("Print error:", printError);
            }
          }, 500);
          return true;
        } catch (error) {
          console.error("Error opening print window:", error);
          alert("Could not open print dialog. The invoice will still be sent via WhatsApp.");
          return false;
        }
      };

      // Generate PDF
      printInvoice();

      // Format WhatsApp message
      const message = formatInvoiceWhatsAppMessage(invoice);
      
      // Get customer phone number (would need to fetch from customer data)
      // For now, prompt user
      const customerPhone = prompt("Enter customer WhatsApp number (with country code, e.g., 919876543210):");
      if (!customerPhone) {
        return;
      }
      
      const cleanPhone = customerPhone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        alert("Invalid phone number. Please enter a valid WhatsApp number.");
        return;
      }
      
      // Open WhatsApp
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      
      alert("Invoice sent to customer via WhatsApp!");
    } catch (error) {
      console.error("Error sending invoice:", error);
      alert("Failed to send invoice. Please try again.");
    }
  };

  const handleAddInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { name: "", qty: 1, price: "", hsnSacCode: "", gstRate: 18 }],
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

  const handleUpdateInvoiceItem = (index: number, field: keyof ServiceCenterInvoiceItem, value: string | number) => {
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

    // Get service center details
    const contextServiceCenterId = String(serviceCenterContext.serviceCenterId ?? "1");
    const contextServiceCenterName = serviceCenterContext.serviceCenterName ?? "Service Center";
    
    // Determine service center code and state (default values for now)
    let serviceCenterCode = "SC001";
    let serviceCenterState = "Delhi";
    if (contextServiceCenterId === "2" || contextServiceCenterId === "sc-002") {
      serviceCenterCode = "SC002";
      serviceCenterState = "Maharashtra";
    } else if (contextServiceCenterId === "3" || contextServiceCenterId === "sc-003") {
      serviceCenterCode = "SC003";
      serviceCenterState = "Karnataka";
    }

    // Generate invoice number
    const currentYear = new Date().getFullYear();
    const invoiceNumber = generateInvoiceNumber(serviceCenterCode, currentYear, invoices);

    // Process items and calculate GST
    const placeOfSupply = invoiceForm.placeOfSupply || invoiceForm.customerState || serviceCenterState;
    const enhancedItems: EnhancedServiceCenterInvoiceItem[] = invoiceForm.items.map((item) => {
      const unitPrice = parseFloat(item.price.replace("₹", "").replace(",", "")) || 0;
      const quantity = item.qty || 1;
      const taxableAmount = unitPrice * quantity;
      const gstRate = item.gstRate || 18;
      
      const gst = calculateGST(taxableAmount, gstRate, placeOfSupply, serviceCenterState);
      
      return {
        name: item.name,
        hsnSacCode: item.hsnSacCode || "",
        unitPrice: unitPrice,
        quantity: quantity,
        taxableAmount: taxableAmount,
        gstRate: gstRate,
        cgstAmount: gst.cgst,
        sgstAmount: gst.sgst,
        igstAmount: gst.igst,
        totalAmount: taxableAmount + gst.cgst + gst.sgst + gst.igst,
      };
    });

    // Calculate totals
    const subtotal = enhancedItems.reduce((sum, item) => sum + item.taxableAmount, 0);
    const totalCgst = enhancedItems.reduce((sum, item) => sum + item.cgstAmount, 0);
    const totalSgst = enhancedItems.reduce((sum, item) => sum + item.sgstAmount, 0);
    const totalIgst = enhancedItems.reduce((sum, item) => sum + item.igstAmount, 0);
    const totalTax = totalCgst + totalSgst + totalIgst;
    const discount = invoiceForm.discount || 0;
    const roundOff = 0; // Can be calculated if needed
    const grandTotal = subtotal + totalTax - discount + roundOff;

    // Get service center details (mock data for now - should come from service center config)
    const serviceCenterDetails = {
      name: contextServiceCenterName,
      address: "123 Service Center Address",
      city: serviceCenterState === "Delhi" ? "New Delhi" : serviceCenterState === "Maharashtra" ? "Mumbai" : "Bangalore",
      state: serviceCenterState,
      pincode: "110001",
      gstNumber: "29ABCDE1234F1Z5", // Mock GST - should come from service center config
      panNumber: "ABCDE1234F", // Mock PAN - should come from service center config
      phone: "+91-1234567890",
      email: "info@servicecenter.com",
    };

    const customerDetails = {
      name: invoiceForm.customerName,
      address: invoiceForm.customerAddress || "",
      state: invoiceForm.customerState || placeOfSupply,
      phone: "",
      email: "",
      gstNumber: invoiceForm.customerGstNumber || undefined,
      panNumber: invoiceForm.customerPanNumber || undefined,
    };

    // Create new invoice with enhanced structure
    const newInvoice: ServiceCenterInvoice = {
      id: invoiceNumber,
      invoiceNumber: invoiceNumber,
      jobCardId: invoiceForm.jobCardId || undefined,
      customerName: invoiceForm.customerName,
      vehicle: invoiceForm.vehicle,
      date: invoiceForm.date,
      dueDate: invoiceForm.dueDate,
      amount: `₹${grandTotal.toLocaleString("en-IN")}`,
      paidAmount: "₹0",
      balance: `₹${grandTotal.toLocaleString("en-IN")}`,
      status: "Unpaid" as PaymentStatus,
      paymentMethod: invoiceForm.paymentMethod || null,
      serviceCenterId: contextServiceCenterId,
      serviceCenterName: contextServiceCenterName,
      items: invoiceForm.items.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
      // Enhanced fields
      serviceCenterDetails,
      customerDetails,
      placeOfSupply,
      subtotal,
      totalTaxableAmount: subtotal,
      totalCgst,
      totalSgst,
      totalIgst,
      totalTax,
      discount,
      roundOff,
      grandTotal,
      amountInWords: convertNumberToWords(grandTotal),
      enhancedItems,
      createdBy: "System", // Should come from user info
    };

    // Validate invoice
    const validation = validateInvoiceData(newInvoice);
    if (!validation.valid) {
      alert(`Validation errors:\n${validation.errors.join("\n")}`);
      return;
    }

    // Add to invoices list
    setInvoices([...invoices, newInvoice]);

    // Store in localStorage
    const storedInvoices = safeStorage.getItem<ServiceCenterInvoice[]>("invoices", []);
    storedInvoices.push(newInvoice);
    safeStorage.setItem("invoices", storedInvoices);

    // Reset form and close modal
    setInvoiceForm({
      customerName: "",
      vehicle: "",
      jobCardId: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: "",
      items: [{ name: "", qty: 1, price: "", hsnSacCode: "", gstRate: 18 }],
      paymentMethod: "",
      gstRequirement: false,
      businessNameForInvoice: "",
      customerGstNumber: "",
      customerPanNumber: "",
      customerAddress: "",
      customerState: "",
      placeOfSupply: "",
      discount: 0,
    });
    setShowGenerateModal(false);

    alert(`Invoice generated successfully! Invoice Number: ${invoiceNumber}`);
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
                items: [{ name: "", qty: 1, price: "", hsnSacCode: "", gstRate: 18 }],
                paymentMethod: "",
                gstRequirement: false,
                businessNameForInvoice: "",
                customerGstNumber: "",
                customerPanNumber: "",
                customerAddress: "",
                customerState: "",
                placeOfSupply: "",
                discount: 0,
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
                          <td className="px-4 py-3 font-semibold text-gray-800">{invoice.invoiceNumber || invoice.id}</td>
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
                      {invoice.invoiceNumber || invoice.id}
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
        <InvoicePDF
          invoice={selectedInvoice}
          onClose={() => setShowDetails(false)}
          showActions={true}
          onSendToCustomer={() => handleSendInvoiceToCustomer(selectedInvoice)}
        />
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
                    items: [{ name: "", qty: 1, price: "", hsnSacCode: "", gstRate: 18 }] as Array<ServiceCenterInvoiceItem & { hsnSacCode?: string; gstRate?: number }>,
                    paymentMethod: "" as "Cash" | "Card" | "UPI" | "Online" | "Cheque" | "",
                    gstRequirement: false,
                    businessNameForInvoice: "",
                    customerGstNumber: "",
                    customerPanNumber: "",
                    customerAddress: "",
                    customerState: "",
                    placeOfSupply: "",
                    discount: 0,
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
                      onChange={(e) => {
                        const jobCardId = e.target.value;
                        setInvoiceForm({ ...invoiceForm, jobCardId });
                        // Auto-populate from job card if exists
                        if (jobCardId) {
                          const jobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
                          const jobCard = jobCards.find(jc => jc.id === jobCardId || jc.jobCardNumber === jobCardId);
                          if (jobCard) {
                            const serviceCenter: any = {
                              id: jobCard.serviceCenterId,
                              code: jobCard.serviceCenterCode || "SC001",
                              name: jobCard.serviceCenterName || serviceCenterContext.serviceCenterName || "Service Center",
                              state: "Delhi", // Default, should come from service center config
                            };
                            const populatedData = populateInvoiceFromJobCard(jobCard, serviceCenter);
                            if (populatedData) {
                              setInvoiceForm({
                                ...invoiceForm,
                                jobCardId,
                                customerName: populatedData.customerName || invoiceForm.customerName,
                                vehicle: populatedData.vehicle || invoiceForm.vehicle,
                                customerAddress: populatedData.customerDetails?.address || invoiceForm.customerAddress,
                                customerState: populatedData.customerDetails?.state || invoiceForm.customerState,
                                placeOfSupply: populatedData.placeOfSupply || invoiceForm.placeOfSupply,
                                items: populatedData.items || invoiceForm.items,
                              });
                            }
                          }
                        }
                      }}
                      placeholder="JC-2025-001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Customer GST Details */}
              {invoiceForm.gstRequirement && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Customer GST Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer GST Number
                      </label>
                      <input
                        type="text"
                        value={invoiceForm.customerGstNumber}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, customerGstNumber: e.target.value })}
                        placeholder="29ABCDE1234F1Z5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer PAN Number
                      </label>
                      <input
                        type="text"
                        value={invoiceForm.customerPanNumber}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, customerPanNumber: e.target.value })}
                        placeholder="ABCDE1234F"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Address
                      </label>
                      <input
                        type="text"
                        value={invoiceForm.customerAddress}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, customerAddress: e.target.value })}
                        placeholder="Enter customer address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer State
                      </label>
                      <input
                        type="text"
                        value={invoiceForm.customerState}
                        onChange={(e) => {
                          const state = e.target.value;
                          setInvoiceForm({ 
                            ...invoiceForm, 
                            customerState: state,
                            placeOfSupply: state || invoiceForm.placeOfSupply,
                          });
                        }}
                        placeholder="Enter state"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Place of Supply <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={invoiceForm.placeOfSupply}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, placeOfSupply: e.target.value })}
                        placeholder="Enter place of supply (State)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={invoiceForm.discount}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                      <div className="col-span-4">
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
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          HSN/SAC
                        </label>
                        <input
                          type="text"
                          value={item.hsnSacCode || ""}
                          onChange={(e) => {
                            const updatedItems = [...invoiceForm.items];
                            updatedItems[index] = { ...updatedItems[index], hsnSacCode: e.target.value };
                            setInvoiceForm({ ...invoiceForm, items: updatedItems });
                          }}
                          placeholder="HSN/SAC"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Qty <span className="text-red-500">*</span>
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
                      <div className="col-span-2">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GST %
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.gstRate || 18}
                          onChange={(e) => {
                            const updatedItems = [...invoiceForm.items];
                            updatedItems[index] = { ...updatedItems[index], gstRate: parseFloat(e.target.value) || 18 };
                            setInvoiceForm({ ...invoiceForm, items: updatedItems });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
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
                      items: [{ name: "", qty: 1, price: "", hsnSacCode: "", gstRate: 18 }] as Array<ServiceCenterInvoiceItem & { hsnSacCode?: string; gstRate?: number }>,
                      paymentMethod: "" as "Cash" | "Card" | "UPI" | "Online" | "Cheque" | "",
                      gstRequirement: false,
                      businessNameForInvoice: "",
                      customerGstNumber: "",
                      customerPanNumber: "",
                      customerAddress: "",
                      customerState: "",
                      placeOfSupply: "",
                      discount: 0,
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

