"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Package,
  PlusCircle,
  X,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Car,
  User,
  Calendar,
  Loader2,
} from "lucide-react";
import { useRole } from "@/shared/hooks";
import { partsIssueService } from "@/features/inventory/services/parts-issue.service";
import { jobCardService } from "@/features/job-cards/services/jobCard.service";
import { partsMasterService } from "@/features/inventory/services/partsMaster.service";
import type { JobCard, JobCardPart2Item } from "@/shared/types/job-card.types";
import type { JobCardPartsRequest } from "@/shared/types/jobcard-inventory.types";
import {
  filterByServiceCenter,
  getServiceCenterContext,
} from "@/shared/lib/serviceCenter";
import { serviceEngineerJobCards } from "@/__mocks__/data/job-cards.mock";

export default function PartsRequest() {
  const { userRole, userInfo, isLoading: isRoleLoading } = useRole();
  const isTechnician = userRole === "service_engineer";
  const [isClient, setIsClient] = useState(false);

  // Job cards state
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loadingJobCards, setLoadingJobCards] = useState(false); // Added loading state
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Parts request state
  const [partsRequestsData, setPartsRequestsData] = useState<Record<string, any>>({});
  const [part2ItemsList, setPart2ItemsList] = useState<JobCardPart2Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Parts search state
  const [allParts, setAllParts] = useState<any[]>([]);
  const [partSearchResults, setPartSearchResults] = useState<any[]>([]);
  const [showPartDropdown, setShowPartDropdown] = useState<boolean>(false);
  const partSearchRef = useRef<HTMLDivElement>(null);

  // Form state
  const [newItemForm, setNewItemForm] = useState<{
    partWarrantyTag: string;
    partName: string;
    partCode: string;
    qty: number;
    amount: number;
    technician: string;
    itemType: "part" | "work_item";
    labourCode: string;
    serialNumber: string;
    isWarranty: boolean;
  }>({
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

  const serviceCenterContext = useMemo(() => getServiceCenterContext(), []);

  // Initialize client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load job cards
  useEffect(() => {
    if (!isClient || !isTechnician) return;

    const loadJobCards = async () => {
      try {
        setLoadingJobCards(true);
        const fetchedJobCards = await jobCardService.getAll();
        setJobCards(fetchedJobCards);
      } catch (error) {
        console.error("Failed to load job cards:", error);
      } finally {
        setLoadingJobCards(false);
      }
    };

    loadJobCards();
  }, [isClient, isTechnician]);

  // Filter visible job cards for service engineer (Using fetched job cards)
  const visibleJobCards = useMemo(() => {
    let filtered = filterByServiceCenter(jobCards, serviceCenterContext);

    // Note: Backend might already filter if proper params send, but safe to filter here too
    if (isTechnician) {
      // Optional: Filter by assigned engineer if needed, but for now showing all accessible
    }

    return filtered;
  }, [jobCards, serviceCenterContext, isTechnician]);

  // Active job cards (Assigned, In Progress, Parts Pending)
  const activeJobCards = useMemo(() => {
    return visibleJobCards.filter(
      (job) =>
        job.status === "ASSIGNED" ||
        job.status === "IN_PROGRESS" ||
        job.status === "PARTS_PENDING"
    );
  }, [visibleJobCards]);

  // Filtered active job cards based on search
  const filteredActiveJobCards = useMemo(() => {
    if (!searchQuery.trim()) return activeJobCards;

    const query = searchQuery.toLowerCase();
    return activeJobCards.filter(
      (job) =>
        job.jobCardNumber?.toLowerCase().includes(query) ||
        job.customerName?.toLowerCase().includes(query) ||
        job.vehicle?.toLowerCase().includes(query) ||
        job.registration?.toLowerCase().includes(query) ||
        job.serviceType?.toLowerCase().includes(query)
    );
  }, [activeJobCards, searchQuery]);

  // Load parts requests
  useEffect(() => {
    if (!isClient || !isTechnician) return;

    const loadPartsRequests = async () => {
      try {
        const allRequests = await partsIssueService.getAll();
        const requestsMap: Record<string, any> = {};

        allRequests.forEach((request) => {
          if (request.jobCardId) requestsMap[request.jobCardId] = request;
        });

        setPartsRequestsData(requestsMap);
      } catch (error) {
        console.error("Failed to load parts requests:", error);
      }
    };

    loadPartsRequests();
  }, [isClient, isTechnician]);

  // Load parts when job card is selected
  useEffect(() => {
    if (selectedJobCard) {
      const loadParts = async () => {
        try {
          const parts = await partsMasterService.getAll();
          setAllParts(parts);
        } catch (error) {
          console.error("Failed to load parts:", error);
        }
      };
      loadParts();
    }
  }, [selectedJobCard]);

  // Search parts as user types
  useEffect(() => {
    if (newItemForm.partName.trim().length > 0) {
      const query = newItemForm.partName.toLowerCase();
      const filtered = allParts.filter(
        (part) =>
          part.partName?.toLowerCase().includes(query) ||
          part.partNumber?.toLowerCase().includes(query) ||
          part.partId?.toLowerCase().includes(query)
      );
      setPartSearchResults(filtered.slice(0, 10));
      setShowPartDropdown(true);
    } else {
      setPartSearchResults([]);
      setShowPartDropdown(false);
    }
  }, [newItemForm.partName, allParts]);

  // Handle outside click to close dropdown
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

  const handlePartSelect = (part: any) => {
    let partCode = part.partId || part.partNumber || "";
    if (!partCode && part.partName) {
      const codeMatch = part.partName.match(/^([A-Z0-9_-]+)/i);
      if (codeMatch) {
        partCode = codeMatch[1];
      }
    }

    let warrantyTag = "";
    if (part.partId) {
      warrantyTag = part.partId;
    } else if (partCode) {
      warrantyTag = `RQL${partCode.replace(/[^0-9]/g, "").slice(-12)}` || partCode;
    } else {
      warrantyTag = `RQL${Date.now().toString().slice(-12)}`;
    }

    setNewItemForm({
      partWarrantyTag: warrantyTag,
      partName: part.partName || "",
      partCode: partCode,
      qty: 1,
      amount: part.price || 0,
      technician: "",
      itemType: "part",
      labourCode: "Auto Select With Part",
      serialNumber: "",
      isWarranty: false,
    });
    setShowPartDropdown(false);
    setPartSearchResults([]);
  };

  const handleAddItem = () => {
    if (!newItemForm.partName.trim()) {
      alert("Please enter a part name.");
      return;
    }

    if (newItemForm.isWarranty && !newItemForm.serialNumber?.trim()) {
      alert("Please enter the part serial number for warranty parts.");
      return;
    }


    const newItem: JobCardPart2Item = {
      srNo: part2ItemsList.length + 1,
      partWarrantyTag: newItemForm.isWarranty, // Boolean: is this part under warranty?
      partName: newItemForm.partName,
      partCode: newItemForm.partCode || (newItemForm.partName.match(/^([A-Z0-9_-]+)/i)?.[1] || ""),
      qty: newItemForm.qty || 1,
      amount: newItemForm.amount || 0,
      technician: newItemForm.technician,
      labourCode: newItemForm.itemType === "work_item"
        ? (newItemForm.labourCode || "R & R")
        : "Auto Select With Part",
      itemType: newItemForm.itemType,
      serialNumber: newItemForm.isWarranty ? newItemForm.serialNumber : undefined,
      isWarranty: newItemForm.isWarranty,
    };

    setPart2ItemsList([...part2ItemsList, newItem]);

    // Reset form
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

  // Handle item removal from list
  const handleRemoveItem = (index: number) => {
    const updated = part2ItemsList.filter((_, i) => i !== index);
    const renumbered = updated.map((item, i) => ({ ...item, srNo: i + 1 }));
    setPart2ItemsList(renumbered);
  };

  const handlePartRequestSubmit = async () => {
    if (!selectedJobCard) {
      alert("Please select a job card first.");
      return;
    }

    if (part2ItemsList.length === 0) {
      alert("Please add at least one item to the list before submitting.");
      return;
    }

    try {
      setLoading(true);

      const items = part2ItemsList.map((item) => ({
        partId: item.partCode || item.partName, // Using code or name as ID if ID missing
        quantity: item.qty,
        isWarranty: item.isWarranty || false,
        serialNumber: item.isWarranty && item.serialNumber ? item.serialNumber : undefined,
      }));

      await partsIssueService.create({
        jobCardId: selectedJobCard.id,
        items,
        notes: "Requested by technician " + (userInfo?.name || ""),
      });

      // Refresh requests data
      const allRequests = await partsIssueService.getAll();
      const requestsMap: Record<string, any> = {};
      allRequests.forEach(req => {
        requestsMap[req.jobCardId] = req;
      });
      setPartsRequestsData(requestsMap);

      // Reset form
      setPart2ItemsList([]);
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
      setShowPartDropdown(false);
      setPartSearchResults([]);

      alert(`Part request submitted successfully for Job Card: ${selectedJobCard.jobCardNumber || selectedJobCard.id}`);
    } catch (error) {
      console.error("Failed to submit parts request:", error);
      alert("Failed to submit parts request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJobCard = (jobCard: JobCard) => {
    setSelectedJobCard(jobCard);
    setPart2ItemsList([]);
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

  const getRequestStatus = (jobCard: JobCard) => {
    const request = partsRequestsData[jobCard.id] || partsRequestsData[jobCard.jobCardNumber || ""];
    if (!request) return null;
    return request;
  };

  // Show loading state
  if (!isClient || isRoleLoading || !isTechnician) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Parts Request</h1>
            <p className="text-gray-500">Request parts for your active job cards</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Active Job Cards */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Active Job Cards</h2>

                {/* Search */}
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search job cards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>

                {/* Job Cards List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredActiveJobCards.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package size={48} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No active job cards found</p>
                    </div>
                  ) : (
                    filteredActiveJobCards.map((job) => {
                      const request = getRequestStatus(job);
                      const isSelected = selectedJobCard?.id === job.id;

                      return (
                        <div
                          key={job.id}
                          onClick={() => handleSelectJobCard(job)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm">
                                {job.jobCardNumber || job.id}
                              </h3>
                              <p className="text-xs text-gray-600 mt-1">{job.customerName}</p>
                            </div>
                            {request && (
                              <div className="ml-2">
                                {request.status === "approved" ? (
                                  <CheckCircle size={20} className="text-green-500" />
                                ) : (
                                  <Clock size={20} className="text-yellow-500" />
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                            <Car size={14} />
                            <span>{job.vehicle} ({job.registration})</span>
                          </div>

                          <div className="mt-2 flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${job.status === "ASSIGNED"
                              ? "bg-blue-100 text-blue-700"
                              : job.status === "IN_PROGRESS"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-orange-100 text-orange-700"
                              }`}>
                              {job.status}
                            </span>
                            {request && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${request.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                                }`}>
                                {request.status === "approved" ? "Parts Approved" : "Request Pending"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Parts Request Form */}
            <div className="lg:col-span-2">
              {selectedJobCard ? (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Request Parts</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Job Card: {selectedJobCard.jobCardNumber || selectedJobCard.id}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedJobCard(null);
                        setPart2ItemsList([]);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Job Card Information */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Customer:</span>
                        <span className="ml-2 text-gray-900">{selectedJobCard.customerName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Vehicle:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedJobCard.vehicle} ({selectedJobCard.registration})
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Service Type:</span>
                        <span className="ml-2 text-gray-900">{selectedJobCard.serviceType}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2 text-gray-900">{selectedJobCard.status}</span>
                      </div>
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
                                          {part.partNumber && (
                                            <span className="text-xs text-gray-600 font-mono">{part.partNumber}</span>
                                          )}
                                          {part.price && (
                                            <span className="text-xs text-green-600 font-medium">
                                              ₹{part.price.toLocaleString("en-IN")}
                                            </span>
                                          )}
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
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Part Serial Number *
                                </label>
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
                            onChange={(e) => {
                              const itemType = e.target.value as "part" | "work_item";
                              setNewItemForm({
                                ...newItemForm,
                                itemType,
                                labourCode: itemType === "work_item" ? "R & R" : "Auto Select With Part",
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="part">Part</option>
                            <option value="work_item">Work Item</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                          <input
                            type="number"
                            min="1"
                            value={newItemForm.qty}
                            onChange={(e) => setNewItemForm({ ...newItemForm, qty: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Amount (₹)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newItemForm.amount}
                            onChange={(e) => setNewItemForm({ ...newItemForm, amount: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        {newItemForm.itemType === "work_item" && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Labour Code</label>
                            <input
                              type="text"
                              value={newItemForm.labourCode}
                              onChange={(e) => setNewItemForm({ ...newItemForm, labourCode: e.target.value })}
                              placeholder="e.g., R & R"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        )}
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
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Items Added ({part2ItemsList.length})
                      </label>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-indigo-50 border-b border-gray-200">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">SR NO</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">PART NAME</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">PART CODE</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">QTY</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">AMOUNT</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">WARRANTY</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {part2ItemsList.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-gray-700 font-medium">{item.srNo}</td>
                                  <td className="px-3 py-2 text-gray-700">{item.partName}</td>
                                  <td className="px-3 py-2 text-gray-700 font-mono text-xs">{item.partCode || "-"}</td>
                                  <td className="px-3 py-2 text-gray-700">{item.qty}</td>
                                  <td className="px-3 py-2 text-gray-700">₹{item.amount.toLocaleString("en-IN")}</td>
                                  <td className="px-3 py-2">
                                    {item.isWarranty ? (
                                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 font-semibold">
                                        Yes
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">No</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(index)}
                                      className="text-red-600 hover:text-red-700 p-1 rounded transition"
                                      title="Remove item"
                                    >
                                      <X size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={handlePartRequestSubmit}
                      disabled={loading || part2ItemsList.length === 0}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Submitting..." : `Submit Parts Request (${part2ItemsList.length} items)`}
                    </button>
                    {part2ItemsList.length === 0 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Add at least one item to the list before submitting
                      </p>
                    )}
                  </div>

                  {/* Parts Request Status */}
                  {(() => {
                    const request = getRequestStatus(selectedJobCard);
                    if (!request) return null;

                    return (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Parts Request Status</h4>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Requested Parts:</span>{" "}
                              {request.parts && Array.isArray(request.parts)
                                ? request.parts.map((p: any) => (typeof p === 'string' ? p : p.partName || '')).join(", ")
                                : "—"}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Requested At:</span>{" "}
                              {request.requestedAt
                                ? new Date(request.requestedAt).toLocaleString()
                                : "—"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-700 min-w-[120px]">SC Manager:</span>
                            <span className={`px-3 py-1.5 rounded text-xs font-semibold ${request.scManagerApproved
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                              }`}>
                              {request.scManagerApproved ? "✓ Approved" : "Pending"}
                            </span>
                            {request.scManagerApproved && request.scManagerApprovedBy && (
                              <span className="text-xs text-gray-500">
                                by {request.scManagerApprovedBy}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-700 min-w-[120px]">Inventory Manager:</span>
                            <span className={`px-3 py-1.5 rounded text-xs font-semibold ${request.inventoryManagerAssigned
                              ? "bg-green-500 text-white"
                              : request.scManagerApproved
                                ? "bg-yellow-500 text-white"
                                : "bg-gray-400 text-white"
                              }`}>
                              {request.inventoryManagerAssigned
                                ? "✓ Parts Assigned"
                                : request.scManagerApproved
                                  ? "Pending"
                                  : "Waiting for SC Approval"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                  <Package size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Job Card</h3>
                  <p className="text-sm text-gray-500">
                    Choose an active job card from the list to request parts
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
