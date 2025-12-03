/**
 * Menu configuration
 */
import { ADMIN_MENU_ITEMS } from "@/shared/constants/menu-items";
import type { MenuItem } from "@/shared/constants/menu-items";
import {
  Home,
  Search,
  FileText,
  ClipboardList,
  Wrench,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  Truck,
  BarChart3,
  UserCircle,
} from "lucide-react";
import type { UserRole } from "@/shared/types";

export const SC_MENU_ITEMS: Record<UserRole, MenuItem[]> = {
  sc_manager: [
    { name: "Dashboard", icon: Home, href: "/sc/dashboard" },
    { name: "Customer Find", icon: UserCircle, href: "/sc/customer-find" },
    { name: "Vehicle Search", icon: Search, href: "/sc/vehicle-search" },
    { name: "Appointments", icon: Calendar, href: "/sc/appointments" },
    { name: "Job Cards", icon: ClipboardList, href: "/sc/job-cards" },
    { name: "Advisor Job Cards", icon: ClipboardList, href: "/sc/advisor-job-cards" },
    { name: "Workshop", icon: Wrench, href: "/sc/workshop" },
    { name: "Inventory", icon: Package, href: "/sc/inventory" },
    { name: "OTC Orders", icon: ShoppingCart, href: "/sc/otc-orders" },
    { name: "Home Service", icon: Truck, href: "/sc/home-service" },
    { name: "Invoices", icon: DollarSign, href: "/sc/invoices" },
    { name: "Technicians", icon: Users, href: "/sc/technicians" },
    { name: "Complaints", icon: MessageSquare, href: "/sc/complaints" },
    { name: "Reports", icon: BarChart3, href: "/sc/reports" },
    { name: "Approvals", icon: FileText, href: "/sc/approvals" },
    { name: "Settings", icon: Settings, href: "/sc/settings" },
  ],
  sc_staff: [
    { name: "Dashboard", icon: Home, href: "/sc/dashboard" },
    { name: "Customer Find", icon: UserCircle, href: "/sc/customer-find" },
    { name: "Vehicle Search", icon: Search, href: "/sc/vehicle-search" },
    { name: "Appointments", icon: Calendar, href: "/sc/appointments" },
    { name: "Job Cards", icon: ClipboardList, href: "/sc/job-cards" },
    { name: "Workshop", icon: Wrench, href: "/sc/workshop" },
    { name: "Inventory", icon: Package, href: "/sc/inventory" },
    { name: "OTC Orders", icon: ShoppingCart, href: "/sc/otc-orders" },
    { name: "Invoices", icon: DollarSign, href: "/sc/invoices" },
  ],
  service_engineer: [
    { name: "Dashboard", icon: Home, href: "/sc/dashboard" },
    { name: "My Jobs", icon: ClipboardList, href: "/sc/job-cards" },
    { name: "Home Service", icon: Truck, href: "/sc/home-service" },
    { name: "Parts Request", icon: Package, href: "/sc/parts-request" },
  ],
  service_advisor: [
    { name: "Dashboard", icon: Home, href: "/sc/dashboard" },
    { name: "Customer Find", icon: UserCircle, href: "/sc/customer-find" },
    { name: "Vehicle Search", icon: Search, href: "/sc/vehicle-search" },
    { name: "Appointments", icon: Calendar, href: "/sc/appointments" },
    { name: "Job Cards", icon: ClipboardList, href: "/sc/advisor-job-cards" },
    { name: "Leads", icon: Users, href: "/sc/leads" },
    { name: "Quotations", icon: FileText, href: "/sc/quotations" },
  ],
  call_center: [
    { name: "Dashboard", icon: Home, href: "/sc/dashboard" },
    { name: "Customer Find", icon: UserCircle, href: "/sc/customer-find" },
    { name: "Appointments", icon: Calendar, href: "/sc/appointments" },
    { name: "Complaints", icon: MessageSquare, href: "/sc/complaints" },
  ],
  admin: [],
  super_admin: [],
};

export const MENU_CONFIG = {
  admin: ADMIN_MENU_ITEMS,
  serviceCenter: SC_MENU_ITEMS,
} as const;

