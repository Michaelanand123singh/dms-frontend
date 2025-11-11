"use client";
import { useState } from "react";

export default function UsersAndRolesPage() {
  const [showModal, setShowModal] = useState(false);

  // Dummy users
  const [users, setUsers] = useState([
    {
      initials: "RKS",
      name: "Rajesh Kumar Singh",
      email: "admin@service.com",
      role: "Super Admin",
      assigned: "SC001,SC002,SC003,SC004",
      status: "Active",
    },
    {
      initials: "DM",
      name: "Delhi Manager",
      email: "delhi@service.com",
      role: "SC Manager",
      assigned: "SC001",
      status: "Active",
    },
    {
      initials: "FM",
      name: "Finance Manager",
      email: "finance@service.com",
      role: "Finance Manager",
      assigned: "SC002,SC003",
      status: "Inactive",
    },
    {
      initials: "CCT",
      name: "Call Center Team",
      email: "callcenter@service.com",
      role: "Call Center",
      assigned: "SC002",
      status: "Active",
    },
  ]);

  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Super Admin",
    status: "Active",
  });

  // Handle Filters
  const handleSearch = (value) => {
    setSearchTerm(value);
    applyFilters(value, roleFilter, statusFilter);
  };

  const handleRoleChange = (value) => {
    setRoleFilter(value);
    applyFilters(searchTerm, value, statusFilter);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    applyFilters(searchTerm, roleFilter, value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("All");
    setStatusFilter("All");
    setFilteredUsers(users);
  };

  const applyFilters = (search, role, status) => {
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
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const initials = formData.fullName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

    const newUser = {
      initials,
      name: formData.fullName,
      email: formData.email,
      role: formData.role,
      assigned: "SC001",
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
    });
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
              className="rounded-xl border bg-white shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition"
            >
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
                  <span className="font-semibold">Assigned SC:</span>{" "}
                  {user.assigned}
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
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
    </div>
  );
}
