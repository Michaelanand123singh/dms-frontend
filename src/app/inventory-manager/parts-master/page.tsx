"use client";
import { useState, useEffect, useMemo } from "react";
import { partsMasterService } from "@/features/inventory/services/partsMaster.service";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { SearchBar } from "@/components/ui/SearchBar";
import {
  PlusCircle,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Upload,
  Download,
  CheckCircle,
  TrendingDown,
  FileSpreadsheet,
  X
} from "lucide-react";
import type { Part, PartFormData } from "@/features/inventory/types/inventory.types";
import * as XLSX from "xlsx";
import { PartsMasterForm } from "./PartsMasterForm";
import { getInitialFormData, type PartsMasterFormData } from "./form.schema";
import { mapPartToFormData, mapFormDataToPartFormData } from "./form.utils";
import { useRole } from "@/shared/hooks";

export default function PartsMasterPage() {
  const { userInfo } = useRole();
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [formData, setFormData] = useState<PartsMasterFormData>(getInitialFormData());

  // Get service center ID from user info (serviceCenter is the ID string)
  const serviceCenterId = userInfo?.serviceCenter || "";

  useEffect(() => {
    fetchParts();
  }, []);

  // Filter parts based on search and category
  useEffect(() => {
    let filtered = parts;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.partId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    setFilteredParts(filtered);
  }, [parts, searchQuery, categoryFilter]);

  const fetchParts = async () => {
    try {
      setIsLoading(true);
      const data = await partsMasterService.getAll();
      setParts(data);
      setFilteredParts(data);
    } catch (error) {
      console.error("Failed to fetch parts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Map form data to PartFormData (only includes fields with data)
      const partData = mapFormDataToPartFormData(formData);

       // Inject Service Center ID for new parts if missing (required by backend)
      if (!partData.serviceCenterId && serviceCenterId) {
        partData.serviceCenterId = serviceCenterId;
      }

      // At minimum, require partName for identification
      if (!partData.partName?.trim()) {
        alert("Please enter a Part Name to save the part.");
        return;
      }

      if (editingPart) {
        await partsMasterService.update(editingPart.id, partData);
      } else {
        await partsMasterService.create(partData);
      }
      setShowModal(false);
      setEditingPart(null);
      resetForm();
      fetchParts();
    } catch (error) {
      console.error("Failed to save part:", error);
      alert(error instanceof Error ? error.message : "Failed to save part. Please try again.");
    }
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setFormData(mapPartToFormData(part));
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this part?")) {
      try {
        await partsMasterService.delete(id);
        fetchParts();
      } catch (error) {
        console.error("Failed to delete part:", error);
        alert("Failed to delete part. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    const validExtensions = [".xlsx", ".xls", ".csv"];

    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(fileExtension) && !validTypes.includes(file.type)) {
      alert("Please upload a valid Excel file (.xlsx, .xls) or CSV file.");
      return;
    }

    setUploadFile(file);
  };

  const handleExcelUpload = async () => {
    if (!uploadFile) return;

    // Validate service center ID
    if (!serviceCenterId) {
      alert("Unable to determine your service center. Please refresh the page and try again.");
      return;
    }

    try {
      setUploadProgress({ success: 0, failed: 0, errors: [] });

      const fileData = await uploadFile.arrayBuffer();
      const workbook = XLSX.read(fileData, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet);

      // Map Excel columns to PartFormData (matching user's exact headers)
      const partsData: PartFormData[] = jsonData.map((row: any) => {
        // Try to match common column names (case-insensitive)
        const getValue = (keys: string[]) => {
          for (const key of keys) {
            const found = Object.keys(row).find(
              (k) => k.toLowerCase().trim() === key.toLowerCase().trim()
            );
            if (found && row[found] !== undefined && row[found] !== null && row[found] !== "") {
              return row[found];
            }
          }
          return "";
        };

        // Parse numeric values with proper handling of percentages
        const parseNumber = (val: any): number => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            // Remove percentage sign and parse
            const cleaned = val.replace(/[%₹,\s]/g, '').trim();
            return parseFloat(cleaned) || 0;
          }
          return 0;
        };

        // Parse boolean (YES/NO/true/false)
        const parseBoolean = (val: any): boolean => {
          if (typeof val === 'boolean') return val;
          if (typeof val === 'string') {
            return val.toLowerCase() === 'yes' || val.toLowerCase() === 'true';
          }
          return false;
        };

        // Get sale price - try multiple column names
        const salePricePreGst = parseNumber(getValue(["Sale Price Pre GST", "Sale Price Pre Gst", "sale_price_pre_gst", "Price Pre GST", "pricePreGst"]));
        const purchasePrice = parseNumber(getValue(["PURCHASE PRICE", "Purchase Price", "purchase_price", "PurchasePrice"]));
        const totalPrice = parseNumber(getValue(["TOTAL PRICE", "Total Price", "total_price", "TotalPrice"]));

        return {
          // Basic Part Information
          oemPartNumber: String(getValue(["OEM PART NUMBER", "OEM Part Number", "oem_part_number", "OemPartNumber"]) || ""),
          partName: String(getValue(["Part Name", "PartName", "part_name", "Name"]) || ""),
          partNumber: String(getValue(["Part Number", "PartNumber", "part_number", "Number"]) || ""),
          originType: String(getValue(["ORIGIN TYPE", "Origin Type", "origin_type", "OriginType"]) || "NEW").replace(/\s*\/\s*/g, '/'),
          category: String(getValue(["Category", "category", "Category Name"]) || ""),
          description: String(getValue(["Description", "description", "Desc"]) || ""),

          // Stock Information
          stockQuantity: 0, // Initial stock is 0 for new parts
          minStockLevel: parseInt(getValue(["Min Stock", "MinStock", "min_stock", "Min Stock Level"]) || "0") || 0,
          maxStockLevel: 100, // Default max
          unit: String(getValue(["Unit", "unit", "UOM"]) || "piece"),

          // Part Details
          brandName: String(getValue(["Brand Name", "BrandName", "brand_name", "Brand"]) || ""),
          variant: String(getValue(["Variant", "variation"]) || ""),
          partType: String(getValue(["Part Type", "PartType", "part_type"]) || ""),
          color: String(getValue(["Color", "colour", "Colour"]) || ""),

          // Pricing - Purchase
          costPrice: purchasePrice,
          pricePreGst: parseNumber(getValue(["Pre GST Amount To Us", "Pre GST Amount", "pricePreGst", "Price Pre Gst To Us"]) || purchasePrice),
          gstRateInput: parseNumber(getValue(["GST Rate Input", "GstRateInput", "gst_rate_input"])),
          gstInput: parseNumber(getValue(["GST INPUT", "GST Input", "gst_input", "GstInput"])),

          // Pricing - Sale
          unitPrice: salePricePreGst > 0 ? salePricePreGst : totalPrice,
          price: salePricePreGst > 0 ? salePricePreGst : totalPrice,
          gstRate: parseNumber(getValue(["GST Rate Output", "GstRateOutput", "gst_rate_output"])) || 18,
          gstRateOutput: parseNumber(getValue(["GST Rate Output", "GstRateOutput", "gst_rate_output"])),
          totalPrice: totalPrice,
          totalGst: parseNumber(getValue(["TOTAL GST", "Total GST", "total_gst", "TotalGst"])),

          // Labour Information - using new field names
          labourName: String(getValue(["Associated Labour Name", "Labour Name", "labourName", "Estimated Labour"]) || ""),
          labourCode: String(getValue(["Associated Labour Code", "Labour Code", "labourCode"]) || ""),
          labourWorkTime: String(getValue(["Work Time", "WorkTime", "work_time", "Estimated Labour Work Time"]) || ""),
          labourRate: parseNumber(getValue(["Labour Rate", "LabourRate", "labour_rate"])),
          labourGstRate: parseNumber(getValue(["Labour GST Rate", "LabourGstRate", "labour_gst_rate"])),
          labourPrice: parseNumber(getValue(["LABOUR PRICE", "Labour Price", "labour_price", "LabourPrice"])),

          // Flags
          highValuePart: parseBoolean(getValue(["High Value Part", "HighValuePart", "high_value_part"])),

          // Service Center (required by backend)
          serviceCenterId: serviceCenterId,
        } as PartFormData;
      });

      // Filter out empty rows (only partName is required)
      const validPartsData = partsData.filter(
        (p) => p.partName?.trim()
      );

      if (validPartsData.length === 0) {
        alert("No valid parts found in the Excel file. Please check the format.");
        setUploadFile(null);
        return;
      }

      // Upload parts
      const result = await partsMasterService.bulkCreate(validPartsData);
      setUploadProgress(result);

      if (result.success > 0) {
        fetchParts();
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadFile(null);
          setUploadProgress(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to upload Excel file:", error);
      alert("Failed to process Excel file. Please check the format and try again.");
      setUploadProgress({ success: 0, failed: 0, errors: ["Failed to process file"] });
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        "OEM PART NUMBER": "2W_000000000272_003",
        "Part Name": "COCKPIT TOP SHELL ANTHRACITE",
        "Part Number": "_003",
        "ORIGIN TYPE": "OLD/NEW",
        "Category": "BODY PANEL",
        "PURCHASE PRICE": 950,
        "Description": "HMI AND HEADLIGHT COVER",
        "Min Stock": 2,
        "Unit": "1",
        "Brand Name": "OLA ELECTRIC",
        "Variant": "S1 PRO, S1",
        "Part Type": "PANEL",
        "Color": "ANTHRACITE",
        "Pre GST Amount To Us": 1400,
        "GST Rate Input": "18%",
        "Sale Price Pre GST": 1652,
        "GST Rate Output": "18%",
        "Associated Labour Name": "TOP COCKIT FITTING",
        "Associated Labour Code": "LB_000000000121",
        "Work Time": "0.3M",
        "Labour Rate": 180,
        "Labour GST Rate": "18%",
        "LABOUR PRICE": 212.4,
        "GST INPUT": 32.4,
        "TOTAL PRICE": 1864.4,
        "TOTAL GST": 284.4,
        "High Value Part": "NO",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Parts");
    XLSX.writeFile(wb, "parts_template.xlsx");
  };

  const categories = useMemo(() => Array.from(new Set(parts.map((p) => p.category))), [parts]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalParts = parts.length;
    const inStock = parts.filter((p) => p.stockQuantity >= p.minStockLevel).length;
    const lowStock = parts.filter((p) => p.stockQuantity < p.minStockLevel && p.stockQuantity > 0).length;
    const outOfStock = parts.filter((p) => p.stockQuantity === 0).length;
    return { totalParts, inStock, lowStock, outOfStock };
  }, [parts]);

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-24 px-8 pb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">Parts Master</h1>
            <p className="text-gray-500 mt-1">Manage your parts catalog with bulk upload and search</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowUploadModal(true);
                setUploadFile(null);
                setUploadProgress(null);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Upload size={18} className="mr-2" />
              Bulk Upload
            </Button>
            <Button
              onClick={() => {
                setEditingPart(null);
                resetForm();
                setShowModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <PlusCircle size={18} className="mr-2" />
              Add New Part
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              onSearch={(query) => setSearchQuery(query)}
              placeholder="Search by part name, number, ID, or description..."
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Parts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalParts}</p>
                </div>
                <Package className="text-indigo-600" size={32} />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Stock</p>
                  <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
                </div>
                <CheckCircle className="text-green-600" size={32} />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
                </div>
                <AlertTriangle className="text-orange-600" size={32} />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                </div>
                <TrendingDown className="text-red-600" size={32} />
              </div>
            </CardBody>
          </Card>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading parts...</p>
          </div>
        ) : filteredParts.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {parts.length === 0 ? "No Parts Found" : "No Parts Match Your Search"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {parts.length === 0
                    ? "Get started by adding your first part or uploading a bulk Excel file."
                    : "Try adjusting your search or filter criteria."}
                </p>
                {parts.length === 0 && (
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => {
                        setShowUploadModal(true);
                        setUploadFile(null);
                        setUploadProgress(null);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Upload size={18} className="mr-2" />
                      Upload Excel File
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingPart(null);
                        resetForm();
                        setShowModal(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <PlusCircle size={18} className="mr-2" />
                      Add First Part
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Part ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Part Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Part Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Part Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Min Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        High Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredParts.map((part) => {
                      const isLowStock = part.stockQuantity < part.minStockLevel && part.stockQuantity > 0;
                      const isOutOfStock = part.stockQuantity === 0;

                      return (
                        <tr
                          key={part.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleEdit(part)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{part.partId}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{part.partName}</div>
                            {part.description && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-1">{part.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{part.partNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{(part as any).brandName || "-"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={(part as any).partType === "NEW" ? "info" : "default"}>
                              {(part as any).partType || "NEW"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="info">{part.category}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₹{(part.price ?? 0).toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-gray-900"}`}>
                              {part.stockQuantity} {part.unit}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{part.minStockLevel} {part.unit}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(part as any).highValuePart ? (
                              <Badge variant="warning" className="flex items-center gap-1 w-fit">
                                Yes
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-xs">No</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isOutOfStock ? (
                              <Badge variant="danger" className="flex items-center gap-1 w-fit">
                                <AlertTriangle size={14} />
                                Out of Stock
                              </Badge>
                            ) : isLowStock ? (
                              <Badge variant="warning" className="flex items-center gap-1 w-fit">
                                <AlertTriangle size={14} />
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="success" className="flex items-center gap-1 w-fit">
                                <CheckCircle size={14} />
                                In Stock
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(part)}
                                className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(part.id)}
                                className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Add/Edit Part Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingPart(null);
            resetForm();
          }}
          title={editingPart ? "Edit Part" : "Add New Part"}
        >
          <PartsMasterForm
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleSubmit}
            isEditing={!!editingPart}
            showServiceCenter={false}
            submitButtonText={editingPart ? "Update" : "Create"}
            submitButtonClass={editingPart
              ? "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-base shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mt-6"
              : "w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-base shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mt-6"
            }
          />
        </Modal>

        {/* Bulk Upload Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setUploadFile(null);
            setUploadProgress(null);
          }}
          title="Bulk Upload Parts from Excel"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Excel File Format</h4>
              <p className="text-sm text-blue-800 mb-2">
                Your Excel file should have the following columns (matching the image format):
              </p>
              <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                <li><strong>Required:</strong> Part Name</li>
                <li><strong>Basic Info (optional):</strong> OEM PART NUMBER, Part Number, ORIGIN TYPE (OLD/NEW), Category, PURCHASE PRICE, Description, Min Stock, Unit</li>
                <li><strong>Basic Part Info (optional):</strong> Brand Name, Variant, Part Type (e.g., PANEL), Color</li>
                <li><strong>GST and Pricing (optional):</strong> GST Amount (auto-calculated), GST Rate Input (%), Price Pre GST, GST Rate Output (%)</li>
                <li><strong>Labour Information (optional):</strong> Estimated Labour, Estimated Labour Work Time (e.g., 0.3M), Labour Rate, Labour GST Rate (%)</li>
                <li><strong>Calculated Totals (auto-calculated):</strong> LABOUR PRICE, GST INPUT, TOTAL PRICE, TOTAL GST</li>
                <li><strong>High Value Part (optional):</strong> High Value Part (YES/NO/true/false)</li>
                <li><strong>Note:</strong> GST amounts, Labour Price, and Totals are auto-calculated from base amounts and rates</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="flex-1"
              >
                <Download size={18} className="mr-2" />
                Download Template
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Excel File (.xlsx, .xls, .csv)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
                {uploadFile && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileSpreadsheet size={18} />
                    <span className="truncate max-w-[200px]">{uploadFile.name}</span>
                    <button
                      onClick={() => setUploadFile(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {uploadProgress && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">Upload Results:</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600 font-medium">
                      Success: {uploadProgress.success}
                    </span>
                    <span className="text-red-600 font-medium">
                      Failed: {uploadProgress.failed}
                    </span>
                  </div>
                </div>
                {uploadProgress.errors.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto">
                    <p className="text-xs font-semibold text-red-600 mb-1">Errors:</p>
                    <ul className="text-xs text-red-600 list-disc list-inside space-y-1">
                      {uploadProgress.errors.slice(0, 10).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                      {uploadProgress.errors.length > 10 && (
                        <li>... and {uploadProgress.errors.length - 10} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleExcelUpload}
                disabled={!uploadFile}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
              >
                <Upload size={18} className="mr-2" />
                Upload Parts
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadProgress(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
