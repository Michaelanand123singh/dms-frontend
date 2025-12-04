/**
 * Mock data for Invoices
 */

import type { Invoice } from "@/shared/types";
import { mockCustomers } from "./customers.mock";

/**
 * Legacy invoice interface for admin dashboard (includes scName)
 */
export interface LegacyInvoice {
  id: string;
  scName: string;
  customerName: string;
  amount: string;
  dateIssued: string;
  dueDate: string;
  paymentStatus: "Paid" | "Pending" | "Overdue";
  jobCardId?: string;
}

export const invoiceData: LegacyInvoice[] = [
  {
    id: "INV-2024-001",
    scName: "Delhi Central Hub",
    customerName: "Rohit Shah",
    amount: "₹5,500",
    dateIssued: "2024-11-01",
    dueDate: "2024-11-08",
    paymentStatus: "Paid",
    jobCardId: "JC001",
  },
  {
    id: "INV-2024-002",
    scName: "Mumbai Metroplex",
    customerName: "Priya Nair",
    amount: "₹8,200",
    dateIssued: "2024-11-03",
    dueDate: "2024-11-10",
    paymentStatus: "Overdue",
  },
  {
    id: "INV-2024-003",
    scName: "Bangalore Innovation Center",
    customerName: "Arjun Mehta",
    amount: "₹12,500",
    dateIssued: "2024-11-05",
    dueDate: "2024-11-12",
    paymentStatus: "Paid",
  },
  {
    id: "INV-2024-004",
    scName: "Delhi Central Hub",
    customerName: "Sneha Patel",
    amount: "₹6,800",
    dateIssued: "2024-11-02",
    dueDate: "2024-11-09",
    paymentStatus: "Pending",
  },
  {
    id: "INV-2024-005",
    scName: "Mumbai Metroplex",
    customerName: "Vikram Singh",
    amount: "₹9,300",
    dateIssued: "2024-11-04",
    dueDate: "2024-11-11",
    paymentStatus: "Paid",
  },
  {
    id: "INV-2024-006",
    scName: "Pune Elite Care",
    customerName: "Anita Desai",
    amount: "₹7,600",
    dateIssued: "2024-11-06",
    dueDate: "2024-11-13",
    paymentStatus: "Pending",
  },
  {
    id: "INV-2024-007",
    scName: "Bangalore Innovation Center",
    customerName: "Rajesh Kumar",
    amount: "₹11,200",
    dateIssued: "2024-10-28",
    dueDate: "2024-11-05",
    paymentStatus: "Overdue",
  },
  {
    id: "INV-2024-008",
    scName: "Delhi Central Hub",
    customerName: "Meera Joshi",
    amount: "₹4,900",
    dateIssued: "2024-11-07",
    dueDate: "2024-11-14",
    paymentStatus: "Paid",
  },
  {
    id: "INV-2024-009",
    scName: "Mumbai Metroplex",
    customerName: "Karan Malhotra",
    amount: "₹15,000",
    dateIssued: "2024-11-01",
    dueDate: "2024-11-08",
    paymentStatus: "Paid",
  },
  {
    id: "INV-2024-010",
    scName: "Pune Elite Care",
    customerName: "Divya Sharma",
    amount: "₹8,700",
    dateIssued: "2024-11-03",
    dueDate: "2024-11-10",
    paymentStatus: "Pending",
  },
  {
    id: "INV-2024-011",
    scName: "Delhi Central Hub",
    customerName: "Amit Verma",
    amount: "₹6,300",
    dateIssued: "2024-11-05",
    dueDate: "2024-11-12",
    paymentStatus: "Paid",
  },
  {
    id: "INV-2024-012",
    scName: "Bangalore Innovation Center",
    customerName: "Pooja Reddy",
    amount: "₹10,100",
    dateIssued: "2024-11-06",
    dueDate: "2024-11-13",
    paymentStatus: "Paid",
  },
];

/**
 * Default invoices for the invoices page
 * In production, this would be fetched from an API
 */
const [rajesh, priya, amit] = mockCustomers;
const rajeshVehicle = rajesh.vehicles[0];
const priyaVehicle = priya.vehicles[0];
const amitVehicle = amit.vehicles[0];

