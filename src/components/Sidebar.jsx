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
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

const menu = [
  { name: "Dashboard", icon: Home, href: "/dashboarda" },
  { name: "Service Centers", icon: Building, href: "/servicecenters" },
  { name: "Users & Roles", icon: Users, href: "/user&roles" },
  { name: "Inventory", icon: Package, href: "#" },
  { name: "Approvals", icon: CheckCircle, href: "#" },
  { name: "Finance", icon: DollarSign, href: "#" },
  { name: "Reports", icon: FileText, href: "#" },
  { name: "Complaints", icon: AlertCircle, href: "#" },
  { name: "Audit Logs", icon: ClipboardList, href: "#" },
];

export default function Sidebar({ open, setOpen }) {
  const pathname = usePathname();

  return (
    <>
      {/* ✅ Removed overlay dim effect */}
      {/* Sidebar Drawer */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-screen w-64 bg-[#0d1224] text-white flex flex-col justify-between shadow-2xl z-50 transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-[#6f42c1] to-[#9b6dff] p-2 rounded-xl shadow-md">
              <Building size={26} />
            </div>
            <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-6 flex flex-col flex-grow overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-6 py-3 text-sm transition-all",
                  active
                    ? "bg-gradient-to-r from-[#6f42c1] to-[#a374ff] text-white font-medium"
                    : "text-gray-300 hover:bg-[#1a2036]"
                )}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#6f42c1] flex items-center justify-center text-white font-bold">
            RKS
          </div>
          <div>
            <p className="text-sm font-medium">Rajesh Kumar Singh</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>
      </aside>
    </>
  );
}
