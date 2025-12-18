import {
    X,
    Trash2,
    MessageCircle,
} from "lucide-react";
import type {
    QuotationItem,
    Insurer,
    NoteTemplate,
    CreateQuotationForm,
    CustomerWithVehicles,
    Vehicle,
} from "@/shared/types";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import type { CheckInSlipFormData } from "@/shared/types/check-in-slip.types";
import { CheckInSlipForm } from "../check-in-slip/CheckInSlipForm";
import type { CheckInSlipData } from "@/components/check-in-slip/CheckInSlip";

interface CreateQuotationModalProps {
    form: CreateQuotationForm;
    setForm: (form: CreateQuotationForm) => void;
    selectedCustomer: CustomerWithVehicles | null;
    setSelectedCustomer: (customer: CustomerWithVehicles | null) => void;
    activeServiceCenterId: string;
    setActiveCustomerId: (id: string) => void;
    customerSearchQuery: string;
    setCustomerSearchQuery: (query: string) => void;
    customerSearchResults: CustomerWithVehicles[];
    clearCustomerSearch: () => void;
    insurers: Insurer[];
    noteTemplates: NoteTemplate[];
    totals: any; // Define proper type if available
    addItem: () => void;
    removeItem: (index: number) => void;
    updateItem: (index: number, field: keyof QuotationItem, value: string | number) => void;
    handleNoteTemplateChange: (templateId: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    handleCreateAndSendToCustomer: () => void;
    handleGenerateAndSendCheckInSlip?: () => void;
    handleSendCheckInSlipToCustomer?: () => void;
    checkInSlipFormData: CheckInSlipFormData;
    setCheckInSlipFormData: (data: any) => void; // Adjust type as needed
    userInfo: any;
    checkInSlipData?: CheckInSlipData | null;
    onClose: () => void;
    loading: boolean;
}

export function CreateQuotationModal({
    form,
    setForm,
    selectedCustomer,
    setSelectedCustomer,
    activeServiceCenterId,
    setActiveCustomerId,
    customerSearchQuery,
    setCustomerSearchQuery,
    customerSearchResults,
    clearCustomerSearch,
    insurers,
    noteTemplates,
    totals,
    addItem,
    removeItem,
    updateItem,
    handleNoteTemplateChange,
    handleSubmit,
    handleCreateAndSendToCustomer,
    handleGenerateAndSendCheckInSlip,
    handleSendCheckInSlipToCustomer,
    checkInSlipFormData,
    setCheckInSlipFormData,
    userInfo,
    checkInSlipData,
    onClose,
    loading,
}: CreateQuotationModalProps) {
    // Get appointment data directly from localStorage as fallback
    const appointmentDataFromStorage = typeof window !== "undefined"
        ? safeStorage.getItem<any>("pendingQuotationFromAppointment", null)?.appointmentData
        : null;

    // Get selected vehicle
    const selectedVehicle = selectedCustomer?.vehicles?.find(
        (v: Vehicle) => String(v.id) === form.vehicleId
    ) || selectedCustomer?.vehicles?.[0] || null;

    // Get insurance data from form, vehicle, or appointment data (priority: form > vehicle > appointment)
    const insuranceCompanyName =
        form.insuranceCompanyName ||
        selectedVehicle?.insuranceCompanyName ||
        appointmentDataFromStorage?.insuranceCompanyName ||
        "";
    const insuranceStartDate =
        form.insuranceStartDate ||
        selectedVehicle?.insuranceStartDate ||
        appointmentDataFromStorage?.insuranceStartDate ||
        "";
    const insuranceEndDate =
        form.insuranceEndDate ||
        selectedVehicle?.insuranceEndDate ||
        appointmentDataFromStorage?.insuranceEndDate ||
        "";
    const hasInsuranceData = !!(insuranceCompanyName || insuranceStartDate || insuranceEndDate);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-[101]">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {form.documentType === "Check-in Slip" ? "Create Check-in Slip" : "Create Quotation"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Document Type & Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                            <select
                                value={form.documentType}
                                onChange={(e) => setForm({ ...form, documentType: e.target.value as any })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="Quotation">Quotation</option>
                                <option value="Proforma Invoice">Proforma Invoice</option>
                                <option value="Check-in Slip">Check-in Slip</option>
                            </select>
                        </div>
                        {form.documentType !== "Check-in Slip" && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quotation Date</label>
                                    <input
                                        type="date"
                                        value={form.quotationDate}
                                        onChange={(e) => setForm({ ...form, quotationDate: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until (Days)</label>
                                    <select
                                        value={form.validUntilDays}
                                        onChange={(e) => setForm({ ...form, validUntilDays: Number(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value={15}>15 days</option>
                                        <option value={30}>30 days</option>
                                        <option value={60}>60 days</option>
                                        <option value={90}>90 days</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Customer Selection - Available for both Quotations and Check-in Slips */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search customer by name, phone, or vehicle number..."
                                value={customerSearchQuery}
                                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            {customerSearchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {customerSearchResults.map((customer: CustomerWithVehicles) => (
                                        <div
                                            key={customer.id}
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                const firstVehicle = customer.vehicles?.[0];
                                                const vehicleId = firstVehicle?.id?.toString() || "";

                                                // Auto-populate insurance data from first vehicle if available
                                                setForm({
                                                    ...form,
                                                    customerId: customer.id.toString(),
                                                    vehicleId: vehicleId,
                                                    insuranceCompanyName: firstVehicle?.insuranceCompanyName || form.insuranceCompanyName || "",
                                                    insuranceStartDate: firstVehicle?.insuranceStartDate || form.insuranceStartDate || "",
                                                    insuranceEndDate: firstVehicle?.insuranceEndDate || form.insuranceEndDate || "",
                                                    hasInsurance: !!(firstVehicle?.insuranceCompanyName || firstVehicle?.insuranceStartDate || firstVehicle?.insuranceEndDate || form.hasInsurance),
                                                });
                                                setActiveCustomerId(customer.id.toString());
                                                setCustomerSearchQuery("");
                                                clearCustomerSearch();
                                            }}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="font-medium">{customer.name}</div>
                                            <div className="text-sm text-gray-500">{customer.phone}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {selectedCustomer && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <div className="font-medium">{selectedCustomer.name}</div>
                                <div className="text-sm text-gray-600">{selectedCustomer.phone}</div>
                            </div>
                        )}
                    </div>

                    {/* Vehicle Selection - Available for both Quotations and Check-in Slips */}
                    {selectedCustomer && selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
                            <select
                                value={form.vehicleId}
                                onChange={(e) => {
                                    const vehicleId = e.target.value;
                                    const vehicle = selectedCustomer.vehicles?.find((v: any) => String(v.id) === vehicleId);

                                    // Auto-populate insurance data from selected vehicle
                                    setForm({
                                        ...form,
                                        vehicleId: vehicleId,
                                        insuranceCompanyName: vehicle?.insuranceCompanyName || form.insuranceCompanyName || "",
                                        insuranceStartDate: vehicle?.insuranceStartDate || form.insuranceStartDate || "",
                                        insuranceEndDate: vehicle?.insuranceEndDate || form.insuranceEndDate || "",
                                        hasInsurance: !!(vehicle?.insuranceCompanyName || vehicle?.insuranceStartDate || vehicle?.insuranceEndDate || form.hasInsurance),
                                    });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">Select Vehicle</option>
                                {selectedCustomer.vehicles.map((vehicle: any) => (
                                    <option key={vehicle.id} value={vehicle.id.toString()}>
                                        {vehicle.vehicleMake} {vehicle.vehicleModel} - {vehicle.registration}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Check-in Slip Form */}
                    {form.documentType === "Check-in Slip" ? (
                        <CheckInSlipForm
                            formData={checkInSlipFormData}
                            onUpdate={(updates) => setCheckInSlipFormData((prev: CheckInSlipFormData) => ({ ...prev, ...updates }))}
                            customer={selectedCustomer}
                            vehicle={selectedCustomer?.vehicles?.find((v: Vehicle) => String(v.id) === form.vehicleId) || selectedCustomer?.vehicles?.[0] || null}
                            appointmentData={safeStorage.getItem<any>("pendingQuotationFromAppointment", null)?.appointmentData}
                            defaultServiceAdvisor={userInfo?.name}
                        />
                    ) : (
                        <>

                            {/* Insurance Details - Show pre-filled from appointment form */}
                            {hasInsuranceData && (
                                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <span>Insurance Details</span>
                                        <span className="text-xs font-normal text-gray-500">(from appointment)</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {insuranceCompanyName && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Company Name</label>
                                                <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-medium">
                                                    {insuranceCompanyName}
                                                </div>
                                                {!form.insurerId && (
                                                    <div className="mt-2">
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Select Matching Insurer (Optional)</label>
                                                        <select
                                                            value={form.insurerId || ""}
                                                            onChange={(e) => setForm({ ...form, insurerId: e.target.value })}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                                                        >
                                                            <option value="">Select Insurer</option>
                                                            {insurers.map((insurer: Insurer) => (
                                                                <option key={insurer.id} value={insurer.id}>
                                                                    {insurer.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                {form.insurerId && (
                                                    <div className="mt-2">
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Matched Insurer</label>
                                                        <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
                                                            {insurers.find((i: Insurer) => i.id === form.insurerId)?.name || "Selected Insurer"}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {insuranceStartDate && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Start Date</label>
                                                <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900">
                                                    {new Date(insuranceStartDate).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "long",
                                                        year: "numeric",
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {insuranceEndDate && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance End Date</label>
                                                <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900">
                                                    {new Date(insuranceEndDate).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "long",
                                                        year: "numeric",
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Parts & Services Table */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">Parts & Services</label>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        + Add Item
                                    </button>
                                </div>
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Name *</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">HSN/SAC</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">GST %</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {form.items.map((item: QuotationItem, index: number) => (
                                                <tr key={index}>
                                                    <td className="px-3 py-2">{item.serialNumber}</td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.partName}
                                                            onChange={(e) => updateItem(index, "partName", e.target.value)}
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.partNumber}
                                                            onChange={(e) => updateItem(index, "partNumber", e.target.value)}
                                                            placeholder="MCU-"
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.hsnSacCode}
                                                            onChange={(e) => updateItem(index, "hsnSacCode", e.target.value)}
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                                            min="1"
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            value={item.rate}
                                                            onChange={(e) => updateItem(index, "rate", Number(e.target.value))}
                                                            min="0"
                                                            step="0.01"
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            value={item.gstPercent}
                                                            onChange={(e) => updateItem(index, "gstPercent", Number(e.target.value))}
                                                            min="0"
                                                            max="100"
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <span className="text-sm">₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pricing Summary */}
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Subtotal:</span>
                                        <span className="font-medium">₹{totals.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Discount ({totals.discountPercent.toFixed(1)}%):</span>
                                        <span className="font-medium">-₹{totals.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Pre-GST Amount:</span>
                                        <span className="font-medium">₹{totals.preGstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">CGST (9%):</span>
                                        <span className="font-medium">₹{totals.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">SGST (9%):</span>
                                        <span className="font-medium">₹{totals.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">IGST (18%):</span>
                                        <span className="font-medium">₹{totals.igst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                                        <span className="text-lg font-bold text-blue-600">₹{totals.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount (₹)</label>
                                    <input
                                        type="number"
                                        value={form.discount}
                                        onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                                        min="0"
                                        step="0.01"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Note Template</label>
                                        <select
                                            value={form.noteTemplateId}
                                            onChange={(e) => handleNoteTemplateChange(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        >
                                            <option value="">Select Template</option>
                                            {noteTemplates.map((template: NoteTemplate) => (
                                                <option key={template.id} value={template.id}>
                                                    {template.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Battery Serial Number</label>
                                        <input
                                            type="text"
                                            value={form.batterySerialNumber}
                                            onChange={(e) => setForm({ ...form, batterySerialNumber: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                        <textarea
                                            value={form.notes}
                                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                            rows={4}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="Enter notes or select a template above"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Notes</label>
                                        <textarea
                                            value={form.customNotes}
                                            onChange={(e) => setForm({ ...form, customNotes: e.target.value })}
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="Additional custom notes"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        {form.documentType === "Check-in Slip" && checkInSlipData && (
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleSendCheckInSlipToCustomer}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                <MessageCircle size={18} />
                                {loading ? "Sending..." : "Send to Customer via WhatsApp"}
                            </button>
                        )}
                        {form.documentType === "Check-in Slip" && selectedCustomer && handleGenerateAndSendCheckInSlip && (
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleGenerateAndSendCheckInSlip}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                            >
                                {loading ? "Sending..." : "Generate & Send to Customer"}
                            </button>
                        )}
                        {form.documentType !== "Check-in Slip" && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Pass to manager logic
                                        alert("Pass to manager functionality will be implemented");
                                    }}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                                >
                                    Pass to Manager
                                </button>
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={handleCreateAndSendToCustomer}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                                >
                                    {loading ? "Sending..." : "Create & Send to Customer"}
                                </button>
                            </>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                        >
                            {loading
                                ? (form.documentType === "Check-in Slip" ? "Generating..." : "Creating...")
                                : (form.documentType === "Check-in Slip" ? "Generate Check-in Slip" : "Create Quotation")
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
