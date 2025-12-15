"use client";

import { useState, useMemo, useEffect, startTransition } from "react";
import { Package, CheckCircle, AlertTriangle, DollarSign, Search } from "lucide-react";
import { centralInventoryRepository } from "@/__mocks__/repositories/central-inventory.repository";
import type { CentralStock } from "@/shared/types/central-inventory.types";

export default function InventoryPage() {
  // Load central inventory data - using CentralStock type only
  // This page displays ONLY central stock fields, not service center inventory fields
  const [inventory, setInventory] = useState<CentralStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch central stock data from central inventory repository
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const stockData = await centralInventoryRepository.getAllStock();
        startTransition(() => {
          setInventory(stockData);
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Failed to fetch central inventory:", error);
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, []);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Filter inventory based on search term using useMemo
  const filteredInventory = useMemo(() => {
    let filtered = inventory;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.partName.toLowerCase().includes(term) ||
        item.hsnCode.toLowerCase().includes(term) ||
        item.partNumber?.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.location?.toLowerCase().includes(term) ||
        item.warehouse?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [inventory, searchTerm]);

  // Calculate summary statistics
  const totalParts = filteredInventory.length;
  const inStock = filteredInventory.filter(item => item.status === "In Stock").length;
  const lowStock = filteredInventory.filter(item => item.status === "Low Stock").length;
  const totalValue = filteredInventory.reduce((sum, item) => {
    return sum + (item.unitPrice * item.currentQty);
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Central Inventory
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
        <p className="text-gray-600 text-sm md:text-base">View central inventory stock (read-only)</p>
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
                  HSN Code
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Part Type
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
                  High Value
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Warehouse
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 sm:px-6 py-8 text-center text-gray-500 text-sm">
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
                      {item.hsnCode}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">
                      {item.brandName || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.partType === "NEW" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {item.partType || "NEW"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">
                      {item.category}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">
                      {item.currentQty}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">
                      ₹{item.unitPrice.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {item.highValuePart ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">
                      <div className="line-clamp-2">{item.warehouse}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === "In Stock"
                            ? "bg-green-100 text-green-800"
                            : item.status === "Low Stock"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
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
                        : item.status === "Low Stock"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">HSN Code:</span> {item.hsnCode}
                  </div>
                  <div>
                    <span className="font-medium">Brand:</span> {item.brandName || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Part Type:</span> {item.partType || "NEW"}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> {item.category}
                  </div>
                  <div>
                    <span className="font-medium">Stock:</span> {item.currentQty}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> ₹{item.unitPrice.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Warehouse:</span> {item.warehouse}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {item.location}
                  </div>
                  {item.highValuePart && (
                    <div className="col-span-2">
                      <span className="font-medium">High Value:</span>{" "}
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Yes
                      </span>
                      {item.partSerialNumber && (
                        <span className="ml-2 text-xs text-gray-500">Serial: {item.partSerialNumber}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}


