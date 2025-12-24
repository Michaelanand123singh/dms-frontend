"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Eye,
  ShoppingCart,
  FileText,
  TrendingUp,
  LucideIcon,
  Clock,
  User,
  Car,
  ArrowRight,
} from "lucide-react";
import { StatsCard } from "@/components/data-display/StatsCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { usePartsApproval } from "@/shared/hooks/usePartsApproval";
import { partsMasterService } from "@/features/inventory/services/partsMaster.service";
import { jobCardPartsRequestService } from "@/features/inventory/services/jobCardPartsRequest.service";
import type { InventoryStats, Part } from "@/shared/types/inventory.types";
import type { JobCardPartsRequest } from "@/shared/types/jobcard-inventory.types";

interface QuickAction {
  label: string;
  icon: LucideIcon;
  bg: string;
  link: string;
}

export default function InventoryManagerDashboard() {
  const { pendingRequests, refresh } = usePartsApproval();
  const [stats, setStats] = useState<InventoryStats>({
    totalParts: 0,
    lowStockParts: 0,
    outOfStockParts: 0,
    totalValue: 0,
    pendingOrders: 0,
    recentEntries: 0,
  });
  const [recentRequests, setRecentRequests] = useState<JobCardPartsRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch parts and calculate stats
        const parts = await partsMasterService.getAll();
        const totalParts = parts.length;
        const lowStockParts = parts.filter((p) => p.stockQuantity < p.minStockLevel && p.stockQuantity > 0).length;
        const outOfStockParts = parts.filter((p) => p.stockQuantity === 0).length;
        const totalValue = parts.reduce((sum, p) => sum + p.price * p.stockQuantity, 0);

        // Fetch recent parts requests (last 5)
        const allRequests = await jobCardPartsRequestService.getAll();
        const recent = allRequests
          .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
          .slice(0, 5);

        // Count recent entries (last 7 days) - check parts entries
        const { partsEntryService } = await import("@/features/inventory/services/partsEntry.service");
        const recentEntriesData = await partsEntryService.getRecent(10);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentEntries = recentEntriesData.filter(
          (e) => new Date(e.createdAt) >= sevenDaysAgo
        ).length;

        setStats({
          totalParts,
          lowStockParts,
          outOfStockParts,
          totalValue,
          pendingOrders: pendingRequests.length,
          recentEntries,
        });

        setRecentRequests(recent);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    refresh(); // Refresh pending requests
  }, [pendingRequests.length, refresh]);

  const quickActions: QuickAction[] = [
    {
      label: "Add New Part",
      icon: PlusCircle,
      bg: "bg-gradient-to-r from-green-500 to-green-700",
      link: "/inventory-manager/parts-master",
    },
    {
      label: "View All Parts",
      icon: Eye,
      bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
      link: "/inventory-manager/parts-master",
    },
    {
      label: "Create Order",
      icon: ShoppingCart,
      bg: "bg-gradient-to-r from-orange-500 to-yellow-500",
      link: "/inventory-manager/parts-order-entry",
    },
    {
      label: "Pending Approvals",
      icon: CheckCircle,
      bg: "bg-gradient-to-r from-purple-500 to-pink-500",
      link: "/inventory-manager/approvals",
    },
  ];

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-24 px-8 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Inventory Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your inventory and parts efficiently</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Parts"
            value={stats.totalParts}
            icon={Package}
            trend="neutral"
          />
          <StatsCard
            title="Low Stock Parts"
            value={stats.lowStockParts}
            change={`${stats.outOfStockParts} out of stock`}
            icon={AlertTriangle}
            trend={stats.lowStockParts > 0 ? "down" : "neutral"}
          />
          <StatsCard
            title="Total Inventory Value"
            value={`₹${stats.totalValue.toLocaleString()}`}
            icon={TrendingUp}
            trend="neutral"
          />
          <StatsCard
            title="Pending Approvals"
            value={stats.pendingOrders}
            icon={CheckCircle}
            trend={stats.pendingOrders > 0 ? "up" : "neutral"}
          />
          <StatsCard
            title="Recent Entries"
            value={stats.recentEntries}
            icon={FileText}
            trend="neutral"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.link}
                  className={`${action.bg} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
                >
                  <div className="flex flex-col items-center text-center">
                    <Icon size={32} className="mb-3" />
                    <span className="font-semibold">{action.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Pending Approvals Alert */}
        {pendingRequests.length > 0 && (
          <Card className="mb-8 border-l-4 border-l-orange-500 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-orange-500" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Parts Confirmation Needed ({pendingRequests.length})
                  </h3>
                </div>
                <Badge variant="warning">{pendingRequests.length} Pending</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 mb-4">
                You have {pendingRequests.length} pending job card parts request{pendingRequests.length > 1 ? "s" : ""} waiting for approval from SC Managers.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/inventory-manager/approvals"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Review Requests
                  <ArrowRight size={16} />
                </Link>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Recent Parts Requests from Job Cards */}
        {recentRequests.length > 0 && (
          <Card className="mb-8 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="text-indigo-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Parts Requests</h3>
                </div>
                <Link
                  href="/inventory-manager/approvals"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 rounded-lg border ${request.status === "pending"
                      ? "bg-orange-50 border-orange-200"
                      : request.status === "approved"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            Job Card: {request.jobCardId}
                          </h4>
                          <Badge
                            variant={
                              request.status === "pending"
                                ? "warning"
                                : request.status === "approved"
                                  ? "success"
                                  : "danger"
                            }
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-1">
                            <Car size={14} />
                            <span>{request.vehicleNumber || request.vehicleId || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span>{request.customerName || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>
                              {new Date(request.requestedAt).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Requested Parts:</p>
                      <div className="flex flex-wrap gap-2">
                        {request.parts.map((part, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-xs font-medium text-gray-700 border border-gray-200"
                          >
                            <Package size={12} />
                            {part.partName} (Qty: {part.quantity})
                          </span>
                        ))}
                      </div>
                    </div>
                    {request.status === "pending" && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Requested by:</span> {request.requestedBy}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Empty State for Recent Requests */}
        {recentRequests.length === 0 && pendingRequests.length === 0 && (
          <Card className="mb-8">
            <CardBody>
              <div className="text-center py-12">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">
                  No pending parts requests. When SC Managers create job cards with parts, they will appear here.
                </p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

