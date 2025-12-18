"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PlusCircle, Loader2, X, Plus, Trash2, Edit2, Search, UserPlus, Car, Upload, Image as ImageIcon, Video, FileText, CheckCircle, FileCheck, Receipt } from "lucide-react";

import type { JobCard, Priority, ServiceLocation } from "@/shared/types";
import { availableParts } from "@/__mocks__/data/job-cards.mock";
import { getServiceCenterContext } from "@/shared/lib/serviceCenter";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { createPartsRequestFromJobCard } from "@/shared/utils/jobCardPartsRequest.util";
import { populateJobCardPart1, createEmptyJobCardPart1, generateSrNoForPart2Items, createEmptyJobCardPart2A } from "@/shared/utils/jobCardData.util";
import { customerService } from "@/features/customers/services/customer.service";
import type { JobCardPart2Item, JobCardPart2A } from "@/shared/types/job-card.types";
import type { CustomerWithVehicles } from "@/shared/types";
import type { Quotation } from "@/shared/types/quotation.types";
import CheckInSlip, { generateCheckInSlipNumber, type CheckInSlipData } from "@/components/check-in-slip/CheckInSlip";

interface DocumentationFiles {
  files: File[];
  urls: string[];
}

export type CreateJobCardForm = {
  // Basic fields
  vehicleId: string;
  customerId: string;
  customerName: string;
  vehicleRegistration: string;
  vehicleMake: string;
  vehicleModel: string;
  description: string;
  selectedParts: string[];

  // PART 2 items
  part2Items: JobCardPart2Item[];

  // PART 1 fields
  fullName: string;
  mobilePrimary: string;
  customerType: "B2C" | "B2B" | "";
  vehicleBrand: string;
  vinChassisNumber: string;
  variantBatteryCapacity: string;
  warrantyStatus: string;
  estimatedDeliveryDate: string;
  customerAddress: string;
  customerFeedback: string;
  technicianObservation: string;
  insuranceStartDate: string;
  insuranceEndDate: string;
  insuranceCompanyName: string;
  batterySerialNumber: string;
  mcuSerialNumber: string;
  vcuSerialNumber: string;
  otherPartSerialNumber: string;

  // Additional Customer Contact Fields
  whatsappNumber?: string;
  alternateMobile?: string;
  email?: string;

  // Additional Vehicle Details
  vehicleYear?: number;
  motorNumber?: string;
  chargerSerialNumber?: string;
  dateOfPurchase?: string;
  vehicleColor?: string;

  // Additional Service Details
  previousServiceHistory?: string;
  odometerReading?: string;

  // Operational Fields
  pickupDropRequired?: boolean;
  pickupAddress?: string;
  pickupState?: string;
  pickupCity?: string;
  pickupPincode?: string;
  dropAddress?: string;
  dropState?: string;
  dropCity?: string;
  dropPincode?: string;
  preferredCommunicationMode?: "Phone" | "Email" | "SMS" | "WhatsApp";

  // Check-in Fields
  arrivalMode?: "vehicle_present" | "vehicle_absent" | "check_in_only";
  checkInNotes?: string;
  checkInSlipNumber?: string;
  checkInDate?: string;
  checkInTime?: string;

  // PART 2A fields (Warranty/Insurance Case Details)
  videoEvidence: DocumentationFiles;
  vinImage: DocumentationFiles;
  odoImage: DocumentationFiles;
  damageImages: DocumentationFiles;
  issueDescription: string;
  numberOfObservations: string;
  symptom: string;
  defectPart: string;
};

const INITIAL_DOCUMENTATION_FILES: DocumentationFiles = {
  files: [],
  urls: [],
};

export const INITIAL_JOB_CARD_FORM: CreateJobCardForm = {
  vehicleId: "",
  customerId: "",
  customerName: "",
  vehicleRegistration: "",
  vehicleMake: "",
  vehicleModel: "",
  description: "",
  selectedParts: [],
  part2Items: [],
  // PART 1 fields
  fullName: "",
  mobilePrimary: "",
  customerType: "",
  vehicleBrand: "",
  vinChassisNumber: "",
  variantBatteryCapacity: "",
  warrantyStatus: "",
  estimatedDeliveryDate: "",
  customerAddress: "",
  customerFeedback: "",
  technicianObservation: "",
  insuranceStartDate: "",
  insuranceEndDate: "",
  insuranceCompanyName: "",
  batterySerialNumber: "",
  mcuSerialNumber: "",
  vcuSerialNumber: "",
  otherPartSerialNumber: "",
  // Additional Customer Contact Fields
  whatsappNumber: "",
  alternateMobile: "",
  email: "",
  // Additional Vehicle Details
  vehicleYear: undefined,
  motorNumber: "",
  chargerSerialNumber: "",
  dateOfPurchase: "",
  vehicleColor: "",
  // Additional Service Details
  previousServiceHistory: "",
  odometerReading: "",
  // Operational Fields
  pickupDropRequired: false,
  pickupAddress: "",
  pickupState: "",
  pickupCity: "",
  pickupPincode: "",
  dropAddress: "",
  dropState: "",
  dropCity: "",
  dropPincode: "",
  preferredCommunicationMode: undefined,
  // Check-in Fields
  arrivalMode: undefined,
  checkInNotes: "",
  checkInSlipNumber: "",
  checkInDate: "",
  checkInTime: "",
  // PART 2A fields
  videoEvidence: { ...INITIAL_DOCUMENTATION_FILES },
  vinImage: { ...INITIAL_DOCUMENTATION_FILES },
  odoImage: { ...INITIAL_DOCUMENTATION_FILES },
  damageImages: { ...INITIAL_DOCUMENTATION_FILES },
  issueDescription: "",
  numberOfObservations: "",
  symptom: "",
  defectPart: "",
};

const SERVICE_CENTER_CODE_MAP: Record<string, string> = {
  "1": "SC001",
  "2": "SC002",
  "3": "SC003",
};

interface JobCardFormModalProps {
  open: boolean;
  initialValues?: Partial<CreateJobCardForm>;
  jobCardId?: string; // For edit mode
  mode?: "create" | "edit"; // Form mode
  onClose: () => void;
  onCreated: (jobCard: JobCard) => void;
  onUpdated?: (jobCard: JobCard) => void; // For edit mode
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
  const [form, setForm] = useState<CreateJobCardForm>({
    ...INITIAL_JOB_CARD_FORM,
    ...(initialValues ?? {}),
  });
  const [creating, setCreating] = useState(false);
  const [previewJobCardNumber, setPreviewJobCardNumber] = useState<string>("");
  const serviceCenterContext = useMemo(() => getServiceCenterContext(), []);

  // Search functionality - Only show customers with approved quotations
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Array<{
    customer: CustomerWithVehicles;
    quotation: Quotation;
    vehicle?: any;
  }>>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithVehicles | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [hasApprovedQuotations, setHasApprovedQuotations] = useState<boolean>(true);
  const [showCheckInSlip, setShowCheckInSlip] = useState<boolean>(false);
  const [checkInSlipData, setCheckInSlipData] = useState<CheckInSlipData | null>(null);

  useEffect(() => {
    if (open) {
      const serviceCenterId = String(serviceCenterContext.serviceCenterId ?? "sc-001");
      const serviceCenterCode = SERVICE_CENTER_CODE_MAP[serviceCenterId] || "SC001";
      
      // In edit mode, load existing job card
      if (mode === "edit" && jobCardId) {
        const { migrateAllJobCards } = require("../../job-cards/utils/migrateJobCards.util");
        const existingJobCards = migrateAllJobCards();
        const existingJobCard = existingJobCards.find((jc) => jc.id === jobCardId);
        if (existingJobCard) {
          setPreviewJobCardNumber(existingJobCard.jobCardNumber);
        } else {
          setPreviewJobCardNumber(generateJobCardNumber(serviceCenterCode));
        }
      } else {
        setPreviewJobCardNumber(generateJobCardNumber(serviceCenterCode));
      }

      // Check if there are any approved quotations (only for create mode)
      if (mode === "create") {
        const allQuotations = safeStorage.getItem<Quotation[]>("quotations", []);
        const approvedQuotations = allQuotations.filter(
          (q) => q.status === "customer_approved" && q.customerApproved === true
        );
        setHasApprovedQuotations(approvedQuotations.length > 0);
      } else {
        // In edit mode, skip quotation requirement
        setHasApprovedQuotations(true);
      }
    }
  }, [open, serviceCenterContext.serviceCenterId, mode, jobCardId]);

