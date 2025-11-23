"use client";
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
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { useRole } from "@/shared/hooks";
import { safeStorage } from "@/shared/lib/localStorage";

export interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

const menu = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Service Centers", icon: Building, href: "/servicecenters" },
  { name: "Users & Roles", icon: Users, href: "/user&roles" },
  { name: "Inventory", icon: Package, href: "/inventory" },
  { name: "Approvals", icon: CheckCircle, href: "/approvals" },
  { name: "Finance", icon: DollarSign, href: "/finance" },
  { name: "Reports", icon: FileText, href: "/reports" },
  { name: "Complaints", icon: AlertCircle, href: "/complaints" },
  { name: "Audit Logs", icon: ClipboardList, href: "/audit-logs" },
];

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userInfo } = useRole();
  // Track if component has mounted to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    safeStorage.removeItem("userRole");
    safeStorage.removeItem("userInfo");
    safeStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  // Use consistent defaults during SSR and initial render to prevent hydration mismatch
  // Only use actual userInfo after component has mounted on client
  const displayName = isMounted && userInfo?.name ? userInfo.name : "Admin";
  const displayRole = isMounted && userInfo?.role ? userInfo.role : "Super Admin";
  const initials = isMounted && userInfo?.initials ? userInfo.initials : "A";

  return (
    <aside
      className={clsx(
        "fixed left-0 bg-white text-gray-900 flex flex-col justify-between shadow-2xl z-40 transition-all duration-300 ease-in-out",
        "w-64 top-16 h-[calc(100vh-4rem)]",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        open ? "md:w-64" : "md:w-20"
      )}
    >
      <div
        className={clsx(
          "flex items-center border-b border-gray-200 bg-white transition-all duration-300 relative",
          open ? "justify-between px-6 py-5" : "justify-center px-0 py-5"
        )}
      >
        {open ? (
          <>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-[#6f42c1] to-[#9b6dff] p-2 rounded-xl shadow-md">
                <Building size={26} className="text-white" />
              </div>
              <h1 className="text-lg font-semibold whitespace-nowrap text-gray-900">Admin Panel</h1>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-900 hover:text-black transition p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close sidebar"
            >
              <ChevronLeft size={22} />
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-tr from-[#6f42c1] to-[#9b6dff] p-2 rounded-xl shadow-md">
              <Building size={26} className="text-white" />
            </div>
          </div>
        )}
      </div>

      <nav className="mt-6 flex flex-col flex-grow overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
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
                "flex items-center text-sm transition-all",
                open ? "gap-3 px-6 py-3" : "justify-center px-0 py-3 md:px-0",
                active
                  ? "bg-gradient-to-r from-[#6f42c1] to-[#a374ff] text-white font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              title={!open ? item.name : ""}
            >
              <Icon 
                size={18} 
                className={clsx(
                  "flex-shrink-0",
                  active ? "text-white" : "text-gray-700"
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
          "border-t border-gray-200 transition-all duration-300",
          open ? "p-6" : "p-4 md:p-4"
        )}
      >
        {open ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#6f42c1] flex items-center justify-center text-white font-bold">
                {initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{displayRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </>
        ) : (
          <div className="hidden md:flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#6f42c1] flex items-center justify-center text-white font-bold">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

