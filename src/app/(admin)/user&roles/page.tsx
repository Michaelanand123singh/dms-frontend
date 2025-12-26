"use client";
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { 
  Trash2, Key, History, Edit2, Zap, Eye, ArrowLeft, Users, 
  ShieldCheck, Box, Headset, Search, Filter, 
  Building2, Briefcase, Plus, X,
  CheckCircle2, ChevronRight, Mail, MapPin, List, LayoutGrid
} from "lucide-react";
import { toast } from "react-hot-toast";

// Services
import { serviceCenterService } from "@/features/service-centers/services/service-center.service";
import { userService } from "@/features/users/services/user.service";

// Types
import type { User as BackendUser } from "@/shared/types/user.types";
import type { ServiceCenter as BackendServiceCenter } from "@/shared/types/service-center.types";
import type { UserRole } from "@/shared/types/auth.types";

// UI Types
interface UIUser {
  id: string;
  initials: string;
  name: string;
  email: string;
  role: string;
  originalRole: UserRole;
  assigned: string;
  serviceCenterId?: string;
  status: "Active" | "Inactive";
}

interface UserFormData {
  fullName: string;
  email: string;
  password: string;
  role: string;
  status: "Active" | "Inactive";
  serviceCenter: string;
}

// Global Roles configuration
const GLOBAL_ROLES = ["Super Admin", "Call Center", "Central Inventory Mgr", "Finance Manager"];

const GLOBAL_GROUPS = [
    { id: 'global-admin', name: 'Administration', role: 'Super Admin', icon: ShieldCheck, description: 'Platform oversight & config', theme: 'indigo' },
    { id: 'global-inventory', name: 'Central Inventory', role: 'Central Inventory Mgr', icon: Box, description: 'Stock & parts management', theme: 'orange' },
    { id: 'global-call-center', name: 'Call Center', role: 'Call Center', icon: Headset, description: 'Customer support agents', theme: 'cyan' },
];

const ROLE_MAPPING_UI_TO_BACKEND: Record<string, UserRole> = {
  "Super Admin": "admin",
  "SC Manager": "sc_manager",
  "Central Inventory Mgr": "central_inventory_manager",
  "Call Center": "call_center",
  "Technician Engineer": "service_engineer",
  "Service Advisor": "service_advisor"
};

const ROLE_MAPPING_BACKEND_TO_UI: Record<string, string> = {
  "admin": "Super Admin",
  "sc_manager": "SC Manager",
  "inventory_manager": "Finance Manager",
  "call_center": "Call Center",
  "service_engineer": "Technician Engineer",
  "service_advisor": "Service Advisor",
  "central_inventory_manager": "Central Inventory Mgr"
};

interface UserGroup {
  id: string;
  name: string;
  isVirtual: boolean;
  roleTarget?: string;
  userCount: number;
  icon?: any;
  description?: string;
  city?: string; // For sorting/grouping
}

