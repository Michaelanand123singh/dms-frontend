"use client";
import { useState, useEffect, useRef } from "react";
import { Menu, LogOut, Search, Building, User, Package, FileText, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar({ setOpen }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  const handleLogout = () => {
    router.push("/");
  };

  // Search function
  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = [];
    const lowerQuery = query.toLowerCase();

    // Search Service Centers
    if (typeof window !== 'undefined') {
      const storedCenters = JSON.parse(localStorage.getItem('serviceCenters') || '{}');
      const staticCenters = [
        { id: 1, name: "Delhi Central Hub", location: "Connaught Place, New Delhi" },
        { id: 2, name: "Mumbai Metroplex", location: "Bandra West, Mumbai" },
        { id: 3, name: "Bangalore Innovation Center", location: "Koramangala, Bangalore" },
      ];
      
      const allCenters = [...staticCenters];
      Object.values(storedCenters).forEach(center => {
        if (!allCenters.find(c => c.id === center.id)) {
          allCenters.push({ id: center.id, name: center.name, location: center.location || "" });
        }
      });

      allCenters.forEach(center => {
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
            color: "text-blue-600"
          });
        }
      });

      // Search Users
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const defaultUsers = [
        { name: "Rajesh Kumar Singh", email: "admin@service.com", role: "Super Admin" },
        { name: "Delhi Manager", email: "delhi@service.com", role: "SC Manager" },
        { name: "Finance Manager", email: "finance@service.com", role: "Finance Manager" },
        { name: "Call Center Team", email: "callcenter@service.com", role: "Call Center" },
      ];
      const allUsers = [...defaultUsers, ...users];

      allUsers.forEach(user => {
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
            color: "text-purple-600"
          });
        }
      });

      // Search Inventory
      const inventory = JSON.parse(localStorage.getItem('inventoryData') || '[]');
      const defaultInventory = [
        { partName: "Engine Oil", sku: "EO-001", category: "Lubricants" },
        { partName: "Brake Pads", sku: "BP-002", category: "Brakes" },
        { partName: "Air Filter", sku: "AF-003", category: "Filters" },
      ];
      const allInventory = [...defaultInventory, ...inventory];

      allInventory.forEach(item => {
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
            color: "text-green-600"
          });
        }
      });
    }

    setSearchResults(results);
    setShowResults(results.length > 0);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (href) => {
    router.push(href);
    setSearchQuery("");
    setShowResults(false);
  };

  // Group results by category
  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {});

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center px-4 py-3 gap-4 relative">
        {/* Hamburger always visible */}
        <button
          className="text-gray-700 hover:text-black flex-shrink-0"
          onClick={() => setOpen((prev) => !prev)}
        >
          <Menu size={24} />
        </button>

        {/* Admin Dashboard - Centered */}
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg md:text-xl font-semibold text-[#6f42c1] hidden md:block">
          Admin Dashboard
        </h1>

        {/* Right side: Search, Logout, Avatar */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          {/* Global Search */}
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

          {/* Search Results Dropdown */}
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

          {/* No Results */}
          {showResults && searchQuery && searchResults.length === 0 && (
            <div
              ref={resultsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-8 text-center z-50"
            >
              <p className="text-gray-500 text-sm">No results found for "{searchQuery}"</p>
            </div>
          )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Logout"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
          <div className="w-9 h-9 rounded-full bg-[#6f42c1] text-white flex items-center justify-center font-bold">
            R
          </div>
        </div>
      </div>
    </nav>
  );
}