  useEffect(() => {
    if (!open) {
      // Reset search when modal closes
      setSearchQuery("");
      setSearchResults([]);
      setShowSearchResults(false);
      setSelectedCustomer(null);
      setSelectedVehicle(null);
      setSelectedQuotation(null);
      return;
    }
    setForm({
      ...INITIAL_JOB_CARD_FORM,
      ...(initialValues ?? {}),
    });
  }, [initialValues, open]);

  // Search customers with approved quotations only
  useEffect(() => {
    if (!searchQuery.trim() || !open) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      try {
        setSearching(true);

        // Step 1: Get all approved quotations
        const allQuotations = safeStorage.getItem<Quotation[]>("quotations", []);
        const approvedQuotations = allQuotations.filter(
          (q) => q.status === "customer_approved" && q.customerApproved === true
        );

        if (approvedQuotations.length === 0) {
          setSearchResults([]);
          setShowSearchResults(true);
          setSearching(false);
          return;
        }

        // Step 2: Get unique customer IDs from approved quotations
        const approvedCustomerIds = new Set(approvedQuotations.map(q => q.customerId));

        // Step 3: First check if search query matches quotation number directly
        const query = searchQuery.toLowerCase();
        const quotationMatches = approvedQuotations.filter(q =>
          q.quotationNumber?.toLowerCase().includes(query)
        );

        let matchedResults: Array<{ customer: CustomerWithVehicles; quotation: Quotation; vehicle?: any }> = [];

        if (quotationMatches.length > 0) {
          // If quotation number matches, try to get customers for those quotations
          for (const quotation of quotationMatches) {
            if (!quotation.customerId) {
              console.warn(`Quotation ${quotation.id} has no customerId`);
              continue;
            }

            try {
              // Try to get customer from repository/service
              let customer: CustomerWithVehicles | null = null;
              try {
                customer = await customerService.getById(quotation.customerId);
              } catch (err) {
                // If customer not found, create a minimal customer object from quotation data
                if (quotation.customer) {
                  customer = {
                    id: quotation.customer.id || quotation.customerId,
                    customerNumber: `CUST-${quotation.customerId}`,
                    name: `${quotation.customer.firstName} ${quotation.customer.lastName || ""}`.trim(),
                    phone: quotation.customer.phone,
                    email: quotation.customer.email,
                    address: quotation.customer.address,
                    cityState: quotation.customer.city && quotation.customer.state
                      ? `${quotation.customer.city}, ${quotation.customer.state}`
                      : undefined,
                    pincode: quotation.customer.pincode,
                    createdAt: new Date().toISOString(),
                    vehicles: quotation.vehicle ? [{
                      id: quotation.vehicle.id || quotation.vehicleId || "",
                      customerId: quotation.customerId,
                      registration: quotation.vehicle.registration,
                      vin: quotation.vehicle.vin,
                      vehicleMake: quotation.vehicle.make,
                      vehicleModel: quotation.vehicle.model,
                      phone: quotation.customer.phone,
                      customerName: `${quotation.customer.firstName} ${quotation.customer.lastName || ""}`.trim(),
                      customerEmail: quotation.customer.email || "",
                      customerAddress: quotation.customer.address || "",
                      vehicleYear: 0,
                      vehicleColor: "",
                      lastServiceDate: "",
                      totalServices: 0,
                      totalSpent: "0",
                      currentStatus: "Available" as const,
                      activeJobCardId: null,
                    }] : [],
                  } as CustomerWithVehicles;
                } else {
                  console.warn(`Quotation ${quotation.id} has no customer data and customer ${quotation.customerId} not found`);
                  continue;
                }
              }

              if (!customer) {
                continue;
              }

              const vehicle = customer.vehicles?.find(
                v => (quotation.vehicleId && v.id.toString() === quotation.vehicleId) ||
                  (quotation.vehicle?.vin && v.vin === quotation.vehicle.vin) ||
                  (quotation.vehicle?.registration && v.registration === quotation.vehicle.registration)
              ) || customer.vehicles?.[0] || null;

              matchedResults.push({ customer, quotation, vehicle });
            } catch (err) {
              console.warn(`Error processing quotation ${quotation.id}:`, err);
              // Continue with other quotations even if one fails
            }
          }
        } else {
          // Step 4: Search customers and filter by approved quotation customers
          let customerResults: CustomerWithVehicles[] = [];

          // Try searching by name first
          let results = await customerService.search(searchQuery, "name");
          customerResults = results.filter(c => approvedCustomerIds.has(c.id.toString()));

          // If no results, try searching by VIN
          if (customerResults.length === 0) {
            results = await customerService.search(searchQuery, "vin");
            customerResults = results.filter(c => approvedCustomerIds.has(c.id.toString()));
          }

          // Also try vehicle number
          if (customerResults.length === 0) {
            results = await customerService.search(searchQuery, "vehicleNumber");
            customerResults = results.filter(c => approvedCustomerIds.has(c.id.toString()));
          }

          // Step 5: Match customers with their approved quotations
          matchedResults = customerResults
            .map(customer => {
              // Find approved quotations for this customer
              const customerQuotations = approvedQuotations.filter(
                q => q.customerId && q.customerId === customer.id.toString()
              );

              // For each quotation, create a result entry
              return customerQuotations.map(quotation => {
                // Find the vehicle from quotation or customer's vehicles
                const vehicle = customer.vehicles?.find(
                  v => (quotation.vehicleId && v.id.toString() === quotation.vehicleId) ||
                    (quotation.vehicle?.vin && v.vin === quotation.vehicle.vin) ||
                    (quotation.vehicle?.registration && v.registration === quotation.vehicle.registration)
                ) || customer.vehicles?.[0] || null;

                return {
                  customer,
                  quotation,
                  vehicle,
                };
              });
            })
            .flat()
            .filter(result => {
              // Additional filtering by search query
              const customerName = `${result.customer?.name || ""}`.toLowerCase();
              const vehicleInfo = result.vehicle
                ? `${result.vehicle.vehicleMake || ""} ${result.vehicle.vehicleModel || ""} ${result.vehicle.registration || ""}`.toLowerCase()
                : "";
              const quotationNumber = result.quotation?.quotationNumber?.toLowerCase() || "";

              return customerName.includes(query) ||
                vehicleInfo.includes(query) ||
                quotationNumber.includes(query);
            });
        }

        // Filter out any invalid results
        const validResults = matchedResults.filter(
          result => result.customer && result.quotation
        );

        setSearchResults(validResults);
        setShowSearchResults(validResults.length > 0);
      } catch (error) {
        console.error("Error searching customers with approved quotations:", error);
        setSearchResults([]);
        setShowSearchResults(false);
      } finally {
        setSearching(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, open]);

  // Handle customer/vehicle/quotation selection
  const handleSelectCustomer = (
    customer: CustomerWithVehicles,
    quotation: Quotation,
    vehicle?: any
  ) => {
    if (!customer || !quotation) {
      console.error("Invalid customer or quotation provided");
      return;
    }

    setSelectedCustomer(customer);
    setSelectedVehicle(vehicle || (customer.vehicles && customer.vehicles.length > 0 ? customer.vehicles[0] : null));
    setSelectedQuotation(quotation);

    // Pre-fill form with data from approved quotation and customer/vehicle
    const vehicleToUse = vehicle ||
      customer.vehicles?.find(v => quotation.vehicleId && v.id.toString() === quotation.vehicleId) ||
      (customer.vehicles && customer.vehicles.length > 0 ? customer.vehicles[0] : null);

    // Get customer details from quotation or customer record
    const customerName = quotation.customer
      ? `${quotation.customer.firstName || ""} ${quotation.customer.lastName || ""}`.trim()
      : customer.name || "";

    const customerAddress = quotation.customer?.address || customer.address || "";
    const customerPhone = quotation.customer?.phone || customer.phone || "";

    // Get vehicle details from quotation or vehicle record
    const vehicleMake = quotation.vehicle?.make || vehicleToUse?.vehicleMake || "";
    const vehicleModel = quotation.vehicle?.model || vehicleToUse?.vehicleModel || "";
    const vehicleRegistration = quotation.vehicle?.registration || vehicleToUse?.registration || "";
    const vehicleVin = quotation.vehicle?.vin || vehicleToUse?.vin || "";

    // Pre-populate Part 2 items from quotation items
    const part2ItemsFromQuotation: JobCardPart2Item[] = (quotation.items && Array.isArray(quotation.items))
      ? quotation.items.map((item, index) => ({
        srNo: index + 1,
        partWarrantyTag: "",
        partName: item?.partName || "",
        partCode: item?.partNumber || "",
        qty: item?.quantity || 0,
        amount: item?.amount || 0,
        technician: "",
        labourCode: "Auto Select With Part",
        itemType: "part" as const,
      }))
      : [];

    setForm((prev) => ({
      ...prev,
      customerId: customer.id.toString(),
      customerName: customerName,
      fullName: customerName,
      mobilePrimary: customerPhone,
      customerType: customer.customerType || "",
      customerAddress: customerAddress,
      vehicleId: vehicleToUse?.id?.toString() || quotation.vehicleId || "",
      vehicleRegistration: vehicleRegistration,
      vehicleMake: vehicleMake,
      vehicleModel: vehicleModel,
      vehicleBrand: vehicleMake,
      vinChassisNumber: vehicleVin,
      variantBatteryCapacity: vehicleToUse?.variant || "",
      warrantyStatus: vehicleToUse?.warrantyStatus || "",
      // Pre-fill description from quotation notes
      description: quotation.notes || quotation.customNotes || prev.description,
      customerFeedback: quotation.customNotes || quotation.notes || "",
      // Pre-populate Part 2 items from quotation
      part2Items: part2ItemsFromQuotation.length > 0 ? part2ItemsFromQuotation : prev.part2Items,
      // Insurance details from quotation
      insuranceCompanyName: quotation.insurer?.name || "",
      batterySerialNumber: quotation.batterySerialNumber || "",
    }));

    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Handle create new customer/vehicle
  const handleCreateNew = () => {
    // Clear search and allow manual entry
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    // User can manually fill the form
    // Optionally, you could navigate to customer-find page:
    // router.push('/sc/customer-find');
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchResults]);

  // Auto-populate form when customer/vehicle data is available
  useEffect(() => {
    if (form.customerId && form.vehicleId && open) {
      const fetchAndPopulate = async () => {
        try {
          const customerData = await customerService.getById(form.customerId);
          if (customerData.vehicles) {
            const vehicleData = customerData.vehicles.find(
              (v) => v.id === form.vehicleId || v.id === form.vehicleId.toString()
            );
            if (vehicleData) {
              setForm((prev) => ({
                ...prev,
                fullName: prev.fullName || customerData.name,
                mobilePrimary: prev.mobilePrimary || customerData.phone,
                customerType: (prev.customerType || customerData.customerType || "") as "B2C" | "B2B" | "",
                vehicleBrand: prev.vehicleBrand || vehicleData.vehicleMake,
                vehicleModel: prev.vehicleModel || vehicleData.vehicleModel,
                vehicleRegistration: prev.vehicleRegistration || vehicleData.registration,
                vinChassisNumber: prev.vinChassisNumber || vehicleData.vin,
                customerAddress: prev.customerAddress || customerData.address || "",
              }));
            }
          }
        } catch (err) {
          console.warn("Could not auto-populate customer/vehicle data:", err);
        }
      };
      fetchAndPopulate();
    }
  }, [form.customerId, form.vehicleId, open]);

  const resetForm = () => {
    setForm({
      ...INITIAL_JOB_CARD_FORM,
      ...(initialValues ?? {}),
    });
    setEditingPart2Index(null);
    setNewPart2Item({
      partWarrantyTag: "",
      partName: "",
      partCode: "",
      qty: 1,
      amount: 0,
      technician: "",
      labourCode: "",
      itemType: "part",
      description: "",
    });
  };

  const togglePartSelection = (partName: string) => {
    setForm((prev) => ({
      ...prev,
      selectedParts: prev.selectedParts.includes(partName)
        ? prev.selectedParts.filter((part) => part !== partName)
        : [...prev.selectedParts, partName],
    }));
  };

  // PART 2 Item Management
  const [editingPart2Index, setEditingPart2Index] = useState<number | null>(null);
  const [newPart2Item, setNewPart2Item] = useState<Partial<JobCardPart2Item> & { description?: string }>({
    partWarrantyTag: "",
    partName: "",
    partCode: "",
    qty: 1,
    amount: 0,
    technician: "",
    labourCode: "",
    itemType: "part",
    description: "",
  });

  // Extract part code from description (alphanumeric prefix before dash/comma)
  const extractPartCode = (description: string): string => {
    const match = description.match(/^([A-Z0-9_]+)/i);
    return match ? match[1] : "";
  };

  // Extract part name from description (clean name after dash/comma)
  const extractPartName = (description: string): string => {
    // Remove part code prefix and clean up
    let cleaned = description.replace(/^[A-Z0-9_]+[-_]\s*/i, ""); // Remove code prefix
    cleaned = cleaned.split(/[-–—,]/)[0].trim(); // Take first part before dash/comma
    // Capitalize first letter of each word
    return cleaned
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Extract labour code from work item description
  const extractLabourCode = (description: string): string => {
    const labourMatch = description.match(/labour[:\s-]+(r\s*&\s*r|r\s+and\s+r|.+)/i);
    if (labourMatch) {
      return labourMatch[1].trim();
    }
    return "R & R"; // Default
  };

  const handleAddPart2Item = () => {
    if (!newPart2Item.partName || !newPart2Item.partCode) {
      onError?.("Please enter Part Name and Part Code.");
      return;
    }

    const item: JobCardPart2Item = {
      srNo: form.part2Items.length + 1,
      partWarrantyTag: newPart2Item.partWarrantyTag || "",
      partName: newPart2Item.partName,
      partCode: newPart2Item.partCode,
      qty: newPart2Item.qty || 1,
      amount: newPart2Item.amount || 0,
      technician: newPart2Item.technician || "",
      labourCode: newPart2Item.itemType === "work_item"
        ? (newPart2Item.labourCode || extractLabourCode(newPart2Item.partName))
        : "Auto Select With Part",
      itemType: newPart2Item.itemType || "part",
    };

    setForm((prev) => ({
      ...prev,
      part2Items: [...prev.part2Items, item],
    }));

    // Reset new item form
    setNewPart2Item({
      partWarrantyTag: "",
      partName: "",
      partCode: "",
      qty: 1,
      amount: 0,
      technician: "",
      labourCode: "",
      itemType: "part",
      description: "",
    });
  };

  const handleUpdatePart2Item = (index: number) => {
    const updatedItems = [...form.part2Items];
    updatedItems[index] = {
      ...updatedItems[index],
      ...newPart2Item,
      labourCode: newPart2Item.itemType === "work_item"
        ? (newPart2Item.labourCode || extractLabourCode(newPart2Item.partName || ""))
        : "Auto Select With Part",
    };

    setForm((prev) => ({
      ...prev,
      part2Items: generateSrNoForPart2Items(updatedItems),
    }));

    setEditingPart2Index(null);
    setNewPart2Item({
      partWarrantyTag: "",
      partName: "",
      partCode: "",
      qty: 1,
      amount: 0,
      technician: "",
      labourCode: "",
      itemType: "part",
      description: "",
    });
  };

  const handleDeletePart2Item = (index: number) => {
    const updatedItems = form.part2Items.filter((_, i) => i !== index);
    setForm((prev) => ({
      ...prev,
      part2Items: generateSrNoForPart2Items(updatedItems),
    }));
  };

  const handleEditPart2Item = (index: number) => {
    const item = form.part2Items[index];
    setNewPart2Item({
      partWarrantyTag: item.partWarrantyTag,
      partName: item.partName,
      partCode: item.partCode,
      qty: item.qty,
      amount: item.amount,
      technician: item.technician,
      labourCode: item.labourCode,
      itemType: item.itemType,
    });
    setEditingPart2Index(index);
  };

  const handlePart2DescriptionChange = (description: string) => {
    const partCode = extractPartCode(description);
    const partName = extractPartName(description);
    setNewPart2Item((prev) => ({
      ...prev,
      partCode: partCode || prev.partCode,
      partName: partName || prev.partName,
      description: description,
    }));
  };

  // Generate check-in slip data from form
  const handleGenerateCheckInSlip = () => {
    if (!selectedCustomer || !selectedVehicle) {
      onError?.("Please select a customer and vehicle first.");
      return;
    }

    try {
      const serviceCenterId = String(serviceCenterContext.serviceCenterId ?? "sc-001");
      const serviceCenterCode = SERVICE_CENTER_CODE_MAP[serviceCenterId] || "SC001";
      const slipNumber = generateCheckInSlipNumber(serviceCenterCode);

      const now = new Date();
      const checkInDate = now.toISOString().split("T")[0];
      const checkInTime = now.toTimeString().slice(0, 5);

      // Get service center details - use defaults if not available
      const serviceCenterName = serviceCenterContext.serviceCenterName || "Service Center";

      // For address, we'll use empty strings or defaults since service center context doesn't have address fields
      const serviceCenterAddress = "";
      const serviceCenterCity = "";
      const serviceCenterState = "";
      const serviceCenterPincode = "";

      const slipData: CheckInSlipData = {
        slipNumber,
        customerName: form.customerName || selectedCustomer.name || "",
        phone: form.mobilePrimary || selectedCustomer.phone || "",
        email: selectedCustomer.email,
        vehicleMake: form.vehicleMake || selectedVehicle.vehicleMake || "",
        vehicleModel: form.vehicleModel || selectedVehicle.vehicleModel || "",
        registrationNumber: form.vehicleRegistration || selectedVehicle.registration || "",
        vin: form.vinChassisNumber || selectedVehicle.vin || "",
        checkInDate,
        checkInTime,
        serviceCenterName,
        serviceCenterAddress,
        serviceCenterCity,
        serviceCenterState,
        serviceCenterPincode,
        serviceType: selectedQuotation?.items?.[0]?.partName || form.description || "General Service",
        notes: form.description || "",
      };

      setCheckInSlipData(slipData);
      setShowCheckInSlip(true);
    } catch (error) {
      console.error("Error generating check-in slip:", error);
      onError?.("Failed to generate check-in slip. Please try again.");
    }
  };

  const generateJobCardNumber = (serviceCenterCode: string = "SC001") => {
    const { migrateAllJobCards } = require("../../job-cards/utils/migrateJobCards.util");
    const storedCards = migrateAllJobCards();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const currentMonthCards = storedCards.filter((card) => {
      if (!card.jobCardNumber) return false;
      const parts = card.jobCardNumber.split("-");
      return (
        parts[0] === serviceCenterCode &&
        parts[1] === String(year) &&
        parts[2] === month
      );
    });
    const sequenceNumbers = currentMonthCards
      .map((card) => {
        const parts = card.jobCardNumber?.split("-");
        return parts && parts[3] ? parseInt(parts[3], 10) : 0;
      })
      .filter((num) => !isNaN(num));
    const nextSequence = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) + 1 : 1;
    return `${serviceCenterCode}-${year}-${month}-${String(nextSequence).padStart(4, "0")}`;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (!form.customerName || !form.description) {
      onError?.("Please fill in all required fields.");
      return;
    }

    // Validate that a customer with approved quotation is selected (only for create mode)
    if (mode === "create" && (!selectedCustomer || !selectedQuotation)) {
      onError?.("Please select a customer with an approved quotation.");
      return;
    }

    try {
      setCreating(true);
      const serviceCenterId = String(serviceCenterContext.serviceCenterId ?? "sc-001");
      const serviceCenterCode =
        SERVICE_CENTER_CODE_MAP[serviceCenterId] || "SC001";
      
      // In edit mode, find existing job card and preserve its data
      let existingJobCard: JobCard | null = null;
      if (mode === "edit" && jobCardId) {
        const { migrateAllJobCards } = require("../../job-cards/utils/migrateJobCards.util");
        const existingJobCards = migrateAllJobCards();
        existingJobCard = existingJobCards.find((jc) => jc.id === jobCardId) || null;
        if (!existingJobCard) {
          onError?.("Job card not found.");
          setCreating(false);
          return;
        }
      }
      
      const jobCardNumber = existingJobCard?.jobCardNumber || generateJobCardNumber(serviceCenterCode);

      // Try to fetch customer and vehicle data to populate PART 1
      let customerData = null;
      let vehicleData = null;

      if (form.customerId) {
        try {
          customerData = await customerService.getById(form.customerId);
          if (form.vehicleId && customerData.vehicles) {
            vehicleData = customerData.vehicles.find((v) => v.id === form.vehicleId || v.id === form.vehicleId.toString());
          }
        } catch (err) {
          console.warn("Could not fetch customer data:", err);
          // Use selected customer if available
          if (selectedCustomer) {
            customerData = selectedCustomer;
            if (selectedVehicle) {
              vehicleData = selectedVehicle;
            } else if (selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0) {
              vehicleData = selectedCustomer.vehicles[0];
            }
          }
        }
      } else if (selectedCustomer) {
        // Use selected customer if form.customerId is not set
        customerData = selectedCustomer;
        if (selectedVehicle) {
          vehicleData = selectedVehicle;
        } else if (selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0) {
          vehicleData = selectedCustomer.vehicles[0];
        }
      }

      // Populate PART 1 from customer/vehicle data or use form data
      const part1 = customerData && vehicleData
        ? populateJobCardPart1(
          customerData,
          vehicleData,
          jobCardNumber,
          {
            customerFeedback: form.customerFeedback || form.description,
            technicianObservation: form.technicianObservation,
            insuranceStartDate: form.insuranceStartDate,
            insuranceEndDate: form.insuranceEndDate,
            insuranceCompanyName: form.insuranceCompanyName,
            batterySerialNumber: form.batterySerialNumber,
            mcuSerialNumber: form.mcuSerialNumber,
            vcuSerialNumber: form.vcuSerialNumber,
            otherPartSerialNumber: form.otherPartSerialNumber,
            variantBatteryCapacity: form.variantBatteryCapacity,
            warrantyStatus: form.warrantyStatus,
            estimatedDeliveryDate: form.estimatedDeliveryDate,
          }
        )
        : createEmptyJobCardPart1(jobCardNumber);

      // Populate PART 1 from form fields
      part1.fullName = form.fullName || form.customerName;
      part1.mobilePrimary = form.mobilePrimary;
      part1.customerType = form.customerType as "B2C" | "B2B" | "";
      part1.vehicleBrand = form.vehicleBrand || form.vehicleMake;
      part1.vehicleModel = form.vehicleModel;
      part1.registrationNumber = form.vehicleRegistration;
      part1.vinChassisNumber = form.vinChassisNumber;
      part1.variantBatteryCapacity = form.variantBatteryCapacity;
      part1.warrantyStatus = form.warrantyStatus;
      part1.estimatedDeliveryDate = form.estimatedDeliveryDate;
      part1.customerAddress = form.customerAddress;
      part1.customerFeedback = form.customerFeedback || form.description;
      part1.technicianObservation = form.technicianObservation;
      part1.insuranceStartDate = form.insuranceStartDate;
      part1.insuranceEndDate = form.insuranceEndDate;
      part1.insuranceCompanyName = form.insuranceCompanyName;
      part1.batterySerialNumber = form.batterySerialNumber;
      part1.mcuSerialNumber = form.mcuSerialNumber;
      part1.vcuSerialNumber = form.vcuSerialNumber;
      part1.otherPartSerialNumber = form.otherPartSerialNumber;

      // Use PART 2 items from form (or convert selected parts if no PART 2 items)
      const part2 = form.part2Items.length > 0
        ? generateSrNoForPart2Items(form.part2Items)
        : [];

      // Create PART 2A from form data - ensure safe access to DocumentationFiles
      const videoEvidence = form.videoEvidence || INITIAL_DOCUMENTATION_FILES;
      const vinImage = form.vinImage || INITIAL_DOCUMENTATION_FILES;
      const odoImage = form.odoImage || INITIAL_DOCUMENTATION_FILES;
      const damageImages = form.damageImages || INITIAL_DOCUMENTATION_FILES;

      const part2A: JobCardPart2A = {
        videoEvidence: (videoEvidence.files?.length > 0 || videoEvidence.urls?.length > 0) ? "Yes" : "No",
        vinImage: (vinImage.files?.length > 0 || vinImage.urls?.length > 0) ? "Yes" : "No",
        odoImage: (odoImage.files?.length > 0 || odoImage.urls?.length > 0) ? "Yes" : "No",
        damageImages: (damageImages.files?.length > 0 || damageImages.urls?.length > 0) ? "Yes" : "No",
        issueDescription: form.issueDescription || "",
        numberOfObservations: form.numberOfObservations || "",
        symptom: form.symptom || "",
        defectPart: form.defectPart || "",
      };

      if (mode === "edit" && existingJobCard) {
        // Update existing job card
        const updatedJobCard: JobCard = {
          ...existingJobCard,
          // Preserve important fields
          id: existingJobCard.id,
          jobCardNumber: existingJobCard.jobCardNumber,
          sourceAppointmentId: existingJobCard.sourceAppointmentId,
          isTemporary: existingJobCard.isTemporary,
          customerArrivalTimestamp: existingJobCard.customerArrivalTimestamp,
          // Update fields from form
          customerId: form.customerId || existingJobCard.customerId,
          customerName: form.customerName || existingJobCard.customerName,
          vehicleId: form.vehicleId || existingJobCard.vehicleId,
          vehicle: `${form.vehicleMake} ${form.vehicleModel}`.trim() || form.vehicleModel || form.vehicleMake || existingJobCard.vehicle,
          registration: form.vehicleRegistration || existingJobCard.registration,
          vehicleMake: form.vehicleMake || existingJobCard.vehicleMake,
          vehicleModel: form.vehicleModel || existingJobCard.vehicleModel,
          customerType: (form.customerType as "B2C" | "B2B") || existingJobCard.customerType || "B2C",
          serviceType: form.description ? existingJobCard.serviceType : existingJobCard.serviceType,
          description: form.description || existingJobCard.description,
          // Preserve status (don't change from "Awaiting Quotation Approval" until quotation is approved)
          status: existingJobCard.status,
          priority: existingJobCard.priority,
          assignedEngineer: existingJobCard.assignedEngineer,
          estimatedCost: existingJobCard.estimatedCost,
          estimatedTime: existingJobCard.estimatedTime,
          createdAt: existingJobCard.createdAt,
          parts: form.selectedParts.length > 0 ? form.selectedParts : existingJobCard.parts,
          location: existingJobCard.location,
          quotationId: existingJobCard.quotationId,
          serviceCenterName: existingJobCard.serviceCenterName || serviceCenterContext.serviceCenterName || "Service Center",
          // Update additional fields from form
          customerWhatsappNumber: form.whatsappNumber !== undefined ? form.whatsappNumber : existingJobCard.customerWhatsappNumber,
          customerAlternateMobile: form.alternateMobile !== undefined ? form.alternateMobile : existingJobCard.customerAlternateMobile,
          customerEmail: form.email !== undefined ? form.email : existingJobCard.customerEmail,
          vehicleYear: form.vehicleYear !== undefined ? form.vehicleYear : existingJobCard.vehicleYear,
          motorNumber: form.motorNumber !== undefined ? form.motorNumber : existingJobCard.motorNumber,
          chargerSerialNumber: form.chargerSerialNumber !== undefined ? form.chargerSerialNumber : existingJobCard.chargerSerialNumber,
          dateOfPurchase: form.dateOfPurchase !== undefined ? form.dateOfPurchase : existingJobCard.dateOfPurchase,
          vehicleColor: form.vehicleColor !== undefined ? form.vehicleColor : existingJobCard.vehicleColor,
          previousServiceHistory: form.previousServiceHistory !== undefined ? form.previousServiceHistory : existingJobCard.previousServiceHistory,
          odometerReading: form.odometerReading !== undefined ? form.odometerReading : existingJobCard.odometerReading,
          pickupDropRequired: form.pickupDropRequired !== undefined ? form.pickupDropRequired : existingJobCard.pickupDropRequired,
          pickupAddress: form.pickupAddress !== undefined ? form.pickupAddress : existingJobCard.pickupAddress,
          pickupState: form.pickupState !== undefined ? form.pickupState : existingJobCard.pickupState,
          pickupCity: form.pickupCity !== undefined ? form.pickupCity : existingJobCard.pickupCity,
          pickupPincode: form.pickupPincode !== undefined ? form.pickupPincode : existingJobCard.pickupPincode,
          dropAddress: form.dropAddress !== undefined ? form.dropAddress : existingJobCard.dropAddress,
          dropState: form.dropState !== undefined ? form.dropState : existingJobCard.dropState,
          dropCity: form.dropCity !== undefined ? form.dropCity : existingJobCard.dropCity,
          dropPincode: form.dropPincode !== undefined ? form.dropPincode : existingJobCard.dropPincode,
          preferredCommunicationMode: form.preferredCommunicationMode !== undefined ? form.preferredCommunicationMode : existingJobCard.preferredCommunicationMode,
          arrivalMode: form.arrivalMode !== undefined ? form.arrivalMode : existingJobCard.arrivalMode,
          checkInNotes: form.checkInNotes !== undefined ? form.checkInNotes : existingJobCard.checkInNotes,
          checkInSlipNumber: form.checkInSlipNumber !== undefined ? form.checkInSlipNumber : existingJobCard.checkInSlipNumber,
          checkInDate: form.checkInDate !== undefined ? form.checkInDate : existingJobCard.checkInDate,
          checkInTime: form.checkInTime !== undefined ? form.checkInTime : existingJobCard.checkInTime,
          // Update structured data
          part1,
          part2,
          part2A,
        };

        const { migrateAllJobCards } = require("../../job-cards/utils/migrateJobCards.util");
        const existingJobCards = migrateAllJobCards();
        const updatedJobCards = existingJobCards.map((jc) =>
          jc.id === existingJobCard.id ? updatedJobCard : jc
        );
        safeStorage.setItem("jobCards", updatedJobCards);

        // If parts are selected, create a parts request for inventory manager
        if (form.selectedParts.length > 0) {
          const requestedBy = `${serviceCenterContext.serviceCenterName || "Service Center"} - ${serviceCenterContext.userRole || "SC Manager"}`;
          await createPartsRequestFromJobCard(updatedJobCard, requestedBy);
        }

        onUpdated?.(updatedJobCard);
        resetForm();
        onClose();
      } else {
        // Create new job card
        const newJobCard: JobCard = {
          id: `JC-${Date.now()}`,
          jobCardNumber,
          serviceCenterId,
          serviceCenterCode,
          customerId: form.customerId || `customer-${Date.now()}`,
          customerName: form.customerName,
          vehicleId: form.vehicleId,
          vehicle: `${form.vehicleMake} ${form.vehicleModel}`.trim() || form.vehicleModel || form.vehicleMake,
          registration: form.vehicleRegistration,
          vehicleMake: form.vehicleMake,
          vehicleModel: form.vehicleModel,
          customerType: customerData?.customerType || "B2C",
          serviceType: selectedQuotation?.items?.[0]?.partName || "General Service",
          description: form.description,
          status: "Created",
          priority: "Normal",
          assignedEngineer: null,
          estimatedCost: selectedQuotation?.totalAmount
            ? `₹${selectedQuotation.totalAmount.toLocaleString("en-IN")}`
            : "₹0",
          estimatedTime: "",
          createdAt: new Date().toISOString(),
          parts: form.selectedParts, // Legacy field for backward compatibility
          location: "Station",
          quotationId: selectedQuotation?.id, // Link to approved quotation
          serviceCenterName:
            serviceCenterContext.serviceCenterName || "Service Center",
          // Additional fields from form
          customerWhatsappNumber: form.whatsappNumber,
          customerAlternateMobile: form.alternateMobile,
          customerEmail: form.email,
          vehicleYear: form.vehicleYear,
          motorNumber: form.motorNumber,
          chargerSerialNumber: form.chargerSerialNumber,
          dateOfPurchase: form.dateOfPurchase,
          vehicleColor: form.vehicleColor,
          previousServiceHistory: form.previousServiceHistory,
          odometerReading: form.odometerReading,
          pickupDropRequired: form.pickupDropRequired,
          pickupAddress: form.pickupAddress,
          pickupState: form.pickupState,
          pickupCity: form.pickupCity,
          pickupPincode: form.pickupPincode,
          dropAddress: form.dropAddress,
          dropState: form.dropState,
          dropCity: form.dropCity,
          dropPincode: form.dropPincode,
          preferredCommunicationMode: form.preferredCommunicationMode,
          arrivalMode: form.arrivalMode,
          checkInNotes: form.checkInNotes,
          checkInSlipNumber: form.checkInSlipNumber,
          checkInDate: form.checkInDate,
          checkInTime: form.checkInTime,
          // NEW STRUCTURED DATA
          part1,
          part2,
          part2A,
        };

        const { migrateAllJobCards } = require("../../job-cards/utils/migrateJobCards.util");
        const existingJobCards = migrateAllJobCards();
        safeStorage.setItem("jobCards", [newJobCard, ...existingJobCards]);

        // If parts are selected, create a parts request for inventory manager
        if (form.selectedParts.length > 0) {
          const requestedBy = `${serviceCenterContext.serviceCenterName || "Service Center"} - ${serviceCenterContext.userRole || "SC Manager"}`;
          await createPartsRequestFromJobCard(newJobCard, requestedBy);
        }

        onCreated(newJobCard);
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error("Error creating job card:", error);
      onError?.("Failed to create job card. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {mode === "edit" ? "Edit Job Card" : "Create Job Card from Approved Quotation"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === "edit" 
                ? "Complete the job card details. All fields are pre-filled from the appointment."
                : "Search for customers with approved quotations. All details will be pre-filled from the quotation."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SEARCH CUSTOMER/VEHICLE - Only Approved Quotations (Only in create mode) */}
          {mode === "create" && (
          <div className="bg-green-50 rounded-xl p-4 border border-green-200 search-container">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-600" size={18} />
              <label className="block text-sm font-semibold text-gray-700">
                Search Customer with Approved Quotation
              </label>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Only customers who have approved quotations are available for job card creation.
              Search by customer name, vehicle registration, or quotation number.
            </p>
            {!hasApprovedQuotations && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <FileCheck className="text-amber-600 mt-0.5" size={16} />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-amber-800 mb-1">
                      No Approved Quotations Available
                    </p>
                    <p className="text-xs text-amber-700">
                      There are no approved quotations in the system. Job cards can only be created from quotations that have been approved by customers.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchResults(true);
                }}
                placeholder="Search by customer name, vehicle registration, or quotation number..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 size={18} className="animate-spin text-green-600" />
                </div>
              )}

              {/* Search Results Dropdown - Only Approved Quotations */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                  {searchResults
                    .filter(result => result.customer && result.quotation)
                    .map((result, index) => {
                      const customer = result.customer!;
                      const quotation = result.quotation!;
                      const vehicle = result.vehicle;
                      const uniqueKey = `${customer.id}-${quotation.id}-${vehicle?.id || 'no-vehicle'}`;

                      const customerName = quotation.customer
                        ? `${quotation.customer.firstName || ""} ${quotation.customer.lastName || ""}`.trim()
                        : customer.name || "";
                      const customerPhone = quotation.customer?.phone || customer.phone || "";

                      return (
                        <div key={uniqueKey} className="border-b border-gray-100 last:border-b-0">
                          <div
                            className="p-3 hover:bg-green-50 cursor-pointer transition"
                            onClick={() => handleSelectCustomer(customer, quotation, vehicle)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <UserPlus size={16} className="text-green-600" />
                                <span className="font-semibold text-gray-800">
                                  {customerName || "Unknown Customer"}
                                </span>
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                                  <CheckCircle size={12} />
                                  Approved
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                <FileCheck size={14} className="inline mr-1" />
                                {quotation.quotationNumber || "N/A"}
                              </div>
                            </div>

                            <div className="text-xs text-gray-600 ml-6 space-y-1">
                              {customerPhone && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Phone:</span>
                                  <span>{customerPhone}</span>
                                </div>
                              )}

                              {quotation.vehicle && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Car size={14} className="text-gray-400" />
                                  <span>
                                    <span className="font-medium">
                                      {quotation.vehicle.make || ""} {quotation.vehicle.model || ""}
                                    </span>
                                    {quotation.vehicle.registration && (
                                      <>
                                        {" - "}
                                        <span className="text-gray-500">{quotation.vehicle.registration}</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              )}

                              {quotation.items && quotation.items.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <div className="font-medium text-gray-700 mb-1">
                                    Quotation Items ({quotation.items.length}):
                                  </div>
                                  <div className="text-gray-600 space-y-0.5">
                                    {quotation.items.slice(0, 3).map((item, idx) => (
                                      <div key={idx} className="text-xs">
                                        • {item.partName || "Unknown Part"} (Qty: {item.quantity || 0}) - ₹{(item.amount || 0).toLocaleString("en-IN")}
                                      </div>
                                    ))}
                                    {quotation.items.length > 3 && (
                                      <div className="text-xs text-gray-500">+ {quotation.items.length - 3} more items</div>
                                    )}
                                  </div>
                                  <div className="mt-1 text-xs font-semibold text-green-700">
                                    Total: ₹{(quotation.totalAmount || 0).toLocaleString("en-IN")}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* No Results - Only Approved Quotations Available */}
              {showSearchResults && searchQuery.trim() && !searching && searchResults.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                  <div className="text-center">
                    <FileCheck className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-sm font-medium text-gray-700 mb-1">No approved quotations found</p>
                    <p className="text-xs text-gray-500 mb-3">
                      Only customers with approved quotations can create job cards.
                    </p>
                    <p className="text-xs text-gray-500">
                      Search by customer name, vehicle registration, or quotation number.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Make sure the quotation has been approved by the customer first.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Selected Customer/Vehicle/Quotation Info */}
            {selectedCustomer && selectedQuotation && (
              <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="text-green-600" size={18} />
                      <p className="text-sm font-semibold text-green-800">
                        Selected: {selectedCustomer.name}
                      </p>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Approved Quotation
                      </span>
                    </div>

                    {selectedVehicle && (
                      <p className="text-xs text-green-700 mb-1">
                        <Car size={12} className="inline mr-1" />
                        Vehicle: {selectedVehicle.vehicleMake} {selectedVehicle.vehicleModel} - {selectedVehicle.registration}
                      </p>
                    )}

                    <div className="mt-2 pt-2 border-t border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <FileCheck size={14} className="text-green-600" />
                        <span className="text-xs font-medium text-green-800">
                          Quotation: {selectedQuotation.quotationNumber}
                        </span>
                      </div>
                      {selectedQuotation.items && selectedQuotation.items.length > 0 && (
                        <p className="text-xs text-green-700">
                          {selectedQuotation.items.length} item(s) • Total: ₹{selectedQuotation.totalAmount.toLocaleString("en-IN")}
                        </p>
                      )}
                      {selectedQuotation.customerApprovedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Approved on: {new Date(selectedQuotation.customerApprovedAt).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setSelectedVehicle(null);
                      setSelectedQuotation(null);
                      setForm((prev) => ({
                        ...prev,
                        customerId: "",
                        customerName: "",
                        fullName: "",
                        vehicleId: "",
                        vehicleRegistration: "",
                        part2Items: [],
                      }));
                    }}
                    className="text-green-600 hover:text-green-800 ml-2"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
          )}

          {/* PART 1: CUSTOMER & VEHICLE INFORMATION */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                Customer & Vehicle Information
              </h3>
              {/* Job Card Number (will be auto-generated) */}
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold text-sm border border-blue-200">
                Job Card: {previewJobCardNumber || "Generating..."}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT SIDE */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Customer & Vehicle Details</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.fullName || form.customerName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value, customerName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                    placeholder="Enter customer full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number (Primary) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.mobilePrimary}
                    onChange={(e) => setForm({ ...form, mobilePrimary: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={form.whatsappNumber || ""}
                    onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternate Mobile
                  </label>
                  <input
                    type="tel"
                    value={form.alternateMobile || ""}
                    onChange={(e) => setForm({ ...form, alternateMobile: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email || ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="customer@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Type
                  </label>
                  <select
                    value={form.customerType}
                    onChange={(e) => setForm({ ...form, customerType: e.target.value as "B2C" | "B2B" | "" })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Type</option>
                    <option value="B2C">B2C</option>
                    <option value="B2B">B2B</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.vehicleBrand || form.vehicleMake}
                    onChange={(e) => setForm({ ...form, vehicleBrand: e.target.value, vehicleMake: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                    placeholder="Honda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.vehicleModel}
                    onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.vehicleRegistration}
                    onChange={(e) => setForm({ ...form, vehicleRegistration: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                    placeholder="PB10AB1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VIN / Chassis Number
                  </label>
                  <input
                    type="text"
                    value={form.vinChassisNumber}
                    onChange={(e) => setForm({ ...form, vinChassisNumber: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="MH12AB3456CD7890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variant / Battery Capacity
                  </label>
                  <input
                    type="text"
                    value={form.variantBatteryCapacity}
                    onChange={(e) => setForm({ ...form, variantBatteryCapacity: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g., 50kWh"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Year
                  </label>
                  <input
                    type="number"
                    value={form.vehicleYear || ""}
                    onChange={(e) => setForm({ ...form, vehicleYear: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="2023"
                    min="1900"
                    max="2100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motor Number
                  </label>
                  <input
                    type="text"
                    value={form.motorNumber || ""}
                    onChange={(e) => setForm({ ...form, motorNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Motor serial number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Charger Serial Number
                  </label>
                  <input
                    type="text"
                    value={form.chargerSerialNumber || ""}
                    onChange={(e) => setForm({ ...form, chargerSerialNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Charger serial number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Purchase
                  </label>
                  <input
                    type="date"
                    value={form.dateOfPurchase || ""}
                    onChange={(e) => setForm({ ...form, dateOfPurchase: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Color
                  </label>
                  <input
                    type="text"
                    value={form.vehicleColor || ""}
                    onChange={(e) => setForm({ ...form, vehicleColor: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g., Red, Blue, Black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warranty Status
                  </label>
                  <input
                    type="text"
                    value={form.warrantyStatus}
                    onChange={(e) => setForm({ ...form, warrantyStatus: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g., Active, Expired"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    value={form.estimatedDeliveryDate}
                    onChange={(e) => setForm({ ...form, estimatedDeliveryDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Address & Additional Information</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Address
                  </label>
                  <textarea
                    value={form.customerAddress}
                    onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    rows={3}
                    placeholder="Enter complete customer address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Feedback / Concerns <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.customerFeedback || form.description}
                    onChange={(e) => setForm({ ...form, customerFeedback: e.target.value, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    rows={4}
                    required
                    placeholder="Describe customer concerns or feedback..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Previous Service History
                  </label>
                  <textarea
                    value={form.previousServiceHistory || ""}
                    onChange={(e) => setForm({ ...form, previousServiceHistory: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    rows={3}
                    placeholder="Previous service history and repairs..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Odometer Reading
                  </label>
                  <input
                    type="text"
                    value={form.odometerReading || ""}
                    onChange={(e) => setForm({ ...form, odometerReading: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g., 15000 km"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Communication Mode
                  </label>
                  <select
                    value={form.preferredCommunicationMode || ""}
                    onChange={(e) => setForm({ ...form, preferredCommunicationMode: e.target.value as "Phone" | "Email" | "SMS" | "WhatsApp" | undefined })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Mode</option>
                    <option value="Phone">Phone</option>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technician Observation
                  </label>
                  <textarea
                    value={form.technicianObservation}
                    onChange={(e) => setForm({ ...form, technicianObservation: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    rows={3}
                    placeholder="Technician observations and notes..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insurance Start Date
                    </label>
                    <input
                      type="date"
                      value={form.insuranceStartDate}
                      onChange={(e) => setForm({ ...form, insuranceStartDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insurance End Date
                    </label>
                    <input
                      type="date"
                      value={form.insuranceEndDate}
                      onChange={(e) => setForm({ ...form, insuranceEndDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Company Name
                  </label>
                  <input
                    type="text"
                    value={form.insuranceCompanyName}
                    onChange={(e) => setForm({ ...form, insuranceCompanyName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Insurance company name"
                  />
                </div>

                {/* MANDATORY SERIAL DATA */}
                <div className="border-t pt-4 mt-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Serial Numbers (if applicable)</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Battery Serial Number
                      </label>
                      <input
                        type="text"
                        value={form.batterySerialNumber}
                        onChange={(e) => setForm({ ...form, batterySerialNumber: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="BAT-XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        MCU Serial Number
                      </label>
                      <input
                        type="text"
                        value={form.mcuSerialNumber}
                        onChange={(e) => setForm({ ...form, mcuSerialNumber: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="MCU-XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        VCU Serial Number
                      </label>
                      <input
                        type="text"
                        value={form.vcuSerialNumber}
                        onChange={(e) => setForm({ ...form, vcuSerialNumber: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="VCU-XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Other Part Serial Number
                      </label>
                      <input
                        type="text"
                        value={form.otherPartSerialNumber}
                        onChange={(e) => setForm({ ...form, otherPartSerialNumber: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="PART-XXX"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PART 2: PARTS & WORK ITEMS LIST */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              Parts & Work Items List
            </h3>

            {/* Add New Item Form */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-300">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                {editingPart2Index !== null ? "Edit Item" : "Add New Item"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Item Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPart2Item.description || `${newPart2Item.partCode || ""} - ${newPart2Item.partName || ""}`}
                    onChange={(e) => {
                      handlePart2DescriptionChange(e.target.value);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g., 2W0000000027_011 - Front Fender"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Part Warranty Tag
                  </label>
                  <input
                    type="text"
                    value={newPart2Item.partWarrantyTag || ""}
                    onChange={(e) => setNewPart2Item({ ...newPart2Item, partWarrantyTag: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g., RQL251113259818"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Item Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newPart2Item.itemType || "part"}
                    onChange={(e) => {
                      const itemType = e.target.value as "part" | "work_item";
                      setNewPart2Item({
                        ...newPart2Item,
                        itemType,
                        labourCode: itemType === "part" ? "Auto Select With Part" : newPart2Item.labourCode || "",
                      });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="part">Part</option>
                    <option value="work_item">Work Item</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Part Code
                  </label>
                  <input
                    type="text"
                    value={newPart2Item.partCode || ""}
                    onChange={(e) => setNewPart2Item({ ...newPart2Item, partCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g., 2W0000000027_011"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Part Name
                  </label>
                  <input
                    type="text"
                    value={newPart2Item.partName || ""}
                    onChange={(e) => setNewPart2Item({ ...newPart2Item, partName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g., Front Fender"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    QTY <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newPart2Item.qty || 1}
                    onChange={(e) => setNewPart2Item({ ...newPart2Item, qty: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPart2Item.amount || 0}
                    onChange={(e) => setNewPart2Item({ ...newPart2Item, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Technician
                  </label>
                  <input
                    type="text"
                    value={newPart2Item.technician || ""}
                    onChange={(e) => setNewPart2Item({ ...newPart2Item, technician: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Technician name"
                  />
                </div>
                {newPart2Item.itemType === "work_item" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Labour Code
                    </label>
                    <input
                      type="text"
                      value={newPart2Item.labourCode || ""}
                      onChange={(e) => setNewPart2Item({ ...newPart2Item, labourCode: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g., R & R"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                {editingPart2Index !== null ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdatePart2Item(editingPart2Index)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                    >
                      Update Item
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPart2Index(null);
                        setNewPart2Item({
                          partWarrantyTag: "",
                          partName: "",
                          partCode: "",
                          qty: 1,
                          amount: 0,
                          technician: "",
                          labourCode: "",
                          itemType: "part",
                        });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddPart2Item}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition inline-flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Item
                  </button>
                )}
              </div>
            </div>

            {/* PART 2 Items Table */}
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
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.part2Items.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-3 py-8 text-center text-gray-500">
                          No items added yet. Add items using the form above.
                        </td>
                      </tr>
                    ) : (
                      form.part2Items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-700 font-medium">{item.srNo}</td>
                          <td className="px-3 py-2 text-gray-700">{item.partWarrantyTag || "-"}</td>
                          <td className="px-3 py-2 text-gray-700">{item.partName}</td>
                          <td className="px-3 py-2 text-gray-700 font-mono text-xs">{item.partCode}</td>
                          <td className="px-3 py-2 text-gray-700">{item.qty}</td>
                          <td className="px-3 py-2 text-gray-700">₹{item.amount.toLocaleString("en-IN")}</td>
                          <td className="px-3 py-2 text-gray-700">{item.technician || "-"}</td>
                          <td className="px-3 py-2 text-gray-700">
                            <span className={`px-2 py-1 rounded text-xs ${item.itemType === "work_item"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                              }`}>
                              {item.labourCode}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.itemType === "part"
                                ? "bg-green-100 text-green-700"
                                : "bg-purple-100 text-purple-700"
                              }`}>
                              {item.itemType === "part" ? "Part" : "Work Item"}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditPart2Item(index)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePart2Item(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* PART 2A - Warranty/Insurance Case Details with Video/Photos Upload */}
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2A</span>
              Warranty/Insurance Case Details
            </h3>

            {/* Video/Photos Upload Section - Grid Layout */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Evidence Upload</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Video Evidence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Evidence
                  </label>
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setForm({
                          ...form,
                          videoEvidence: {
                            files: [...form.videoEvidence.files, ...files],
                            urls: form.videoEvidence.urls,
                          },
                        });
                      }}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-amber-500 transition bg-white">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <Video className="text-amber-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Upload Video</p>
                          <p className="text-xs text-gray-500">MP4, AVI, MOV</p>
                        </div>
                        {form.videoEvidence.files.length > 0 && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                            {form.videoEvidence.files.length} file(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                </div>

                {/* VIN Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VIN Image
                  </label>
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setForm({
                          ...form,
                          vinImage: {
                            files: [...form.vinImage.files, ...files],
                            urls: form.vinImage.urls,
                          },
                        });
                      }}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-amber-500 transition bg-white">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <ImageIcon className="text-amber-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Upload VIN Image</p>
                          <p className="text-xs text-gray-500">JPG, PNG, HEIC</p>
                        </div>
                        {form.vinImage.files.length > 0 && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                            {form.vinImage.files.length} file(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                </div>

                {/* ODO Meter Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ODO Meter Image
                  </label>
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setForm({
                          ...form,
                          odoImage: {
                            files: [...form.odoImage.files, ...files],
                            urls: form.odoImage.urls,
                          },
                        });
                      }}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-amber-500 transition bg-white">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <ImageIcon className="text-amber-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Upload ODO Image</p>
                          <p className="text-xs text-gray-500">JPG, PNG, HEIC</p>
                        </div>
                        {form.odoImage.files.length > 0 && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                            {form.odoImage.files.length} file(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Damage Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images of Damaged Parts
                  </label>
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setForm({
                          ...form,
                          damageImages: {
                            files: [...form.damageImages.files, ...files],
                            urls: form.damageImages.urls,
                          },
                        });
                      }}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-amber-500 transition bg-white">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <ImageIcon className="text-amber-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Upload Damage Images</p>
                          <p className="text-xs text-gray-500">JPG, PNG, HEIC</p>
                        </div>
                        {form.damageImages.files.length > 0 && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                            {form.damageImages.files.length} file(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Text Fields Section */}
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Case Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Description
                  </label>
                  <textarea
                    value={form.issueDescription}
                    onChange={(e) => setForm({ ...form, issueDescription: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    rows={3}
                    placeholder="Describe the issue in detail"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Observations
                  </label>
                  <input
                    type="text"
                    value={form.numberOfObservations}
                    onChange={(e) => setForm({ ...form, numberOfObservations: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g., 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Defect Part
                  </label>
                  <input
                    type="text"
                    value={form.defectPart}
                    onChange={(e) => setForm({ ...form, defectPart: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g., Battery, Motor, Charger"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symptom
                  </label>
                  <textarea
                    value={form.symptom}
                    onChange={(e) => setForm({ ...form, symptom: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    rows={3}
                    placeholder="Describe the symptoms observed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Operational & Check-in Details */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
              Operational & Check-in Details
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Pickup/Drop Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Pickup & Drop Service</h4>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pickupDropRequired"
                    checked={form.pickupDropRequired || false}
                    onChange={(e) => setForm({ ...form, pickupDropRequired: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="pickupDropRequired" className="text-sm font-medium text-gray-700">
                    Pickup/Drop Service Required
                  </label>
                </div>

                {form.pickupDropRequired && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pickup Address
                      </label>
                      <textarea
                        value={form.pickupAddress || ""}
                        onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        rows={2}
                        placeholder="Enter pickup address"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Pickup State</label>
                        <input
                          type="text"
                          value={form.pickupState || ""}
                          onChange={(e) => setForm({ ...form, pickupState: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Pickup City</label>
                        <input
                          type="text"
                          value={form.pickupCity || ""}
                          onChange={(e) => setForm({ ...form, pickupCity: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Pickup Pincode</label>
                        <input
                          type="text"
                          value={form.pickupPincode || ""}
                          onChange={(e) => setForm({ ...form, pickupPincode: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="Pincode"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Drop Address
                      </label>
                      <textarea
                        value={form.dropAddress || ""}
                        onChange={(e) => setForm({ ...form, dropAddress: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        rows={2}
                        placeholder="Enter drop address"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Drop State</label>
                        <input
                          type="text"
                          value={form.dropState || ""}
                          onChange={(e) => setForm({ ...form, dropState: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Drop City</label>
                        <input
                          type="text"
                          value={form.dropCity || ""}
                          onChange={(e) => setForm({ ...form, dropCity: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Drop Pincode</label>
                        <input
                          type="text"
                          value={form.dropPincode || ""}
                          onChange={(e) => setForm({ ...form, dropPincode: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="Pincode"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right Side - Check-in Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Check-in Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Mode
                  </label>
                  <select
                    value={form.arrivalMode || ""}
                    onChange={(e) => setForm({ ...form, arrivalMode: e.target.value as "vehicle_present" | "vehicle_absent" | "check_in_only" | undefined })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Mode</option>
                    <option value="vehicle_present">Vehicle Present</option>
                    <option value="vehicle_absent">Vehicle Absent</option>
                    <option value="check_in_only">Check-in Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Notes
                  </label>
                  <textarea
                    value={form.checkInNotes || ""}
                    onChange={(e) => setForm({ ...form, checkInNotes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    rows={3}
                    placeholder="Additional check-in notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Slip Number
                  </label>
                  <input
                    type="text"
                    value={form.checkInSlipNumber || ""}
                    onChange={(e) => setForm({ ...form, checkInSlipNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Check-in slip number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={form.checkInDate || ""}
                      onChange={(e) => setForm({ ...form, checkInDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Time
                    </label>
                    <input
                      type="time"
                      value={form.checkInTime || ""}
                      onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerateCheckInSlip}
              disabled={creating || !selectedCustomer || !selectedVehicle}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 inline-flex items-center gap-2 shadow-md"
            >
              <Receipt size={16} />
              Generate Check-in Slip
            </button>
            <button
              type="submit"
              disabled={creating}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 inline-flex items-center gap-2 shadow-md"
            >
              {creating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  Create Job Card
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Check-in Slip Modal */}
      {showCheckInSlip && checkInSlipData && (
        <CheckInSlip
          data={checkInSlipData}
          onClose={() => {
            setShowCheckInSlip(false);
            setCheckInSlipData(null);
          }}
        />
      )}
    </div>
  );
}

