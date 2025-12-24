"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PlusCircle, MinusCircle, Edit, Search } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { centralInventoryRepository } from "@/core/repositories/central-inventory.repository";
import type { CentralStock, StockUpdateFormData } from "@/shared/types/central-inventory.types";

export default function StockUpdatePage() {
  const router = useRouter();
  const [stock, setStock] = useState<CentralStock[]>([]);
  const [selectedStock, setSelectedStock] = useState<CentralStock | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<StockUpdateFormData>({
    partId: "",
    adjustmentType: "add",
    quantity: 0,
    reason: "",
    notes: "",
    referenceNumber: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const stockData = await centralInventoryRepository.getAllStock();
        setStock(stockData);
      } catch (error) {
        console.error("Failed to fetch stock:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStock();
  }, []);

  const handleStockSelect = (stockItem: CentralStock) => {
    setSelectedStock(stockItem);
    setFormData({
      partId: stockItem.partId,
      adjustmentType: "add",
      quantity: 0,
      reason: "",
      notes: "",
      referenceNumber: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStock || formData.quantity <= 0) {
      alert("Please select a stock item and enter a valid quantity");
      return;
    }

    if (!formData.reason.trim()) {
      alert("Please provide a reason for the adjustment");
      return;
    }

    if (
      formData.adjustmentType === "adjust" &&
      formData.quantity === selectedStock.currentQty
    ) {
      alert("New quantity must be different from current quantity");
      return;
    }

    if (
      (formData.adjustmentType === "remove" || formData.adjustmentType === "adjust") &&
      formData.quantity > selectedStock.currentQty
    ) {
      alert("Quantity cannot exceed current stock");
      return;
    }

    setIsSubmitting(true);
    try {
      const userInfo = JSON.parse(
        localStorage.getItem("userInfo") || '{"name": "Central Inventory Manager"}'
      );
      await centralInventoryRepository.adjustStock(
        selectedStock.id,
        formData,
        userInfo.name || "Central Inventory Manager"
      );

      // Refresh stock list
      const updatedStock = await centralInventoryRepository.getAllStock();
      setStock(updatedStock);

      // Update selected stock if it's the same item
      const updated = updatedStock.find((s) => s.id === selectedStock.id);
      if (updated) {
        setSelectedStock(updated);
      }

      alert("Stock updated successfully!");
      setFormData({
        partId: "",
        adjustmentType: "add",
        quantity: 0,
        reason: "",
        notes: "",
        referenceNumber: "",
      });
      setSelectedStock(null);
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Failed to update stock. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStock = stock.filter(
    (s) =>
      s.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hsnCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Update Stock</h1>
          <p className="text-gray-500">Add, remove, or adjust central warehouse stock</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Selection */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Select Stock Item</h2>
            </CardHeader>
            <CardBody>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by part name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredStock.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No stock items found</p>
                ) : (
                  filteredStock.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleStockSelect(item)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedStock?.id === item.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.partName}</p>
                          <p className="text-sm text-gray-500">{item.hsnCode}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.currentQty}</p>
                          <p className="text-xs text-gray-400">in stock</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          {/* Update Form */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800">Stock Adjustment</h2>
            </CardHeader>
            <CardBody>
              {selectedStock ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Selected Item</p>
                    <p className="font-medium">{selectedStock.partName}</p>
                    <p className="text-sm text-gray-500">HSN Code: {selectedStock.hsnCode}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Current Quantity: <span className="font-medium">{selectedStock.currentQty}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adjustment Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { value: "add", label: "Add", icon: PlusCircle },
                          { value: "remove", label: "Remove", icon: MinusCircle },
                          { value: "adjust", label: "Adjust", icon: Edit },
                        ] as const
                      ).map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, adjustmentType: type.value })
                          }
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                            formData.adjustmentType === type.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <type.icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.adjustmentType === "adjust"
                        ? "New Quantity"
                        : formData.adjustmentType === "add"
                        ? "Quantity to Add"
                        : "Quantity to Remove"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {formData.adjustmentType === "adjust" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {selectedStock.currentQty} → New: {formData.quantity || 0}
                      </p>
                    )}
                    {formData.adjustmentType === "add" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {selectedStock.currentQty} → After:{" "}
                        {selectedStock.currentQty + (formData.quantity || 0)}
                      </p>
                    )}
                    {formData.adjustmentType === "remove" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {selectedStock.currentQty} → After:{" "}
                        {Math.max(0, selectedStock.currentQty - (formData.quantity || 0))}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="e.g., New stock received, Stock issued, Stock adjustment..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, referenceNumber: e.target.value })
                      }
                      placeholder="e.g., GRN-2024-001, PI-2024-001..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      placeholder="Additional notes..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStock(null);
                        setFormData({
                          partId: "",
                          adjustmentType: "add",
                          quantity: 0,
                          reason: "",
                          notes: "",
                          referenceNumber: "",
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Updating..." : "Update Stock"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12">
                  <Edit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a stock item to update</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

