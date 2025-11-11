"use client";

import { useState } from "react";
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
  { name: "Approve Request", icon: CheckCircle },
  { name: "Create Job Card", icon: FileText },
  { name: "Assign Engineer", icon: User },
  { name: "Update Job Status", icon: RefreshCw },
  { name: "Complete Job", icon: CheckCircle2 },
  { name: "View Inventory", icon: Package },
  { name: "Request Parts", icon: ShoppingCart },
  { name: "Issue Parts", icon: Package2 },
  { name: "OTC Order", icon: ShoppingBag },
  { name: "Generate Invoice", icon: Receipt },
  { name: "Record Payment", icon: CreditCard },
];

// Sample data for vehicles
const vehiclesData = [
  {
    id: 1,
    registrationNumber: "DL-01-AB-1234",
    model: "Honda City",
    year: 2020,
    customerName: "Rohit Shah",
    phone: "+91-9876-543-210",
    vin: "MBJC123456789012A",
  },
  {
    id: 2,
    registrationNumber: "DL-01-CD-5678",
    model: "Maruti Swift",
    year: 2021,
    customerName: "Priya Sharma",
    phone: "+91-9876-543-211",
    vin: "MBJC123456789012B",
  },
  {
    id: 3,
    registrationNumber: "DL-01-EF-9012",
    model: "Hyundai i20",
    year: 2019,
    customerName: "Amit Kumar",
    phone: "+91-9876-543-212",
    vin: "MBJC123456789012C",
  },
];

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

