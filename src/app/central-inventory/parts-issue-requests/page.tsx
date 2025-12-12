"use client";
import { useState, useEffect } from "react";
import { adminApprovalService } from "@/features/inventory/services/adminApproval.service";
import { invoiceService } from "@/features/inventory/services/invoice.service";
import { useToast } from "@/contexts/ToastContext";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CheckCircle, XCircle, Package, Building, Clock, RefreshCw, AlertCircle, ArrowRightCircle, FileText } from "lucide-react";
import type { PartsIssue } from "@/shared/types/central-inventory.types";

export default function PartsIssueRequestsPage() {
  const { showSuccess, showError } = useToast();
  const [pendingRequests, setPendingRequests] = useState<PartsIssue[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<PartsIssue[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<PartsIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [issuedPartsIssue, setIssuedPartsIssue] = useState<PartsIssue | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentReference, setPaymentReference] = useState<string>("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const allIssues = await adminApprovalService.getAllIssues();
      
      const pending = allIssues.filter(
        (issue) =>
          issue.status === "pending_admin_approval" &&
          issue.sentToAdmin &&
          !issue.adminApproved &&
          !issue.adminRejected
      );
      
      // Approved requests (both approved and issued)
      const approved = allIssues.filter(
        (issue) => 
          issue.adminApproved && 
          (issue.status === "admin_approved" || issue.status === "issued")
      );
      
      const rejected = allIssues.filter(
        (issue) => issue.adminRejected && issue.status === "admin_rejected"
      );

      setPendingRequests(pending);
      setApprovedRequests(approved);
      setRejectedRequests(rejected);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (id: string) => {
    try {
      setIsProcessing(true);
      await adminApprovalService.resendToAdmin(id);
      await fetchRequests();
      showSuccess("Request resent to admin successfully!");
    } catch (error) {
      console.error("Failed to resend request:", error);
      showError(error instanceof Error ? error.message : "Failed to resend request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIssueParts = async (id: string) => {
    try {
      setIsProcessing(true);
      const userInfo = JSON.parse(
        localStorage.getItem("userInfo") || '{"name": "Central Inventory Manager"}'
      );
      
      const issuedIssue = await adminApprovalService.issueApprovedParts(
        id,
        userInfo.name || "Central Inventory Manager"
      );
      
      // Set the issued parts issue for invoice creation
      setIssuedPartsIssue(issuedIssue);
      setShowInvoiceModal(true);
      
      await fetchRequests();
      showSuccess("Parts issued successfully! Please create invoice with payment details.");
    } catch (error) {
      console.error("Failed to issue parts:", error);
      showError(error instanceof Error ? error.message : "Failed to issue parts");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateInvoice = async () => {
    if (!issuedPartsIssue) return;

    setIsProcessing(true);
    try {
      const invoice = await invoiceService.createInvoice(issuedPartsIssue, {
        partsIssueId: issuedPartsIssue.id,
        purchaseOrderId: issuedPartsIssue.purchaseOrderId,
        paymentScreenshot: paymentScreenshot || undefined,
        paymentMethod: paymentMethod || undefined,
        paymentReference: paymentReference || undefined,
        notes: issuedPartsIssue.notes || undefined,
      });

      showSuccess("Invoice created successfully!");
      setShowInvoiceModal(false);
      setPaymentScreenshot("");
      setPaymentMethod("");
      setPaymentReference("");
      setIssuedPartsIssue(null);
      
      // Navigate to invoice detail page
      setTimeout(() => {
        window.location.href = `/central-inventory/invoices/${invoice.id}`;
      }, 1000);
    } catch (error) {
      console.error("Failed to create invoice:", error);
      showError("Failed to create invoice. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderRequestCard = (request: PartsIssue, showResend: boolean = false, showIssueButton: boolean = false) => {
    const isPending = request.status === "pending_admin_approval" && !request.adminApproved && !request.adminRejected;
    const isApproved = request.adminApproved;
    const isRejected = request.adminRejected;
    const isIssued = request.status === "issued";
    const canIssue = isApproved && !isIssued && request.status === "admin_approved";

    return (
      <Card
        key={request.id}
        className={`border-l-4 ${
          isApproved
            ? "border-l-green-500"
            : isRejected
            ? "border-l-red-500"
            : "border-l-yellow-500"
        }`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Issue Number: {request.issueNumber}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Service Center: {request.serviceCenterName}
              </p>
              {request.issuedBy && (
                <p className="text-xs text-gray-500 mt-1">
                  Requested by: {request.issuedBy} on{" "}
                  {request.issuedAt ? new Date(request.issuedAt).toLocaleString() : "N/A"}
                </p>
              )}
              {request.sentToAdminAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Sent to admin: {new Date(request.sentToAdminAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 items-end">
              {isIssued ? (
                <Badge variant="success">Parts Issued</Badge>
              ) : isApproved ? (
                <Badge variant="success">Admin Approved</Badge>
              ) : isRejected ? (
                <Badge variant="danger">Rejected</Badge>
              ) : (
                <Badge variant="warning">Pending Approval</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {/* Approval Status */}
          <div className="mb-4 flex gap-3">
            <button
              disabled
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                isApproved
                  ? "bg-green-500 text-white"
                  : isRejected
                  ? "bg-red-500 text-white"
                  : "bg-yellow-500 text-white"
              }`}
            >
              {isApproved ? (
                <CheckCircle size={16} />
              ) : isRejected ? (
                <XCircle size={16} />
              ) : (
                <Clock size={16} />
              )}
              Admin {isApproved ? "✓ Approved" : isRejected ? "✗ Rejected" : "Pending"}
            </button>
          </div>

          {/* Approval Details */}
              {isApproved && request.adminApprovedBy && (
            <div className="mb-3 p-2 bg-green-50 rounded text-xs text-green-700">
              Approved by {request.adminApprovedBy} on{" "}
              {request.adminApprovedAt
                ? new Date(request.adminApprovedAt).toLocaleString()
                : "N/A"}
              {isIssued ? (
                <span className="block mt-1 font-semibold">
                  ✓ Parts issued successfully on{" "}
                  {request.issuedAt ? new Date(request.issuedAt).toLocaleString() : "N/A"}
                </span>
              ) : (
                <span className="block mt-1 font-semibold text-blue-700">
                  ⚠ Approved - Ready to issue parts
                </span>
              )}
            </div>
          )}

          {isRejected && request.adminRejectedBy && (
            <div className="mb-3 p-2 bg-red-50 rounded text-xs text-red-700">
              Rejected by {request.adminRejectedBy} on{" "}
              {request.adminRejectedAt
                ? new Date(request.adminRejectedAt).toLocaleString()
                : "N/A"}
              {request.adminRejectionReason && (
                <span className="block mt-1 font-semibold">
                  Reason: {request.adminRejectionReason}
                </span>
              )}
            </div>
          )}

          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Package size={16} />
              Parts to Issue:
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {request.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.partName}</p>
                    <p className="text-sm text-gray-600">
                      SKU: {item.sku} | Part Number: {item.partNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-600">₹{item.totalPrice.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {request.purchaseOrderId && (
            <div className="mb-4 p-2 bg-blue-50 rounded text-sm text-blue-700">
              <strong>Purchase Order:</strong> {request.purchaseOrderId}
            </div>
          )}

          {request.transportDetails && (
            <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
              <strong>Transport Details:</strong>
              {request.transportDetails.transporter && (
                <p>Transporter: {request.transportDetails.transporter}</p>
              )}
              {request.transportDetails.trackingNumber && (
                <p>Tracking: {request.transportDetails.trackingNumber}</p>
              )}
              {request.transportDetails.expectedDelivery && (
                <p>
                  Expected Delivery:{" "}
                  {new Date(request.transportDetails.expectedDelivery).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {request.notes && (
            <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
              <strong>Notes:</strong> {request.notes}
            </div>
          )}

          <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Amount:</span>
              <span className="text-lg font-bold text-indigo-600">
                ₹{request.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Issue Parts Button for Approved Requests */}
          {showIssueButton && canIssue && (
            <div className="border-t pt-4 mt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 mb-1">
                      Admin Approved - Ready to Issue
                    </p>
                    <p className="text-xs text-green-700">
                      This request has been approved by admin. You can now issue the parts to the service center.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleIssueParts(request.id)}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <ArrowRightCircle size={16} className="mr-2" />
                {isProcessing ? "Issuing..." : "Issue Parts to Service Center"}
              </Button>
            </div>
          )}

          {/* Resend Button for Pending Requests */}
          {showResend && isPending && (
            <div className="border-t pt-4 mt-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Clock className="text-yellow-600 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      Waiting for Admin Approval
                    </p>
                    <p className="text-xs text-yellow-700">
                      This request has been sent to admin for approval. If there's no response, you can resend the request.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleResend(request.id)}
                disabled={isProcessing}
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              >
                <RefreshCw size={16} className="mr-2" />
                Resend to Admin
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen pt-24 px-8 pb-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-24 px-8 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Parts Issue Requests</h1>
          <p className="text-gray-500 mt-1">
            View and manage your parts issue requests sent to admin
          </p>
        </div>

        {/* Pending Requests Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-yellow-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Approval ({pendingRequests.length})
            </h2>
          </div>
          {pendingRequests.length === 0 ? (
            <Card>
              <CardBody>
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                  <p>No pending approval requests</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => renderRequestCard(request, true))}
            </div>
          )}
        </div>

        {/* Approved Requests Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-green-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">
              Approved ({approvedRequests.length})
            </h2>
          </div>
          {approvedRequests.length === 0 ? (
            <Card>
              <CardBody>
                <div className="text-center py-8 text-gray-500">
                  <p>No approved requests</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvedRequests.map((request) => renderRequestCard(request, false, true))}
            </div>
          )}
        </div>

        {/* Rejected Requests Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="text-red-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">
              Rejected ({rejectedRequests.length})
            </h2>
          </div>
          {rejectedRequests.length === 0 ? (
            <Card>
              <CardBody>
                <div className="text-center py-8 text-gray-500">
                  <p>No rejected requests</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {rejectedRequests.map((request) => renderRequestCard(request))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Creation Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setPaymentScreenshot("");
          setPaymentMethod("");
          setPaymentReference("");
          setIssuedPartsIssue(null);
        }}
        title="Create Invoice"
        size="lg"
      >
        <div className="space-y-4">
          {issuedPartsIssue && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Parts Issued:</strong> {issuedPartsIssue.issueNumber}
              </p>
              <p className="text-sm text-green-700">
                <strong>Service Center:</strong> {issuedPartsIssue.serviceCenterName}
              </p>
              <p className="text-sm text-green-700">
                <strong>Total Amount:</strong> ₹{issuedPartsIssue.totalAmount.toLocaleString()}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Screenshot (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {paymentScreenshot && (
              <div className="mt-2">
                <img src={paymentScreenshot} alt="Payment screenshot" className="max-w-full h-32 object-contain border rounded" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method (Optional)
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select payment method</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Reference (Optional)
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Transaction ID, Cheque Number, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              onClick={() => {
                setShowInvoiceModal(false);
                setPaymentScreenshot("");
                setPaymentMethod("");
                setPaymentReference("");
                setIssuedPartsIssue(null);
              }}
              variant="outline"
            >
              Skip Invoice
            </Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={isProcessing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isProcessing ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

