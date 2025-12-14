"use client";
import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PlusCircle, Trash2, FileText, Calendar, Building2 } from "lucide-react";
import { partsEntryService, type PartsEntry } from "@/features/inventory/services/partsEntry.service";
import { partsMasterService } from "@/features/inventory/services/partsMaster.service";
import type { Part } from "@/shared/types/inventory.types";
import { initializeInventoryMockData } from "@/__mocks__/data/inventory.mock";
import { PartsEntryForm } from "./PartsEntryForm";
import { getInitialFormData, getInitialItemFormData, type PartsEntryFormData, type PartsEntryItemFormData } from "./form.schema";

interface PartsEntryItem {
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
}

export default function PartsEntryPage() {
  const [formData, setFormData] = useState<PartsEntryFormData>(getInitialFormData());
  const [parts, setParts] = useState<PartsEntryItem[]>([]);
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [recentEntries, setRecentEntries] = useState<PartsEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentPart, setCurrentPart] = useState<PartsEntryItemFormData>(getInitialItemFormData());

  useEffect(() => {
    initializeInventoryMockData();
    fetchAvailableParts();
    fetchRecentEntries();
  }, []);

  const fetchAvailableParts = async () => {
    try {
      const data = await partsMasterService.getAll();
      setAvailableParts(data);
    } catch (error) {
      console.error("Failed to fetch parts:", error);
    }
  };

  const fetchRecentEntries = async () => {
    try {
      const entries = await partsEntryService.getRecent(10);
      setRecentEntries(entries);
    } catch (error) {
      console.error("Failed to fetch recent entries:", error);
    }
  };

  const handlePartSelect = (partId: string) => {
    const part = availableParts.find((p) => p.id === partId);
    if (part) {
      setCurrentPart({
        partId: part.id,
        partName: part.partName,
        quantity: "",
        unitPrice: part.price.toString(),
      });
    } else {
      setCurrentPart(getInitialItemFormData());
    }
  };

  const addPart = () => {
    if (!currentPart.partId || !currentPart.partName || !currentPart.quantity || !currentPart.unitPrice) {
      alert("Please fill all fields");
      return;
    }

    // Check if part already added
    if (parts.find((p) => p.partId === currentPart.partId)) {
      alert("This part is already added to the entry");
      return;
    }

    setParts([
      ...parts,
      {
        partId: currentPart.partId,
        partName: currentPart.partName,
        quantity: parseInt(currentPart.quantity),
        unitPrice: parseFloat(currentPart.unitPrice),
      },
    ]);

    setCurrentPart(getInitialItemFormData());
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const totalAmount = parts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);

  const handleSubmit = async () => {
    if (!formData.invoiceNumber || !formData.vendor || parts.length === 0) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await partsEntryService.create(
        formData.invoiceNumber,
        formData.vendor,
        formData.entryDate,
        parts,
        "Inventory Manager"
      );
      
      alert("Parts entry saved successfully! Stock has been updated.");
      setFormData(getInitialFormData());
      setParts([]);
      setCurrentPart(getInitialItemFormData());
      fetchRecentEntries();
      fetchAvailableParts(); // Refresh to show updated stock
    } catch (error) {
      console.error("Failed to save parts entry:", error);
      alert("Failed to save parts entry. Please try again.");
    }
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-24 px-8 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Parts Entry</h1>
          <p className="text-gray-500 mt-1">Record incoming parts stock</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Entry Details</h2>
              </CardHeader>
              <CardBody>
                <PartsEntryForm formData={formData} onFormChange={setFormData} />
              </CardBody>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <h2 className="text-lg font-semibold">Add Parts</h2>
              </CardHeader>
              <CardBody>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Part</label>
                  <select
                    value={currentPart.partId}
                    onChange={(e) => handlePartSelect(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg mb-3"
                  >
                    <option value="">Select a part...</option>
                    {availableParts.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.partName} ({part.partId}) - Current Stock: {part.stockQuantity} {part.unit}
                      </option>
                    ))}
                  </select>
                </div>

                {currentPart.partId && (
                  <div className="p-3 bg-indigo-50 rounded-lg mb-4">
                    <p className="text-sm font-medium text-gray-900">{currentPart.partName}</p>
                    <p className="text-xs text-gray-600">Price: ₹{currentPart.unitPrice}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Input
                    type="number"
                    value={currentPart.quantity}
                    onChange={(e) => setCurrentPart({ ...currentPart, quantity: e.target.value })}
                    placeholder="Quantity *"
                    min="1"
                    disabled={!currentPart.partId}
                  />
                  <Input
                    type="number"
                    value={currentPart.unitPrice}
                    onChange={(e) => setCurrentPart({ ...currentPart, unitPrice: e.target.value })}
                    placeholder="Unit Price *"
                    min="0"
                    step="0.01"
                  />
                  <Button 
                    onClick={addPart} 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={!currentPart.partId || !currentPart.quantity || !currentPart.unitPrice}
                  >
                    <PlusCircle size={18} className="mr-2" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {parts.map((part, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{part.partName}</p>
                        <p className="text-sm text-gray-600">
                          ID: {part.partId} | Qty: {part.quantity} | Price: ₹{part.unitPrice} | Total: ₹{part.quantity * part.unitPrice}
                        </p>
                      </div>
                      <button
                        onClick={() => removePart(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Summary</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Total Parts</p>
                    <p className="text-2xl font-bold text-gray-900">{parts.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-indigo-600">₹{totalAmount.toLocaleString()}</p>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-6"
                    disabled={parts.length === 0}
                  >
                    Save Entry
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Recent Entries */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Recent Entries</h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-sm"
                  >
                    {showHistory ? "Hide" : "Show"} History
                  </Button>
                </div>
              </CardHeader>
              {showHistory && (
                <CardBody>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentEntries.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No recent entries</p>
                    ) : (
                      recentEntries.map((entry) => (
                        <div key={entry.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <FileText size={16} className="text-indigo-600" />
                                <span className="font-semibold text-gray-900">Invoice: {entry.invoiceNumber}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Building2 size={14} />
                                  <span>{entry.vendor}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  <span>{new Date(entry.entryDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="success">₹{entry.totalAmount.toLocaleString()}</Badge>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs font-medium text-gray-700 mb-1">Parts ({entry.parts.length}):</p>
                            <div className="flex flex-wrap gap-2">
                              {entry.parts.map((part, idx) => (
                                <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                                  {part.partName} (Qty: {part.quantity})
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardBody>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

