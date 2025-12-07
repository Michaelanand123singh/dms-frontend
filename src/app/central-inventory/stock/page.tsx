"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Package, TrendingUp, PlusCircle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { centralInventoryRepository } from "@/__mocks__/repositories/central-inventory.repository";
import type { CentralStock } from "@/shared/types/central-inventory.types";

type FilterStatus = "all" | "In Stock" | "Low Stock" | "Out of Stock";

export default function CentralStockPage() {
  const [stock, setStock] = useState<CentralStock[]>([]);
  const [filteredStock, setFilteredStock] = useState<CentralStock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const stockData = await centralInventoryRepository.getAllStock();
        setStock(stockData);
        setFilteredStock(stockData);
      } catch (error) {
        console.error("Failed to fetch stock:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStock();
  }, []);

  useEffect(() => {
    let filtered = [...stock];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.partName.toLowerCase().includes(query) ||
          s.partNumber.toLowerCase().includes(query) ||
          s.sku.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query) ||
          s.location.toLowerCase().includes(query)
      );
    }

    setFilteredStock(filtered);
  }, [stock, searchQuery, statusFilter]);

  const getStatusBadge = (status: CentralStock["status"]) => {
    const variants: Record<CentralStock["status"], { color: string; label: string }> = {
      "In Stock": { color: "bg-green-100 text-green-800", label: "In Stock" },
      "Low Stock": { color: "bg-yellow-100 text-yellow-800", label: "Low Stock" },
      "Out of Stock": { color: "bg-red-100 text-red-800", label: "Out of Stock" },
    };
    const variant = variants[status] || variants["In Stock"];
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const statusCounts = {
    all: stock.length,
    "In Stock": stock.filter((s) => s.status === "In Stock").length,
    "Low Stock": stock.filter((s) => s.status === "Low Stock").length,
    "Out of Stock": stock.filter((s) => s.status === "Out of Stock").length,
  };

  if (isLoading) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading stock...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Central Stock</h1>
            <p className="text-gray-500">Manage central warehouse inventory</p>
          </div>
          <Link
            href="/central-inventory/stock/update"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusCircle className="w-5 h-5" />
            Update Stock
          </Link>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by part name, SKU, category, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                {(
                  [
                    { key: "all", label: "All", icon: Package },
                    { key: "In Stock", label: "In Stock", icon: Package },
                    { key: "Low Stock", label: "Low Stock", icon: TrendingUp },
                    { key: "Out of Stock", label: "Out of Stock", icon: Package },
                  ] as const
                ).map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key as FilterStatus)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      statusFilter === filter.key
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <filter.icon className="w-4 h-4" />
                    <span>{filter.label}</span>
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                      {statusCounts[filter.key as keyof typeof statusCounts]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Stock List */}
        {filteredStock.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No stock items found</p>
                {searchQuery || statusFilter !== "all" ? (
                  <p className="text-gray-400 text-sm mt-2">
                    Try adjusting your search or filter criteria
                  </p>
                ) : null}
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <Card>
              <CardBody className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Part Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        SKU / Part Number
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Category
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Current Qty
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Min/Max
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Unit Price
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Total Value
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Location
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium">{item.partName}</p>
                          {item.partCode && (
                            <p className="text-sm text-gray-400">Code: {item.partCode}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">{item.sku}</p>
                          <p className="text-xs text-gray-400">{item.partNumber}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.category}</td>
                        <td className="py-3 px-4 text-right font-medium">{item.currentQty}</td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">
                          {item.minStock} / {item.maxStock}
                        </td>
                        <td className="py-3 px-4 text-right">₹{item.unitPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          ₹{(item.currentQty * item.unitPrice).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <p>{item.location}</p>
                          <p className="text-xs text-gray-400">{item.warehouse}</p>
                        </td>
                        <td className="py-3 px-4 text-center">{getStatusBadge(item.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

