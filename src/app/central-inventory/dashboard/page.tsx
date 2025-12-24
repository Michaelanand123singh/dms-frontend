"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  Warehouse,
  TrendingUp,
  ArrowRightCircle,
  Clock,
  DollarSign,
  Building,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import { StatsCard } from "@/components/data-display/StatsCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { centralInventoryRepository } from "@/core/repositories/central-inventory.repository";
import type {
  CentralInventoryStats,
  PurchaseOrder,
  PartsIssue,
} from "@/shared/types/central-inventory.types";

interface QuickAction {
  label: string;
  icon: LucideIcon;
  bg: string;
  link: string;
}

export default function CentralInventoryDashboard() {
  const [stats, setStats] = useState<CentralInventoryStats>({
    totalParts: 0,
    totalStockValue: 0,
    lowStockParts: 0,
    outOfStockParts: 0,
    pendingPurchaseOrders: 0,
    approvedPurchaseOrders: 0,
    pendingIssues: 0,
    totalServiceCenters: 0,
    recentActivity: 0,
  });
  const [recentPurchaseOrders, setRecentPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [recentIssues, setRecentIssues] = useState<PartsIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await centralInventoryRepository.getStats();
        setStats(statsData);

        // Fetch recent purchase orders
        const allPOs = await centralInventoryRepository.getAllPurchaseOrders();
        const recentPOs = allPOs
          .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
          .slice(0, 5);
        setRecentPurchaseOrders(recentPOs);

        // Fetch recent parts issues
        const allIssues = await centralInventoryRepository.getAllPartsIssues();
        const recentIssuesData = allIssues
          .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
          .slice(0, 5);
        setRecentIssues(recentIssuesData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions: QuickAction[] = [
    {
      label: "View Purchase Orders",
      icon: FileCheck,
      bg: "bg-blue-500",
      link: "/central-inventory/purchase-orders",
    },
    {
      label: "Manage Stock",
      icon: Warehouse,
      bg: "bg-green-500",
      link: "/central-inventory/stock",
    },
    {
      label: "Issue Parts",
      icon: ArrowRightCircle,
      bg: "bg-purple-500",
      link: "/central-inventory/stock/issue",
    },
    {
      label: "Update Stock",
      icon: TrendingUp,
      bg: "bg-orange-500",
      link: "/central-inventory/stock/update",
    },
  ];

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

  const getIssueStatusBadge = (status: PartsIssue["status"]) => {
    const variants: Record<PartsIssue["status"], { color: string; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      pending_admin_approval: { color: "bg-orange-100 text-orange-800", label: "Pending Admin Approval" },
      admin_approved: { color: "bg-green-100 text-green-800", label: "Admin Approved" },
      admin_rejected: { color: "bg-red-100 text-red-800", label: "Admin Rejected" },
      issued: { color: "bg-blue-100 text-blue-800", label: "Issued" },
      received: { color: "bg-green-100 text-green-800", label: "Received" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Central Inventory Dashboard</h1>
          <p className="text-gray-500">Manage central warehouse stock and service center orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Parts"
            value={stats.totalParts.toString()}
            icon={Package}
          />
          <StatsCard
            title="Stock Value"
            value={`₹${(stats.totalStockValue / 100000).toFixed(1)}L`}
            icon={DollarSign}
          />
          <StatsCard
            title="Low Stock"
            value={stats.lowStockParts.toString()}
            icon={AlertTriangle}
          />
          <StatsCard
            title="Out of Stock"
            value={stats.outOfStockParts.toString()}
            icon={AlertTriangle}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Pending POs"
            value={stats.pendingPurchaseOrders.toString()}
            icon={FileCheck}
          />
          <StatsCard
            title="Approved POs"
            value={stats.approvedPurchaseOrders.toString()}
            icon={CheckCircle}
          />
          <StatsCard
            title="Pending Issues"
            value={stats.pendingIssues.toString()}
            icon={Clock}
          />
          <StatsCard
            title="Service Centers"
            value={stats.totalServiceCenters.toString()}
            icon={Building}
          />
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.link}
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className={`${action.bg} p-3 rounded-lg text-white`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-gray-700">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Purchase Orders */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Recent Purchase Orders</h2>
              <Link
                href="/central-inventory/purchase-orders"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardBody>
              {recentPurchaseOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No purchase orders yet</p>
              ) : (
                <div className="space-y-4">
                  {recentPurchaseOrders.map((po) => (
                    <div
                      key={po.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Link
                            href={`/central-inventory/purchase-orders/${po.id}`}
                            className="font-semibold text-blue-600 hover:text-blue-700"
                          >
                            {po.poNumber}
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">{po.serviceCenterName}</p>
                        </div>
                        {getStatusBadge(po.status)}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                        <span>{po.items.length} item(s)</span>
                        <span className="font-medium">₹{po.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(po.requestedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Parts Issues */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Recent Parts Issues</h2>
              <Link
                href="/central-inventory/stock/issue"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardBody>
              {recentIssues.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No parts issues yet</p>
              ) : (
                <div className="space-y-4">
                  {recentIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-blue-600">{issue.issueNumber}</p>
                          <p className="text-sm text-gray-600 mt-1">{issue.serviceCenterName}</p>
                        </div>
                        {getIssueStatusBadge(issue.status)}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                        <span>{issue.items.length} item(s)</span>
                        <span className="font-medium">₹{issue.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(issue.issuedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

