"use client";
import { X, Phone, Mail, Car, User, CheckCircle, AlertCircle } from "lucide-react";
import type { CustomerWithVehicles } from "@/shared/types";

interface CustomerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: (value: string, type: "name" | "phone" | "email") => void;
  onClearSearch: () => void;
  customers: CustomerWithVehicles[];
  loading: boolean;
  onSelectCustomer: (customer: CustomerWithVehicles) => void;
}

export function CustomerSearchModal({
  isOpen,
  onClose,
  searchValue,
  onSearchChange,
  onSearch,
  onClearSearch,
  customers,
  loading,
  onSelectCustomer,
}: CustomerSearchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 flex items-center justify-between rounded-t-2xl z-10 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Select Customer</h2>
            <p className="text-sm text-gray-600 mt-1">Search for a customer to schedule an appointment</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value;
                onSearchChange(value);
                if (value.trim().length >= 2) {
                  onSearch(value, "name");
                } else {
                  onClearSearch();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {loading && (
              <div className="mt-2 text-center">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}
          </div>
          {customers.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100">
                      <User className="text-indigo-600" size={20} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{customer.name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {customer.phone}
                        </span>
                        {customer.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {customer.email}
                          </span>
                        )}
                        {customer.vehicles && customer.vehicles.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Car size={14} />
                            {customer.vehicles.length} vehicle{customer.vehicles.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <CheckCircle className="text-indigo-600 shrink-0" size={20} strokeWidth={2} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && customers.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Customers Found</h3>
              <p className="text-gray-600">Start typing to search for customers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

