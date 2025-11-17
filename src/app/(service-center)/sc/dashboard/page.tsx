"use client";
import {
  DollarSign,
  ClipboardList,
  Users,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Wrench,
  Truck,
  FileText,
  PlusCircle,
  ShoppingCart,
  LucideIcon,
  Calendar,
  Building2,
  UserCheck,
  AlertCircle,
  ArrowRightLeft,
} from "lucide-react";
import Link from "next/link";
import { useRole } from "@/shared/hooks";
import type { DashboardCard, Alert, QuickAction, UserRole } from "@/shared/types";

interface DashboardData {
  cards: DashboardCard[];
  alerts: Alert[];
  quickActions: QuickAction[];
  stats?: {
    jobsCompletedToday?: number;
    jobsInProgress?: number;
    jobsPending?: number;
    revenueToday?: string;
    revenueThisWeek?: string;
    revenueThisMonth?: string;
  };
}

export default function SCDashboard() {
  const { userRole, userInfo } = useRole();
  const serviceCenter = userInfo?.serviceCenter || "Pune Phase 1";

  const getDashboardData = (): DashboardData => {
    const baseData: Record<UserRole, DashboardData> = {
      sc_manager: {
        cards: [
          {
            title: "Today's Revenue",
            value: "₹45,000",
            change: "+12.5%",
            icon: DollarSign,
            color: "from-green-400/20 to-green-100",
            text: "text-green-600",
          },
          {
            title: "Services Completed Today",
            value: "5",
            change: "+2",
            icon: CheckCircle,
            color: "from-emerald-400/20 to-emerald-100",
            text: "text-emerald-600",
          },
          {
            title: "Active Job Cards",
            value: "12",
            change: "+2",
            icon: ClipboardList,
            color: "from-blue-400/20 to-blue-100",
            text: "text-blue-600",
          },
          {
            title: "Pending Approvals",
            value: "3",
            change: "Urgent",
            icon: CheckCircle,
            color: "from-orange-400/20 to-orange-100",
            text: "text-orange-600",
          },
          {
            title: "Workshop Capacity",
            value: "4/6",
            change: "2 Available",
            icon: Building2,
            color: "from-indigo-400/20 to-indigo-100",
            text: "text-indigo-600",
          },
          {
            title: "Overdue Payments",
            value: "₹16,500",
            change: "3 invoices",
            icon: AlertCircle,
            color: "from-red-400/20 to-red-100",
            text: "text-red-600",
          },
          {
            title: "Low Stock Items",
            value: "4",
            change: "Alert",
            icon: Package,
            color: "from-red-400/20 to-red-100",
            text: "text-red-600",
          },
        ],
        alerts: [
          {
            icon: AlertTriangle,
            color: "text-red-500 border-red-500",
            title: "Low stock alert - Brake pads (2 units remaining)",
            time: "30 min ago",
            action: "Request Parts",
          },
          {
            icon: UserCheck,
            color: "text-cyan-500 border-cyan-500",
            title: "8 pending customer requests need attention",
            time: "1 hour ago",
            action: "View",
          },
          {
            icon: CheckCircle,
            color: "text-blue-500 border-blue-500",
            title: "Service request pending approval - ₹3,500",
            time: "1 hour ago",
            action: "Review",
          },
          {
            icon: Wrench,
            color: "text-amber-500 border-amber-500",
            title: "6 parts needed for active jobs",
            time: "2 hours ago",
            action: "View",
          },
          {
            icon: ArrowRightLeft,
            color: "text-violet-500 border-violet-500",
            title: "2 pending transfer requests from central",
            time: "3 hours ago",
            action: "Review",
          },
          {
            icon: Clock,
            color: "text-yellow-500 border-yellow-500",
            title: "Job Card #JC-2025-045 delayed - Parts pending",
            time: "2 hours ago",
            action: "View",
          },
        ],
        quickActions: [
          {
            label: "Create Job Card",
            icon: PlusCircle,
            bg: "bg-gradient-to-r from-green-500 to-green-700",
            link: "/sc/job-cards?action=create",
          },
          {
            label: "Search Vehicle",
            icon: Package,
            bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
            link: "/sc/vehicle-search",
          },
          {
            label: "Generate Invoice",
            icon: FileText,
            bg: "bg-gradient-to-r from-purple-500 to-pink-500",
            link: "/sc/invoices?action=create",
          },
          {
            label: "View Pending Approvals",
            icon: CheckCircle,
            bg: "bg-gradient-to-r from-orange-500 to-yellow-500",
            link: "/sc/approvals",
          },
          {
            label: "Check Appointments",
            icon: Calendar,
            bg: "bg-gradient-to-r from-teal-500 to-cyan-500",
            link: "/sc/appointments",
          },
        ],
        stats: {
          jobsCompletedToday: 5,
          jobsInProgress: 8,
          jobsPending: 4,
          revenueToday: "₹45,000",
          revenueThisWeek: "₹2,45,000",
          revenueThisMonth: "₹8,90,000",
        },
      },
      sc_staff: {
        cards: [
          {
            title: "Today's Jobs",
            value: "8",
            change: "+2",
            icon: ClipboardList,
            color: "from-blue-400/20 to-blue-100",
            text: "text-blue-600",
          },
          {
            title: "Pending Invoices",
            value: "5",
            change: "₹45,000",
            icon: FileText,
            color: "from-yellow-400/20 to-yellow-100",
            text: "text-yellow-600",
          },
          {
            title: "OTC Orders Today",
            value: "12",
            change: "+3",
            icon: ShoppingCart,
            color: "from-green-400/20 to-green-100",
            text: "text-green-600",
          },
        ],
        alerts: [],
        quickActions: [
          {
            label: "Create Job Card",
            icon: PlusCircle,
            bg: "bg-gradient-to-r from-green-500 to-green-700",
            link: "/sc/job-cards?action=create",
          },
          {
            label: "Search Vehicle",
            icon: Package,
            bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
            link: "/sc/vehicle-search",
          },
          {
            label: "OTC Order",
            icon: ShoppingCart,
            bg: "bg-gradient-to-r from-orange-500 to-yellow-500",
            link: "/sc/otc-orders?action=create",
          },
        ],
      },
      service_engineer: {
        cards: [
          {
            title: "My Active Jobs",
            value: "3",
            change: "In Progress",
            icon: ClipboardList,
            color: "from-blue-400/20 to-blue-100",
            text: "text-blue-600",
          },
          {
            title: "Parts Requested",
            value: "2",
            change: "Pending",
            icon: Package,
            color: "from-orange-400/20 to-orange-100",
            text: "text-orange-600",
          },
          {
            title: "Home Service Jobs",
            value: "1",
            change: "Scheduled",
            icon: Truck,
            color: "from-green-400/20 to-green-100",
            text: "text-green-600",
          },
        ],
        alerts: [],
        quickActions: [
          {
            label: "View My Jobs",
            icon: ClipboardList,
            bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
            link: "/sc/job-cards",
          },
          {
            label: "Request Parts",
            icon: Package,
            bg: "bg-gradient-to-r from-orange-500 to-yellow-500",
            link: "/sc/parts-request",
          },
        ],
      },
      service_advisor: {
        cards: [
          {
            title: "Active Leads",
            value: "8",
            change: "+2",
            icon: Users,
            color: "from-blue-400/20 to-blue-100",
            text: "text-blue-600",
          },
          {
            title: "Pending Quotations",
            value: "5",
            change: "Urgent",
            icon: FileText,
            color: "from-orange-400/20 to-orange-100",
            text: "text-orange-600",
          },
          {
            title: "Today's Appointments",
            value: "6",
            change: "+1",
            icon: Clock,
            color: "from-green-400/20 to-green-100",
            text: "text-green-600",
          },
        ],
        alerts: [],
        quickActions: [
          {
            label: "Create Lead",
            icon: PlusCircle,
            bg: "bg-gradient-to-r from-green-500 to-green-700",
            link: "/sc/leads?action=create",
          },
          {
            label: "Search Vehicle",
            icon: Package,
            bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
            link: "/sc/vehicle-search",
          },
          {
            label: "Create Quotation",
            icon: FileText,
            bg: "bg-gradient-to-r from-purple-500 to-pink-500",
            link: "/sc/quotations?action=create",
          },
        ],
      },
      call_center: {
        cards: [
          {
            title: "Service Requests",
            value: "15",
            change: "+3",
            icon: FileText,
            color: "from-blue-400/20 to-blue-100",
            text: "text-blue-600",
          },
          {
            title: "Pending Appointments",
            value: "8",
            change: "Today",
            icon: Clock,
            color: "from-orange-400/20 to-orange-100",
            text: "text-orange-600",
          },
          {
            title: "Follow-ups Due",
            value: "5",
            change: "Urgent",
            icon: TrendingUp,
            color: "from-red-400/20 to-red-100",
            text: "text-red-600",
          },
        ],
        alerts: [],
        quickActions: [
          {
            label: "Create Service Request",
            icon: PlusCircle,
            bg: "bg-gradient-to-r from-green-500 to-green-700",
            link: "/sc/service-requests?action=create",
          },
          {
            label: "Schedule Appointment",
            icon: Clock,
            bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
            link: "/sc/appointments?action=create",
          },
        ],
      },
      admin: {
        cards: [],
        alerts: [],
        quickActions: [],
      },
      super_admin: {
        cards: [],
        alerts: [],
        quickActions: [],
      },
    };

    return baseData[userRole] || baseData.sc_manager;
  };

  const dashboardData = getDashboardData();

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-24 px-8 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Service Center Dashboard</h1>
          <p className="text-gray-500">
            Welcome to <span className="font-semibold text-purple-600">{serviceCenter}</span>
          </p>
        </div>

        {/* Revenue Summary Section */}
        {dashboardData.stats && userRole === "sc_manager" && (
          <div className="mb-6 bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              Revenue Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Today</p>
                <p className="text-2xl font-bold text-green-700">
                  {dashboardData.stats.revenueToday || "₹45,000"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-2xl font-bold text-blue-700">
                  {dashboardData.stats.revenueThisWeek || "₹2,45,000"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-purple-700">
                  {dashboardData.stats.revenueThisMonth || "₹8,90,000"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {dashboardData.cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl bg-gradient-to-tr ${card.color} p-5 shadow-md hover:shadow-lg transition-all`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl ${card.text} bg-white shadow-sm`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-sm text-gray-500">{card.change}</span>
                </div>
                <h2 className={`text-2xl font-bold ${card.text}`}>{card.value}</h2>
                <p className="text-sm text-gray-600 mt-1">{card.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dashboardData.alerts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-purple-700 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-purple-700" size={20} />
                Alerts
              </h3>
              <div className="space-y-4">
                {dashboardData.alerts.map((alert, idx) => {
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
                      {alert.action && (
                        <button className="bg-gradient-to-r from-blue-700 to-indigo-500 text-white text-sm px-4 py-1.5 rounded-lg shadow hover:opacity-90">
                          {alert.action}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-pink-600 mb-4 flex items-center gap-2">
              <PlusCircle className="text-pink-600" size={20} />
              Quick Actions
            </h3>
            <div className="space-y-4">
              {dashboardData.quickActions.map((action, idx) => {
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
                    <span className="text-gray-600 text-sm hover:text-gray-800">➜</span>
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

