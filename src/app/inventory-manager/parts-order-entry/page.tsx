"use client";
import { useState, useEffect, startTransition } from "react";
import { partsMasterService } from "@/features/inventory/services/partsMaster.service";
import { partsOrderService, type PartsOrder } from "@/features/inventory/services/partsOrder.service";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Package, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { initializeInventoryMockData } from "@/__mocks__/data/inventory.mock";
import type { Part } from "@/shared/types/inventory.types";
import { PartsOrderEntryForm } from "./PartsOrderEntryForm";
import { getInitialFormData, getInitialItemFormData, type PartsOrderEntryFormData, type PartsOrderItem } from "./form.schema";

export default function PartsOrderEntryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [orders, setOrders] = useState<PartsOrder[]>([]);
  const [showOrderView, setShowOrderView] = useState(true);
  const [formData, setFormData] = useState<PartsOrderEntryFormData>(getInitialFormData());
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [currentItem, setCurrentItem] = useState<PartsOrderItem>(getInitialItemFormData());

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
    if (part) {
      setCurrentItem({
        ...currentItem,
        partId: part.id,
        partName: part.partName,
      });
    } else {
      setCurrentItem(getInitialItemFormData());
    }
  };

  const handleAddPart = () => {
    if (!currentItem.partId || !currentItem.partName || !currentItem.requiredQty || currentItem.requiredQty <= 0) {
      alert("Please fill all required fields for the part");
      return;
    }

    // Check if part already added
    if (formData.items.find((item) => item.partId === currentItem.partId)) {
      alert("This part is already added to the order");
      return;
    }

    setFormData({
      ...formData,
      items: [...formData.items, { ...currentItem }],
    });

    // Reset current item
    setCurrentItem(getInitialItemFormData());
    setSelectedPart(null);
  };

  const handleRemovePart = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert("Please add at least one part to the order");
      return;
    }

    try {
      const order = await partsOrderService.create(
        formData.items,
        formData.orderNotes,
        "Inventory Manager"
      );
      alert(`Purchase order ${order.orderNumber} created successfully with ${formData.items.length} part(s)!`);
      setFormData(getInitialFormData());
      setCurrentItem(getInitialItemFormData());
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
          <p className="text-gray-500 mt-1">Create purchase orders for multiple parts</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">New Purchase Order</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <PartsOrderEntryForm
                  formData={formData}
                  onFormChange={setFormData}
                  availableParts={parts}
                  selectedPart={selectedPart}
                  onPartSelect={handlePartSelect}
                  currentItem={currentItem}
                  onCurrentItemChange={setCurrentItem}
                  onAddPart={handleAddPart}
                  onRemovePart={handleRemovePart}
                />
                <Button 
                  type="submit" 
                  disabled={formData.items.length === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Purchase Order {formData.items.length > 0 && `(${formData.items.length} part${formData.items.length !== 1 ? "s" : ""})`}
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
                                <Badge variant="info">{order.items.length} part{order.items.length !== 1 ? "s" : ""}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardBody>
                          {/* Parts List */}
                          <div className="space-y-3 mb-4">
                            {order.items.map((item, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.partName}</p>
                                    <p className="text-xs text-gray-600">Part ID: {item.partId}</p>
                                  </div>
                                  {getUrgencyBadge(item.urgency)}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-600">Quantity:</span>
                                    <span className="ml-1 font-medium text-gray-900">{item.requiredQty}</span>
                                  </div>
                                  {item.notes && (
                                    <div className="col-span-2 md:col-span-2">
                                      <span className="text-gray-600">Notes:</span>
                                      <span className="ml-1 text-gray-700">{item.notes}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4 pt-3 border-t border-gray-200">
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
                            <div>
                              <p className="text-gray-600 mb-1">Total Parts</p>
                              <p className="font-medium text-gray-900">{order.items.length}</p>
                            </div>
                          </div>

                          {order.orderNotes && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-1">Order Notes:</p>
                              <p className="text-sm text-gray-700">{order.orderNotes}</p>
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
