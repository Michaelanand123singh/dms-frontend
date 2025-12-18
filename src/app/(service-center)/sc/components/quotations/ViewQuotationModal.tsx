import {
    X,
    Printer,
    Building2,
    CheckCircle,
    Clock,
    UserCheck,
    UserX,
    ArrowRight,
    ShieldCheck,
    ShieldX,
    MessageCircle
} from "lucide-react";
import type { QuotationItem } from "@/shared/types";

// View Quotation Modal - Proforma Invoice Template
export function ViewQuotationModal({
    quotation,
    onClose,
    onSendToCustomer,
    onCustomerApproval,
    onCustomerRejection,
    onSendToManager,
    onManagerApproval,
    onManagerRejection,
    userInfo,
    userRole,
    isServiceAdvisor,
    isServiceManager,
}: any) {
    // Mock service center details (in production, fetch from service center data)
    const serviceCenter = quotation.serviceCenter || {
        name: "42 EV Tech & Services",
        address: "123 Main Street, Industrial Area",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411001",
        phone: "+91-20-12345678",
        gstNumber: "27AAAAA0000A1Z5",
        panNumber: "AAAAA0000A",
    };

    // Service advisor details from user info
    const serviceAdvisor = {
        name: userInfo?.name || "Service Advisor",
        phone: userInfo?.phone || "+91-9876543210",
    };

    const validUntilDate = quotation.validUntil
        ? new Date(quotation.validUntil).toLocaleDateString("en-IN")
        : "N/A";

    const quotationDate = new Date(quotation.quotationDate).toLocaleDateString("en-IN");

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-[101] no-print">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {quotation.documentType === "Proforma Invoice" ? "Proforma Invoice" : "Quotation"}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm inline-flex items-center gap-2"
                        >
                            <Printer size={16} />
                            Print/Download
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Proforma Invoice Template */}
                <div className="p-8 bg-white">
                    <style dangerouslySetInnerHTML={{
                        __html: `
            .pricing-summary-table {
              width: 100%;
              border-collapse: collapse;
            }
            .pricing-summary-table td {
              padding: 8px 12px;
              white-space: nowrap;
            }
            .pricing-summary-table td:first-child {
              text-align: left;
            }
            .pricing-summary-table td:last-child {
              text-align: right;
            }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: auto !important;
              }
              .no-print {
                display: none !important;
              }
              body {
                background: white !important;
                margin: 0 !important;
                padding: 10px 15px !important;
                font-size: 12px !important;
              }
              @page {
                margin: 0.8cm !important;
                size: A4;
              }
              @page :first {
                margin: 0.8cm !important;
              }
              .border-b-2 {
                padding-bottom: 10px !important;
                margin-bottom: 12px !important;
              }
              .mb-6 {
                margin-bottom: 12px !important;
              }
              h3 {
                font-size: 14px !important;
                margin-bottom: 8px !important;
              }
              .text-xl {
                font-size: 16px !important;
              }
              table {
                font-size: 11px !important;
                margin: 12px 0 !important;
              }
              th, td {
                padding: 6px 4px !important;
                font-size: 11px !important;
              }
              .text-lg {
                font-size: 14px !important;
              }
              .text-sm {
                font-size: 11px !important;
              }
              .grid {
                gap: 8px !important;
              }
              .space-y-1 {
                gap: 4px !important;
              }
              .pricing-summary-container {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                max-width: 100% !important;
                width: 100% !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
                margin-bottom: 12px !important;
              }
              .pricing-summary-table {
                width: 100% !important;
                max-width: 100% !important;
                table-layout: fixed !important;
                font-size: 12px !important;
              }
              .pricing-summary-table td {
                white-space: nowrap !important;
                overflow: visible !important;
                padding: 6px 8px !important;
                font-size: 12px !important;
              }
              .pricing-summary-table td:first-child {
                width: 65% !important;
                text-align: left !important;
                padding-right: 15px !important;
              }
              .pricing-summary-table td:last-child {
                width: 35% !important;
                text-align: right !important;
                padding-left: 15px !important;
              }
              .pricing-summary-row {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              .border-t-2 {
                padding-top: 8px !important;
              }
              .text-lg.font-bold {
                font-size: 14px !important;
              }
            }
          `}} />
                    {/* Header Section */}
                    <div className="border-b-2 border-gray-300 pb-6 mb-6">
                        <div className="flex justify-between items-start">
                            {/* Company Logo & Details */}
                            <div className="flex-1">
                                <div className="mb-4">
                                    {/* Logo placeholder - in production, use actual logo */}
                                    <div className="w-32 h-20 bg-gray-200 rounded flex items-center justify-center mb-3">
                                        <Building2 className="text-gray-400" size={40} />
                                    </div>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <h3 className="text-xl font-bold text-gray-900">{serviceCenter.name}</h3>
                                    <p className="text-gray-700">{serviceCenter.address}</p>
                                    <p className="text-gray-700">
                                        {serviceCenter.city}, {serviceCenter.state} - {serviceCenter.pincode}
                                    </p>
                                    <p className="text-gray-700">Phone: {serviceCenter.phone}</p>
                                    {serviceCenter.panNumber && (
                                        <p className="text-gray-700">PAN: {serviceCenter.panNumber}</p>
                                    )}
                                    {serviceCenter.gstNumber && (
                                        <p className="text-gray-700">GST: {serviceCenter.gstNumber}</p>
                                    )}
                                </div>
                            </div>

                            {/* Document Type & Details */}
                            <div className="text-right">
                                <div className="mb-4">
                                    <h2 className="text-3xl font-bold text-blue-600 mb-2">
                                        {quotation.documentType === "Proforma Invoice" ? "PROFORMA INVOICE" : "QUOTATION"}
                                    </h2>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-semibold text-gray-700">Document No:</span>
                                        <p className="text-gray-900 font-medium">{quotation.quotationNumber}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Date:</span>
                                        <p className="text-gray-900">{quotationDate}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Valid Till:</span>
                                        <p className="text-gray-900">{validUntilDate}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Service Advisor Details */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex gap-6 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-700">Service Advisor:</span>
                                    <span className="text-gray-900 ml-2">{serviceAdvisor.name}</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Phone:</span>
                                    <span className="text-gray-900 ml-2">{serviceAdvisor.phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Vehicle Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                            Customer & Vehicle Details
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-1">Customer Name</p>
                                <p className="text-gray-900">
                                    {quotation.customer?.firstName || ""} {quotation.customer?.lastName || ""}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-1">Phone Number</p>
                                <p className="text-gray-900">{quotation.customer?.phone || "N/A"}</p>
                            </div>
                            {quotation.vehicle && (
                                <>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-1">Vehicle Number</p>
                                        <p className="text-gray-900">{quotation.vehicle.registration || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-1">Brand and Model</p>
                                        <p className="text-gray-900">
                                            {quotation.vehicle.make || ""} {quotation.vehicle.model || ""}
                                        </p>
                                    </div>
                                </>
                            )}
                            {quotation.vehicleLocation && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-1">Vehicle Location</p>
                                    <p className="text-gray-900">
                                        {quotation.vehicleLocation === "with_customer" ? "Vehicle with Customer" : "Vehicle at Workshop"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Insurance Details */}
                    {quotation.hasInsurance && (quotation.insurer || quotation.insuranceStartDate || quotation.insuranceEndDate) && (
                        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Insurance Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {quotation.insurer && (
                                    <>
                                        <div>
                                            <p className="font-semibold text-gray-700 mb-1">Insurer Name</p>
                                            <p className="text-gray-900">{quotation.insurer.name}</p>
                                        </div>
                                        {quotation.insurer.gstNumber && (
                                            <div>
                                                <p className="font-semibold text-gray-700 mb-1">Insurer GST Number</p>
                                                <p className="text-gray-900">{quotation.insurer.gstNumber}</p>
                                            </div>
                                        )}
                                        {quotation.insurer.address && (
                                            <div className="col-span-2">
                                                <p className="font-semibold text-gray-700 mb-1">Insurer Address</p>
                                                <p className="text-gray-900">{quotation.insurer.address}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                                {quotation.insuranceStartDate && (
                                    <div>
                                        <p className="font-semibold text-gray-700 mb-1">Insurance Start Date</p>
                                        <p className="text-gray-900">
                                            {new Date(quotation.insuranceStartDate).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                )}
                                {quotation.insuranceEndDate && (
                                    <div>
                                        <p className="font-semibold text-gray-700 mb-1">Insurance End Date</p>
                                        <p className="text-gray-900">
                                            {new Date(quotation.insuranceEndDate).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Parts & Services Table */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                            Parts & Services
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                                            S.No
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                                            Part Name
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                                            Part Number
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                                            HSN/SAC Code
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700">
                                            Quantity
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-700">
                                            Rate (₹)
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700">
                                            GST %
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-700">
                                            Amount (₹)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotation.items && quotation.items.length > 0 ? (
                                        quotation.items.map((item: QuotationItem, index: number) => (
                                            <tr key={item.id || index} className="hover:bg-gray-50">
                                                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                                                    {item.serialNumber}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                                                    {item.partName}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                                                    {item.partNumber || "-"}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                                                    {item.hsnSacCode || "-"}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-sm text-center text-gray-900">
                                                    {item.quantity}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-900">
                                                    {item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-sm text-center text-gray-900">
                                                    {item.gstPercent}%
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-900 font-medium">
                                                    {item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="border border-gray-300 px-4 py-4 text-center text-gray-500">
                                                No items added
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="mb-6 pricing-summary-container">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                            Pricing Summary
                        </h3>
                        <div className="w-full">
                            <table className="w-full pricing-summary-table border-collapse" style={{ tableLayout: 'fixed' }}>
                                <tbody>
                                    <tr className="pricing-summary-row">
                                        <td className="text-gray-700 text-sm py-2 pr-4" style={{ width: '65%' }}>Subtotal:</td>
                                        <td className="text-gray-900 font-medium text-sm py-2 text-right" style={{ width: '35%', whiteSpace: 'nowrap' }}>
                                            ₹{quotation.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                    {quotation.discount > 0 && (
                                        <tr className="pricing-summary-row">
                                            <td className="text-gray-700 text-sm py-2 pr-4">
                                                Discount {quotation.discountPercent > 0 ? `(${quotation.discountPercent.toFixed(1)}%)` : ""}:
                                            </td>
                                            <td className="text-gray-900 font-medium text-sm py-2 text-right" style={{ whiteSpace: 'nowrap' }}>
                                                -₹{quotation.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    )}
                                    <tr className="pricing-summary-row border-t border-gray-200">
                                        <td className="text-gray-700 text-sm py-2 pr-4 pt-3">Pre-GST Amount:</td>
                                        <td className="text-gray-900 font-medium text-sm py-2 pt-3 text-right" style={{ whiteSpace: 'nowrap' }}>
                                            ₹{quotation.preGstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                    {quotation.cgstAmount > 0 && (
                                        <tr className="pricing-summary-row">
                                            <td className="text-gray-700 text-sm py-2 pr-4">CGST (9%):</td>
                                            <td className="text-gray-900 font-medium text-sm py-2 text-right" style={{ whiteSpace: 'nowrap' }}>
                                                ₹{quotation.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    )}
                                    {quotation.sgstAmount > 0 && (
                                        <tr className="pricing-summary-row">
                                            <td className="text-gray-700 text-sm py-2 pr-4">SGST (9%):</td>
                                            <td className="text-gray-900 font-medium text-sm py-2 text-right" style={{ whiteSpace: 'nowrap' }}>
                                                ₹{quotation.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    )}
                                    {quotation.igstAmount > 0 && (
                                        <tr className="pricing-summary-row">
                                            <td className="text-gray-700 text-sm py-2 pr-4">IGST (18%):</td>
                                            <td className="text-gray-900 font-medium text-sm py-2 text-right" style={{ whiteSpace: 'nowrap' }}>
                                                ₹{quotation.igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    )}
                                    <tr className="pricing-summary-row border-t-2 border-gray-400">
                                        <td className="text-lg font-bold text-gray-900 py-2 pt-3">Total Amount:</td>
                                        <td className="text-lg font-bold text-blue-600 py-2 pt-3 text-right" style={{ whiteSpace: 'nowrap' }}>
                                            ₹{quotation.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes Section */}
                    {(quotation.notes || quotation.batterySerialNumber || quotation.customNotes) && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                            <div className="space-y-2 text-sm text-gray-700">
                                {quotation.batterySerialNumber && (
                                    <div>
                                        <span className="font-semibold">Battery Serial Number:</span>
                                        <span className="ml-2">{quotation.batterySerialNumber}</span>
                                    </div>
                                )}
                                {quotation.notes && (
                                    <div>
                                        <p className="whitespace-pre-wrap">{quotation.notes}</p>
                                    </div>
                                )}
                                {quotation.customNotes && (
                                    <div>
                                        <p className="font-semibold mb-1">Additional Notes:</p>
                                        <p className="whitespace-pre-wrap">{quotation.customNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center text-xs text-gray-500">
                        <p>This is a {quotation.documentType.toLowerCase()}. Terms and conditions apply.</p>
                        <p className="mt-1">For queries, please contact: {serviceCenter.phone}</p>
                    </div>
                </div>

                {/* Approval Status Display */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 no-print">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Approval Status</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            {quotation.sentToCustomer ? (
                                <CheckCircle className="text-green-600" size={16} />
                            ) : (
                                <Clock className="text-gray-400" size={16} />
                            )}
                            <span className="text-sm text-gray-700">
                                Sent to Customer: {quotation.sentToCustomer ? "Yes" : "No"}
                                {quotation.sentToCustomerAt && ` (${new Date(quotation.sentToCustomerAt).toLocaleString()})`}
                            </span>
                        </div>
                        {quotation.customerApproved !== undefined && (
                            <div className="flex items-center gap-2">
                                {quotation.customerApproved ? (
                                    <UserCheck className="text-green-600" size={16} />
                                ) : (
                                    <UserX className="text-red-600" size={16} />
                                )}
                                <span className="text-sm text-gray-700">
                                    Customer: {quotation.customerApproved ? "Approved" : "Rejected"}
                                    {quotation.customerApprovedAt && ` (${new Date(quotation.customerApprovedAt).toLocaleString()})`}
                                    {quotation.customerRejectedAt && ` (${new Date(quotation.customerRejectedAt).toLocaleString()})`}
                                </span>
                            </div>
                        )}
                        {quotation.sentToManager && (
                            <div className="flex items-center gap-2">
                                <ArrowRight className="text-blue-600" size={16} />
                                <span className="text-sm text-gray-700">
                                    Sent to Manager: {quotation.sentToManagerAt && new Date(quotation.sentToManagerAt).toLocaleString()}
                                </span>
                            </div>
                        )}
                        {quotation.managerApproved !== undefined && (
                            <div className="flex items-center gap-2">
                                {quotation.managerApproved ? (
                                    <ShieldCheck className="text-green-600" size={16} />
                                ) : (
                                    <ShieldX className="text-red-600" size={16} />
                                )}
                                <span className="text-sm text-gray-700">
                                    Manager: {quotation.managerApproved ? "Approved" : "Rejected"}
                                    {quotation.managerApprovedAt && ` (${new Date(quotation.managerApprovedAt).toLocaleString()})`}
                                    {quotation.managerRejectedAt && ` (${new Date(quotation.managerRejectedAt).toLocaleString()})`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end no-print">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                        Close
                    </button>

                    {/* Service Advisor Actions (shown for all roles for now so feature is visible) */}
                    {(
                        <>
                            {quotation.status === "draft" && onSendToCustomer && (
                                <button
                                    onClick={() => onSendToCustomer(quotation.id)}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium inline-flex items-center gap-2"
                                >
                                    <MessageCircle size={18} />
                                    Send to Customer (WhatsApp)
                                </button>
                            )}
                            {quotation.status === "sent_to_customer" && onCustomerApproval && onCustomerRejection && (
                                <>
                                    <button
                                        onClick={() => onCustomerRejection(quotation.id)}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium inline-flex items-center gap-2"
                                    >
                                        <UserX size={18} />
                                        Customer Rejected
                                    </button>
                                    <button
                                        onClick={() => onCustomerApproval(quotation.id)}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium inline-flex items-center gap-2"
                                    >
                                        <UserCheck size={18} />
                                        Customer Approved
                                    </button>
                                </>
                            )}
                            {quotation.status === "customer_approved" && onSendToManager && (
                                <button
                                    onClick={() => onSendToManager(quotation.id)}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium inline-flex items-center gap-2"
                                >
                                    <ArrowRight size={18} />
                                    Send to Manager
                                </button>
                            )}
                        </>
                    )}

                    {/* Service Manager Actions */}
                    {isServiceManager && onManagerApproval && onManagerRejection && (
                        <>
                            {quotation.status === "sent_to_manager" && (
                                <>
                                    <button
                                        onClick={() => onManagerRejection(quotation.id)}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium inline-flex items-center gap-2"
                                    >
                                        <ShieldX size={18} />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => onManagerApproval(quotation.id)}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium inline-flex items-center gap-2"
                                    >
                                        <ShieldCheck size={18} />
                                        Approve
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
