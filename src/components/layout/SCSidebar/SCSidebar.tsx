"use client";
import { useState, useEffect } from "react";
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
  X,
  LogOut,
  Menu,
  Building,
  Truck,
  BarChart3,
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
    { name: "Vehicle Search", icon: Search, href: "/sc/vehicle-search" },
    { name: "Service Requests", icon: FileText, href: "/sc/service-requests" },
    { name: "Job Cards", icon: ClipboardList, href: "/sc/job-cards" },
    { name: "Workshop", icon: Wrench, href: "/sc/workshop" },
    { name: "Inventory", icon: Package, href: "/sc/inventory" },
    { name: "OTC Orders", icon: ShoppingCart, href: "/sc/otc-orders" },
    { name: "Home Service", icon: Truck, href: "/sc/home-service" },
    { name: "Invoices", icon: DollarSign, href: "/sc/invoices" },
    { name: "Appointments", icon: Calendar, href: "/sc/appointments" },
    { name: "Technicians", icon: Users, href: "/sc/technicians" },
    { name: "Complaints", icon: MessageSquare, href: "/sc/complaints" },
    { name: "Reports", icon: BarChart3, href: "/sc/reports" },
    { name: "Approvals", icon: FileText, href: "/sc/approvals" },
    { name: "Settings", icon: Settings, href: "/sc/settings" },
  ],
  sc_staff: [
    { name: "Dashboard", icon: Home, href: "/sc/dashboard" },
    { name: "Vehicle Search", icon: Search, href: "/sc/vehicle-search" },
    { name: "Service Requests", icon: FileText, href: "/sc/service-requests" },
    { name: "Job Cards", icon: ClipboardList, href: "/sc/job-cards" },
    { name: "Workshop", icon: Wrench, href: "/sc/workshop" },
    { name: "Inventory", icon: Package, href: "/sc/inventory" },
    { name: "OTC Orders", icon: ShoppingCart, href: "/sc/otc-orders" },
    { name: "Invoices", icon: DollarSign, href: "/sc/invoices" },
    { name: "Appointments", icon: Calendar, href: "/sc/appointments" },
  ],
  service_engineer: [
    { name: "Dashboard", icon: Home, href: "/sc/dashboard" },
    { name: "My Jobs", icon: ClipboardList, href: "/sc/job-cards" },
    { name: "Home Service", icon: Truck, href: "/sc/home-service" },
    { name: "Parts Request", icon: Package, href: "/sc/parts-request" },
  ],
  service_advisor: [
    { name: "Dashboard", icon: Home, href: "/sc/dashboard" },
    { name: "Vehicle Search", icon: Search, href: "/sc/vehicle-search" },
    { name: "Service Requests", icon: FileText, href: "/sc/service-requests" },
    { name: "Leads", icon: Users, href: "/sc/leads" },
    { name: "Quotations", icon: FileText, href: "/sc/quotations" },
    { name: "Appointments", icon: Calendar, href: "/sc/appointments" },
  ],
  call_center: [
    { name: "Dashboard", icon: Home, href: "/sc/dashboard" },
    { name: "Service Requests", icon: FileText, href: "/sc/service-requests" },
    { name: "Appointments", icon: Calendar, href: "/sc/appointments" },
    { name: "Complaints", icon: MessageSquare, href: "/sc/complaints" },
    { name: "Follow-ups", icon: Calendar, href: "/sc/follow-ups" },
  ],
  admin: [],
  super_admin: [],
};

export function SCSidebar({ open, setOpen, role = "sc_manager" }: SCSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userInfo } = useRole();
  const menu = roleMenus[role] || roleMenus.sc_manager;
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState({
    name: "SC Manager",
    role: "SC Manager",
    initials: "SC",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userInfo && mounted) {
      setUser({
        name: userInfo.name || "SC Manager",
        role: userInfo.role || "SC Manager",
        initials: userInfo.initials || "SC",
      });
    }
  }, [userInfo, mounted]);

  const handleLogout = () => {
    safeStorage.removeItem("userRole");
    safeStorage.removeItem("userInfo");
    safeStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  return (
    <aside
      className={clsx(
        "fixed top-0 left-0 h-screen bg-[#0d1224] text-white flex flex-col justify-between shadow-2xl z-50 transition-all duration-300 ease-in-out",
        "w-64",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        open ? "md:w-64" : "md:w-20"
      )}
    >
      <div
        className={clsx(
          "flex items-center border-b border-gray-800 transition-all duration-300 relative",
          open ? "justify-between px-6 py-5" : "justify-center px-0 py-5"
        )}
      >
        {open ? (
          <>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-[#6f42c1] to-[#9b6dff] p-2 rounded-xl shadow-md">
                <Building size={26} className="text-white" strokeWidth={2} />
              </div>
              <h1 className="text-lg font-semibold whitespace-nowrap">Service Center</h1>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white transition"
            >
              <X size={22} className="text-gray-400 hover:text-white" strokeWidth={2} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center text-gray-400 hover:text-white p-2 transition"
            title="Open sidebar"
          >
            <Menu size={22} className="text-gray-400 hover:text-white" strokeWidth={2} />
          </button>
        )}
      </div>

      <nav className="mt-6 flex flex-col flex-grow overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          // Only check active state after mount to avoid hydration mismatch
          const active = mounted && pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (mounted && typeof window !== "undefined" && window.innerWidth < 768) {
                  setOpen(false);
                }
              }}
              className={clsx(
                "flex items-center text-sm transition-all",
                open ? "gap-3 px-6 py-3" : "justify-center px-0 py-3 md:px-0",
                active
                  ? "bg-gradient-to-r from-[#6f42c1] to-[#a374ff] text-white font-medium"
                  : "text-gray-300 hover:bg-[#1a2036]"
              )}
              title={!open ? item.name : ""}
            >
              <Icon 
                size={18} 
                className={clsx(
                  "flex-shrink-0",
                  active ? "text-white" : "text-gray-300"
                )}
                strokeWidth={2}
              />
              {open && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className={clsx(
          "border-t border-gray-700 transition-all duration-300",
          open ? "p-6" : "p-4 md:p-4"
        )}
      >
        {open ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#6f42c1] flex items-center justify-center text-white font-bold">
                {user.initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-400">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition group"
            >
              <LogOut size={18} className="text-gray-300 group-hover:text-white transition" strokeWidth={2} />
              Logout
            </button>
          </>
        ) : (
          <div className="hidden md:flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#6f42c1] flex items-center justify-center text-white font-bold">
              {user.initials}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition"
              title="Logout"
            >
              <LogOut size={18} className="text-gray-300 hover:text-white" strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

