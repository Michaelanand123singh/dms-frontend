"use client";
import { useState, useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, SCSidebar, Navbar } from "@/components/layout";
import { useRole } from "@/shared/hooks";
import type { UserRole } from "@/shared/types";
import { PageLoader } from "@/components/ui/PageLoader";
import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [open, setOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { userRole } = useRole();
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);

  const isLoggedIn = pathname !== "/";
  const isServiceCenterPage = pathname?.startsWith("/sc");
  const useSCSidebar =
    isServiceCenterPage ||
    (userRole !== "admin" && userRole !== "super_admin");

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
        {isLoggedIn &&
          (useSCSidebar ? (
            <SCSidebar open={open} setOpen={setOpen} role={userRole} />
          ) : (
            <Sidebar open={open} setOpen={setOpen} />
          ))}

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
            {isNavigating && <PageLoader message="Loading page..." />}
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