export const defaultInvoices: Invoice[] = [
  {
    id: "INV-2025-001",
    jobCardId: "JC-2025-001",
    customerId: rajesh.externalId ?? "cust-001",
    vehicleId: rajeshVehicle.externalId ?? "veh-001",
    customerName: rajesh.name,
    vehicle: `${rajeshVehicle.vehicleMake} ${rajeshVehicle.vehicleModel} (${rajeshVehicle.registration})`,
    date: "2025-01-15",
    dueDate: "2025-01-25",
    amount: "₹4,000",
    paidAmount: "₹0",
    balance: "₹4,000",
    status: "Unpaid",
    paymentMethod: null,
    serviceCenterId: 1 as string | number,
    serviceCenterName: "Delhi Central Hub",
    items: [
      { name: "Engine Oil", qty: 1, price: "₹2,500" },
      { name: "Labor Charges", qty: 1, price: "₹1,500" },
    ],
  },
  {
    id: "INV-2025-002",
    jobCardId: "JC-2025-002",
    customerId: priya.externalId ?? "cust-002",
    vehicleId: priyaVehicle.externalId ?? "veh-003",
    customerName: priya.name,
    vehicle: `${priyaVehicle.vehicleMake} ${priyaVehicle.vehicleModel} (${priyaVehicle.registration})`,
    date: "2025-01-15",
    dueDate: "2025-01-25",
    amount: "₹4,950",
    paidAmount: "₹4,950",
    balance: "₹0",
    status: "Paid",
    paymentMethod: "UPI",
    serviceCenterId: 2 as string | number,
    serviceCenterName: "Mumbai Metroplex",
    items: [
      { name: "Brake Pads", qty: 1, price: "₹3,200" },
      { name: "Labor Charges", qty: 1, price: "₹1,750" },
    ],
  },
  {
    id: "INV-2025-003",
    jobCardId: "JC-2025-003",
    customerId: amit.externalId ?? "cust-003",
    vehicleId: amitVehicle.externalId ?? "veh-004",
    customerName: amit.name,
    vehicle: `${amitVehicle.vehicleMake} ${amitVehicle.vehicleModel} (${amitVehicle.registration})`,
    date: "2025-01-10",
    dueDate: "2025-01-20",
    amount: "₹1,770",
    paidAmount: "₹0",
    balance: "₹1,770",
    status: "Overdue",
    paymentMethod: null,
    serviceCenterId: 3 as string | number,
    serviceCenterName: "Bangalore Innovation Center",
    items: [
      { name: "Inspection Charges", qty: 1, price: "₹1,500" },
    ],
  },
  {
    id: "INV-2024-456",
    jobCardId: "JC-2024-045",
    customerId: rajesh.externalId ?? "cust-001",
    vehicleId: rajeshVehicle.externalId ?? "veh-001",
    customerName: rajesh.name,
    vehicle: `${rajeshVehicle.vehicleMake} ${rajeshVehicle.vehicleModel} (${rajeshVehicle.registration})`,
    date: "2024-12-15",
    dueDate: "2024-12-15",
    amount: "₹4,000",
    paidAmount: "₹4,000",
    balance: "₹0",
    status: "Paid",
    paymentMethod: "Cash",
    serviceCenterId: 1 as string | number,
    serviceCenterName: "Delhi Central Hub",
    items: [
      { name: "Labor", qty: 1, price: "₹1,500" },
      { name: "Parts", qty: 1, price: "₹2,500" },
    ],
  },
  {
    id: "INV-2024-389",
    jobCardId: "JC-2024-038",
    customerId: priya.externalId ?? "cust-002",
    vehicleId: priyaVehicle.externalId ?? "veh-003",
    customerName: priya.name,
    vehicle: `${priyaVehicle.vehicleMake} ${priyaVehicle.vehicleModel} (${priyaVehicle.registration})`,
    date: "2024-11-20",
    dueDate: "2024-11-20",
    amount: "₹5,500",
    paidAmount: "₹5,500",
    balance: "₹0",
    status: "Paid",
    paymentMethod: "Cash",
    serviceCenterId: 2 as string | number,
    serviceCenterName: "Mumbai Metroplex",
    items: [
      { name: "Labor", qty: 1, price: "₹2,000" },
      { name: "Parts", qty: 1, price: "₹3,500" },
    ],
  },
];

export interface ServiceCenterInvoice {
  id: string;
  customerName: string;
  amount: string;
  date: string;
  dueDate: string;
  status: string;
  jobCardId?: string;
}

export const serviceCenterInvoicesData: ServiceCenterInvoice[] = [
  {
    id: "INV-2024-001",
    customerName: "Rohit Shah",
    amount: "₹5,500",
    date: "2024-11-10",
    dueDate: "2024-11-17",
    status: "Pending",
    jobCardId: "JC001",
  },
];

