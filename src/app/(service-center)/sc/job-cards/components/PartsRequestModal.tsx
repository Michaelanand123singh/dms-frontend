import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { X, Package, PlusCircle, Loader2 } from 'lucide-react';
import { JobCard } from '@/shared/types';
import { JobCardPart2Item } from '@/shared/types/job-card.types';
import { partsMasterService } from '@/features/inventory/services/partsMaster.service';

interface PartsRequestModalProps {
    open: boolean;
    onClose: () => void;
    selectedJobCard: JobCard | null;
    activeRequest: any;
    loading: boolean;
    onSubmit: (jobId: string, items: JobCardPart2Item[]) => Promise<void>;
    onNotifyWorkCompletion: (jobId: string) => void;
    isClient: boolean;
}

const PartsRequestModal: React.FC<PartsRequestModalProps> = ({
    open,
    onClose,
    selectedJobCard,
    activeRequest,
    loading: externalLoading,
    onSubmit,
    onNotifyWorkCompletion,
    isClient,
}) => {
    const [part2ItemsList, setPart2ItemsList] = useState<JobCardPart2Item[]>([]);
    const [newItemForm, setNewItemForm] = useState({
        partWarrantyTag: "",
        partName: "",
        partCode: "",
        qty: 1,
        amount: 0,
        technician: "",
        itemType: "part" as "part" | "work_item",
        labourCode: "Auto Select With Part",
        serialNumber: "",
        isWarranty: false,
    });
    const [partSearchResults, setPartSearchResults] = useState<any[]>([]);
    const [showPartDropdown, setShowPartDropdown] = useState(false);
    const partSearchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (partSearchRef.current && !partSearchRef.current.contains(event.target as Node)) {
                setShowPartDropdown(false);
            }
        };

        if (showPartDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPartDropdown]);

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (newItemForm.partName.trim().length >= 2) {
                try {
                    const results = await partsMasterService.searchParts(newItemForm.partName);
                    setPartSearchResults(results);
                    setShowPartDropdown(results.length > 0);
                } catch (error) {
                    console.error("Search error:", error);
                }
            } else {
                setPartSearchResults([]);
                setShowPartDropdown(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [newItemForm.partName]);

    const handlePartSelect = (part: any) => {
        let partCode = part.partId || part.partNumber || "";
        if (!partCode && part.partName) {
            const codeMatch = part.partName.match(/^([A-Z0-9_-]+)/i);
            if (codeMatch) {
                partCode = codeMatch[1];
            }
        }

        let warrantyTag = part.partId || (partCode ? `RQL${partCode.replace(/[^0-9]/g, "").slice(-12)}` : `RQL${Date.now().toString().slice(-12)}`);

        setNewItemForm({
            ...newItemForm,
            partWarrantyTag: warrantyTag,
            partName: part.partName || "",
            partCode: partCode,
            amount: part.price || 0,
        });
        setShowPartDropdown(false);
        setPartSearchResults([]);
    };

    const handleAddItem = () => {
        if (!newItemForm.partName.trim()) return;
        if (newItemForm.isWarranty && !newItemForm.serialNumber?.trim()) {
            alert("Please enter the part serial number for warranty parts.");
            return;
        }

        const newItem: JobCardPart2Item = {
            srNo: part2ItemsList.length + 1,
            partWarrantyTag: newItemForm.partWarrantyTag,
            partName: newItemForm.partName,
            partCode: newItemForm.partCode || (newItemForm.partName.match(/^([A-Z0-9_-]+)/i)?.[1] || ""),
            qty: newItemForm.qty || 1,
            amount: newItemForm.amount || 0,
            technician: newItemForm.technician,
            labourCode: newItemForm.itemType === "work_item" ? (newItemForm.labourCode || "R & R") : "Auto Select With Part",
            itemType: newItemForm.itemType,
            serialNumber: newItemForm.isWarranty ? newItemForm.serialNumber : undefined,
            isWarranty: newItemForm.isWarranty,
        };

        setPart2ItemsList([...part2ItemsList, newItem]);
        setNewItemForm({
            partWarrantyTag: "",
            partName: "",
            partCode: "",
            qty: 1,
            amount: 0,
            technician: "",
            itemType: "part",
            labourCode: "Auto Select With Part",
            serialNumber: "",
            isWarranty: false,
        });
    };

    const handleRemoveItem = (index: number) => {
        const updated = part2ItemsList.filter((_, i) => i !== index).map((item, i) => ({ ...item, srNo: i + 1 }));
        setPart2ItemsList(updated);
    };

    if (!open || !selectedJobCard) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 z-[10000] relative">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Parts Request</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Job Card Information */}
                <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Job Card Information</label>
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <p><span className="font-medium text-gray-700">Job Card:</span> <span className="text-gray-900">{selectedJobCard.jobCardNumber || selectedJobCard.id}</span></p>
                        <p><span className="font-medium text-gray-700">Customer:</span> <span className="text-gray-900">{selectedJobCard.customerName}</span></p>
                        <p><span className="font-medium text-gray-700">Vehicle:</span> <span className="text-gray-900">{selectedJobCard.vehicle} ({selectedJobCard.registration})</span></p>
                    </div>
                </div>

                {/* Add Item Form */}
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4">Add Item to Request</h3>
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="relative" ref={partSearchRef}>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Part Name *</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newItemForm.partName}
                                        onChange={(e) => setNewItemForm({ ...newItemForm, partName: e.target.value })}
                                        onFocus={() => {
                                            if (newItemForm.partName.trim().length > 0 && partSearchResults.length > 0) {
                                                setShowPartDropdown(true);
                                            }
                                        }}
                                        placeholder="Type to search parts..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {showPartDropdown && partSearchResults.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {partSearchResults.map((part, index) => (
                                                <div
                                                    key={part.id || index}
                                                    onClick={() => handlePartSelect(part)}
                                                    className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-indigo-50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 truncate">{part.partName}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {part.partNumber && <span className="text-xs text-gray-600 font-mono">{part.partNumber}</span>}
                                                                {part.price && <span className="text-xs text-green-600 font-medium">₹{part.price.toLocaleString("en-IN")}</span>}
                                                            </div>
                                                        </div>
                                                        <Package size={16} className="text-indigo-600 shrink-0 ml-2" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Part Code</label>
                                <input
                                    type="text"
                                    value={newItemForm.partCode}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, partCode: e.target.value })}
                                    placeholder="e.g., 2W0000000027_011"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Part Warranty Tag</label>
                                <input
                                    type="text"
                                    value={newItemForm.partWarrantyTag}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, partWarrantyTag: e.target.value })}
                                    placeholder="e.g., RQL251113259818"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            {newItemForm.itemType === "part" && (
                                <>
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                                            <input
                                                type="checkbox"
                                                checked={newItemForm.isWarranty}
                                                onChange={(e) => setNewItemForm({ ...newItemForm, isWarranty: e.target.checked })}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <span>Warranty Part</span>
                                        </label>
                                    </div>
                                    {newItemForm.isWarranty && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Part Serial Number *</label>
                                            <input
                                                type="text"
                                                value={newItemForm.serialNumber}
                                                onChange={(e) => setNewItemForm({ ...newItemForm, serialNumber: e.target.value })}
                                                placeholder="Enter part serial number"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                required
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Item Type *</label>
                                <select
                                    value={newItemForm.itemType}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, itemType: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="part">Part</option>
                                    <option value="work_item">Work Item</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Qty *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newItemForm.qty}
                                        onChange={(e) => setNewItemForm({ ...newItemForm, qty: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                                    <input
                                        type="number"
                                        value={newItemForm.amount}
                                        onChange={(e) => setNewItemForm({ ...newItemForm, amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                        >
                            <PlusCircle size={16} className="inline mr-2" />
                            Add to List
                        </button>
                    </div>
                </div>

                {/* Items List Table */}
                {part2ItemsList.length > 0 && (
                    <div className="mb-6">
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">Items Added ({part2ItemsList.length})</label>
                        <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-indigo-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">SR NO</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">PART NAME</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">QTY</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">AMOUNT</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {part2ItemsList.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-3 py-2">{item.srNo}</td>
                                            <td className="px-3 py-2">{item.partName}</td>
                                            <td className="px-3 py-2">{item.qty}</td>
                                            <td className="px-3 py-2">₹{item.amount.toLocaleString("en-IN")}</td>
                                            <td className="px-3 py-2">
                                                <button onClick={() => handleRemoveItem(index)} className="text-red-600 hover:text-red-700 p-1">
                                                    <X size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => onSubmit(selectedJobCard.id, part2ItemsList)}
                        disabled={externalLoading || part2ItemsList.length === 0}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition disabled:opacity-50"
                    >
                        {externalLoading ? "Submitting..." : `Submit Parts Request (${part2ItemsList.length} items)`}
                    </button>
                </div>

                {activeRequest && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Parts Request Status</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-700 min-w-[120px]">SC Manager:</span>
                                <span className={`px-3 py-1.5 rounded text-xs font-semibold ${activeRequest.scManagerApproved ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                    {activeRequest.scManagerApproved ? "✓ Approved" : "Pending"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-700 min-w-[120px]">Inventory Manager:</span>
                                <span className={`px-3 py-1.5 rounded text-xs font-semibold ${activeRequest.inventoryManagerAssigned ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}`}>
                                    {activeRequest.inventoryManagerAssigned ? "✓ Parts Assigned" : "Pending"}
                                </span>
                            </div>
                            {activeRequest.inventoryManagerAssigned && (
                                <button
                                    type="button"
                                    onClick={() => onNotifyWorkCompletion(selectedJobCard.id)}
                                    className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                                >
                                    Notify Work Completion
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartsRequestModal;
