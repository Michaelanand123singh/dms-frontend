"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import "./globals.css";

export default function RootLayout({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // ✅ Hide navbar and sidebar on login page
  const isLoggedIn = pathname !== "/";

  return (
    <html lang="en">
      <body className="antialiased bg-[#f9f9fb] flex">
        {/* ✅ Sidebar only shown if logged in */}
        {isLoggedIn && <Sidebar open={open} setOpen={setOpen} />}

        {/* ✅ Main Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isLoggedIn 
              ? (open ? "ml-64 md:ml-64" : "ml-0 md:ml-20") 
              : "ml-0"
          }`}
        >
          {/* ✅ Navbar only shown if logged in */}
          {isLoggedIn && <Navbar setOpen={setOpen} isLoggedIn={isLoggedIn} />}

          <main className={isLoggedIn ? "pt-16 px-6 md:px-8" : "px-0"}>{children}</main>
        </div>
      </body>
    </html>
  );
}
