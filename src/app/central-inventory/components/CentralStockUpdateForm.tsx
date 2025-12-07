"use client";
import { useState } from "react";
import { PlusCircle, MinusCircle, Edit } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { CentralStock, StockUpdateFormData } from "@/shared/types/central-inventory.types";

interface CentralStockUpdateFormProps {
  stock: CentralStock | null;
  onSubmit: (data: StockUpdateFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function CentralStockUpdateForm({
  stock,
  onSubmit,
  onCancel,
  isLoading = false,
}: CentralStockUpdateFormProps) {
  const [formData, setFormData] = useState<StockUpdateFormData>({
    partId: "",
    adjustmentType: "add",
    quantity: 0,
    reason: "",
    notes: "",
    referenceNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stock) {
      alert("Please select a stock item");
      return;
    }

    if (formData.quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (!formData.reason.trim()) {
      alert("Please provide a reason for the adjustment");
      return;
    }

    if (
      formData.adjustmentType === "adjust" &&
      formData.quantity === stock.currentQty
    ) {
      alert("New quantity must be different from current quantity");
      return;
    }

    if (
      (formData.adjustmentType === "remove" || formData.adjustmentType === "adjust") &&
      formData.quantity > stock.currentQty
    ) {
      alert("Quantity cannot exceed current stock");
      return;
    }

    await onSubmit(formData);
  };

  if (!stock) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <Edit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Select a stock item to update</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const getNewQuantity = () => {
    if (formData.adjustmentType === "add") {
      return stock.currentQty + (formData.quantity || 0);
    } else if (formData.adjustmentType === "remove") {
      return Math.max(0, stock.currentQty - (formData.quantity || 0));
    } else {
      return formData.quantity || 0;
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-800">Stock Adjustment</h2>
      </CardHeader>
      <CardBody>
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Selected Item</p>
          <p className="font-medium">{stock.partName}</p>
          <p className="text-sm text-gray-500">SKU: {stock.sku}</p>
          <p className="text-sm text-gray-500 mt-2">
            Current Quantity: <span className="font-medium">{stock.currentQty}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  onClick={() => setFormData({ ...formData, adjustmentType: type.value })}
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
              max={formData.adjustmentType === "add" ? undefined : stock.currentQty}
              value={formData.quantity || ""}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Current: {stock.currentQty} → After: {getNewQuantity()}
            </p>
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
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button type="submit" variant="primary" disabled={isLoading} className="flex-1">
              {isLoading ? "Updating..." : "Update Stock"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

