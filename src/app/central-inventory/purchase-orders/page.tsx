"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileCheck,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { centralInventoryRepository } from "@/core/repositories/central-inventory.repository";
import type { PurchaseOrder } from "@/shared/types/central-inventory.types";

type FilterStatus = "all" | "pending" | "approved" | "rejected" | "fulfilled";

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const orders = await centralInventoryRepository.getAllPurchaseOrders();
        setPurchaseOrders(orders);
        setFilteredOrders(orders);
      } catch (error) {
        console.error("Failed to fetch purchase orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchaseOrders();
  }, []);

  useEffect(() => {
    let filtered = [...purchaseOrders];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((po) => po.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (po) =>
          po.poNumber.toLowerCase().includes(query) ||
          po.serviceCenterName.toLowerCase().includes(query) ||
          po.requestedBy.toLowerCase().includes(query) ||
          po.items.some((item) => item.partName.toLowerCase().includes(query))
      );
    }

    setFilteredOrders(filtered);
  }, [purchaseOrders, searchQuery, statusFilter]);

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

  const statusCounts = {
    all: purchaseOrders.length,
    pending: purchaseOrders.filter((po) => po.status === "pending").length,
    approved: purchaseOrders.filter((po) => po.status === "approved").length,
    rejected: purchaseOrders.filter((po) => po.status === "rejected").length,
    fulfilled: purchaseOrders.filter((po) => po.status === "fulfilled").length,
  };

  if (isLoading) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading purchase orders...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Purchase Orders</h1>
          <p className="text-gray-500">View and manage purchase orders from service centers</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by PO number, service center, part name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                {(
                  [
                    { key: "all", label: "All", icon: FileCheck },
                    { key: "pending", label: "Pending", icon: Clock },
                    { key: "approved", label: "Approved", icon: CheckCircle },
                    { key: "rejected", label: "Rejected", icon: XCircle },
                    { key: "fulfilled", label: "Fulfilled", icon: CheckCircle },
                  ] as const
                ).map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key as FilterStatus)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      statusFilter === filter.key
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <filter.icon className="w-4 h-4" />
                    <span>{filter.label}</span>
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                      {statusCounts[filter.key as keyof typeof statusCounts]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Purchase Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No purchase orders found</p>
                {searchQuery || statusFilter !== "all" ? (
                  <p className="text-gray-400 text-sm mt-2">
                    Try adjusting your search or filter criteria
                  </p>
                ) : null}
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((po) => (
              <Card key={po.id} className="hover:shadow-md transition-shadow">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/central-inventory/purchase-orders/${po.id}`}
                          className="text-xl font-semibold text-blue-600 hover:text-blue-700"
                        >
                          {po.poNumber}
                        </Link>
                        {getStatusBadge(po.status)}
                        {getPriorityBadge(po.priority)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Service Center:</span> {po.serviceCenterName}
                        </div>
                        <div>
                          <span className="font-medium">Requested By:</span> {po.requestedBy}
                        </div>
                        <div>
                          <span className="font-medium">Items:</span> {po.items.length} part(s)
                        </div>
                        <div>
                          <span className="font-medium">Total Amount:</span> ₹
                          {po.totalAmount.toLocaleString()}
                        </div>
                        {po.jobCardId && (
                          <div>
                            <span className="font-medium">Job Card:</span> {po.jobCardId}
                          </div>
                        )}
                        {po.vehicleNumber && (
                          <div>
                            <span className="font-medium">Vehicle:</span> {po.vehicleNumber}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        Requested: {new Date(po.requestedAt).toLocaleString()}
                        {po.approvedAt && (
                          <> • Approved: {new Date(po.approvedAt).toLocaleString()}</>
                        )}
                        {po.rejectedAt && (
                          <> • Rejected: {new Date(po.rejectedAt).toLocaleString()}</>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/central-inventory/purchase-orders/${po.id}`}
                      className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

