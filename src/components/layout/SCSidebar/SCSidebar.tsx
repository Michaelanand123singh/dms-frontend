"use client";
import { useState } from "react";
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
  LogOut,
  Truck,
  BarChart3,
  UserCircle,
  LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import type { UserRole } from "@/shared/types";
import { useRole } from "@/shared/hooks";
import { safeStorage } from "@/shared/lib/localStorage";

interface MenuItem {
  name: string;
  icon: LucideIcon;
  href: string;
}

export interface SCSidebarProps {
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  role?: UserRole;
}

const roleMenus: Record<UserRole, MenuItem[]> = {
  sc_manager: [
    { name: "Dashboard", icon: Home, href: "/sc/dashboard" },
    { name: "Customer Find", icon: UserCircle, href: "/sc/customer-find" },
    { name: "Appointments", icon: Calendar, href: "/sc/appointments" },
    { name: "Job Cards", icon: ClipboardList, href: "/sc/job-cards" },
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
    { name: "Appointments", icon: Calendar, href: "/sc/appointments" },
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

export function SCSidebar({ open, setOpen, role: roleProp }: SCSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userInfo, userRole, isLoading } = useRole();
  // Use lazy initializer to check if we're on the client side
  const [isMounted] = useState(() => typeof window !== "undefined");

  // Use role from hook (most reliable) - it reads directly from localStorage
  // Use consistent role during SSR to avoid hydration mismatch
  // Default to sc_manager during SSR, then use actual role after mount
  const effectiveRole = (isMounted && userRole && userRole !== "admin" && userRole !== "super_admin")
    ? userRole
    : (roleProp || "sc_manager");
  // Always use the same menu structure - roleProp should be provided from parent
  const menu = roleMenus[effectiveRole] || roleMenus.sc_manager;

  // Compute user info with consistent defaults for SSR and client
  // Use consistent defaults during SSR to avoid hydration mismatch
  const user = {
    name: (isMounted && userInfo?.name) ? userInfo.name : "SC Manager",
    role: (isMounted && userInfo?.role) ? userInfo.role : "SC Manager",
    initials: (isMounted && userInfo?.initials) ? userInfo.initials : "SC",
  };

  const handleLogout = () => {
    safeStorage.removeItem("userRole");
    safeStorage.removeItem("userInfo");
    safeStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  return (
    <aside
      className={clsx(
        "fixed left-0 bg-white/95 backdrop-blur-md text-gray-900 flex flex-col justify-between shadow-lg z-40 transition-all duration-300 ease-in-out",
        "w-64 top-16 h-[calc(100vh-4rem)]",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        open ? "md:w-64" : "md:w-20"
      )}
    >
      <nav className="mt-2 flex flex-col flex-grow overflow-y-auto px-2 py-2">
        {menu.length > 0 && menu.map((item) => {
          const Icon = item.icon;
          // Check active state - pathname is available on both server and client
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  setOpen(false);
                }
              }}
              className={clsx(
                "flex items-center text-sm transition-all duration-200 rounded-lg",
                open ? "gap-3 px-4 py-2.5" : "justify-center px-0 py-2.5 md:px-0",
                active
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
              )}
              title={!open ? item.name : ""}
            >
              <Icon 
                size={18} 
                className={clsx(
                  "flex-shrink-0 transition-colors",
                  active ? "text-white" : "text-gray-500"
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              {open && <span className="whitespace-nowrap font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className={clsx(
          "bg-gradient-to-br from-gray-50/50 to-white transition-all duration-300",
          open ? "p-5" : "p-4 md:p-4"
        )}
      >
        {open ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-semibold shadow-sm">
                {user.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-150 font-medium group"
            >
              <LogOut size={18} className="text-gray-600 group-hover:text-red-600 transition-colors" strokeWidth={2} />
              Logout
            </button>
          </>
        ) : (
          <div className="hidden md:flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-semibold shadow-sm">
              {user.initials}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-150"
              title="Logout"
            >
              <LogOut size={18} className="text-gray-600 hover:text-red-600 transition-colors" strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

