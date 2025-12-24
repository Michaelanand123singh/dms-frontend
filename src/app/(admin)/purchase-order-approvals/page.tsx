"use client";
import { useState, useEffect } from "react";
import { centralInventoryRepository } from "@/core/repositories/central-inventory.repository";
import { useRole } from "@/shared/hooks";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle, XCircle, Package, Building, Clock, AlertCircle, FileCheck, Eye } from "lucide-react";
import type { PurchaseOrder } from "@/shared/types/central-inventory.types";
import Link from "next/link";

export default function PurchaseOrderApprovalsPage() {
  const { userInfo, userRole } = useRole();
  const isAdmin = userRole === "admin";
  const [pendingOrders, setPendingOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingOrders();
    }
  }, [isAdmin]);

  const fetchPendingOrders = async () => {
    try {
      setIsLoading(true);
      const allOrders = await centralInventoryRepository.getAllPurchaseOrders();
      // Get only pending orders that need admin approval
      const pending = allOrders.filter((order) => order.status === "pending");
      setPendingOrders(pending);
    } catch (error) {
      console.error("Failed to fetch pending orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!isAdmin) {
      alert("Only admin can approve purchase orders.");
      return;
    }

    try {
      setIsProcessing(true);
      await centralInventoryRepository.approvePurchaseOrder(
        id,
        userInfo?.name || "Admin",
        undefined // Approve all items with requested quantity
      );
      setSelectedOrder(null);
      setNotes("");
      await fetchPendingOrders();
      alert("Purchase order approved successfully!");
    } catch (error) {
      console.error("Failed to approve:", error);
      alert(error instanceof Error ? error.message : "Failed to approve purchase order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!isAdmin) {
      alert("Only admin can reject purchase orders.");
      return;
    }

    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    try {
      setIsProcessing(true);
      await centralInventoryRepository.rejectPurchaseOrder(
        id,
        userInfo?.name || "Admin",
        rejectionReason
      );
      setSelectedOrder(null);
      setRejectionReason("");
      await fetchPendingOrders();
      alert("Purchase order rejected.");
    } catch (error) {
      console.error("Failed to reject:", error);
      alert(error instanceof Error ? error.message : "Failed to reject purchase order");
    } finally {
      setIsProcessing(false);
    }
  };

  const getPriorityBadge = (priority: PurchaseOrder["priority"]) => {
    const variants: Record<PurchaseOrder["priority"], { color: string; label: string }> = {
      low: { color: "bg-gray-100 text-gray-800", label: "Low" },
      normal: { color: "bg-blue-100 text-blue-800", label: "Normal" },
      high: { color: "bg-orange-100 text-orange-800", label: "High" },
      urgent: { color: "bg-red-100 text-red-800", label: "Urgent" },
    };
    const variant = variants[priority] || variants.normal;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const renderOrderCard = (order: PurchaseOrder) => {
    const isSelected = selectedOrder === order.id;
    const isPending = order.status === "pending";

    return (
      <Card
        key={order.id}
        className={`border-l-4 ${order.status === "approved"
            ? "border-l-green-500"
            : order.status === "rejected"
              ? "border-l-red-500"
              : "border-l-yellow-500"
          }`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Purchase Order: {order.poNumber}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Service Center: {order.serviceCenterName}
              </p>
              {order.requestedBy && (
                <p className="text-xs text-gray-500 mt-1">
                  Requested by: {order.requestedBy} on{" "}
                  {order.requestedAt ? new Date(order.requestedAt).toLocaleString() : "N/A"}
                </p>
              )}
              {order.jobCardId && (
                <p className="text-xs text-gray-500 mt-1">
                  Job Card: {order.jobCardId}
                </p>
              )}
              {order.customerName && (
                <p className="text-xs text-gray-500 mt-1">
                  Customer: {order.customerName}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 items-end">
              {order.status === "approved" ? (
                <Badge variant="success">Approved</Badge>
              ) : order.status === "rejected" ? (
                <Badge variant="danger">Rejected</Badge>
              ) : (
                <Badge variant="warning">Pending Approval</Badge>
              )}
              {getPriorityBadge(order.priority)}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {/* Approval Status */}
          <div className="mb-4 flex gap-3">
            <button
              disabled
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${order.status === "approved"
                  ? "bg-green-500 text-white"
                  : order.status === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-yellow-500 text-white"
                }`}
            >
              {order.status === "approved" ? (
                <CheckCircle size={16} />
              ) : order.status === "rejected" ? (
                <XCircle size={16} />
              ) : (
                <Clock size={16} />
              )}
              Status: {order.status === "approved" ? "Approved" : order.status === "rejected" ? "Rejected" : "Pending"}
            </button>
          </div>

          {/* Approval Details */}
          {order.approvedBy && order.approvedAt && (
            <div className="mb-3 p-2 bg-green-50 rounded text-xs text-green-700">
              Approved by {order.approvedBy} on{" "}
              {new Date(order.approvedAt).toLocaleString()}
            </div>
          )}

          {order.rejectedBy && order.rejectedAt && (
            <div className="mb-3 p-2 bg-red-50 rounded text-xs text-red-700">
              Rejected by {order.rejectedBy} on{" "}
              {new Date(order.rejectedAt).toLocaleString()}
              {order.rejectionReason && (
                <span className="block mt-1 font-semibold">
                  Reason: {order.rejectionReason}
                </span>
              )}
            </div>
          )}

          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Package size={16} />
              Items ({order.items.length}):
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.partName}</p>
                    <p className="text-sm text-gray-600">
                      HSN Code: {item.hsnCode} | Part Number: {item.partNumber}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-1">Notes: {item.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      Qty: {item.requestedQty}
                      {item.approvedQty !== undefined && item.approvedQty !== item.requestedQty && (
                        <span className="text-sm text-blue-600 ml-1">
                          (Approved: {item.approvedQty})
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      ₹{item.totalPrice.toLocaleString()}
                    </p>
                    {item.status && (
                      <Badge
                        className={`mt-1 ${item.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : item.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {item.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
              <strong>Notes:</strong> {order.notes}
            </div>
          )}

          <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Amount:</span>
              <span className="text-lg font-bold text-indigo-600">
                ₹{order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {isSelected && isPending && isAdmin && (
            <div className="border-t pt-4 mt-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add approval notes (optional)..."
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (if rejecting):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(order.id)}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Approve Purchase Order
                </Button>
                <Button
                  onClick={() => handleReject(order.id)}
                  disabled={isProcessing || !rejectionReason.trim()}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <XCircle size={16} className="mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setSelectedOrder(null);
                    setNotes("");
                    setRejectionReason("");
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!isSelected && isPending && isAdmin && (
            <div className="flex gap-3">
              <Button
                onClick={() => setSelectedOrder(order.id)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Eye size={16} className="mr-2" />
                Review & Approve
              </Button>
              <Link href={`/central-inventory/purchase-orders/${order.id}`}>
                <Button variant="outline">
                  View Details
                </Button>
              </Link>
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  if (!isAdmin) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen pt-24 px-8 pb-10">
        <div className="text-center py-8">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen pt-24 px-8 pb-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading purchase orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-24 px-8 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Purchase Order Approvals</h1>
          <p className="text-gray-500 mt-1">
            Review and approve purchase orders from service centers to central inventory
          </p>
        </div>

        {/* Pending Orders Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-yellow-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Approval ({pendingOrders.length})
            </h2>
          </div>
          {pendingOrders.length === 0 ? (
            <Card>
              <CardBody>
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                  <p>No pending purchase orders</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order) => renderOrderCard(order))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

