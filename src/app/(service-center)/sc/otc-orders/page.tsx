"use client";
import { useState, useCallback } from "react";
import {
  ShoppingCart,
  PlusCircle,
  Search,
  X,
  Trash2,
  Percent,
  FileText,
  CheckCircle,
  User,
  Car,
  Package,
} from "lucide-react";
import type { OTCPart, CartItem, CustomerInfo, InvoiceData } from "@/shared/types";

export default function OTCOrders() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCart, setShowCart] = useState<boolean>(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    phone: "",
    name: "",
    vehicleNumber: "",
    vin: "",
  });
  const [discount, setDiscount] = useState<number>(0);
  const [showInvoice, setShowInvoice] = useState<boolean>(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  // Mock parts inventory for OTC
  const availableParts: OTCPart[] = [
    { id: 1, name: "Engine Oil 5W-30", hsnCode: "EO-001", price: 450, stock: 45, category: "Lubricants" },
    { id: 2, name: "Brake Pads - Front", hsnCode: "BP-002", price: 1200, stock: 8, category: "Brakes" },
    { id: 3, name: "Air Filter", hsnCode: "AF-003", price: 350, stock: 0, category: "Filters" },
    { id: 4, name: "AC Gas R134a", hsnCode: "AC-004", price: 800, stock: 12, category: "AC Parts" },
    { id: 5, name: "Spark Plugs Set", hsnCode: "SP-005", price: 600, stock: 25, category: "Engine" },
    { id: 6, name: "Windshield Wiper", hsnCode: "WW-006", price: 250, stock: 30, category: "Accessories" },
  ];

  const filteredParts = availableParts.filter(
    (part) =>
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.hsnCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (part: OTCPart): void => {
    const existingItem = cart.find((item) => item.id === part.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === part.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...part, quantity: 1 }]);
    }
    setShowCart(true);
  };

  const removeFromCart = (id: number): void => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number): void => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(
      cart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const tax = ((subtotal - discountAmount) * 18) / 100; // 18% GST
  const total = subtotal - discountAmount + tax;

  const handleGenerateInvoice = useCallback((): void => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    // Generate invoice data only when handler is called (not during render)
    const now = Date.now();
    const currentDate = new Date();
    const invoice: InvoiceData = {
      invoiceNumber: `OTC-${now}`,
      date: currentDate.toLocaleDateString("en-IN"),
      customer: customerInfo,
      items: cart,
      subtotal,
      discount,
      discountAmount,
      tax,
      total,
    };
    setInvoiceData(invoice);
    setShowInvoice(true);
  }, [cart, customerInfo, subtotal, discount, discountAmount, tax, total]);

  const handleCompleteSale = (): void => {
    alert("Payment recorded! Invoice generated successfully.");
    setCart([]);
    setCustomerInfo({ phone: "", name: "", vehicleNumber: "", vin: "" });
    setDiscount(0);
    setShowInvoice(false);
    setShowCart(false);
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">OTC Orders</h1>
          <p className="text-gray-500">Over-the-counter parts sales - Quick transaction processing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Parts Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search parts by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Parts List */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Parts</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredParts.map((part) => (
                  <div
                    key={part.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="text-gray-400" size={20} />
                          <div>
                            <p className="font-semibold text-gray-800">{part.name}</p>
                            <p className="text-xs text-gray-500">
                              HSN Code: {part.hsnCode} • {part.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold text-gray-800">₹{part.price}</span>
                          <span
                            className={`${
                              part.stock > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            Stock: {part.stock}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(part)}
                        disabled={part.stock === 0}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          part.stock > 0
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart & Customer Info */}
          <div className="space-y-6">
            {/* Cart */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <ShoppingCart className="text-blue-600" size={24} />
                  Cart ({cart.length})
                </h2>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingCart className="mx-auto mb-2" size={48} />
                  <p className="text-sm">Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">HSN Code: {item.hsnCode}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount ({discount}%)</span>
                    <span className="font-medium text-green-600">
                      -₹{discountAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                    <span>Total</span>
                    <span className="text-blue-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="text-purple-600" size={24} />
                Customer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, phone: e.target.value })
                    }
                    placeholder="10-digit phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    placeholder="Enter customer name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerInfo.vehicleNumber}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        vehicleNumber: e.target.value,
                      })
                    }
                    placeholder="e.g., PB10AB1234"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setDiscount(5)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      5%
                    </button>
                    <button
                      onClick={() => setDiscount(10)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      10%
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Max discount: 15% (SC Manager approval needed above 5%)
                  </p>
                </div>
              </div>
            </div>

            {/* Generate Invoice Button */}
            {cart.length > 0 && (
              <button
                onClick={handleGenerateInvoice}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition shadow-md flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                Generate Invoice
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && invoiceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Invoice</h2>
              <button
                onClick={() => setShowInvoice(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-600">Invoice Number</p>
                <p className="text-xl font-bold text-gray-800">{invoiceData.invoiceNumber}</p>
                <p className="text-sm text-gray-600 mt-1">Date: {invoiceData.date}</p>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Customer Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Name:</strong> {invoiceData.customer.name || "Walk-in Customer"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Phone:</strong> {invoiceData.customer.phone || "N/A"}
                  </p>
                  {invoiceData.customer.vehicleNumber && (
                    <p className="text-sm text-gray-700">
                      <strong>Vehicle:</strong> {invoiceData.customer.vehicleNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                          Item
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                          Price
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoiceData.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-800">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-center text-gray-700">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-gray-700">
                            ₹{item.price}
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-medium text-gray-800">
                            ₹{item.price * item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{invoiceData.subtotal.toFixed(2)}</span>
                </div>
                {invoiceData.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount ({invoiceData.discount}%)</span>
                    <span className="font-medium text-green-600">
                      -₹{invoiceData.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-medium">₹{invoiceData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{invoiceData.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Payment Method</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(["Cash", "Card", "UPI", "Online"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={handleCompleteSale}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition"
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

