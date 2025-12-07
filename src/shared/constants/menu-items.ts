/**
 * Menu items configuration
 */
import type { LucideIcon } from "lucide-react";
import {
  Home,
  Building,
  Users,
  Package,
  CheckCircle,
  DollarSign,
  FileText,
  AlertCircle,
  ClipboardList,
  Settings,
  Shield,
  Boxes,
  TrendingUp,
  PlusCircle,
  Eye,
  ShoppingCart,
  ListChecks,
  Warehouse,
  FileCheck,
  ArrowRightCircle,
} from "lucide-react";

export interface MenuItem {
  name: string;
  icon: LucideIcon;
  href: string;
  children?: MenuItem[];
}

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { name: "Dashboard", icon: Home, href: "/dashboarda" },
  { name: "Service Centers", icon: Building, href: "/servicecenters" },
  { name: "Users & Roles", icon: Users, href: "/user&roles" },
  { name: "Roles & Permissions", icon: Shield, href: "/roles-permissions" },
  { name: "Inventory", icon: Package, href: "/inventory" },
  { name: "Approvals", icon: CheckCircle, href: "/approvals" },
  { name: "Finance", icon: DollarSign, href: "/finance" },
  { name: "Reports", icon: FileText, href: "/reports" },
  { name: "Complaints", icon: AlertCircle, href: "/complaints" },
  { name: "Audit Logs", icon: ClipboardList, href: "/audit-logs" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

/**
 * Inventory Manager menu items
 */
export const INVENTORY_MANAGER_MENU_ITEMS: MenuItem[] = [
  { name: "Dashboard", icon: Home, href: "/inventory-manager/dashboard" },
  { name: "Parts Master", icon: Boxes, href: "/inventory-manager/parts-master" },
  { name: "Stock Update", icon: TrendingUp, href: "/inventory-manager/parts-stock-update" },
  { name: "Parts Entry", icon: PlusCircle, href: "/inventory-manager/parts-entry" },
  { name: "Order Entry", icon: ShoppingCart, href: "/inventory-manager/parts-order-entry" },
  { name: "Approvals", icon: CheckCircle, href: "/inventory-manager/approvals" },
];

/**
 * Central Inventory Manager menu items
 */
export const CENTRAL_INVENTORY_MANAGER_MENU_ITEMS: MenuItem[] = [
  { name: "Dashboard", icon: Home, href: "/central-inventory/dashboard" },
  { name: "Purchase Orders", icon: FileCheck, href: "/central-inventory/purchase-orders" },
  { name: "Central Stock", icon: Warehouse, href: "/central-inventory/stock" },
  { name: "Issue Parts", icon: ArrowRightCircle, href: "/central-inventory/stock/issue" },
];

