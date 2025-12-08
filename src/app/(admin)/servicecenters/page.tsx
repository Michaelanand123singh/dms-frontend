"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, X, Edit } from "lucide-react";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { defaultServiceCenters, availableServiceTypes } from "@/__mocks__/data/service-centers.mock";

// Types
interface ServiceCenter {
  id: number;
  name: string;
  location: string;
  pinCode?: string;
  staff: number;
  jobs: number;
  revenue: string;
  status: "Active" | "Inactive";
  rating: number;
}

interface ServiceCenterForm {
  // Basic Details
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  email: string;
  // Operational Config
  capacity: string;
  technicianCount: string;
  serviceRadius: string;
  homeServiceEnabled: boolean;
  maxAppointmentsPerDay: string;
  // Financial Setup
  invoicePrefix: string;
  bankName: string;
  bankAccount: string;
  bankIFSC: string;
  gstNumber: string;
  panNumber: string;
  // Service Capabilities
  serviceTypes: string[];
  // Status
  status: "Active" | "Inactive";
}

export default function ServiceCentersPage() {
  const router = useRouter();
  // Initialize with mock data, but allow updates from localStorage
  const [centers, setCenters] = useState<ServiceCenter[]>(() => {
    if (typeof window !== "undefined") {
      const storedCenters = safeStorage.getItem<ServiceCenter[]>("serviceCentersList", []);
      if (storedCenters.length > 0) {
        return storedCenters;
      }
    }
    // Convert mock data to ServiceCenter format
    return defaultServiceCenters.map((center) => ({
      id: center.id,
      name: center.name,
      location: center.location,
      staff: center.staff,
      jobs: center.jobs,
      revenue: center.revenue,
      status: center.status,
      rating: center.rating,
    }));
  });

  const [showForm, setShowForm] = useState(false);
  const [editingCenter, setEditingCenter] = useState<ServiceCenter | null>(null);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<ServiceCenterForm>({
    // Basic Details
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
    email: "",
    // Operational Config
    capacity: "",
    technicianCount: "",
    serviceRadius: "",
    homeServiceEnabled: false,
    maxAppointmentsPerDay: "",
    // Financial Setup
    invoicePrefix: "",
    bankName: "",
    bankAccount: "",
    bankIFSC: "",
    gstNumber: "",
    panNumber: "",
    // Service Capabilities
    serviceTypes: [],
    // Status
    status: "Active",
  });

  // Use service types from mock data
  const serviceTypesList = availableServiceTypes;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim() || !form.pinCode.trim()) {
      alert("Please fill all required fields!");
      return;
    }

    // Construct location string from address, city, state
    const location = `${form.address}, ${form.city}, ${form.state}`;

    if (editingCenter) {
      // Update existing center
      const updatedCenters = centers.map(center =>
        center.id === editingCenter.id
          ? {
              ...center,
              name: form.name,
              location: location,
              pinCode: form.pinCode,
              staff: Number(form.technicianCount) || 0,
              jobs: center.jobs, // Keep existing jobs count
              status: form.status,
            }
          : center
      );
      setCenters(updatedCenters);
      
      // Update in localStorage
      const storedCenters = safeStorage.getItem<Record<string, ServiceCenter>>('serviceCenters', {});
      const updatedCenter = updatedCenters.find(c => c.id === editingCenter.id);
      if (updatedCenter && storedCenters[editingCenter.id]) {
        storedCenters[editingCenter.id] = {
          ...storedCenters[editingCenter.id],
          // Store full form data
          ...form,
          location: location,
          pinCode: updatedCenter.pinCode,
          staff: updatedCenter.staff,
          jobs: updatedCenter.jobs,
        };
        safeStorage.setItem('serviceCenters', storedCenters);
      }
      
      alert("Service center updated successfully!");
    } else {
      // Create new center
      const newCenter: ServiceCenter = {
        id: centers.length > 0 ? Math.max(...centers.map(c => c.id)) + 1 : 1,
        name: form.name,
        location: location,
        pinCode: form.pinCode || undefined,
        staff: Number(form.technicianCount) || 0,
        jobs: 0,
        revenue: "₹0.0L",
        status: form.status,
        rating: 4.5,
      };

      setCenters([...centers, newCenter]);
      
      // Store in localStorage for detail page access
      const centerDetailData = {
        id: newCenter.id,
        location: location,
        staff: newCenter.staff,
        jobs: newCenter.jobs,
        revenue: newCenter.revenue,
        rating: newCenter.rating,
        staffMembers: [], // Empty staff members for new center
        // Store full form data (includes name, status, pinCode, and other form fields)
        ...form,
      };
      
      const storedCenters = safeStorage.getItem<Record<string, ServiceCenter>>('serviceCenters', {});
      storedCenters[newCenter.id] = centerDetailData;
      safeStorage.setItem('serviceCenters', storedCenters);
      
      alert("Service center created successfully!");
    }

    // Reset form
    setForm({
      name: "",
      code: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      phone: "",
      email: "",
      capacity: "",
      technicianCount: "",
      serviceRadius: "",
      homeServiceEnabled: false,
      maxAppointmentsPerDay: "",
      invoicePrefix: "",
      bankName: "",
      bankAccount: "",
      bankIFSC: "",
      gstNumber: "",
      panNumber: "",
      serviceTypes: [],
      status: "Active",
    });
    setActiveStep(1);
    setEditingCenter(null);
    setShowForm(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Service Centers</h1>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {centers.map((center) => (
          <div
            key={center.id}
            onClick={() => router.push(`/servicecenters/${center.id}`)}
            className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <h2 
                  className="text-base sm:text-lg font-semibold text-gray-800 break-words hover:text-blue-600 flex-1"
                >
                  {center.name}
                </h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCenter(center);
                    // Try to load full form data from localStorage
                    const storedCenters = safeStorage.getItem<Record<string, ServiceCenter & Partial<ServiceCenterForm>>>('serviceCenters', {});
                    const storedCenter = storedCenters[center.id];
                    
                    if (storedCenter && storedCenter.address) {
                      // Use stored full data
                      setForm({
                        name: storedCenter.name || center.name,
                        code: storedCenter.code || "",
                        address: storedCenter.address || center.location,
                        city: storedCenter.city || "",
                        state: storedCenter.state || "",
                        pinCode: storedCenter.pinCode || center.pinCode || "",
                        phone: storedCenter.phone || "",
                        email: storedCenter.email || "",
                        capacity: storedCenter.capacity?.toString() || "",
                        technicianCount: storedCenter.technicianCount?.toString() || center.staff.toString(),
                        serviceRadius: storedCenter.serviceRadius?.toString() || "",
                        homeServiceEnabled: storedCenter.homeServiceEnabled || false,
                        maxAppointmentsPerDay: storedCenter.maxAppointmentsPerDay?.toString() || "",
                        invoicePrefix: storedCenter.invoicePrefix || "",
                        bankName: storedCenter.bankName || "",
                        bankAccount: storedCenter.bankAccount || "",
                        bankIFSC: storedCenter.bankIFSC || "",
                        gstNumber: storedCenter.gstNumber || "",
                        panNumber: storedCenter.panNumber || "",
                        serviceTypes: storedCenter.serviceTypes || [],
                        status: storedCenter.status || center.status,
                      });
                    } else {
                      // Fallback to basic data
                      const locationParts = center.location.split(', ');
                      setForm({
                        name: center.name,
                        code: "",
                        address: locationParts[0] || center.location,
                        city: locationParts[1] || "",
                        state: locationParts[2] || "",
                        pinCode: center.pinCode || "",
                        phone: "",
                        email: "",
                        capacity: "",
                        technicianCount: center.staff.toString(),
                        serviceRadius: "",
                        homeServiceEnabled: false,
                        maxAppointmentsPerDay: "",
                        invoicePrefix: "",
                        bankName: "",
                        bankAccount: "",
                        bankIFSC: "",
                        gstNumber: "",
                        panNumber: "",
                        serviceTypes: [],
                        status: center.status,
                      });
                    }
                    setActiveStep(1);
                    setShowForm(true);
                  }}
                  className="ml-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Edit Service Center"
                >
                  <Edit size={16} />
                </button>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3 break-words">{center.location}</p>
              {center.pinCode && (
                <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">
                  Pin Code: <span className="font-medium text-gray-700">{center.pinCode}</span>
                </p>
              )}

              <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                <p className="flex justify-between">
                  <span>Staff</span>
                  <span className="font-medium ml-2">{center.staff}</span>
                </p>
                <p className="flex justify-between">
                  <span>Active Jobs</span>
                  <span className="font-medium ml-2">{center.jobs}</span>
                </p>
                <p className="flex justify-between">
                  <span>Revenue</span>
                  <span className="font-semibold ml-2">{center.revenue}</span>
                </p>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 flex items-center justify-between">
              <span
                className={`text-xs font-medium px-2 sm:px-3 py-1 rounded-full ${
                  center.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {center.status}
              </span>

              <div className="flex items-center text-yellow-500 text-xs sm:text-sm">
                <Star size={12} className="sm:w-3.5 sm:h-3.5" fill="gold" stroke="gold" />
                <span className="ml-1">{center.rating}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Add Center Card */}
        <div
          onClick={() => setShowForm(true)}
          className="bg-white border-2 border-dashed border-indigo-300 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-500 transition p-4 sm:p-5 flex flex-col items-center justify-center cursor-pointer min-h-[180px] sm:min-h-[200px]"
        >
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <span className="text-xl sm:text-2xl font-bold text-indigo-600">+</span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Add New Center</h2>
            <p className="text-gray-500 text-xs sm:text-sm px-2">Click to add a new service center</p>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
              onClick={() => {
                setShowForm(false);
                setEditingCenter(null);
                setActiveStep(1);
                setForm({
                  name: "",
                  code: "",
                  address: "",
                  city: "",
                  state: "",
                  pinCode: "",
                  phone: "",
                  email: "",
                  capacity: "",
                  technicianCount: "",
                  serviceRadius: "",
                  homeServiceEnabled: false,
                  maxAppointmentsPerDay: "",
                  invoicePrefix: "",
                  bankName: "",
                  bankAccount: "",
                  bankIFSC: "",
                  gstNumber: "",
                  panNumber: "",
                  serviceTypes: [],
                  status: "Active",
                });
              }}
            >
              <X size={18} />
            </button>

            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 pr-8">
              {editingCenter ? "Edit Service Center" : "Add New Center"}
            </h2>

            {/* Step Indicator */}
            <div className="mb-6 flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      activeStep === step
                        ? "bg-indigo-600 text-white"
                        : activeStep > step
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {activeStep > step ? "✓" : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        activeStep > step ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mb-4 text-xs text-gray-600 text-center">
              {activeStep === 1 && "Basic Details"}
              {activeStep === 2 && "Operational Config"}
              {activeStep === 3 && "Financial Setup"}
              {activeStep === 4 && "Service Capabilities"}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Step 1: Basic Details */}
              {activeStep === 1 && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Center Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Center Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., SC001"
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      rows={2}
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Pin Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.pinCode}
                      onChange={(e) => setForm({ ...form, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      placeholder="Enter 6-digit pin code"
                      maxLength={6}
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Operational Config */}
              {activeStep === 2 && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Capacity (Max Concurrent Jobs)</label>
                    <input
                      type="number"
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      placeholder="e.g., 50"
                      min="1"
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Technician Count</label>
                    <input
                      type="number"
                      value={form.technicianCount}
                      onChange={(e) => setForm({ ...form, technicianCount: e.target.value })}
                      placeholder="e.g., 10"
                      min="0"
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Service Radius (km)</label>
                    <input
                      type="number"
                      value={form.serviceRadius}
                      onChange={(e) => setForm({ ...form, serviceRadius: e.target.value })}
                      placeholder="e.g., 25"
                      min="0"
                      step="0.1"
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Max Appointments Per Day</label>
                    <input
                      type="number"
                      value={form.maxAppointmentsPerDay}
                      onChange={(e) => setForm({ ...form, maxAppointmentsPerDay: e.target.value })}
                      placeholder="e.g., 20"
                      min="1"
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum number of appointments that can be scheduled per day</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="homeService"
                      checked={form.homeServiceEnabled}
                      onChange={(e) => setForm({ ...form, homeServiceEnabled: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="homeService" className="text-sm font-medium text-gray-600">
                      Enable Home Service
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Financial Setup */}
              {activeStep === 3 && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Invoice Prefix</label>
                    <input
                      type="text"
                      value={form.invoicePrefix}
                      onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })}
                      placeholder="e.g., SC001-INV-"
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Bank Name</label>
                    <input
                      type="text"
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Bank Account Number</label>
                    <input
                      type="text"
                      value={form.bankAccount}
                      onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Bank IFSC Code</label>
                    <input
                      type="text"
                      value={form.bankIFSC}
                      onChange={(e) => setForm({ ...form, bankIFSC: e.target.value.toUpperCase() })}
                      placeholder="e.g., HDFC0001234"
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">GST Number</label>
                      <input
                        type="text"
                        value={form.gstNumber}
                        onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })}
                        placeholder="e.g., 27AAAAA0000A1Z5"
                        className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">PAN Number</label>
                      <input
                        type="text"
                        value={form.panNumber}
                        onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                        placeholder="e.g., ABCDE1234F"
                        maxLength={10}
                        className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Service Capabilities */}
              {activeStep === 4 && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Service Types</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                      {serviceTypesList.map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.serviceTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({ ...form, serviceTypes: [...form.serviceTypes, type] });
                              } else {
                                setForm({ ...form, serviceTypes: form.serviceTypes.filter((t) => t !== type) });
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as "Active" | "Inactive" })}
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    if (activeStep > 1) {
                      setActiveStep((activeStep - 1) as 1 | 2 | 3 | 4);
                    } else {
                      setShowForm(false);
                      setEditingCenter(null);
                      setForm({
                        name: "",
                        code: "",
                        address: "",
                        city: "",
                        state: "",
                        pinCode: "",
                        phone: "",
                        email: "",
                        capacity: "",
                        technicianCount: "",
                        serviceRadius: "",
                        homeServiceEnabled: false,
                        maxAppointmentsPerDay: "",
                        invoicePrefix: "",
                        bankName: "",
                        bankAccount: "",
                        bankIFSC: "",
                        gstNumber: "",
                        panNumber: "",
                        serviceTypes: [],
                        status: "Active",
                      });
                      setActiveStep(1);
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition"
                >
                  {activeStep === 1 ? "Cancel" : "Previous"}
                </button>
                {activeStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      // Basic validation
                      if (activeStep === 1 && (!form.name || !form.code || !form.address || !form.city || !form.state || !form.pinCode)) {
                        alert("Please fill all required fields in Basic Details");
                        return;
                      }
                      setActiveStep((activeStep + 1) as 1 | 2 | 3 | 4);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition"
                  >
                    {editingCenter ? "Update Center" : "Create Center"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

