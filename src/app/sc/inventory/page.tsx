"use client";
import { useState } from "react";
import {
  Package,
  Search,
  PlusCircle,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Filter,
  Download,
  Upload,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";
import type { InventoryItem, StockStatus, FilterType as InventoryFilterType, StockIndicator } from "@/shared/types";

export default function SCInventory() {
  const [filter, setFilter] = useState<InventoryFilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPart, setSelectedPart] = useState<InventoryItem | null>(null);
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);

  // Mock inventory data
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 1,
      partName: "Engine Oil 5W-30",
      sku: "EO-001",
      category: "Lubricants",
      currentQty: 45,
      minStock: 20,
      unitPrice: "₹450",
      costPrice: "₹350",
      supplier: "Shell India",
      location: "Shelf A-1",
      status: "In Stock",
    },
    {
      id: 2,
      partName: "Brake Pads - Front",
      sku: "BP-002",
      category: "Brakes",
      currentQty: 8,
      minStock: 15,
      unitPrice: "₹1,200",
      costPrice: "₹900",
      supplier: "Bosch",
      location: "Shelf B-3",
      status: "Low Stock",
    },
    {
      id: 3,
      partName: "Air Filter",
      sku: "AF-003",
      category: "Filters",
      currentQty: 0,
      minStock: 10,
      unitPrice: "₹350",
      costPrice: "₹250",
      supplier: "Mahle",
      location: "Shelf C-2",
      status: "Out of Stock",
    },
    {
      id: 4,
      partName: "AC Gas R134a",
      sku: "AC-004",
      category: "AC Parts",
      currentQty: 12,
      minStock: 5,
      unitPrice: "₹800",
      costPrice: "₹600",
      supplier: "Denso",
      location: "Shelf D-1",
      status: "In Stock",
    },
    {
      id: 5,
      partName: "Spark Plugs Set",
      sku: "SP-005",
      category: "Engine",
      currentQty: 25,
      minStock: 10,
      unitPrice: "₹600",
      costPrice: "₹450",
      supplier: "NGK",
      location: "Shelf E-2",
      status: "In Stock",
    },
  ]);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.partCode && item.partCode.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filter === "low_stock") {
      return matchesSearch && item.currentQty <= item.minStock && item.currentQty > 0;
    }
    if (filter === "out_of_stock") {
      return matchesSearch && item.currentQty === 0;
    }
    return matchesSearch;
  });

  const lowStockCount = inventory.filter(
    (item) => item.currentQty <= item.minStock && item.currentQty > 0
  ).length;
  const outOfStockCount = inventory.filter((item) => item.currentQty === 0).length;
  const totalValue = inventory.reduce(
    (sum, item) => sum + item.currentQty * parseFloat(item.costPrice.replace("₹", "").replace(",", "")),
    0
  );

  const getStatusColor = (status: StockStatus): string => {
    const colors: Record<StockStatus, string> = {
      "In Stock": "bg-green-100 text-green-700 border-green-300",
      "Low Stock": "bg-yellow-100 text-yellow-700 border-yellow-300",
      "Out of Stock": "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status] || colors["In Stock"];
  };

  const getStockIndicator = (current: number, min: number): StockIndicator => {
    if (current === 0) return { color: "bg-red-500", text: "Out of Stock" };
    if (current <= min) return { color: "bg-yellow-500", text: "Low Stock" };
    return { color: "bg-green-500", text: "In Stock" };
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">SC Inventory</h1>
            <p className="text-gray-500">Manage service center inventory and stock levels</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowRequestModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
            >
              <Upload size={20} />
              Request from Central
            </button>
            <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2">
              <Download size={20} />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Package size={24} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{inventory.length}</h2>
            <p className="text-sm text-gray-600">Total Parts</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                <AlertTriangle size={24} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{lowStockCount}</h2>
            <p className="text-sm text-gray-600">Low Stock Items</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-red-100 text-red-600">
                <TrendingDown size={24} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{outOfStockCount}</h2>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <TrendingUp size={24} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">₹{totalValue.toLocaleString("en-IN")}</h2>
            <p className="text-sm text-gray-600">Total Inventory Value</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by part name, SKU, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "low_stock", "out_of_stock"] as InventoryFilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f === "all"
                    ? "All"
                    : f === "low_stock"
                    ? "Low Stock"
                    : "Out of Stock"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Part Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Part Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Min Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const stockIndicator = getStockIndicator(item.currentQty, item.minStock);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="text-gray-400 mr-3" size={20} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.partName}
                            </div>
                            <div className="text-xs text-gray-500">{item.supplier}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-mono">{item.sku}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{item.partCode || "-"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                            <div
                              className={`h-2 rounded-full ${stockIndicator.color}`}
                              style={{
                                width: `${
                                  (item.currentQty / (item.minStock * 3)) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {item.currentQty}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{item.minStock}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {item.unitPrice}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{item.location}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedPart(item)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </button>
                          {item.currentQty <= item.minStock && (
                            <button
                              onClick={() => {
                                setSelectedPart(item);
                                setShowRequestModal(true);
                              }}
                              className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                            >
                              Request
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredInventory.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Parts Found</h3>
            <p className="text-gray-500">No inventory items match the current filter criteria.</p>
          </div>
        )}
      </div>

      {/* Request Parts Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Request Parts from Central</h2>
            {selectedPart && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Part Name</p>
                  <p className="font-semibold text-gray-800">{selectedPart.partName}</p>
                  <p className="text-xs text-gray-500 mt-1">SKU: {selectedPart.sku}</p>
                  {selectedPart.partCode && (
                    <p className="text-xs text-gray-500 mt-1">Part Code: {selectedPart.partCode}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    defaultValue={selectedPart.minStock * 2 - selectedPart.currentQty}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option>Normal</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter reason for request..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  ></textarea>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedPart(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert("Parts request submitted successfully!");
                      setShowRequestModal(false);
                      setSelectedPart(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

