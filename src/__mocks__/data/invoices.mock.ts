/**
 * Mock data for Invoices
 */

export interface Invoice {
  id: string;
  scName: string;
  customerName: string;
  amount: string;
  dateIssued: string;
  dueDate: string;
  paymentStatus: "Paid" | "Pending" | "Overdue";
  jobCardId?: string;
}

export const invoiceData: Invoice[] = [
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

