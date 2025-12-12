"use client";
import { useState, useEffect, startTransition } from "react";
import { partsMasterService } from "@/features/inventory/services/partsMaster.service";
import { partsOrderService, type PartsOrder } from "@/features/inventory/services/partsOrder.service";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Package, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { initializeInventoryMockData } from "@/__mocks__/data/inventory.mock";
import type { Part, PartsOrderFormData } from "@/shared/types/inventory.types";

export default function PartsOrderEntryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [orders, setOrders] = useState<PartsOrder[]>([]);
  const [showOrderView, setShowOrderView] = useState(true);
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

  const fetchOrders = async () => {
    try {
      const data = await partsOrderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  useEffect(() => {
    initializeInventoryMockData();
    startTransition(() => {
      fetchParts();
      fetchOrders();
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
      // Refresh orders and show order view
      await fetchOrders();
      setShowOrderView(true);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to create purchase order. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "received":
        return <Badge variant="info">Received</Badge>;
      case "rejected":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <Badge variant="danger">High</Badge>;
      case "medium":
        return <Badge variant="warning">Medium</Badge>;
      case "low":
        return <Badge variant="info">Low</Badge>;
      default:
        return <Badge>{urgency}</Badge>;
    }
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-24 px-8 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Parts Order Entry</h1>
          <p className="text-gray-500 mt-1">Create purchase orders for parts</p>
        </div>

        <div className="max-w-2xl mx-auto">
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

        {/* Order View Section */}
        <div className="mt-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Purchase Orders</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {orders.length} {orders.length === 1 ? "order" : "orders"} total
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderView(!showOrderView)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {showOrderView ? (
                    <>
                      <span className="text-sm">Hide</span>
                      <ChevronUp size={20} />
                    </>
                  ) : (
                    <>
                      <span className="text-sm">Show</span>
                      <ChevronDown size={20} />
                    </>
                  )}
                </button>
              </div>
            </CardHeader>
            {showOrderView && (
              <CardBody>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
                    <p className="text-gray-600">Create your first purchase order above.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Package className="text-indigo-600" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                              </div>
                              <p className="text-sm text-gray-600">{order.partName}</p>
                            </div>
                            <div className="flex gap-2">
                              {getStatusBadge(order.status)}
                              {getUrgencyBadge(order.urgency)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardBody>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-600 mb-1">Part ID</p>
                              <p className="font-medium text-gray-900">{order.partId}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-1">Quantity</p>
                              <p className="font-medium text-gray-900">{order.requiredQty}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-1">Requested By</p>
                              <p className="font-medium text-gray-900">{order.requestedBy}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-1">Requested At</p>
                              <p className="font-medium text-gray-900">
                                {new Date(order.requestedAt).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          {order.notes && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-1">Notes:</p>
                              <p className="text-sm text-gray-700">{order.notes}</p>
                            </div>
                          )}
                          {order.status === "approved" && order.approvedBy && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600">
                                Approved by {order.approvedBy} on{" "}
                                {order.approvedAt
                                  ? new Date(order.approvedAt).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </CardBody>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

