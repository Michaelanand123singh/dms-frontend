"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Package,
  Users,
  Star,
  PlusCircle,
  UserPlus,
  AlertTriangle,
  FileWarning,
  XCircle,
  LucideIcon,
  CheckSquare,
  ArrowRight,
} from "lucide-react";
import type { DashboardCard, Alert, QuickAction } from "@/shared/types";

import { adminApprovalService } from "@/features/inventory/services/adminApproval.service";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { PartsIssue } from "@/shared/types/central-inventory.types";

export default function Dashboard() {
  const [selectedCentre, setSelectedCentre] = useState("All Centres");
  const [pendingPartsIssues, setPendingPartsIssues] = useState<PartsIssue[]>([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(true);

  // Load centres from localStorage
  const centres = ["All Centres"];
  const dashboardData: Record<string, { cards: DashboardCard[]; alerts: Alert[] }> = {
    "All Centres": {
      cards: [
        { title: "Revenue", value: "₹0", change: "+0%", color: "from-green-500 to-emerald-600", text: "text-green-600", icon: DollarSign },
        { title: "Parts Sold", value: "0", change: "+0%", color: "from-blue-500 to-indigo-600", text: "text-blue-600", icon: Package },
        { title: "Active Users", value: "0", change: "+0%", color: "from-purple-500 to-violet-600", text: "text-purple-600", icon: Users },
        { title: "Avg Rating", value: "0.0", change: "+0%", color: "from-yellow-500 to-orange-600", text: "text-yellow-600", icon: Star },
      ],
      alerts: [],
    },
  };

  const data = dashboardData;

  const current = data[selectedCentre] || data["All Centres"];

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        setIsLoadingApprovals(true);
        // Fetch pending parts issue approvals
        const partsIssues = await adminApprovalService.getPendingApprovals();
        setPendingPartsIssues(partsIssues);
      } catch (error) {
        console.error("Failed to fetch pending approvals:", error);
      } finally {
        setIsLoadingApprovals(false);
      }
    };

    fetchPendingApprovals();
  }, []);

  const quickActions: QuickAction[] = [
    {
      label: "Parts Issue Approvals",
      icon: CheckSquare,
      bg: "bg-gradient-to-r from-orange-500 to-red-500",
      link: "/parts-issue-approvals",
    },
    {
      label: "Add Service Centre",
      icon: PlusCircle,
      bg: "bg-gradient-to-r from-green-500 to-green-700",
      link: "/servicecenters",
    },
    {
      label: "Create User",
      icon: UserPlus,
      bg: "bg-gradient-to-r from-purple-500 to-indigo-500",
      link: "/user&roles",
    },
    {
      label: "Generate Report",
      icon: FileWarning,
      bg: "bg-gradient-to-r from-pink-500 to-rose-500",
      link: "/reports",
    },
  ];

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-24 px-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Dashboard</h1>
            <p className="text-gray-500">
              Overview for{" "}
              <span className="font-semibold text-purple-600">
                {selectedCentre}
              </span>
            </p>
          </div>

          <select
            value={selectedCentre}
            onChange={(e) => setSelectedCentre(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 shadow-sm hover:border-purple-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all cursor-pointer"
          >
            {centres.map((centre) => (
              <option key={centre} value={centre}>
                {centre}
              </option>
            ))}
          </select>
        </div>

        {/* Approval Stats Card */}
        <div className="mb-6">
          <Link href="/parts-issue-approvals">
            <div className="rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 p-5 shadow-md hover:shadow-lg transition-all cursor-pointer max-w-md">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl text-orange-600 bg-white shadow-sm">
                  <CheckSquare size={24} />
                </div>
                <Badge className="bg-white text-orange-600">
                  {isLoadingApprovals ? "..." : pendingPartsIssues.length} Pending
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {isLoadingApprovals ? "..." : pendingPartsIssues.length}
              </h2>
              <p className="text-sm text-white/90 mt-1">Parts Issue Approvals</p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {current.cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className={`rounded-2xl bg-gradient-to-tr ${c.color} p-5 shadow-md hover:shadow-lg transition-all`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl ${c.text} bg-white shadow-sm`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-sm text-gray-500">{c.change}</span>
                </div>
                <h2 className={`text-2xl font-bold ${c.text}`}>{c.value}</h2>
                <p className="text-sm text-gray-600 mt-1">{c.title}</p>
              </div>
            );
          })}
        </div>

        {/* Pending Approvals Section */}
        <div className="mb-10">
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CheckSquare className="text-orange-600" size={20} />
                  Parts Issue Approvals
                </h3>
                <Badge variant="warning" className="text-sm">
                  {pendingPartsIssues.length} Pending
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              {isLoadingApprovals ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                </div>
              ) : pendingPartsIssues.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <CheckSquare className="mx-auto text-green-500 mb-2" size={32} />
                  <p className="text-sm">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPartsIssues.slice(0, 3).map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {issue.issueNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {issue.serviceCenterName} • ₹{issue.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <Link href="/parts-issue-approvals">
                        <button className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1">
                          Review
                          <ArrowRight size={14} />
                        </button>
                      </Link>
                    </div>
                  ))}
                  {pendingPartsIssues.length > 3 && (
                    <Link href="/parts-issue-approvals">
                      <div className="text-center pt-2">
                        <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                          View all {pendingPartsIssues.length} pending approvals →
                        </button>
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-purple-700 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-purple-700" size={20} />
              Real-time Alerts
            </h3>

            {current.alerts.length > 0 ? (
              <div className="space-y-4">
                {current.alerts.map((alert, idx) => {
                  const Icon = alert.icon;
                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition border border-gray-100"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full border ${alert.color} flex items-center justify-center`}
                        >
                          <Icon className={alert.color} size={20} />
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium text-sm leading-snug">
                            {alert.title}
                          </p>
                          <p className="text-xs text-gray-500">{alert.time}</p>
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-blue-700 to-indigo-500 text-white text-sm px-4 py-1.5 rounded-lg shadow hover:opacity-90">
                        View
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No alerts for this centre.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-pink-600 mb-4 flex items-center gap-2">
              <PlusCircle className="text-pink-600" size={20} />
              Quick Actions
            </h3>

            <div className="space-y-4">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={idx}
                    href={action.link}
                    className="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`${action.bg} text-white p-2 rounded-lg flex items-center justify-center`}
                      >
                        <Icon size={20} />
                      </div>
                      <p className="text-gray-800 font-medium">{action.label}</p>
                    </div>
                    <span className="text-gray-600 text-sm hover:text-gray-800">
                      ➜
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

