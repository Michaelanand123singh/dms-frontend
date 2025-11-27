"use client";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { useState, useEffect } from "react";
import { Calendar, Clock, User, Car, PlusCircle, Search, Filter, X, Edit, Phone, MapPin } from "lucide-react";

interface Appointment {
  id: number;
  customerName: string;
  vehicle: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  duration: string;
  status: string;
}

export default function Appointments() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [showAppointmentModal, setShowAppointmentModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [appointmentForm, setAppointmentForm] = useState({
    customerName: "",
    vehicle: "",
    phone: "",
    serviceType: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    duration: "2",
  });

  // Initialize with default data, then load from localStorage
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const defaultAppointments: Appointment[] = [
      {
        id: 1,
        customerName: "Rajesh Kumar",
        vehicle: "Honda City",
        phone: "9876543210",
        serviceType: "Routine Maintenance",
        date: "2025-01-20",
        time: "10:00 AM",
        duration: "2 hours",
        status: "Confirmed",
      },
      {
        id: 2,
        customerName: "Priya Sharma",
        vehicle: "Maruti Swift",
        phone: "9876543211",
        serviceType: "AC Repair",
        date: "2025-01-20",
        time: "2:00 PM",
        duration: "3 hours",
        status: "Confirmed",
      },
    ];
    
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const storedAppointments = safeStorage.getItem<Appointment[]>("appointments", []);
      return storedAppointments.length > 0 ? storedAppointments : defaultAppointments;
    }
    return defaultAppointments;
  });

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
    setIsEditing(false);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditing(true);
    setAppointmentForm({
      customerName: appointment.customerName,
      vehicle: appointment.vehicle,
      phone: appointment.phone,
      serviceType: appointment.serviceType,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration.replace(" hours", "").replace(" hour", ""),
    });
    setShowDetailModal(false);
    setShowAppointmentModal(true);
  };

  const handleDeleteAppointment = (id: number) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      const updatedAppointments = appointments.filter((apt) => apt.id !== id);
      setAppointments(updatedAppointments);
      safeStorage.setItem("appointments", updatedAppointments);
      setShowDetailModal(false);
      setSelectedAppointment(null);
    }
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Appointments</h1>
            <p className="text-gray-500">Schedule and manage customer appointments</p>
          </div>
          <button
            onClick={() => {
              setShowAppointmentModal(true);
              setAppointmentForm({
                customerName: "",
                vehicle: "",
                phone: "",
                serviceType: "",
                date: new Date().toISOString().split("T")[0],
                time: "",
                duration: "2",
              });
            }}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
          >
            <PlusCircle size={20} />
            New Appointment
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No appointments scheduled</p>
              <p className="text-gray-400 text-sm mt-2">Click &quot;New Appointment&quot; to schedule one</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => handleAppointmentClick(apt)}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200 bg-white hover:bg-blue-50/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-blue-600" />
                      <span className="font-semibold text-sm">{apt.time}</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apt.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : apt.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : apt.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                  <p className="font-medium text-gray-800 text-sm mb-1">{apt.customerName}</p>
                  <div className="flex items-center gap-1 mb-1">
                    <Car size={12} className="text-gray-400" />
                    <p className="text-xs text-gray-600">{apt.vehicle}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{apt.serviceType}</p>
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                    <Phone size={12} className="text-gray-400" />
                    <p className="text-xs text-gray-500">{apt.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-2xl mx-2 max-h-[90vh] overflow-y-auto p-4 md:p-6 z-[101]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">New Appointment</h2>
              <button
                onClick={() => {
                  setShowAppointmentModal(false);
                  setAppointmentForm({
                    customerName: "",
                    vehicle: "",
                    phone: "",
                    serviceType: "",
                    date: new Date().toISOString().split("T")[0],
                    time: "",
                    duration: "2",
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
                      value={appointmentForm.customerName}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, customerName: e.target.value })}
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
                      value={appointmentForm.phone}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, phone: e.target.value })}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={appointmentForm.vehicle}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, vehicle: e.target.value })}
                      placeholder="e.g., Honda City 2020"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={appointmentForm.serviceType}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, serviceType: e.target.value })}
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
                      Duration (hours) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={appointmentForm.duration}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, duration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    >
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4 hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={appointmentForm.date}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={appointmentForm.time}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAppointmentModal(false);
                    setIsEditing(false);
                    setSelectedAppointment(null);
                    setAppointmentForm({
                      customerName: "",
                      vehicle: "",
                      phone: "",
                      serviceType: "",
                      date: new Date().toISOString().split("T")[0],
                      time: "",
                      duration: "2",
                    });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (
                      !appointmentForm.customerName ||
                      !appointmentForm.phone ||
                      !appointmentForm.vehicle ||
                      !appointmentForm.serviceType ||
                      !appointmentForm.date ||
                      !appointmentForm.time
                    ) {
                      alert("Please fill in all required fields.");
                      return;
                    }

                    if (!/^\d{10}$/.test(appointmentForm.phone)) {
                      alert("Please enter a valid 10-digit phone number.");
                      return;
                    }

                    if (isEditing && selectedAppointment) {
                      // Update existing appointment
                      const updatedAppointments = appointments.map((apt) =>
                        apt.id === selectedAppointment.id
                          ? {
                              ...apt,
                              customerName: appointmentForm.customerName,
                              vehicle: appointmentForm.vehicle,
                              phone: appointmentForm.phone,
                              serviceType: appointmentForm.serviceType,
                              date: appointmentForm.date,
                              time: appointmentForm.time,
                              duration: `${appointmentForm.duration} hours`,
                            }
                          : apt
                      );
                      setAppointments(updatedAppointments);
                      safeStorage.setItem("appointments", updatedAppointments);
                    } else {
                      // Create new appointment
                      const newAppointment: Appointment = {
                        id: appointments.length > 0 ? Math.max(...appointments.map((a) => a.id)) + 1 : 1,
                        customerName: appointmentForm.customerName,
                        vehicle: appointmentForm.vehicle,
                        phone: appointmentForm.phone,
                        serviceType: appointmentForm.serviceType,
                        date: appointmentForm.date,
                        time: appointmentForm.time,
                        duration: `${appointmentForm.duration} hours`,
                        status: "Confirmed",
                      };

                      const updatedAppointments = [...appointments, newAppointment];
                      setAppointments(updatedAppointments);
                      safeStorage.setItem("appointments", updatedAppointments);
                    }

                    setShowAppointmentModal(false);
                    setIsEditing(false);
                    setSelectedAppointment(null);
                    setAppointmentForm({
                      customerName: "",
                      vehicle: "",
                      phone: "",
                      serviceType: "",
                      date: new Date().toISOString().split("T")[0],
                      time: "",
                      duration: "2",
                    });

                    alert(isEditing ? "Appointment updated successfully!" : "Appointment scheduled successfully!");
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
                >
                  Schedule Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-2xl mx-2 max-h-[90vh] overflow-y-auto p-4 md:p-6 z-[101]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Appointment Details</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAppointment(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={20} />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                    <p className="font-medium text-gray-800">{selectedAppointment.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <Phone size={14} />
                      {selectedAppointment.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Vehicle</p>
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <Car size={14} />
                      {selectedAppointment.vehicle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Appointment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Service Type</p>
                    <p className="font-medium text-gray-800">{selectedAppointment.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date</p>
                    <p className="font-medium text-gray-800">{selectedAppointment.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Time</p>
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <Clock size={14} />
                      {selectedAppointment.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Duration</p>
                    <p className="font-medium text-gray-800">{selectedAppointment.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        selectedAppointment.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : selectedAppointment.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedAppointment.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedAppointment.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditAppointment(selectedAppointment);
                  }}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Edit size={18} />
                  Edit Appointment
                </button>
                <button
                  onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Delete Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

