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
} from "lucide-react";

export default function Dashboard() {
  const [selectedCentre, setSelectedCentre] = useState("All Centres");

  const centres = [
    "All Centres",
    "Pune phase 1",
    "Lonavla",
    "Mumbai",
    "Pune phase 2",
  ];

  const data = {
    "All Centres": {
      cards: [
        {
          title: "Total Revenue",
          value: "₹69,95,000",
          change: "+12.5%",
          icon: DollarSign,
          color: "from-green-400/20 to-green-100",
          text: "text-green-600",
        },
        {
          title: "Total Active Jobs",
          value: "98",
          change: "+5",
          icon: Package,
          color: "from-blue-400/20 to-blue-100",
          text: "text-blue-600",
        },
        {
          title: "Total Staff",
          value: "145",
          change: "+2",
          icon: Users,
          color: "from-red-400/20 to-red-100",
          text: "text-red-600",
        },
        {
          title: "Customer Satisfaction",
          value: "94.2%",
          change: "+2.1%",
          icon: Star,
          color: "from-yellow-400/20 to-yellow-100",
          text: "text-yellow-600",
        },
      ],
      alerts: [
        {
          icon: AlertTriangle,
          color: "text-red-500 border-red-500",
          title:
            "Complaint Escalated - Customer complaint #4521 exceeded SLA",
          time: "30 min ago",
        },
        {
          icon: CheckCircle,
          color: "text-blue-500 border-blue-500",
          title:
            "Pending Approval - ₹15,000 service request awaiting approval",
          time: "1 hour ago",
        },
        {
          icon: FileWarning,
          color: "text-yellow-500 border-yellow-500",
          title:
            "Payment Overdue - Invoice #INV-2024-456 pending for 10 days",
          time: "2 hours ago",
        },
        {
          icon: XCircle,
          color: "text-red-600 border-red-600",
          title:
            "System Alert - Backup failed at Chennai Express Service",
          time: "3 hours ago",
        },
      ],
    },
    "Pune phase 1": {
      cards: [
        {
          title: "Total Revenue",
          value: "₹21,20,000",
          change: "+8.1%",
          icon: DollarSign,
          color: "from-green-400/20 to-green-100",
          text: "text-green-600",
        },
        {
          title: "Total Active Jobs",
          value: "32",
          change: "+2",
          icon: Package,
          color: "from-blue-400/20 to-blue-100",
          text: "text-blue-600",
        },
        {
          title: "Total Staff",
          value: "48",
          change: "+1",
          icon: Users,
          color: "from-red-400/20 to-red-100",
          text: "text-red-600",
        },
        {
          title: "Customer Satisfaction",
          value: "96.8%",
          change: "+1.5%",
          icon: Star,
          color: "from-yellow-400/20 to-yellow-100",
          text: "text-yellow-600",
        },
      ],
      alerts: [
        {
          icon: FileWarning,
          color: "text-yellow-500 border-yellow-500",
          title: "Service delay due to parts shortage",
          time: "1 hour ago",
        },
        {
          icon: XCircle,
          color: "text-red-500 border-red-500",
          title: "Server backup skipped last night",
          time: "2 hours ago",
        },
      ],
    },
    Lonavla: {
      cards: [
        {
          title: "Total Revenue",
          value: "₹18,45,000",
          change: "+9.7%",
          icon: DollarSign,
          color: "from-green-400/20 to-green-100",
          text: "text-green-600",
        },
        {
          title: "Total Active Jobs",
          value: "27",
          change: "+1",
          icon: Package,
          color: "from-blue-400/20 to-blue-100",
          text: "text-blue-600",
        },
        {
          title: "Total Staff",
          value: "40",
          change: "+0",
          icon: Users,
          color: "from-red-400/20 to-red-100",
          text: "text-red-600",
        },
        {
          title: "Customer Satisfaction",
          value: "92.1%",
          change: "-0.3%",
          icon: Star,
          color: "from-yellow-400/20 to-yellow-100",
          text: "text-yellow-600",
        },
      ],
      alerts: [
        {
          icon: CheckCircle,
          color: "text-blue-500 border-blue-500",
          title: "New booking received for premium wash",
          time: "45 min ago",
        },
      ],
    },
    Mumbai: {
      cards: [
        {
          title: "Total Revenue",
          value: "₹45,80,000",
          change: "+7.8%",
          icon: DollarSign,
          color: "from-green-400/20 to-green-100",
          text: "text-green-600",
        },
        {
          title: "Total Active Jobs",
          value: "72",
          change: "+4",
          icon: Package,
          color: "from-blue-400/20 to-blue-100",
          text: "text-blue-600",
        },
        {
          title: "Total Staff",
          value: "89",
          change: "+3",
          icon: Users,
          color: "from-red-400/20 to-red-100",
          text: "text-red-600",
        },
        {
          title: "Customer Satisfaction",
          value: "93.4%",
          change: "+1.2%",
          icon: Star,
          color: "from-yellow-400/20 to-yellow-100",
          text: "text-yellow-600",
        },
      ],
      alerts: [
        {
          icon: FileWarning,
          color: "text-yellow-500 border-yellow-500",
          title: "Fuel cost overrun alert",
          time: "2 hours ago",
        },
      ],
    },
    "Pune phase 2": {
      cards: [
        {
          title: "Total Revenue",
          value: "₹22,40,000",
          change: "+5.5%",
          icon: DollarSign,
          color: "from-green-400/20 to-green-100",
          text: "text-green-600",
        },
        {
          title: "Total Active Jobs",
          value: "36",
          change: "+2",
          icon: Package,
          color: "from-blue-400/20 to-blue-100",
          text: "text-blue-600",
        },
        {
          title: "Total Staff",
          value: "52",
          change: "+1",
          icon: Users,
          color: "from-red-400/20 to-red-100",
          text: "text-red-600",
        },
        {
          title: "Customer Satisfaction",
          value: "94.7%",
          change: "+1.0%",
          icon: Star,
          color: "from-yellow-400/20 to-yellow-100",
          text: "text-yellow-600",
        },
      ],
      alerts: [],
    },
  };

  const current = data[selectedCentre] || data["All Centres"];

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-24 px-8 pb-10">
        {/* Header */}
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

          {/* Filter */}
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

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {current.cards.map((c) => (
            <div
              key={c.title}
              className={`rounded-2xl bg-gradient-to-tr ${c.color} p-5 shadow-md hover:shadow-lg transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl ${c.text} bg-white shadow-sm`}>
                  <c.icon size={24} />
                </div>
                <span className="text-sm text-gray-500">{c.change}</span>
              </div>
              <h2 className={`text-2xl font-bold ${c.text}`}>{c.value}</h2>
              <p className="text-sm text-gray-600 mt-1">{c.title}</p>
            </div>
          ))}
        </div>

        {/* Alerts & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-purple-700 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-purple-700" size={20} />
              Real-time Alerts
            </h3>

            {current.alerts.length > 0 ? (
              <div className="space-y-4">
                {current.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition border border-gray-100"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full border ${alert.color} flex items-center justify-center`}
                      >
                        <alert.icon className={`${alert.color}`} size={20} />
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
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No alerts for this centre.
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-pink-600 mb-4 flex items-center gap-2">
              <PlusCircle className="text-pink-600" size={20} />
              Quick Actions
            </h3>

            <div className="space-y-4">
              {[
                {
                  label: "Add Service Centre",
                  icon: PlusCircle,
                  bg: "bg-gradient-to-r from-green-500 to-green-700",
                  link: "/service-centre",
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
              ].map((action, idx) => (
                <Link
                  key={idx}
                  href={action.link}
                  className="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`${action.bg} text-white p-2 rounded-lg flex items-center justify-center`}
                    >
                      <action.icon size={20} />
                    </div>
                    <p className="text-gray-800 font-medium">{action.label}</p>
                  </div>
                  <span className="text-gray-600 text-sm hover:text-gray-800">
                    ➜ 
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
