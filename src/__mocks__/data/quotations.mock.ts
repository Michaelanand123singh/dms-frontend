/**
 * Mock data for Quotations
 */

import type { Quotation, Insurer, NoteTemplate } from "@/shared/types";

export const defaultQuotations: Quotation[] = [
  {
    id: "qt-001",
    quotationNumber: "QT-SC001-202501-0001",
    serviceCenterId: "sc-001",
    customerId: "cust-001",
    vehicleId: "veh-001",
    serviceAdvisorId: "user-001",
    documentType: "Quotation",
    quotationDate: "2025-01-15",
    validUntil: "2025-02-14",
    hasInsurance: true,
    insurerId: "ins-001",
    subtotal: 5000,
    discount: 500,
    discountPercent: 10,
    preGstAmount: 4500,
    cgstAmount: 405,
    sgstAmount: 405,
    igstAmount: 0,
    totalAmount: 5310,
    notes: "Regular service with oil change",
    batterySerialNumber: "",
    customNotes: "",
    noteTemplateId: "",
    status: "draft",
    passedToManager: false,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
    items: [
      {
        id: "item-001",
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
        id: "item-002",
        serialNumber: 2,
        partName: "Oil Filter",
        partNumber: "MCU-OF-002",
        hsnSacCode: "8708",
        quantity: 1,
        rate: 500,
        gstPercent: 18,
        amount: 500,
      },
      {
        id: "item-003",
        serialNumber: 3,
        partName: "Labor Charges",
        partNumber: "",
        hsnSacCode: "998314",
        quantity: 1,
        rate: 1500,
        gstPercent: 18,
        amount: 1500,
      },
    ],
    customer: {
      id: "cust-001",
      firstName: "Rajesh",
      lastName: "Kumar",
      phone: "9876543210",
      email: "rajesh@example.com",
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
    vehicle: {
      id: "veh-001",
      make: "Honda",
      model: "City",
      registration: "MH01AB1234",
      vin: "MAH12345678901234",
    },
    insurer: {
      id: "ins-001",
      name: "Bajaj Finance",
      address: "Pune, Maharashtra",
      gstNumber: "27AABCU9603R1ZM",
      phone: "1800-123-456",
      email: "support@bajajfinance.com",
      isActive: true,
    },
  },
];

export const defaultInsurers: Insurer[] = [
  {
    id: "ins-001",
    name: "Bajaj Finance",
    address: "Pune, Maharashtra",
    gstNumber: "27AABCU9603R1ZM",
    phone: "1800-123-456",
    email: "support@bajajfinance.com",
    isActive: true,
  },
  {
    id: "ins-002",
    name: "HDFC Ergo",
    address: "Mumbai, Maharashtra",
    gstNumber: "27AAACH1234R1Z5",
    phone: "1800-202-2020",
    email: "support@hdfcergo.com",
    isActive: true,
  },
  {
    id: "ins-003",
    name: "ICICI Lombard",
    address: "Mumbai, Maharashtra",
    gstNumber: "27AAACI1234R1Z6",
    phone: "1800-266-266",
    email: "support@icicilombard.com",
    isActive: true,
  },
];

export const defaultNoteTemplates: NoteTemplate[] = [
  {
    id: "template-001",
    name: "Battery Replacement",
    content: "Battery replacement service. If battery is not recoverable, you need to pay in full. Battery serial number: {batterySerialNumber}",
    category: "battery",
    isActive: true,
  },
  {
    id: "template-002",
    name: "General Service",
    content: "Regular maintenance service. All parts are subject to availability. Estimated completion time: 2-3 hours.",
    category: "general",
    isActive: true,
  },
  {
    id: "template-003",
    name: "Warranty Service",
    content: "Service covered under warranty. No charges applicable if issue is covered under warranty terms.",
    category: "warranty",
    isActive: true,
  },
];







