/**
 * Customer Search Bar Component
 */

import { Search, AlertCircle, User, Hash, Phone, Mail, Building2, Car, CheckCircle } from "lucide-react";
import type { CustomerSearchType, CustomerWithVehicles } from "@/shared/types";
import { getSearchTypeLabel } from "../utils/search.utils";

export interface CustomerSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  searchLoading: boolean;
  showCreateForm: boolean;
  detectedSearchType: CustomerSearchType | null;
  validationError: string;
  filteredSearchResults: CustomerWithVehicles[];
  onCustomerSelect: (customer: CustomerWithVehicles) => void;
  isCallCenter: boolean;
}

export function CustomerSearchBar({
  searchQuery,
  onSearchChange,
  onSearch,
  searchLoading,
  showCreateForm,
  detectedSearchType,
  validationError,
  filteredSearchResults,
  onCustomerSelect,
  isCallCenter,
}: CustomerSearchBarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search
            className={`absolute left-3.5 top-1/2 transform -translate-y-1/2 z-10 ${
              showCreateForm ? "text-gray-300" : "text-gray-400"
            }`}
            size={18}
            strokeWidth={2}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !showCreateForm) {
                onSearch();
              }
            }}
            placeholder={
              showCreateForm
                ? "Search disabled while creating customer..."
                : "Search by phone, email, customer ID, VIN, or vehicle number..."
            }
            disabled={showCreateForm}
            className={`w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-gray-900 placeholder:text-gray-400 transition-all duration-200 ${
              showCreateForm ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50/50 focus:bg-white"
            }`}
          />
          {detectedSearchType && searchQuery.length >= 2 && !showCreateForm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md font-medium">
                {getSearchTypeLabel(detectedSearchType)}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onSearch}
          disabled={searchLoading || !searchQuery.trim() || showCreateForm}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {searchLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">Searching...</span>
            </>
          ) : (
            <>
              <Search size={18} strokeWidth={2} />
              <span className="hidden sm:inline">Search</span>
            </>
          )}
        </button>
      </div>

      {validationError && (
        <div className="mt-3 p-3.5 bg-red-50 rounded-lg flex items-center gap-2.5 text-red-700 text-sm font-medium">
          <AlertCircle size={18} strokeWidth={2} />
          {validationError}
        </div>
      )}

      {/* Search Results Dropdown */}
      {filteredSearchResults.length > 0 && searchQuery.trim().length >= 2 && !showCreateForm && (
        <div className="mt-3 rounded-lg shadow-lg max-h-64 overflow-y-auto bg-white">
          {filteredSearchResults.map((customer) => (
            <div
              key={customer.id}
              onClick={() => onCustomerSelect(customer)}
              className="p-4 hover:bg-indigo-50/50 cursor-pointer transition-all duration-150 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                      <User className="text-indigo-600 shrink-0" size={16} strokeWidth={2} />
                    </div>
                    <h4 className="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                      {customer.name}
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 ml-8">
                    <div className="flex items-center gap-1.5">
                      <Hash size={12} strokeWidth={2} />
                      <span className="font-mono text-gray-700">{customer.customerNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} strokeWidth={2} />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} strokeWidth={2} />
                        <span className="truncate max-w-[150px]">{customer.email}</span>
                      </div>
                    )}
                    {isCallCenter && customer.serviceCenterName && (
                      <div className="flex items-center gap-1.5">
                        <Building2 size={12} strokeWidth={2} className="text-gray-400" />
                        <span className="truncate max-w-[150px]">{customer.serviceCenterName}</span>
                      </div>
                    )}
                  </div>
                  {customer.totalVehicles && customer.totalVehicles > 0 && (
                    <div className="flex items-center gap-1.5 ml-8 mt-1.5">
                      <Car size={12} className="text-gray-400" strokeWidth={2} />
                      <span className="text-xs text-gray-500 font-medium">
                        {customer.totalVehicles} {customer.totalVehicles === 1 ? "vehicle" : "vehicles"}
                      </span>
                    </div>
                  )}
                </div>
                <CheckCircle className="text-indigo-600 shrink-0 group-hover:scale-110 transition-transform" size={18} strokeWidth={2} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

