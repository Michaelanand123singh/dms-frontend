"use client";
import { useState, useMemo, useEffect } from "react";
import { Search, Download, Filter, Calendar, ArrowLeft, FileText, TrendingUp } from "lucide-react";
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


export type Report = {
  id: string;
  title: string;
  reportType: string;
  status: string;
  serviceCenterId: string;
  date: string;
  totalJobs?: number;
  period?: string;
  generatedDate: string;
};

interface ServiceCenter {
  id: number;
  name: string;
  location?: string;
}

export default function ReportsPage() {
  const [selectedServiceCenter, setSelectedServiceCenter] = useState<ServiceCenter | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Load service centers and reports from localStorage
  const [centers, setCenters] = useState<ServiceCenter[]>(() => {
    if (typeof window !== 'undefined') {
      return safeStorage.getItem<ServiceCenter[]>('serviceCenters', []);
    }
    return [];
  });

  useEffect(() => {
    // Load reports from localStorage
    const storedReports = safeStorage.getItem<Report[]>('reports', []);
    setReports(storedReports);
  }, []);


  // Get reports for selected service center
  const getReportsForServiceCenter = (serviceCenterId: string): Report[] => {
    return reports.filter(report => report.serviceCenterId === serviceCenterId);
  };

  // Get service centers with report counts
  const serviceCentersWithCounts = useMemo(() => {
    return centers.map(center => {
      const centerReports = getReportsForServiceCenter(center.id.toString());
      return {
        ...center,
        reportCount: centerReports.length
      };
    });
  }, [centers, reports]);

  // Filtered reports for selected service center
  const filteredReportsForCenter = useMemo(() => {
    if (!selectedServiceCenter) return [];

    let centerReports = getReportsForServiceCenter(selectedServiceCenter.id.toString());

    if (searchTerm.trim() !== "") {
      centerReports = centerReports.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.reportType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "All") {
      centerReports = centerReports.filter((r) => r.reportType === typeFilter);
    }

    if (statusFilter !== "All") {
      centerReports = centerReports.filter((r) => r.status === statusFilter);
    }

    return centerReports;
  }, [selectedServiceCenter, reports, searchTerm, typeFilter, statusFilter]);

  // Get unique report types
  const reportTypes = useMemo(() => {
    return Array.from(new Set(reports.map(r => r.reportType)));
  }, [reports]);

  // Handle service center selection
  const handleServiceCenterClick = (center: ServiceCenter) => {
    setSelectedServiceCenter(center);
    setSearchTerm("");
    setTypeFilter("All");
    setStatusFilter("All");
  };

  // Handle back to service centers
  const handleBackToCenters = () => {
    setSelectedServiceCenter(null);
    setSearchTerm("");
    setTypeFilter("All");
    setStatusFilter("All");
  };

  const handleDownload = (reportId: string) => {
    alert(`Downloading report ${reportId}...`);
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
            {selectedServiceCenter ? `${selectedServiceCenter.name} - Reports` : "Reports"}
          </h1>
        </div>
      </div>

      <p className="text-gray-500 mb-6">
        {selectedServiceCenter
          ? `View and manage reports for ${selectedServiceCenter.name}`
          : "Select a service center to view its reports"}
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
                  Number of Reports
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
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full w-10 h-10 flex items-center justify-center">
                          {center.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{center.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{center.reportCount} reports</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-blue-600 hover:text-blue-800">View Reports →</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No service centers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Reports Table for Selected Service Center */
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-md px-4 py-2 flex-1 min-w-[200px] focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option>All</option>
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option>All</option>
              <option>Generated</option>
              <option>Pending</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("All");
                setStatusFilter("All");
              }}
              className="border rounded-md px-4 py-2 hover:bg-gray-100 transition"
            >
              Reset Filters
            </button>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated Date
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
                {filteredReportsForCenter.length > 0 ? (
                  filteredReportsForCenter.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full w-10 h-10 flex items-center justify-center text-sm">
                            <FileText size={16} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{report.title}</div>
                            {report.totalJobs !== undefined && (
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <TrendingUp size={12} />
                                {report.totalJobs} jobs
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-medium">
                          {report.reportType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          {report.period}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {new Date(report.generatedDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text - xs font - semibold px - 2 py - 1 rounded - full ${report.status === "Generated"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                            } `}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDownload(report.id)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded transition flex items-center gap-1"
                          title="Download Report"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No reports found for this service center
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
