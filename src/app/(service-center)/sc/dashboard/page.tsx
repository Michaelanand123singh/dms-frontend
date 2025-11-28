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
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { useState, useEffect } from "react";
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
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState<number>(0);

  // Calculate today's appointments from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const calculateTodayAppointments = () => {
        const appointments = safeStorage.getItem<Array<{
          id: number;
          customerName: string;
          vehicle: string;
          phone: string;
          serviceType: string;
          date: string;
          time: string;
          duration: string;
          status: string;
        }>>("appointments", []);

        const today = new Date().toISOString().split("T")[0];
        const todayAppointments = appointments.filter((apt) => apt.date === today);
        
        // Defer state update to avoid synchronous setState in effect
        requestAnimationFrame(() => {
          setTodayAppointmentsCount(todayAppointments.length);
        });
      };

      // Initial calculation
      calculateTodayAppointments();

      // Listen for storage changes to update count
      const handleStorageChange = () => {
        const updatedAppointments = safeStorage.getItem<Array<{
          id: number;
          customerName: string;
          vehicle: string;
          phone: string;
          serviceType: string;
          date: string;
          time: string;
          duration: string;
          status: string;
        }>>("appointments", []);
        const today = new Date().toISOString().split("T")[0];
        const todayApts = updatedAppointments.filter((apt) => apt.date === today);
        
        // Defer state update to avoid synchronous setState in callback
        requestAnimationFrame(() => {
          setTodayAppointmentsCount(todayApts.length);
        });
      };

      window.addEventListener("storage", handleStorageChange);
      // Also check periodically for same-tab updates
      const interval = setInterval(handleStorageChange, 1000);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        clearInterval(interval);
      };
    }
  }, []);

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
            value: todayAppointmentsCount.toString(),
            change: todayAppointmentsCount > 0 ? `+${todayAppointmentsCount}` : "0",
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
    <div className="bg-gray-50 min-h-screen">
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Service Center</h1>
        </div>

        {/* Revenue Summary Section */}
        {dashboardData.stats && userRole === "sc_manager" && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-600" size={20} strokeWidth={2} />
              Revenue Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-5 border border-emerald-200/50 hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Today</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {dashboardData.stats.revenueToday || "₹45,000"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-5 border border-blue-200/50 hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">This Week</p>
                <p className="text-2xl font-bold text-blue-700">
                  {dashboardData.stats.revenueThisWeek || "₹2,45,000"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-lg p-5 border border-indigo-200/50 hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">This Month</p>
                <p className="text-2xl font-bold text-indigo-700">
                  {dashboardData.stats.revenueThisMonth || "₹8,90,000"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {dashboardData.cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`rounded-xl bg-white border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-lg ${card.text} bg-gradient-to-br ${card.color} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{card.change}</span>
                </div>
                <h2 className={`text-2xl font-bold ${card.text} mb-1`}>{card.value}</h2>
                <p className="text-sm text-gray-600 font-medium">{card.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dashboardData.alerts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-amber-600" size={20} strokeWidth={2} />
                Alerts
              </h3>
              <div className="space-y-3">
                {dashboardData.alerts.map((alert, idx) => {
                  const Icon = alert.icon;
                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-gray-50/50 p-4 rounded-lg hover:bg-gray-50 transition-all duration-150 border border-gray-100"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`p-2 rounded-lg border ${alert.color} bg-white flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className={alert.color} size={18} strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium text-sm leading-snug">
                            {alert.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                        </div>
                      </div>
                      {alert.action && (
                        <button className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 ml-3 flex-shrink-0">
                          {alert.action}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PlusCircle className="text-indigo-600" size={20} strokeWidth={2} />
              Quick Actions
            </h3>
            <div className="space-y-2.5">
              {dashboardData.quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={idx}
                    href={action.link}
                    className="flex items-center justify-between bg-gray-50/50 rounded-lg p-4 hover:bg-indigo-50/50 transition-all duration-150 border border-gray-100 hover:border-indigo-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`${action.bg} text-white p-2 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200`}
                      >
                        <Icon size={18} strokeWidth={2} />
                      </div>
                      <p className="text-gray-900 font-medium text-sm group-hover:text-indigo-700 transition-colors">{action.label}</p>
                    </div>
                    <span className="text-gray-400 group-hover:text-indigo-600 text-sm transition-colors">→</span>
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

