"use client";
import { useState, useEffect, startTransition } from "react";
import { partsMasterService } from "@/features/inventory/services/partsMaster.service";
import { partsOrderService, type PartsOrder } from "@/features/inventory/services/partsOrder.service";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/contexts/ToastContext";
import { Package, FileText, ChevronDown, ChevronUp, Edit, CheckCircle } from "lucide-react";
import type { Part } from "@/shared/types/inventory.types";
import { PartsOrderEntryForm } from "./PartsOrderEntryForm";
import { getInitialFormData, getInitialItemFormData, type PartsOrderEntryFormData, type PartsOrderItem } from "./form.schema";

export default function PartsOrderEntryPage() {
  const { showSuccess, showError, showWarning } = useToast();
  const [parts, setParts] = useState<Part[]>([]);
  const [orders, setOrders] = useState<PartsOrder[]>([]);
  const [showOrderView, setShowOrderView] = useState(true);
  const [formData, setFormData] = useState<PartsOrderEntryFormData>(getInitialFormData());
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [currentItem, setCurrentItem] = useState<PartsOrderItem>(getInitialItemFormData());
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    type: "danger" | "warning" | "info" | "success";
    onConfirm: () => void;
    confirmText?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
      showWarning("Please fill all required fields for the part");
      return;
    }

    // Check if part already added
    if (formData.items.find((item) => item.partId === currentItem.partId)) {
      showWarning("This part is already added to the order");
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

  const handleLoadDraft = (order: PartsOrder) => {
    setFormData({
      items: order.items,
      orderNotes: order.orderNotes || "",
    });
    setEditingDraftId(order.id);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setFormData(getInitialFormData());
    setCurrentItem(getInitialItemFormData());
    setSelectedPart(null);
    setEditingDraftId(null);
  };

  const handleSaveDraft = async () => {
    if (formData.items.length === 0) {
      showWarning("Please add at least one part to save as draft");
      return;
    }

    try {
      setIsProcessing(true);
      const order = await partsOrderService.saveDraft(
        formData.items,
        formData.orderNotes,
        "Inventory Manager",
        editingDraftId || undefined
      );
      const message = editingDraftId
        ? `Draft ${order.orderNumber} updated successfully with ${formData.items.length} part(s)!`
        : `Purchase order ${order.orderNumber} saved as draft with ${formData.items.length} part(s)!`;
      showSuccess(message);
      handleCancelEdit();
      // Refresh orders and show order view
      await fetchOrders();
      setShowOrderView(true);
    } catch (error) {
      console.error("Failed to save draft:", error);
      showError(error instanceof Error ? error.message : "Failed to save draft. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      showWarning("Please add at least one part to the order");
      return;
    }

    // Show confirmation modal
    setConfirmModalConfig({
      title: editingDraftId ? "Submit Draft Purchase Order" : "Submit Purchase Order",
      message: editingDraftId
        ? `Are you sure you want to submit draft with ${formData.items.length} part(s)? This will send the order to central inventory.`
        : `Are you sure you want to create and submit a purchase order with ${formData.items.length} part(s)? This will send the order to central inventory.`,
      type: "info",
      confirmText: "Submit",
      onConfirm: async () => {
        setShowConfirmModal(false);
        setIsProcessing(true);
        try {
          let order: PartsOrder;
          if (editingDraftId) {
            // Update draft first, then submit it
            await partsOrderService.updateDraft(
              editingDraftId,
              formData.items,
              formData.orderNotes
            );
            order = await partsOrderService.submitDraft(editingDraftId);
            showSuccess(`Draft ${order.orderNumber} submitted successfully with ${formData.items.length} part(s)!`);
          } else {
            // Create new order
            order = await partsOrderService.create(
              formData.items,
              formData.orderNotes,
              "Inventory Manager",
              "order"
            );
            showSuccess(`Purchase order ${order.orderNumber} created successfully with ${formData.items.length} part(s)!`);
          }
          handleCancelEdit();
          // Refresh orders and show order view
          await fetchOrders();
          setShowOrderView(true);
        } catch (error) {
          console.error("Failed to submit order:", error);
          showError(error instanceof Error ? error.message : "Failed to submit purchase order. Please try again.");
        } finally {
          setIsProcessing(false);
        }
      },
    });
    setShowConfirmModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="default" className="bg-gray-500 text-white">DRAFT</Badge>;
      case "order":
        return <Badge variant="info" className="bg-blue-600 text-white">ORDER</Badge>;
      case "acknowledge":
        return <Badge variant="success" className="bg-green-600 text-white">ACKNOWLEDGE</Badge>;
      case "pending":
        return <Badge variant="warning" className="bg-yellow-500 text-white">PENDING</Badge>;
      case "in_transit":
        return <Badge variant="info" className="bg-indigo-600 text-white">IN TRANSIT</Badge>;
      case "checked_in":
        return <Badge variant="success" className="bg-green-700 text-white">CHECKED IN</Badge>;
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
      {/* Confirmation Modal */}
      {confirmModalConfig && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setConfirmModalConfig(null);
          }}
          onConfirm={confirmModalConfig.onConfirm}
          title={confirmModalConfig.title}
          message={confirmModalConfig.message}
          type={confirmModalConfig.type}
          confirmText={confirmModalConfig.confirmText}
          isLoading={isProcessing}
        />
      )}

      <div className="pt-24 px-8 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Parts Order Entry</h1>
          <p className="text-gray-500 mt-1">Create purchase orders for multiple parts</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingDraftId ? "Edit Draft Purchase Order" : "New Purchase Order"}
                </h2>
                {editingDraftId && (
                  <button
                    onClick={handleCancelEdit}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
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
                <div className="flex gap-3 mt-4">
                  <Button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={formData.items.length === 0}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingDraftId ? "Update Draft" : "Save as Draft"} {formData.items.length > 0 && `(${formData.items.length} part${formData.items.length !== 1 ? "s" : ""})`}
                  </Button>
                  <Button
                    type="submit"
                    disabled={formData.items.length === 0}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingDraftId ? "Submit Draft" : "Submit Purchase Order"} {formData.items.length > 0 && `(${formData.items.length} part${formData.items.length !== 1 ? "s" : ""})`}
                  </Button>
                </div>
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
                          {/* Status Information */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Status Information:</p>
                            <div className="space-y-1 text-xs text-gray-600">
                              {order.status === "draft" && (
                                <p>• Status: <span className="font-medium text-gray-900">DRAFT</span> - Saved but not submitted</p>
                              )}
                              {order.status === "order" && (
                                <p>• Status: <span className="font-medium text-blue-600">ORDER</span> - Submitted to central inventory</p>
                              )}
                              {order.status === "acknowledge" && order.approvedBy && (
                                <>
                                  <p>• Status: <span className="font-medium text-green-600">ACKNOWLEDGE</span> - Acknowledged by central inventory</p>
                                  <p>• Acknowledged by: <span className="font-medium">{order.approvedBy}</span> on {order.approvedAt ? new Date(order.approvedAt).toLocaleString() : "N/A"}</p>
                                </>
                              )}
                              {order.status === "pending" && (
                                <p>• Status: <span className="font-medium text-yellow-600">PENDING</span> - Waiting for acknowledgment from central inventory</p>
                              )}
                              {order.status === "in_transit" && (
                                <p>• Status: <span className="font-medium text-indigo-600">IN TRANSIT</span> - Parts are being shipped</p>
                              )}
                              {order.status === "checked_in" && (
                                <>
                                  <p>• Status: <span className="font-medium text-green-700">CHECKED IN</span> - Parts have been received</p>
                                  {order.receivedAt && (
                                    <p>• Checked in on: {new Date(order.receivedAt).toLocaleString()}</p>
                                  )}
                                </>
                              )}
                              {order.status === "approved" && order.approvedBy && (
                                <p>• Approved by {order.approvedBy} on {order.approvedAt ? new Date(order.approvedAt).toLocaleDateString() : "N/A"}</p>
                              )}
                              {order.status === "rejected" && order.rejectedBy && (
                                <p>• Rejected by {order.rejectedBy} on {order.rejectedAt ? new Date(order.rejectedAt).toLocaleDateString() : "N/A"}</p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons for Draft Orders */}
                          {order.status === "draft" && (
                            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                              <button
                                onClick={() => handleLoadDraft(order)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                              >
                                <Edit size={16} />
                                Edit Draft
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmModalConfig({
                                    title: "Submit Draft Purchase Order",
                                    message: `Are you sure you want to submit draft ${order.orderNumber} as purchase order? This will send the order to central inventory.`,
                                    type: "info",
                                    confirmText: "Submit",
                                    onConfirm: async () => {
                                      setShowConfirmModal(false);
                                      setIsProcessing(true);
                                      try {
                                        // Submit it
                                        await partsOrderService.submitDraft(order.id);
                                        showSuccess(`Draft ${order.orderNumber} submitted successfully!`);
                                        await fetchOrders();
                                      } catch (error) {
                                        console.error("Failed to submit draft:", error);
                                        showError(error instanceof Error ? error.message : "Failed to submit draft. Please try again.");
                                      } finally {
                                        setIsProcessing(false);
                                      }
                                    },
                                  });
                                  setShowConfirmModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                              >
                                <CheckCircle size={16} />
                                Submit Draft
                              </button>
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
