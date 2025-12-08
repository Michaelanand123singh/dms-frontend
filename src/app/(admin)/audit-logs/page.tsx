"use client";

import { useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  Eye,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  status: "success" | "failure" | "warning";
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details?: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: "1",
      userId: "user1",
      userName: "Rajesh Kumar Singh",
      action: "CREATE",
      entityType: "User",
      entityId: "user123",
      status: "success",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome/120.0",
      timestamp: "2024-11-15 10:30:25",
      details: "Created new user: Delhi Manager",
    },
    {
      id: "2",
      userId: "user2",
      userName: "Delhi Manager",
      action: "UPDATE",
      entityType: "JobCard",
      entityId: "jc456",
      status: "success",
      ipAddress: "192.168.1.101",
      userAgent: "Firefox/121.0",
      timestamp: "2024-11-15 11:15:42",
      details: "Updated job card status to In Progress",
    },
    {
      id: "3",
      userId: "user1",
      userName: "Rajesh Kumar Singh",
      action: "DELETE",
      entityType: "Inventory",
      entityId: "inv789",
      status: "warning",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome/120.0",
      timestamp: "2024-11-15 09:20:10",
      details: "Deleted inventory item: Engine Oil",
    },
    {
      id: "4",
      userId: "user3",
      userName: "Finance Manager",
      action: "LOGIN",
      entityType: "Auth",
      entityId: "auth001",
      status: "failure",
      ipAddress: "192.168.1.102",
      userAgent: "Safari/17.0",
      timestamp: "2024-11-15 08:45:33",
      details: "Failed login attempt - Invalid password",
    },
  ]);

  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(logs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, statusFilter, actionFilter);
  };

  const applyFilters = (search: string, status: string, action: string) => {
    let filtered = [...logs];

    if (search.trim()) {
      filtered = filtered.filter(
        (log) =>
          log.userName.toLowerCase().includes(search.toLowerCase()) ||
          log.action.toLowerCase().includes(search.toLowerCase()) ||
          log.entityType.toLowerCase().includes(search.toLowerCase()) ||
          log.details?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((log) => log.status === status);
    }

    if (action !== "all") {
      filtered = filtered.filter((log) => log.action === action);
    }

    setFilteredLogs(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="text-green-600" size={18} />;
      case "failure":
        return <XCircle className="text-red-600" size={18} />;
      case "warning":
        return <AlertTriangle className="text-orange-600" size={18} />;
      default:
        return null;
    }
  };

  const handleExport = () => {
    // TODO: Implement CSV/Excel export
    alert("Exporting audit logs...");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">Audit Logs</h1>
            <p className="text-gray-600">View and monitor all system activities</p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Download size={18} />
            Export Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              applyFilters(searchTerm, e.target.value, actionFilter);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="warning">Warning</option>
          </select>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              applyFilters(searchTerm, statusFilter, e.target.value);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setActionFilter("all");
              setFilteredLogs(logs);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Reset
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {log.timestamp}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        {log.userName}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {log.entityType} ({log.entityId})
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className="text-sm font-medium capitalize">{log.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{log.ipAddress}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-indigo-600 hover:text-indigo-800 transition"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Audit Log Details</h2>
              <button onClick={() => setSelectedLog(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">User</p>
                  <p className="text-sm text-gray-800">{selectedLog.userName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Action</p>
                  <p className="text-sm text-gray-800">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Entity Type</p>
                  <p className="text-sm text-gray-800">{selectedLog.entityType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Entity ID</p>
                  <p className="text-sm text-gray-800">{selectedLog.entityId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedLog.status)}
                    <span className="text-sm font-medium capitalize">{selectedLog.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Timestamp</p>
                  <p className="text-sm text-gray-800">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">IP Address</p>
                  <p className="text-sm text-gray-800">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">User Agent</p>
                  <p className="text-sm text-gray-800">{selectedLog.userAgent}</p>
                </div>
              </div>
              {selectedLog.details && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Details</p>
                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedLog.details}</p>
                </div>
              )}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

