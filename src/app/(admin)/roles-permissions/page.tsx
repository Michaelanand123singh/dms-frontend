"use client";

import { useState } from "react";
import {
  Shield,
  Plus,
  Edit,
  Trash,
  Save,
  X,
  CheckCircle,
  UserCheck,
  Settings,
  FileText,
  DollarSign,
  Package,
  Users,
  Building,
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "1",
      name: "Super Admin",
      description: "Full system access with all permissions",
      permissions: ["all"],
      userCount: 2,
    },
    {
      id: "2",
      name: "SC Manager",
      description: "Manage service center operations",
      permissions: [
        "users.view",
        "users.create",
        "job_cards.manage",
        "inventory.manage",
        "invoices.manage",
        "reports.view",
      ],
      userCount: 5,
    },
    {
      id: "3",
      name: "Finance Manager",
      description: "Manage financial operations",
      permissions: [
        "invoices.view",
        "invoices.create",
        "invoices.update",
        "payments.manage",
        "reports.finance",
      ],
      userCount: 3,
    },
  ]);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({ name: "", description: "", permissions: [] as string[] });

  const allPermissions: Permission[] = [
    // User Management
    { id: "users.view", name: "View Users", description: "View user list and details", category: "User Management" },
    { id: "users.create", name: "Create Users", description: "Create new user accounts", category: "User Management" },
    { id: "users.update", name: "Update Users", description: "Update user details", category: "User Management" },
    { id: "users.delete", name: "Delete Users", description: "Delete user accounts", category: "User Management" },
    { id: "users.reset_password", name: "Reset Passwords", description: "Reset user passwords", category: "User Management" },
    
    // Job Cards
    { id: "job_cards.view", name: "View Job Cards", description: "View job card list", category: "Job Cards" },
    { id: "job_cards.create", name: "Create Job Cards", description: "Create new job cards", category: "Job Cards" },
    { id: "job_cards.update", name: "Update Job Cards", description: "Update job card details", category: "Job Cards" },
    { id: "job_cards.manage", name: "Manage Job Cards", description: "Full job card management", category: "Job Cards" },
    
    // Inventory
    { id: "inventory.view", name: "View Inventory", description: "View inventory items", category: "Inventory" },
    { id: "inventory.create", name: "Create Inventory", description: "Add new inventory items", category: "Inventory" },
    { id: "inventory.update", name: "Update Inventory", description: "Update inventory items", category: "Inventory" },
    { id: "inventory.manage", name: "Manage Inventory", description: "Full inventory management", category: "Inventory" },
    
    // Invoices
    { id: "invoices.view", name: "View Invoices", description: "View invoice list", category: "Invoices" },
    { id: "invoices.create", name: "Create Invoices", description: "Generate new invoices", category: "Invoices" },
    { id: "invoices.update", name: "Update Invoices", description: "Update invoice details", category: "Invoices" },
    { id: "payments.manage", name: "Manage Payments", description: "Record and manage payments", category: "Invoices" },
    
    // Reports
    { id: "reports.view", name: "View Reports", description: "View all reports", category: "Reports" },
    { id: "reports.finance", name: "Finance Reports", description: "Access financial reports", category: "Reports" },
    { id: "reports.export", name: "Export Reports", description: "Export reports to PDF/Excel", category: "Reports" },
    
    // System
    { id: "settings.manage", name: "Manage Settings", description: "Update system settings", category: "System" },
    { id: "roles.manage", name: "Manage Roles", description: "Create and edit roles", category: "System" },
    { id: "audit.view", name: "View Audit Logs", description: "View system audit logs", category: "System" },
  ];

  const permissionCategories = Array.from(new Set(allPermissions.map((p) => p.category)));

  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleForm({ name: "", description: "", permissions: [] });
    setShowRoleModal(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, description: role.description, permissions: [...role.permissions] });
    setShowRoleModal(true);
  };

  const handleSaveRole = () => {
    if (!roleForm.name.trim()) {
      alert("Please enter a role name");
      return;
    }

    if (editingRole) {
      // Update existing role
      setRoles(
        roles.map((r) =>
          r.id === editingRole.id
            ? { ...r, name: roleForm.name, description: roleForm.description, permissions: roleForm.permissions }
            : r
        )
      );
    } else {
      // Create new role
      const newRole: Role = {
        id: Date.now().toString(),
        name: roleForm.name,
        description: roleForm.description,
        permissions: roleForm.permissions,
        userCount: 0,
      };
      setRoles([...roles, newRole]);
    }

    setShowRoleModal(false);
    setEditingRole(null);
    setRoleForm({ name: "", description: "", permissions: [] });
  };

  const handleDeleteRole = (role: Role) => {
    if (confirm(`Delete role "${role.name}"? This will affect ${role.userCount} users.`)) {
      setRoles(roles.filter((r) => r.id !== role.id));
    }
  };

  const togglePermission = (permissionId: string) => {
    if (roleForm.permissions.includes(permissionId)) {
      setRoleForm({ ...roleForm, permissions: roleForm.permissions.filter((p) => p !== permissionId) });
    } else {
      setRoleForm({ ...roleForm, permissions: [...roleForm.permissions, permissionId] });
    }
  };

  const selectAllInCategory = (category: string) => {
    const categoryPermissions = allPermissions.filter((p) => p.category === category).map((p) => p.id);
    const allSelected = categoryPermissions.every((p) => roleForm.permissions.includes(p));
    
    if (allSelected) {
      setRoleForm({ ...roleForm, permissions: roleForm.permissions.filter((p) => !categoryPermissions.includes(p)) });
    } else {
      const newPermissions = [...new Set([...roleForm.permissions, ...categoryPermissions])];
      setRoleForm({ ...roleForm, permissions: newPermissions });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">Roles & Permissions</h1>
            <p className="text-gray-600">Manage user roles and their permissions</p>
          </div>
          <button
            onClick={handleCreateRole}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus size={18} />
            Create Role
          </button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow-md p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Shield className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{role.name}</h3>
                  <p className="text-xs text-gray-500">{role.userCount} users</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditRole(role)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                  title="Edit Role"
                >
                  <Edit size={16} />
                </button>
                {role.userCount === 0 && (
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete Role"
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">{role.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Permissions:</span>
              <span className="text-xs font-semibold text-indigo-600">
                {role.permissions.includes("all") ? "All" : `${role.permissions.length} permissions`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingRole ? "Edit Role" : "Create New Role"}
              </h2>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setEditingRole(null);
                  setRoleForm({ name: "", description: "", permissions: [] });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g., Service Advisor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Describe the role's purpose and responsibilities"
                  />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Permissions</label>
                  <button
                    onClick={() => {
                      if (roleForm.permissions.length === allPermissions.length || roleForm.permissions.includes("all")) {
                        setRoleForm({ ...roleForm, permissions: [] });
                      } else {
                        setRoleForm({ ...roleForm, permissions: ["all"] });
                      }
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {roleForm.permissions.includes("all") || roleForm.permissions.length === allPermissions.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {permissionCategories.map((category) => {
                    const categoryPermissions = allPermissions.filter((p) => p.category === category);
                    const allSelected = categoryPermissions.every((p) =>
                      roleForm.permissions.includes(p.id) || roleForm.permissions.includes("all")
                    );

                    return (
                      <div key={category} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-800">{category}</h4>
                          <button
                            onClick={() => selectAllInCategory(category)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            {allSelected ? "Deselect All" : "Select All"}
                          </button>
                        </div>
                        <div className="space-y-2">
                          {categoryPermissions.map((permission) => {
                            const isSelected =
                              roleForm.permissions.includes(permission.id) || roleForm.permissions.includes("all");
                            return (
                              <label
                                key={permission.id}
                                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (!roleForm.permissions.includes("all")) {
                                      togglePermission(permission.id);
                                    }
                                  }}
                                  disabled={roleForm.permissions.includes("all")}
                                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800">{permission.name}</p>
                                  <p className="text-xs text-gray-500">{permission.description}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setEditingRole(null);
                    setRoleForm({ name: "", description: "", permissions: [] });
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRole}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingRole ? "Update Role" : "Create Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

