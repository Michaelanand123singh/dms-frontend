/**
 * Mock data for Admin Dashboard
 */

import { DollarSign, Package, Users, Star, AlertTriangle, CheckCircle, FileWarning, XCircle, LucideIcon } from "lucide-react";

export interface DashboardCard {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  text: string;
}

export interface Alert {
  icon: LucideIcon;
  color: string;
  title: string;
  time: string;
}

export interface DashboardData {
  cards: DashboardCard[];
  alerts: Alert[];
}

export const centres = [
  "All Centres",
  "Pune phase 1",
  "Lonavla",
  "Mumbai",
  "Pune phase 2",
] as const;

export const dashboardData: Record<string, DashboardData> = {
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
        title: "Complaint Escalated - Customer complaint #4521 exceeded SLA",
        time: "30 min ago",
      },
      {
        icon: CheckCircle,
        color: "text-blue-500 border-blue-500",
        title: "Pending Approval - ₹15,000 service request awaiting approval",
        time: "1 hour ago",
      },
      {
        icon: FileWarning,
        color: "text-yellow-500 border-yellow-500",
        title: "Payment Overdue - Invoice #INV-2024-456 pending for 10 days",
        time: "2 hours ago",
      },
      {
        icon: XCircle,
        color: "text-red-600 border-red-600",
        title: "System Alert - Backup failed at Chennai Express Service",
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
        value: "45",
        change: "+1",
        icon: Users,
        color: "from-red-400/20 to-red-100",
        text: "text-red-600",
      },
      {
        title: "Customer Satisfaction",
        value: "95.1%",
        change: "+1.2%",
        icon: Star,
        color: "from-yellow-400/20 to-yellow-100",
        text: "text-yellow-600",
      },
    ],
    alerts: [],
  },
  "Lonavla": {
    cards: [
      {
        title: "Total Revenue",
        value: "₹12,50,000",
        change: "+5.3%",
        icon: DollarSign,
        color: "from-green-400/20 to-green-100",
        text: "text-green-600",
      },
      {
        title: "Total Active Jobs",
        value: "18",
        change: "+1",
        icon: Package,
        color: "from-blue-400/20 to-blue-100",
        text: "text-blue-600",
      },
      {
        title: "Total Staff",
        value: "28",
        change: "+0",
        icon: Users,
        color: "from-red-400/20 to-red-100",
        text: "text-red-600",
      },
      {
        title: "Customer Satisfaction",
        value: "93.8%",
        change: "+0.5%",
        icon: Star,
        color: "from-yellow-400/20 to-yellow-100",
        text: "text-yellow-600",
      },
    ],
    alerts: [],
  },
  "Mumbai": {
    cards: [
      {
        title: "Total Revenue",
        value: "₹18,75,000",
        change: "+10.2%",
        icon: DollarSign,
        color: "from-green-400/20 to-green-100",
        text: "text-green-600",
      },
      {
        title: "Total Active Jobs",
        value: "28",
        change: "+3",
        icon: Package,
        color: "from-blue-400/20 to-blue-100",
        text: "text-blue-600",
      },
      {
        title: "Total Staff",
        value: "42",
        change: "+1",
        icon: Users,
        color: "from-red-400/20 to-red-100",
        text: "text-red-600",
      },
      {
        title: "Customer Satisfaction",
        value: "94.5%",
        change: "+1.8%",
        icon: Star,
        color: "from-yellow-400/20 to-yellow-100",
        text: "text-yellow-600",
      },
    ],
    alerts: [],
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

