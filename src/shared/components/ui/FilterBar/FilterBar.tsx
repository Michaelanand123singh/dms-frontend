"use client";
import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "../Button";
import clsx from "clsx";

export interface Filter {
  key: string;
  label: string;
  value: string;
}

export interface FilterBarProps {
  filters: Filter[];
  onRemoveFilter: (key: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterBar({
  filters,
  onRemoveFilter,
  onClearAll,
  className,
}: FilterBarProps) {
  if (filters.length === 0) return null;

  return (
    <div className={clsx("flex items-center gap-2 flex-wrap", className)}>
      {filters.map((filter) => (
        <div
          key={filter.key}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm"
        >
          <span className="text-gray-600">{filter.label}:</span>
          <span className="font-medium text-blue-700">{filter.value}</span>
          <button
            onClick={() => onRemoveFilter(filter.key)}
            className="text-blue-600 hover:text-blue-800"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      {onClearAll && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="ml-2"
        >
          Clear All
        </Button>
      )}
    </div>
  );
}

