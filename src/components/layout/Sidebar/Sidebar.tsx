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
  X,
  LogOut,
  Menu,
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
  { name: "Dashboard", icon: Home, href: "/dashboarda" },
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
  const [mounted, setMounted] = useState(false);

  // Only access userInfo after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    safeStorage.removeItem("userRole");
    safeStorage.removeItem("userInfo");
    safeStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  // Use consistent default during SSR and initial render
  const displayName = mounted ? (userInfo?.name || "Admin") : "Admin";
  const displayRole = mounted ? (userInfo?.role || "Super Admin") : "Super Admin";
  const initials = mounted ? (userInfo?.initials || "A") : "A";

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
                <Building size={26} />
              </div>
              <h1 className="text-lg font-semibold whitespace-nowrap">Admin Panel</h1>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={22} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center text-gray-400 hover:text-white p-2"
            title="Open sidebar"
          >
            <Menu size={22} />
          </button>
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
                {initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-gray-400">{displayRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition"
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
              className="flex items-center justify-center p-2 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition"
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

