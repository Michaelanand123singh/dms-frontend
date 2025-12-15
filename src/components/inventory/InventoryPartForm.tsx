"use client";

import { useEffect } from "react";

export interface InventoryPartFormData {
  partName: string;
  hsnCode: string; // HSN Code
  partCode: string;
  category: string;
  quantity: string;
  price: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  // Basic Part Info
  brandName: string;
  variant: string;
  partType: "NEW" | "OLD";
  color: string;
  // Purchase (Incoming)
  preGstAmountToUs: string;
  gstRateInput: string;
  gstInputAmount: string;
  postGstAmountToUs: string;
  // Sale (Outgoing)
  salePricePreGst: string;
  gstRateOutput: string;
  gstOutputAmount: string;
  postGstSaleAmount: string;
  // Labour Association
  associatedLabourName: string;
  associatedLabourCode: string;
  workTime: string;
  labourRate: string;
  labourGstRate: string;
  labourGstAmount: string;
  labourPostGstAmount: string;
  // High Value Part
  highValuePart: boolean;
  partSerialNumber: string;
  // Optional fields
  centerId?: string;
  partId?: string;
  partNumber?: string;
  description?: string;
  minStockLevel?: number;
  unit?: string;
}

interface ServiceCenter {
  id: number;
  name: string;
}

interface InventoryPartFormProps {
  formData: InventoryPartFormData;
  onFormChange: (data: InventoryPartFormData) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  isEditing?: boolean;
  showServiceCenter?: boolean;
  serviceCenters?: ServiceCenter[];
  submitButtonText?: string;
  submitButtonClass?: string;
}

