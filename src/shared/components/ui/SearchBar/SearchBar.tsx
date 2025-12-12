"use client";
import { InputHTMLAttributes, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "../Input";

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  debounceMs?: number;
}

export function SearchBar({
  onSearch,
  onClear,
  debounceMs = 300,
  className,
  ...props
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (onSearch) {
      if (debounceMs > 0) {
        const timeout = setTimeout(() => {
          onSearch(value);
        }, debounceMs);
        return () => clearTimeout(timeout);
      } else {
        onSearch(value);
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onClear) onClear();
    if (onSearch) onSearch("");
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
        placeholder={props.placeholder || "Search..."}
        {...props}
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

