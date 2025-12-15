"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileCheck,
  Package,
  Building,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  Truck,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/contexts/ToastContext";
import { centralInventoryRepository } from "@/__mocks__/repositories/central-inventory.repository";
import type { PurchaseOrder } from "@/shared/types/central-inventory.types";

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { showSuccess, showError, showWarning } = useToast();
  const poId = params.id as string;

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        const po = await centralInventoryRepository.getPurchaseOrderById(poId);
        if (!po) {
          router.push("/central-inventory/purchase-orders");
          return;
        }
        setPurchaseOrder(po);
      } catch (error) {
        console.error("Failed to fetch purchase order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (poId) {
      fetchPurchaseOrder();
    }
  }, [poId, router]);

  const handleApprove = async () => {
    if (!purchaseOrder) return;

    setShowApproveModal(false);
    setIsProcessing(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{"name": "Central Inventory Manager"}');
      const approvedPO = await centralInventoryRepository.approvePurchaseOrder(
        poId,
        userInfo.name || "Central Inventory Manager"
      );
      setPurchaseOrder(approvedPO);
      showSuccess("Purchase order approved successfully! Redirecting to issue parts page...");
      
      // Navigate to issue parts page with auto-filled data
      // Pass approved items as query params
      const approvedItems = approvedPO.items
        .filter(item => item.status === "approved" && item.approvedQty && item.approvedQty > 0)
        .map(item => ({
          partId: item.partId,
          quantity: item.approvedQty || item.requestedQty
        }));
      
      // Store purchase order data in sessionStorage for auto-fill
      sessionStorage.setItem('autoFillPO', JSON.stringify({
        purchaseOrderId: approvedPO.id,
        serviceCenterId: approvedPO.serviceCenterId,
        items: approvedItems
      }));
      
      // Navigate to issue parts page
      setTimeout(() => {
        router.push(`/central-inventory/stock/issue/${approvedPO.serviceCenterId}?poId=${approvedPO.id}`);
      }, 1000);
    } catch (error) {
      console.error("Failed to approve purchase order:", error);
      showError("Failed to approve purchase order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!purchaseOrder || !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setIsProcessing(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{"name": "Central Inventory Manager"}');
      const rejectedPO = await centralInventoryRepository.rejectPurchaseOrder(
        poId,
        userInfo.name || "Central Inventory Manager",
        rejectionReason
      );
      setPurchaseOrder(rejectedPO);
      setShowRejectModal(false);
      setRejectionReason("");
      showSuccess("Purchase order rejected successfully!");
    } catch (error) {
      console.error("Failed to reject purchase order:", error);
      alert("Failed to reject purchase order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: PurchaseOrder["status"]) => {
    const variants: Record<PurchaseOrder["status"], { color: string; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
      partially_fulfilled: { color: "bg-blue-100 text-blue-800", label: "Partially Fulfilled" },
      fulfilled: { color: "bg-gray-100 text-gray-800", label: "Fulfilled" },
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.color}>{variant.label}</Badge>;
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

  if (isLoading) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading purchase order...</div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return null;
  }

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Purchase Orders</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">{purchaseOrder.poNumber}</h1>
              <div className="flex items-center gap-2">
                {getStatusBadge(purchaseOrder.status)}
                {getPriorityBadge(purchaseOrder.priority)}
              </div>
            </div>
            {purchaseOrder.status === "pending" && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
                <Button
                  onClick={() => setShowApproveModal(true)}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Service Center</p>
                      <p className="font-medium">{purchaseOrder.serviceCenterName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Requested By</p>
                      <p className="font-medium">{purchaseOrder.requestedBy}</p>
                      {purchaseOrder.requestedByEmail && (
                        <p className="text-sm text-gray-400">{purchaseOrder.requestedByEmail}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Requested At</p>
                      <p className="font-medium">
                        {new Date(purchaseOrder.requestedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {purchaseOrder.approvedAt && (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Approved At</p>
                        <p className="font-medium">
                          {new Date(purchaseOrder.approvedAt).toLocaleString()}
                        </p>
                        {purchaseOrder.approvedBy && (
                          <p className="text-sm text-gray-400">by {purchaseOrder.approvedBy}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {purchaseOrder.rejectedAt && (
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Rejected At</p>
                        <p className="font-medium">
                          {new Date(purchaseOrder.rejectedAt).toLocaleString()}
                        </p>
                        {purchaseOrder.rejectedBy && (
                          <p className="text-sm text-gray-400">by {purchaseOrder.rejectedBy}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {purchaseOrder.jobCardId && (
                    <div className="flex items-start gap-3">
                      <FileCheck className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Job Card</p>
                        <p className="font-medium">{purchaseOrder.jobCardId}</p>
                      </div>
                    </div>
                  )}
                  {purchaseOrder.vehicleNumber && (
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Vehicle Number</p>
                        <p className="font-medium">{purchaseOrder.vehicleNumber}</p>
                        {purchaseOrder.customerName && (
                          <p className="text-sm text-gray-400">{purchaseOrder.customerName}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {purchaseOrder.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-700">{purchaseOrder.notes}</p>
                  </div>
                )}
                {purchaseOrder.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 font-medium mb-1">Rejection Reason</p>
                    <p className="text-red-700">{purchaseOrder.rejectionReason}</p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-800">Order Items</h2>
              </CardHeader>
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Part Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          HSN Code
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          Requested Qty
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          Approved Qty
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          Unit Price
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          Total
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseOrder.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <p className="font-medium">{item.partName}</p>
                            {item.partCode && (
                              <p className="text-sm text-gray-400">Code: {item.partCode}</p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{item.hsnCode}</td>
                          <td className="py-3 px-4 text-right font-medium">{item.requestedQty}</td>
                          <td className="py-3 px-4 text-right">
                            {item.approvedQty !== undefined ? (
                              <span className="font-medium">{item.approvedQty}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">₹{item.unitPrice.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-medium">
                            ₹{item.totalPrice.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              className={
                                item.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {item.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="py-3 px-4 text-right font-semibold">
                          Total Amount:
                        </td>
                        <td colSpan={2} className="py-3 px-4 text-right font-bold text-lg">
                          ₹{purchaseOrder.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items</span>
                    <span className="font-medium">{purchaseOrder.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Quantity</span>
                    <span className="font-medium">
                      {purchaseOrder.items.reduce((sum, item) => sum + item.requestedQty, 0)}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Total Amount</span>
                      <span className="font-bold text-lg text-blue-600">
                        ₹{purchaseOrder.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Purchase Order"
        message="Are you sure you want to approve this purchase order? After approval, you will be redirected to issue parts page with auto-filled data."
        type="info"
        confirmText="Approve & Issue Parts"
        cancelText="Cancel"
        isLoading={isProcessing}
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-800">Reject Purchase Order</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isProcessing || !rejectionReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? "Processing..." : "Reject Order"}
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