export function InventoryPartForm({
  formData,
  onFormChange,
  onSubmit,
  onClose,
  isEditing = false,
  showServiceCenter = false,
  serviceCenters = [],
  submitButtonText,
  submitButtonClass = "w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition text-sm sm:text-base mt-4",
}: InventoryPartFormProps) {
  // Calculate GST amounts when base amounts or rates change
  useEffect(() => {
    // Calculate Purchase GST
    const preGst = parseFloat(formData.preGstAmountToUs) || 0;
    const gstRateInput = parseFloat(formData.gstRateInput) || 0;
    const gstInputAmount = (preGst * gstRateInput) / 100;
    const postGstAmountToUs = preGst + gstInputAmount;

    // Calculate Sale GST
    const salePreGst = parseFloat(formData.salePricePreGst) || 0;
    const gstRateOutput = parseFloat(formData.gstRateOutput) || 0;
    const gstOutputAmount = (salePreGst * gstRateOutput) / 100;
    const postGstSaleAmount = salePreGst + gstOutputAmount;

    // Calculate Labour GST
    const labourRate = parseFloat(formData.labourRate) || 0;
    const labourGstRate = parseFloat(formData.labourGstRate) || 0;
    const labourGstAmount = (labourRate * labourGstRate) / 100;
    const labourPostGstAmount = labourRate + labourGstAmount;

    // Only update if values have changed to avoid infinite loops
    if (
      formData.gstInputAmount !== gstInputAmount.toFixed(2) ||
      formData.postGstAmountToUs !== postGstAmountToUs.toFixed(2) ||
      formData.gstOutputAmount !== gstOutputAmount.toFixed(2) ||
      formData.postGstSaleAmount !== postGstSaleAmount.toFixed(2) ||
      formData.labourGstAmount !== labourGstAmount.toFixed(2) ||
      formData.labourPostGstAmount !== labourPostGstAmount.toFixed(2)
    ) {
      onFormChange({
        ...formData,
        gstInputAmount: gstInputAmount.toFixed(2),
        postGstAmountToUs: postGstAmountToUs.toFixed(2),
        gstOutputAmount: gstOutputAmount.toFixed(2),
        postGstSaleAmount: postGstSaleAmount.toFixed(2),
        labourGstAmount: labourGstAmount.toFixed(2),
        labourPostGstAmount: labourPostGstAmount.toFixed(2),
      });
    }
  }, [
    formData.preGstAmountToUs,
    formData.gstRateInput,
    formData.salePricePreGst,
    formData.gstRateOutput,
    formData.labourRate,
    formData.labourGstRate,
  ]);

  const handleChange = (field: keyof InventoryPartFormData, value: any) => {
    onFormChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-4">
      {showServiceCenter && serviceCenters.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Center *
          </label>
          <select
            value={formData.centerId || ""}
            onChange={(e) => handleChange("centerId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
            required
          >
            <option value="">Select Service Center</option>
            {serviceCenters.map((center) => (
              <option key={center.id} value={String(center.id)}>
                {center.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {formData.partId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Part ID</label>
          <input
            type="text"
            value={formData.partId}
            onChange={(e) => handleChange("partId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Part Name *
        </label>
        <input
          type="text"
          value={formData.partName}
          onChange={(e) => handleChange("partName", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
          required
        />
      </div>

      {formData.partNumber !== undefined && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
          <input
            type="text"
            value={formData.partNumber}
            onChange={(e) => handleChange("partNumber", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code *</label>
        <input
          type="text"
          value={formData.hsnCode}
          onChange={(e) => handleChange("hsnCode", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Part Code</label>
        <input
          type="text"
          value={formData.partCode}
          onChange={(e) => handleChange("partCode", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
          placeholder="Enter part code"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => handleChange("category", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="text"
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            placeholder="₹450"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
          />
        </div>
      </div>

      {formData.minStockLevel !== undefined && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
          <input
            type="number"
            value={formData.minStockLevel}
            onChange={(e) => handleChange("minStockLevel", parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
            required
          />
        </div>
      )}

      {formData.unit !== undefined && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
            required
          />
        </div>
      )}

      {formData.description !== undefined && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
            rows={3}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={formData.status}
          onChange={(e) => handleChange("status", e.target.value as "In Stock" | "Low Stock" | "Out of Stock")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
        >
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          {formData.status === "Out of Stock" && <option value="Out of Stock">Out of Stock</option>}
        </select>
      </div>

      {/* Basic Part Info Section */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Part Info</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
            <input
              type="text"
              value={formData.brandName}
              onChange={(e) => handleChange("brandName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
            <input
              type="text"
              value={formData.variant}
              onChange={(e) => handleChange("variant", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part Type</label>
              <select
                value={formData.partType}
                onChange={(e) => handleChange("partType", e.target.value as "NEW" | "OLD")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
              >
                <option value="NEW">NEW</option>
                <option value="OLD">OLD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleChange("color", e.target.value)}
                placeholder="NA"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Purchase (Incoming) Section */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Purchase (Incoming – To Us)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pre GST Amount To Us</label>
            <input
              type="number"
              step="0.01"
              value={formData.preGstAmountToUs}
              onChange={(e) => handleChange("preGstAmountToUs", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (Input)</label>
            <input
              type="number"
              step="0.01"
              value={formData.gstRateInput}
              onChange={(e) => handleChange("gstRateInput", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Input Amount (auto-calculated)</label>
            <input
              type="text"
              value={formData.gstInputAmount}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Post GST Amount To Us (auto-calculated)</label>
            <input
              type="text"
              value={formData.postGstAmountToUs}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Sale (Outgoing) Section */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sale (Outgoing)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (Pre GST)</label>
            <input
              type="number"
              step="0.01"
              value={formData.salePricePreGst}
              onChange={(e) => handleChange("salePricePreGst", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate</label>
            <input
              type="number"
              step="0.01"
              value={formData.gstRateOutput}
              onChange={(e) => handleChange("gstRateOutput", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Output Amount (auto-calculated)</label>
            <input
              type="text"
              value={formData.gstOutputAmount}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Post GST Sale Amount (auto-calculated)</label>
            <input
              type="text"
              value={formData.postGstSaleAmount}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Labour Association Section */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Labour Association</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Associated Labour Name</label>
              <input
                type="text"
                value={formData.associatedLabourName}
                onChange={(e) => handleChange("associatedLabourName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Associated Labour Code</label>
              <input
                type="text"
                value={formData.associatedLabourCode}
                onChange={(e) => handleChange("associatedLabourCode", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Time (in Hours)</label>
              <input
                type="number"
                step="0.01"
                value={formData.workTime}
                onChange={(e) => handleChange("workTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Labour Rate</label>
              <input
                type="number"
                step="0.01"
                value={formData.labourRate}
                onChange={(e) => handleChange("labourRate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Labour GST Rate</label>
            <input
              type="number"
              step="0.01"
              value={formData.labourGstRate}
              onChange={(e) => handleChange("labourGstRate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Labour GST Amount (auto-calculated)</label>
            <input
              type="text"
              value={formData.labourGstAmount}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Labour Post GST Amount (auto-calculated)</label>
            <input
              type="text"
              value={formData.labourPostGstAmount}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
            />
          </div>
        </div>
      </div>

      {/* High Value Part Section */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">High Value Part</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.highValuePart}
                onChange={(e) => handleChange("highValuePart", e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">High Value Part</span>
            </label>
          </div>
          {formData.highValuePart && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part Serial Number *
              </label>
              <input
                type="text"
                value={formData.partSerialNumber}
                onChange={(e) => handleChange("partSerialNumber", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm"
                required={formData.highValuePart}
              />
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className={submitButtonClass}
      >
        {submitButtonText || (isEditing ? "Update Part" : "Add Part")}
      </button>
    </form>
  );
}

