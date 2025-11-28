"use client";
import { useState } from "react";
import { Trash, Key, History, UserCog, Edit, Power, Eye } from "lucide-react";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { defaultUsers } from "@/__mocks__/data/users.mock";

// Types
interface User {
  initials: string;
  name: string;
  email: string;
  role: string;
  assigned: string;
  status: "Active" | "Inactive";
}

interface ServiceCenter {
  id: number;
  name: string;
}

interface UserFormData {
  fullName: string;
  email: string;
  password: string;
  role: string;
  status: "Active" | "Inactive";
  serviceCenter: string;
}

export default function UsersAndRolesPage() {
  const [showModal, setShowModal] = useState(false);

  // Use mock data from __mocks__ folder
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window !== "undefined") {
      const storedUsers = safeStorage.getItem<User[]>("users", []);
      if (storedUsers.length > 0) {
        return storedUsers;
      }
    }
    return defaultUsers;
  });

  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [activityLogs, setActivityLogs] = useState<Array<{ action: string; timestamp: string; details: string }>>([]);

  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    email: "",
    password: "",
    role: "Super Admin",
    status: "Active",
    serviceCenter: "",
  });

  // Load service centers using lazy initializer
  const [centers, setCenters] = useState<ServiceCenter[]>(() => {
    if (typeof window !== 'undefined') {
      const storedCenters = safeStorage.getItem<Record<string, unknown>>('serviceCenters', {});
      const staticCenters: ServiceCenter[] = [
        { id: 1, name: "Delhi Central Hub" },
        { id: 2, name: "Mumbai Metroplex" },
        { id: 3, name: "Bangalore Innovation Center" },
      ];
      
      // Merge static and stored centers
      const allCenters = [...staticCenters];
      Object.values(storedCenters).forEach((center: any) => {
        if (!allCenters.find(c => c.id === center.id)) {
          allCenters.push({ id: center.id, name: center.name });
        }
      });
      return allCenters;
    }
    return [];
  });

  // Helper function to get service center name(s) from assigned field
  const getServiceCenterName = (assigned: string): string => {
    if (!assigned) return "Not Assigned";
    
    // If it's already a name (contains spaces or common words), return as is
    if (assigned.includes(" ") || assigned.includes("Hub") || assigned.includes("Center") || assigned.includes("Metroplex")) {
      return assigned;
    }
    
    // If it's an ID format like "SC001" or "SC001,SC002"
    const centerIds = assigned.split(",").map(id => id.trim());
    const centerNames = centerIds.map(id => {
      // Extract number from SC001 format
      const match = id.match(/SC(\d+)/);
      if (match) {
        const centerId = parseInt(match[1]);
        const center = centers.find(c => c.id === centerId);
        return center ? center.name : id;
      }
      return id;
    });
    
    return centerNames.join(", ");
  };

  // Handle Filters
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, roleFilter, statusFilter);
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    applyFilters(searchTerm, value, statusFilter);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    applyFilters(searchTerm, roleFilter, value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("All");
    setStatusFilter("All");
    setFilteredUsers(users);
  };

  const applyFilters = (search: string, role: string, status: string) => {
    let filtered = [...users];

    if (search.trim() !== "") {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (role !== "All") {
      filtered = filtered.filter((u) => u.role === role);
    }

    if (status !== "All") {
      filtered = filtered.filter((u) => u.status === status);
    }

    setFilteredUsers(filtered);
  };

  // Handle New User
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const initials = formData.fullName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

    // Get service center name
    // Call center doesn't need a service center assignment
    const assignedSC = formData.role === "Call Center" 
      ? "All Service Centers" 
      : (centers.find(c => c.id === parseInt(formData.serviceCenter))?.name || "Not Assigned");

    const newUser: User = {
      initials,
      name: formData.fullName,
      email: formData.email,
      role: formData.role,
      assigned: assignedSC,
      status: formData.status,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    setShowModal(false);

    setFormData({
      fullName: "",
      email: "",
      password: "",
      role: "Super Admin",
      status: "Active",
      serviceCenter: "",
    });
  };

  // Handle Delete User
  const handleDeleteClick = (user: User, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      const updatedUsers = users.filter(
        (u) => !(u.email === userToDelete.email && u.name === userToDelete.name)
      );
      setUsers(updatedUsers);
      
      // Apply filters to the updated users list
      let filtered = [...updatedUsers];

      if (searchTerm.trim() !== "") {
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (roleFilter !== "All") {
        filtered = filtered.filter((u) => u.role === roleFilter);
      }

      if (statusFilter !== "All") {
        filtered = filtered.filter((u) => u.status === statusFilter);
      }

      setFilteredUsers(filtered);
      
      // Close modals if open
      if (showUserDetails && selectedUser && selectedUser.email === userToDelete.email) {
        setShowUserDetails(false);
        setSelectedUser(null);
      }
      
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const handlePasswordReset = () => {
    if (!selectedUser || !newPassword) {
      alert("Please enter a new password");
      return;
    }
    // TODO: Replace with API call
    alert(`Password reset for ${selectedUser.email}. New password: ${newPassword}`);
    setNewPassword("");
    setShowPasswordReset(false);
  };

  const handleImpersonate = (user: User) => {
    if (confirm(`Impersonate user ${user.name}? You will be logged in as this user.`)) {
      // TODO: Replace with API call
      alert(`Impersonating ${user.name}. Redirecting...`);
      // router.push(`/login?impersonate=${user.email}`);
    }
  };

  const handleToggleUserStatus = (user: User) => {
    const newStatus: "Active" | "Inactive" = user.status === "Active" ? "Inactive" : "Active";
    const updatedUsers = users.map((u) =>
      u.email === user.email ? { ...u, status: newStatus } : u
    );
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    if (selectedUser && selectedUser.email === user.email) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }
    alert(`User ${newStatus === "Active" ? "activated" : "deactivated"} successfully!`);
  };

  const loadActivityLogs = (user: User) => {
    // TODO: Replace with API call
    const mockLogs = [
      { action: "Login", timestamp: "2024-11-15 10:30 AM", details: "Logged in from Chrome on Windows" },
      { action: "View Job Cards", timestamp: "2024-11-15 10:35 AM", details: "Viewed 12 job cards" },
      { action: "Update Invoice", timestamp: "2024-11-15 11:20 AM", details: "Updated invoice INV-2024-001" },
      { action: "Create Service Request", timestamp: "2024-11-15 02:15 PM", details: "Created service request SR-2024-045" },
    ];
    setActivityLogs(mockLogs);
    setShowActivityLogs(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Users & Roles</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-md hover:opacity-90 transition"
        >
          Add New User
        </button>
      </div>

      <p className="text-gray-500 mb-6">
        Manage system users and permissions
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="border rounded-md px-4 py-2 flex-1 min-w-[200px] focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <select
          value={roleFilter}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option>All</option>
          <option>Super Admin</option>
          <option>SC Manager</option>
          <option>Finance Manager</option>
          <option>Call Center</option>
          <option>Technician Engineer</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <button
          onClick={resetFilters}
          className="border rounded-md px-4 py-2 hover:bg-gray-100 transition"
        >
          Reset Filters
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedUser(user);
                setShowUserDetails(true);
              }}
              className="rounded-xl border bg-white shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition cursor-pointer relative"
            >
              <button
                onClick={(e) => handleDeleteClick(user, e)}
                className="absolute top-3 right-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete User"
              >
                <Trash size={18} />
              </button>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full w-14 h-14 flex items-center justify-center text-lg">
                  {user.initials}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{user.name}</h2>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Role:</span>{" "}
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs">
                    {user.role}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Service Center:</span>{" "}
                  <span className="text-gray-800">{getServiceCenterName(user.assigned)}</span>
                </p>
                <p className="text-sm mt-2">
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`font-semibold ${
                      user.status === "Active"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {user.status}
                  </span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center py-10">
            No users found
          </p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Create New User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Service Center</label>
                <select
                  name="serviceCenter"
                  value={formData.serviceCenter}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  required={formData.role !== "Call Center"}
                >
                  <option value="">
                    {formData.role === "Call Center" 
                      ? "Not Required (Can assign to any service center)" 
                      : "Select Service Center"}
                  </option>
                  {centers.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.name}
                    </option>
                  ))}
                </select>
                {formData.role === "Call Center" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Call center staff can assign customers to any service center
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option>Super Admin</option>
                  <option>SC Manager</option>
                  <option>Finance Manager</option>
                  <option>Call Center</option>
                  <option>Technician Engineer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">User Details</h2>
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUser(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full w-16 h-16 flex items-center justify-center text-xl">
                  {selectedUser.initials}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{selectedUser.name}</h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">Full Name:</span>
                  <span className="text-sm text-gray-800">{selectedUser.name}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">Email Address:</span>
                  <span className="text-sm text-gray-800">{selectedUser.email}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">Role:</span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-sm font-medium">
                    {selectedUser.role}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">Service Center:</span>
                  <span className="text-sm text-gray-800">{getServiceCenterName(selectedUser.assigned)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span
                    className={`text-sm font-semibold ${
                      selectedUser.status === "Active"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowPasswordReset(true);
                  }}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition flex items-center justify-center gap-2 text-sm"
                >
                  <Key size={16} />
                  Reset Password
                </button>
                <button
                  onClick={() => loadActivityLogs(selectedUser)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm"
                >
                  <History size={16} />
                  Activity Logs
                </button>
                <button
                  onClick={() => handleImpersonate(selectedUser)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-sm"
                >
                  <Eye size={16} />
                  Impersonate
                </button>
                <button
                  onClick={() => handleToggleUserStatus(selectedUser)}
                  className={`px-4 py-2 rounded-md transition flex items-center justify-center gap-2 text-sm ${
                    selectedUser.status === "Active"
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  <Power size={16} />
                  {selectedUser.status === "Active" ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(selectedUser, e);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm"
                >
                  <Trash size={16} />
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowUserDetails(false);
                    setSelectedUser(null);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordReset && selectedUser && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
              <button
                onClick={() => {
                  setShowPasswordReset(false);
                  setNewPassword("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Reset password for <span className="font-semibold">{selectedUser.name}</span> ({selectedUser.email})
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowPasswordReset(false);
                    setNewPassword("");
                  }}
                  className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordReset}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Modal */}
      {showActivityLogs && selectedUser && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Activity Logs</h2>
              <button
                onClick={() => {
                  setShowActivityLogs(false);
                  setActivityLogs([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Activity logs for <span className="font-semibold">{selectedUser.name}</span>
            </p>
            <div className="space-y-3">
              {activityLogs.length > 0 ? (
                activityLogs.map((log, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold text-gray-800">{log.action}</span>
                      <span className="text-sm text-gray-500">{log.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600">{log.details}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No activity logs found</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowActivityLogs(false);
                  setActivityLogs([]);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete user <span className="font-semibold text-gray-800">{userToDelete.name}</span> ({userToDelete.email})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="bg-gray-300 px-6 py-2 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

