"use client";
import { Menu } from "lucide-react";

export default function Navbar({ setOpen }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Hamburger always visible */}
        <button
          className="text-gray-700 hover:text-black"
          onClick={() => setOpen((prev) => !prev)}
        >
          <Menu size={24} />
        </button>

        <h1 className="text-lg md:text-xl font-semibold text-[#6f42c1]">
          Admin Dashboard
        </h1>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#6f42c1] text-white flex items-center justify-center font-bold">
            R
          </div>
        </div>
      </div>
    </nav>
  );
}
