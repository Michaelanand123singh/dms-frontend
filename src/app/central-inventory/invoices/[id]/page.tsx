"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Download, FileText, Building, Calendar, DollarSign, CheckCircle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { invoiceService } from "@/services/central-inventory/invoice.service";
import type { Invoice } from "@/shared/types/invoice.types";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const inv = await invoiceService.getInvoiceById(invoiceId);
        setInvoice(inv);
      } catch (error) {
        console.error("Failed to fetch invoice:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    window.print();
  };

  if (isLoading) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen pt-24 px-8 pb-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen pt-24 px-8 pb-10">
        <Card>
          <CardBody>
            <p className="text-center text-gray-500">Invoice not found</p>
          </CardBody>
        </Card>
      </div>
    );
  }

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

  const statusBadge = getStatusBadge(invoice.status);

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-24 px-8 pb-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-indigo-600">Invoice Details</h1>
              <p className="text-gray-500 mt-1">Invoice #{invoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
            <Button
              onClick={handleDownloadPDF}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              <Download size={16} />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
                    <p className="text-gray-500 mt-1">#{invoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="font-medium">{new Date(invoice.issuedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Service Center</p>
                    <p className="font-medium">{invoice.serviceCenterName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Parts Issue Number</p>
                    <p className="font-medium">{invoice.partsIssueNumber}</p>
                  </div>
                  {invoice.purchaseOrderNumber && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Purchase Order</p>
                      <p className="font-medium">{invoice.purchaseOrderNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Issued By</p>
                    <p className="font-medium">{invoice.issuedBy}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Part Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">HSN Code</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">{item.partName}</td>
                          <td className="py-3 px-4 text-gray-600">{item.hsnCode}</td>
                          <td className="py-3 px-4 text-right">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">₹{item.unitPrice.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-medium">₹{item.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-6 flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{invoice.subtotal.toLocaleString()}</span>
                    </div>
                    {invoice.tax && invoice.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium">₹{invoice.tax.toLocaleString()}</span>
                      </div>
                    )}
                    {invoice.discount && invoice.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-medium">-₹{invoice.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-lg text-indigo-600">₹{invoice.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                {invoice.paymentScreenshot && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold mb-2">Payment Screenshot</p>
                    <img
                      src={invoice.paymentScreenshot}
                      alt="Payment proof"
                      className="max-w-md h-48 object-contain border rounded"
                    />
                  </div>
                )}

                {invoice.paymentMethod && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Payment Method: {invoice.paymentMethod}</p>
                    {invoice.paymentReference && (
                      <p className="text-sm text-gray-500">Reference: {invoice.paymentReference}</p>
                    )}
                    {invoice.paidAt && (
                      <p className="text-sm text-gray-500">
                        Paid on: {new Date(invoice.paidAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {invoice.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                    <p className="text-sm text-gray-600">{invoice.notes}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-800">Invoice Information</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium">{new Date(invoice.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created By</p>
                    <p className="font-medium">{invoice.createdBy}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

