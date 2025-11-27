"use client";

import { useState, useMemo, useEffect, startTransition } from "react";
import { Plus, Edit, Package, CheckCircle, AlertTriangle, DollarSign, X, Search } from "lucide-react";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { staticServiceCenters, defaultInventoryData } from "@/__mocks__/data";

// Types - using InventoryItem from mock data
import type { InventoryItem } from "@/__mocks__/data";

interface ServiceCenter {
  id: number;
  name: string;
  location?: string;
}

interface InventoryForm {
  partName: string;
  sku: string;
  partCode: string;
  category: string;
  quantity: string;
  price: string;
  status: "In Stock" | "Low Stock";
  centerId: string;
}

export default function InventoryPage() {
  // Initialize with static centers to ensure server/client match
  const [centers, setCenters] = useState<ServiceCenter[]>(staticServiceCenters);

  // Load additional centers from localStorage after mount (client-side only)
  useEffect(() => {
    const storedCenters = safeStorage.getItem<Record<string, ServiceCenter>>('serviceCenters', {});
    const allCenters = [...staticServiceCenters];
    Object.values(storedCenters).forEach((center) => {
      if (!allCenters.find(c => c.id === center.id)) {
        allCenters.push({ id: center.id, name: center.name, location: center.location || "" });
      }
    });
    // Only update if we have additional centers beyond the static ones
    if (allCenters.length > staticServiceCenters.length) {
      startTransition(() => {
        setCenters(allCenters);
      });
    }
  }, []);

  // Initialize with default data to ensure server/client match
  const [inventory, setInventory] = useState<InventoryItem[]>(defaultInventoryData);

  // Load inventory from localStorage after mount (client-side only)
  useEffect(() => {
    const storedInventory = safeStorage.getItem<InventoryItem[]>('inventoryData', []);
    if (storedInventory.length > 0) {
      startTransition(() => {
        setInventory(storedInventory);
      });
    }
  }, []);

  const [selectedCenter, setSelectedCenter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [form, setForm] = useState<InventoryForm>({
    partName: "",
    sku: "",
    partCode: "",
    category: "",
    quantity: "",
    price: "",
    status: "In Stock",
    centerId: "",
  });

  // Filter inventory based on selected center and search term using useMemo
  const filteredInventory = useMemo(() => {
    let filtered = inventory;
    
    if (selectedCenter !== "all") {
      filtered = filtered.filter(item => item.centerId === parseInt(selectedCenter));
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.partName.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [selectedCenter, inventory, searchTerm]);

  // Calculate summary statistics
  const totalParts = filteredInventory.length;
  const inStock = filteredInventory.filter(item => item.status === "In Stock").length;
  const lowStock = filteredInventory.filter(item => item.status === "Low Stock").length;
  const totalValue = filteredInventory.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('₹', '').replace(',', '')) || 0;
    return sum + (price * item.quantity);
  }, 0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.partName.trim() || !form.sku.trim() || !form.centerId) {
      alert("Please fill all required fields!");
      return;
    }

    if (editingItem) {
      // Update existing item
      const selectedCenterName = centers.find(c => c.id === parseInt(form.centerId))?.name || "";
      const updated = inventory.map(item =>
        item.id === editingItem.id
          ? { 
              ...item, 
              ...form, 
              quantity: parseInt(form.quantity) || 0,
              centerId: parseInt(form.centerId) || item.centerId,
              centerName: selectedCenterName || item.centerName
            }
          : item
      );
      setInventory(updated);
      if (typeof window !== 'undefined') {
        safeStorage.setItem('inventoryData', updated);
      }
      alert("Part updated successfully!");
    } else {
      // Add new item
      const selectedCenterName = centers.find(c => c.id === parseInt(form.centerId))?.name || "";
      const newItem: InventoryItem = {
        id: inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1,
        partName: form.partName,
        sku: form.sku,
        partCode: form.partCode || undefined,
        category: form.category,
        quantity: parseInt(form.quantity) || 0,
        price: form.price,
        status: form.status,
        centerName: selectedCenterName,
        centerId: parseInt(form.centerId),
      };
      const updated = [...inventory, newItem];
      setInventory(updated);
      if (typeof window !== 'undefined') {
        safeStorage.setItem('inventoryData', updated);
      }
      alert("Part added successfully!");
    }

    setForm({
      partName: "",
      sku: "",
      partCode: "",
      category: "",
      quantity: "",
      price: "",
      status: "In Stock",
      centerId: "",
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      partName: item.partName,
      sku: item.sku,
      partCode: item.partCode || "",
      category: item.category,
      quantity: item.quantity.toString(),
      price: item.price,
      status: item.status,
      centerId: item.centerId?.toString() || "",
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    const item = inventory.find(i => i.id === id);
    setItemToDelete(item || null);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const updated = inventory.filter(item => item.id !== itemToDelete.id);
      setInventory(updated);
      if (typeof window !== 'undefined') {
        safeStorage.setItem('inventoryData', updated);
      }
      alert("Part deleted successfully!");
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <button 
              className="sm:hidden p-2 text-gray-600"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Search size={24} />
            </button>
          </div>
          
          {/* Search Bar - Hidden on mobile in header, shown in mobile menu */}
          <div className={`${showMobileMenu ? 'block' : 'hidden'} sm:block w-full sm:w-auto`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
              />
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-sm md:text-base">Manage parts and inventory across service centers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{totalParts}</p>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Total Parts</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{inStock}</p>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">In Stock</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-orange-600 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{lowStock}</p>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Low Stock</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
            {totalValue >= 1000000 
              ? `₹${(totalValue / 1000000).toFixed(1)}M`
              : totalValue >= 1000 
                ? `₹${(totalValue / 1000).toFixed(0)}K`
                : `₹${totalValue}`
            }
          </p>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Total Value</p>
        </div>
      </div>

      {/* Filter and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Service Center:</label>
          <select
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
          >
            <option value="all">All Centers</option>
            {centers.map((center) => (
              <option key={center.id} value={String(center.id)}>
                {center.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Search Bar - Hidden on desktop, shown in mobile menu instead */}
        <div className="hidden sm:block lg:hidden w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search parts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
            />
          </div>
        </div>
        
        <button
          onClick={() => {
            setEditingItem(null);
            setForm({
              partName: "",
              sku: "",
              category: "",
              quantity: "",
              price: "",
              status: "In Stock",
              centerId: "",
              partCode: "",
            });
            setShowAddForm(true);
          }}
          className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus size={18} />
          Add Part
        </button>
      </div>

      {/* Inventory Table - Hidden on mobile, shown on sm and above */}
      <div className="hidden sm:block bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-purple-600">Inventory List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Part Name
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                {selectedCenter === "all" && (
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Service Center
                  </th>
                )}
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={selectedCenter === "all" ? 8 : 7} className="px-4 sm:px-6 py-8 text-center text-gray-500 text-sm">
                    {searchTerm ? "No inventory items match your search" : "No inventory items found"}
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900">
                      <div className="line-clamp-2">{item.partName}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">
                      {item.sku}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">
                      {item.category}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">
                      {item.price}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === "In Stock"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    {selectedCenter === "all" && (
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">
                        <div className="line-clamp-2">{item.centerName}</div>
                      </td>
                    )}
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 text-left sm:text-center text-xs sm:text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900 text-left sm:text-center text-xs sm:text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View for Small Screens */}
      <div className="block sm:hidden mt-6">
        <h2 className="text-lg font-semibold text-purple-600 mb-4">Inventory Items</h2>
        <div className="space-y-4">
          {filteredInventory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No inventory items match your search" : "No inventory items found"}
            </div>
          ) : (
            filteredInventory.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{item.partName}</h3>
                  <span
                    className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                      item.status === "In Stock"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">SKU:</span> {item.sku}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> {item.category}
                  </div>
                  <div>
                    <span className="font-medium">Stock:</span> {item.quantity}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> {item.price}
                  </div>
                </div>
                {selectedCenter === "all" && (
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Service Center:</span> {item.centerName}
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? "Edit Part" : "Add New Part"}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  setForm({
                    partName: "",
                    sku: "",
                    category: "",
                    quantity: "",
                    price: "",
                    status: "In Stock",
                    centerId: "",
                    partCode: "",
                  });
                }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Center *
                </label>
                <select
                  value={form.centerId}
                  onChange={(e) => setForm({ ...form, centerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
                  required
                >
                  <option value="">Select Service Center</option>
                  {centers.map((center) => (
                    <option key={center.id} value={String(center.id)}>
                      {center.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Part Name *
                </label>
                <input
                  type="text"
                  value={form.partName}
                  onChange={(e) => setForm({ ...form, partName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part Code</label>
                <input
                  type="text"
                  value={form.partCode}
                  onChange={(e) => setForm({ ...form, partCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
                  placeholder="Enter part code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="₹450"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "In Stock" | "Low Stock" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition text-sm sm:text-base"
              >
                {editingItem ? "Update Part" : "Add Part"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && itemToDelete && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Confirm Delete</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
              Are you sure you want to delete part <span className="font-semibold text-gray-800">{itemToDelete.partName}</span> ({itemToDelete.sku})? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={cancelDelete}
                className="bg-gray-300 px-4 sm:px-6 py-2 rounded-md hover:bg-gray-400 transition text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-red-700 transition text-sm sm:text-base order-1 sm:order-2"
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

