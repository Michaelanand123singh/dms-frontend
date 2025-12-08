"use client";
import { useState, useMemo } from "react";
import { Trash, Key, History, UserCog, Edit, Power, Eye, ArrowLeft, Users } from "lucide-react";
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
  const [selectedServiceCenter, setSelectedServiceCenter] = useState<ServiceCenter | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  // Get users for selected service center
  const getUsersForServiceCenter = (serviceCenterName: string): User[] => {
    return users.filter(user => {
      const assigned = getServiceCenterName(user.assigned);
      return assigned === serviceCenterName || assigned.includes(serviceCenterName);
    });
  };

  // Get service centers with user counts
  const serviceCentersWithCounts = useMemo(() => {
    return centers.map(center => {
      const centerUsers = getUsersForServiceCenter(center.name);
      return {
        ...center,
        userCount: centerUsers.length
      };
    });
  }, [centers, users]);

  // Filtered users for selected service center
  const filteredUsersForCenter = useMemo(() => {
    if (!selectedServiceCenter) return [];
    
    let centerUsers = getUsersForServiceCenter(selectedServiceCenter.name);
    
    if (searchTerm.trim() !== "") {
      centerUsers = centerUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "All") {
      centerUsers = centerUsers.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== "All") {
      centerUsers = centerUsers.filter((u) => u.status === statusFilter);
    }

    return centerUsers;
  }, [selectedServiceCenter, users, searchTerm, roleFilter, statusFilter]);

  // Handle Filters
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("All");
    setStatusFilter("All");
  };

  // Handle service center selection
  const handleServiceCenterClick = (center: ServiceCenter) => {
    setSelectedServiceCenter(center);
    resetFilters();
  };

  // Handle back to service centers
  const handleBackToCenters = () => {
    setSelectedServiceCenter(null);
    resetFilters();
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.name,
      email: user.email,
      password: "",
      role: user.role,
      status: user.status,
      serviceCenter: selectedServiceCenter?.id.toString() || "",
    });
    setShowModal(true);
  };

  // Handle update user
  const handleUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    const initials = formData.fullName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

    const assignedSC = formData.role === "Call Center" 
      ? "All Service Centers" 
      : (centers.find(c => c.id === parseInt(formData.serviceCenter))?.name || selectedServiceCenter?.name || "Not Assigned");

    const updatedUsers = users.map(u => 
      u.email === editingUser.email 
        ? {
            ...u,
            initials,
            name: formData.fullName,
            email: formData.email,
            role: formData.role,
            assigned: assignedSC,
            status: formData.status,
          }
        : u
    );

    setUsers(updatedUsers);
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      fullName: "",
      email: "",
      password: "",
      role: "Super Admin",
      status: "Active",
      serviceCenter: "",
    });
  };

  // Handle New User
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingUser) {
      handleUpdateUser(e);
      return;
    }

    const initials = formData.fullName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

    // Get service center name
    // Call center doesn't need a service center assignment
    const assignedSC = formData.role === "Call Center" 
      ? "All Service Centers" 
      : (centers.find(c => c.id === parseInt(formData.serviceCenter))?.name || selectedServiceCenter?.name || "Not Assigned");

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
            {selectedServiceCenter ? `${selectedServiceCenter.name} - Users` : "Users & Roles"}
          </h1>
        </div>
        {selectedServiceCenter && (
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({
                fullName: "",
                email: "",
                password: "",
                role: "Super Admin",
                status: "Active",
                serviceCenter: selectedServiceCenter.id.toString(),
              });
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-md hover:opacity-90 transition"
          >
            Add New User
          </button>
        )}
      </div>

      <p className="text-gray-500 mb-6">
        {selectedServiceCenter 
          ? `Manage users for ${selectedServiceCenter.name}` 
          : "Select a service center to view and manage its users"}
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
                  Number of Users
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
                        <Users size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{center.userCount} users</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-blue-600 hover:text-blue-800">View Users →</span>
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
        /* Users Table for Selected Service Center */
        <>
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

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
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
                {filteredUsersForCenter.length > 0 ? (
                  filteredUsersForCenter.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full w-10 h-10 flex items-center justify-center text-sm">
                            {user.initials}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{user.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-medium">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-semibold ${
                            user.status === "Active"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded transition"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetails(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 p-1.5 hover:bg-indigo-50 rounded transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(user, e)}
                            className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded transition"
                            title="Delete User"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users found for this service center
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingUser ? "Edit User" : "Create New User"}
            </h2>
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

              {!selectedServiceCenter && (
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
              )}

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
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    setFormData({
                      fullName: "",
                      email: "",
                      password: "",
                      role: "Super Admin",
                      status: "Active",
                      serviceCenter: "",
                    });
                  }}
                  className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  {editingUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
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

