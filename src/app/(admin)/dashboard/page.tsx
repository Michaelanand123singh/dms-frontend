"use client";
import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Package,
  Users,
  Star,
  PlusCircle,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  FileWarning,
  XCircle,
  LucideIcon,
} from "lucide-react";
import type { DashboardCard, Alert, QuickAction } from "@/shared/types";
import { dashboardData, centres } from "@/__mocks__/data/dashboard.mock";

export default function Dashboard() {
  const [selectedCentre, setSelectedCentre] = useState("All Centres");

  const data = dashboardData;

  const current = data[selectedCentre] || data["All Centres"];

  const quickActions: QuickAction[] = [
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
      label: "Approve Requests",
      icon: CheckCircle,
      bg: "bg-gradient-to-r from-orange-500 to-yellow-500",
      link: "/approvals",
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