// Sample data for approved requests (for job card creation)
const approvedRequestsData = [
  {
    id: "SR001",
    vehicle: "DL-01-AB-1234",
    customerName: "Rohit Shah",
    serviceType: "Full Service",
  },
];

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
  },
  {
    id: "JC002",
    vehicle: "DL-01-AB-1234",
    customerName: "Rohit Shah",
    technician: "Technician Priya",
    status: "Not Started",
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

// Sample job cards for invoice generation
const jobCardsForInvoice = [
  {
    id: "JC001",
    vehicle: "DL-01-AB-1234",
    customerName: "Rohit Shah",
    serviceType: "Full Service",
  },
  {
    id: "JC002",
    vehicle: "DL-01-CD-5678",
    customerName: "Priya Nair",
    serviceType: "Repair",
  },
];

export default function ServiceCenterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicles, setVehicles] = useState(vehiclesData);
  const [serviceRequests, setServiceRequests] = useState(serviceRequestsData);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Form states
  const [createRequestForm, setCreateRequestForm] = useState({
    vehicle: "",
    serviceType: "",
    description: "",
    estimatedCost: "",
  });
  
  const [jobCardForm, setJobCardForm] = useState({
    approvedRequest: "",
    technician: "",
    completionDate: "",
    laborCost: "",
    partsCost: "",
  });
  
  const [partRequests, setPartRequests] = useState(partRequestsData);
  const [inventory, setInventory] = useState(inventoryData);
  const [jobs, setJobs] = useState(jobsData);
  
  const [requestPartsForm, setRequestPartsForm] = useState({
    part: "",
    quantity: "",
    reason: "Low Stock",
    notes: "",
  });
  
  const [generateInvoiceForm, setGenerateInvoiceForm] = useState({
    jobCard: "",
    invoiceNumber: "Auto-generated",
    tax: "18",
    discount: "0",
  });
  
  const [recordPaymentForm, setRecordPaymentForm] = useState({
    invoice: "",
    paymentMethod: "Cash",
    amountPaid: "",
  });
  
  const [otcOrderForm, setOtcOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    items: inventoryData.map((item) => ({ ...item, selectedQuantity: 0 })),
    paymentMethod: "Cash",
  });

  // Compute center data directly from params
  const centerId = parseInt(params.id);
  const center = centersData[centerId];

  if (!center) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Service center not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
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
                    {center.staffMembers.map((staff) => (
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
                  placeholder="Search by registration number or VIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 text-base"
                />
              </div>
              <div className="space-y-4">
                {vehicles
                  .filter(
                    (vehicle) =>
                      vehicle.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      vehicle.customerName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 break-words">
                            {vehicle.registrationNumber}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 mb-3">
                            {vehicle.model} ({vehicle.year})
                          </p>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p>
                              Customer: <span className="font-semibold">{vehicle.customerName}</span>
                            </p>
                            <p>
                              Phone: <span className="font-semibold break-all">{vehicle.phone}</span>
                            </p>
                            <p className="break-all">VIN: {vehicle.vin}</p>
                          </div>
                        </div>
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition w-full lg:w-auto lg:ml-4 whitespace-nowrap">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Approve Request */}
          {activeTab === "Approve Request" && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle size={24} className="text-green-600" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Approve Service Requests</h2>
              </div>
              <div className="space-y-4">
                {serviceRequests
                  .filter((req) => req.status === "Pending")
                  .map((request) => (
                    <div
                      key={request.id}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">{request.id}</h3>
                          <div className="text-sm text-gray-700 space-y-2">
                            <p>
                              Vehicle: <span className="font-semibold break-words">{request.vehicle} - {request.customerName}</span>
                            </p>
                            <p>
                              Service Type: <span className="font-semibold">{request.serviceType}</span>
                            </p>
                            <p className="break-words">Description: {request.description}</p>
                            <p>
                              Estimated Cost: <span className="font-semibold">{request.estimatedCost}</span>
                            </p>
                            <p>Requested: {request.requestedDate}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:ml-4 w-full lg:w-auto">
                          <button
                            onClick={() => {
                              setServiceRequests(
                                serviceRequests.map((req) =>
                                  req.id === request.id ? { ...req, status: "Approved" } : req
                                )
                              );
                              alert("Request approved!");
                            }}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-green-700 transition whitespace-nowrap flex-1"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => {
                              setServiceRequests(
                                serviceRequests.map((req) =>
                                  req.id === request.id ? { ...req, status: "Rejected" } : req
                                )
                              );
                              alert("Request rejected!");
                            }}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-red-700 transition whitespace-nowrap flex-1"
                          >
                            X Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
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
                    alert("Service request created successfully!");
                    setCreateRequestForm({ vehicle: "", serviceType: "", description: "", estimatedCost: "" });
                  }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Vehicle
                    </label>
                    <select
                      value={createRequestForm.vehicle}
                      onChange={(e) =>
                        setCreateRequestForm({ ...createRequestForm, vehicle: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      required
                    >
                      <option value="">-- Select Vehicle --</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.registrationNumber} - {vehicle.customerName}
                        </option>
                      ))}
                    </select>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <div className="flex items-center gap-2 mb-6">
                <ClipboardList size={24} className="text-orange-600" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Create Job Card</h2>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Job card created successfully!");
                    setJobCardForm({
                      approvedRequest: "",
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
                      Select Approved Request
                    </label>
                    <select
                      value={jobCardForm.approvedRequest}
                      onChange={(e) =>
                        setJobCardForm({ ...jobCardForm, approvedRequest: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      required
                    >
                      <option value="">-- Select Request --</option>
                      {approvedRequestsData.map((request) => (
                        <option key={request.id} value={request.id}>
                          {request.id} - {request.vehicle} - {request.customerName}
                        </option>
                      ))}
                    </select>
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
                        .filter((staff) => staff.role === "Technician")
                        .map((staff) => (
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
                    alert("Part request submitted successfully!");
                    setRequestPartsForm({ part: "", quantity: "", reason: "Low Stock", notes: "" });
                  }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Part
                    </label>
                    <select
                      value={requestPartsForm.part}
                      onChange={(e) =>
                        setRequestPartsForm({ ...requestPartsForm, part: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      required
                    >
                      <option value="">-- Select Part --</option>
                      {partsData.map((part) => (
                        <option key={part.id} value={part.id}>
                          {part.name}
                        </option>
                      ))}
                    </select>
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
                              alert("Parts issued successfully!");
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
                              alert("Request rejected!");
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
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 w-full sm:w-auto order-first sm:order-last">
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
                      {inventory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900 break-words">{item.partName}</div>
                            <div className="text-xs text-gray-500 md:hidden mt-1">{item.category}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.sku}
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
                            <button className="text-blue-600 hover:text-blue-800 font-medium">
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

          {/* Assign Engineer */}
          {activeTab === "Assign Engineer" && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <User size={24} className="text-gray-600" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Assign Engineer to Job</h2>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Available Technicians */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Available Technicians</h3>
                  <div className="space-y-3">
                    {center.staffMembers
                      .filter((staff) => staff.role === "Technician")
                      .map((staff) => (
                        <div
                          key={staff.id}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                        >
                          <h4 className="text-base font-semibold text-gray-800">{staff.name}</h4>
                          <p className="text-sm text-gray-600">{staff.role}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Pending Jobs */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Pending Jobs</h3>
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6"
                      >
                        <h4 className="text-lg font-bold text-gray-800 mb-3">{job.id}</h4>
                        <div className="text-sm text-gray-700 space-y-2 mb-4">
                          <p>
                            Vehicle: <span className="font-semibold break-words">{job.vehicle} - {job.customerName}</span>
                          </p>
                          <p>
                            Current Assignee: <span className="font-semibold">{job.technician}</span>
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reassign to
                          </label>
                          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900">
                            <option value="">-- Reassign to --</option>
                            {center.staffMembers
                              .filter((staff) => staff.role === "Technician")
                              .map((staff) => (
                                <option key={staff.id} value={staff.id}>
                                  {staff.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
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
                        onChange={(e) => {
                          setJobs(
                            jobs.map((j) =>
                              j.id === job.id ? { ...j, status: e.target.value } : j
                            )
                          );
                          alert("Job status updated!");
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      >
                        <option value="">-- Select Status --</option>
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
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                <p className="text-gray-500">No completed jobs</p>
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
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Invoice generated and sent successfully!");
                    setGenerateInvoiceForm({
                      jobCard: "",
                      invoiceNumber: "Auto-generated",
                      tax: "18",
                      discount: "0",
                    });
                  }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Job Card
                    </label>
                    <select
                      value={generateInvoiceForm.jobCard}
                      onChange={(e) =>
                        setGenerateInvoiceForm({ ...generateInvoiceForm, jobCard: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                      required
                    >
                      <option value="">-- Select Job --</option>
                      {jobCardsForInvoice.map((jobCard) => (
                        <option key={jobCard.id} value={jobCard.id}>
                          {jobCard.id} - {jobCard.vehicle} - {jobCard.customerName}
                        </option>
                      ))}
                    </select>
                  </div>

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
                    {invoicesData.length > 0 ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Invoice Number</p>
                          <p className="text-lg font-bold text-gray-800">{invoicesData[0].id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="text-base font-semibold text-gray-800">{invoicesData[0].customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="text-lg font-bold text-gray-800">{invoicesData[0].amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="text-base text-gray-800">{invoicesData[0].date}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Due Date</p>
                          <p className="text-base text-gray-800">{invoicesData[0].dueDate}</p>
                        </div>
                        <div>
                          <span
                            className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${
                              invoicesData[0].status === "Pending"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {invoicesData[0].status}
                          </span>
                        </div>
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
                        alert("Payment recorded successfully!");
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

          {/* OTC Order */}
          {activeTab === "OTC Order" && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag size={24} className="text-purple-600" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">OTC Order Processing</h2>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Order processed and invoice generated successfully!");
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
                        {otcOrderForm.items.map((item, index) => (
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
          {!["Overview", "Vehicle Search", "Create Request", "Approve Request", "Create Job Card", "Request Parts", "Issue Parts", "View Inventory", "Assign Engineer", "Update Job Status", "Complete Job", "Generate Invoice", "Record Payment", "OTC Order"].includes(activeTab) && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">{activeTab}</h2>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                <p className="text-gray-500">This feature is coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}