"use client";
import { useState, useEffect, startTransition } from "react";
import { partsMasterService } from "@/services/inventory/partsMaster.service";
import { partsOrderService } from "@/services/inventory/partsOrder.service";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { initializeInventoryMockData } from "@/__mocks__/data/inventory.mock";
import type { Part, PartsOrderFormData } from "@/shared/types/inventory.types";

export default function PartsOrderEntryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [formData, setFormData] = useState<PartsOrderFormData>({
    partId: "",
    requiredQty: 0,
    urgency: "medium",
    notes: "",
  });
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const fetchParts = async () => {
    try {
      const data = await partsMasterService.getAll();
      setParts(data);
    } catch (error) {
      console.error("Failed to fetch parts:", error);
    }
  };

  useEffect(() => {
    initializeInventoryMockData();
    startTransition(() => {
      fetchParts();
    });
  }, []);

  const handlePartSelect = (partId: string) => {
    const part = parts.find((p) => p.id === partId);
    setSelectedPart(part || null);
    setFormData({ ...formData, partId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partId || !formData.requiredQty || !selectedPart) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const order = await partsOrderService.create(
        formData,
        selectedPart.partName,
        "Inventory Manager"
      );
      alert(`Purchase order ${order.orderNumber} created successfully!`);
      setFormData({
        partId: "",
        requiredQty: 0,
        urgency: "medium",
        notes: "",
      });
      setSelectedPart(null);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to create purchase order. Please try again.");
    }
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-24 px-8 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Parts Order Entry</h1>
          <p className="text-gray-500 mt-1">Create purchase orders for parts</p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">New Purchase Order</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Part *</label>
                  <select
                    value={formData.partId}
                    onChange={(e) => handlePartSelect(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select a part</option>
                    {parts.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.partName} ({part.partId}) - Stock: {part.stockQuantity}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPart && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{selectedPart.partName}</p>
                    <p className="text-sm text-gray-600">
                      Part Number: {selectedPart.partNumber} | Current Stock: {selectedPart.stockQuantity} {selectedPart.unit}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Required Quantity *</label>
                  <Input
                    type="number"
                    value={formData.requiredQty}
                    onChange={(e) => setFormData({ ...formData, requiredQty: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urgency *</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as "low" | "medium" | "high" })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Create Purchase Order
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

