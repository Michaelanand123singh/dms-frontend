"use client";
import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Car,
  Building2,
  Calculator,
  FileCheck,
  ArrowRight,
  X,
  Trash2,
  Edit,
  Download,
  Loader2,
  Printer,
  MessageCircle,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { useRole } from "@/shared/hooks";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { useSearchParams } from "next/navigation";
import type {
  Quotation,
  QuotationItem,
  QuotationFilterType,
  Insurer,
  NoteTemplate,
  CreateQuotationForm,
  CustomerWithVehicles,
  Vehicle,
} from "@/shared/types";
import { useCustomerSearch } from "../../../../hooks/api";
import { defaultQuotations, defaultInsurers, defaultNoteTemplates } from "@/__mocks__/data/quotations.mock";
import { staticServiceCenters } from "@/__mocks__/data/service-centers.mock";
import { getServiceCenterContext } from "@/shared/lib/serviceCenter";
import type { CheckInSlipFormData } from "@/shared/types/check-in-slip.types";
import { CheckInSlipForm } from "../components/check-in-slip/CheckInSlipForm";
import CheckInSlip, { generateCheckInSlipNumber, type CheckInSlipData } from "@/components/check-in-slip/CheckInSlip";
import type { EnhancedCheckInSlipData } from "@/shared/types/check-in-slip.types";
import { convertCheckInSlipFormToData } from "../components/check-in-slip/utils";
import { SERVICE_CENTER_CODE_MAP } from "../appointments/constants";

const createEmptyCustomer = (): CustomerWithVehicles => ({
  id: "",
  customerNumber: "",
  name: "Customer",
  phone: "",
  createdAt: new Date().toISOString(),
  vehicles: [],
});

const normalizeServiceCenterId = (id?: string | number | null): string => {
  if (!id) return "sc-001";
  const raw = id.toString();
  if (raw.startsWith("sc-")) {
    return raw;
  }
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "sc-001";
  return `sc-${digits.padStart(3, "0")}`;
};

const getServiceCenterCode = (id?: string | number | null): string => {
  const normalized = normalizeServiceCenterId(id);
  return SERVICE_CENTER_CODE_MAP[normalized] || "SC001";
};

function QuotationsContent() {
  const { userInfo, userRole } = useRole();
  const isServiceAdvisor = userRole === "service_advisor";
  const isServiceManager = userRole === "sc_manager";
  const searchParams = useSearchParams();
  const fromAppointment = searchParams.get("fromAppointment") === "true";

  const serviceCenterContext = useMemo(() => getServiceCenterContext(), []);
  const [activeServiceCenterId, setActiveServiceCenterId] = useState<string>(() =>
    normalizeServiceCenterId(serviceCenterContext.serviceCenterId)
  );
  const [activeCustomerId, setActiveCustomerId] = useState<string>("");
  
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filter, setFilter] = useState<QuotationFilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showCheckInSlipModal, setShowCheckInSlipModal] = useState<boolean>(false);
  const [checkInSlipData, setCheckInSlipData] = useState<CheckInSlipData | null>(null);
  
  // Form state
  const [form, setForm] = useState<CreateQuotationForm>({
    customerId: "",
    vehicleId: "",
    documentType: "Quotation",
    quotationDate: new Date().toISOString().split("T")[0],
    validUntilDays: 30,
    hasInsurance: false,
    insurerId: "",
    insuranceCompanyName: "",
    insuranceStartDate: "",
    insuranceEndDate: "",
    items: [],
    discount: 0,
    notes: "",
    batterySerialNumber: "",
    customNotes: "",
    noteTemplateId: "",
    vehicleLocation: undefined,
  });

  // Data for dropdowns
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [noteTemplates, setNoteTemplates] = useState<NoteTemplate[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithVehicles | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>("");
  const [checkInSlipFormData, setCheckInSlipFormData] = useState<CheckInSlipFormData>({} as CheckInSlipFormData);
  const customerSearch = useCustomerSearch();
  const customerSearchResults = customerSearch.results as CustomerWithVehicles[];
  const performCustomerSearch = customerSearch.search;
  const clearCustomerSearch = customerSearch.clear;

  // Load quotations from localStorage or use mock data
  useEffect(() => {
    const storedQuotations = safeStorage.getItem<Quotation[]>("quotations", []);
    if (storedQuotations.length > 0) {
      setQuotations(storedQuotations);
    } else {
      setQuotations(defaultQuotations);
    }
  }, []);

  // Load insurers from localStorage or use mock data
  useEffect(() => {
    const storedInsurers = safeStorage.getItem<Insurer[]>("insurers", []);
    if (storedInsurers.length > 0) {
      setInsurers(storedInsurers);
    } else {
      setInsurers(defaultInsurers);
      safeStorage.setItem("insurers", defaultInsurers);
    }
  }, []);

  // Load note templates from localStorage or use mock data
  useEffect(() => {
    const storedTemplates = safeStorage.getItem<NoteTemplate[]>("noteTemplates", []);
    if (storedTemplates.length > 0) {
      setNoteTemplates(storedTemplates);
    } else {
      setNoteTemplates(defaultNoteTemplates);
      safeStorage.setItem("noteTemplates", defaultNoteTemplates);
    }
  }, []);

  // Handle customer search
  useEffect(() => {
    if (customerSearchQuery && customerSearchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        performCustomerSearch(customerSearchQuery, "auto");
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      clearCustomerSearch();
    }
  }, [customerSearchQuery, performCustomerSearch, clearCustomerSearch]);

  // Handle pre-filling form from appointment data
  useEffect(() => {
    if (fromAppointment && typeof window !== "undefined") {
      const quotationData = safeStorage.getItem<any>("pendingQuotationFromAppointment", null);
      
      if (quotationData && quotationData.appointmentData) {
        const appointmentData = quotationData.appointmentData;
        const normalizedCenterId = normalizeServiceCenterId(
          quotationData.serviceCenterId ?? serviceCenterContext.serviceCenterId
        );
        setActiveServiceCenterId(normalizedCenterId);

        // Find customer by phone or name
        const findCustomer = async () => {
          try {
            await performCustomerSearch(quotationData.customerName || quotationData.phone, "auto");
            // Wait a bit for search results
            setTimeout(() => {
              const customers = customerSearchResults;
              const customer = customers.find(
                (c) => c.phone === quotationData.phone || c.name === quotationData.customerName
              );
              
              if (customer) {
                setSelectedCustomer(customer);
                setActiveCustomerId(customer.id?.toString() || "");
                
                // Extract insurance data from appointment
                const insuranceCompanyName = appointmentData.insuranceCompanyName || "";
                const insuranceStartDate = appointmentData.insuranceStartDate || "";
                const insuranceEndDate = appointmentData.insuranceEndDate || "";
                const hasInsuranceData = !!(insuranceCompanyName || insuranceStartDate || insuranceEndDate);
                
                // Try to match insurance company name to insurer list
                let matchedInsurerId = "";
                if (insuranceCompanyName && insurers.length > 0) {
                  const matchedInsurer = insurers.find((insurer) => {
                    const insurerNameLower = insurer.name.toLowerCase().trim();
                    const companyNameLower = insuranceCompanyName.toLowerCase().trim();
                    return (
                      insurerNameLower === companyNameLower ||
                      insurerNameLower.includes(companyNameLower) ||
                      companyNameLower.includes(insurerNameLower)
                    );
                  });
                  if (matchedInsurer) {
                    matchedInsurerId = matchedInsurer.id;
                  }
                }
                
                setForm((prev) => ({
                  ...prev,
                  customerId: String(customer.id),
                  documentType: "Quotation",
                  notes: appointmentData.customerComplaintIssue || "",
                  customNotes: appointmentData.previousServiceHistory || "",
                  batterySerialNumber: appointmentData.batterySerialNumber || appointmentData.chargerSerialNumber || "",
                  hasInsurance: hasInsuranceData,
                  insurerId: matchedInsurerId,
                  insuranceCompanyName: insuranceCompanyName || "",
                  insuranceStartDate: insuranceStartDate || "",
                  insuranceEndDate: insuranceEndDate || "",
                }));
                
                // Find matching vehicle
                if (customer.vehicles && customer.vehicles.length > 0) {
                  const vehicle = customer.vehicles.find(
                    (v) => v.registration === appointmentData.registrationNumber
                  ) || customer.vehicles[0];
                  
                  if (vehicle) {
                    setForm((prev) => ({
                      ...prev,
                      vehicleId: String(vehicle.id),
                    }));
                  }
                }
                
                // Open create modal
                setShowCreateModal(true);
                
                // Clear the stored data
                safeStorage.removeItem("pendingQuotationFromAppointment");
              }
              else if (quotationData.customerId) {
                const decodedCustomerId = String(quotationData.customerId);
                setForm((prev) => ({ ...prev, customerId: decodedCustomerId }));
                setActiveCustomerId(decodedCustomerId);
                setShowCreateModal(true);
                safeStorage.removeItem("pendingQuotationFromAppointment");
              }
            }, 500);
          } catch (error) {
            console.error("Error finding customer:", error);
          }
        };
        
        findCustomer();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromAppointment]);

  // Calculate totals
  const calculateTotals = useCallback(() => {
    let subtotal = 0;
    form.items.forEach((item) => {
      const itemAmount = item.rate * item.quantity;
      subtotal += itemAmount;
    });

    const discount = form.discount || 0;
    const discountPercent = subtotal > 0 ? (discount / subtotal) * 100 : 0;
    const preGstAmount = subtotal - discount;

    // For now, using flat 18% GST. In production, this should calculate CGST/SGST/IGST based on states
    const gstRate = 0.18;
    const taxAmount = preGstAmount * gstRate;
    
    // Split into CGST and SGST (9% each) for intra-state, or IGST (18%) for inter-state
    // This should be calculated based on customer state vs service center state
    const cgst = taxAmount / 2;
    const sgst = taxAmount / 2;
    const igst = 0; // Set based on state comparison

    const totalAmount = preGstAmount + cgst + sgst + igst;

    return {
      subtotal,
      discount,
      discountPercent,
      preGstAmount,
      cgst,
      sgst,
      igst,
      totalAmount,
    };
  }, [form.items, form.discount]);

const totals = calculateTotals();

const validateQuotationForm = () => {
  if (!form.customerId) {
    alert("Please select a customer");
    return false;
  }

  if (form.items.length === 0) {
    alert("Please add at least one item");
    return false;
  }

  return true;
};

const buildQuotationFromForm = (): Quotation => {
  const updatedTotals = calculateTotals();
  const quotationDate = new Date(form.quotationDate);
  const validUntil = new Date(quotationDate);
  validUntil.setDate(validUntil.getDate() + form.validUntilDays);
  const year = quotationDate.getFullYear();
  const month = String(quotationDate.getMonth() + 1).padStart(2, "0");
  const resolvedServiceCenterId = normalizeServiceCenterId(
    activeServiceCenterId || serviceCenterContext.serviceCenterId
  );
  const resolvedCustomerId = form.customerId || activeCustomerId || "";
  const serviceCenterCode = getServiceCenterCode(resolvedServiceCenterId);
  const monthKey = `${year}${month}`;
  const existingForCenterMonth = quotations.filter((quotation) => {
    if (quotation.serviceCenterId !== resolvedServiceCenterId) return false;
    return quotation.quotationDate.startsWith(`${year}-${month}`);
  });
  const nextSequence = existingForCenterMonth.length + 1;
  const quotationNumber = `QT-${serviceCenterCode}-${monthKey}-${String(nextSequence).padStart(4, "0")}`;

  const customer = selectedCustomer ?? createEmptyCustomer();
  const selectedInsurer = insurers.find((i) => i.id === form.insurerId);
  const selectedTemplate = noteTemplates.find((t) => t.id === form.noteTemplateId);
  const vehicle = customer.vehicles?.find((v) => v.id.toString() === form.vehicleId);
  const centerMeta = staticServiceCenters.find(
    (center) => normalizeServiceCenterId(center.id) === resolvedServiceCenterId
  );

  // Get appointmentId from pendingQuotationFromAppointment if available
  const pendingQuotationData = safeStorage.getItem<any>("pendingQuotationFromAppointment", null);
  const appointmentId = pendingQuotationData?.appointmentId || undefined;

  return {
    id: `qt-${Date.now()}`,
    quotationNumber,
    serviceCenterId: resolvedServiceCenterId,
    customerId: resolvedCustomerId,
    vehicleId: form.vehicleId,
    serviceAdvisorId: userInfo?.id || "user-001",
    appointmentId: appointmentId,
    documentType: form.documentType,
    quotationDate: form.quotationDate,
    validUntil: validUntil.toISOString().split("T")[0],
    hasInsurance: form.hasInsurance,
    insurerId: form.insurerId,
    insuranceStartDate: form.insuranceStartDate,
    insuranceEndDate: form.insuranceEndDate,
    subtotal: updatedTotals.subtotal,
    discount: updatedTotals.discount,
    discountPercent: updatedTotals.discountPercent,
    preGstAmount: updatedTotals.preGstAmount,
    cgstAmount: updatedTotals.cgst,
    sgstAmount: updatedTotals.sgst,
    igstAmount: updatedTotals.igst,
    totalAmount: updatedTotals.totalAmount,
    notes: form.notes || selectedTemplate?.content || "",
    batterySerialNumber: form.batterySerialNumber,
    customNotes: form.customNotes,
    noteTemplateId: form.noteTemplateId,
    status: "draft",
    passedToManager: false,
    passedToManagerAt: undefined,
    managerId: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: form.items.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      ...item,
    })),
    customer: {
      id: resolvedCustomerId,
      firstName: customer.name?.split(" ")[0] || "Customer",
      lastName: customer.name?.split(" ").slice(1).join(" ") || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      city: customer.cityState?.split(",")[0] || "",
      state: customer.cityState?.split(",")[1]?.trim() || "",
      pincode: customer.pincode || "",
    },
    vehicle: form.vehicleId
      ? {
          id: form.vehicleId,
          make: vehicle?.vehicleMake || "",
          model: vehicle?.vehicleModel || "",
          registration: vehicle?.registration || "",
          vin: vehicle?.vin || "",
        }
      : undefined,
    insurer: selectedInsurer,
    serviceCenter: {
      id: resolvedServiceCenterId,
      name:
        centerMeta?.name ??
        serviceCenterContext.serviceCenterName ??
        "Service Center",
      code: serviceCenterCode,
      address: centerMeta?.location ?? "",
      city: centerMeta?.location ?? "",
      state: "",
      pincode: "",
      phone: "",
      gstNumber: "",
      panNumber: "",
    },
  };
};