export default function UsersAndRolesPage() {
  // Navigation & Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [editingUser, setEditingUser] = useState<UIUser | null>(null);

  // Data State
  const [users, setUsers] = useState<UIUser[]>([]);
  const [centers, setCenters] = useState<BackendServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters - Groups Level
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [groupTypeFilter, setGroupTypeFilter] = useState<'All' | 'Departments' | 'ServiceCenters'>('All');
  
  // Pagination & Layout for Groups to handle 1000s
  const [visibleStart, setVisibleStart] = useState(0);
  const BATCH_SIZE = 20; // Load/Render 20 at a time
  const [isListView, setIsListView] = useState(true); // Default to list view for large datasets

  // Filters - User Level
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");

  // Interaction State
  const [selectedUser, setSelectedUser] = useState<UIUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UIUser | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    email: "",
    password: "",
    role: "Super Admin",
    status: "Active",
    serviceCenter: "",
  });

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedCenters, fetchedUsers] = await Promise.all([
        serviceCenterService.getAll(),
        userService.getAll()
      ]);

      setCenters(fetchedCenters);

      const mappedUsers: UIUser[] = fetchedUsers.map(u => {
        const sc = fetchedCenters.find(c => c.id === u.serviceCenterId);
        const assignedName = sc ? sc.name : (u.role === 'call_center' ? 'Global / Call Center' : 'Headquarters');

        return {
          id: u.id,
          initials: u.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
          name: u.name,
          email: u.email,
          role: ROLE_MAPPING_BACKEND_TO_UI[u.role] || u.role,
          originalRole: u.role,
          assigned: assignedName,
          serviceCenterId: u.serviceCenterId,
          status: "Active"
        };
      });

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Error loading data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Derived State: Groups (Optimized) ---
  const filteredGroups = useMemo(() => {
    const term = groupSearchTerm.toLowerCase();

    // 1. Global Groups (Always few)
    const globalGroups: UserGroup[] = GLOBAL_GROUPS.map(g => ({
        id: g.id,
        name: g.name,
        isVirtual: true,
        roleTarget: g.role,
        icon: g.icon,
        description: g.description,
        userCount: users.filter(u => u.role === g.role).length
    })).filter(g => 
        (groupTypeFilter === 'All' || groupTypeFilter === 'Departments') &&
        (g.name.toLowerCase().includes(term) || g.roleTarget?.toLowerCase().includes(term))
    );

    // 2. Service Centers (Potentially 1000s)
    // Filter first, then we will slice in render or use virtualization
    const scGroups: UserGroup[] = centers.map(center => ({
        id: center.id,
        name: center.name,
        isVirtual: false,
        icon: Building2,
        description: `${center.city}, ${center.state}`,
        city: center.city,
        userCount: users.filter(u => u.serviceCenterId === center.id).length
    })).filter(c => 
        (groupTypeFilter === 'All' || groupTypeFilter === 'ServiceCenters') &&
        (c.name.toLowerCase().includes(term) || c.description?.toLowerCase().includes(term) || c.city?.toLowerCase().includes(term))
    );

    return { globalGroups, scGroups };
  }, [centers, users, groupSearchTerm, groupTypeFilter]);

  // Handle Loading More / Pagination for SCs
  const visibleScGroups = useMemo(() => {
      // Show all globals + paged SCs
      return filteredGroups.scGroups.slice(0, visibleStart + BATCH_SIZE);
  }, [filteredGroups, visibleStart]);

  const loadMore = () => {
      if (visibleStart + BATCH_SIZE < filteredGroups.scGroups.length) {
          setVisibleStart(prev => prev + BATCH_SIZE);
      }
  }

  // Reset pagination on filter change
  useEffect(() => {
      setVisibleStart(0);
  }, [groupSearchTerm, groupTypeFilter]);


  // --- Derived State: Users in Selected Group ---
  const filteredUsers = useMemo(() => {
    if (!selectedGroup) return [];

    let groupUsers = [];
    
    if (selectedGroup.isVirtual && selectedGroup.roleTarget) {
        groupUsers = users.filter(u => u.role === selectedGroup.roleTarget);
    } else {
        groupUsers = users.filter(u => u.serviceCenterId === selectedGroup.id);
    }

    if (userSearchTerm.trim() !== "") {
        groupUsers = groupUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }

    if (userRoleFilter !== "All") {
        groupUsers = groupUsers.filter((u) => u.role === userRoleFilter);
    }

    return groupUsers;
  }, [selectedGroup, users, userSearchTerm, userRoleFilter]);

  // --- Stats ---
  const stats = useMemo(() => {
      const totalUsers = users.length;
      const totalCenters = centers.length;
      const activeNetworkUsers = users.filter(u => !!u.serviceCenterId).length;
      return { totalUsers, totalCenters, activeNetworkUsers };
  }, [users, centers]);


  // --- Handlers ---

  const handleGroupClick = (group: UserGroup) => {
    setSelectedGroup(group);
    setUserSearchTerm("");
    setUserRoleFilter("All");
  };

  const handleEditUser = (user: UIUser) => {
    setEditingUser(user);
    setFormData({
      fullName: user.name,
      email: user.email,
      password: "", 
      role: user.role,
      status: user.status,
      serviceCenter: user.serviceCenterId || "",
    });
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Clear SC if global role selected
    if (name === "role" && GLOBAL_ROLES.includes(value)) {
      setFormData(prev => ({ ...prev, [name]: value, serviceCenter: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const backendRole = ROLE_MAPPING_UI_TO_BACKEND[formData.role] || "service_engineer";
      const payload: any = {
        name: formData.fullName,
        email: formData.email,
        role: backendRole,
        serviceCenterId: formData.serviceCenter || null,
      };

      if (editingUser) {
        if (formData.password) payload.password = formData.password;
        await userService.update(editingUser.id, payload);
        await fetchData();
        toast.success("User updated successfully");
      } else {
        if (!formData.password) {
          toast.error("Password is required for new users");
          return;
        }
        payload.password = formData.password;
        await userService.create(payload);
        await fetchData();
        toast.success("User created successfully");
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
    } catch (error) {
      console.error("Failed to save user", error);
      toast.error("Failed to save user.");
    }
  };

  const resetForm = () => {
    setFormData({ fullName: "", email: "", password: "", role: "Super Admin", status: "Active", serviceCenter: "" });
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await userService.delete(userToDelete.id);
        await fetchData();
        setShowDeleteConfirm(false);
        setUserToDelete(null);
        if (selectedUser?.id === userToDelete.id) {
          setShowUserDetails(false);
          setSelectedUser(null);
        }
        toast.success("User deleted successfully");
      } catch (error) {
        console.error("Failed to delete user", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const loadActivityLogs = (user: UIUser) => {
    setActivityLogs([
      { action: "Login", timestamp: "2024-11-15 10:30 AM", details: "Logged in from Chrome on Windows" },
      { action: "View Job Cards", timestamp: "2024-11-15 10:35 AM", details: "Viewed 12 job cards" },
    ]);
    setShowActivityLogs(true);
  };

  if (loading && users.length === 0 && centers.length === 0) {
    return <div className="min-h-screen flex justify-center items-center bg-gray-50 text-gray-500 font-medium">Loading network data...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 flex flex-col">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-6 mb-8 flex-shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                 {selectedGroup && (
                    <button onClick={() => setSelectedGroup(null)} className="text-slate-400 hover:text-slate-600 transition-colors flex items-center hover:underline">
                        User Management
                    </button>
                 )}
                 {selectedGroup && <ChevronRight size={16} className="text-slate-300"/>}
                 <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    {selectedGroup ? selectedGroup.name : "Network User Management"}
                 </h1>
              </div>
              <p className="text-slate-500 text-sm md:text-base">
                {selectedGroup 
                  ? selectedGroup.isVirtual ? 'Global Role Administration' : `Service Center Staff • ${selectedGroup.description}`
                  : `Managing ${stats.totalUsers} users across ${stats.totalCenters} service centers and global departments.`}
              </p>
            </div>

            {selectedGroup && (
               <button
                  onClick={() => {
                    setEditingUser(null);
                    if (selectedGroup.isVirtual && selectedGroup.roleTarget) {
                        setFormData({
                          fullName: "", email: "", password: "",
                          role: selectedGroup.roleTarget, status: "Active", serviceCenter: "",
                        });
                    } else {
                        setFormData({
                          fullName: "", email: "", password: "",
                          role: "Service Advisor", status: "Active", serviceCenter: selectedGroup.id,
                        });
                    }
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md"
                >
                  <Plus size={18} />
                  <span>Add User</span>
                </button>
            )}
          </div>
      </div>

      {/* --- CONTENT AREA --- */}
      {!selectedGroup ? (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
          
          {/* Dashboard Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between flex-shrink-0 top-0 sticky z-20">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search centers by name, city..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={groupSearchTerm}
                  onChange={(e) => setGroupSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <div className="flex p-1 bg-slate-100 rounded-lg">
                   <button onClick={() => setIsListView(false)} className={`p-2 rounded-md ${!isListView ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}><LayoutGrid size={18}/></button>
                   <button onClick={() => setIsListView(true)} className={`p-2 rounded-md ${isListView ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}><List size={18}/></button>
                </div>
                <div className="h-6 w-px bg-slate-300 mx-2"></div>
                <FilterTab label="All" active={groupTypeFilter === 'All'} onClick={() => setGroupTypeFilter('All')} />
                <FilterTab label="Depts" active={groupTypeFilter === 'Departments'} onClick={() => setGroupTypeFilter('Departments')} />
                <FilterTab label="Centers" active={groupTypeFilter === 'ServiceCenters'} onClick={() => setGroupTypeFilter('ServiceCenters')} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-10">
              
              {/* 1. Global Departments (Always Grid/Cards) */}
              {(groupTypeFilter === 'All' || groupTypeFilter === 'Departments') && filteredGroups.globalGroups.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Global Departments</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredGroups.globalGroups.map(group => (
                        <ProGroupCard key={group.id} group={group} onClick={() => handleGroupClick(group)} />
                    ))}
                    </div>
                </div>
              )}

              {/* 2. Service Centers (List or Grid) */}
              {(groupTypeFilter === 'All' || groupTypeFilter === 'ServiceCenters') && filteredGroups.scGroups.length > 0 && (
                <div>
                    <div className="flex justify-between items-end mb-3 px-1">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Service Centers ({filteredGroups.scGroups.length})
                        </h3>
                        <span className="text-xs text-slate-400">
                             Showing {Math.min(visibleScGroups.length, filteredGroups.scGroups.length)} of {filteredGroups.scGroups.length}
                        </span>
                    </div>
                    
                    {isListView ? (
                        /* Optimized List View for High Volume */
                        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
                            {visibleScGroups.map(group => (
                                <div 
                                    key={group.id} 
                                    onClick={() => handleGroupClick(group)}
                                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                            {group.name.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{group.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <MapPin size={12}/> {group.city || 'Unknown Location'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-900">{group.userCount}</p>
                                            <p className="text-xs text-slate-400">Users</p>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Grid View */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {visibleScGroups.map(group => (
                                <ProGroupCard key={group.id} group={group} onClick={() => handleGroupClick(group)} isSc />
                            ))}
                        </div>
                    )}

                    {/* Load More Button */}
                    {visibleScGroups.length < filteredGroups.scGroups.length && (
                        <div className="mt-6 text-center">
                            <button 
                                onClick={loadMore}
                                className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-full hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm text-sm"
                            >
                                Load More Centers
                            </button>
                        </div>
                    )}
                </div>
              )}
          </div>
        </div>
      ) : (
        /* --- USER LIST VIEW --- */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-0 animate-in fade-in zoom-in-95 duration-200">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
               <div className="relative flex-1 max-w-sm">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input 
                      type="text" 
                      placeholder="Filter users in this group..." 
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                   />
               </div>
               {!selectedGroup.isVirtual && (
                   <div className="flex items-center gap-3">
                       <select 
                         className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-500 font-medium text-slate-700"
                         value={userRoleFilter}
                         onChange={(e) => setUserRoleFilter(e.target.value)}
                       >
                           <option value="All">All Roles</option>
                           {Object.values(ROLE_MAPPING_BACKEND_TO_UI).map(role => (
                                <option key={role} value={role}>{role}</option>
                           ))}
                       </select>
                   </div>
               )}
            </div>

            {/* Table */}
            <div className="overflow-y-auto flex-1 h-full">
                <table className="w-full text-left border-collapse sticky top-0">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">User</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">Contact Info</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">Role</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">Status</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right bg-slate-50">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-white shadow-sm hover:scale-105 transition-transform">
                                    {user.initials}
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900 text-sm">{user.name}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600">
                             {user.email}
                        </td>
                        <td className="px-6 py-3">
                           <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                             {user.role}
                           </span>
                        </td>
                        <td className="px-6 py-3">
                            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                            </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ActionButton icon={Edit2} onClick={() => handleEditUser(user)} label="Edit" color="blue" />
                                <ActionButton icon={Trash2} onClick={(e) => { e.stopPropagation(); setUserToDelete(user); setShowDeleteConfirm(true); }} label="Delete" color="red" />
                            </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                <Users size={24} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No users found.</p>
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
            </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                <div>
                   <h2 className="text-lg font-bold text-slate-900">{editingUser ? "Edit User Profile" : "Create New User"}</h2>
                   <p className="text-xs text-slate-500 mt-0.5">Manage access credentials</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-1 rounded-md shadow-sm border border-slate-200"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-4">
                  <InputGroup label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Sarah Smith" required />
                  <InputGroup label="Email Address" name="email" value={formData.email} onChange={handleChange} placeholder="name@company.com" type="email" required />
                  
                  <InputGroup 
                    label={editingUser ? "New Password" : "Password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="••••••••" 
                    type="password" 
                    required={!editingUser} 
                  />

                  <div className="pt-2 border-t border-slate-100 mt-2">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assignments</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 font-medium text-slate-700"
                            >
                                {Object.keys(ROLE_MAPPING_UI_TO_BACKEND).map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                         </div>
                         
                         <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Service Center</label>
                            <select
                                name="serviceCenter"
                                value={formData.serviceCenter}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                                disabled={(!!selectedGroup && !editingUser) || GLOBAL_ROLES.includes(formData.role)}
                            >
                                <option value="">{GLOBAL_ROLES.includes(formData.role) ? "Not Required" : "Select Center..."}</option>
                                {centers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                         </div>
                     </div>
                  </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                    {editingUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <ConfirmDeleteModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmDelete} userName={userToDelete?.name} />

    </div>
  );
}

// --- SUB-COMPONENTS ---

const ProGroupCard = ({ group, onClick, isSc }: { group: UserGroup, onClick: () => void, isSc?: boolean }) => {
    const Icon = group.icon || Users;
    
    return (
        <div 
            onClick={onClick}
            className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all duration-200 group flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-lg ${isSc ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'} transition-colors`}>
                    <Icon size={20} />
                </div>
                {group.userCount > 0 && (
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">
                        {group.userCount} USERS
                    </span>
                )}
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1">{group.name}</h3>
            <p className="text-xs text-slate-500 line-clamp-2 mt-auto">
                {group.description || (isSc ? 'Service Center' : 'Global Dept')}
            </p>
        </div>
    );
};

const FilterTab = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap uppercase tracking-wide ${
            active 
            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
    >
        {label}
    </button>
);

const ActionButton = ({ icon: Icon, onClick, label, color }: any) => {
    const colors: any = {
        blue: "hover:text-blue-600 hover:bg-blue-50",
        purple: "hover:text-purple-600 hover:bg-purple-50",
        red: "hover:text-red-600 hover:bg-red-50"
    };
    return (
        <button 
            onClick={onClick}
            className={`p-1.5 text-slate-400 rounded-md transition-colors ${colors[color]}`} 
            title={label}
        >
            <Icon size={16} />
        </button>
    );
};

const InputGroup = ({ label, type = "text", ...props }: any) => (
    <div className="space-y-1.5 w-full">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <input 
            type={type}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300" 
            {...props} 
        />
    </div>
);

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, userName }: any) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3 mx-auto border border-red-100">
                    <Trash2 size={20} />
                </div>
                <h3 className="text-base font-bold text-center text-slate-900 mb-1">Delete User?</h3>
                <p className="text-slate-500 text-center text-xs mb-5">Confirm deleting <strong className="text-slate-900">{userName}</strong>.</p>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold hover:bg-slate-50">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-2 bg-red-600 rounded-lg text-white text-sm font-semibold hover:bg-red-700 shadow-sm">Delete</button>
                </div>
            </div>
        </div>
    )
}
