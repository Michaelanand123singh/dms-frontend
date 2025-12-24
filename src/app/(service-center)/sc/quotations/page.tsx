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

import { getServiceCenterContext } from "@/shared/lib/serviceCenter";
import type { CheckInSlipFormData } from "@/shared/types/check-in-slip.types";
import { CheckInSlipForm } from "../components/check-in-slip/CheckInSlipForm";
import CheckInSlip, { generateCheckInSlipNumber, type CheckInSlipData } from "@/components/check-in-slip/CheckInSlip";
import type { EnhancedCheckInSlipData } from "@/shared/types/check-in-slip.types";
import { convertCheckInSlipFormToData } from "../components/check-in-slip/utils";
import { SERVICE_CENTER_CODE_MAP } from "../appointments/constants";
import { generateQuotationNumber } from "@/shared/utils/quotation.utils";
import { getServiceCenterCode, normalizeServiceCenterId } from "@/shared/utils/service-center.utils";
import { CreateQuotationModal } from "../components/quotations/CreateQuotationModal";
import { ViewQuotationModal } from "../components/quotations/ViewQuotationModal";

const createEmptyCustomer = (): CustomerWithVehicles => ({
  id: "",
  customerNumber: "",
  name: "Customer",
  phone: "",
  createdAt: new Date().toISOString(),
  vehicles: [],
});



