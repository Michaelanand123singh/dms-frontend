"use client";
import { useState } from "react";
import {
  Truck,
  MapPin,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Phone,
  Navigation,
  Wrench,
  FileText,
  PlusCircle,
  X,
} from "lucide-react";
import type { HomeService, HomeServiceStatus, HomeServiceStats, HomeServiceFilterType } from "@/shared/types";

export default function HomeService() {
  const [filter, setFilter] = useState<HomeServiceFilterType>("all");
  const [selectedService, setSelectedService] = useState<HomeService | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [scheduleForm, setScheduleForm] = useState({
    customerName: "",
    phone: "",
    vehicle: "",
    registration: "",
    address: "",
    serviceType: "",
    scheduledDate: "",
    scheduledTime: "",
    engineer: "",
    estimatedCost: "",
  });

  // Mock home service data
  const [homeServices, setHomeServices] = useState<HomeService[]>([
    {
      id: "HS-2025-001",
      customerName: "Rajesh Kumar",
      phone: "9876543210",
      vehicle: "Honda City 2020",
      registration: "PB10AB1234",
      address: "123 Main Street, Sector 5, Pune",
      serviceType: "Routine Maintenance",
      scheduledDate: "2025-01-20",
      scheduledTime: "10:00 AM",
      engineer: "Engineer 1",
      status: "Scheduled",
      estimatedCost: "₹3,500",
      createdAt: "2025-01-15 09:30",
    },
    {
      id: "HS-2025-002",
      customerName: "Priya Sharma",
      phone: "9876543211",
      vehicle: "Maruti Swift 2019",
      registration: "MH01XY5678",
      address: "456 Park Avenue, Bandra West, Mumbai",
      serviceType: "AC Repair",
      scheduledDate: "2025-01-18",
      scheduledTime: "2:00 PM",
      engineer: "Engineer 2",
      status: "In Progress",
      estimatedCost: "₹4,200",
      startTime: "2025-01-18 14:15",
      createdAt: "2025-01-15 11:15",
    },
    {
      id: "HS-2025-003",
      customerName: "Amit Patel",
      phone: "9876543212",
      vehicle: "Hyundai i20 2021",
      registration: "DL05CD9012",
      address: "789 MG Road, Connaught Place, Delhi",
      serviceType: "Oil Change",
      scheduledDate: "2025-01-19",
      scheduledTime: "11:00 AM",
      engineer: "Engineer 3",
      status: "Completed",
      estimatedCost: "₹1,500",
      completedAt: "2025-01-19 11:45",
      createdAt: "2025-01-15 14:20",
    },
  ]);

  const filteredServices = homeServices.filter((service) => {
    if (filter === "all") return true;
    return service.status.toLowerCase().replace(" ", "_") === filter;
  });

  const getStatusColor = (status: HomeServiceStatus): string => {
    const colors: Record<HomeServiceStatus, string> = {
      Scheduled: "bg-blue-100 text-blue-700 border-blue-300",
      "In Progress": "bg-yellow-100 text-yellow-700 border-yellow-300",
      Completed: "bg-green-100 text-green-700 border-green-300",
      Cancelled: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status] || colors.Scheduled;
  };

  const stats: HomeServiceStats = {
    scheduled: homeServices.filter((s) => s.status === "Scheduled").length,
    inProgress: homeServices.filter((s) => s.status === "In Progress").length,
    completed: homeServices.filter((s) => s.status === "Completed").length,
    total: homeServices.length,
  };

  const handleScheduleSubmit = () => {
    // Validate form
    if (
      !scheduleForm.customerName ||
      !scheduleForm.phone ||
      !scheduleForm.vehicle ||
      !scheduleForm.registration ||
      !scheduleForm.address ||
      !scheduleForm.serviceType ||
      !scheduleForm.scheduledDate ||
      !scheduleForm.scheduledTime ||
      !scheduleForm.engineer ||
      !scheduleForm.estimatedCost
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(scheduleForm.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    // Generate new service ID
    const newId = `HS-2025-${String(homeServices.length + 1).padStart(3, "0")}`;

    // Create new home service
    const newService: HomeService = {
      id: newId,
      customerName: scheduleForm.customerName,
      phone: scheduleForm.phone,
      vehicle: scheduleForm.vehicle,
      registration: scheduleForm.registration,
      address: scheduleForm.address,
      serviceType: scheduleForm.serviceType,
      scheduledDate: scheduleForm.scheduledDate,
      scheduledTime: scheduleForm.scheduledTime,
      engineer: scheduleForm.engineer,
      status: "Scheduled",
      estimatedCost: scheduleForm.estimatedCost,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };

    // Add to services list
    setHomeServices([...homeServices, newService]);

    // Store in localStorage (simulating API call)
    const storedServices = JSON.parse(localStorage.getItem("homeServices") || "[]");
    storedServices.push(newService);
    localStorage.setItem("homeServices", JSON.stringify(storedServices));

    // Reset form and close modal
    setScheduleForm({
      customerName: "",
      phone: "",
      vehicle: "",
      registration: "",
      address: "",
      serviceType: "",
      scheduledDate: "",
      scheduledTime: "",
      engineer: "",
      estimatedCost: "",
    });
    setShowScheduleModal(false);

    alert(`Home service scheduled successfully! Service ID: ${newId}`);
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Home Service</h1>
            <p className="text-gray-500">Manage mobile service appointments and track engineers</p>
          </div>
          <button
            onClick={() => {
              setShowScheduleModal(true);
              setScheduleForm({
                customerName: "",
                phone: "",
                vehicle: "",
                registration: "",
                address: "",
                serviceType: "",
                scheduledDate: "",
                scheduledTime: "",
                engineer: "",
                estimatedCost: "",
              });
            }}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Schedule Home Service
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Calendar size={24} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{stats.scheduled}</h2>
            <p className="text-sm text-gray-600">Scheduled</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                <Wrench size={24} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{stats.inProgress}</h2>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <CheckCircle size={24} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{stats.completed}</h2>
            <p className="text-sm text-gray-600">Completed</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <Truck size={24} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{stats.total}</h2>
            <p className="text-sm text-gray-600">Total Services</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex gap-2">
            {(["all", "scheduled", "in_progress", "completed"] as HomeServiceFilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f === "all"
                  ? "All"
                  : f === "in_progress"
                  ? "In Progress"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {service.id}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        service.status
                      )}`}
                    >
                      {service.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User size={18} className="text-gray-400" />
                      <span className="font-medium">{service.customerName}</span>
                      <span className="text-gray-500">• {service.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Truck size={18} className="text-gray-400" />
                      <span>{service.vehicle}</span>
                      <span className="text-gray-500">• {service.registration}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-700">
                      <MapPin size={18} className="text-gray-400 mt-1" />
                      <span className="text-sm">{service.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={18} className="text-gray-400" />
                      <span>
                        {service.scheduledDate} at {service.scheduledTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      Service: <span className="font-medium text-gray-700">{service.serviceType}</span>
                    </span>
                    <span className="text-gray-500">
                      Engineer: <span className="font-medium text-gray-700">{service.engineer}</span>
                    </span>
                    <span className="text-gray-500">
                      Estimated: <span className="font-medium text-gray-700">{service.estimatedCost}</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:items-end">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setShowDetails(true);
                      }}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition inline-flex items-center gap-2"
                    >
                      <FileText size={16} />
                      View Details
                    </button>
                    {service.status === "Scheduled" && (
                      <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
                        Dispatch Engineer
                      </button>
                    )}
                    {service.status === "In Progress" && (
                      <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
                        Track Location
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Truck className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Home Services Found</h3>
            <p className="text-gray-500">No services match the current filter criteria.</p>
          </div>
        )}
      </div>

      {/* Service Details Modal */}
      {showDetails && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Home Service Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold">
                  {selectedService.id}
                </span>
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(
                    selectedService.status
                  )}`}
                >
                  {selectedService.status}
                </span>
              </div>

              {/* Customer & Vehicle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-blue-800 mb-2">Customer Information</h3>
                  <p className="text-sm text-gray-700">{selectedService.customerName}</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedService.phone}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-green-800 mb-2">Vehicle Information</h3>
                  <p className="text-sm text-gray-700">{selectedService.vehicle}</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedService.registration}</p>
                </div>
              </div>

              {/* Service Location */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <MapPin className="text-red-600" size={20} />
                  Service Location
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedService.address}</p>
                  <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                    <Navigation size={14} />
                    Open in Maps
                  </button>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Schedule</h3>
                <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-800">{selectedService.scheduledDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-800">{selectedService.scheduledTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Engineer</p>
                    <p className="font-medium text-gray-800">{selectedService.engineer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Cost</p>
                    <p className="font-medium text-gray-800">{selectedService.estimatedCost}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Close
                </button>
                {selectedService.status === "Scheduled" && (
                  <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition">
                    Dispatch Engineer
                  </button>
                )}
                {selectedService.status === "In Progress" && (
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition">
                    Track Engineer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Home Service Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-3xl mx-2 max-h-[90vh] overflow-y-auto p-4 md:p-6 z-[101]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Schedule Home Service</h2>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setScheduleForm({
                    customerName: "",
                    phone: "",
                    vehicle: "",
                    registration: "",
                    address: "",
                    serviceType: "",
                    scheduledDate: "",
                    scheduledTime: "",
                    engineer: "",
                    estimatedCost: "",
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.customerName}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, customerName: e.target.value })}
                      placeholder="Enter customer name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={scheduleForm.phone}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, phone: e.target.value })}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.vehicle}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, vehicle: e.target.value })}
                      placeholder="e.g., Honda City 2020"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.registration}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, registration: e.target.value.toUpperCase() })}
                      placeholder="PB10AB1234"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={scheduleForm.address}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, address: e.target.value })}
                      placeholder="Enter complete service address"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={scheduleForm.serviceType}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, serviceType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      >
                        <option value="">Select service type</option>
                        <option value="Routine Maintenance">Routine Maintenance</option>
                        <option value="AC Repair">AC Repair</option>
                        <option value="Oil Change">Oil Change</option>
                        <option value="Battery Replacement">Battery Replacement</option>
                        <option value="Tire Service">Tire Service</option>
                        <option value="Brake Service">Brake Service</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Cost <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={scheduleForm.estimatedCost}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, estimatedCost: e.target.value })}
                        placeholder="₹3,500"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={scheduleForm.scheduledDate}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.scheduledTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Engineer <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={scheduleForm.engineer}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, engineer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    >
                      <option value="">Select engineer</option>
                      <option value="Engineer 1">Engineer 1</option>
                      <option value="Engineer 2">Engineer 2</option>
                      <option value="Engineer 3">Engineer 3</option>
                      <option value="Engineer 4">Engineer 4</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setScheduleForm({
                      customerName: "",
                      phone: "",
                      vehicle: "",
                      registration: "",
                      address: "",
                      serviceType: "",
                      scheduledDate: "",
                      scheduledTime: "",
                      engineer: "",
                      estimatedCost: "",
                    });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleSubmit}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
                >
                  Schedule Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

