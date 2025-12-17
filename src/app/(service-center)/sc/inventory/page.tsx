"use client";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
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
  X,
} from "lucide-react";
import type { InventoryItem, StockStatus, FilterType as InventoryFilterType, StockIndicator } from "@/shared/types";
import { getDefaultServiceCenterInventory, initializeInventoryMockData } from "@/__mocks__/data/inventory.mock";

interface RequestItem {
  partId: number;
  partName: string;
  hsnCode: string;
  partCode?: string;
  quantity: number;
  urgency: "Normal" | "Urgent";
  reason: string;
}

export default function SCInventory() {
  const [filter, setFilter] = useState<InventoryFilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPart, setSelectedPart] = useState<InventoryItem | null>(null);
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [requestItems, setRequestItems] = useState<RequestItem[]>([]);
  const [currentRequest, setCurrentRequest] = useState<{
    partId: number;
    partName: string;
    hsnCode: string;
    partCode?: string;
    quantity: number;
    urgency: "Normal" | "Urgent";
    reason: string;
  } | null>(null);

  // Initialize mock data and use mockParts converted to InventoryItem format
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    if (typeof window !== "undefined") {
      initializeInventoryMockData();
      const storedInventory = safeStorage.getItem<InventoryItem[]>("inventory", []);
      if (storedInventory.length > 0) {
        return storedInventory;
      }
    }
    return getDefaultServiceCenterInventory();
  });

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hsnCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const handleExport = () => {
    // Prepare CSV data
    const headers = [
      "Part Name",
      "HSN Code",
      "Part Code",
      "Category",
      "Current Quantity",
      "Min Stock",
      "Unit Price",
      "Cost Price",
      "Supplier",
      "Location",
      "Status",
    ];

    const csvRows = [
      headers.join(","),
      ...filteredInventory.map((item) =>
        [
          `"${item.partName}"`,
          `"${item.hsnCode}"`,
          `"${item.partCode || ""}"`,
          `"${item.category}"`,
          item.currentQty,
          item.minStock,
          `"${item.unitPrice}"`,
          `"${item.costPrice}"`,
          `"${item.supplier}"`,
          `"${item.location}"`,
          `"${item.status}"`,
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    alert("Inventory exported successfully!");
  };

  const handleAddRequestItem = () => {
    if (!selectedPart) return;

    const newItem: RequestItem = {
      partId: selectedPart.id,
      partName: selectedPart.partName,
      hsnCode: selectedPart.hsnCode,
      partCode: selectedPart.partCode,
      quantity: currentRequest?.quantity || selectedPart.minStock * 2 - selectedPart.currentQty,
      urgency: currentRequest?.urgency || "Normal",
      reason: currentRequest?.reason || "",
    };

    setRequestItems([...requestItems, newItem]);
    setSelectedPart(null);
    setCurrentRequest(null);
  };

  const handleRemoveRequestItem = (index: number) => {
    setRequestItems(requestItems.filter((_, i) => i !== index));
  };

  const handleSubmitRequest = () => {
    if (requestItems.length === 0 && !selectedPart) {
      alert("Please add at least one part to request.");
      return;
    }

    // If there's a selected part but not added to list, add it first
    if (selectedPart && !requestItems.find((item) => item.partId === selectedPart.id)) {
      const newItem: RequestItem = {
        partId: selectedPart.id,
        partName: selectedPart.partName,
        hsnCode: selectedPart.hsnCode,
        partCode: selectedPart.partCode,
        quantity: currentRequest?.quantity || selectedPart.minStock * 2 - selectedPart.currentQty,
        urgency: currentRequest?.urgency || "Normal",
        reason: currentRequest?.reason || "",
      };
      setRequestItems([...requestItems, newItem]);
    }

    // Submit the request
    const finalItems = requestItems.length > 0 ? requestItems : [];
    if (selectedPart && finalItems.length === 0) {
      finalItems.push({
        partId: selectedPart.id,
        partName: selectedPart.partName,
        hsnCode: selectedPart.hsnCode,
        partCode: selectedPart.partCode,
        quantity: currentRequest?.quantity || selectedPart.minStock * 2 - selectedPart.currentQty,
        urgency: currentRequest?.urgency || "Normal",
        reason: currentRequest?.reason || "",
      });
    }

    // Store request in localStorage (simulating API call)
    const requests = safeStorage.getItem<unknown[]>("partsRequests", []);
    const newRequest = {
      id: Date.now(),
      items: finalItems,
      status: "Pending",
      createdAt: new Date().toISOString(),
      serviceCenter: "Pune Phase 1", // This would come from user context
    };
    requests.push(newRequest);
    safeStorage.setItem("partsRequests", requests);

    alert(`Parts request submitted successfully! ${finalItems.length} item(s) requested.`);
    setShowRequestModal(false);
    setSelectedPart(null);
    setRequestItems([]);
    setCurrentRequest(null);
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
              onClick={() => {
                setCurrentRequest(null);
                setRequestItems([]);
                setShowRequestModal(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
            >
              <Upload size={20} />
              Request from Central
            </button>
            <button
              onClick={handleExport}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
            >
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
                placeholder="Search by part name, HSN Code, or category..."
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
                    HSN Code
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
                        <span className="text-sm text-gray-900 font-mono">{item.hsnCode}</span>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-4xl mx-2 max-h-[90vh] overflow-y-auto p-4 md:p-6 z-[101]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Request Parts from Central</h2>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedPart(null);
                  setRequestItems([]);
                  setCurrentRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Add Part Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Part to Request</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Part
                    </label>
                    <select
                      value={selectedPart?.id || ""}
                      onChange={(e) => {
                        const part = inventory.find((p) => p.id === parseInt(e.target.value));
                        setSelectedPart(part || null);
                        if (part) {
                          setCurrentRequest({
                            partId: part.id,
                            partName: part.partName,
                            hsnCode: part.hsnCode,
                            partCode: part.partCode,
                            quantity: part.minStock * 2 - part.currentQty > 0 ? part.minStock * 2 - part.currentQty : part.minStock,
                            urgency: "Normal",
                            reason: "",
                          });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">-- Select a part --</option>
                      {inventory.map((part) => (
                        <option key={part.id} value={part.id}>
                          {part.partName} (HSN: {part.hsnCode}) - Stock: {part.currentQty}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPart && (
                    <>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Part Name</p>
                        <p className="font-semibold text-gray-800">{selectedPart.partName}</p>
                        <p className="text-xs text-gray-500 mt-1">HSN Code: {selectedPart.hsnCode}</p>
                        {selectedPart.partCode && (
                          <p className="text-xs text-gray-500 mt-1">Part Code: {selectedPart.partCode}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Current Stock: {selectedPart.currentQty} | Min Stock: {selectedPart.minStock}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity Needed
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={currentRequest?.quantity || selectedPart.minStock * 2 - selectedPart.currentQty}
                            onChange={(e) => {
                              setCurrentRequest({
                                ...currentRequest!,
                                quantity: parseInt(e.target.value) || 0,
                              });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Urgency
                          </label>
                          <select
                            value={currentRequest?.urgency || "Normal"}
                            onChange={(e) => {
                              setCurrentRequest({
                                ...currentRequest!,
                                urgency: e.target.value as "Normal" | "Urgent",
                              });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="Normal">Normal</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Enter reason for request..."
                          value={currentRequest?.reason || ""}
                          onChange={(e) => {
                            setCurrentRequest({
                              ...currentRequest!,
                              reason: e.target.value,
                            });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        ></textarea>
                      </div>

                      <button
                        onClick={handleAddRequestItem}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                      >
                        Add to Request List
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Request Items List */}
              {requestItems.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Items ({requestItems.length})</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {requestItems.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.partName}</p>
                          <p className="text-sm text-gray-600">HSN Code: {item.hsnCode}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-gray-600">Qty: <strong>{item.quantity}</strong></span>
                            <span className={`px-2 py-1 rounded ${item.urgency === "Urgent" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {item.urgency}
                            </span>
                          </div>
                          {item.reason && (
                            <p className="text-xs text-gray-500 mt-2">Reason: {item.reason}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveRequestItem(index)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Section */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedPart(null);
                    setRequestItems([]);
                    setCurrentRequest(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={requestItems.length === 0 && !selectedPart}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request ({requestItems.length > 0 ? requestItems.length : selectedPart ? 1 : 0} item{requestItems.length !== 1 && !selectedPart ? "s" : ""})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

