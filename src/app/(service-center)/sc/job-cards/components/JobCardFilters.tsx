"use client";
import React from "react";
import { Search, Filter } from "lucide-react";

// You might want to move this type to shared/types/job-card.types.ts eventually
export type FilterType = "all" | "created" | "assigned" | "in_progress" | "completed" | "draft";

interface JobCardFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    showMobileFilters: boolean;
    setShowMobileFilters: (show: boolean) => void;
    filter: string;
    setFilter: (filter: any) => void;
    filterOptions: FilterType[];
    filterLabelMap: Record<string, string>;
    view: "kanban" | "list";
}

export default function JobCardFilters({
    searchQuery,
    setSearchQuery,
    showMobileFilters,
    setShowMobileFilters,
    filter,
    setFilter,
    filterOptions,
    filterLabelMap,
    view
}: JobCardFiltersProps) {
    return (
        <div className={`bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 mb-4 md:mb-6 ${view === "kanban" ? "mx-4 sm:mx-6" : ""}`}>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by job card ID, customer name, vehicle..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm md:text-base"
                    />
                </div>

                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="md:hidden bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition inline-flex items-center gap-2 w-full justify-center"
                >
                    <Filter size={16} />
                    Filters
                </button>

                {/* Desktop Filters */}
                <div className="hidden md:flex flex-wrap gap-2">
                    {filterOptions.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition ${filter === f
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {filterLabelMap[f]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile Filters Dropdown */}
            {showMobileFilters && (
                <div className="mt-4 md:hidden grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filterOptions.map((f) => (
                        <button
                            key={f}
                            onClick={() => {
                                setFilter(f);
                                setShowMobileFilters(false);
                            }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${filter === f
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {filterLabelMap[f]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
