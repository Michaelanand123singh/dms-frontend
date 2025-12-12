"use client";
import { useState } from "react";
import {
  Home,
  FileCheck,
  Warehouse,
  ArrowRightCircle,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useRole } from "@/shared/hooks";
import { safeStorage } from "@/shared/lib/localStorage";
import { CENTRAL_INVENTORY_MANAGER_MENU_ITEMS } from "@/shared/constants/menu-items";

export interface CentralInventorySidebarProps {
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export function CentralInventorySidebar({ open, setOpen }: CentralInventorySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userInfo } = useRole();
  // Use lazy initializer to check if we're on the client side
  const [isMounted] = useState(() => typeof window !== "undefined");

  // Compute user info with consistent defaults for SSR and client
  // Use consistent defaults during SSR to avoid hydration mismatch
  const user = {
    name: (isMounted && userInfo?.name) ? userInfo.name : "Central Inventory Manager",
    role: (isMounted && userInfo?.role) ? userInfo.role : "Central Inventory Manager",
    initials: (isMounted && userInfo?.initials) ? userInfo.initials : "CIM",
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
        {CENTRAL_INVENTORY_MANAGER_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          // Check active state with precise matching
          // Exact match always works
          let active = pathname === item.href;
          
          // For routes that have sub-routes, check if pathname is a sub-route
          // But exclude parent routes when we're on a sibling route
          if (!active) {
            // Special handling for routes with siblings
            if (item.href === "/central-inventory/stock") {
              // Central Stock should be active for /stock (exact) and /stock/update, but NOT for /stock/issue
              active = (pathname === "/central-inventory/stock" || 
                       (pathname?.startsWith("/central-inventory/stock/") && 
                        !pathname?.startsWith("/central-inventory/stock/issue")));
            } else if (item.href === "/central-inventory/stock/issue") {
              // Issue Parts should be active for /stock/issue and its sub-routes
              active = pathname?.startsWith("/central-inventory/stock/issue");
            } else if (item.href === "/central-inventory/purchase-orders") {
              // Purchase Orders should be active for /purchase-orders and its sub-routes
              active = pathname?.startsWith("/central-inventory/purchase-orders");
            }
            // Dashboard only matches exactly (already handled above)
          }
          
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

