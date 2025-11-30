"use client";
import { useState, useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, SCSidebar, Navbar } from "@/components/layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useRole } from "@/shared/hooks";
import type { UserRole } from "@/shared/types";
import { TopLoadingBar } from "@/components/ui/TopLoadingBar";
import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [open, setOpen] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const { userRole } = useRole();
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);

  const isLoggedIn = pathname !== "/";
  
  // Determine which sidebar to use based on pathname first (primary), then role (fallback)
  // Service Center routes: /sc/*
  // Admin routes: /dashboard, /servicecenters, /user&roles, /finance, /reports, /complaints, /audit-logs
  // Note: /inventory and /approvals can be accessed by both, so we check role for those
  const isServiceCenterPage = pathname?.startsWith("/sc");
  
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
  
  // Use SC sidebar if: on SC page OR on shared route as non-admin OR not on admin route and not admin/super_admin
  const useSCSidebar = isServiceCenterPage || 
                      (isSharedRoute && !isAdminOnSharedRoute) ||
                      (!isAdminRoute && !isSharedRoute && userRole !== "admin" && userRole !== "super_admin");

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
        <ErrorBoundary>
          {isLoggedIn &&
            (useSCSidebar ? (
              <SCSidebar open={open} setOpen={setOpen} role={userRole} />
            ) : (
              <Sidebar open={open} setOpen={setOpen} />
            ))}

          <TopLoadingBar isLoading={isNavigating} />
          <div
            className={`flex-1 flex flex-col transition-all duration-300 relative ${
              isLoggedIn
                ? open
                  ? "ml-64 md:ml-64"
                  : "ml-0 md:ml-20"
                : "ml-0"
            }`}
          >
            {isLoggedIn && <Navbar open={open} setOpen={setOpen} isLoggedIn={isLoggedIn} />}

            <main className={`relative min-h-[calc(100vh-4rem)] ${isLoggedIn ? "pt-16 px-6 md:px-8" : "px-0"}`}>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}

