"use client";
import { useState, useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar, SCSidebar, InventoryManagerSidebar, CentralInventorySidebar, Navbar } from "@/components/layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useRole } from "@/shared/hooks";
import type { UserRole } from "@/shared/types";
import { TopLoadingBar } from "@/components/ui/TopLoadingBar";
import { ToastProvider } from "@/contexts/ToastContext";
import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));
  const [open, setOpen] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const { userRole } = useRole();
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);

  const isLoggedIn = pathname !== "/";

  // Determine which sidebar to use based on pathname first (primary), then role (fallback)
  // Service Center routes: /sc/*
  // Admin routes: /dashboard, /servicecenters, /user&roles, /finance, /reports, /complaints, /audit-logs
  // Inventory Manager routes: /inventory-manager/*
  // Central Inventory Manager routes: /central-inventory/*
  // Note: /inventory and /approvals can be accessed by both, so we check role for those
  const isServiceCenterPage = pathname?.startsWith("/sc");
  const isInventoryManagerPage = pathname?.startsWith("/inventory-manager");
  const isCentralInventoryPage = pathname?.startsWith("/central-inventory");

  // Admin-specific routes
  const isAdminRoute = pathname === "/dashboard" ||
    pathname?.startsWith("/servicecenters") ||
    pathname === "/user&roles" ||
    pathname === "/finance" ||
    pathname === "/reports" ||
    pathname === "/complaints" ||
    pathname === "/audit-logs";

  // For /inventory and /approvals, check role to determine which sidebar
  const isSharedRoute = pathname === "/inventory" || pathname === "/approvals";
  const isAdminOnSharedRoute = isSharedRoute && (userRole === "admin" || userRole === "super_admin");

  // Use Inventory Manager sidebar if on inventory manager page
  const useInventoryManagerSidebar = isInventoryManagerPage && !isCentralInventoryPage;

  // Use Central Inventory sidebar if on central inventory page
  const useCentralInventorySidebar = isCentralInventoryPage;

  // Use SC sidebar if: on SC page OR on shared route as non-admin OR not on admin route and not admin/super_admin and not inventory manager and not central inventory manager
  const useSCSidebar = (isServiceCenterPage ||
    (isSharedRoute && !isAdminOnSharedRoute) ||
    (!isAdminRoute && !isSharedRoute && userRole !== "admin" && userRole !== "super_admin" && userRole !== "inventory_manager" && userRole !== "central_inventory_manager")) && !isInventoryManagerPage && !isCentralInventoryPage;

  // Show loader during navigation (track pathname changes)
  useEffect(() => {
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      // Use setTimeout to make state update async
      const showTimer = setTimeout(() => setIsNavigating(true), 0);
      const hideTimer = setTimeout(() => setIsNavigating(false), 400);
      prevPathnameRef.current = pathname;
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
    prevPathnameRef.current = pathname;
  }, [pathname]);

  return (
    <html lang="en">
      <body className="antialiased bg-[#f9f9fb] flex" suppressHydrationWarning>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <ErrorBoundary>
              {isLoggedIn &&
                (useCentralInventorySidebar ? (
                  <CentralInventorySidebar open={open} setOpen={setOpen} />
                ) : useInventoryManagerSidebar ? (
                  <InventoryManagerSidebar open={open} setOpen={setOpen} />
                ) : useSCSidebar ? (
                  <SCSidebar open={open} setOpen={setOpen} role={userRole} />
                ) : (
                  <Sidebar open={open} setOpen={setOpen} />
                ))}

              <TopLoadingBar isLoading={isNavigating} />
              <div
                className={`flex-1 flex flex-col transition-all duration-300 relative overflow-x-hidden ${isLoggedIn
                  ? open
                    ? "ml-64 md:ml-64"
                    : "ml-0 md:ml-20"
                  : "ml-0"
                  }`}
              >
                {isLoggedIn && <Navbar open={open} setOpen={setOpen} isLoggedIn={isLoggedIn} />}

                <main className={`relative min-h-[calc(100vh-4rem)] overflow-x-hidden ${isLoggedIn ? "pt-16 px-6 md:px-8" : "px-0"}`}>
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </main>
              </div>
            </ErrorBoundary>
          </ToastProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