const persistQuotation = (quotation: Quotation) => {
  const updatedQuotations = [quotation, ...quotations];
  setQuotations(updatedQuotations);
  safeStorage.setItem("quotations", updatedQuotations);
  
  // Update appointment status if quotation is linked to an appointment
  if (quotation.appointmentId) {
    const appointments = safeStorage.getItem<any[]>("appointments", []);
    const appointmentIndex = appointments.findIndex((apt) => apt.id === quotation.appointmentId);
    
    if (appointmentIndex !== -1) {
      const appointment = appointments[appointmentIndex];
      // Check if this is the first quotation for this appointment
      const existingQuotations = safeStorage.getItem<Quotation[]>("quotations", []);
      const quotationsForAppointment = existingQuotations.filter(
        (q) => q.appointmentId === quotation.appointmentId && q.id !== quotation.id
      );
      
      // Update appointment status to "Quotation Created" if first quotation
      // For subsequent quotations, status remains "Quotation Created" (allows multiple quotations)
      if (quotationsForAppointment.length === 0 || appointment.status !== "Quotation Created") {
        appointments[appointmentIndex] = {
          ...appointment,
          status: "Quotation Created",
        };
        safeStorage.setItem("appointments", appointments);
      }
    }
  }
};

// Helper function to validate WhatsApp number
const validateWhatsAppNumber = (phone: string): boolean => {
  if (!phone || phone.trim() === "") return false;
  const cleaned = phone.replace(/\D/g, "");
  // Indian phone numbers should be 10 digits, with optional country code
  return cleaned.length >= 10 && cleaned.length <= 13;
};

