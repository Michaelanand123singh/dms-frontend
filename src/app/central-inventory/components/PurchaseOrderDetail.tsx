"use client";
import { Building, User, Calendar, FileCheck, Truck, CheckCircle, XCircle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableRow, TableCell } from "@/components/ui/Table";
import type { PurchaseOrder } from "@/shared/types/central-inventory.types";

interface PurchaseOrderDetailProps {
  order: PurchaseOrder;
}

export function PurchaseOrderDetail({ order }: PurchaseOrderDetailProps) {
  const getStatusBadge = (status: PurchaseOrder["status"]) => {
    const variants: Record<
      PurchaseOrder["status"],
      "default" | "primary" | "success" | "warning" | "danger"
    > = {
      pending: "warning",
      approved: "success",
      rejected: "danger",
      partially_fulfilled: "primary",
      fulfilled: "default",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: PurchaseOrder["priority"]) => {
    const variants: Record<PurchaseOrder["priority"], "default" | "warning" | "danger"> = {
      low: "default",
      normal: "default",
      high: "warning",
      urgent: "danger",
    };
    return <Badge variant={variants[priority]} size="sm">{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Order Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
            <div className="flex items-center gap-2">
              {getStatusBadge(order.status)}
              {getPriorityBadge(order.priority)}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Service Center</p>
                <p className="font-medium">{order.serviceCenterName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Requested By</p>
                <p className="font-medium">{order.requestedBy}</p>
                {order.requestedByEmail && (
                  <p className="text-sm text-gray-400">{order.requestedByEmail}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Requested At</p>
                <p className="font-medium">{new Date(order.requestedAt).toLocaleString()}</p>
              </div>
            </div>
            {order.approvedAt && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Approved At</p>
                  <p className="font-medium">{new Date(order.approvedAt).toLocaleString()}</p>
                  {order.approvedBy && (
                    <p className="text-sm text-gray-400">by {order.approvedBy}</p>
                  )}
                </div>
              </div>
            )}
            {order.rejectedAt && (
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Rejected At</p>
                  <p className="font-medium">{new Date(order.rejectedAt).toLocaleString()}</p>
                  {order.rejectedBy && (
                    <p className="text-sm text-gray-400">by {order.rejectedBy}</p>
                  )}
                </div>
              </div>
            )}
            {order.jobCardId && (
              <div className="flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Job Card</p>
                  <p className="font-medium">{order.jobCardId}</p>
                </div>
              </div>
            )}
            {order.vehicleNumber && (
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Vehicle Number</p>
                  <p className="font-medium">{order.vehicleNumber}</p>
                  {order.customerName && (
                    <p className="text-sm text-gray-400">{order.customerName}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          {order.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Notes</p>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
          {order.rejectionReason && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-600 font-medium mb-1">Rejection Reason</p>
              <p className="text-red-700">{order.rejectionReason}</p>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Part Name</TableCell>
                  <TableCell>HSN Code</TableCell>
                  <TableCell align="right">Requested Qty</TableCell>
                  <TableCell align="right">Approved Qty</TableCell>
                  <TableCell align="right">Issued Qty</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.partName}</p>
                      {item.partCode && (
                        <p className="text-xs text-gray-400">Code: {item.partCode}</p>
                      )}
                    </TableCell>
                    <TableCell>{item.hsnCode}</TableCell>
                    <TableCell align="right" className="font-medium">
                      {item.requestedQty}
                    </TableCell>
                    <TableCell align="right">
                      {item.approvedQty !== undefined ? (
                        <span className="font-medium">{item.approvedQty}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {item.issuedQty !== undefined ? (
                        <span className="font-medium">{item.issuedQty}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell align="right">₹{item.unitPrice.toLocaleString()}</TableCell>
                    <TableCell align="right" className="font-medium">
                      ₹{item.totalPrice.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Badge
                        variant={
                          item.status === "approved"
                            ? "success"
                            : item.status === "rejected"
                            ? "danger"
                            : "warning"
                        }
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{order.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

