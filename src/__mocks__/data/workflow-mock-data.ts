/**
 * Dynamic Mock Data for Complete Workflow
 * This file initializes interconnected mock data for the entire service flow:
 * Appointments → Quotations → Job Cards → Pickup/Drop Charges
 * 
 * All data is dynamically generated with current dates and interconnected IDs
 */

import { mockCustomers } from "./customers.mock";
import type { JobCard } from "@/shared/types/job-card.types";
import type { Quotation } from "@/shared/types/quotation.types";
import { populateJobCardPart1 } from "@/shared/utils/jobCardData.util";

const [rajesh, priya] = mockCustomers;
const rajeshVehicle = rajesh.vehicles[0];
const priyaVehicle = priya.vehicles[0];

// Helper to generate dynamic dates
const getDate = (daysOffset: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split("T")[0];
};

const getDateTime = (daysOffset: number = 0, hoursOffset: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(date.getHours() + hoursOffset);
  return date.toISOString();
};

// Generate dynamic job card number
const generateJobCardNumber = (serviceCenterCode: string, sequence: number): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${serviceCenterCode}-${year}-${month}-${String(sequence).padStart(4, "0")}`;
};

// Generate dynamic quotation number
const generateQuotationNumber = (serviceCenterCode: string, sequence: number): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `QT-${serviceCenterCode}-${year}${month}-${String(sequence).padStart(4, "0")}`;
};

/**
 * MOCK APPOINTMENT 1: With Pickup/Drop Service
 * Status: In Progress (Customer Arrived)
 */
export const mockAppointment1 = {
  id: 1001,
  customerName: rajesh.name,
  vehicle: `${rajeshVehicle.vehicleMake} ${rajeshVehicle.vehicleModel} (${rajeshVehicle.vehicleYear})`,
  phone: rajesh.phone,
  serviceType: "Routine Maintenance",
  date: getDate(0), // Today
  time: "10:00 AM",
  duration: "2 hours",
  status: "In Progress", // Customer has arrived
  customerExternalId: rajesh.externalId,
  vehicleExternalId: rajeshVehicle.externalId,
  serviceCenterId: "sc-001",
  serviceCenterName: "Pune Central Hub",
  customerType: "B2C",
  customerComplaintIssue: "Vehicle making unusual noise. Need oil change and general inspection.",
  previousServiceHistory: "Last service done 3 months ago. Regular maintenance customer.",
  estimatedServiceTime: "2 hours",
  estimatedCost: "₹3,500",
  odometerReading: "45,000 km",
  estimatedDeliveryDate: getDate(1), // Tomorrow
  assignedServiceAdvisor: "Service Advisor 1",
  pickupDropRequired: true, // ✅ Pickup/Drop service selected
  pickupAddress: "123 Main St, Pune, Maharashtra 411001",
  dropAddress: "123 Main St, Pune, Maharashtra 411001",
  preferredCommunicationMode: "WhatsApp",
  paymentMethod: "UPI",
  gstRequirement: false,
};

/**
 * MOCK APPOINTMENT 2: Without Pickup/Drop Service (Customer comes with vehicle)
 * Status: In Progress (Customer Arrived)
 */
export const mockAppointment2 = {
  id: 1002,
  customerName: priya.name,
  vehicle: `${priyaVehicle.vehicleMake} ${priyaVehicle.vehicleModel} (${priyaVehicle.vehicleYear})`,
  phone: priya.phone,
  serviceType: "AC Repair",
  date: getDate(0), // Today
  time: "2:00 PM",
  duration: "3 hours",
  status: "In Progress", // Customer has arrived
  customerExternalId: priya.externalId,
  vehicleExternalId: priyaVehicle.externalId,
  serviceCenterId: "sc-001",
  serviceCenterName: "Pune Central Hub",
  customerType: "B2C",
  customerComplaintIssue: "AC not cooling properly. Need AC gas refill and cleaning.",
  previousServiceHistory: "First time service at this center.",
  estimatedServiceTime: "3 hours",
  estimatedCost: "₹2,800",
  odometerReading: "32,000 km",
  estimatedDeliveryDate: getDate(1), // Tomorrow
  assignedServiceAdvisor: "Service Advisor 1",
  pickupDropRequired: false, // ❌ No pickup/drop - customer comes with vehicle
  preferredCommunicationMode: "Phone",
  paymentMethod: "Cash",
  gstRequirement: false,
};

/**
 * MOCK QUOTATION 1: Created from Appointment 1 (with pickup/drop)
 * Status: sent_to_customer (awaiting approval)
 */
export const mockQuotation1: Quotation = {
  id: "qtn-1001",
  quotationNumber: generateQuotationNumber("SC001", 1001),
  serviceCenterId: "sc-001",
  customerId: rajesh.externalId || "cust-001",
  vehicleId: rajeshVehicle.externalId || "veh-001",
  serviceAdvisorId: "user-001",
  documentType: "Quotation",
  quotationDate: getDate(0),
  validUntil: getDate(30), // 30 days from now
  hasInsurance: false,
  subtotal: 3500,
  discount: 0,
  discountPercent: 0,
  preGstAmount: 3500,
  cgstAmount: 315,
  sgstAmount: 315,
  igstAmount: 0,
  totalAmount: 4130,
  notes: "Regular service - oil change, filter replacement. Includes pickup and drop service charges.",
  batterySerialNumber: "",
  customNotes: "Customer requested pickup/drop service. Vehicle will be picked up from customer address.",
  noteTemplateId: "",
  status: "sent_to_customer",
  passedToManager: false,
  sentToCustomer: true,
  sentToCustomerAt: getDateTime(-1, -2), // 1 day, 2 hours ago
  createdAt: getDateTime(-1, -3),
  updatedAt: getDateTime(-1, -2),
  items: [
    {
      id: "item-1001-1",
      serialNumber: 1,
      partName: "Engine Oil 5W-30",
      partNumber: "MCU-EO-001",
      hsnSacCode: "2710",
      quantity: 2,
      rate: 1500,
      gstPercent: 18,
      amount: 3000,
    },
    {
      id: "item-1001-2",
      serialNumber: 2,
      partName: "Oil Filter",
      partNumber: "MCU-OF-002",
      hsnSacCode: "8708",
      quantity: 1,
      rate: 500,
      gstPercent: 18,
      amount: 500,
    },
  ],
  customer: {
    id: String(rajesh.externalId || rajesh.id),
    firstName: "Rajesh",
    lastName: "Kumar",
    phone: rajesh.phone,
    email: rajesh.email,
    address: rajesh.address,
    city: "Pune",
    state: "Maharashtra",
    pincode: rajesh.pincode,
  },
  vehicle: {
    id: String(rajeshVehicle.externalId || rajeshVehicle.id),
    make: rajeshVehicle.vehicleMake,
    model: rajeshVehicle.vehicleModel,
    registration: rajeshVehicle.registration,
    vin: rajeshVehicle.vin,
  },
  vehicleLocation: "with_customer", // Vehicle with customer (pickup/drop service)
};

/**
 * MOCK QUOTATION 2: Created from Appointment 2 (customer comes with vehicle)
 * Status: customer_approved (approved, job card will be created)
 */
export const mockQuotation2: Quotation = {
  id: "qtn-1002",
  quotationNumber: generateQuotationNumber("SC001", 1002),
  serviceCenterId: "sc-001",
  customerId: priya.externalId || "cust-002",
  vehicleId: priyaVehicle.externalId || "veh-003",
  serviceAdvisorId: "user-001",
  documentType: "Quotation",
  quotationDate: getDate(-1), // Yesterday
  validUntil: getDate(29), // 29 days from now
  hasInsurance: false,
  subtotal: 2800,
  discount: 0,
  discountPercent: 0,
  preGstAmount: 2800,
  cgstAmount: 252,
  sgstAmount: 252,
  igstAmount: 0,
  totalAmount: 3304,
  notes: "AC gas refill and cleaning service.",
  batterySerialNumber: "",
  customNotes: "Customer came with vehicle. AC not cooling properly.",
  noteTemplateId: "",
  status: "customer_approved",
  passedToManager: false,
  sentToCustomer: true,
  sentToCustomerAt: getDateTime(-1, -4),
  customerApproved: true,
  customerApprovedAt: getDateTime(0, -1), // 1 hour ago
  createdAt: getDateTime(-1, -4),
  updatedAt: getDateTime(0, -1),
  items: [
    {
      id: "item-1002-1",
      serialNumber: 1,
      partName: "AC Gas R134a",
      partNumber: "MCU-AC-004",
      hsnSacCode: "2710",
      quantity: 1,
      rate: 1800,
      gstPercent: 18,
      amount: 1800,
    },
    {
      id: "item-1002-2",
      serialNumber: 2,
      partName: "AC Cleaning Service",
      partNumber: "",
      hsnSacCode: "998314",
      quantity: 1,
      rate: 1000,
      gstPercent: 18,
      amount: 1000,
    },
  ],
  customer: {
    id: String(priya.externalId || priya.id),
    firstName: "Priya",
    lastName: "Sharma",
    phone: priya.phone,
    email: priya.email,
    address: priya.address,
    city: "Mumbai",
    state: "Maharashtra",
    pincode: priya.pincode,
  },
  vehicle: {
    id: String(priyaVehicle.externalId || priyaVehicle.id),
    make: priyaVehicle.vehicleMake,
    model: priyaVehicle.vehicleModel,
    registration: priyaVehicle.registration,
    vin: priyaVehicle.vin,
  },
  vehicleLocation: "at_workshop", // Vehicle at workshop (customer came with it)
};

/**
 * MOCK JOB CARD 1: Created from Approved Quotation 2
 * Status: Created (sent to manager for technician assignment)
 */
const jobCard1Part1 = populateJobCardPart1(
  priya,
  priyaVehicle,
  generateJobCardNumber("SC001", 1001),
  {
    customerFeedback: mockAppointment2.customerComplaintIssue,
    estimatedDeliveryDate: mockAppointment2.estimatedDeliveryDate,
    warrantyStatus: "Under Warranty",
  }
);

export const mockJobCard1: JobCard = {
  id: "JC-WF-1001",
  jobCardNumber: generateJobCardNumber("SC001", 1001),
  serviceCenterId: "sc-001",
  serviceCenterCode: "SC001",
  serviceCenterName: "Pune Central Hub",
  customerId: priya.externalId || "cust-002",
  customerName: priya.name,
  vehicleId: priyaVehicle.externalId || "veh-003",
  vehicle: `${priyaVehicle.vehicleMake} ${priyaVehicle.vehicleModel}`,
  registration: priyaVehicle.registration,
  vehicleMake: priyaVehicle.vehicleMake,
  vehicleModel: priyaVehicle.vehicleModel,
  customerType: "B2C",
  serviceType: mockAppointment2.serviceType,
  description: mockAppointment2.customerComplaintIssue || "",
  status: "Created",
  priority: "Normal",
  assignedEngineer: null, // Not assigned yet - sent to manager
  estimatedCost: `₹${mockQuotation2.totalAmount.toLocaleString("en-IN")}`,
  estimatedTime: mockAppointment2.estimatedServiceTime || "3 hours",
  createdAt: getDateTime(0, -1), // 1 hour ago (after quotation approval)
  parts: mockQuotation2.items.map((item) => item.partName),
  location: "Station",
  quotationId: mockQuotation2.id,
  sourceAppointmentId: mockAppointment2.id,
  submittedToManager: true, // ✅ Sent to manager
  submittedAt: getDateTime(0, -1),
  // Structured data
  part1: jobCard1Part1,
  part2: mockQuotation2.items.map((item, index) => ({
    srNo: index + 1,
    partWarrantyTag: "",
    partName: item.partName,
    partCode: item.partNumber || "",
    qty: item.quantity,
    amount: item.amount,
    technician: "",
    labourCode: item.partNumber ? "" : "LAB-AC-001",
    itemType: item.partNumber ? "part" : "work_item",
  })),
};

/**
 * MOCK PICKUP/DROP CHARGES 1: For Appointment 1
 */
export const mockPickupDropCharges1 = {
  id: "PDC-1001",
  appointmentId: mockAppointment1.id,
  customerName: mockAppointment1.customerName,
  phone: mockAppointment1.phone,
  pickupAddress: mockAppointment1.pickupAddress,
  dropAddress: mockAppointment1.dropAddress,
  amount: 500, // Pickup/drop service charge
  status: "pending", // Sent to customer, awaiting confirmation
  createdAt: getDateTime(0, -2), // 2 hours ago (when customer arrived)
  sentToCustomer: true,
  sentAt: getDateTime(0, -2),
};

/**
 * Initialize all mock data in localStorage
 * This function should be called on app initialization
 */
export const initializeWorkflowMockData = () => {
  if (typeof window === "undefined") return;

  // Initialize Appointments
  const existingAppointments = JSON.parse(
    localStorage.getItem("appointments") || "[]"
  );
  const appointmentIds = new Set(existingAppointments.map((apt: any) => apt.id));
  
  if (!appointmentIds.has(mockAppointment1.id)) {
    existingAppointments.push(mockAppointment1);
  }
  if (!appointmentIds.has(mockAppointment2.id)) {
    existingAppointments.push(mockAppointment2);
  }
  localStorage.setItem("appointments", JSON.stringify(existingAppointments));

  // Initialize Quotations
  const existingQuotations = JSON.parse(
    localStorage.getItem("quotations") || "[]"
  );
  const quotationIds = new Set(existingQuotations.map((qtn: any) => qtn.id));
  
  if (!quotationIds.has(mockQuotation1.id)) {
    existingQuotations.push(mockQuotation1);
  }
  if (!quotationIds.has(mockQuotation2.id)) {
    existingQuotations.push(mockQuotation2);
  }
  localStorage.setItem("quotations", JSON.stringify(existingQuotations));

  // Initialize Job Cards (only for approved quotations)
  const existingJobCards = JSON.parse(
    localStorage.getItem("jobCards") || "[]"
  );
  const jobCardIds = new Set(existingJobCards.map((jc: any) => jc.id));
  
  if (!jobCardIds.has(mockJobCard1.id)) {
    existingJobCards.push(mockJobCard1);
  }
  localStorage.setItem("jobCards", JSON.stringify(existingJobCards));

  // Initialize Pickup/Drop Charges
  const existingCharges = JSON.parse(
    localStorage.getItem("pickupDropCharges") || "[]"
  );
  const chargeIds = new Set(existingCharges.map((ch: any) => ch.id));
  
  if (!chargeIds.has(mockPickupDropCharges1.id)) {
    existingCharges.push(mockPickupDropCharges1);
  }
  localStorage.setItem("pickupDropCharges", JSON.stringify(existingCharges));

  console.log("✅ Workflow mock data initialized:", {
    appointments: 2,
    quotations: 2,
    jobCards: 1,
    pickupDropCharges: 1,
  });
};

/**
 * Export all mock data for direct use
 */
export const workflowMockData = {
  appointments: [mockAppointment1, mockAppointment2],
  quotations: [mockQuotation1, mockQuotation2],
  jobCards: [mockJobCard1],
  pickupDropCharges: [mockPickupDropCharges1],
};

