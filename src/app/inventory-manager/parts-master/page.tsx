"use client";
import { useState, useEffect, useMemo } from "react";
import { partsMasterService } from "@/services/inventory/partsMaster.service";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
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
import { initializeInventoryMockData } from "@/__mocks__/data/inventory.mock";
import type { Part, PartFormData } from "@/shared/types/inventory.types";
import * as XLSX from "xlsx";

export default function PartsMasterPage() {
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
  const [formData, setFormData] = useState<PartFormData>({
    partId: "",
    partName: "",
    partNumber: "",
    category: "",
    price: 0,
    description: "",
    minStockLevel: 0,
    unit: "piece",
  });

  useEffect(() => {
    initializeInventoryMockData();
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
          p.partId.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      if (editingPart) {
        await partsMasterService.update(editingPart.id, formData);
      } else {
        await partsMasterService.create(formData);
      }
      setShowModal(false);
      setEditingPart(null);
      resetForm();
      fetchParts();
    } catch (error) {
      console.error("Failed to save part:", error);
      alert("Failed to save part. Please try again.");
    }
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setFormData({
      partId: part.partId,
      partName: part.partName,
      partNumber: part.partNumber,
      category: part.category,
      price: part.price,
      description: part.description || "",
      minStockLevel: part.minStockLevel,
      unit: part.unit,
    });
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
    setFormData({
      partId: "",
      partName: "",
      partNumber: "",
      category: "",
      price: 0,
      description: "",
      minStockLevel: 0,
      unit: "piece",
    });
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

    try {
      setUploadProgress({ success: 0, failed: 0, errors: [] });
      
      const fileData = await uploadFile.arrayBuffer();
      const workbook = XLSX.read(fileData, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet);

      // Map Excel columns to PartFormData
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

        return {
          partId: String(getValue(["Part ID", "PartID", "part_id", "PartId"]) || ""),
          partName: String(getValue(["Part Name", "PartName", "part_name", "Name"]) || ""),
          partNumber: String(getValue(["Part Number", "PartNumber", "part_number", "Number", "SKU"]) || ""),
          category: String(getValue(["Category", "category", "Category Name"]) || ""),
          price: parseFloat(getValue(["Price", "price", "Unit Price", "unit_price"]) || "0") || 0,
          description: String(getValue(["Description", "description", "Desc"]) || ""),
          minStockLevel: parseInt(getValue(["Min Stock", "MinStock", "min_stock", "Min Stock Level", "min_stock_level"]) || "0") || 0,
          unit: String(getValue(["Unit", "unit", "UOM"]) || "piece"),
        };
      });

      // Filter out empty rows
      const validPartsData = partsData.filter(
        (p) => p.partId && p.partName && p.partNumber && p.category
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
        "Part ID": "PART-001",
        "Part Name": "Brake Pad Set",
        "Part Number": "BP-001",
        "Category": "Brakes",
        "Price": 1500,
        "Description": "Front brake pad set",
        "Min Stock": 10,
        "Unit": "piece",
      },
      {
        "Part ID": "PART-002",
        "Part Name": "Engine Oil 5W-30",
        "Part Number": "EO-001",
        "Category": "Lubricants",
        "Price": 800,
        "Description": "Synthetic engine oil",
        "Min Stock": 20,
        "Unit": "liter",
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
                            <Badge variant="info">{part.category}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₹{part.price.toLocaleString()}</div>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part ID</label>
              <Input
                value={formData.partId}
                onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
                className="border border-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
              <Input
                value={formData.partName}
                onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                className="border border-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
              <Input
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                className="border border-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="border border-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="border border-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
              <Input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                className="border border-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="border border-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {editingPart ? "Update" : "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setEditingPart(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
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
                Your Excel file should have the following columns:
              </p>
              <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                <li>Part ID (required)</li>
                <li>Part Name (required)</li>
                <li>Part Number (required)</li>
                <li>Category (required)</li>
                <li>Price (optional, default: 0)</li>
                <li>Description (optional)</li>
                <li>Min Stock (optional, default: 0)</li>
                <li>Unit (optional, default: "piece")</li>
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
