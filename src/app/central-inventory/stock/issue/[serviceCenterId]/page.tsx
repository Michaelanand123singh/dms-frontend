"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  PlusCircle,
  MinusCircle,
  Package,
  Building,
  Truck,
  Search,
  X,
  CheckCircle,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { centralInventoryRepository } from "@/__mocks__/repositories/central-inventory.repository";
import type {
  CentralStock,
  ServiceCenterInfo,
  PartsIssueFormData,
  PurchaseOrder,
} from "@/shared/types/central-inventory.types";

interface IssueItem {
  partId: string;
  partName: string;
  sku: string;
  fromStock: string;
  quantity: number;
  unitPrice: number;
  availableQty: number;
}

export default function StockIssuePage() {
  const router = useRouter();
  const params = useParams();
  const serviceCenterId = params.serviceCenterId as string;

  const [serviceCenter, setServiceCenter] = useState<ServiceCenterInfo | null>(null);
  const [stock, setStock] = useState<CentralStock[]>([]);
  const [issueItems, setIssueItems] = useState<IssueItem[]>([]);
  const [selectedPart, setSelectedPart] = useState<CentralStock | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [availablePOs, setAvailablePOs] = useState<PurchaseOrder[]>([]);
  const [notes, setNotes] = useState("");
  const [transportDetails, setTransportDetails] = useState({
    transporter: "",
    trackingNumber: "",
    expectedDelivery: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch service center
        const sc = await centralInventoryRepository.getServiceCenterById(serviceCenterId);
        if (!sc) {
          router.push("/central-inventory/stock/issue");
          return;
        }
        setServiceCenter(sc);

        // Fetch stock
        const stockData = await centralInventoryRepository.getAllStock();
        setStock(stockData.filter((s) => s.status !== "Out of Stock"));

        // Fetch approved purchase orders for this service center
        const allPOs = await centralInventoryRepository.getAllPurchaseOrders();
        const scPOs = allPOs.filter(
          (po) =>
            po.serviceCenterId === serviceCenterId &&
            (po.status === "approved" || po.status === "partially_fulfilled")
        );
        setAvailablePOs(scPOs);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (serviceCenterId) {
      fetchData();
    }
  }, [serviceCenterId, router]);

  const handleAddItem = () => {
    if (!selectedPart || quantity <= 0) {
      alert("Please select a part and enter a valid quantity");
      return;
    }

    if (quantity > selectedPart.currentQty) {
      alert("Quantity cannot exceed available stock");
      return;
    }

    // Check if item already exists
    const existingIndex = issueItems.findIndex((item) => item.fromStock === selectedPart.id);
    if (existingIndex >= 0) {
      const newQty = issueItems[existingIndex].quantity + quantity;
      if (newQty > selectedPart.currentQty) {
        alert("Total quantity cannot exceed available stock");
        return;
      }
      const updated = [...issueItems];
      updated[existingIndex].quantity = newQty;
      setIssueItems(updated);
    } else {
      setIssueItems([
        ...issueItems,
        {
          partId: selectedPart.partId,
          partName: selectedPart.partName,
          sku: selectedPart.sku,
          fromStock: selectedPart.id,
          quantity,
          unitPrice: selectedPart.unitPrice,
          availableQty: selectedPart.currentQty,
        },
      ]);
    }

    setSelectedPart(null);
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setIssueItems(issueItems.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const item = issueItems[index];
    if (newQty > item.availableQty) {
      alert("Quantity cannot exceed available stock");
      return;
    }
    const updated = [...issueItems];
    updated[index].quantity = newQty;
    setIssueItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (issueItems.length === 0) {
      alert("Please add at least one item to issue");
      return;
    }

    if (!confirm("Are you sure you want to issue these parts?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      const userInfo = JSON.parse(
        localStorage.getItem("userInfo") || '{"name": "Central Inventory Manager"}'
      );

      const formData: PartsIssueFormData = {
        serviceCenterId: serviceCenterId,
        purchaseOrderId: purchaseOrderId || undefined,
        items: issueItems.map((item) => ({
          partId: item.partId,
          quantity: item.quantity,
          fromStock: item.fromStock,
        })),
        notes: notes || undefined,
        transportDetails:
          transportDetails.transporter || transportDetails.trackingNumber
            ? transportDetails
            : undefined,
      };

      await centralInventoryRepository.createPartsIssue(formData, userInfo.name || "Central Inventory Manager");

      alert("Parts issued successfully!");
      router.push("/central-inventory/stock");
    } catch (error) {
      console.error("Failed to issue parts:", error);
      alert("Failed to issue parts. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStock = stock.filter(
    (s) =>
      s.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = issueItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  if (isLoading) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!serviceCenter) {
    return null;
  }

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Building className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-blue-600">Issue Parts</h1>
          </div>
          <p className="text-gray-500">
            Issue parts from central warehouse to {serviceCenter.name}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Add Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Service Center Info */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-800">Service Center</h2>
                </CardHeader>
                <CardBody>
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium">{serviceCenter.name}</p>
                      {serviceCenter.location && (
                        <p className="text-sm text-gray-500">{serviceCenter.location}</p>
                      )}
                      {serviceCenter.contactPerson && (
                        <p className="text-sm text-gray-500 mt-1">
                          Contact: {serviceCenter.contactPerson}
                        </p>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Purchase Order Selection */}
              {availablePOs.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-800">Link Purchase Order (Optional)</h2>
                  </CardHeader>
                  <CardBody>
                    <select
                      value={purchaseOrderId}
                      onChange={(e) => setPurchaseOrderId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      {availablePOs.map((po) => (
                        <option key={po.id} value={po.id}>
                          {po.poNumber} - ₹{po.totalAmount.toLocaleString()} ({po.items.length}{" "}
                          items)
                        </option>
                      ))}
                    </select>
                  </CardBody>
                </Card>
              )}

              {/* Add Parts */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-800">Add Parts</h2>
                </CardHeader>
                <CardBody>
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by part name or SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                    {filteredStock.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No stock items found</p>
                    ) : (
                      filteredStock.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedPart(item)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedPart?.id === item.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{item.partName}</p>
                              <p className="text-sm text-gray-500">{item.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{item.currentQty}</p>
                              <p className="text-xs text-gray-400">available</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  {selectedPart && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max={selectedPart.currentQty}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Quantity"
                      />
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <PlusCircle className="w-5 h-5" />
                        Add
                      </button>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Issue Items List */}
              {issueItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-800">Items to Issue</h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {issueItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
                        >
                          <Package className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="font-medium">{item.partName}</p>
                            <p className="text-sm text-gray-500">{item.sku}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                              className="p-1 text-gray-600 hover:text-gray-800"
                            >
                              <MinusCircle className="w-5 h-5" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.availableQty}
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(index, parseInt(e.target.value) || 1)
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                              className="p-1 text-gray-600 hover:text-gray-800"
                            >
                              <PlusCircle className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{(item.quantity * item.unitPrice).toLocaleString()}</p>
                            <p className="text-xs text-gray-400">
                              ₹{item.unitPrice.toLocaleString()} each
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Transport Details */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-800">Transport Details (Optional)</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transporter
                    </label>
                    <input
                      type="text"
                      value={transportDetails.transporter}
                      onChange={(e) =>
                        setTransportDetails({ ...transportDetails, transporter: e.target.value })
                      }
                      placeholder="e.g., Fast Logistics"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={transportDetails.trackingNumber}
                      onChange={(e) =>
                        setTransportDetails({
                          ...transportDetails,
                          trackingNumber: e.target.value,
                        })
                      }
                      placeholder="e.g., FL-2024-001234"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Delivery
                    </label>
                    <input
                      type="datetime-local"
                      value={transportDetails.expectedDelivery}
                      onChange={(e) =>
                        setTransportDetails({
                          ...transportDetails,
                          expectedDelivery: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-800">Notes (Optional)</h2>
                </CardHeader>
                <CardBody>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Additional notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </CardBody>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Items</span>
                      <span className="font-medium">{issueItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Quantity</span>
                      <span className="font-medium">
                        {issueItems.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-semibold">Total Amount</span>
                        <span className="font-bold text-lg text-blue-600">
                          ₹{totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || issueItems.length === 0}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {isSubmitting ? "Issuing..." : "Issue Parts"}
                    </button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

