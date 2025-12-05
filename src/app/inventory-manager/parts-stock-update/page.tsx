"use client";
import { useState, useEffect } from "react";
import { stockUpdateHistoryService } from "@/services/inventory/stockUpdateHistory.service";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Package, TrendingDown, Clock, User, FileText } from "lucide-react";
import type { StockUpdateHistory } from "@/services/inventory/stockUpdateHistory.service";

export default function PartsStockUpdatePage() {
  const [updates, setUpdates] = useState<StockUpdateHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      const data = await stockUpdateHistoryService.getRecent(100);
      setUpdates(data);
    } catch (error) {
      console.error("Failed to fetch stock updates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-24 px-8 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Stock Update History</h1>
          <p className="text-gray-500 mt-1">Automatic stock updates from inventory approvals</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading stock updates...</p>
          </div>
        ) : updates.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stock Updates</h3>
                <p className="text-gray-600">
                  Stock updates will appear here when parts are assigned to engineers from job cards.
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <Card key={update.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${update.operation === "decrease" ? "bg-red-50" : "bg-green-50"}`}>
                        <TrendingDown
                          className={update.operation === "decrease" ? "text-red-600" : "text-green-600"}
                          size={20}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{update.partName}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Part Number: {update.partNumber} | Part ID: {update.partId}
                        </p>
                      </div>
                    </div>
                    <Badge variant={update.operation === "decrease" ? "danger" : "success"}>
                      {update.operation === "decrease" ? "Decreased" : "Increased"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Quantity</p>
                      <p className="text-sm font-semibold text-gray-900">{update.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Previous Stock</p>
                      <p className="text-sm font-semibold text-gray-900">{update.previousStock}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">New Stock</p>
                      <p className={`text-sm font-semibold ${update.newStock < 10 ? "text-red-600" : "text-gray-900"}`}>
                        {update.newStock}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Updated At</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(update.updatedAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <FileText size={14} />
                        Job Card
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {update.jobCardNumber || update.jobCardId}
                      </p>
                      {update.customerName && (
                        <p className="text-xs text-gray-500 mt-1">Customer: {update.customerName}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <User size={14} />
                        Assigned To
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {update.assignedEngineer || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">By: {update.updatedBy}</p>
                    </div>
                  </div>

                  {update.reason && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Reason</p>
                      <p className="text-sm text-gray-700">{update.reason}</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
