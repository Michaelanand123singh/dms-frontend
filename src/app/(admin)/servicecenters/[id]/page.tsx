"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  BarChart3,
  Search,
  Plus,
  CheckCircle,
  FileText,
  User,
  RefreshCw,
  CheckCircle2,
  Package,
  ShoppingCart,
  Package2,
  ShoppingBag,
  Receipt,
  CreditCard,
  Star,
  ArrowLeft,
  X,
  Calendar,
  ClipboardList,
  Menu,
  Edit,
  Eye,
} from "lucide-react";

// Sample data - in a real app, this would come from an API
const centersData = {
  1: {
    id: 1,
    name: "Delhi Central Hub",
    location: "Connaught Place, New Delhi",
    staff: 3,
    jobs: 12,
    revenue: "₹12.4L",
    status: "Active",
    rating: 4.9,
    staffMembers: [
      {
        id: 1,
        name: "Delhi Manager",
        role: "SC Manager",
        email: "delhi@service.com",
        status: "Active",
      },
      {
        id: 2,
        name: "Technician Raj",
        role: "Technician",
        email: "raj@service.com",
        status: "Active",
      },
      {
        id: 3,
        name: "Technician Priya",
        role: "Technician",
        email: "priya@service.com",
        status: "Active",
      },
    ],
  },
  2: {
    id: 2,
    name: "Mumbai Metroplex",
    location: "Bandra West, Mumbai",
    staff: 3,
    jobs: 18,
    revenue: "₹18.9L",
    status: "Active",
    rating: 4.8,
    staffMembers: [
      {
        id: 1,
        name: "Mumbai Manager",
        role: "SC Manager",
        email: "mumbai@service.com",
        status: "Active",
      },
      {
        id: 2,
        name: "Technician Amit",
        role: "Technician",
        email: "amit@service.com",
        status: "Active",
      },
      {
        id: 3,
        name: "Technician Sneha",
        role: "Technician",
        email: "sneha@service.com",
        status: "Active",
      },
    ],
  },
  3: {
    id: 3,
    name: "Bangalore Innovation Center",
    location: "Koramangala, Bangalore",
    staff: 2,
    jobs: 15,
    revenue: "₹15.6L",
    status: "Active",
    rating: 4.9,
    staffMembers: [
      {
        id: 1,
        name: "Bangalore Manager",
        role: "SC Manager",
        email: "bangalore@service.com",
        status: "Active",
      },
      {
        id: 2,
        name: "Technician Vikram",
        role: "Technician",
        email: "vikram@service.com",
        status: "Active",
      },
    ],
  },
};

const actionButtons = [
  { name: "Overview", icon: BarChart3 },
  { name: "Vehicle Search", icon: Search },
  { name: "Create Request", icon: Plus },
  { name: "Create Job Card", icon: FileText },
  { name: "Update Job Status", icon: RefreshCw },
  { name: "Complete Job", icon: CheckCircle2 },
  { name: "View Inventory", icon: Package },
  { name: "Request Parts", icon: ShoppingCart },
  { name: "Issue Parts", icon: Package2 },
  { name: "Generate Invoice", icon: Receipt },
  { name: "Record Payment", icon: CreditCard },
];

// Sample data for vehicles
const vehiclesData = [
  {
    id: 1,
    registrationNumber: "DL-01-AB-1234",
    make: "Honda",
    model: "City",
    year: 2020,
    customerName: "Rohit Shah",
    phone: "+91-9876-543-210",
    email: "rohit.shah@email.com",
    address: "123 Main Street, New Delhi, 110001",
    vin: "MBJC123456789012A",
    totalServices: 5,
    lastServiceDate: "2024-10-15",
    currentStatus: "Active Job Card",
    activeJobCard: "JC001",
    nextServiceDate: "2025-01-15",
  },
  {
    id: 2,
    registrationNumber: "DL-01-CD-5678",
    make: "Maruti",
    model: "Swift",
    year: 2021,
    customerName: "Priya Sharma",
    phone: "+91-9876-543-211",
    email: "priya.sharma@email.com",
    address: "456 Park Avenue, New Delhi, 110002",
    vin: "MBJC123456789012B",
    totalServices: 3,
    lastServiceDate: "2024-09-20",
    currentStatus: "Available",
    activeJobCard: null,
    nextServiceDate: "2025-02-20",
  },
  {
    id: 3,
    registrationNumber: "DL-01-EF-9012",
    make: "Hyundai",
    model: "i20",
    year: 2019,
    customerName: "Amit Kumar",
    phone: "+91-9876-543-212",
    email: "amit.kumar@email.com",
    address: "789 MG Road, New Delhi, 110003",
    vin: "MBJC123456789012C",
    totalServices: 7,
    lastServiceDate: "2024-11-05",
    currentStatus: "Available",
    activeJobCard: null,
    nextServiceDate: "2025-01-05",
  },
];

// Sample service history data
const serviceHistoryData = {
  1: [
    {
      id: "SH001",
      serviceDate: "2024-10-15",
      serviceType: "Full Service",
      engineerName: "Technician Raj",
      partsUsed: ["Engine Oil 5L", "Air Filter", "Spark Plugs"],
      laborCharges: "₹1500",
      partsCharges: "₹2500",
      totalAmount: "₹4000",
      invoiceNumber: "INV-2024-045",
      jobCardId: "JC001",
    },
    {
      id: "SH002",
      serviceDate: "2024-07-10",
      serviceType: "Maintenance",
      engineerName: "Technician Priya",
      partsUsed: ["Engine Oil 5L", "Coolant 5L"],
      laborCharges: "₹1000",
      partsCharges: "₹1500",
      totalAmount: "₹2500",
      invoiceNumber: "INV-2024-032",
      jobCardId: "JC002",
    },
    {
      id: "SH003",
      serviceDate: "2024-04-05",
      serviceType: "Repair",
      engineerName: "Technician Raj",
      partsUsed: ["Brake Pads", "Brake Fluid"],
      laborCharges: "₹2000",
      partsCharges: "₹3000",
      totalAmount: "₹5000",
      invoiceNumber: "INV-2024-018",
      jobCardId: "JC003",
    },
  ],
  2: [
    {
      id: "SH004",
      serviceDate: "2024-09-20",
      serviceType: "Full Service",
      engineerName: "Technician Amit",
      partsUsed: ["Engine Oil 5L", "Air Filter"],
      laborCharges: "₹1200",
      partsCharges: "₹1800",
      totalAmount: "₹3000",
      invoiceNumber: "INV-2024-038",
      jobCardId: "JC004",
    },
  ],
  3: [
    {
      id: "SH005",
      serviceDate: "2024-11-05",
      serviceType: "Maintenance",
      engineerName: "Technician Vikram",
      partsUsed: ["Engine Oil 5L", "Coolant 5L", "Air Filter"],
      laborCharges: "₹1500",
      partsCharges: "₹2000",
      totalAmount: "₹3500",
      invoiceNumber: "INV-2024-050",
      jobCardId: "JC005",
    },
  ],
};

// Sample data for service requests
const serviceRequestsData = [
  {
    id: "SR001",
    vehicle: "DL-01-AB-1234",
    customerName: "Rohit Shah",
    serviceType: "Full Service",
    description: "Regular maintenance and oil change",
    estimatedCost: "₹5500",
    requestedDate: "2024-11-10",
    status: "Pending",
  },
  {
    id: "SR002",
    vehicle: "DL-01-CD-5678",
    customerName: "Priya Sharma",
    serviceType: "Repair",
    description: "Brake pad replacement",
    estimatedCost: "₹3500",
    requestedDate: "2024-11-11",
    status: "Pending",
  },
];

// Approved requests will be computed dynamically from serviceRequests

