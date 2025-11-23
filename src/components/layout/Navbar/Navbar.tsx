"use client";
import { useState, useEffect, useRef } from "react";
import { Menu, LogOut, Search, Building, User, Package, FileText, X, ArrowRight, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRole } from "@/shared/hooks";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";

interface SearchResult {
  type: string;
  id: string | number;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

export interface NavbarProps {
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isLoggedIn?: boolean;
}

export function Navbar({ open, setOpen, isLoggedIn = true }: NavbarProps) {
  const router = useRouter();
  const { userRole, userInfo } = useRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const dashboardTitle = userRole === "admin" || userRole === "super_admin" 
    ? "Admin Dashboard" 
    : "Service Center Dashboard";

  const handleLogout = () => {
    safeStorage.removeItem("userRole");
    safeStorage.removeItem("userInfo");
    safeStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    if (typeof window !== "undefined") {
      const storedCenters = safeStorage.getItem("serviceCenters", {});
      const staticCenters = [
        { id: 1, name: "Delhi Central Hub", location: "Connaught Place, New Delhi" },
        { id: 2, name: "Mumbai Metroplex", location: "Bandra West, Mumbai" },
        { id: 3, name: "Bangalore Innovation Center", location: "Koramangala, Bangalore" },
      ];

      const allCenters = [...staticCenters];
      Object.values(storedCenters).forEach((center: any) => {
        if (!allCenters.find((c) => c.id === center.id)) {
          allCenters.push({ id: center.id, name: center.name, location: center.location || "" });
        }
      });

      allCenters.forEach((center) => {
        if (
          center.name.toLowerCase().includes(lowerQuery) ||
          (center.location && center.location.toLowerCase().includes(lowerQuery))
        ) {
          results.push({
            type: "Service Center",
            id: center.id,
            title: center.name,
            subtitle: center.location,
            icon: Building,
            href: `/servicecenters/${center.id}`,
            color: "text-blue-600",
          });
        }
      });

      const users = safeStorage.getItem("users", []);
      const defaultUsers = [
        { name: "Rajesh Kumar Singh", email: "admin@service.com", role: "Super Admin" },
        { name: "Delhi Manager", email: "delhi@service.com", role: "SC Manager" },
        { name: "Finance Manager", email: "finance@service.com", role: "Finance Manager" },
        { name: "Call Center Team", email: "callcenter@service.com", role: "Call Center" },
      ];
      const allUsers = [...defaultUsers, ...users];

      allUsers.forEach((user: any) => {
        if (
          user.name.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery) ||
          (user.role && user.role.toLowerCase().includes(lowerQuery))
        ) {
          results.push({
            type: "User",
            id: user.email,
            title: user.name,
            subtitle: `${user.role} • ${user.email}`,
            icon: User,
            href: "/user&roles",
            color: "text-purple-600",
          });
        }
      });

      const inventory = safeStorage.getItem("inventoryData", []);
      const defaultInventory = [
        { partName: "Engine Oil", sku: "EO-001", category: "Lubricants" },
        { partName: "Brake Pads", sku: "BP-002", category: "Brakes" },
        { partName: "Air Filter", sku: "AF-003", category: "Filters" },
      ];
      const allInventory = [...defaultInventory, ...inventory];

      allInventory.forEach((item: any) => {
        if (
          item.partName.toLowerCase().includes(lowerQuery) ||
          (item.sku && item.sku.toLowerCase().includes(lowerQuery)) ||
          (item.category && item.category.toLowerCase().includes(lowerQuery))
        ) {
          results.push({
            type: "Inventory",
            id: item.sku || item.partName,
            title: item.partName,
            subtitle: `${item.category || "N/A"} • SKU: ${item.sku || "N/A"}`,
            icon: Package,
            href: "/inventory",
            color: "text-green-600",
          });
        }
      });
    }

    setSearchResults(results);
    setShowResults(results.length > 0);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (href: string) => {
    router.push(href);
    setSearchQuery("");
    setShowResults(false);
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center px-4 py-3 gap-4 relative">
        <button
          className="text-gray-700 hover:text-[#6f42c1] flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close sidebar" : "Open sidebar"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg md:text-xl font-semibold text-[#6f42c1] hidden md:block">
          {dashboardTitle}
        </h1>

        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          <div className="relative w-64" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search service centers, users, inventory..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  performSearch(e.target.value);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6f42c1] focus:outline-none text-sm text-black"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {showResults && searchResults.length > 0 && (
              <div
                ref={resultsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
              >
                {Object.entries(groupedResults).map(([category, items]) => (
                  <div key={category} className="border-b border-gray-100 last:border-b-0">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {category}
                      </h3>
                    </div>
                    {items.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={`${item.type}-${item.id}-${index}`}
                          onClick={() => handleResultClick(item.href)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition text-left"
                        >
                          <div className={`p-2 rounded-lg bg-gray-100 ${item.color}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {item.subtitle}
                            </p>
                          </div>
                          <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {showResults && searchQuery && searchResults.length === 0 && (
              <div
                ref={resultsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-8 text-center z-50"
              >
                <p className="text-gray-500 text-sm">No results found for &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>

          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="w-9 h-9 rounded-full bg-[#6f42c1] text-white flex items-center justify-center font-bold hover:bg-[#5a32a3] transition cursor-pointer"
              title="User menu"
            >
              {userRole === "admin" || userRole === "super_admin" ? "R" : "SC"}
            </button>
            
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {userInfo?.name || (userRole === "admin" || userRole === "super_admin" ? "Admin User" : "Service Center User")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {userInfo?.email || ""}
                  </p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

