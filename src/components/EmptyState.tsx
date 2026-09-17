import React from 'react';
import { PackageOpen, RotateCcw, SearchX } from 'lucide-react';

interface EmptyStateProps {
  isSearchActive: boolean;
  selectedDepartment: string;
  onReset: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isSearchActive,
  selectedDepartment,
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center apple-card rounded-3xl border border-black/[0.06]">
      <div className="w-16 h-16 rounded-2xl bg-black/[0.03] border border-black/[0.06] flex items-center justify-center text-slate-400 mb-4 shadow-2xs">
        {isSearchActive ? (
          <SearchX className="w-8 h-8 text-slate-400" />
        ) : (
          <PackageOpen className="w-8 h-8 text-slate-400" />
        )}
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-[#1D1D1F] mb-1 sf-headline">
        {isSearchActive ? 'No matching records found' : 'No Damage & Lost Reports found'}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 sf-subheadline leading-relaxed">
        {isSearchActive
          ? 'No DLR items match your search keywords under the current department.'
          : `There are currently no damage or lost reports filed under "${selectedDepartment}".`}
      </p>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/[0.05] hover:bg-black/[0.08] text-slate-700 hover:text-[#1D1D1F] text-xs sm:text-sm font-semibold transition-all border border-black/[0.06] cursor-pointer apple-pressable sf-subheadline"
      >
        <RotateCcw className="w-4 h-4 text-slate-500" />
        <span>Reset Filters & Search</span>
      </button>
    </div>
  );
};