// Sample data for part requests
const partRequestsData = [
  {
    id: "PR001",
    part: "Engine Oil 5L",
    quantity: 10,
    reason: "Low Stock",
    requestedDate: "2024-11-10",
    status: "Pending",
  },
  {
    id: "PR002",
    part: "Coolant 5L",
    quantity: 15,
    reason: "Replacement",
    requestedDate: "2024-11-09",
    status: "Approved",
  },
];

// Sample data for inventory
const inventoryData = [
  {
    id: 1,
    partName: "Engine Oil 5L",
    sku: "EO-5L-001",
    category: "Fluids",
    quantity: 20,
    price: "₹450",
    status: "In Stock",
  },
  {
    id: 2,
    partName: "Air Filter",
    sku: "AF-001",
    category: "Filters",
    quantity: 12,
    price: "₹250",
    status: "In Stock",
  },
  {
    id: 3,
    partName: "Spark Plugs (Set of 4)",
    sku: "SP-4-001",
    category: "Ignition",
    quantity: 15,
    price: "₹600",
    status: "In Stock",
  },
  {
    id: 4,
    partName: "Brake Pads",
    sku: "BP-001",
    category: "Brakes",
    quantity: 8,
    price: "₹1200",
    status: "In Stock",
  },
  {
    id: 5,
    partName: "Coolant 5L",
    sku: "CL-5L-001",
    category: "Fluids",
    quantity: 6,
    price: "₹350",
    status: "Low Stock",
  },
];

// Sample data for jobs
const jobsData = [
  {
    id: "JC001",
    vehicle: "DL-01-CD-5678",
    customerName: "Priya Nair",
    technician: "Technician Raj",
    status: "In Progress",
    estimatedCost: "₹5500",
  },
  {
    id: "JC002",
    vehicle: "DL-01-AB-1234",
    customerName: "Rohit Shah",
    technician: "Technician Priya",
    status: "Not Started",
    estimatedCost: "₹3500",
  },
  {
    id: "JC003",
    vehicle: "DL-01-XY-9999",
    customerName: "Amit Kumar",
    technician: "Technician Raj",
    status: "Completed",
    estimatedCost: "₹4500",
  },
  {
    id: "JC004",
    vehicle: "DL-01-MN-8888",
    customerName: "Sneha Patel",
    technician: "Technician Priya",
    status: "Completed",
    estimatedCost: "₹6200",
  },
];

// Sample parts data for request form
const partsData = [
  { id: 1, name: "Engine Oil 5L" },
  { id: 2, name: "Coolant 5L" },
  { id: 3, name: "Air Filter" },
  { id: 4, name: "Brake Pads" },
  { id: 5, name: "Spark Plugs (Set of 4)" },
];

// Sample data for invoices
const invoicesData = [
  {
    id: "INV-2024-001",
    customerName: "Rohit Shah",
    amount: "₹5500",
    date: "2024-11-10",
    dueDate: "2024-11-17",
    status: "Pending",
    jobCardId: "JC001",
  },
];

