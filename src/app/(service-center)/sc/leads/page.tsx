"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Users,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  User,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  FileText,
} from "lucide-react";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { defaultLeads } from "@/__mocks__/data/leads.mock";

interface Lead {
  id: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string;
  vehicleDetails?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  inquiryType: string;
  serviceType?: string;
  source?: string;
  status: "new" | "in_discussion" | "job_card_in_progress" | "converted" | "lost";
  convertedTo?: "appointment" | "quotation" | "job_card";
  convertedId?: string;
  quotationId?: string; // Link to quotation
  jobCardId?: string; // Link to job card
  notes?: string;
  followUpDate?: string;
  assignedTo?: string;
  serviceCenterId?: string;
  createdAt: string;
  updatedAt: string;
}

type LeadStatus = "new" | "in_discussion" | "job_card_in_progress" | "converted" | "lost";
type LeadFilterType = "all" | LeadStatus;

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<LeadFilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    vehicleDetails: "",
    vehicleMake: "",
    vehicleModel: "",
    inquiryType: "Service",
    serviceType: "",
    source: "walk_in",
    notes: "",
    followUpDate: "",
  });

  // Load leads from localStorage or use mock data
  useEffect(() => {
    const storedLeads = safeStorage.getItem<Lead[]>("leads", []);
    if (storedLeads.length > 0) {
      setLeads(storedLeads);
    } else {
      setLeads(defaultLeads);
      safeStorage.setItem("leads", defaultLeads);
    }
  }, []);

  // Create lead
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.phone) {
      alert("Please fill in customer name and phone");
      return;
    }

    try {
      setLoading(true);
      
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        serviceCenterId: "sc-001",
        customerName: form.customerName,
        phone: form.phone,
        email: form.email || undefined,
        vehicleMake: form.vehicleMake || undefined,
        vehicleModel: form.vehicleModel || undefined,
        inquiryType: form.inquiryType || "Service",
        serviceType: form.serviceType || undefined,
        source: form.source || "walk_in",
        status: editingLead?.status || "new",
        notes: form.notes || undefined,
        followUpDate: form.followUpDate || undefined,
        createdAt: editingLead?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingLead) {
        // Update existing lead
        const updatedLeads = leads.map((l) => (l.id === editingLead.id ? newLead : l));
        setLeads(updatedLeads);
        safeStorage.setItem("leads", updatedLeads);
        alert("Lead updated successfully!");
      } else {
        // Create new lead
        const updatedLeads = [newLead, ...leads];
        setLeads(updatedLeads);
        safeStorage.setItem("leads", updatedLeads);
        alert("Lead created successfully!");
      }

      setShowCreateModal(false);
      setEditingLead(null);
      resetForm();
    } catch (error) {
      console.error("Error saving lead:", error);
      alert("Failed to save lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update lead
  const handleUpdate = async (leadId: string, updates: Partial<Lead>) => {
    try {
      setLoading(true);
      
      const updatedLeads = leads.map((l) =>
        l.id === leadId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      );
      
      setLeads(updatedLeads);
      safeStorage.setItem("leads", updatedLeads);
      alert("Lead updated successfully!");
      setEditingLead(null);
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete lead
  const handleDelete = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) {
      return;
    }

    try {
      setLoading(true);
      
      const updatedLeads = leads.filter((l) => l.id !== leadId);
      setLeads(updatedLeads);
      safeStorage.setItem("leads", updatedLeads);
      
      alert("Lead deleted successfully!");
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("Failed to delete lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      customerName: "",
      phone: "",
      email: "",
      vehicleDetails: "",
      vehicleMake: "",
      vehicleModel: "",
      inquiryType: "Service",
      serviceType: "",
      source: "walk_in",
      notes: "",
      followUpDate: "",
    });
  };

  // Convert lead to appointment
  const handleConvertToAppointment = (lead: Lead) => {
    if (!confirm("Convert this lead to an appointment?")) {
      return;
    }

    try {
      const updatedLeads = leads.map((l) =>
        l.id === lead.id
          ? {
              ...l,
              status: "converted" as const,
              convertedTo: "appointment" as const,
              convertedId: `appt-${Date.now()}`,
              updatedAt: new Date().toISOString(),
            }
          : l
      );

      setLeads(updatedLeads);
      safeStorage.setItem("leads", updatedLeads);
      alert("Lead converted to appointment successfully!");
    } catch (error) {
      console.error("Error converting lead:", error);
      alert("Failed to convert lead. Please try again.");
    }
  };

  // Convert lead to quotation
  const handleConvertToQuotation = (lead: Lead) => {
    if (!confirm("Convert this lead to a quotation?")) {
      return;
    }

    try {
      const updatedLeads = leads.map((l) =>
        l.id === lead.id
          ? {
              ...l,
              status: "converted" as const,
              convertedTo: "quotation" as const,
              convertedId: `qt-${Date.now()}`,
              updatedAt: new Date().toISOString(),
            }
          : l
      );

      setLeads(updatedLeads);
      safeStorage.setItem("leads", updatedLeads);
      alert("Lead converted to quotation successfully!");
    } catch (error) {
      console.error("Error converting lead:", error);
      alert("Failed to convert lead. Please try again.");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (filter !== "all" && lead.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        lead.customerName.toLowerCase().includes(query) ||
        lead.phone.includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.vehicleMake?.toLowerCase().includes(query) ||
        lead.vehicleModel?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "in_discussion":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "job_card_in_progress":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "converted":
        return "bg-green-100 text-green-700 border-green-300";
      case "lost":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Leads</h1>
            <p className="text-gray-500">Manage customer leads and follow-ups</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Add Lead
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by customer name, phone, email, or vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "new", "in_discussion", "job_card_in_progress", "converted", "lost"] as LeadFilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f === "all" 
                    ? "All" 
                    : f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leads List */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
              <p className="text-gray-600">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">No leads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow Up</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lead.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.phone}</div>
                        {lead.email && (
                          <div className="text-xs text-gray-500">{lead.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.vehicleMake && lead.vehicleModel ? (
                          <div className="text-sm text-gray-900">
                            {lead.vehicleMake} {lead.vehicleModel}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.serviceType || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.source || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(lead.status)}`}>
                          {lead.status === "job_card_in_progress" 
                            ? "Job Card In Progress"
                            : lead.status.charAt(0).toUpperCase() + lead.status.slice(1).replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingLead(lead);
                              setForm({
                                customerName: lead.customerName,
                                phone: lead.phone,
                                email: lead.email || "",
                                vehicleDetails: lead.vehicleDetails || "",
                                vehicleMake: lead.vehicleMake || "",
                                vehicleModel: lead.vehicleModel || "",
                                inquiryType: lead.inquiryType || "Service",
                                serviceType: lead.serviceType || "",
                                source: lead.source || "walk_in",
                                notes: lead.notes || "",
                                followUpDate: lead.followUpDate ? new Date(lead.followUpDate).toISOString().split("T")[0] : "",
                              });
                              setShowCreateModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-900"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingLead ? "Edit Lead" : "Add Lead"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingLead(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Make</label>
                  <input
                    type="text"
                    value={form.vehicleMake}
                    onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Model</label>
                  <input
                    type="text"
                    value={form.vehicleModel}
                    onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                  <input
                    type="text"
                    value={form.serviceType}
                    onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                  <select
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="walk_in">Walk In</option>
                    <option value="phone">Phone</option>
                    <option value="referral">Referral</option>
                    <option value="online">Online</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow Up Date</label>
                <input
                  type="date"
                  value={form.followUpDate}
                  onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingLead(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingLead ? "Update Lead" : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Lead Modal */}
      {showViewModal && selectedLead && (() => {
        // Try to fetch customer details if customerId exists
        const customers = safeStorage.getItem<any[]>("customers", []);
        const mockCustomers = safeStorage.getItem<any[]>("mockCustomers", []);
        const allCustomers = [...customers, ...mockCustomers];
        const customer = selectedLead.customerId 
          ? allCustomers.find((c: any) => c.id?.toString() === selectedLead.customerId?.toString())
          : null;

        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-[101]">
                <h2 className="text-2xl font-bold text-gray-900">Lead & Customer Details</h2>
                <button 
                  onClick={() => { setShowViewModal(false); setSelectedLead(null); }} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Customer Information Section */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Customer Name</label>
                      <div className="text-base font-semibold text-gray-900">{selectedLead.customerName}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Phone Number</label>
                      <div className="text-base text-gray-900 flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        {selectedLead.phone}
                      </div>
                    </div>
                    {selectedLead.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Email Address</label>
                        <div className="text-base text-gray-900 flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          {selectedLead.email}
                        </div>
                      </div>
                    )}
                    {customer && (
                      <>
                        {customer.address && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-500 block mb-1">Address</label>
                            <div className="text-base text-gray-900">{customer.address}</div>
                            {customer.cityState && (
                              <div className="text-sm text-gray-600 mt-1">{customer.cityState}</div>
                            )}
                            {customer.pincode && (
                              <div className="text-sm text-gray-600">{customer.pincode}</div>
                            )}
                          </div>
                        )}
                        {customer.customerNumber && (
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Customer Number</label>
                            <div className="text-base text-gray-900">{customer.customerNumber}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Vehicle Information Section */}
                {(selectedLead.vehicleMake || selectedLead.vehicleModel || customer?.vehicles) && (
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Car size={20} />
                      Vehicle Information
                    </h3>
                    {customer?.vehicles && customer.vehicles.length > 0 ? (
                      <div className="space-y-3">
                        {customer.vehicles.map((vehicle: any, index: number) => (
                          <div key={vehicle.id || index} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {vehicle.registration && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500 block mb-1">Registration Number</label>
                                  <div className="text-base font-semibold text-gray-900">{vehicle.registration}</div>
                                </div>
                              )}
                              {(vehicle.make || vehicle.model) && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500 block mb-1">Make & Model</label>
                                  <div className="text-base text-gray-900">
                                    {vehicle.make} {vehicle.model}
                                  </div>
                                </div>
                              )}
                              {vehicle.year && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500 block mb-1">Year</label>
                                  <div className="text-base text-gray-900">{vehicle.year}</div>
                                </div>
                              )}
                              {vehicle.vin && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500 block mb-1">VIN</label>
                                  <div className="text-base text-gray-900 font-mono text-sm">{vehicle.vin}</div>
                                </div>
                              )}
                              {vehicle.color && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500 block mb-1">Color</label>
                                  <div className="text-base text-gray-900">{vehicle.color}</div>
                                </div>
                              )}
                              {vehicle.fuelType && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500 block mb-1">Fuel Type</label>
                                  <div className="text-base text-gray-900">{vehicle.fuelType}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (selectedLead.vehicleMake || selectedLead.vehicleModel) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedLead.vehicleMake && (
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Vehicle Make</label>
                            <div className="text-base text-gray-900">{selectedLead.vehicleMake}</div>
                          </div>
                        )}
                        {selectedLead.vehicleModel && (
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Vehicle Model</label>
                            <div className="text-base text-gray-900">{selectedLead.vehicleModel}</div>
                          </div>
                        )}
                        {selectedLead.vehicleDetails && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-500 block mb-1">Vehicle Details</label>
                            <div className="text-base text-gray-900">{selectedLead.vehicleDetails}</div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Lead Information Section */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Lead Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Status</label>
                      <div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedLead.status)}`}>
                          {selectedLead.status === "job_card_in_progress" 
                            ? "Job Card In Progress"
                            : selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1).replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Inquiry Type</label>
                      <div className="text-base text-gray-900">{selectedLead.inquiryType}</div>
                    </div>
                    {selectedLead.serviceType && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Service Type</label>
                        <div className="text-base text-gray-900">{selectedLead.serviceType}</div>
                      </div>
                    )}
                    {selectedLead.source && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Source</label>
                        <div className="text-base text-gray-900 capitalize">{selectedLead.source.replace(/_/g, " ")}</div>
                      </div>
                    )}
                    {selectedLead.followUpDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1 flex items-center gap-2">
                          <Calendar size={16} />
                          Follow Up Date
                        </label>
                        <div className="text-base text-gray-900">
                          {new Date(selectedLead.followUpDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    )}
                    {selectedLead.convertedTo && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Converted To</label>
                        <div className="text-base text-gray-900 capitalize">{selectedLead.convertedTo.replace(/_/g, " ")}</div>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1 flex items-center gap-2">
                        <Clock size={16} />
                        Created At
                      </label>
                      <div className="text-base text-gray-900">
                        {new Date(selectedLead.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1 flex items-center gap-2">
                        <Clock size={16} />
                        Last Updated
                      </label>
                      <div className="text-base text-gray-900">
                        {new Date(selectedLead.updatedAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {selectedLead.notes && (
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                    <div className="text-base text-gray-700 whitespace-pre-wrap bg-white rounded-lg p-4 border border-gray-200">
                      {selectedLead.notes}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={() => { setShowViewModal(false); setSelectedLead(null); }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
