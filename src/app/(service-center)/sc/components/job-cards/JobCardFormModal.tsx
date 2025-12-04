"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PlusCircle, Loader2, X } from "lucide-react";

import type { JobCard, Priority, ServiceLocation } from "@/shared/types";
import { availableParts } from "@/__mocks__/data/job-cards.mock";
import { SERVICE_TYPE_OPTIONS } from "@/shared/constants/service-types";
import { getServiceCenterContext } from "@/shared/lib/serviceCenter";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";

export type CreateJobCardForm = {
  vehicleId: string;
  customerId: string;
  customerName: string;
  vehicleRegistration: string;
  vehicleMake: string;
  vehicleModel: string;
  serviceType: string;
  description: string;
  location: ServiceLocation;
  homeAddress?: string;
  estimatedCost: string;
  estimatedTime: string;
  priority: Priority;
  selectedParts: string[];
};

export const INITIAL_JOB_CARD_FORM: CreateJobCardForm = {
  vehicleId: "",
  customerId: "",
  customerName: "",
  vehicleRegistration: "",
  vehicleMake: "",
  vehicleModel: "",
  serviceType: "",
  description: "",
  location: "Station",
  homeAddress: "",
  estimatedCost: "",
  estimatedTime: "",
  priority: "Normal",
  selectedParts: [],
};

const SERVICE_CENTER_CODE_MAP: Record<string, string> = {
  "1": "SC001",
  "2": "SC002",
  "3": "SC003",
};

interface JobCardFormModalProps {
  open: boolean;
  initialValues?: Partial<CreateJobCardForm>;
  onClose: () => void;
  onCreated: (jobCard: JobCard) => void;
  onError?: (message: string) => void;
}

export default function JobCardFormModal({
  open,
  initialValues,
  onClose,
  onCreated,
  onError,
}: JobCardFormModalProps) {
  const [form, setForm] = useState<CreateJobCardForm>({
    ...INITIAL_JOB_CARD_FORM,
    ...(initialValues ?? {}),
  });
  const [creating, setCreating] = useState(false);
  const serviceCenterContext = useMemo(() => getServiceCenterContext(), []);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...INITIAL_JOB_CARD_FORM,
      ...(initialValues ?? {}),
    });
  }, [initialValues, open]);

  const resetForm = () => {
    setForm({
      ...INITIAL_JOB_CARD_FORM,
      ...(initialValues ?? {}),
    });
  };

  const togglePartSelection = (partName: string) => {
    setForm((prev) => ({
      ...prev,
      selectedParts: prev.selectedParts.includes(partName)
        ? prev.selectedParts.filter((part) => part !== partName)
        : [...prev.selectedParts, partName],
    }));
  };

  const generateJobCardNumber = (serviceCenterCode: string = "SC001") => {
    const storedCards = safeStorage.getItem<JobCard[]>("jobCards", []);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const currentMonthCards = storedCards.filter((card) => {
      if (!card.jobCardNumber) return false;
      const parts = card.jobCardNumber.split("-");
      return (
        parts[0] === serviceCenterCode &&
        parts[1] === String(year) &&
        parts[2] === month
      );
    });
    const sequenceNumbers = currentMonthCards
      .map((card) => {
        const parts = card.jobCardNumber?.split("-");
        return parts && parts[3] ? parseInt(parts[3], 10) : 0;
      })
      .filter((num) => !isNaN(num));
    const nextSequence = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) + 1 : 1;
    return `${serviceCenterCode}-${year}-${month}-${String(nextSequence).padStart(4, "0")}`;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.customerName || !form.serviceType || !form.description) {
      onError?.("Please fill in all required fields.");
      return;
    }

    try {
      setCreating(true);
      const serviceCenterId = String(serviceCenterContext.serviceCenterId ?? "1");
      const serviceCenterCode =
        SERVICE_CENTER_CODE_MAP[serviceCenterId] || "SC001";
      const jobCardNumber = generateJobCardNumber(serviceCenterCode);
      const newJobCard: JobCard = {
        id: `JC-${Date.now()}`,
        jobCardNumber,
        serviceCenterId,
        serviceCenterCode,
        customerId: form.customerId || `customer-${Date.now()}`,
        customerName: form.customerName,
        vehicleId: form.vehicleId,
        vehicle: `${form.vehicleMake} ${form.vehicleModel}`.trim() || form.vehicleModel || form.vehicleMake,
        registration: form.vehicleRegistration,
        vehicleMake: form.vehicleMake,
        vehicleModel: form.vehicleModel,
        customerType: "B2C",
        serviceType: form.serviceType,
        description: form.description,
        status: "Created",
        priority: form.priority,
        assignedEngineer: null,
        estimatedCost: form.estimatedCost
          ? `₹${parseFloat(form.estimatedCost).toLocaleString("en-IN")}`
          : "₹0",
        estimatedTime: form.estimatedTime,
        createdAt: new Date().toISOString(),
        parts: form.selectedParts,
        location: form.location,
        serviceCenterName:
          serviceCenterContext.serviceCenterName || "Service Center",
      };

      const existingJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
      safeStorage.setItem("jobCards", [newJobCard, ...existingJobCards]);
      onCreated(newJobCard);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating job card:", error);
      onError?.("Failed to create job card. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Job Card</h2>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
                placeholder="Enter or search customer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Registration
              </label>
              <input
                type="text"
                value={form.vehicleRegistration}
                onChange={(e) =>
                  setForm({ ...form, vehicleRegistration: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="PB10AB1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Make
              </label>
              <input
                type="text"
                value={form.vehicleMake}
                onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Honda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Model
              </label>
              <input
                type="text"
                value={form.vehicleModel}
                onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              >
                <option value="">Select Service Type</option>
                {SERVICE_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Location <span className="text-red-500">*</span>
              </label>
              <select
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value as ServiceLocation })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              >
                <option value="Station">Station</option>
                <option value="Home Service">Home Service</option>
              </select>
            </div>
            {form.location === "Home Service" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Home Address
                </label>
                <textarea
                  value={form.homeAddress}
                  onChange={(e) => setForm({ ...form, homeAddress: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  rows={2}
                  placeholder="Enter pick-up or service address"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Cost (₹)
              </label>
              <input
                type="text"
                value={form.estimatedCost}
                onChange={(e) =>
                  setForm({
                    ...form,
                    estimatedCost: e.target.value.replace(/[^0-9]/g, ""),
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="3500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Time
              </label>
              <input
                type="text"
                value={form.estimatedTime}
                onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="2 hours"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value as Priority })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              rows={4}
              placeholder="Describe the service needed..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Parts
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
              {availableParts.length === 0 ? (
                <p className="text-sm text-gray-500">No parts available</p>
              ) : (
                <div className="space-y-2">
                  {availableParts.map((part) => (
                    <label
                      key={part.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.selectedParts.includes(part.name)}
                        onChange={() => togglePartSelection(part.name)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{part.name}</p>
                        <p className="text-xs text-gray-500">
                          {part.sku} • Qty: {part.availableQty} • {part.unitPrice}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {form.selectedParts.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {form.selectedParts.map((part) => (
                  <span
                    key={part}
                    className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1"
                  >
                    {part}
                    <button
                      type="button"
                      onClick={() => togglePartSelection(part)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 inline-flex items-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  Create Job Card
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