export default function ServiceCenterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Initialize with empty data for new centers, or sample data for existing ones
  const [vehicles, setVehicles] = useState(vehiclesData);
  const [serviceRequests, setServiceRequests] = useState(serviceRequestsData);

  // Helper function to normalize phone number for search (remove country code, dashes, spaces)
  const normalizePhoneNumber = (phone: string | undefined | null): string => {
    if (!phone) return "";
    // Remove country code (+91, 91), dashes, spaces, and parentheses
    return phone.replace(/^\+?91[- ]?/, "").replace(/[- ]/g, "").trim();
  };
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Popup states
  const [showVehiclePopup, setShowVehiclePopup] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");
  const [showAddVehiclePopup, setShowAddVehiclePopup] = useState(false);
  const [showEngineerPopup, setShowEngineerPopup] = useState(false);
  const [engineerSearchQuery, setEngineerSearchQuery] = useState("");
  const [showPartPopup, setShowPartPopup] = useState(false);
  const [partSearchQuery, setPartSearchQuery] = useState("");
  const [showAddPartPopup, setShowAddPartPopup] = useState(false);
  const [showInvoiceSearchPopup, setShowInvoiceSearchPopup] = useState(false);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [showInventoryAddEdit, setShowInventoryAddEdit] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState<any>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState<any>(null);
  const [showJobCardForm, setShowJobCardForm] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "" });
  
  // Toast function
  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3000);
  };
  
  // Form states
  const [createRequestForm, setCreateRequestForm] = useState({
    vehicle: "",
    serviceType: "",
    description: "",
    estimatedCost: "",
  });
  
  const [jobCardForm, setJobCardForm] = useState({
    approvedRequest: "",
    vehicle: "",
    customerName: "",
    serviceType: "",
    technician: "",
    completionDate: "",
    laborCost: "",
    partsCost: "",
  });
  
  const [partRequests, setPartRequests] = useState(partRequestsData);
  const [inventory, setInventory] = useState(inventoryData);
  const [jobs, setJobs] = useState(jobsData);
  const [invoices, setInvoices] = useState(invoicesData);
  
  const [requestPartsForm, setRequestPartsForm] = useState({
    part: "",
    partName: "",
    quantity: "",
    reason: "Low Stock",
    notes: "",
  });
  
  const [generateInvoiceForm, setGenerateInvoiceForm] = useState({
    jobCard: "",
    vehicle: "",
    invoiceType: "Job Card", // Job Card or OTC Order
    invoiceNumber: "Auto-generated",
    tax: "18",
    discount: "0",
    customerName: "",
    customerPhone: "",
    items: inventoryData.map((item) => ({ ...item, selectedQuantity: 0 })),
    paymentMethod: "Cash",
  });
  
  const [recordPaymentForm, setRecordPaymentForm] = useState({
    invoice: "",
    paymentMethod: "Cash",
    amountPaid: "",
  });
  
  const [newVehicleForm, setNewVehicleForm] = useState({
    registrationNumber: "",
    model: "",
    year: "",
    customerName: "",
    phone: "",
    vin: "",
  });
  
  const [newPartForm, setNewPartForm] = useState({
    partName: "",
    sku: "",
    category: "",
    quantity: "",
    price: "",
  });
  
  const [inventoryForm, setInventoryForm] = useState({
    partName: "",
    sku: "",
    partCode: "",
    category: "",
    quantity: "",
    price: "",
    status: "In Stock",
  });

  const [otcOrderForm, setOtcOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    items: inventoryData.map((item: any) => ({ ...item, selectedQuantity: 0 })),
    paymentMethod: "Cash",
  });

  // Compute center data directly from params
  const centerId = params?.id ? parseInt(params.id as string) : null;
  
  // Check localStorage first for newly created centers, then fall back to centersData
  let center: any = null;
  if (typeof window !== 'undefined' && centerId !== null) {
    const storedCenters = JSON.parse(localStorage.getItem('serviceCenters') || '{}');
    center = storedCenters[centerId] || (centersData as any)[centerId];
  } else if (centerId !== null) {
    center = (centersData as any)[centerId];
  }
  
  // If center still doesn't exist, create a default one with zero data
  if (!center && centerId !== null) {
    center = {
      id: centerId,
      name: "Service Center",
      location: "",
      staff: 0,
      jobs: 0,
      revenue: "₹0.0L",
      status: "Active",
      rating: 0,
      staffMembers: [],
    };
  }

  // Initialize empty data for newly created centers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCenters = JSON.parse(localStorage.getItem('serviceCenters') || '{}');
      // If it's a newly created center (in localStorage but not in centersData), start with empty data
      if (centerId !== null && storedCenters[centerId] && !(centersData as any)[centerId]) {
        // Use setTimeout to avoid synchronous state updates
        setTimeout(() => {
          setVehicles([]);
          setServiceRequests([]);
          setPartRequests([]);
          setInventory([]);
          setJobs([]);
        }, 0);
      }
    }
  }, [centerId]);

  // Filter completed jobs for invoice generation
  const jobCardsForInvoice = jobs
    .filter((job: any) => job.status === "Completed")
    .map((job: any) => ({
      id: job.id,
      vehicle: job.vehicle,
      customerName: job.customerName,
      serviceType: job.serviceType || "Service",
    }));

  if (!center) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Service center not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md">
            <CheckCircle2 size={20} className="flex-shrink-0" />
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
      
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md z-40 lg:hidden">
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Actions</h2>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {actionButtons.map((button) => {
                const Icon = button.icon;
                const isActive = activeTab === button.name;
                return (
                  <button
                    key={button.name}
                    onClick={() => {
                      setActiveTab(button.name);
                      setShowMobileMenu(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={18} />
                    {button.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 break-words">
                  {center.name}
                </h1>
                <p className="text-gray-500 text-sm sm:text-base">{center.location}</p>
              </div>
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
          <button
            onClick={() => router.push("/servicecenters")}
            className="bg-blue-600 text-white px-4 py-2 sm:py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 w-full sm:w-auto order-first sm:order-last"
          >
            <ArrowLeft size={16} />
            Back to List
          </button>
        </div>

        {/* Status and Location Info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-6">
          <div className="flex items-center">
            <span className="text-sm text-gray-600">Status:</span>
            <span
              className={`ml-2 text-xs font-medium px-3 py-1 rounded-full ${
                center.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {center.status}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600">Location:</span>
            <span className="ml-2 text-sm text-gray-800 break-words">{center.location}</span>
          </div>
        </div>

        {/* Navigation/Action Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-6 overflow-hidden">
          <div className="hidden lg:flex flex-wrap gap-1.5">
            {actionButtons.map((button) => {
              const Icon = button.icon;
              const isActive = activeTab === button.name;
              return (
                <button
                  key={button.name}
                  onClick={() => setActiveTab(button.name)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={16} />
                  {button.name}
                </button>
              );
            })}
          </div>
          
          {/* Mobile Action Buttons */}
          <div className="lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
              {actionButtons.slice(0, 4).map((button) => {
                const Icon = button.icon;
                const isActive = activeTab === button.name;
                return (
                  <button
                    key={button.name}
                    onClick={() => setActiveTab(button.name)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition min-w-[70px] flex-shrink-0 ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-center leading-tight">{button.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowMobileMenu(true)}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Menu size={16} />
              More Actions
            </button>
          </div>
        </div>

        {/* Dynamic Content Based on Active Tab */}
        <div className="max-w-7xl mx-auto">
          {activeTab === "Overview" && (
            <>
              {/* Service Center Overview */}
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Service Center Overview</h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">STAFF COUNT</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{center.staff}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">ACTIVE JOBS</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{center.jobs}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">REVENUE</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{center.revenue}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">RATING</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl sm:text-3xl font-bold text-orange-600">{center.rating}</p>
                      <Star size={20} className="sm:w-6 sm:h-6" fill="#f59e0b" stroke="#f59e0b" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Center Details */}
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Service Center Details</h2>
                
                {/* Assigned Staff */}
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-4">Assigned Staff</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {center.staffMembers.map((staff: any) => (
                      <div
                        key={staff.id}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-base sm:text-lg font-semibold text-gray-800">{staff.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{staff.role}</p>
                          </div>
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full ${
                              staff.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {staff.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 break-all">{staff.email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Vehicle Search */}
          {activeTab === "Vehicle Search" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Vehicle Search</h2>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search by registration number, VIN, customer name, or mobile number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 text-base"
                />
              </div>
              <div className="space-y-4">
                {vehicles
                  .filter(
                    (vehicle) => {
                      const normalizedQuery = normalizePhoneNumber(searchQuery);
                      const normalizedVehiclePhone = normalizePhoneNumber(vehicle.phone);
                      return (
                        vehicle.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        vehicle.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (normalizedVehiclePhone && normalizedVehiclePhone.includes(normalizedQuery))
                      );
                    }
                  )
                  .map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-black mb-2 break-words">
                            {vehicle.registrationNumber}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 mb-3">
                            {vehicle.make || ""} {vehicle.model} ({vehicle.year})
                          </p>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p>
                              Customer: <span className="font-semibold">{vehicle.customerName}</span>
                            </p>
                            <p>
                              Phone: <span className="font-semibold break-all">{normalizePhoneNumber(vehicle.phone) || vehicle.phone}</span>
                            </p>
                            <p className="break-all">VIN: {vehicle.vin}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowVehicleDetails(vehicle)}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition w-full lg:w-auto lg:ml-4 whitespace-nowrap flex items-center justify-center gap-2"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* Vehicle Details Modal */}
              {showVehicleDetails && (
                <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6 relative max-h-[95vh] overflow-y-auto">
                    <button
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
                      onClick={() => setShowVehicleDetails(null)}
                    >
                      <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 pr-8">Vehicle Details</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Vehicle Details */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Details</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-600">Make</label>
                            <p className="text-base font-semibold text-gray-800">{showVehicleDetails.make || "N/A"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Model</label>
                            <p className="text-base font-semibold text-gray-800">{showVehicleDetails.model}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Year</label>
                            <p className="text-base text-gray-800">{showVehicleDetails.year}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Registration Number</label>
                            <p className="text-base font-semibold text-gray-800">{showVehicleDetails.registrationNumber}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">VIN</label>
                            <p className="text-base text-gray-800 break-all font-mono text-sm">{showVehicleDetails.vin}</p>
                          </div>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Details</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-600">Name</label>
                            <p className="text-base font-semibold text-gray-800">{showVehicleDetails.customerName}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Phone</label>
                            <p className="text-base text-gray-800">{normalizePhoneNumber(showVehicleDetails.phone) || showVehicleDetails.phone}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Email</label>
                            <p className="text-base text-gray-800 break-all">{showVehicleDetails.email || "N/A"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Address</label>
                            <p className="text-base text-gray-800 break-words">{showVehicleDetails.address || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Service Summary & Current Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Summary</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-600">Total Services</label>
                            <p className="text-2xl font-bold text-blue-600">{showVehicleDetails.totalServices || 0}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Last Service Date</label>
                            <p className="text-base font-semibold text-gray-800">{showVehicleDetails.lastServiceDate || "N/A"}</p>
                          </div>
                          {showVehicleDetails.nextServiceDate && (
                            <div>
                              <label className="text-xs font-medium text-gray-600">Next Scheduled Service</label>
                              <p className="text-base font-semibold text-orange-600">{showVehicleDetails.nextServiceDate}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Status</h3>
                        <div className="space-y-3">
                          <div>
                            <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${
                              showVehicleDetails.currentStatus === "Active Job Card"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }`}>
                              {showVehicleDetails.currentStatus || "Available"}
                            </span>
                          </div>
                          {showVehicleDetails.activeJobCard && (
                            <div>
                              <label className="text-xs font-medium text-gray-600">Active Job Card</label>
                              <p className="text-base font-semibold text-gray-800">{showVehicleDetails.activeJobCard}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button
                          onClick={() => {
                            // Scroll to service history
                            document.getElementById('service-history-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                          View Service History
                        </button>
                        <button
                          onClick={() => {
                            setShowVehicleDetails(null);
                            setActiveTab("Create Job Card");
                            setJobCardForm({
                              ...jobCardForm,
                              vehicle: showVehicleDetails.registrationNumber,
                              customerName: showVehicleDetails.customerName,
                            });
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                        >
                          Create Job Card
                        </button>
                        <button
                          onClick={() => {
                            setShowVehicleDetails(null);
                            setActiveTab("Generate Invoice");
                            const jobCard = jobs.find(j => j.vehicle === showVehicleDetails.registrationNumber);
                            if (jobCard) {
                              setGenerateInvoiceForm({ ...generateInvoiceForm, jobCard: jobCard.id });
                            }
                          }}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                        >
                          Generate Invoice
                        </button>
                        <button
                          onClick={() => {
                            showToast("Schedule appointment functionality coming soon!");
                          }}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition"
                        >
                          Schedule Appointment
                        </button>
                      </div>
                    </div>

                    {/* Service History Timeline */}
                    <div id="service-history-section" className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Service History Timeline</h3>
                      <div className="space-y-4">
                        {showVehicleDetails?.id && (serviceHistoryData as any)[showVehicleDetails.id] && (serviceHistoryData as any)[showVehicleDetails.id].length > 0 ? (
                          (serviceHistoryData as any)[showVehicleDetails.id].map((service: any, index: number) => (
                            <div key={service.id} className="border-l-4 border-blue-500 pl-4 pb-4 relative">
                              <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Service Date</p>
                                    <p className="text-base font-semibold text-gray-800">{service.serviceDate}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Service Type</p>
                                    <p className="text-base font-semibold text-gray-800">{service.serviceType}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Engineer</p>
                                    <p className="text-base font-semibold text-gray-800">{service.engineerName}</p>
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <p className="text-sm font-medium text-gray-600 mb-2">Parts Used</p>
                                  <div className="flex flex-wrap gap-2">
                                    {service.partsUsed.map((part: string, idx: number) => (
                                      <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                        {part}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">Labor Charges</p>
                                    <p className="text-sm font-semibold text-gray-800">{service.laborCharges}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">Parts Charges</p>
                                    <p className="text-sm font-semibold text-gray-800">{service.partsCharges}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">Total Amount</p>
                                    <p className="text-sm font-bold text-green-600">{service.totalAmount}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">Invoice Number</p>
                                    <p className="text-sm font-semibold text-gray-800">{service.invoiceNumber}</p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs font-medium text-gray-600">Job Card ID</p>
                                  <p className="text-sm font-semibold text-gray-800">{service.jobCardId}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-6 text-center">
                            <p className="text-gray-500">No service history available for this vehicle</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Next Scheduled Service Reminder */}
                    {showVehicleDetails.nextServiceDate && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="text-yellow-600 mt-1" size={20} />
                          <div>
                            <h4 className="text-base font-semibold text-gray-800 mb-1">Next Scheduled Service Reminder</h4>
                            <p className="text-sm text-gray-700">
                              Next service is scheduled for <span className="font-semibold text-yellow-700">{showVehicleDetails.nextServiceDate}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create Request */}
          {activeTab === "Create Request" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Create Service Request</h2>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const selectedVehicle = vehicles.find(v => v.id.toString() === createRequestForm.vehicle);
                    const newRequest = {
                      id: `SR${String(serviceRequests.length + 1).padStart(3, '0')}`,
                      vehicle: selectedVehicle ? selectedVehicle.registrationNumber : "",
                      customerName: selectedVehicle ? selectedVehicle.customerName : "",
                      serviceType: createRequestForm.serviceType,
                      description: createRequestForm.description,
                      estimatedCost: createRequestForm.estimatedCost,
                      requestedDate: new Date().toISOString().split('T')[0],
                      status: "Pending",
                    };
                    setServiceRequests([...serviceRequests, newRequest]);
                    showToast("Service request created successfully! Redirecting to Create Job Card...");
                    setCreateRequestForm({ vehicle: "", serviceType: "", description: "", estimatedCost: "" });
                    // Navigate to Create Job Card and pre-fill the form
                    setActiveTab("Create Job Card");
                    setShowJobCardForm(true);
                    setJobCardForm({
                      approvedRequest: newRequest.id,
                      vehicle: newRequest.vehicle || "",
                      customerName: newRequest.customerName || "",
                      serviceType: newRequest.serviceType || "",
                      technician: "",
                      completionDate: "",
                      laborCost: "",
                      partsCost: "",
                    });
                  }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Select Vehicle
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={createRequestForm.vehicle ? vehicles.find(v => v.id.toString() === createRequestForm.vehicle)?.registrationNumber || "" : ""}
                        readOnly
                        placeholder="Click to select vehicle"
                        onClick={() => setShowVehiclePopup(true)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black cursor-pointer"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowVehiclePopup(true)}
                        className="bg-blue-600 text-black px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                      >
                        <Search size={20} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type
                    </label>
                    <select
                      value={createRequestForm.serviceType}
                      onChange={(e) =>
                        setCreateRequestForm({ ...createRequestForm, serviceType: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                      required
                    >
                      <option value="">-- Select Type --</option>
                      <option value="Full Service">Full Service</option>
                      <option value="Repair">Repair</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Inspection">Inspection</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Description
                    </label>
                    <textarea
                      value={createRequestForm.description}
                      onChange={(e) =>
                        setCreateRequestForm({ ...createRequestForm, description: e.target.value })
                      }
                      placeholder="Enter service description..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 resize-y"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Cost (₹)
                    </label>
                    <input
                      type="number"
                      value={createRequestForm.estimatedCost}
                      onChange={(e) =>
                        setCreateRequestForm({ ...createRequestForm, estimatedCost: e.target.value })
                      }
                      placeholder="Enter estimated cost"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-base"
                  >
                    Create Service Request
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Create Job Card */}
          {activeTab === "Create Job Card" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ClipboardList size={24} className="text-orange-600" />
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Create Job Card</h2>
                </div>
                {!showJobCardForm && (
                  <button
                    onClick={() => {
                      setShowJobCardForm(true);
                      setJobCardForm({
                        approvedRequest: "",
                        vehicle: "",
                        customerName: "",
                        serviceType: "",
                        technician: "",
                        completionDate: "",
                        laborCost: "",
                        partsCost: "",
                      });
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Create New Job Card
                  </button>
                )}
              </div>

              {/* Show Pending Service Requests and Created Job Cards */}
              {!showJobCardForm && (
                <div className="space-y-4">
                  {serviceRequests.filter(sr => sr.status === "Pending" || sr.status === "Converted").length > 0 ? (
                    serviceRequests.filter(sr => sr.status === "Pending" || sr.status === "Converted").map((request) => {
                      const createdJobCard = (request as any).jobCardId ? jobs.find((j: any) => j.id === (request as any).jobCardId) : null;
                      
                      return (
                        <div
                          key={request.id}
                          className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-800">{request.id}</h3>
                                {request.status === "Pending" ? (
                                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                                    Pending
                                  </span>
                                ) : (
                                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                                    Converted
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-700 space-y-1">
                                <p>
                                  <span className="font-semibold">Vehicle:</span> {request.vehicle}
                                </p>
                                <p>
                                  <span className="font-semibold">Customer:</span> {request.customerName}
                                </p>
                                <p>
                                  <span className="font-semibold">Service Type:</span> {request.serviceType}
                                </p>
                                <p className="break-words">
                                  <span className="font-semibold">Description:</span> {request.description}
                                </p>
                                <p>
                                  <span className="font-semibold">Estimated Cost:</span> {request.estimatedCost}
                                </p>
                                <p>
                                  <span className="font-semibold">Requested:</span> {request.requestedDate}
                                </p>
                              </div>
                              
                              {/* Show Created Job Card if exists */}
                              {createdJobCard && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileText size={18} className="text-blue-600" />
                                    <h4 className="text-base font-semibold text-gray-800">Created Job Card</h4>
                                  </div>
                                  <div className="bg-blue-50 rounded-lg p-3 space-y-1">
                                    <p className="text-sm">
                                      <span className="font-semibold">Job Card ID:</span> {createdJobCard.id}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-semibold">Technician:</span> {createdJobCard.technician || "Not Assigned"}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-semibold">Status:</span>{" "}
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        createdJobCard.status === "Not Started" ? "bg-gray-100 text-gray-700" :
                                        createdJobCard.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                        createdJobCard.status === "Completed" ? "bg-green-100 text-green-700" :
                                        "bg-yellow-100 text-yellow-700"
                                      }`}>
                                        {createdJobCard.status}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Show Convert button only if not converted yet */}
                            {!createdJobCard && (
                              <button
                                onClick={() => {
                                  setShowJobCardForm(true);
                                  const selectedRequest = request;
                                  setJobCardForm({
                                    approvedRequest: selectedRequest.id,
                                    vehicle: selectedRequest.vehicle || "",
                                    customerName: selectedRequest.customerName || "",
                                    serviceType: selectedRequest.serviceType || "",
                                    technician: "",
                                    completionDate: "",
                                    laborCost: "",
                                    partsCost: "",
                                  });
                                }}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition whitespace-nowrap"
                              >
                                Convert to Job Card
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                      <p className="text-gray-500">No service requests available. Create a service request to convert it to a job card.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Show Job Card Form */}
              {showJobCardForm && (
                <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-xl p-4 sm:p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Job Card Form</h3>
                      <button
                        onClick={() => {
                          setShowJobCardForm(false);
                          setJobCardForm({
                            approvedRequest: "",
                            vehicle: "",
                            customerName: "",
                            serviceType: "",
                            technician: "",
                            completionDate: "",
                            laborCost: "",
                            partsCost: "",
                          });
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const newJob = {
                      id: `JC${String(jobs.length + 1).padStart(3, '0')}`,
                      vehicle: jobCardForm.vehicle || serviceRequests.find((sr: any) => sr.id === jobCardForm.approvedRequest)?.vehicle || "",
                      customerName: jobCardForm.customerName || serviceRequests.find((sr: any) => sr.id === jobCardForm.approvedRequest)?.customerName || "",
                      serviceType: jobCardForm.serviceType || serviceRequests.find((sr: any) => sr.id === jobCardForm.approvedRequest)?.serviceType || "Service",
                      technician: center.staffMembers.find((s: any) => s.id.toString() === jobCardForm.technician)?.name || "",
                      status: "Not Started",
                      estimatedCost: "₹0",
                    };
                    setJobs([...jobs, newJob]);
                    
                    // Mark the service request as converted and store jobCardId if it was selected
                    if (jobCardForm.approvedRequest) {
                      setServiceRequests(
                        serviceRequests.map((req) =>
                          req.id === jobCardForm.approvedRequest ? { ...req, status: "Converted", jobCardId: newJob.id } : req
                        )
                      );
                    }
                    
                    showToast("Job card created successfully!");
                    setShowJobCardForm(false);
                    setJobCardForm({
                      approvedRequest: "",
                      vehicle: "",
                      customerName: "",
                      serviceType: "",
                      technician: "",
                      completionDate: "",
                      laborCost: "",
                      partsCost: "",
                    });
                  }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Service Request (Optional - or fill below for direct creation)
                    </label>
                    <select
                      value={jobCardForm.approvedRequest}
                      onChange={(e) => {
                        const selectedRequest = serviceRequests.find(sr => sr.id === e.target.value);
                        setJobCardForm({ 
                          ...jobCardForm, 
                          approvedRequest: e.target.value,
                          vehicle: selectedRequest?.vehicle || jobCardForm.vehicle,
                          customerName: selectedRequest?.customerName || jobCardForm.customerName,
                          serviceType: selectedRequest?.serviceType || jobCardForm.serviceType,
                        });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                    >
                      <option value="">-- Select Request (Optional) --</option>
                      {serviceRequests.filter(sr => sr.status === "Pending").map((request) => (
                        <option key={request.id} value={request.id}>
                          {request.id} - {request.vehicle} - {request.customerName}
                        </option>
                      ))}
                      {serviceRequests.filter(sr => sr.status === "Pending").length === 0 && (
                        <option value="" disabled>No pending service requests available</option>
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Registration
                    </label>
                    <input
                      type="text"
                      value={jobCardForm.vehicle}
                      onChange={(e) => setJobCardForm({ ...jobCardForm, vehicle: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={jobCardForm.customerName}
                      onChange={(e) => setJobCardForm({ ...jobCardForm, customerName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type
                    </label>
                    <input
                      type="text"
                      value={jobCardForm.serviceType}
                      onChange={(e) => setJobCardForm({ ...jobCardForm, serviceType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Technician
                    </label>
                    <select
                      value={jobCardForm.technician}
                      onChange={(e) =>
                        setJobCardForm({ ...jobCardForm, technician: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      required
                    >
                      <option value="">-- Select Technician --</option>
                      {center.staffMembers
                        .filter((staff: any) => staff.role === "Technician")
                        .map((staff: any) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Completion Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={jobCardForm.completionDate}
                        onChange={(e) =>
                          setJobCardForm({ ...jobCardForm, completionDate: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                        required
                      />
                      <Calendar
                        size={20}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Labor Cost (₹)
                      </label>
                      <input
                        type="number"
                        value={jobCardForm.laborCost}
                        onChange={(e) =>
                          setJobCardForm({ ...jobCardForm, laborCost: e.target.value })
                        }
                        placeholder="Enter labor cost"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parts Cost (₹)
                      </label>
                      <input
                        type="number"
                        value={jobCardForm.partsCost}
                        onChange={(e) =>
                          setJobCardForm({ ...jobCardForm, partsCost: e.target.value })
                        }
                        placeholder="Enter parts cost"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-base"
                  >
                    Create Job Card
                  </button>
                </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Request Parts */}
          {activeTab === "Request Parts" && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <ShoppingCart size={24} className="text-gray-600" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Request Parts</h2>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    showToast("Part request submitted successfully!");
                    setRequestPartsForm({ part: "", partName: "", quantity: "", reason: "Low Stock", notes: "" });
                  }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Part
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={requestPartsForm.partName || (requestPartsForm.part ? partsData.find(p => p.id.toString() === requestPartsForm.part)?.name : "")}
                        readOnly
                        placeholder="Click to search part or add custom"
                        onClick={() => setShowPartPopup(true)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 cursor-pointer"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPartPopup(true)}
                        className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                      >
                        <Search size={20} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity Needed
                    </label>
                    <input
                      type="number"
                      value={requestPartsForm.quantity}
                      onChange={(e) =>
                        setRequestPartsForm({ ...requestPartsForm, quantity: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                    <select
                      value={requestPartsForm.reason}
                      onChange={(e) =>
                        setRequestPartsForm({ ...requestPartsForm, reason: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      required
                    >
                      <option value="Low Stock">Low Stock</option>
                      <option value="Replacement">Replacement</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Repair">Repair</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={requestPartsForm.notes}
                      onChange={(e) =>
                        setRequestPartsForm({ ...requestPartsForm, notes: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-base"
                  >
                    Submit Request
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Issue Parts */}
          {activeTab === "Issue Parts" && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Package2 size={24} className="text-gray-600" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Issue Parts</h2>
              </div>
              <div className="space-y-4">
                {partRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">{request.id}</h3>
                        <div className="text-sm text-gray-700 space-y-2">
                          <p>
                            Part: <span className="font-semibold break-words">{request.part}</span>
                          </p>
                          <p>
                            Quantity: <span className="font-semibold">{request.quantity}</span>
                          </p>
                          <p>
                            Reason: <span className="font-semibold">{request.reason}</span>
                          </p>
                          <p>Requested: {request.requestedDate}</p>
                        </div>
                        <span
                          className={`inline-block mt-3 text-xs font-medium px-3 py-1 rounded-full ${
                            request.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      {request.status === "Pending" && (
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:ml-4 w-full lg:w-auto">
                          <button
                            onClick={() => {
                              setPartRequests(
                                partRequests.map((req) =>
                                  req.id === request.id ? { ...req, status: "Issued" } : req
                                )
                              );
                              showToast("Parts issued successfully!");
                            }}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-green-700 transition whitespace-nowrap flex-1"
                          >
                            Issue Parts
                          </button>
                          <button
                            onClick={() => {
                              setPartRequests(
                                partRequests.map((req) =>
                                  req.id === request.id ? { ...req, status: "Rejected" } : req
                                )
                              );
                              showToast("Request rejected!");
                            }}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-red-700 transition whitespace-nowrap flex-1"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Inventory */}
          {activeTab === "View Inventory" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Package size={24} className="text-gray-600" />
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Service Center Inventory</h2>
                </div>
                <button 
                  onClick={() => {
                    setEditingInventoryItem(null);
                    setInventoryForm({
                      partName: "",
                      sku: "",
                      partCode: "",
                      category: "",
                      quantity: "",
                      price: "",
                      status: "In Stock",
                    });
                    setShowInventoryAddEdit(true);
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 w-full sm:w-auto order-first sm:order-last"
                >
                  <Plus size={16} />
                  Add New Part
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          PART NAME
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          PART CODE
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                          CATEGORY
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          QTY
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          PRICE
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          STATUS
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventory.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900 break-words">{item.partName}</div>
                            <div className="text-xs text-gray-500 md:hidden mt-1">{item.category}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.sku}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.partCode || "-"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">
                            {item.category}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.price}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`text-xs font-medium px-3 py-1 rounded-full ${
                                item.status === "In Stock"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <button 
                              onClick={() => {
                                setEditingInventoryItem(item as any);
                                setInventoryForm({
                                  partName: item.partName,
                                  sku: item.sku,
                                  partCode: (item as any).partCode || "",
                                  category: item.category,
                                  quantity: item.quantity.toString(),
                                  price: item.price.replace('₹', ''),
                                  status: item.status,
                                });
                                setShowInventoryAddEdit(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Update Job Status */}
          {activeTab === "Update Job Status" && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <RefreshCw size={24} className="text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Update Job Status</h2>
              </div>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6"
                  >
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">{job.id}</h3>
                    <div className="text-sm text-gray-700 space-y-2 mb-4">
                      <p>
                        Vehicle: <span className="font-semibold break-words">{job.vehicle} - {job.customerName}</span>
                      </p>
                      <p>
                        Technician: <span className="font-semibold">{job.technician}</span>
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>Current Status:</span>
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            job.status === "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : job.status === "Not Started"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Status
                      </label>
                      <select
                        value={job.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          setJobs(
                            jobs.map((j) =>
                              j.id === job.id 
                                ? { 
                                    ...j, 
                                    status: newStatus,
                                    // Ensure estimatedCost exists when marking as completed
                                    estimatedCost: newStatus === "Completed" && !j.estimatedCost 
                                      ? "₹5000"
                                      : j.estimatedCost
                                  } 
                                : j
                            )
                          );
                          if (newStatus === "Completed") {
                            showToast(`Job ${job.id} marked as completed! You can now convert it to an invoice in the "Complete Job" tab.`);
                          } else {
                            showToast(`Job status updated to ${newStatus}!`);
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete Job */}
          {activeTab === "Complete Job" && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 size={24} className="text-green-600" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Completed Jobs</h2>
              </div>
              <div className="space-y-4">
                {jobs.filter(job => job.status === "Completed").length > 0 ? (
                  jobs.filter(job => job.status === "Completed").map((job) => {
                    const hasInvoice = invoices.some(inv => inv.jobCardId === job.id);
                    return (
                      <div
                        key={job.id}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">{job.id}</h3>
                            <div className="text-sm text-gray-700 space-y-2">
                              <p>
                                Vehicle: <span className="font-semibold break-words">{job.vehicle} - {job.customerName}</span>
                              </p>
                              <p>
                                Technician: <span className="font-semibold">{job.technician}</span>
                              </p>
                              {hasInvoice && (
                                <p className="text-xs text-blue-600 flex items-center gap-1">
                                  <Receipt size={14} />
                                  Invoice already generated
                                </p>
                              )}
                              <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                                Completed
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            {!hasInvoice ? (
                              <button
                                onClick={() => {
                                  // Generate invoice number
                                  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
                                  const today = new Date().toISOString().split('T')[0];
                                  const dueDate = new Date();
                                  dueDate.setDate(dueDate.getDate() + 7);
                                  const dueDateStr = dueDate.toISOString().split('T')[0];
                                  
                                  // Calculate estimated amount (you can enhance this with actual job costs)
                                  const estimatedAmount = job.estimatedCost || "₹5000";
                                  
                                  const newInvoice = {
                                    id: invoiceNumber,
                                    customerName: job.customerName,
                                    amount: estimatedAmount,
                                    date: today,
                                    dueDate: dueDateStr,
                                    status: "Pending",
                                    jobCardId: job.id,
                                    vehicle: job.vehicle,
                                  };
                                  
                                  setInvoices([...invoices, newInvoice]);
                                  showToast(`Invoice ${invoiceNumber} created successfully for job ${job.id}!`);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
                                type="button"
                              >
                                <Receipt size={16} />
                                Convert to Invoice
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const invoice = invoices.find(inv => inv.jobCardId === job.id);
                                  if (invoice) {
                                    showToast(`Invoice ${invoice.id} already exists for this job.`);
                                  }
                                }}
                                className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                                disabled
                              >
                                <Receipt size={16} />
                                Invoice Created
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                    <p className="text-gray-500">No completed jobs</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generate Invoice */}
          {activeTab === "Generate Invoice" && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Receipt size={24} className="text-yellow-600" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Generate Invoice</h2>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    showToast("Invoice generated and sent successfully!");
                    setGenerateInvoiceForm({
                      jobCard: "",
                      vehicle: "",
                      invoiceType: "Job Card",
                      invoiceNumber: "Auto-generated",
                      tax: "18",
                      discount: "0",
                      customerName: "",
                      customerPhone: "",
                      items: inventoryData.map((item) => ({ ...item, selectedQuantity: 0 })),
                      paymentMethod: "Cash",
                    });
                  }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Type
                    </label>
                    <select
                      value={generateInvoiceForm.invoiceType}
                      onChange={(e) =>
                        setGenerateInvoiceForm({ ...generateInvoiceForm, invoiceType: e.target.value, jobCard: "", vehicle: "" })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      required
                    >
                      <option value="Job Card">Job Card Invoice</option>
                      <option value="OTC Order">OTC Order</option>
                    </select>
                  </div>

                  {generateInvoiceForm.invoiceType === "Job Card" ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search & Select Job Card / Vehicle
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={generateInvoiceForm.jobCard ? jobCardsForInvoice.find(jc => jc.id === generateInvoiceForm.jobCard)?.id + " - " + jobCardsForInvoice.find(jc => jc.id === generateInvoiceForm.jobCard)?.vehicle : ""}
                            readOnly
                            placeholder="Click to search job card or vehicle"
                            onClick={() => setShowInvoiceSearchPopup(true)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 cursor-pointer"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowInvoiceSearchPopup(true)}
                            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                          >
                            <Search size={20} />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Customer Name
                            </label>
                            <input
                              type="text"
                              value={generateInvoiceForm.customerName}
                              onChange={(e) =>
                                setGenerateInvoiceForm({ ...generateInvoiceForm, customerName: e.target.value })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Customer Phone
                            </label>
                            <input
                              type="tel"
                              value={generateInvoiceForm.customerPhone}
                              onChange={(e) =>
                                setGenerateInvoiceForm({ ...generateInvoiceForm, customerPhone: e.target.value })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Items</h3>
                        <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                          <div className="divide-y divide-gray-200">
                            {generateInvoiceForm.items.map((item, index) => (
                              <div key={item.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <h4 className="text-base font-semibold text-gray-800 mb-1">
                                      {item.partName}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {item.price} • Stock: {item.quantity}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <label className="text-sm text-gray-600">Qty</label>
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newItems = [...generateInvoiceForm.items];
                                          if (newItems[index].selectedQuantity > 0) {
                                            newItems[index].selectedQuantity -= 1;
                                            setGenerateInvoiceForm({ ...generateInvoiceForm, items: newItems });
                                          }
                                        }}
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        value={item.selectedQuantity || 0}
                                        onChange={(e) => {
                                          const newItems = [...generateInvoiceForm.items];
                                          const val = parseInt(e.target.value) || 0;
                                          newItems[index].selectedQuantity = Math.min(val, item.quantity);
                                          setGenerateInvoiceForm({ ...generateInvoiceForm, items: newItems });
                                        }}
                                        min="0"
                                        max={item.quantity}
                                        className="w-16 px-2 py-2 text-center border-0 focus:ring-0 text-gray-900"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newItems = [...generateInvoiceForm.items];
                                          if (newItems[index].selectedQuantity < item.quantity) {
                                            newItems[index].selectedQuantity += 1;
                                            setGenerateInvoiceForm({ ...generateInvoiceForm, items: newItems });
                                          }
                                        }}
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <select
                          value={generateInvoiceForm.paymentMethod}
                          onChange={(e) =>
                            setGenerateInvoiceForm({ ...generateInvoiceForm, paymentMethod: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                          required
                        >
                          <option value="Cash">Cash</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Debit Card">Debit Card</option>
                          <option value="UPI">UPI</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={generateInvoiceForm.invoiceNumber}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax (%)
                      </label>
                      <input
                        type="number"
                        value={generateInvoiceForm.tax}
                        onChange={(e) =>
                          setGenerateInvoiceForm({ ...generateInvoiceForm, tax: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        value={generateInvoiceForm.discount}
                        onChange={(e) =>
                          setGenerateInvoiceForm({ ...generateInvoiceForm, discount: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-base"
                  >
                    Generate & Send Invoice
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Record Payment */}
          {activeTab === "Record Payment" && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <CreditCard size={24} className="text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Record Payment</h2>
              </div>
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Invoice Details */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details</h3>
                    {invoices.length > 0 ? (
                      <div className="space-y-3">
                        {invoices.slice(0, 5).map((invoice, index) => (
                          <div key={invoice.id} className={index > 0 ? "pt-3 border-t border-gray-200" : ""}>
                            <div>
                              <p className="text-sm text-gray-600">Invoice Number</p>
                              <p className="text-lg font-bold text-gray-800">{invoice.id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Customer</p>
                              <p className="text-base font-semibold text-gray-800">{invoice.customerName}</p>
                            </div>
                            {invoice.jobCardId && (
                              <div>
                                <p className="text-sm text-gray-600">Job Card</p>
                                <p className="text-base text-gray-800">{invoice.jobCardId}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-600">Amount</p>
                              <p className="text-lg font-bold text-gray-800">{invoice.amount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Date</p>
                              <p className="text-base text-gray-800">{invoice.date}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Due Date</p>
                              <p className="text-base text-gray-800">{invoice.dueDate}</p>
                            </div>
                            <div>
                              <span
                                className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${
                                  invoice.status === "Pending"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {invoice.status}
                              </span>
                            </div>
                          </div>
                        ))}
                        {invoices.length > 5 && (
                          <p className="text-xs text-gray-500 pt-2">+ {invoices.length - 5} more invoices</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">No pending invoices</p>
                    )}
                  </div>

                  {/* Payment Form */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        showToast("Payment recorded successfully!");
                        setRecordPaymentForm({
                          invoice: "",
                          paymentMethod: "Cash",
                          amountPaid: "",
                        });
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <select
                          value={recordPaymentForm.paymentMethod}
                          onChange={(e) =>
                            setRecordPaymentForm({ ...recordPaymentForm, paymentMethod: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                          required
                        >
                          <option value="Cash">Cash</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Debit Card">Debit Card</option>
                          <option value="UPI">UPI</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount Paid
                        </label>
                        <input
                          type="number"
                          value={recordPaymentForm.amountPaid}
                          onChange={(e) =>
                            setRecordPaymentForm({ ...recordPaymentForm, amountPaid: e.target.value })
                          }
                          placeholder="Enter amount"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-green-700 transition text-base"
                      >
                        Record Payment
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTC Order - Removed, integrated into Generate Invoice */}
          {false && activeTab === "OTC Order" && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag size={24} className="text-purple-600" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">OTC Order Processing</h2>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    showToast("Order processed and invoice generated successfully!");
                    setOtcOrderForm({
                      customerName: "",
                      customerPhone: "",
                      items: inventoryData.map((item) => ({ ...item, selectedQuantity: 0 })),
                      paymentMethod: "Cash",
                    });
                  }}
                  className="space-y-6"
                >
                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          value={otcOrderForm.customerName}
                          onChange={(e) =>
                            setOtcOrderForm({ ...otcOrderForm, customerName: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Customer Phone
                        </label>
                        <input
                          type="tel"
                          value={otcOrderForm.customerPhone}
                          onChange={(e) =>
                            setOtcOrderForm({ ...otcOrderForm, customerPhone: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Select Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Items</h3>
                    <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                      <div className="divide-y divide-gray-200">
                        {otcOrderForm.items.map((item: any, index: number) => (
                          <div key={item.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="text-base font-semibold text-gray-800 mb-1">
                                  {item.partName}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {item.price} • Stock: {item.quantity}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-600">Qty</label>
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newItems = [...otcOrderForm.items];
                                      if (newItems[index].selectedQuantity > 0) {
                                        newItems[index].selectedQuantity -= 1;
                                        setOtcOrderForm({ ...otcOrderForm, items: newItems });
                                      }
                                    }}
                                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={item.selectedQuantity || 0}
                                    onChange={(e) => {
                                      const newItems = [...otcOrderForm.items];
                                      const val = parseInt(e.target.value) || 0;
                                      newItems[index].selectedQuantity = Math.min(val, item.quantity);
                                      setOtcOrderForm({ ...otcOrderForm, items: newItems });
                                    }}
                                    min="0"
                                    max={item.quantity}
                                    className="w-16 px-2 py-2 text-center border-0 focus:ring-0 text-gray-900"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newItems = [...otcOrderForm.items];
                                      if (newItems[index].selectedQuantity < item.quantity) {
                                        newItems[index].selectedQuantity += 1;
                                        setOtcOrderForm({ ...otcOrderForm, items: newItems });
                                      }
                                    }}
                                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={otcOrderForm.paymentMethod}
                      onChange={(e) =>
                        setOtcOrderForm({ ...otcOrderForm, paymentMethod: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      required
                    >
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-base"
                  >
                    Process Order & Generate Invoice
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {!["Overview", "Vehicle Search", "Create Request", "Create Job Card", "Request Parts", "Issue Parts", "View Inventory", "Update Job Status", "Complete Job", "Generate Invoice", "Record Payment", "OTC Order"].includes(activeTab) && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">{activeTab}</h2>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                <p className="text-gray-500">This feature is coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Selection Popup */}
      {showVehiclePopup && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-black hover:text-gray-700"
              onClick={() => {
                setShowVehiclePopup(false);
                setVehicleSearchQuery("");
              }}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pr-8">Select Vehicle</h2>
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search by registration, VIN, name, or mobile number..."
                value={vehicleSearchQuery}
                onChange={(e) => setVehicleSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
              />
              <button
                onClick={() => setShowAddVehiclePopup(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Plus size={16} />
                Add New
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {vehicles
                .filter((v) => {
                  const normalizedQuery = normalizePhoneNumber(vehicleSearchQuery);
                  const normalizedVehiclePhone = normalizePhoneNumber(v.phone);
                  return (
                    v.registrationNumber.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                    v.customerName.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                    v.vin.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                    (normalizedVehiclePhone && normalizedVehiclePhone.includes(normalizedQuery))
                  );
                })
                .map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => {
                      setCreateRequestForm({ ...createRequestForm, vehicle: vehicle.id.toString() });
                      setShowVehiclePopup(false);
                      setVehicleSearchQuery("");
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="font-semibold text-black">{vehicle.registrationNumber}</p>
                    <p className="text-sm text-gray-600">{vehicle.make || ""} {vehicle.model} ({vehicle.year}) - {vehicle.customerName}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Add New Vehicle Popup */}
      {showAddVehiclePopup && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowAddVehiclePopup(false);
                setNewVehicleForm({
                  registrationNumber: "",
                  model: "",
                  year: "",
                  customerName: "",
                  phone: "",
                  vin: "",
                });
              }}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pr-8">Add New Vehicle</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newVehicle: any = {
                  id: vehicles.length + 1,
                  registrationNumber: newVehicleForm.registrationNumber,
                  make: "",
                  model: newVehicleForm.model,
                  year: parseInt(newVehicleForm.year),
                  customerName: newVehicleForm.customerName,
                  phone: newVehicleForm.phone,
                  email: "",
                  address: "",
                  vin: newVehicleForm.vin,
                  totalServices: 0,
                  lastServiceDate: "",
                  currentStatus: "Active",
                  activeJobCard: null,
                  nextServiceDate: "",
                };
                setVehicles([...vehicles, newVehicle]);
                setCreateRequestForm({ ...createRequestForm, vehicle: newVehicle.id.toString() });
                setShowAddVehiclePopup(false);
                setShowVehiclePopup(false);
                setNewVehicleForm({
                  registrationNumber: "",
                  model: "",
                  year: "",
                  customerName: "",
                  phone: "",
                  vin: "",
                });
                showToast("Vehicle added successfully!");
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input
                  type="text"
                  value={newVehicleForm.registrationNumber}
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, registrationNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  value={newVehicleForm.model}
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={newVehicleForm.year}
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={newVehicleForm.customerName}
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newVehicleForm.phone}
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
                <input
                  type="text"
                  value={newVehicleForm.vin}
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, vin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Add Vehicle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Engineer Search Popup */}
      {showEngineerPopup && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowEngineerPopup(false);
                setEngineerSearchQuery("");
              }}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pr-8">Search Engineer</h2>
            <input
              type="text"
              placeholder="Search engineers..."
              value={engineerSearchQuery}
              onChange={(e) => setEngineerSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 mb-4"
            />
            <div className="space-y-2">
              {center.staffMembers
                .filter((staff: any) => 
                  staff.role === "Technician" &&
                  (staff.name.toLowerCase().includes(engineerSearchQuery.toLowerCase()) ||
                   staff.email?.toLowerCase().includes(engineerSearchQuery.toLowerCase()))
                )
                .map((staff: any) => (
                  <div
                    key={staff.id}
                    onClick={() => {
                      setJobs(jobs.map((j: any) => j.id === (showEngineerPopup as any) ? { ...j, technician: staff.name } : j));
                      setShowEngineerPopup(false);
                      setEngineerSearchQuery("");
                      showToast("Engineer assigned successfully!");
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="font-semibold text-black">{staff.name}</p>
                    <p className="text-sm text-gray-600">{staff.email}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Part Search Popup */}
      {showPartPopup && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowPartPopup(false);
                setPartSearchQuery("");
              }}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pr-8">Search Part</h2>
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search parts..."
                value={partSearchQuery}
                onChange={(e) => setPartSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
              />
              <button
                onClick={() => {
                  setShowPartPopup(false);
                  setShowAddPartPopup(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Plus size={16} />
                Add Custom
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {partsData
                .filter((p) =>
                  p.name.toLowerCase().includes(partSearchQuery.toLowerCase())
                )
                .map((part) => (
                  <div
                    key={part.id}
                    onClick={() => {
                      setRequestPartsForm({ ...requestPartsForm, part: part.id.toString(), partName: part.name });
                      setShowPartPopup(false);
                      setPartSearchQuery("");
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="font-semibold text-black">{part.name}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Part Popup */}
      {showAddPartPopup && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowAddPartPopup(false);
                setNewPartForm({
                  partName: "",
                  sku: "",
                  category: "",
                  quantity: "",
                  price: "",
                });
              }}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pr-8">Add Custom Part</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newPart = {
                  id: partsData.length + 1,
                  name: newPartForm.partName,
                };
                setRequestPartsForm({ ...requestPartsForm, part: newPart.id.toString(), partName: newPart.name });
                setShowAddPartPopup(false);
                setNewPartForm({
                  partName: "",
                  sku: "",
                  category: "",
                  quantity: "",
                  price: "",
                });
                showToast("Custom part added successfully!");
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                <input
                  type="text"
                  value={newPartForm.partName}
                  onChange={(e) => setNewPartForm({ ...newPartForm, partName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Add Part
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Search Popup */}
      {showInvoiceSearchPopup && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowInvoiceSearchPopup(false);
                setInvoiceSearchQuery("");
              }}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pr-8">Search Job Card / Vehicle</h2>
            <input
              type="text"
              placeholder="Search by job card ID, vehicle registration, or customer name..."
              value={invoiceSearchQuery}
              onChange={(e) => setInvoiceSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 mb-4"
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {jobCardsForInvoice
                .filter((jc) =>
                  jc.id.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
                  jc.vehicle.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
                  jc.customerName.toLowerCase().includes(invoiceSearchQuery.toLowerCase())
                )
                .map((jobCard) => (
                  <div
                    key={jobCard.id}
                    onClick={() => {
                      setGenerateInvoiceForm({ ...generateInvoiceForm, jobCard: jobCard.id });
                      setShowInvoiceSearchPopup(false);
                      setInvoiceSearchQuery("");
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="font-semibold text-black">{jobCard.id}</p>
                    <p className="text-sm text-gray-600">{jobCard.vehicle} - {jobCard.customerName}</p>
                    <p className="text-sm text-gray-500">{jobCard.serviceType}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Add/Edit Popup */}
      {showInventoryAddEdit && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowInventoryAddEdit(false);
                setEditingInventoryItem(null);
                setInventoryForm({
                  partName: "",
                  sku: "",
                  partCode: "",
                  category: "",
                  quantity: "",
                  price: "",
                  status: "In Stock",
                });
              }}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pr-8">
              {editingInventoryItem ? "Edit Part" : "Add New Part"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingInventoryItem) {
                  setInventory(inventory.map(item =>
                    item.id === editingInventoryItem.id
                      ? {
                          ...item,
                          partName: inventoryForm.partName,
                          sku: inventoryForm.sku,
                          partCode: inventoryForm.partCode,
                          category: inventoryForm.category,
                          quantity: parseInt(inventoryForm.quantity),
                          price: `₹${inventoryForm.price}`,
                          status: inventoryForm.status,
                        }
                      : item
                  ));
                  showToast("Part updated successfully!");
                } else {
                  const newPart = {
                    id: inventory.length + 1,
                    partName: inventoryForm.partName,
                    sku: inventoryForm.sku,
                    partCode: inventoryForm.partCode,
                    category: inventoryForm.category,
                    quantity: parseInt(inventoryForm.quantity),
                    price: `₹${inventoryForm.price}`,
                    status: inventoryForm.status,
                  };
                  setInventory([...inventory, newPart]);
                  showToast("Part added successfully!");
                }
                setShowInventoryAddEdit(false);
                setEditingInventoryItem(null);
                setInventoryForm({
                  partName: "",
                  sku: "",
                  partCode: "",
                  category: "",
                  quantity: "",
                  price: "",
                  status: "In Stock",
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                <input
                  type="text"
                  value={inventoryForm.partName}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, partName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={inventoryForm.sku}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part Code</label>
                <input
                  type="text"
                  value={inventoryForm.partCode}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, partCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  placeholder="Enter part code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={inventoryForm.category}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={inventoryForm.quantity}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  value={inventoryForm.price}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={inventoryForm.status}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  required
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                {editingInventoryItem ? "Update Part" : "Add Part"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}