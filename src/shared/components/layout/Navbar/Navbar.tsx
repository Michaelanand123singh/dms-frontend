"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Menu, LogOut, Search, Building, User, Package, X, ArrowRight, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRole } from "@/shared/hooks";
import { useDebounce } from "@/shared/hooks";
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

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const dashboardTitle = useMemo(() => {
    if (userRole === "admin") {
      return "Admin Dashboard";
    } else if (userRole === "call_center") {
      return "Call Center Panel";
    } else {
      return "Service Center Dashboard";
    }
  }, [userRole]);

  const handleLogout = useCallback(() => {
    safeStorage.removeItem("userRole");
    safeStorage.removeItem("userInfo");
    safeStorage.removeItem("isLoggedIn");
    router.push("/");
  }, [router]);

  interface ServiceCenter {
    id: number;
    name: string;
    location?: string;
  }

  interface User {
    name: string;
    email: string;
    role?: string;
  }

  interface InventoryItem {
    partName: string;
    hsnCode?: string;
    category?: string;
  }

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    if (typeof window !== "undefined") {
      // Search service centers from localStorage cache
      const storedCenters = safeStorage.getItem<ServiceCenter[]>("serviceCenters", []);

      storedCenters.forEach((center) => {
        if (
          center.name.toLowerCase().includes(lowerQuery) ||
          (center.location && center.location.toLowerCase().includes(lowerQuery))
        ) {
          results.push({
            type: "Service Center",
            id: center.id,
            title: center.name,
            subtitle: center.location || "",
            icon: Building,
            href: `/servicecenters/${center.id}`,
            color: "text-blue-600",
          });
        }
      });

      // Search users from localStorage cache
      const users = safeStorage.getItem<User[]>("users", []);

      users.forEach((user) => {
        if (
          user.name.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery) ||
          (user.role && user.role.toLowerCase().includes(lowerQuery))
        ) {
          results.push({
            type: "User",
            id: user.email,
            title: user.name,
            subtitle: `${user.role || ""} • ${user.email}`,
            icon: User,
            href: "/user&roles",
            color: "text-purple-600",
          });
        }
      });

      // Search inventory from localStorage cache
      const inventory = safeStorage.getItem<InventoryItem[]>("inventoryData", []);

      inventory.forEach((item) => {
        if (
          item.partName.toLowerCase().includes(lowerQuery) ||
          (item.hsnCode && item.hsnCode.toLowerCase().includes(lowerQuery)) ||
          (item.category && item.category.toLowerCase().includes(lowerQuery))
        ) {
          results.push({
            type: "Inventory",
            id: item.hsnCode || item.partName,
            title: item.partName,
            subtitle: `${item.category || "N/A"} • HSN Code: ${item.hsnCode || "N/A"}`,
            icon: Package,
            href: "/inventory",
            color: "text-green-600",
          });
        }
      });
    }

    setSearchResults(results);
    setShowResults(results.length > 0);
  }, []);

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

  useEffect(() => {
    if (debouncedSearchQuery) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      const rafId = requestAnimationFrame(() => {
        performSearch(debouncedSearchQuery);
      });
      return () => cancelAnimationFrame(rafId);
    } else {
      // Use requestAnimationFrame for else branch as well
      const rafId = requestAnimationFrame(() => {
        setSearchResults([]);
        setShowResults(false);
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [debouncedSearchQuery, performSearch]);

  const handleResultClick = useCallback((href: string) => {
    router.push(href);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  }, [router]);

  const groupedResults = useMemo(() => {
    return searchResults.reduce((acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    }, {} as Record<string, SearchResult[]>);
  }, [searchResults]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-md shadow-sm">
      <div className="flex items-center px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 gap-2 sm:gap-4 relative">
        <button
          className="text-gray-600 hover:text-indigo-600 flex-shrink-0 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-95"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close sidebar" : "Open sidebar"}
        >
          {open ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
        </button>

        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-sm sm:text-base md:text-lg font-bold text-gray-900 tracking-tight hidden sm:block max-w-[200px] sm:max-w-none truncate">
          {dashboardTitle}
        </h1>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto">
          <div className="relative w-40 sm:w-56 md:w-72" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} strokeWidth={2} style={{ width: '16px', height: '16px' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
                className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} style={{ width: '16px', height: '16px' }} />
                </button>
              )}
            </div>

            {showResults && searchResults.length > 0 && (
              <div
                ref={resultsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl max-h-96 overflow-y-auto z-50 backdrop-blur-sm"
              >
                {Object.entries(groupedResults).map(([category, items]) => (
                  <div key={category} className="">
                    <div className="px-4 py-2.5 bg-gray-50/80">
                      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {category}
                      </h3>
                    </div>
                    {items.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={`${item.type}-${item.id}-${index}`}
                          onClick={() => handleResultClick(item.href)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-indigo-50/50 transition-all duration-150 text-left group"
                        >
                          <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-indigo-100 transition-colors ${item.color}`}>
                            <Icon size={18} strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {item.subtitle}
                            </p>
                          </div>
                          <ArrowRight size={16} className="text-gray-400 group-hover:text-indigo-600 flex-shrink-0 transition-colors" />
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
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg p-8 text-center z-50"
              >
                <p className="text-gray-500 text-sm">No results found for &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>

          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              title="User menu"
            >
              {userRole === "admin" ? "R" : "SC"}
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl z-50 backdrop-blur-sm overflow-hidden">
                <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
                  <p className="text-sm font-semibold text-gray-900">
                    {userInfo?.name || (userRole === "admin" ? "Admin User" : "Service Center User")}
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
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 font-medium"
                  >
                    <LogOut size={18} strokeWidth={2} />
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

