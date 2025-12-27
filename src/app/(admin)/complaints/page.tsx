"use client";
import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, ArrowLeft, AlertCircle, Building } from "lucide-react";
// Local storage helper
const safeStorage = {
  getItem: <T,>(key: string, defaultValue: T): T => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  setItem: <T,>(key: string, value: T): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  },
};


export type Complaint = {
  id: number | string;
  customerName: string;
  phone: string;
  vehicle: string;
  complaint: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Resolved" | "Closed";
  date: string;
  serviceCenterId?: string;
  serviceCenterName?: string;
}

interface ServiceCenter {
  id: number;
  name: string;
  location?: string;
}

export default function ComplaintsPage() {
  const [selectedServiceCenter, setSelectedServiceCenter] = useState<ServiceCenter | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    if (typeof window !== "undefined") {
      return safeStorage.getItem<Complaint[]>("complaints", []);
    }
    return [];
  });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");

  const [centers, setCenters] = useState<ServiceCenter[]>(() => {
    if (typeof window !== "undefined") {
      return safeStorage.getItem<ServiceCenter[]>("serviceCenters", []);
    }
    return [];
  });

  // Get complaints for selected service center
  const getComplaintsForServiceCenter = (serviceCenterId: string): Complaint[] => {
    return complaints.filter(complaint => complaint.serviceCenterId === serviceCenterId);
  };

  // Get service centers with complaint counts
  const serviceCentersWithCounts = useMemo(() => {
    return centers.map(center => {
      const centerComplaints = getComplaintsForServiceCenter(center.id.toString());
      const openComplaints = centerComplaints.filter(c => c.status === "Open").length;
      return {
        ...center,
        complaintCount: centerComplaints.length,
        openCount: openComplaints
      };
    });
  }, [centers, complaints]);

  // Filtered complaints for selected service center
  const filteredComplaintsForCenter = useMemo(() => {
    if (!selectedServiceCenter) return [];

    let centerComplaints = getComplaintsForServiceCenter(selectedServiceCenter.id.toString());

    if (searchTerm.trim() !== "") {
      centerComplaints = centerComplaints.filter(
        (c) =>
          c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.complaint.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      centerComplaints = centerComplaints.filter((c) => c.status === statusFilter);
    }

    if (severityFilter !== "All") {
      centerComplaints = centerComplaints.filter((c) => c.severity === severityFilter);
    }

    return centerComplaints;
  }, [selectedServiceCenter, complaints, searchTerm, statusFilter, severityFilter]);

  // Handle service center selection
  const handleServiceCenterClick = (center: ServiceCenter) => {
    setSelectedServiceCenter(center);
    setSearchTerm("");
    setStatusFilter("All");
    setSeverityFilter("All");
    setSelectedComplaint(null);
    setShowDetails(false);
  };

  // Handle back to service centers
  const handleBackToCenters = () => {
    setSelectedServiceCenter(null);
    setSearchTerm("");
    setStatusFilter("All");
    setSeverityFilter("All");
    setSelectedComplaint(null);
    setShowDetails(false);
  };

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowDetails(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {selectedServiceCenter && (
            <button
              onClick={handleBackToCenters}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Back to Service Centers"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-800">
            {selectedServiceCenter ? `${selectedServiceCenter.name} - Complaints` : "Complaints"}
          </h1>
        </div>
      </div>

      <p className="text-gray-500 mb-6">
        {selectedServiceCenter
          ? `View and manage complaints for ${selectedServiceCenter.name}`
          : "Select a service center to view its complaints"}
      </p>

      {!selectedServiceCenter ? (
        /* Service Centers Table */
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Center Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Complaints
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open Complaints
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {serviceCentersWithCounts.length > 0 ? (
                serviceCentersWithCounts.map((center) => (
                  <tr
                    key={center.id}
                    onClick={() => handleServiceCenterClick(center)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-full w-10 h-10 flex items-center justify-center">
                          {center.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{center.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{center.complaintCount} complaints</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {center.openCount > 0 ? (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-medium">
                          {center.openCount} open
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-blue-600 hover:text-blue-800">View Complaints →</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No service centers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Complaints Table for Selected Service Center */
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-md px-4 py-2 flex-1 min-w-[200px] focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option>All</option>
              <option>Open</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setSeverityFilter("All");
              }}
              className="border rounded-md px-4 py-2 hover:bg-gray-100 transition"
            >
              Reset Filters
            </button>
          </div>

          {/* Complaints Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complaint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaintsForCenter.length > 0 ? (
                  filteredComplaintsForCenter.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{complaint.customerName}</div>
                        <div className="text-xs text-gray-500">{complaint.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{complaint.vehicle}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-md truncate">{complaint.complaint}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {new Date(complaint.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text - xs font - semibold px - 2 py - 1 rounded - full ${getSeverityColor(complaint.severity)} `}>
                          {complaint.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text - xs font - semibold px - 2 py - 1 rounded - full ${getStatusColor(complaint.status)} `}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(complaint)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded transition flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No complaints found for this service center
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Complaint Details Modal */}
          {showDetails && selectedComplaint && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Complaint Details</h2>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      setSelectedComplaint(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Complaint ID</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedComplaint.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {new Date(selectedComplaint.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Customer Name</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedComplaint.customerName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedComplaint.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Vehicle</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedComplaint.vehicle}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <p className="mt-1">
                        <span className={`text - xs font - semibold px - 2 py - 1 rounded - full ${getStatusColor(selectedComplaint.status)} `}>
                          {selectedComplaint.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Severity</label>
                      <p className="mt-1">
                        <span className={`text - xs font - semibold px - 2 py - 1 rounded - full ${getSeverityColor(selectedComplaint.severity)} `}>
                          {selectedComplaint.severity}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Complaint Details</label>
                    <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-4 rounded-lg">
                      {selectedComplaint.complaint}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
