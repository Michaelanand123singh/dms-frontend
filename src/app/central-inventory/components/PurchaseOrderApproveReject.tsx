"use client";
import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { PurchaseOrder } from "@/shared/types/central-inventory.types";

interface PurchaseOrderApproveRejectProps {
  order: PurchaseOrder;
  onApprove: (orderId: string) => Promise<void>;
  onReject: (orderId: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function PurchaseOrderApproveReject({
  order,
  onApprove,
  onReject,
  isLoading = false,
}: PurchaseOrderApproveRejectProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this purchase order?")) {
      return;
    }
    await onApprove(order.id);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    await onReject(order.id, rejectionReason);
    setShowRejectModal(false);
    setRejectionReason("");
  };

  if (order.status !== "pending") {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-800">Actions</h2>
        </CardHeader>
        <CardBody>
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={() => setShowRejectModal(true)}
              disabled={isLoading}
              className="flex items-center gap-2 flex-1"
            >
              <XCircle className="w-5 h-5" />
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={isLoading}
              className="flex items-center gap-2 flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-5 h-5" />
              Approve
            </Button>
          </div>
        </CardBody>
      </Card>

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
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleReject}
                    disabled={isLoading || !rejectionReason.trim()}
                  >
                    {isLoading ? "Processing..." : "Reject Order"}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}