// Helper function to generate complete quotation HTML for PDF/Print
const generateQuotationHTML = (
  quotation: Quotation,
  serviceCenter: any,
  serviceAdvisor: any
): string => {
  const quotationDate = new Date(quotation.quotationDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const validUntilDate = quotation.validUntil
    ? new Date(quotation.validUntil).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const itemsHTML = quotation.items && quotation.items.length > 0
    ? quotation.items
        .map(
          (item, index) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.serialNumber || index + 1}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.partName || "-"}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.partNumber || "-"}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.hsnSacCode || "-"}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity || 0}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${(item.rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.gstPercent || 0}%</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">₹${(item.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>
        `
        )
        .join("")
    : '<tr><td colspan="8" style="border: 1px solid #ddd; padding: 8px; text-align: center;">No items added</td></tr>';

  const insuranceHTML =
    quotation.hasInsurance && (quotation.insurer || quotation.insuranceStartDate || quotation.insuranceEndDate)
      ? `
      <div style="background: #eff6ff; padding: 16px; border-radius: 8px; border: 1px solid #bfdbfe; margin-bottom: 24px;">
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #1e40af;">Insurance Details</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
          ${quotation.insurer ? `<div><strong>Insurer:</strong> ${quotation.insurer.name}</div>` : ""}
          ${quotation.insuranceStartDate ? `<div><strong>Start Date:</strong> ${new Date(quotation.insuranceStartDate).toLocaleDateString("en-IN")}</div>` : ""}
          ${quotation.insuranceEndDate ? `<div><strong>End Date:</strong> ${new Date(quotation.insuranceEndDate).toLocaleDateString("en-IN")}</div>` : ""}
        </div>
      </div>
    `
      : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${quotation.documentType === "Proforma Invoice" ? "Proforma Invoice" : "Quotation"} ${quotation.quotationNumber}</title>
        <meta charset="UTF-8">
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #1f2937;
            line-height: 1.6;
          }
          .header {
            border-bottom: 2px solid #374151;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .company-info {
            flex: 1;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #111827;
          }
          .document-info {
            text-align: right;
          }
          .document-type {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 12px;
          }
          .details-section {
            margin: 24px 0;
          }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            font-size: 14px;
          }
          .detail-item {
            margin-bottom: 8px;
          }
          .detail-label {
            font-weight: 600;
            color: #374151;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
            font-size: 14px;
          }
          th {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            color: #374151;
          }
          td {
            border: 1px solid #d1d5db;
            padding: 10px 8px;
          }
          .pricing-summary {
            max-width: 400px;
            margin-left: auto;
            margin-top: 24px;
          }
          .pricing-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }
          .pricing-total {
            border-top: 2px solid #374151;
            padding-top: 12px;
            margin-top: 12px;
            font-size: 18px;
            font-weight: bold;
          }
          .notes-section {
            margin-top: 24px;
            padding: 16px;
            background-color: #f9fafb;
            border-radius: 8px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-content">
            <div class="company-info">
              <div class="company-name">${serviceCenter.name || "Service Center"}</div>
              <div style="font-size: 14px; color: #6b7280; margin-top: 8px;">
                ${serviceCenter.address || ""}<br>
                ${serviceCenter.city || ""}, ${serviceCenter.state || ""} - ${serviceCenter.pincode || ""}<br>
                Phone: ${serviceCenter.phone || "N/A"}
                ${serviceCenter.gstNumber ? `<br>GST: ${serviceCenter.gstNumber}` : ""}
                ${serviceCenter.panNumber ? `<br>PAN: ${serviceCenter.panNumber}` : ""}
              </div>
            </div>
            <div class="document-info">
              <div class="document-type">${quotation.documentType === "Proforma Invoice" ? "PROFORMA INVOICE" : "QUOTATION"}</div>
              <div style="font-size: 14px;">
                <div><strong>Document No:</strong> ${quotation.quotationNumber}</div>
                <div><strong>Date:</strong> ${quotationDate}</div>
                <div><strong>Valid Till:</strong> ${validUntilDate}</div>
              </div>
            </div>
          </div>
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 14px;">
            <span><strong>Service Advisor:</strong> ${serviceAdvisor.name || "N/A"}</span>
            <span style="margin-left: 24px;"><strong>Phone:</strong> ${serviceAdvisor.phone || "N/A"}</span>
          </div>
        </div>

        <div class="details-section">
          <h3 class="section-title">Customer & Vehicle Details</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Customer Name:</span>
              <span> ${quotation.customer?.firstName || ""} ${quotation.customer?.lastName || ""}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Phone Number:</span>
              <span> ${quotation.customer?.phone || "N/A"}</span>
            </div>
            ${quotation.vehicle ? `
            <div class="detail-item">
              <span class="detail-label">Vehicle Number:</span>
              <span> ${quotation.vehicle.registration || "N/A"}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Brand and Model:</span>
              <span> ${quotation.vehicle.make || ""} ${quotation.vehicle.model || ""}</span>
            </div>
            ` : ""}
            ${quotation.vehicleLocation ? `
            <div class="detail-item">
              <span class="detail-label">Vehicle Location:</span>
              <span> ${quotation.vehicleLocation === "with_customer" ? "Vehicle with Customer" : "Vehicle at Workshop"}</span>
            </div>
            ` : ""}
          </div>
        </div>

        ${insuranceHTML}

        <div class="details-section">
          <h3 class="section-title">Parts & Services</h3>
          <table>
            <thead>
              <tr>
                <th style="text-align: center;">S.No</th>
                <th>Part Name</th>
                <th>Part Number</th>
                <th>HSN/SAC Code</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Rate (₹)</th>
                <th style="text-align: center;">GST %</th>
                <th style="text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>

        <div class="pricing-summary">
          <h3 class="section-title">Pricing Summary</h3>
          <div class="pricing-row">
            <span>Subtotal:</span>
            <span>₹${quotation.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          ${quotation.discount > 0 ? `
          <div class="pricing-row">
            <span>Discount ${quotation.discountPercent > 0 ? `(${quotation.discountPercent.toFixed(1)}%)` : ""}:</span>
            <span>-₹${quotation.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          ` : ""}
          <div class="pricing-row" style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
            <span>Pre-GST Amount:</span>
            <span>₹${quotation.preGstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          ${quotation.cgstAmount > 0 ? `
          <div class="pricing-row">
            <span>CGST (9%):</span>
            <span>₹${quotation.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          ` : ""}
          ${quotation.sgstAmount > 0 ? `
          <div class="pricing-row">
            <span>SGST (9%):</span>
            <span>₹${quotation.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          ` : ""}
          ${quotation.igstAmount > 0 ? `
          <div class="pricing-row">
            <span>IGST (18%):</span>
            <span>₹${quotation.igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          ` : ""}
          <div class="pricing-row pricing-total">
            <span>Total Amount:</span>
            <span>₹${quotation.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        ${quotation.notes || quotation.customNotes ? `
        <div class="notes-section">
          <h3 class="section-title" style="margin-bottom: 8px;">Notes</h3>
          <div>${quotation.notes || quotation.customNotes || ""}</div>
        </div>
        ` : ""}
      </body>
    </html>
  `;
};

// Helper function to format WhatsApp message
const formatWhatsAppMessage = (quotation: Quotation, serviceCenter: any): string => {
  const customerName = quotation.customer?.firstName || "Customer";
  const vehicleInfo = quotation.vehicle
    ? `${quotation.vehicle.make} ${quotation.vehicle.model} (${quotation.vehicle.registration})`
    : "N/A";

  // Show first 3 items, then count of remaining
  const itemsCount = quotation.items?.length || 0;
  const firstItems = quotation.items?.slice(0, 3) || [];
  const remainingCount = itemsCount > 3 ? itemsCount - 3 : 0;

  const itemsSummary = firstItems
    .map((item, idx) => `${idx + 1}. ${item.partName} (Qty: ${item.quantity}) - ₹${item.amount.toLocaleString("en-IN")}`)
    .join("\n");

  const approvalLink = `${window.location.origin}/sc/quotations?quotationId=${quotation.id}&action=approve`;
  const rejectionLink = `${window.location.origin}/sc/quotations?quotationId=${quotation.id}&action=reject`;

  return `Hello ${customerName}! 👋

📄 *${quotation.documentType === "Proforma Invoice" ? "Proforma Invoice" : "Quotation"} ${quotation.quotationNumber}*

📅 Date: ${new Date(quotation.quotationDate).toLocaleDateString("en-IN")}
${quotation.validUntil ? `⏰ Valid Till: ${new Date(quotation.validUntil).toLocaleDateString("en-IN")}\n` : ""}
🚗 Vehicle: ${vehicleInfo}

📋 *Items Summary:*
${itemsSummary}
${remainingCount > 0 ? `... and ${remainingCount} more item${remainingCount > 1 ? "s" : ""}\n` : ""}
💰 *Pricing:*
Subtotal: ₹${quotation.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
${quotation.discount > 0 ? `Discount: -₹${quotation.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n` : ""}*Total Amount: ₹${quotation.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}*

📄 A detailed PDF has been generated. Please review it.

✅ *To Approve:* ${approvalLink}
❌ *To Reject:* ${rejectionLink}

Or reply with "APPROVE" or "REJECT"

📞 Contact: ${serviceCenter.phone || "N/A"}
🏢 ${serviceCenter.name || "Service Center"}`;
};

const sendQuotationToCustomerById = async (
  quotationId: string,
  options?: { manageLoading?: boolean }
) => {
  const quotation = quotations.find((q) => q.id === quotationId);
  if (!quotation) return;

  const { manageLoading = true } = options ?? {};

  try {
    if (manageLoading) {
      setLoading(true);
    }

    const updatedQuotations = quotations.map((q) =>
      q.id === quotationId
        ? {
            ...q,
            status: "sent_to_customer" as const,
            sentToCustomer: true,
            sentToCustomerAt: new Date().toISOString(),
            whatsappSent: true,
            whatsappSentAt: new Date().toISOString(),
          }
        : q
    );

    setQuotations(updatedQuotations);
    safeStorage.setItem("quotations", updatedQuotations);

    // Get service center and advisor details
    const serviceCenterData: any = quotation.serviceCenter || {
      name: "42 EV Tech & Services",
      address: "123 Main Street, Industrial Area",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      phone: "+91-20-12345678",
      gstNumber: (quotation.serviceCenter as any)?.gstNumber || "",
      panNumber: (quotation.serviceCenter as any)?.panNumber || "",
    };

    const serviceAdvisor = {
      name: userInfo?.name || "Service Advisor",
      phone: (userInfo as any)?.phone || "+91-9876543210",
    };

    // Validate WhatsApp number
    const rawWhatsapp =
      (quotation.customer as any)?.whatsappNumber || quotation.customer?.phone || "";
    const customerWhatsapp = rawWhatsapp.replace(/\D/g, "");

    if (!validateWhatsAppNumber(customerWhatsapp)) {
      alert("Customer WhatsApp number is missing or invalid. Please update customer contact information.");
      if (manageLoading) {
        setLoading(false);
      }
      return;
    }

    // Generate quotation HTML
    const quotationHTML = generateQuotationHTML(quotation, serviceCenterData, serviceAdvisor);

    // Print quotation
    const printQuotation = () => {
      try {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          alert("Please allow popups to generate PDF. The quotation details will be shown in the message.");
          return false;
        }

        printWindow.document.write(quotationHTML);
        printWindow.document.close();

        // Wait for content to load, then trigger print
        setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();
            // Close window after a delay
            setTimeout(() => {
              if (!printWindow.closed) {
                printWindow.close();
              }
            }, 2000);
          } catch (printError) {
            console.error("Print error:", printError);
            // Keep window open if print fails
          }
        }, 500);
        return true;
      } catch (error) {
        console.error("Error opening print window:", error);
        alert("Could not open print dialog. The quotation will still be sent via WhatsApp.");
        return false;
      }
    };

    // Generate PDF
    printQuotation();

    // Format WhatsApp message
    const message = formatWhatsAppMessage(quotation, serviceCenterData);
    const whatsappUrl = `https://wa.me/${customerWhatsapp}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp with delay to allow PDF generation
    setTimeout(() => {
      try {
        window.open(whatsappUrl, "_blank");
        alert("Quotation PDF generated and sent to customer via WhatsApp!\n\nCustomer can approve or reject via the links provided.");
      } catch (error) {
        console.error("Error opening WhatsApp:", error);
        alert("Could not open WhatsApp. Please copy this link manually:\n\n" + whatsappUrl);
      }
    }, 1500);
  } catch (error) {
    console.error("Error sending quotation:", error);
    alert("Failed to send quotation via WhatsApp. Please try again.");
  } finally {
    if (manageLoading) {
      setLoading(false);
    }
  }
};


  // Add item
  const addItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          serialNumber: form.items.length + 1,
          partName: "",
          partNumber: "",
          hsnSacCode: "",
          quantity: 1,
          rate: 0,
          gstPercent: 18,
          amount: 0,
        },
      ],
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    const newItems = form.items.filter((_, i) => i !== index);
    // Re-number items
    newItems.forEach((item, i) => {
      item.serialNumber = i + 1;
    });
    setForm({ ...form, items: newItems });
  };

  // Update item
  const updateItem = (index: number, field: keyof QuotationItem, value: string | number) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate amount
    if (field === "rate" || field === "quantity") {
      newItems[index].amount = newItems[index].rate * newItems[index].quantity;
    }
    
    setForm({ ...form, items: newItems });
  };

  // Handle note template selection
  const handleNoteTemplateChange = (templateId: string) => {
    const template = noteTemplates.find((t) => t.id === templateId);
    if (template) {
      setForm({
        ...form,
        noteTemplateId: templateId,
        notes: template.content,
      });
    }
  };

// Submit quotation or check-in slip
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Handle check-in slip
  if (form.documentType === "Check-in Slip") {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }

    try {
      setLoading(true);
      
      const vehicle = selectedCustomer.vehicles?.find((v) => String(v.id) === form.vehicleId) || selectedCustomer.vehicles?.[0] || null;
      
      // Get appointment data if available
      const quotationDataFromStorage = safeStorage.getItem<any>("pendingQuotationFromAppointment", null);
      const appointmentData = quotationDataFromStorage?.appointmentData;

      // Get service center info
      const normalizedServiceCenterId = activeServiceCenterId || serviceCenterContext.serviceCenterId?.toString() || "sc-001";
      const serviceCenter = staticServiceCenters.find(
        (sc) => (sc as any).serviceCenterId === normalizedServiceCenterId || sc.id?.toString() === normalizedServiceCenterId
      );
      const serviceCenterName = serviceCenter?.name || serviceCenterContext.serviceCenterName || "Service Center";

      // Convert form data to enhanced check-in slip data
      const enhancedData = convertCheckInSlipFormToData(
        checkInSlipFormData,
        selectedCustomer,
        vehicle,
        appointmentData,
        normalizedServiceCenterId,
        serviceCenterName
      );

      setCheckInSlipData(enhancedData);
      
      // Convert check-in slip to quotation format and save it
      const checkInSlipQuotation: Quotation = {
        id: `checkin-${Date.now()}`,
        quotationNumber: enhancedData.slipNumber,
        serviceCenterId: normalizedServiceCenterId,
        customerId: selectedCustomer.id?.toString() || "",
        vehicleId: vehicle?.id?.toString(),
        serviceAdvisorId: userInfo?.id || "",
        appointmentId: appointmentData?.id || quotationDataFromStorage?.appointmentId,
        documentType: "Check-in Slip",
        quotationDate: enhancedData.checkInDate,
        validUntil: undefined,
        hasInsurance: false,
        insurerId: undefined,
        subtotal: 0,
        discount: 0,
        discountPercent: 0,
        preGstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalAmount: 0,
        notes: enhancedData.notes || enhancedData.customerFeedback || "",
        batterySerialNumber: enhancedData.batterySerialNumber,
        customNotes: enhancedData.technicalObservation || "",
        noteTemplateId: undefined,
        status: "draft",
        passedToManager: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
        customer: {
          id: selectedCustomer.id?.toString() || "",
          firstName: selectedCustomer.name?.split(" ")[0] || "Customer",
          lastName: selectedCustomer.name?.split(" ").slice(1).join(" ") || "",
          phone: selectedCustomer.phone || "",
          email: selectedCustomer.email,
          address: selectedCustomer.address,
          city: selectedCustomer.cityState?.split(",")[0] || "",
          state: selectedCustomer.cityState?.split(",")[1]?.trim() || "",
          pincode: selectedCustomer.pincode || "",
        },
        vehicle: vehicle ? {
          id: vehicle.id?.toString() || "",
          make: vehicle.vehicleMake || "",
          model: vehicle.vehicleModel || "",
          registration: vehicle.registration || "",
          vin: vehicle.vin || "",
        } : undefined,
        serviceCenter: {
          id: normalizedServiceCenterId,
          name: serviceCenterName,
          code: SERVICE_CENTER_CODE_MAP[normalizedServiceCenterId] || "SC001",
          address: enhancedData.serviceCenterAddress,
          city: enhancedData.serviceCenterCity,
          state: enhancedData.serviceCenterState,
          pincode: enhancedData.serviceCenterPincode,
          phone: enhancedData.serviceCenterPhone,
        },
      };

      // Save check-in slip as quotation
      persistQuotation(checkInSlipQuotation);
      
      // Store enhanced check-in slip data for display
      safeStorage.setItem(`checkInSlip_${checkInSlipQuotation.id}`, enhancedData);
      
      setShowCheckInSlipModal(true);
      // Keep form open so user can send via WhatsApp
      // setShowCreateModal(false);
      
      // Clear stored appointment data if exists
      if (quotationDataFromStorage) {
        safeStorage.removeItem("pendingQuotationFromAppointment");
      }
      
      alert("Check-in slip generated successfully! You can now send it to the customer via WhatsApp.");
    } catch (error) {
      console.error("Error creating check-in slip:", error);
      alert("Failed to create check-in slip. Please try again.");
    } finally {
      setLoading(false);
    }
    return;
  }

  // Handle quotation/proforma invoice
  if (!validateQuotationForm()) {
    return;
  }

  try {
    setLoading(true);
    const newQuotation = buildQuotationFromForm();
    persistQuotation(newQuotation);
    setFilter("draft");

    alert("Quotation created successfully!");
    setShowCreateModal(false);
    resetForm();
  } catch (error) {
    console.error("Error creating quotation:", error);
    alert("Failed to create quotation. Please try again.");
  } finally {
    setLoading(false);
  }
};

const handleCreateAndSendToCustomer = async () => {
  if (!validateQuotationForm()) {
    return;
  }

  try {
    setLoading(true);
    const newQuotation = buildQuotationFromForm();
    persistQuotation(newQuotation);
    setFilter("sent_to_customer");

    await sendQuotationToCustomerById(newQuotation.id, { manageLoading: false });

    setShowCreateModal(false);
    resetForm();
  } catch (error) {
    console.error("Error creating and sending quotation:", error);
    alert("Failed to create and send quotation. Please try again.");
  } finally {
    setLoading(false);
  }
};

  // Generate and Send Check-in Slip to Customer
  const handleGenerateAndSendCheckInSlip = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }

    try {
      setLoading(true);
      
      const vehicle = selectedCustomer.vehicles?.find((v) => String(v.id) === form.vehicleId) || selectedCustomer.vehicles?.[0] || null;
      
      // Get appointment data if available
      const quotationDataFromStorage = safeStorage.getItem<any>("pendingQuotationFromAppointment", null);
      const appointmentData = quotationDataFromStorage?.appointmentData;

      // Get service center info
      const normalizedServiceCenterId = activeServiceCenterId || serviceCenterContext.serviceCenterId?.toString() || "sc-001";
      const serviceCenter = staticServiceCenters.find(
        (sc) => (sc as any).serviceCenterId === normalizedServiceCenterId || sc.id?.toString() === normalizedServiceCenterId
      );
      const serviceCenterName = serviceCenter?.name || serviceCenterContext.serviceCenterName || "Service Center";

      // Convert form data to enhanced check-in slip data
      const enhancedData = convertCheckInSlipFormToData(
        checkInSlipFormData,
        selectedCustomer,
        vehicle,
        appointmentData,
        normalizedServiceCenterId,
        serviceCenterName
      );

      setCheckInSlipData(enhancedData);
      
      // Convert check-in slip to quotation format and save it
      const checkInSlipQuotation: Quotation = {
        id: `checkin-${Date.now()}`,
        quotationNumber: enhancedData.slipNumber,
        serviceCenterId: normalizedServiceCenterId,
        customerId: selectedCustomer.id?.toString() || "",
        vehicleId: vehicle?.id?.toString(),
        serviceAdvisorId: userInfo?.id || "",
        appointmentId: appointmentData?.id || quotationDataFromStorage?.appointmentId,
        documentType: "Check-in Slip",
        quotationDate: enhancedData.checkInDate,
        validUntil: undefined,
        hasInsurance: false,
        insurerId: undefined,
        subtotal: 0,
        discount: 0,
        discountPercent: 0,
        preGstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalAmount: 0,
        notes: enhancedData.notes || enhancedData.customerFeedback || "",
        batterySerialNumber: enhancedData.batterySerialNumber,
        customNotes: enhancedData.technicalObservation || "",
        noteTemplateId: undefined,
        status: "draft",
        passedToManager: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
        customer: {
          id: selectedCustomer.id?.toString() || "",
          firstName: selectedCustomer.name?.split(" ")[0] || "Customer",
          lastName: selectedCustomer.name?.split(" ").slice(1).join(" ") || "",
          phone: selectedCustomer.phone || "",
          email: selectedCustomer.email,
          address: selectedCustomer.address,
          city: selectedCustomer.cityState?.split(",")[0] || "",
          state: selectedCustomer.cityState?.split(",")[1]?.trim() || "",
          pincode: selectedCustomer.pincode || "",
        },
        vehicle: vehicle ? {
          id: vehicle.id?.toString() || "",
          make: vehicle.vehicleMake || "",
          model: vehicle.vehicleModel || "",
          registration: vehicle.registration || "",
          vin: vehicle.vin || "",
        } : undefined,
        serviceCenter: {
          id: normalizedServiceCenterId,
          name: serviceCenterName,
          code: SERVICE_CENTER_CODE_MAP[normalizedServiceCenterId] || "SC001",
          address: enhancedData.serviceCenterAddress,
          city: enhancedData.serviceCenterCity,
          state: enhancedData.serviceCenterState,
          pincode: enhancedData.serviceCenterPincode,
          phone: enhancedData.serviceCenterPhone,
        },
      };

      // Save check-in slip as quotation
      persistQuotation(checkInSlipQuotation);
      
      // Store enhanced check-in slip data for display
      safeStorage.setItem(`checkInSlip_${checkInSlipQuotation.id}`, enhancedData);
      
      // Clear stored appointment data if exists
      if (quotationDataFromStorage) {
        safeStorage.removeItem("pendingQuotationFromAppointment");
      }

      // Send to customer via WhatsApp
      const rawWhatsapp =
        (selectedCustomer as any)?.whatsappNumber ||
        selectedCustomer?.phone ||
        "";
      const customerWhatsapp = rawWhatsapp.replace(/\D/g, "");

      if (!customerWhatsapp) {
        alert("Customer WhatsApp number not found. Check-in slip generated but could not send via WhatsApp.");
        setShowCheckInSlipModal(true);
        return;
      }

      // Format check-in date and time
      const checkInDate = new Date(enhancedData.checkInDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const checkInTime = enhancedData.checkInTime.includes(":")
        ? (() => {
            const [hours, minutes] = enhancedData.checkInTime.split(":");
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? "PM" : "AM";
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
          })()
        : enhancedData.checkInTime;

      // Create WhatsApp message
      const message = `Hello ${enhancedData.customerName}, your check-in slip ${enhancedData.slipNumber} has been generated.

Vehicle: ${enhancedData.vehicleMake} ${enhancedData.vehicleModel} - ${enhancedData.registrationNumber}
Service Center: ${enhancedData.serviceCenterName}
Check-in Date: ${checkInDate} at ${checkInTime}

Please keep this slip safe for vehicle collection.`;

      const whatsappUrl = `https://wa.me/${customerWhatsapp}?text=${encodeURIComponent(message)}`;

      // Open WhatsApp
      window.open(whatsappUrl, "_blank");
      
      alert("Check-in slip generated and sent to customer via WhatsApp!");
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("Error generating and sending check-in slip:", error);
      alert("Failed to generate and send check-in slip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Send Check-in Slip to Customer via WhatsApp
  const handleSendCheckInSlipToCustomer = async () => {
    if (!checkInSlipData || !selectedCustomer) {
      alert("Please generate a check-in slip first");
      return;
    }

    try {
      setLoading(true);

      // Get customer WhatsApp number
      const rawWhatsapp =
        (selectedCustomer as any)?.whatsappNumber ||
        selectedCustomer?.phone ||
        "";
      const customerWhatsapp = rawWhatsapp.replace(/\D/g, "");

      if (!customerWhatsapp) {
        alert("Customer WhatsApp number not found");
        return;
      }

      // Format check-in date and time
      const checkInDate = new Date(checkInSlipData.checkInDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const checkInTime = checkInSlipData.checkInTime.includes(":")
        ? (() => {
            const [hours, minutes] = checkInSlipData.checkInTime.split(":");
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? "PM" : "AM";
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
          })()
        : checkInSlipData.checkInTime;

      // Create WhatsApp message
      const message = `Hello ${checkInSlipData.customerName}, your check-in slip ${checkInSlipData.slipNumber} has been generated.

Vehicle: ${checkInSlipData.vehicleMake} ${checkInSlipData.vehicleModel} - ${checkInSlipData.registrationNumber}
Service Center: ${checkInSlipData.serviceCenterName}
Check-in Date: ${checkInDate} at ${checkInTime}

Please keep this slip safe for vehicle collection.`;

      const whatsappUrl = `https://wa.me/${customerWhatsapp}?text=${encodeURIComponent(message)}`;

      // Open WhatsApp
      window.open(whatsappUrl, "_blank");
      alert("Check-in slip details sent to customer via WhatsApp!");
    } catch (error) {
      console.error("Error sending check-in slip:", error);
      alert("Failed to send check-in slip via WhatsApp. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Send to Customer via WhatsApp
  const handleSendToCustomer = async (quotationId: string) => {
    const quotation = quotations.find((q) => q.id === quotationId);
    if (!quotation) return;

    try {
      setLoading(true);
      
      // Update quotation status
      const updatedQuotations = quotations.map((q) =>
        q.id === quotationId
          ? {
              ...q,
              status: "sent_to_customer" as const,
              sentToCustomer: true,
              sentToCustomerAt: new Date().toISOString(),
              whatsappSent: true,
              whatsappSentAt: new Date().toISOString(),
            }
          : q
      );
      
      setQuotations(updatedQuotations);
      safeStorage.setItem("quotations", updatedQuotations);
      
      // Create or update lead when quotation is sent to customer
      createOrUpdateLeadFromQuotation(quotation);
      
      // Get service center and advisor details
      const serviceCenterData: any = quotation.serviceCenter || {
        name: "42 EV Tech & Services",
        address: "123 Main Street, Industrial Area",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411001",
        phone: "+91-20-12345678",
        gstNumber: (quotation.serviceCenter as any)?.gstNumber || "",
        panNumber: (quotation.serviceCenter as any)?.panNumber || "",
      };

      const serviceAdvisor = {
        name: userInfo?.name || "Service Advisor",
        phone: (userInfo as any)?.phone || "+91-9876543210",
      };

      // Validate WhatsApp number
      const rawWhatsapp =
        (quotation.customer as any)?.whatsappNumber ||
        quotation.customer?.phone ||
        "";
      const customerWhatsapp = rawWhatsapp.replace(/\D/g, "");

      if (!validateWhatsAppNumber(customerWhatsapp)) {
        alert("Customer WhatsApp number is missing or invalid. Please update customer contact information.");
        setLoading(false);
        return;
      }

      // Generate quotation HTML
      const quotationHTML = generateQuotationHTML(quotation, serviceCenterData, serviceAdvisor);

      // Print quotation
      const printQuotation = () => {
        try {
          const printWindow = window.open("", "_blank");
          if (!printWindow) {
            alert("Please allow popups to generate PDF. The quotation details will be shown in the message.");
            return false;
          }

          printWindow.document.write(quotationHTML);
          printWindow.document.close();

          // Wait for content to load, then trigger print
          setTimeout(() => {
            try {
              printWindow.focus();
              printWindow.print();
              // Close window after a delay
              setTimeout(() => {
                if (!printWindow.closed) {
                  printWindow.close();
                }
              }, 2000);
            } catch (printError) {
              console.error("Print error:", printError);
              // Keep window open if print fails
            }
          }, 500);
          return true;
        } catch (error) {
          console.error("Error opening print window:", error);
          alert("Could not open print dialog. The quotation will still be sent via WhatsApp.");
          return false;
        }
      };

      // Generate PDF
      printQuotation();

      // Format WhatsApp message
      const message = formatWhatsAppMessage(quotation, serviceCenterData);
      const whatsappUrl = `https://wa.me/${customerWhatsapp}?text=${encodeURIComponent(message)}`;

      // Open WhatsApp with delay to allow PDF generation
      setTimeout(() => {
        try {
          window.open(whatsappUrl, "_blank");
          alert("Quotation PDF generated and sent to customer via WhatsApp!\n\nCustomer can approve or reject via the links provided.");
        } catch (error) {
          console.error("Error opening WhatsApp:", error);
          alert("Could not open WhatsApp. Please copy this link manually:\n\n" + whatsappUrl);
        }
      }, 1500);
    } catch (error) {
      console.error("Error sending quotation:", error);
      alert("Failed to send quotation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Convert Quotation to Job Card
  const convertQuotationToJobCard = (quotation: Quotation) => {
  const resolvedServiceCenterId = normalizeServiceCenterId(quotation.serviceCenterId);
  const serviceCenterCode = getServiceCenterCode(resolvedServiceCenterId);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    
    // Get next sequence number
    const existingJobCards = safeStorage.getItem<any[]>("jobCards", []);
    const lastJobCard = existingJobCards
      .filter((jc) => jc.jobCardNumber?.startsWith(`${serviceCenterCode}-${year}-${month}`))
      .sort((a, b) => {
        const aSeq = parseInt(a.jobCardNumber?.split("-")[3] || "0");
        const bSeq = parseInt(b.jobCardNumber?.split("-")[3] || "0");
        return bSeq - aSeq;
      })[0];
    
    const nextSequence = lastJobCard
      ? parseInt(lastJobCard.jobCardNumber?.split("-")[3] || "0") + 1
      : 1;
    
    const jobCardNumber = `${serviceCenterCode}-${year}-${month}-${String(nextSequence).padStart(4, "0")}`;
    
    // Create job card from quotation
    const newJobCard = {
      id: `JC-${Date.now()}`,
      jobCardNumber,
      serviceCenterId: quotation.serviceCenterId || resolvedServiceCenterId,
      serviceCenterCode,
      customerId: quotation.customerId,
      customerName: quotation.customer?.firstName + " " + (quotation.customer?.lastName || "") || "Customer",
      vehicleId: quotation.vehicleId,
      vehicle: quotation.vehicle ? `${quotation.vehicle.make} ${quotation.vehicle.model}` : "Unknown",
      registration: quotation.vehicle?.registration || "",
      vehicleMake: quotation.vehicle?.make,
      vehicleModel: quotation.vehicle?.model,
      serviceType: quotation.items?.[0]?.partName || "Service",
      description: quotation.notes || quotation.customNotes || "Service as per quotation",
      status: "Created" as const,
      priority: "Normal" as const,
      assignedEngineer: null,
      estimatedCost: `₹${quotation.totalAmount.toLocaleString("en-IN")}`,
      estimatedTime: "To be determined",
      createdAt: new Date().toISOString(),
      parts: quotation.items?.map((item) => item.partName) || [],
      location: "Station" as const,
      quotationId: quotation.id,
      hasInsurance: quotation.hasInsurance,
      insurerName: quotation.insurer?.name,
    };
    
    // Save job card
    const updatedJobCards = [...existingJobCards, newJobCard];
    safeStorage.setItem("jobCards", updatedJobCards);
    
    return newJobCard;
  };

  // Create or Update Lead from Quotation (when sent to customer)
  const createOrUpdateLeadFromQuotation = (quotation: Quotation) => {
    const existingLeads = safeStorage.getItem<any[]>("leads", []);
    
    // Check if lead already exists for this quotation
    const existingLeadIndex = existingLeads.findIndex((l) => l.quotationId === quotation.id);
    
    const leadData: any = {
      customerId: quotation.customerId,
      customerName: quotation.customer?.firstName + " " + (quotation.customer?.lastName || "") || "Customer",
      phone: quotation.customer?.phone || "",
      email: quotation.customer?.email,
      vehicleDetails: quotation.vehicle ? `${quotation.vehicle.make} ${quotation.vehicle.model}` : "",
      vehicleMake: quotation.vehicle?.make,
      vehicleModel: quotation.vehicle?.model,
      inquiryType: "Service",
      serviceType: quotation.items?.[0]?.partName || "Service",
      source: "quotation_sent",
      status: "in_discussion" as const,
      quotationId: quotation.id,
      notes: `Quotation ${quotation.quotationNumber} sent to customer. Amount: ₹${quotation.totalAmount.toLocaleString("en-IN")}.`,
      assignedTo: quotation.serviceAdvisorId || userInfo?.id,
      serviceCenterId: quotation.serviceCenterId,
      updatedAt: new Date().toISOString(),
    };
    
    if (existingLeadIndex !== -1) {
      // Update existing lead
      existingLeads[existingLeadIndex] = {
        ...existingLeads[existingLeadIndex],
        ...leadData,
        id: existingLeads[existingLeadIndex].id,
        createdAt: existingLeads[existingLeadIndex].createdAt,
      };
      safeStorage.setItem("leads", existingLeads);
      return existingLeads[existingLeadIndex];
    } else {
      // Create new lead
      const newLead: any = {
        id: `lead-${Date.now()}`,
        ...leadData,
        createdAt: new Date().toISOString(),
      };
      const updatedLeads = [...existingLeads, newLead];
      safeStorage.setItem("leads", updatedLeads);
      return newLead;
    }
  };

  // Update Lead when Job Card is Created
  const updateLeadOnJobCardCreation = (quotationId: string, jobCardId: string, jobCardNumber: string) => {
    const existingLeads = safeStorage.getItem<any[]>("leads", []);
    const leadIndex = existingLeads.findIndex((l) => l.quotationId === quotationId);
    
    if (leadIndex !== -1) {
      const lead = existingLeads[leadIndex];
      const updatedNotes = lead.notes 
        ? `${lead.notes}\nJob card created: ${jobCardNumber}`
        : `Job card created: ${jobCardNumber}`;
      
      existingLeads[leadIndex] = {
        ...lead,
        status: "job_card_in_progress" as const,
        jobCardId: jobCardId,
        convertedTo: "job_card" as const,
        notes: updatedNotes,
        updatedAt: new Date().toISOString(),
      };
      safeStorage.setItem("leads", existingLeads);
      return existingLeads[leadIndex];
    }
    
    // If no lead exists, create one with job_card_in_progress status
    const quotation = quotations.find((q) => q.id === quotationId);
    if (quotation) {
      const newLead: any = {
        id: `lead-${Date.now()}`,
        customerId: quotation.customerId,
        customerName: quotation.customer?.firstName + " " + (quotation.customer?.lastName || "") || "Customer",
        phone: quotation.customer?.phone || "",
        email: quotation.customer?.email,
        vehicleDetails: quotation.vehicle ? `${quotation.vehicle.make} ${quotation.vehicle.model}` : "",
        vehicleMake: quotation.vehicle?.make,
        vehicleModel: quotation.vehicle?.model,
        inquiryType: "Service",
        serviceType: quotation.items?.[0]?.partName || "Service",
        source: "quotation_approved",
        status: "job_card_in_progress" as const,
        quotationId: quotation.id,
        jobCardId: jobCardId,
        convertedTo: "job_card" as const,
        notes: `Quotation ${quotation.quotationNumber} approved. Job card created: ${jobCardNumber}`,
        assignedTo: quotation.serviceAdvisorId || userInfo?.id,
        serviceCenterId: quotation.serviceCenterId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedLeads = [...existingLeads, newLead];
      safeStorage.setItem("leads", updatedLeads);
      return newLead;
    }
    
    return null;
  };

  // Add Rejected Quotation to Leads
  const addRejectedQuotationToLeads = (quotation: Quotation) => {
    const existingLeads = safeStorage.getItem<any[]>("leads", []);
    
    const newLead: any = {
      id: `lead-${Date.now()}`,
      customerId: quotation.customerId,
      customerName: quotation.customer?.firstName + " " + (quotation.customer?.lastName || "") || "Customer",
      phone: quotation.customer?.phone || "",
      email: quotation.customer?.email,
      vehicleDetails: quotation.vehicle ? `${quotation.vehicle.make} ${quotation.vehicle.model}` : "",
      vehicleMake: quotation.vehicle?.make,
      vehicleModel: quotation.vehicle?.model,
      inquiryType: "Service",
      serviceType: quotation.items?.[0]?.partName || "Service",
      source: "quotation_rejection",
      status: "in_discussion" as const,
      notes: `Quotation ${quotation.quotationNumber} was rejected by customer. Amount: ₹${quotation.totalAmount.toLocaleString("en-IN")}. Reason: Customer did not approve the quotation.`,
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
      assignedTo: quotation.serviceAdvisorId || userInfo?.id,
      serviceCenterId: quotation.serviceCenterId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      convertedTo: "quotation" as const,
      convertedId: quotation.id,
    };
    
    const updatedLeads = [...existingLeads, newLead];
    safeStorage.setItem("leads", updatedLeads);
    
    return newLead;
  };

  // Customer Approval
  const handleCustomerApproval = async (quotationId: string) => {
    if (!confirm("Customer has approved this quotation. Convert to job card and notify advisor?")) {
      return;
    }

    try {
      setLoading(true);
      
      const quotation = quotations.find((q) => q.id === quotationId);
      if (!quotation) {
        alert("Quotation not found!");
        return;
      }
      
      // Update quotation status
      const updatedQuotations = quotations.map((q) =>
        q.id === quotationId
          ? {
              ...q,
              status: "customer_approved" as const,
              customerApproved: true,
              customerApprovedAt: new Date().toISOString(),
            }
          : q
      );
      
      setQuotations(updatedQuotations);
      safeStorage.setItem("quotations", updatedQuotations);
      
      // Convert to job card
      const jobCard = convertQuotationToJobCard(quotation);
      
      // Update lead status to job_card_in_progress
      updateLeadOnJobCardCreation(quotation.id, jobCard.id, jobCard.jobCardNumber);
      
      // Automatically send job card to manager for technician assignment and parts monitoring
      const updatedJobCards = safeStorage.getItem<any[]>("jobCards", []);
      const jobCardIndex = updatedJobCards.findIndex((jc) => jc.id === jobCard.id);
      if (jobCardIndex !== -1) {
        updatedJobCards[jobCardIndex] = {
          ...updatedJobCards[jobCardIndex],
          status: "Created",
          submittedToManager: true,
          submittedAt: new Date().toISOString(),
        };
        safeStorage.setItem("jobCards", updatedJobCards);
      }
      
      // Show notification to advisor
      alert(`✅ Customer Approved!\n\nQuotation ${quotation.quotationNumber} has been approved by the customer.\n\nJob Card Created: ${jobCard.jobCardNumber}\n\nJob card has been automatically sent to Service Manager for technician assignment and parts monitoring.`);
      
      // In production, you would send a notification/email to the advisor and manager here
      console.log("Notification to advisor:", {
        advisorId: quotation.serviceAdvisorId,
        message: `Quotation ${quotation.quotationNumber} approved by customer. Job Card ${jobCard.jobCardNumber} created and sent to manager.`,
        quotationId: quotation.id,
        jobCardId: jobCard.id,
      });
      
      console.log("Notification to manager:", {
        message: `New job card ${jobCard.jobCardNumber} requires technician assignment and parts monitoring.`,
        jobCardId: jobCard.id,
        jobCardNumber: jobCard.jobCardNumber,
      });
      
    } catch (error) {
      console.error("Error approving quotation:", error);
      alert("Failed to approve quotation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Customer Rejection
  const handleCustomerRejection = async (quotationId: string) => {
    if (!confirm("Customer has rejected this quotation. Add to leads for follow-up?")) {
      return;
    }

    try {
      setLoading(true);
      
      const quotation = quotations.find((q) => q.id === quotationId);
      if (!quotation) {
        alert("Quotation not found!");
        return;
      }
      
      // Update quotation status
      const updatedQuotations = quotations.map((q) =>
        q.id === quotationId
          ? {
              ...q,
              status: "customer_rejected" as const,
              customerRejected: true,
              customerRejectedAt: new Date().toISOString(),
            }
          : q
      );
      
      setQuotations(updatedQuotations);
      safeStorage.setItem("quotations", updatedQuotations);
      
      // Add to leads for follow-up
      const lead = addRejectedQuotationToLeads(quotation);
      
      // Show notification to advisor
      alert(`⚠️ Customer Rejected Quotation\n\nQuotation ${quotation.quotationNumber} has been rejected by the customer.\n\nAdded to Leads for follow-up.\n\nLead ID: ${lead.id}\n\nPlease follow up with the customer to understand their concerns.`);
      
      // In production, you would send a notification/email to the advisor here
      console.log("Notification to advisor:", {
        advisorId: quotation.serviceAdvisorId,
        message: `Quotation ${quotation.quotationNumber} rejected by customer. Added to leads for follow-up.`,
        quotationId: quotation.id,
        leadId: lead.id,
      });
      
      alert("Quotation marked as customer rejected.");
    } catch (error) {
      console.error("Error rejecting quotation:", error);
      alert("Failed to reject quotation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Send to Manager
  const handleSendToManager = async (quotationId: string) => {
    if (!confirm("Send this quotation to manager for approval?")) {
      return;
    }

    try {
      setLoading(true);
      
      const updatedQuotations = quotations.map((q) =>
        q.id === quotationId
          ? {
              ...q,
              status: "sent_to_manager" as const,
              sentToManager: true,
              sentToManagerAt: new Date().toISOString(),
            }
          : q
      );
      
      setQuotations(updatedQuotations);
      safeStorage.setItem("quotations", updatedQuotations);
      
      alert("Quotation sent to manager!");
    } catch (error) {
      console.error("Error sending to manager:", error);
      alert("Failed to send quotation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Manager Approval
  const handleManagerApproval = async (quotationId: string) => {
    if (!confirm("Approve this quotation? This will allow job card creation.")) {
      return;
    }

    try {
      setLoading(true);
      
      const updatedQuotations = quotations.map((q) =>
        q.id === quotationId
          ? {
              ...q,
              status: "manager_approved" as const,
              managerApproved: true,
              managerApprovedAt: new Date().toISOString(),
              managerId: userInfo?.id || "",
            }
          : q
      );
      
      setQuotations(updatedQuotations);
      safeStorage.setItem("quotations", updatedQuotations);
      
      alert("Quotation approved by manager!");
    } catch (error) {
      console.error("Error approving quotation:", error);
      alert("Failed to approve quotation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Manager Rejection
  const handleManagerRejection = async (quotationId: string) => {
    if (!confirm("Reject this quotation?")) {
      return;
    }

    try {
      setLoading(true);
      
      const updatedQuotations = quotations.map((q) =>
        q.id === quotationId
          ? {
              ...q,
              status: "manager_rejected" as const,
              managerRejected: true,
              managerRejectedAt: new Date().toISOString(),
              managerId: userInfo?.id || "",
            }
          : q
      );
      
      setQuotations(updatedQuotations);
      safeStorage.setItem("quotations", updatedQuotations);
      
      alert("Quotation rejected by manager.");
    } catch (error) {
      console.error("Error rejecting quotation:", error);
      alert("Failed to reject quotation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = useCallback(() => {
    setForm({
      customerId: "",
      vehicleId: "",
      documentType: "Quotation",
      quotationDate: new Date().toISOString().split("T")[0],
      validUntilDays: 30,
      hasInsurance: false,
      insurerId: "",
      insuranceCompanyName: "",
      insuranceStartDate: "",
      insuranceEndDate: "",
      items: [],
      discount: 0,
      notes: "",
      batterySerialNumber: "",
      customNotes: "",
      noteTemplateId: "",
    });
    setCheckInSlipFormData({});
    setSelectedCustomer(null);
    setActiveCustomerId("");
    setCustomerSearchQuery("");
    clearCustomerSearch();
  }, [clearCustomerSearch]);

  // Filtered quotations
  const filteredQuotations = quotations.filter((q) => {
    if (filter !== "all" && q.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        q.quotationNumber.toLowerCase().includes(query) ||
        q.customer?.firstName?.toLowerCase().includes(query) ||
        q.customer?.phone?.includes(query) ||
        q.vehicle?.registration?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "sent_to_customer":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "customer_approved":
        return "bg-green-100 text-green-700 border-green-300";
      case "customer_rejected":
        return "bg-red-100 text-red-700 border-red-300";
      case "sent_to_manager":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "manager_approved":
        return "bg-green-100 text-green-700 border-green-300";
      case "manager_rejected":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Quotations</h1>
            <p className="text-gray-500">Create and manage service quotations</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Create Quotation
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by quotation number, customer, or vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
        </div>
            <div className="flex gap-2">
              {(["all", "draft", "sent_to_customer", "customer_approved", "customer_rejected", "sent_to_manager", "manager_approved", "manager_rejected"] as QuotationFilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f === "all" 
                    ? "All" 
                    : f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, " ")}
                </button>
              ))}
      </div>
          </div>
        </div>

        {/* Quotations List */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
              <p className="text-gray-600">Loading quotations...</p>
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">No quotations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quotation #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotations.map((quotation) => (
                    <tr key={quotation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{quotation.quotationNumber}</div>
                        <div className="text-xs text-gray-500">{quotation.documentType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {quotation.customer?.firstName} {quotation.customer?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{quotation.customer?.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {quotation.vehicle ? `${quotation.vehicle.make} ${quotation.vehicle.model}` : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">{quotation.vehicle?.registration}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(quotation.quotationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {quotation.documentType === "Check-in Slip" ? (
                          <div className="text-sm text-gray-500">N/A</div>
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            ₹{quotation.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${quotation.documentType === "Check-in Slip" ? "bg-indigo-100 text-indigo-700 border-indigo-300" : getStatusColor(quotation.status)}`}>
                          {quotation.documentType === "Check-in Slip" ? "Check-in Slip" : quotation.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {quotation.documentType === "Check-in Slip" ? (
                            <>
                              <button
                                onClick={() => {
                                  // Load check-in slip data and display
                                  const storedCheckInSlipData = safeStorage.getItem<any>(`checkInSlip_${quotation.id}`, null) as EnhancedCheckInSlipData | null;
                                  if (storedCheckInSlipData) {
                                    setCheckInSlipData(storedCheckInSlipData);
                                    // Find and set customer for WhatsApp sending
                                    const customers = safeStorage.getItem<CustomerWithVehicles[]>("customers", []);
                                    const customer = customers.find(c => c.id?.toString() === quotation.customerId);
                                    if (customer) {
                                      setSelectedCustomer(customer);
                                    }
                                    setShowCheckInSlipModal(true);
                                  } else {
                                    // Fallback: reconstruct from quotation data
                                    const reconstructedData: EnhancedCheckInSlipData = {
                                      slipNumber: quotation.quotationNumber,
                                      customerName: `${quotation.customer?.firstName || ""} ${quotation.customer?.lastName || ""}`.trim(),
                                      phone: quotation.customer?.phone || "",
                                      email: quotation.customer?.email,
                                      vehicleMake: quotation.vehicle?.make || "",
                                      vehicleModel: quotation.vehicle?.model || "",
                                      registrationNumber: quotation.vehicle?.registration || "",
                                      vin: quotation.vehicle?.vin,
                                      checkInDate: quotation.quotationDate,
                                      checkInTime: new Date().toTimeString().slice(0, 5),
                                      serviceCenterName: quotation.serviceCenter?.name || "",
                                      serviceCenterAddress: quotation.serviceCenter?.address || "",
                                      serviceCenterCity: quotation.serviceCenter?.city || "",
                                      serviceCenterState: quotation.serviceCenter?.state || "",
                                      serviceCenterPincode: quotation.serviceCenter?.pincode || "",
                                      serviceCenterPhone: quotation.serviceCenter?.phone,
                                      notes: quotation.notes,
                                    };
                                    setCheckInSlipData(reconstructedData);
                                    const customers = safeStorage.getItem<CustomerWithVehicles[]>("customers", []);
                                    const customer = customers.find(c => c.id?.toString() === quotation.customerId);
                                    if (customer) {
                                      setSelectedCustomer(customer);
                                    }
                                    setShowCheckInSlipModal(true);
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Check-in Slip"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  // Load check-in slip data and send
                                  const storedCheckInSlipData = safeStorage.getItem<any>(`checkInSlip_${quotation.id}`, null) as EnhancedCheckInSlipData | null;
                                  if (storedCheckInSlipData) {
                                    setCheckInSlipData(storedCheckInSlipData);
                                    // Find customer from storage
                                    const customers = safeStorage.getItem<CustomerWithVehicles[]>("customers", []);
                                    const customer = customers.find(c => c.id?.toString() === quotation.customerId);
                                    if (customer) {
                                      setSelectedCustomer(customer);
                                      handleSendCheckInSlipToCustomer();
                                    } else {
                                      alert("Customer not found");
                                    }
                                  } else {
                                    alert("Check-in slip data not found");
                                  }
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="Send to Customer via WhatsApp"
                              >
                                <MessageCircle size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedQuotation(quotation);
                                  setShowViewModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View"
                              >
                                <Eye size={18} />
                              </button>
                              {isServiceAdvisor && quotation.status === "draft" && (
                                <button
                                  onClick={() => handleSendToCustomer(quotation.id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Send to Customer"
                                >
                                  <MessageCircle size={18} />
                                </button>
                              )}
                              {isServiceAdvisor && quotation.status === "customer_approved" && (
                                <button
                                  onClick={() => handleSendToManager(quotation.id)}
                                  className="text-purple-600 hover:text-purple-900"
                                  title="Send to Manager"
                                >
                                  <ArrowRight size={18} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Quotation Modal - This will be a large modal, continuing in next part */}
      {showCreateModal && (
        <CreateQuotationModal
          form={form}
          setForm={setForm}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          activeServiceCenterId={activeServiceCenterId}
          setActiveCustomerId={setActiveCustomerId}
          customerSearchQuery={customerSearchQuery}
          setCustomerSearchQuery={setCustomerSearchQuery}
          customerSearchResults={customerSearchResults}
          clearCustomerSearch={clearCustomerSearch}
          insurers={insurers}
          noteTemplates={noteTemplates}
          totals={totals}
          addItem={addItem}
          removeItem={removeItem}
          updateItem={updateItem}
          handleNoteTemplateChange={handleNoteTemplateChange}
          handleSubmit={handleSubmit}
          handleCreateAndSendToCustomer={handleCreateAndSendToCustomer}
          handleGenerateAndSendCheckInSlip={handleGenerateAndSendCheckInSlip}
          checkInSlipFormData={checkInSlipFormData}
          setCheckInSlipFormData={setCheckInSlipFormData}
          userInfo={userInfo}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          loading={loading}
        />
      )}

      {/* Check-in Slip Modal */}
      {showCheckInSlipModal && checkInSlipData && (
        <CheckInSlip
          data={checkInSlipData as CheckInSlipData}
          onClose={() => {
            setShowCheckInSlipModal(false);
            setCheckInSlipData(null);
            resetForm();
          }}
          {...(selectedCustomer && { onSendToCustomer: () => { handleSendCheckInSlipToCustomer(); } })}
        />
      )}

      {/* View Quotation Modal */}
      {showViewModal && selectedQuotation && (
        <ViewQuotationModal
          quotation={selectedQuotation}
          userInfo={userInfo}
          userRole={userRole}
          isServiceAdvisor={isServiceAdvisor}
          isServiceManager={isServiceManager}
          onClose={() => {
            setShowViewModal(false);
            setSelectedQuotation(null);
          }}
          onSendToCustomer={handleSendToCustomer}
          onCustomerApproval={handleCustomerApproval}
          onCustomerRejection={handleCustomerRejection}
          onSendToManager={handleSendToManager}
          onManagerApproval={handleManagerApproval}
          onManagerRejection={handleManagerRejection}
        />
      )}
    </div>
  );
}

// Export with Suspense wrapper for useSearchParams
export default function Quotations() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <QuotationsContent />
    </Suspense>
  );
}

// Create Quotation Modal Component (will be split due to size)
function CreateQuotationModal({
  form,
  setForm,
  selectedCustomer,
  setSelectedCustomer,
  activeServiceCenterId,
  setActiveCustomerId,
  customerSearchQuery,
  setCustomerSearchQuery,
  customerSearchResults,
  clearCustomerSearch,
  insurers,
  noteTemplates,
  totals,
  addItem,
  removeItem,
  updateItem,
  handleNoteTemplateChange,
  handleSubmit,
  handleCreateAndSendToCustomer,
  handleGenerateAndSendCheckInSlip,
  handleSendCheckInSlipToCustomer,
  checkInSlipFormData,
  setCheckInSlipFormData,
  userInfo,
  checkInSlipData,
  onClose,
  loading,
}: any) {
  // Get appointment data directly from localStorage as fallback
  const appointmentDataFromStorage = typeof window !== "undefined" 
    ? safeStorage.getItem<any>("pendingQuotationFromAppointment", null)?.appointmentData 
    : null;
  
  // Get selected vehicle
  const selectedVehicle = selectedCustomer?.vehicles?.find(
    (v: Vehicle) => String(v.id) === form.vehicleId
  ) || selectedCustomer?.vehicles?.[0] || null;
  
  // Get insurance data from form, vehicle, or appointment data (priority: form > vehicle > appointment)
  const insuranceCompanyName = 
    form.insuranceCompanyName || 
    selectedVehicle?.insuranceCompanyName || 
    appointmentDataFromStorage?.insuranceCompanyName || 
    "";
  const insuranceStartDate = 
    form.insuranceStartDate || 
    selectedVehicle?.insuranceStartDate || 
    appointmentDataFromStorage?.insuranceStartDate || 
    "";
  const insuranceEndDate = 
    form.insuranceEndDate || 
    selectedVehicle?.insuranceEndDate || 
    appointmentDataFromStorage?.insuranceEndDate || 
    "";
  const hasInsuranceData = !!(insuranceCompanyName || insuranceStartDate || insuranceEndDate);
  
  // This is a placeholder - the full modal will be implemented
  // Due to size constraints, I'll create a comprehensive but focused version
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-[101]">
          <h2 className="text-2xl font-bold text-gray-900">
            {form.documentType === "Check-in Slip" ? "Create Check-in Slip" : "Create Quotation"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Document Type & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
              <select
                value={form.documentType}
                onChange={(e) => setForm({ ...form, documentType: e.target.value as any })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Quotation">Quotation</option>
                <option value="Proforma Invoice">Proforma Invoice</option>
                <option value="Check-in Slip">Check-in Slip</option>
              </select>
            </div>
            {form.documentType !== "Check-in Slip" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quotation Date</label>
                  <input
                    type="date"
                    value={form.quotationDate}
                    onChange={(e) => setForm({ ...form, quotationDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until (Days)</label>
                  <select
                    value={form.validUntilDays}
                    onChange={(e) => setForm({ ...form, validUntilDays: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={15}>15 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Customer Selection - Available for both Quotations and Check-in Slips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search customer by name, phone, or vehicle number..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {customerSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {customerSearchResults.map((customer: CustomerWithVehicles) => (
                    <div
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        const firstVehicle = customer.vehicles?.[0];
                        const vehicleId = firstVehicle?.id?.toString() || "";
                        
                        // Auto-populate insurance data from first vehicle if available
                        setForm({ 
                          ...form, 
                          customerId: customer.id.toString(), 
                          vehicleId: vehicleId,
                          insuranceCompanyName: firstVehicle?.insuranceCompanyName || form.insuranceCompanyName || "",
                          insuranceStartDate: firstVehicle?.insuranceStartDate || form.insuranceStartDate || "",
                          insuranceEndDate: firstVehicle?.insuranceEndDate || form.insuranceEndDate || "",
                          hasInsurance: !!(firstVehicle?.insuranceCompanyName || firstVehicle?.insuranceStartDate || firstVehicle?.insuranceEndDate || form.hasInsurance),
                        });
                        setActiveCustomerId(customer.id.toString());
                        setCustomerSearchQuery("");
                        clearCustomerSearch();
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedCustomer && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{selectedCustomer.name}</div>
                <div className="text-sm text-gray-600">{selectedCustomer.phone}</div>
              </div>
            )}
          </div>

          {/* Vehicle Selection - Available for both Quotations and Check-in Slips */}
          {selectedCustomer && selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
              <select
                value={form.vehicleId}
                onChange={(e) => {
                  const vehicleId = e.target.value;
                  const vehicle = selectedCustomer.vehicles?.find((v: any) => String(v.id) === vehicleId);
                  
                  // Auto-populate insurance data from selected vehicle
                  setForm({ 
                    ...form, 
                    vehicleId: vehicleId,
                    insuranceCompanyName: vehicle?.insuranceCompanyName || form.insuranceCompanyName || "",
                    insuranceStartDate: vehicle?.insuranceStartDate || form.insuranceStartDate || "",
                    insuranceEndDate: vehicle?.insuranceEndDate || form.insuranceEndDate || "",
                    hasInsurance: !!(vehicle?.insuranceCompanyName || vehicle?.insuranceStartDate || vehicle?.insuranceEndDate || form.hasInsurance),
                  });
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Vehicle</option>
                {selectedCustomer.vehicles.map((vehicle: any) => (
                  <option key={vehicle.id} value={vehicle.id.toString()}>
                    {vehicle.vehicleMake} {vehicle.vehicleModel} - {vehicle.registration}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Check-in Slip Form */}
          {form.documentType === "Check-in Slip" ? (
            <CheckInSlipForm
              formData={checkInSlipFormData}
              onUpdate={(updates) => setCheckInSlipFormData((prev: CheckInSlipFormData) => ({ ...prev, ...updates }))}
              customer={selectedCustomer}
              vehicle={selectedCustomer?.vehicles?.find((v: Vehicle) => String(v.id) === form.vehicleId) || selectedCustomer?.vehicles?.[0] || null}
              appointmentData={safeStorage.getItem<any>("pendingQuotationFromAppointment", null)?.appointmentData}
              defaultServiceAdvisor={userInfo?.name}
            />
          ) : (
            <>

          {/* Insurance Details - Show pre-filled from appointment form */}
          {hasInsuranceData && (
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>Insurance Details</span>
                <span className="text-xs font-normal text-gray-500">(from appointment)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insuranceCompanyName && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Company Name</label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-medium">
                      {insuranceCompanyName}
                    </div>
                    {!form.insurerId && (
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Select Matching Insurer (Optional)</label>
                        <select
                          value={form.insurerId || ""}
                          onChange={(e) => setForm({ ...form, insurerId: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                        >
                          <option value="">Select Insurer</option>
                          {insurers.map((insurer: Insurer) => (
                            <option key={insurer.id} value={insurer.id}>
                              {insurer.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {form.insurerId && (
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Matched Insurer</label>
                        <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
                          {insurers.find((i: Insurer) => i.id === form.insurerId)?.name || "Selected Insurer"}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {insuranceStartDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Start Date</label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900">
                      {new Date(insuranceStartDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                )}
                
                {insuranceEndDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance End Date</label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900">
                      {new Date(insuranceEndDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parts & Services Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Parts & Services</label>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add Item
              </button>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Name *</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">HSN/SAC</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">GST %</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {form.items.map((item: QuotationItem, index: number) => (
                    <tr key={index}>
                      <td className="px-3 py-2">{item.serialNumber}</td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.partName}
                          onChange={(e) => updateItem(index, "partName", e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.partNumber}
                          onChange={(e) => updateItem(index, "partNumber", e.target.value)}
                          placeholder="MCU-"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.hsnSacCode}
                          onChange={(e) => updateItem(index, "hsnSacCode", e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                          min="1"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateItem(index, "rate", Number(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.gstPercent}
                          onChange={(e) => updateItem(index, "gstPercent", Number(e.target.value))}
                          min="0"
                          max="100"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-sm">₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium">₹{totals.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Discount ({totals.discountPercent.toFixed(1)}%):</span>
                <span className="font-medium">-₹{totals.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Pre-GST Amount:</span>
                <span className="font-medium">₹{totals.preGstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">CGST (9%):</span>
                <span className="font-medium">₹{totals.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">SGST (9%):</span>
                <span className="font-medium">₹{totals.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">IGST (18%):</span>
                <span className="font-medium">₹{totals.igst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-lg font-bold text-blue-600">₹{totals.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount (₹)</label>
              <input
                type="number"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note Template</label>
                <select
                  value={form.noteTemplateId}
                  onChange={(e) => handleNoteTemplateChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Template</option>
                  {noteTemplates.map((template: NoteTemplate) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Battery Serial Number</label>
                <input
                  type="text"
                  value={form.batterySerialNumber}
                  onChange={(e) => setForm({ ...form, batterySerialNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter notes or select a template above"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Notes</label>
                <textarea
                  value={form.customNotes}
                  onChange={(e) => setForm({ ...form, customNotes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Additional custom notes"
                />
              </div>
            </div>
          </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            {form.documentType === "Check-in Slip" && checkInSlipData && (
              <button
                type="button"
                disabled={loading}
                onClick={handleSendCheckInSlipToCustomer}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 inline-flex items-center gap-2"
              >
                <MessageCircle size={18} />
                {loading ? "Sending..." : "Send to Customer via WhatsApp"}
              </button>
            )}
            {form.documentType === "Check-in Slip" && selectedCustomer && handleGenerateAndSendCheckInSlip && (
              <button
                type="button"
                disabled={loading}
                onClick={handleGenerateAndSendCheckInSlip}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {loading ? "Sending..." : "Generate & Send to Customer"}
              </button>
            )}
            {form.documentType !== "Check-in Slip" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    // Pass to manager logic
                    alert("Pass to manager functionality will be implemented");
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Pass to Manager
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCreateAndSendToCustomer}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Create & Send to Customer"}
                </button>
              </>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
            >
              {loading 
                ? (form.documentType === "Check-in Slip" ? "Generating..." : "Creating...") 
                : (form.documentType === "Check-in Slip" ? "Generate Check-in Slip" : "Create Quotation")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// View Quotation Modal - Proforma Invoice Template
function ViewQuotationModal({ 
  quotation, 
  onClose, 
  onSendToCustomer,
  onCustomerApproval,
  onCustomerRejection,
  onSendToManager,
  onManagerApproval,
  onManagerRejection,
  userInfo,
  userRole,
  isServiceAdvisor,
  isServiceManager,
}: any) {
  // Mock service center details (in production, fetch from service center data)
  const serviceCenter = quotation.serviceCenter || {
    name: "42 EV Tech & Services",
    address: "123 Main Street, Industrial Area",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    phone: "+91-20-12345678",
    gstNumber: "27AAAAA0000A1Z5",
    panNumber: "AAAAA0000A",
  };

  // Service advisor details from user info
  const serviceAdvisor = {
    name: userInfo?.name || "Service Advisor",
    phone: userInfo?.phone || "+91-9876543210",
  };

  const validUntilDate = quotation.validUntil 
    ? new Date(quotation.validUntil).toLocaleDateString("en-IN")
    : "N/A";

  const quotationDate = new Date(quotation.quotationDate).toLocaleDateString("en-IN");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-[101] no-print">
          <h2 className="text-2xl font-bold text-gray-900">
            {quotation.documentType === "Proforma Invoice" ? "Proforma Invoice" : "Quotation"}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm inline-flex items-center gap-2"
            >
              <Printer size={16} />
              Print/Download
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Proforma Invoice Template */}
        <div className="p-8 bg-white">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              .no-print {
                display: none !important;
              }
              body {
                background: white !important;
              }
            }
          `}} />
          {/* Header Section */}
          <div className="border-b-2 border-gray-300 pb-6 mb-6">
            <div className="flex justify-between items-start">
              {/* Company Logo & Details */}
              <div className="flex-1">
                <div className="mb-4">
                  {/* Logo placeholder - in production, use actual logo */}
                  <div className="w-32 h-20 bg-gray-200 rounded flex items-center justify-center mb-3">
                    <Building2 className="text-gray-400" size={40} />
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <h3 className="text-xl font-bold text-gray-900">{serviceCenter.name}</h3>
                  <p className="text-gray-700">{serviceCenter.address}</p>
                  <p className="text-gray-700">
                    {serviceCenter.city}, {serviceCenter.state} - {serviceCenter.pincode}
                  </p>
                  <p className="text-gray-700">Phone: {serviceCenter.phone}</p>
                  {serviceCenter.panNumber && (
                    <p className="text-gray-700">PAN: {serviceCenter.panNumber}</p>
                  )}
                  {serviceCenter.gstNumber && (
                    <p className="text-gray-700">GST: {serviceCenter.gstNumber}</p>
                  )}
                </div>
              </div>

              {/* Document Type & Details */}
              <div className="text-right">
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-blue-600 mb-2">
                    {quotation.documentType === "Proforma Invoice" ? "PROFORMA INVOICE" : "QUOTATION"}
                  </h2>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Document No:</span>
                    <p className="text-gray-900 font-medium">{quotation.quotationNumber}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Date:</span>
                    <p className="text-gray-900">{quotationDate}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Valid Till:</span>
                    <p className="text-gray-900">{validUntilDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Advisor Details */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Service Advisor:</span>
                  <span className="text-gray-900 ml-2">{serviceAdvisor.name}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Phone:</span>
                  <span className="text-gray-900 ml-2">{serviceAdvisor.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Customer & Vehicle Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Customer Name</p>
                <p className="text-gray-900">
                  {quotation.customer?.firstName || ""} {quotation.customer?.lastName || ""}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Phone Number</p>
                <p className="text-gray-900">{quotation.customer?.phone || "N/A"}</p>
              </div>
              {quotation.vehicle && (
                <>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Vehicle Number</p>
                    <p className="text-gray-900">{quotation.vehicle.registration || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Brand and Model</p>
                    <p className="text-gray-900">
                      {quotation.vehicle.make || ""} {quotation.vehicle.model || ""}
                    </p>
                  </div>
                </>
              )}
              {quotation.vehicleLocation && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Vehicle Location</p>
                  <p className="text-gray-900">
                    {quotation.vehicleLocation === "with_customer" ? "Vehicle with Customer" : "Vehicle at Workshop"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Insurance Details */}
          {quotation.hasInsurance && (quotation.insurer || quotation.insuranceStartDate || quotation.insuranceEndDate) && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Insurance Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {quotation.insurer && (
                  <>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Insurer Name</p>
                      <p className="text-gray-900">{quotation.insurer.name}</p>
                    </div>
                    {quotation.insurer.gstNumber && (
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Insurer GST Number</p>
                        <p className="text-gray-900">{quotation.insurer.gstNumber}</p>
                      </div>
                    )}
                    {quotation.insurer.address && (
                      <div className="col-span-2">
                        <p className="font-semibold text-gray-700 mb-1">Insurer Address</p>
                        <p className="text-gray-900">{quotation.insurer.address}</p>
                      </div>
                    )}
                  </>
                )}
                {quotation.insuranceStartDate && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Insurance Start Date</p>
                    <p className="text-gray-900">
                      {new Date(quotation.insuranceStartDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
                {quotation.insuranceEndDate && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Insurance End Date</p>
                    <p className="text-gray-900">
                      {new Date(quotation.insuranceEndDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parts & Services Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Parts & Services
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      S.No
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Part Name
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Part Number
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      HSN/SAC Code
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700">
                      Quantity
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-700">
                      Rate (₹)
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700">
                      GST %
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-700">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items && quotation.items.length > 0 ? (
                    quotation.items.map((item: QuotationItem, index: number) => (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                          {item.serialNumber}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                          {item.partName}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                          {item.partNumber || "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                          {item.hsnSacCode || "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-center text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-900">
                          {item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-center text-gray-900">
                          {item.gstPercent}%
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-900 font-medium">
                          {item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="border border-gray-300 px-4 py-4 text-center text-gray-500">
                        No items added
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Pricing Summary
            </h3>
            <div className="max-w-md ml-auto">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-gray-900 font-medium">
                    ₹{quotation.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    Discount {quotation.discountPercent > 0 ? `(${quotation.discountPercent.toFixed(1)}%)` : ""}:
                  </span>
                  <span className="text-gray-900 font-medium">
                    -₹{quotation.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-700">Pre-GST Amount:</span>
                  <span className="text-gray-900 font-medium">
                    ₹{quotation.preGstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {quotation.cgstAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">CGST (9%):</span>
                    <span className="text-gray-900 font-medium">
                      ₹{quotation.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {quotation.sgstAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">SGST (9%):</span>
                    <span className="text-gray-900 font-medium">
                      ₹{quotation.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {quotation.igstAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">IGST (18%):</span>
                    <span className="text-gray-900 font-medium">
                      ₹{quotation.igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t-2 border-gray-400 pt-2 mt-2">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                  <span className="text-lg font-bold text-blue-600">
                    ₹{quotation.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {(quotation.notes || quotation.batterySerialNumber || quotation.customNotes) && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
              <div className="space-y-2 text-sm text-gray-700">
                {quotation.batterySerialNumber && (
                  <div>
                    <span className="font-semibold">Battery Serial Number:</span>
                    <span className="ml-2">{quotation.batterySerialNumber}</span>
                  </div>
                )}
                {quotation.notes && (
                  <div>
                    <p className="whitespace-pre-wrap">{quotation.notes}</p>
                  </div>
                )}
                {quotation.customNotes && (
                  <div>
                    <p className="font-semibold mb-1">Additional Notes:</p>
                    <p className="whitespace-pre-wrap">{quotation.customNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center text-xs text-gray-500">
            <p>This is a {quotation.documentType.toLowerCase()}. Terms and conditions apply.</p>
            <p className="mt-1">For queries, please contact: {serviceCenter.phone}</p>
          </div>
        </div>

        {/* Approval Status Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 no-print">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Approval Status</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {quotation.sentToCustomer ? (
                <CheckCircle className="text-green-600" size={16} />
              ) : (
                <Clock className="text-gray-400" size={16} />
              )}
              <span className="text-sm text-gray-700">
                Sent to Customer: {quotation.sentToCustomer ? "Yes" : "No"}
                {quotation.sentToCustomerAt && ` (${new Date(quotation.sentToCustomerAt).toLocaleString()})`}
              </span>
            </div>
            {quotation.customerApproved !== undefined && (
              <div className="flex items-center gap-2">
                {quotation.customerApproved ? (
                  <UserCheck className="text-green-600" size={16} />
                ) : (
                  <UserX className="text-red-600" size={16} />
                )}
                <span className="text-sm text-gray-700">
                  Customer: {quotation.customerApproved ? "Approved" : "Rejected"}
                  {quotation.customerApprovedAt && ` (${new Date(quotation.customerApprovedAt).toLocaleString()})`}
                  {quotation.customerRejectedAt && ` (${new Date(quotation.customerRejectedAt).toLocaleString()})`}
                </span>
              </div>
            )}
            {quotation.sentToManager && (
              <div className="flex items-center gap-2">
                <ArrowRight className="text-blue-600" size={16} />
                <span className="text-sm text-gray-700">
                  Sent to Manager: {quotation.sentToManagerAt && new Date(quotation.sentToManagerAt).toLocaleString()}
                </span>
              </div>
            )}
            {quotation.managerApproved !== undefined && (
              <div className="flex items-center gap-2">
                {quotation.managerApproved ? (
                  <ShieldCheck className="text-green-600" size={16} />
                ) : (
                  <ShieldX className="text-red-600" size={16} />
                )}
                <span className="text-sm text-gray-700">
                  Manager: {quotation.managerApproved ? "Approved" : "Rejected"}
                  {quotation.managerApprovedAt && ` (${new Date(quotation.managerApprovedAt).toLocaleString()})`}
                  {quotation.managerRejectedAt && ` (${new Date(quotation.managerRejectedAt).toLocaleString()})`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end no-print">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Close
          </button>
          
          {/* Service Advisor Actions (shown for all roles for now so feature is visible) */}
          {(
            <>
              {quotation.status === "draft" && onSendToCustomer && (
                <button
                  onClick={() => onSendToCustomer(quotation.id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium inline-flex items-center gap-2"
                >
                  <MessageCircle size={18} />
                  Send to Customer (WhatsApp)
                </button>
              )}
              {quotation.status === "sent_to_customer" && onCustomerApproval && onCustomerRejection && (
                <>
                  <button
                    onClick={() => onCustomerRejection(quotation.id)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium inline-flex items-center gap-2"
                  >
                    <UserX size={18} />
                    Customer Rejected
                  </button>
                  <button
                    onClick={() => onCustomerApproval(quotation.id)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium inline-flex items-center gap-2"
                  >
                    <UserCheck size={18} />
                    Customer Approved
                  </button>
                </>
              )}
              {quotation.status === "customer_approved" && onSendToManager && (
                <button
                  onClick={() => onSendToManager(quotation.id)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium inline-flex items-center gap-2"
                >
                  <ArrowRight size={18} />
                  Send to Manager
                </button>
              )}
            </>
          )}

          {/* Service Manager Actions */}
          {isServiceManager && onManagerApproval && onManagerRejection && (
            <>
              {quotation.status === "sent_to_manager" && (
                <>
                  <button
                    onClick={() => onManagerRejection(quotation.id)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium inline-flex items-center gap-2"
                  >
                    <ShieldX size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => onManagerApproval(quotation.id)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium inline-flex items-center gap-2"
                  >
                    <ShieldCheck size={18} />
                    Approve
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
