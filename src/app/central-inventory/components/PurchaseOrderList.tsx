"use client";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { PurchaseOrder } from "@/shared/types/central-inventory.types";

interface PurchaseOrderListProps {
  orders: PurchaseOrder[];
  loading?: boolean;
  onOrderClick?: (order: PurchaseOrder) => void;
}

export function PurchaseOrderList({
  orders,
  loading = false,
  onOrderClick,
}: PurchaseOrderListProps) {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading purchase orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No purchase orders found</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardBody>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Link
                    href={`/central-inventory/purchase-orders/${order.id}`}
                    className="text-xl font-semibold text-blue-600 hover:text-blue-700"
                    onClick={(e) => {
                      if (onOrderClick) {
                        e.preventDefault();
                        onOrderClick(order);
                      }
                    }}
                  >
                    {order.poNumber}
                  </Link>
                  {getStatusBadge(order.status)}
                  {getPriorityBadge(order.priority)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Service Center:</span> {order.serviceCenterName}
                  </div>
                  <div>
                    <span className="font-medium">Requested By:</span> {order.requestedBy}
                  </div>
                  <div>
                    <span className="font-medium">Items:</span> {order.items.length} part(s)
                  </div>
                  <div>
                    <span className="font-medium">Total Amount:</span> ₹
                    {order.totalAmount.toLocaleString()}
                  </div>
                  {order.jobCardId && (
                    <div>
                      <span className="font-medium">Job Card:</span> {order.jobCardId}
                    </div>
                  )}
                  {order.vehicleNumber && (
                    <div>
                      <span className="font-medium">Vehicle:</span> {order.vehicleNumber}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  Requested: {new Date(order.requestedAt).toLocaleString()}
                  {order.approvedAt && (
                    <> • Approved: {new Date(order.approvedAt).toLocaleString()}</>
                  )}
                  {order.rejectedAt && (
                    <> • Rejected: {new Date(order.rejectedAt).toLocaleString()}</>
                  )}
                </div>
              </div>
              <Link
                href={`/central-inventory/purchase-orders/${order.id}`}
                className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={(e) => {
                  if (onOrderClick) {
                    e.preventDefault();
                    onOrderClick(order);
                  }
                }}
              >
                <Eye className="w-5 h-5" />
              </Link>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

