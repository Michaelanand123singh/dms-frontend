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
} from "@/shared/types";
import { useCustomerSearch } from "../../../../hooks/api";
import { defaultQuotations, defaultInsurers, defaultNoteTemplates } from "@/__mocks__/data/quotations.mock";
import { staticServiceCenters } from "@/__mocks__/data/service-centers.mock";
import { getServiceCenterContext } from "@/shared/lib/serviceCenter";

const createEmptyCustomer = (): CustomerWithVehicles => ({
  id: "",
  customerNumber: "",
  name: "Customer",
  phone: "",
  createdAt: new Date().toISOString(),
  vehicles: [],
});

const SERVICE_CENTER_CODE_MAP: Record<string, string> = {
  "sc-001": "SC001",
  "sc-002": "SC002",
  "sc-003": "SC003",
};

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
  
  // Form state
  const [form, setForm] = useState<CreateQuotationForm>({
    customerId: "",
    vehicleId: "",
    documentType: "Quotation",
    quotationDate: new Date().toISOString().split("T")[0],
    validUntilDays: 30,
    hasInsurance: false,
    insurerId: "",
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

  // Handle pre-filling form from appointment service intake
  useEffect(() => {
    if (fromAppointment && typeof window !== "undefined") {
      const serviceIntakeData = safeStorage.getItem<any>("pendingQuotationFromAppointment", null);
      
      if (serviceIntakeData) {
        const normalizedCenterId = normalizeServiceCenterId(
          serviceIntakeData.serviceCenterId ?? serviceCenterContext.serviceCenterId
        );
        setActiveServiceCenterId(normalizedCenterId);

        // Find customer by phone or name
        const findCustomer = async () => {
          try {
            await performCustomerSearch(serviceIntakeData.customerName || serviceIntakeData.phone, "auto");
            // Wait a bit for search results
            setTimeout(() => {
              const customers = customerSearchResults;
              const customer = customers.find(
                (c) => c.phone === serviceIntakeData.phone || c.name === serviceIntakeData.customerName
              );
              
              if (customer) {
                setSelectedCustomer(customer);
                setActiveCustomerId(customer.id?.toString() || "");
                setForm((prev) => ({
                  ...prev,
                  customerId: String(customer.id),
                  documentType: "Quotation",
                  notes: serviceIntakeData.serviceIntakeForm.customerComplaintIssue || "",
                  customNotes: serviceIntakeData.serviceIntakeForm.previousServiceHistory || "",
                  batterySerialNumber: serviceIntakeData.serviceIntakeForm.chargerSerialNumber || "",
                }));
                
                // Find matching vehicle
                if (customer.vehicles && customer.vehicles.length > 0) {
                  const vehicle = customer.vehicles.find(
                    (v) => v.registration === serviceIntakeData.serviceIntakeForm.registrationNumber
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
              else if (serviceIntakeData.customerId) {
                const decodedCustomerId = String(serviceIntakeData.customerId);
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

  if (form.hasInsurance && !form.insurerId) {
    alert("Please select an insurer");
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

  return {
    id: `qt-${Date.now()}`,
    quotationNumber,
    serviceCenterId: resolvedServiceCenterId,
    customerId: resolvedCustomerId,
    vehicleId: form.vehicleId,
    serviceAdvisorId: userInfo?.id || "user-001",
    documentType: form.documentType,
    quotationDate: form.quotationDate,
    validUntil: validUntil.toISOString().split("T")[0],
    hasInsurance: form.hasInsurance,
    insurerId: form.insurerId,
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

    const rawWhatsapp =
      (quotation.customer as any)?.whatsappNumber || quotation.customer?.phone || "";
    const customerWhatsapp = rawWhatsapp.replace(/\D/g, "");

    const printQuotation = () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to generate PDF");
        return;
      }

      const quotationHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Quotation ${quotation.quotationNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
              .quotation-number { font-size: 24px; font-weight: bold; }
              .details { margin: 20px 0; }
              .items { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="quotation-number">Quotation ${quotation.quotationNumber}</div>
              <div>Date: ${new Date(quotation.quotationDate).toLocaleDateString("en-IN")}</div>
            </div>
            <div class="details">
              <p><strong>Customer:</strong> ${quotation.customer?.firstName || ""} ${quotation.customer?.lastName || ""}</p>
              <p><strong>Total:</strong> ₹${quotation.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="total">Total Amount in Words: ₹${quotation.totalAmount.toLocaleString("en-IN")}</div>
          </body>
        </html>
      `;

      printWindow.document.write(quotationHTML);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };

    printQuotation();

    const approvalLink = `${window.location.origin}/sc/quotations?quotationId=${quotation.id}&action=approve`;
    const rejectionLink = `${window.location.origin}/sc/quotations?quotationId=${quotation.id}&action=reject`;

    const message = encodeURIComponent(
      `Hi ${quotation.customer?.firstName || ""},\n\nHere is your quotation ${quotation.quotationNumber} for ₹${quotation.totalAmount.toLocaleString("en-IN")}.\n\nApprove: ${approvalLink}\nReject: ${rejectionLink}`
    );
    const whatsappUrl = `https://wa.me/${customerWhatsapp}?text=${message}`;

    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
      alert("Quotation PDF generated and sent to customer via WhatsApp!\n\nCustomer can approve or reject via the links provided.");
    }, 1000);
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

// Submit quotation
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

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
      
      // Prefer customer's WhatsApp number; fall back to phone if not available
      const rawWhatsapp =
        (quotation.customer as any)?.whatsappNumber ||
        quotation.customer?.phone ||
        "";
      const customerWhatsapp = rawWhatsapp.replace(/\D/g, "");

      // Generate PDF by triggering print/download
      // In a real implementation, you would use a PDF library like jsPDF or html2pdf
      // For now, we'll use the browser's print functionality to generate PDF
      const printQuotation = () => {
        // Create a temporary modal with the quotation content for printing
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          alert("Please allow popups to generate PDF");
          return;
        }
        
        // Get quotation HTML content (simplified version for PDF)
        const quotationHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Quotation ${quotation.quotationNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
                .quotation-number { font-size: 24px; font-weight: bold; }
                .details { margin: 20px 0; }
                .items { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="quotation-number">Quotation ${quotation.quotationNumber}</div>
                <div>Date: ${new Date(quotation.quotationDate).toLocaleDateString("en-IN")}</div>
              </div>
              <div class="details">
                <p><strong>Customer:</strong> ${quotation.customer?.firstName || ""} ${quotation.customer?.lastName || ""}</p>
                <p><strong>Vehicle:</strong> ${quotation.vehicle ? `${quotation.vehicle.make} ${quotation.vehicle.model} (${quotation.vehicle.registration})` : "N/A"}</p>
              </div>
              <table class="items">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${quotation.items.map(item => `
                    <tr>
                      <td>${item.partName}</td>
                      <td>${item.quantity}</td>
                      <td>₹${item.rate.toLocaleString("en-IN")}</td>
                      <td>₹${item.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
              <div class="total">
                <p>Total Amount: ₹${quotation.totalAmount.toLocaleString("en-IN")}</p>
              </div>
            </body>
          </html>
        `;
        
        printWindow.document.write(quotationHTML);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print
        setTimeout(() => {
          printWindow.print();
          // After printing, close the window
          setTimeout(() => printWindow.close(), 1000);
        }, 500);
      };
      
      // Generate PDF first
      printQuotation();
      
      // Open WhatsApp with quotation details and approval/rejection links
      const approvalLink = `${window.location.origin}/sc/quotations/approve/${quotation.id}`;
      const rejectionLink = `${window.location.origin}/sc/quotations/reject/${quotation.id}`;
      
      const message = `Hello ${quotation.customer?.firstName || "Customer"}, your quotation ${quotation.quotationNumber} is ready.\n\n📄 A PDF copy has been generated. Please review it.\n\n✅ To Approve: Click here - ${approvalLink}\n❌ To Reject or Request Changes: Click here - ${rejectionLink}\n\nOr reply with "APPROVE" or "REJECT" in this chat.`;
      const whatsappUrl = `https://wa.me/${customerWhatsapp}?text=${encodeURIComponent(message)}`;
      
      // Small delay to allow PDF generation
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
        alert("Quotation PDF generated and sent to customer via WhatsApp!\n\nCustomer can approve or reject via the links provided.");
      }, 1000);
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
      items: [],
      discount: 0,
      notes: "",
      batterySerialNumber: "",
      customNotes: "",
      noteTemplateId: "",
    });
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
                        <div className="text-sm font-medium text-gray-900">
                          ₹{quotation.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(quotation.status)}`}>
                          {quotation.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
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
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          loading={loading}
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
  onClose,
  loading,
}: any) {
  // This is a placeholder - the full modal will be implemented
  // Due to size constraints, I'll create a comprehensive but focused version
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-[101]">
          <h2 className="text-2xl font-bold text-gray-900">Create Quotation</h2>
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
                onChange={(e) => setForm({ ...form, documentType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Quotation">Quotation</option>
                <option value="Proforma Invoice">Proforma Invoice</option>
              </select>
            </div>
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
          </div>

          {/* Customer Selection */}
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
                        setForm({ ...form, customerId: customer.id.toString(), vehicleId: customer.vehicles?.[0]?.id?.toString() || "" });
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

          {/* Vehicle Selection */}
          {selectedCustomer && selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
              <select
                value={form.vehicleId}
                onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
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

          {/* Insurance Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={form.hasInsurance}
                onChange={(e) => setForm({ ...form, hasInsurance: e.target.checked, insurerId: e.target.checked ? form.insurerId : "" })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Has Insurance</span>
            </label>
            {form.hasInsurance && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Insurer</label>
                <select
                  value={form.insurerId}
                  onChange={(e) => setForm({ ...form, insurerId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required={form.hasInsurance}
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
          </div>

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

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
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
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Quotation"}
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
          {quotation.hasInsurance && quotation.insurer && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Insurance Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
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
