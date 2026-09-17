import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalMatches?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by SKU, Description, UPC, Reason...',
  totalMatches,
}) => {
  return (
    <div className="relative flex-1 min-w-[240px]">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-20 py-2.5 bg-black/[0.04] focus:bg-white border border-black/[0.05] focus:border-black/[0.15] rounded-xl text-xs sm:text-sm font-medium text-[#1D1D1F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/[0.04] focus:shadow-sm transition-all sf-subheadline"
      />
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1.5">
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="w-5 h-5 rounded-full bg-slate-300 hover:bg-slate-400 text-slate-700 flex items-center justify-center apple-pressable cursor-pointer"
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        {totalMatches !== undefined && value && (
          <span className="text-[11px] font-semibold sf-caption text-slate-500 bg-black/[0.06] px-2 py-0.5 rounded-full">
            {totalMatches} found
          </span>
        )}
      </div>
    </div>
  );
};