function QuotationsContent() {
  const { userInfo, userRole } = useRole();
  const isServiceAdvisor = userRole === "service_advisor";
  const isServiceManager = userRole === "sc_manager";
  const searchParams = useSearchParams();
  const fromAppointment = searchParams.get("fromAppointment") === "true";
  const fromJobCard = searchParams.get("fromJobCard") === "true";
  const jobCardIdParam = searchParams.get("jobCardId");

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

  // Handle pre-filling form from job card data
  useEffect(() => {
    if (fromJobCard && typeof window !== "undefined") {
      const quotationData = safeStorage.getItem<any>("pendingQuotationFromJobCard", null);

      if (quotationData && quotationData.jobCardData) {
        const jobCard = quotationData.jobCardData;
        const normalizedCenterId = normalizeServiceCenterId(
          quotationData.serviceCenterId ?? serviceCenterContext.serviceCenterId
        );
        setActiveServiceCenterId(normalizedCenterId);

        // Find customer by ID or phone
        const findCustomer = async () => {
          try {
            if (quotationData.customerId) {
              await performCustomerSearch(quotationData.customerId, "auto");
            } else if (jobCard.part1?.mobilePrimary) {
              await performCustomerSearch(jobCard.part1.mobilePrimary, "auto");
            }

            // Wait a bit for search results
            setTimeout(() => {
              const customers = customerSearchResults;
              const customer = customers.find(
                (c) => c.id === quotationData.customerId ||
                  c.phone === jobCard.part1?.mobilePrimary ||
                  c.name === quotationData.customerName
              );

              if (customer) {
                setSelectedCustomer(customer);
                setActiveCustomerId(customer.id?.toString() || "");

                // Extract insurance data from job card PART 1
                const insuranceCompanyName = jobCard.part1?.insuranceCompanyName || "";
                const insuranceStartDate = jobCard.part1?.insuranceStartDate || "";
                const insuranceEndDate = jobCard.part1?.insuranceEndDate || "";
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
                  notes: jobCard.part1?.customerFeedback || jobCard.description || "",
                  customNotes: jobCard.part1?.technicianObservation || "",
                  batterySerialNumber: jobCard.part1?.batterySerialNumber || "",
                  hasInsurance: hasInsuranceData,
                  insurerId: matchedInsurerId,
                  insuranceCompanyName: insuranceCompanyName || "",
                  insuranceStartDate: insuranceStartDate || "",
                  insuranceEndDate: insuranceEndDate || "",
                }));

                // Find matching vehicle
                if (customer.vehicles && customer.vehicles.length > 0) {
                  const vehicle = customer.vehicles.find(
                    (v) => v.registration === jobCard.part1?.registrationNumber ||
                      v.id === quotationData.vehicleId
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
                safeStorage.removeItem("pendingQuotationFromJobCard");
              } else if (quotationData.customerId) {
                const decodedCustomerId = String(quotationData.customerId);
                setForm((prev) => ({ ...prev, customerId: decodedCustomerId }));
                setActiveCustomerId(decodedCustomerId);
                setShowCreateModal(true);
                safeStorage.removeItem("pendingQuotationFromJobCard");
              }
            }, 500);
          } catch (error) {
            console.error("Error finding customer from job card:", error);
          }
        };

        findCustomer();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromJobCard, jobCardIdParam]);

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
    const resolvedServiceCenterId = normalizeServiceCenterId(
      activeServiceCenterId || serviceCenterContext.serviceCenterId
    );
    const resolvedCustomerId = form.customerId || activeCustomerId || "";
    const serviceCenterCode = getServiceCenterCode(resolvedServiceCenterId);
    const quotationNumber = generateQuotationNumber(resolvedServiceCenterId, quotationDate, quotations);

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

    // Get jobCardId from pendingQuotationFromJobCard if available
    const pendingJobCardData = safeStorage.getItem<any>("pendingQuotationFromJobCard", null);
    const jobCardId = pendingJobCardData?.jobCardId || jobCardIdParam || undefined;

    return {
      id: `qt-${Date.now()}`,
      quotationNumber,
      serviceCenterId: resolvedServiceCenterId,
      customerId: resolvedCustomerId,
      vehicleId: form.vehicleId,
      serviceAdvisorId: userInfo?.id || "user-001",
      appointmentId: appointmentId,
      jobCardId: jobCardId,
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
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
            }
            body {
              padding: 10px 15px !important;
              font-size: 12px !important;
            }
            .no-print { display: none !important; }
            @page {
              margin: 0.8cm !important;
              size: A4;
            }
            @page :first {
              margin: 0.8cm !important;
            }
            .header {
              padding-bottom: 10px !important;
              margin-bottom: 12px !important;
            }
            .company-name {
              font-size: 18px !important;
            }
            .document-type {
              font-size: 20px !important;
            }
            .header-content {
              margin-bottom: 8px !important;
            }
            .details-section {
              margin: 12px 0 !important;
            }
            table {
              font-size: 11px !important;
              margin: 12px 0 !important;
            }
            th, td {
              padding: 6px 4px !important;
            }
            .section-title {
              font-size: 14px !important;
              margin-bottom: 8px !important;
              padding-bottom: 4px !important;
            }
            .details-grid {
              gap: 8px !important;
              font-size: 11px !important;
            }
            .pricing-summary {
              margin-top: 12px !important;
            }
            .pricing-summary-table {
              font-size: 12px !important;
              margin-top: 8px !important;
            }
            .pricing-summary-table td {
              padding: 6px 8px !important;
              font-size: 12px !important;
            }
            .pricing-total-row td {
              font-size: 14px !important;
              padding-top: 8px !important;
            }
            .notes-section {
              margin-top: 12px !important;
              padding: 10px !important;
              font-size: 11px !important;
            }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #1f2937;
            line-height: 1.5;
            font-size: 14px;
          }
          .header {
            border-bottom: 2px solid #374151;
            padding-bottom: 15px;
            margin-bottom: 20px;
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
            margin: 16px 0;
          }
          .section-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 1px solid #e5e7eb;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 13px;
          }
          .detail-item {
            margin-bottom: 6px;
          }
          .detail-label {
            font-weight: 600;
            color: #374151;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 13px;
          }
          th {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 8px 6px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            font-size: 12px;
          }
          td {
            border: 1px solid #d1d5db;
            padding: 8px 6px;
            font-size: 12px;
          }
          .pricing-summary {
            width: 100%;
            margin-left: auto;
            margin-top: 24px;
            margin-right: 0;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .pricing-summary-table {
            width: 100%;
            max-width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            table-layout: fixed;
          }
          .pricing-summary-table td {
            padding: 8px 10px;
            border: none;
            font-size: 13px;
            vertical-align: middle;
            white-space: nowrap;
            overflow: visible;
          }
          .pricing-summary-table td:first-child {
            text-align: left;
            color: #374151;
            font-weight: 500;
            width: 65%;
            padding-right: 15px;
          }
          .pricing-summary-table td:last-child {
            text-align: right;
            color: #111827;
            font-weight: 500;
            width: 35%;
            white-space: nowrap;
            padding-left: 15px;
          }
          .pricing-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
            page-break-inside: avoid;
            break-inside: avoid;
            white-space: nowrap;
          }
          .pricing-row span {
            white-space: nowrap;
          }
          .pricing-total {
            border-top: 2px solid #374151;
            padding-top: 12px;
            margin-top: 12px;
            font-size: 18px;
            font-weight: bold;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .pricing-total-row td {
            border-top: 2px solid #374151;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 16px;
            font-weight: bold;
          }
          .notes-section {
            margin-top: 16px;
            padding: 12px;
            background-color: #f9fafb;
            border-radius: 8px;
            font-size: 13px;
          }
          @media print {
            .pricing-summary {
              max-width: 100% !important;
              width: 100% !important;
              margin-left: auto !important;
              margin-right: 0 !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .pricing-summary-table {
              width: 100% !important;
              max-width: 100% !important;
              table-layout: fixed !important;
            }
            .pricing-summary-table td {
              white-space: nowrap !important;
              overflow: visible !important;
              padding: 10px 12px !important;
            }
            .pricing-summary-table td:first-child {
              width: 65% !important;
              text-align: left !important;
              padding-right: 20px !important;
            }
            .pricing-summary-table td:last-child {
              width: 35% !important;
              text-align: right !important;
              padding-left: 20px !important;
            }
            .pricing-row {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              white-space: nowrap !important;
            }
            .pricing-row span {
              white-space: nowrap !important;
            }
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
          <table class="pricing-summary-table" style="width: 100%; table-layout: fixed;">
            <tbody>
              <tr>
                <td style="width: 65%; text-align: left; padding-right: 15px; padding: 8px 10px;">Subtotal:</td>
                <td style="width: 35%; text-align: right; padding-left: 15px; padding: 8px 10px; white-space: nowrap;">₹${quotation.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              ${quotation.discount > 0 ? `
              <tr>
                <td style="width: 65%; text-align: left; padding-right: 15px; padding: 8px 10px;">Discount ${quotation.discountPercent > 0 ? `(${quotation.discountPercent.toFixed(1)}%)` : ""}:</td>
                <td style="width: 35%; text-align: right; padding-left: 15px; padding: 8px 10px; white-space: nowrap;">-₹${quotation.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              ` : ""}
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="width: 65%; text-align: left; padding-right: 15px; padding: 8px 10px; padding-top: 10px;">Pre-GST Amount:</td>
                <td style="width: 35%; text-align: right; padding-left: 15px; padding: 8px 10px; padding-top: 10px; white-space: nowrap;">₹${quotation.preGstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              ${quotation.cgstAmount > 0 ? `
              <tr>
                <td style="width: 65%; text-align: left; padding-right: 15px; padding: 8px 10px;">CGST (9%):</td>
                <td style="width: 35%; text-align: right; padding-left: 15px; padding: 8px 10px; white-space: nowrap;">₹${quotation.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              ` : ""}
              ${quotation.sgstAmount > 0 ? `
              <tr>
                <td style="width: 65%; text-align: left; padding-right: 15px; padding: 8px 10px;">SGST (9%):</td>
                <td style="width: 35%; text-align: right; padding-left: 15px; padding: 8px 10px; white-space: nowrap;">₹${quotation.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              ` : ""}
              ${quotation.igstAmount > 0 ? `
              <tr>
                <td style="width: 65%; text-align: left; padding-right: 15px; padding: 8px 10px;">IGST (18%):</td>
                <td style="width: 35%; text-align: right; padding-left: 15px; padding: 8px 10px; white-space: nowrap;">₹${quotation.igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              ` : ""}
              <tr class="pricing-total-row">
                <td style="width: 65%; text-align: left; padding-right: 15px; border-top: 2px solid #374151; padding-top: 10px; font-size: 16px; font-weight: bold;">Total Amount:</td>
                <td style="width: 35%; text-align: right; padding-left: 15px; border-top: 2px solid #374151; padding-top: 10px; font-size: 16px; font-weight: bold; white-space: nowrap;">₹${quotation.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
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
      jobCardId: quotation.jobCardId, // Link to job card if available
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

      // Find temporary job card linked to quotation
      const storedJobCards = safeStorage.getItem<any[]>("jobCards", []);
      const tempJobCard = storedJobCards.find((jc) =>
        jc.id === quotation.jobCardId && jc.isTemporary === true
      );

      let jobCard;
      if (tempJobCard) {
        // Convert job card in-place
        const jobCardIndex = storedJobCards.findIndex((jc) => jc.id === tempJobCard.id);
        storedJobCards[jobCardIndex] = {
          ...tempJobCard,
          isTemporary: false,
          status: "Created" as const, // Will be changed to "Ready for Assignment" if needed
          quotationId: quotation.id,
          submittedToManager: true,
          submittedAt: new Date().toISOString(),
        };
        safeStorage.setItem("jobCards", storedJobCards);
        jobCard = storedJobCards[jobCardIndex];
      } else {
        // Fallback: Create new job card if temporary one not found
        jobCard = convertQuotationToJobCard(quotation);
      }

      // Update lead status to job_card_in_progress or converted
      updateLeadOnJobCardCreation(quotation.id, jobCard.id, jobCard.jobCardNumber);

      // Show notification to advisor
      alert(`✅ Customer Approved!\n\nQuotation ${quotation.quotationNumber} has been approved by the customer.\n\nJob Card: ${jobCard.jobCardNumber}\n\nJob card has been automatically sent to Service Manager for technician assignment and parts monitoring.`);

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
                  className={`px-4 py-2 rounded-lg font-medium transition ${filter === f
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
