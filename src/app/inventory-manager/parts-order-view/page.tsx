"use client";
import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FileText, CheckCircle, Clock, XCircle, Package, TrendingUp } from "lucide-react";
import { partsOrderService, type PartsOrder } from "@/features/inventory/services/partsOrder.service";
import { initializeInventoryMockData } from "@/__mocks__/data/inventory.mock";

export default function PartsOrderViewPage() {
  const [orders, setOrders] = useState<PartsOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeInventoryMockData();
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await partsOrderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter((o) => o.status === statusFilter);

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">Purchase Orders</h1>
            <p className="text-gray-500 mt-1">View and track purchase orders</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="received">Received</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
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
                        Approved by {order.approvedBy} on {order.approvedAt ? new Date(order.approvedAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {filteredOrders.length === 0 && (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-600">No purchase orders match the selected filter.</p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

