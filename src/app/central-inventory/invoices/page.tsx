"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Building, Calendar, DollarSign, Search, Download } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { invoiceService } from "@/features/inventory/services/invoice.service";
import { centralInventoryRepository } from "@/core/repositories/central-inventory.repository";
import type { Invoice } from "@/shared/types/invoice.types";
import type { ServiceCenterInfo } from "@/shared/types/central-inventory.types";

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenterInfo[]>([]);
  const [selectedServiceCenter, setSelectedServiceCenter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const allInvoices = invoiceService.getAllInvoices();
        const scs = await centralInventoryRepository.getAllServiceCenters();
        setServiceCenters(scs);
        setInvoices(allInvoices);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: Invoice["status"]) => {
    const badges = {
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      sent: { color: "bg-blue-100 text-blue-800", label: "Sent" },
      paid: { color: "bg-green-100 text-green-800", label: "Paid" },
      overdue: { color: "bg-red-100 text-red-800", label: "Overdue" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    return badges[status] || badges.draft;
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesServiceCenter =
      selectedServiceCenter === "all" || invoice.serviceCenterId === selectedServiceCenter;
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.serviceCenterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.partsIssueNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesServiceCenter && matchesSearch;
  });

  // Group invoices by service center
  const invoicesByServiceCenter = filteredInvoices.reduce((acc, invoice) => {
    if (!acc[invoice.serviceCenterId]) {
      acc[invoice.serviceCenterId] = [];
    }
    acc[invoice.serviceCenterId].push(invoice);
    return acc;
  }, {} as Record<string, Invoice[]>);

  if (isLoading) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen pt-24 px-8 pb-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-24 px-8 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Invoices</h1>
          <p className="text-gray-500 mt-1">View and manage all invoices service center wise</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Service Center
                </label>
                <select
                  value={selectedServiceCenter}
                  onChange={(e) => setSelectedServiceCenter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Service Centers</option>
                  {serviceCenters.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by invoice number, service center..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Invoices by Service Center */}
        {Object.keys(invoicesByServiceCenter).length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto mb-2" size={48} />
                <p>No invoices found</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(invoicesByServiceCenter).map(([serviceCenterId, scInvoices]) => {
              const serviceCenter = serviceCenters.find((sc) => sc.id === serviceCenterId);
              const totalAmount = scInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

              return (
                <Card key={serviceCenterId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building className="text-indigo-600" size={24} />
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">
                            {serviceCenter?.name || "Unknown Service Center"}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {scInvoices.length} invoice{scInvoices.length !== 1 ? "s" : ""} • Total: ₹
                            {totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {scInvoices.map((invoice) => {
                        const statusBadge = getStatusBadge(invoice.status);
                        return (
                          <div
                            key={invoice.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => router.push(`/central-inventory/invoices/${invoice.id}`)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <FileText className="text-indigo-600" size={20} />
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    Invoice #{invoice.invoiceNumber}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Parts Issue: {invoice.partsIssueNumber} •{" "}
                                    {new Date(invoice.issuedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  ₹{invoice.totalAmount.toLocaleString()}
                                </p>
                                <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/central-inventory/invoices/${invoice.id}`);
                                }}
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <Download size={16} />
                                View
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

